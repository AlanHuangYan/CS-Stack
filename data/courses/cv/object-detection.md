# 目标检测 三层深度学习教程

## [总览] 技术总览

目标检测是计算机视觉的核心任务，旨在识别图像中的多个目标并定位其位置。主流方法包括两阶段检测器（Faster R-CNN）和单阶段检测器（YOLO、SSD）。目标检测广泛应用于自动驾驶、安防监控、工业检测等领域。

本教程采用三层漏斗学习法：**核心层**聚焦检测任务定义、边界框表示、评估指标三大基石；**重点层**深入 YOLO 和 Faster R-CNN 架构；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 检测任务定义

#### [概念] 概念解释

目标检测任务同时解决"是什么"和"在哪里"两个问题：分类目标类别、定位目标位置。输出包括类别标签和边界框坐标。

#### [语法] 核心语法 / 命令 / API

| 任务类型 | 输出 | 说明 |
|----------|------|------|
| 分类 | 类别标签 | 图像级别 |
| 检测 | 类别 + 边界框 | 实例级别 |
| 分割 | 类别 + 像素掩码 | 像素级别 |

#### [代码] 代码示例

```python
import torch
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class BoundingBox:
    """边界框表示"""
    x1: float  # 左上角 x
    y1: float  # 左上角 y
    x2: float  # 右下角 x
    y2: float  # 右下角 y
    class_id: int
    confidence: float = 1.0
    
    @property
    def width(self) -> float:
        return self.x2 - self.x1
    
    @property
    def height(self) -> float:
        return self.y2 - self.y1
    
    @property
    def area(self) -> float:
        return self.width * self.height
    
    @property
    def center(self) -> Tuple[float, float]:
        return ((self.x1 + self.x2) / 2, (self.y1 + self.y2) / 2)
    
    def to_xywh(self) -> Tuple[float, float, float, float]:
        """转换为 (x, y, w, h) 格式"""
        return (self.x1, self.y1, self.width, self.height)
    
    def to_cxcywh(self) -> Tuple[float, float, float, float]:
        """转换为中心点格式 (cx, cy, w, h)"""
        cx, cy = self.center
        return (cx, cy, self.width, self.height)
    
    @classmethod
    def from_xywh(cls, x: float, y: float, w: float, h: float, 
                  class_id: int, confidence: float = 1.0):
        """从 (x, y, w, h) 格式创建"""
        return cls(x, y, x + w, y + h, class_id, confidence)

# IoU 计算
def calculate_iou(box1: BoundingBox, box2: BoundingBox) -> float:
    """计算两个边界框的 IoU"""
    # 交集
    inter_x1 = max(box1.x1, box2.x1)
    inter_y1 = max(box1.y1, box2.y1)
    inter_x2 = min(box1.x2, box2.x2)
    inter_y2 = min(box1.y2, box2.y2)
    
    if inter_x2 <= inter_x1 or inter_y2 <= inter_y1:
        return 0.0
    
    inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
    
    # 并集
    union_area = box1.area + box2.area - inter_area
    
    return inter_area / union_area if union_area > 0 else 0.0

# 批量 IoU 计算
def batch_iou(boxes1: torch.Tensor, boxes2: torch.Tensor) -> torch.Tensor:
    """
    批量计算 IoU
    boxes1: (N, 4) 格式为 (x1, y1, x2, y2)
    boxes2: (M, 4)
    返回: (N, M) IoU 矩阵
    """
    # 扩展维度以便广播
    boxes1 = boxes1.unsqueeze(1)  # (N, 1, 4)
    boxes2 = boxes2.unsqueeze(0)  # (1, M, 4)
    
    # 交集
    inter_x1 = torch.max(boxes1[..., 0], boxes2[..., 0])
    inter_y1 = torch.max(boxes1[..., 1], boxes2[..., 1])
    inter_x2 = torch.min(boxes1[..., 2], boxes2[..., 2])
    inter_y2 = torch.min(boxes1[..., 3], boxes2[..., 3])
    
    inter_area = torch.clamp(inter_x2 - inter_x1, min=0) * \
                 torch.clamp(inter_y2 - inter_y1, min=0)
    
    # 各自面积
    area1 = (boxes1[..., 2] - boxes1[..., 0]) * (boxes1[..., 3] - boxes1[..., 1])
    area2 = (boxes2[..., 2] - boxes2[..., 0]) * (boxes2[..., 3] - boxes2[..., 1])
    
    # 并集
    union_area = area1 + area2 - inter_area
    
    return inter_area / union_area

# 使用示例
box1 = BoundingBox(10, 10, 50, 50, class_id=0)
box2 = BoundingBox(30, 30, 70, 70, class_id=0)
iou = calculate_iou(box1, box2)
print(f"IoU: {iou:.4f}")
```

#### [场景] 典型应用场景

- 自动驾驶目标识别
- 安防监控
- 工业缺陷检测

### 2. 边界框表示

#### [概念] 概念解释

边界框有多种表示格式：xyxy（左上右下）、xywh（左上宽高）、cxcywh（中心宽高）。不同框架使用不同格式，需要正确转换。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import numpy as np

class BoxConverter:
    """边界框格式转换器"""
    
    @staticmethod
    def xyxy_to_xywh(boxes: torch.Tensor) -> torch.Tensor:
        """(x1, y1, x2, y2) -> (x, y, w, h)"""
        return torch.stack([
            boxes[..., 0],
            boxes[..., 1],
            boxes[..., 2] - boxes[..., 0],
            boxes[..., 3] - boxes[..., 1]
        ], dim=-1)
    
    @staticmethod
    def xywh_to_xyxy(boxes: torch.Tensor) -> torch.Tensor:
        """(x, y, w, h) -> (x1, y1, x2, y2)"""
        return torch.stack([
            boxes[..., 0],
            boxes[..., 1],
            boxes[..., 0] + boxes[..., 2],
            boxes[..., 1] + boxes[..., 3]
        ], dim=-1)
    
    @staticmethod
    def xyxy_to_cxcywh(boxes: torch.Tensor) -> torch.Tensor:
        """(x1, y1, x2, y2) -> (cx, cy, w, h)"""
        return torch.stack([
            (boxes[..., 0] + boxes[..., 2]) / 2,
            (boxes[..., 1] + boxes[..., 3]) / 2,
            boxes[..., 2] - boxes[..., 0],
            boxes[..., 3] - boxes[..., 1]
        ], dim=-1)
    
    @staticmethod
    def cxcywh_to_xyxy(boxes: torch.Tensor) -> torch.Tensor:
        """(cx, cy, w, h) -> (x1, y1, x2, y2)"""
        return torch.stack([
            boxes[..., 0] - boxes[..., 2] / 2,
            boxes[..., 1] - boxes[..., 3] / 2,
            boxes[..., 0] + boxes[..., 2] / 2,
            boxes[..., 1] + boxes[..., 3] / 2
        ], dim=-1)
    
    @staticmethod
    def normalize_boxes(boxes: torch.Tensor, img_size: Tuple[int, int]) -> torch.Tensor:
        """归一化到 [0, 1]"""
        h, w = img_size
        boxes = boxes.clone()
        boxes[..., [0, 2]] /= w
        boxes[..., [1, 3]] /= h
        return boxes
    
    @staticmethod
    def denormalize_boxes(boxes: torch.Tensor, img_size: Tuple[int, int]) -> torch.Tensor:
        """从归一化坐标还原"""
        h, w = img_size
        boxes = boxes.clone()
        boxes[..., [0, 2]] *= w
        boxes[..., [1, 3]] *= h
        return boxes

# Anchor Box 生成
def generate_anchors(feature_size: Tuple[int, int], 
                    scales: List[float], 
                    ratios: List[float]) -> torch.Tensor:
    """生成锚框"""
    h, w = feature_size
    anchors = []
    
    for i in range(h):
        for j in range(w):
            cx = j + 0.5
            cy = i + 0.5
            
            for scale in scales:
                for ratio in ratios:
                    anchor_h = scale * np.sqrt(ratio)
                    anchor_w = scale / np.sqrt(ratio)
                    
                    anchors.append([
                        cx - anchor_w / 2,
                        cy - anchor_h / 2,
                        cx + anchor_w / 2,
                        cy + anchor_h / 2
                    ])
    
    return torch.tensor(anchors, dtype=torch.float32)

# 使用示例
scales = [8, 16, 32]
ratios = [0.5, 1.0, 2.0]
anchors = generate_anchors((50, 50), scales, ratios)
print(f"Generated {len(anchors)} anchors")
```

#### [场景] 典型应用场景

- 数据标注格式转换
- 模型输入预处理
- 检测结果后处理

### 3. 评估指标

#### [概念] 概念解释

目标检测评估指标包括精确率、召回率、mAP（mean Average Precision）等。IoU 阈值决定预测框是否匹配真实框。

#### [语法] 核心语法 / 命令 / API

```python
import numpy as np
from typing import List, Dict
from collections import defaultdict

class DetectionEvaluator:
    """目标检测评估器"""
    
    def __init__(self, iou_threshold: float = 0.5):
        self.iou_threshold = iou_threshold
        self.predictions = []
        self.ground_truths = []
    
    def add_batch(self, preds: List[List[BoundingBox]], 
                  gts: List[List[BoundingBox]]):
        """添加一批预测和真实标签"""
        self.predictions.extend(preds)
        self.ground_truths.extend(gts)
    
    def calculate_precision_recall(self, 
                                   class_id: int) -> Tuple[np.ndarray, np.ndarray]:
        """计算精确率和召回率"""
        # 收集该类别的所有预测
        all_preds = []
        for img_idx, preds in enumerate(self.predictions):
            for pred in preds:
                if pred.class_id == class_id:
                    all_preds.append({
                        'img_idx': img_idx,
                        'box': pred,
                        'confidence': pred.confidence
                    })
        
        # 按置信度排序
        all_preds.sort(key=lambda x: x['confidence'], reverse=True)
        
        # 统计真实框数量
        total_gts = sum(
            sum(1 for gt in gts if gt.class_id == class_id)
            for gts in self.ground_truths
        )
        
        # 计算每个阈值下的 TP/FP
        tp = np.zeros(len(all_preds))
        fp = np.zeros(len(all_preds))
        
        # 记录每张图片已匹配的真实框
        matched_gts = defaultdict(set)
        
        for pred_idx, pred_info in enumerate(all_preds):
            img_idx = pred_info['img_idx']
            pred_box = pred_info['box']
            
            # 找到最佳匹配的真实框
            best_iou = 0
            best_gt_idx = -1
            
            for gt_idx, gt in enumerate(self.ground_truths[img_idx]):
                if gt.class_id != class_id:
                    continue
                if gt_idx in matched_gts[img_idx]:
                    continue
                
                iou = calculate_iou(pred_box, gt)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = gt_idx
            
            if best_iou >= self.iou_threshold:
                tp[pred_idx] = 1
                matched_gts[img_idx].add(best_gt_idx)
            else:
                fp[pred_idx] = 1
        
        # 累积计算
        tp_cumsum = np.cumsum(tp)
        fp_cumsum = np.cumsum(fp)
        
        precision = tp_cumsum / (tp_cumsum + fp_cumsum + 1e-10)
        recall = tp_cumsum / total_gts
        
        return precision, recall
    
    def calculate_ap(self, precision: np.ndarray, recall: np.ndarray) -> float:
        """计算 AP (11点插值法)"""
        recall_levels = np.linspace(0, 1, 11)
        ap = 0
        
        for level in recall_levels:
            mask = recall >= level
            if mask.any():
                ap += np.max(precision[mask])
        
        return ap / 11
    
    def calculate_map(self) -> Dict[str, float]:
        """计算 mAP"""
        # 获取所有类别
        all_classes = set()
        for preds in self.predictions:
            for pred in preds:
                all_classes.add(pred.class_id)
        for gts in self.ground_truths:
            for gt in gts:
                all_classes.add(gt.class_id)
        
        aps = {}
        for class_id in all_classes:
            precision, recall = self.calculate_precision_recall(class_id)
            ap = self.calculate_ap(precision, recall)
            aps[class_id] = ap
        
        mAP = np.mean(list(aps.values())) if aps else 0
        
        return {
            'mAP': mAP,
            'AP_per_class': aps
        }

# 使用示例
evaluator = DetectionEvaluator(iou_threshold=0.5)
# 添加预测和真实标签
# evaluator.add_batch(predictions, ground_truths)
# results = evaluator.calculate_map()
# print(f"mAP@0.5: {results['mAP']:.4f}")
```

#### [场景] 典型应用场景

- 模型性能评估
- 算法竞赛评测
- 模型选择对比

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. YOLO 架构

#### [概念] 概念与解决的问题

YOLO（You Only Look Once）是单阶段检测器，将检测任务转化为回归问题，直接预测边界框和类别。YOLO 速度快，适合实时应用。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn

class YOLOHead(nn.Module):
    """YOLO 检测头"""
    
    def __init__(self, in_channels: int, num_classes: int, num_anchors: int = 3):
        super().__init__()
        self.num_classes = num_classes
        self.num_anchors = num_anchors
        # 每个锚框预测: (x, y, w, h, obj_conf, class_probs)
        self.num_outputs = 5 + num_classes
        
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, in_channels * 2, 3, padding=1),
            nn.BatchNorm2d(in_channels * 2),
            nn.SiLU(),
            nn.Conv2d(in_channels * 2, num_anchors * self.num_outputs, 1)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        输入: (B, C, H, W)
        输出: (B, num_anchors, H, W, num_outputs)
        """
        B, _, H, W = x.shape
        x = self.conv(x)
        x = x.view(B, self.num_anchors, self.num_outputs, H, W)
        x = x.permute(0, 1, 3, 4, 2)  # (B, A, H, W, outputs)
        return x

class YOLOLoss(nn.Module):
    """YOLO 损失函数"""
    
    def __init__(self, num_classes: int, obj_threshold: float = 0.5):
        super().__init__()
        self.num_classes = num_classes
        self.obj_threshold = obj_threshold
        self.bce_loss = nn.BCEWithLogitsLoss()
        self.mse_loss = nn.MSELLoss()
    
    def forward(self, predictions, targets, anchors):
        """
        predictions: (B, A, H, W, 5+num_classes)
        targets: list of dicts with 'boxes' and 'labels'
        anchors: (A, 2) anchor sizes
        """
        # 解包预测
        pred_boxes = predictions[..., :4]
        pred_obj = predictions[..., 4]
        pred_cls = predictions[..., 5:]
        
        # 构建目标张量
        # ... (省略详细实现)
        
        # 计算各项损失
        obj_loss = self.bce_loss(pred_obj, target_obj)
        noobj_loss = self.bce_loss(pred_obj, target_noobj)
        box_loss = self.mse_loss(pred_boxes, target_boxes)
        cls_loss = self.bce_loss(pred_cls, target_cls)
        
        total_loss = obj_loss + 0.5 * noobj_loss + 5.0 * box_loss + cls_loss
        
        return total_loss

# 使用 YOLOv5
def use_yolov5():
    import torch
    
    # 加载预训练模型
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    
    # 推理
    img = 'path/to/image.jpg'
    results = model(img)
    
    # 获取结果
    results.print()  # 打印结果
    results.show()   # 显示结果
    results.save()   # 保存结果
    
    # 获取边界框
    boxes = results.xyxy[0]  # (N, 6) [x1, y1, x2, y2, conf, cls]
    
    return boxes
```

#### [代码] 代码示例

```python
# 完整 YOLO 推理流程
def yolo_inference_pipeline():
    import cv2
    import numpy as np
    
    # 加载模型
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
    model.conf = 0.25  # 置信度阈值
    model.iou = 0.45   # NMS IoU 阈值
    
    # 读取图像
    image = cv2.imread('image.jpg')
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # 推理
    results = model(image_rgb)
    
    # 解析结果
    detections = results.xyxy[0].cpu().numpy()
    
    # 绘制结果
    for det in detections:
        x1, y1, x2, y2, conf, cls = det
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        
        # 绘制边界框
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        # 绘制标签
        label = f"{model.names[int(cls)]}: {conf:.2f}"
        cv2.putText(image, label, (x1, y1 - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    cv2.imwrite('output.jpg', image)
```

#### [关联] 与核心层的关联

YOLO 基于边界框表示和 IoU 计算，实现端到端检测。

### 2. Faster R-CNN

#### [概念] 概念与解决的问题

Faster R-CNN 是两阶段检测器，第一阶段生成候选区域（RPN），第二阶段对候选区域进行分类和精修。精度高但速度较慢。

#### [语法] 核心用法

```python
import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

def create_faster_rcnn(num_classes: int, pretrained: bool = True):
    """创建 Faster R-CNN 模型"""
    # 加载预训练模型
    model = fasterrcnn_resnet50_fpn(pretrained=pretrained)
    
    # 获取分类器输入特征数
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    
    # 替换分类头
    model.roi_heads.box_predictor = FastRCNNPredictor(
        in_features, num_classes
    )
    
    return model

# 使用示例
def faster_rcnn_inference():
    # 创建模型
    num_classes = 91  # COCO 数据集
    model = create_faster_rcnn(num_classes)
    model.eval()
    
    # 准备输入
    image = torch.rand(1, 3, 800, 800)
    
    # 推理
    with torch.no_grad():
        predictions = model(image)
    
    # 解析结果
    boxes = predictions[0]['boxes']
    scores = predictions[0]['scores']
    labels = predictions[0]['labels']
    
    print(f"Detected {len(boxes)} objects")
    
    return predictions

# 自定义 RPN
class RegionProposalNetwork(nn.Module):
    """区域建议网络"""
    
    def __init__(self, in_channels: int, num_anchors: int = 9):
        super().__init__()
        
        # 共享卷积层
        self.conv = nn.Conv2d(in_channels, in_channels, 3, padding=1)
        
        # 目标分数分支
        self.objectness = nn.Conv2d(in_channels, num_anchors * 2, 1)
        
        # 边界框回归分支
        self.bbox_pred = nn.Conv2d(in_channels, num_anchors * 4, 1)
    
    def forward(self, x):
        # 共享特征
        x = F.relu(self.conv(x))
        
        # 目标分数
        objectness = self.objectness(x)
        objectness = objectness.permute(0, 2, 3, 1).contiguous()
        objectness = objectness.view(objectness.shape[0], -1, 2)
        
        # 边界框预测
        bbox_pred = self.bbox_pred(x)
        bbox_pred = bbox_pred.permute(0, 2, 3, 1).contiguous()
        bbox_pred = bbox_pred.view(bbox_pred.shape[0], -1, 4)
        
        return objectness, bbox_pred
```

#### [关联] 与核心层的关联

Faster R-CNN 使用 RPN 生成候选区域，然后对每个区域进行分类。

### 3. NMS 后处理

#### [概念] 概念与解决的问题

非极大值抑制（NMS）去除重叠的检测框，保留最高置信度的结果。是目标检测的标准后处理步骤。

#### [语法] 核心用法

```python
import torch
import torchvision.ops as ops

def nms(boxes: torch.Tensor, scores: torch.Tensor, iou_threshold: float) -> torch.Tensor:
    """
    非极大值抑制
    boxes: (N, 4) 边界框
    scores: (N,) 置信度分数
    返回: 保留的索引
    """
    return ops.nms(boxes, scores, iou_threshold)

def batched_nms(boxes: torch.Tensor, scores: torch.Tensor, 
                labels: torch.Tensor, iou_threshold: float) -> torch.Tensor:
    """
    批量 NMS（按类别分别处理）
    """
    return ops.batched_nms(boxes, scores, labels, iou_threshold)

# 自定义 NMS 实现
def custom_nms(boxes: np.ndarray, scores: np.ndarray, 
               iou_threshold: float) -> np.ndarray:
    """自定义 NMS 实现"""
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        
        # 计算 IoU
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        
        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        inter = w * h
        
        iou = inter / (areas[i] + areas[order[1:]] - inter)
        
        # 保留 IoU 小于阈值的框
        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]
    
    return np.array(keep)

# Soft-NMS 实现
def soft_nms(boxes: np.ndarray, scores: np.ndarray, 
             iou_threshold: float, sigma: float = 0.5) -> Tuple[np.ndarray, np.ndarray]:
    """Soft-NMS 实现"""
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    
    areas = (x2 - x1) * (y2 - y1)
    
    keep = []
    keep_scores = []
    
    for i in range(len(scores)):
        max_idx = np.argmax(scores)
        max_score = scores[max_idx]
        
        if max_score < 0.001:
            break
        
        keep.append(max_idx)
        keep_scores.append(max_score)
        
        # 计算 IoU
        xx1 = np.maximum(x1[max_idx], x1)
        yy1 = np.maximum(y1[max_idx], y1)
        xx2 = np.minimum(x2[max_idx], x2)
        yy2 = np.minimum(y2[max_idx], y2)
        
        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        inter = w * h
        
        iou = inter / (areas[max_idx] + areas - inter)
        
        # Soft-NMS: 降低重叠框的分数
        scores = scores * np.exp(-(iou ** 2) / sigma)
        scores[max_idx] = 0
    
    return np.array(keep), np.array(keep_scores)
```

#### [关联] 与核心层的关联

NMS 是检测结果后处理的核心步骤，基于 IoU 计算。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| YOLOv8 | 最新 YOLO 版本 |
| SSD | 单阶段多尺度检测 |
| RetinaNet | Focal Loss 检测器 |
| DETR | Transformer 检测器 |
| Mask R-CNN | 实例分割 |
| Cascade R-CNN | 级联检测 |
| FCOS | 无锚框检测 |
| CenterNet | 中心点检测 |
| EfficientDet | 高效检测器 |
| Anchor-Free | 无锚框方法 |

---

## [实战] 核心实战清单

### 实战任务 1：构建自定义目标检测器

使用 PyTorch 构建完整的目标检测训练流程：

```python
import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

def train_detector():
    # 创建模型
    num_classes = 10  # 包括背景
    model = create_faster_rcnn(num_classes)
    
    # 数据加载
    # train_loader = ...
    
    # 训练配置
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.005, momentum=0.9, weight_decay=0.0005)
    
    # 训练循环
    for epoch in range(num_epochs):
        model.train()
        for images, targets in train_loader:
            images = [img.to(device) for img in images]
            targets = [{k: v.to(device) for k, v in t.items()} for t in targets]
            
            loss_dict = model(images, targets)
            losses = sum(loss for loss in loss_dict.values())
            
            optimizer.zero_grad()
            losses.backward()
            optimizer.step()
        
        print(f"Epoch {epoch}: Loss {losses.item():.4f}")
    
    return model
```
