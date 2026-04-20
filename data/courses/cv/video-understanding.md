# 视频理解 三层深度学习教程

## [总览] 技术总览

视频理解是从视频序列中提取语义信息的技术，包括动作识别、行为分析、视频分类等任务。相比图像理解，视频理解需要建模时序信息。主流方法包括 3D CNN、视频 Transformer、双流网络等。

本教程采用三层漏斗学习法：**核心层**聚焦视频数据表示、时序建模、动作识别三大基石；**重点层**深入视频 Transformer 和多模态融合；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 视频数据表示

#### [概念] 概念解释

视频是图像的时间序列，需要同时处理空间和时间维度。视频数据表示包括帧序列、光流、音频等多种模态。

#### [语法] 核心语法 / 命令 / API

| 表示方式 | 维度 | 说明 |
|----------|------|------|
| RGB 帧 | (T, C, H, W) | 原始像素 |
| 光流 | (T, 2, H, W) | 运动信息 |
| 音频 | (T, F) | 声音特征 |
| 关键点 | (T, N, 2) | 人体姿态 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import numpy as np
import cv2
from typing import Tuple, List

class VideoLoader:
    """视频加载器"""
    
    def __init__(self, num_frames: int = 16, resize: Tuple[int, int] = (224, 224)):
        self.num_frames = num_frames
        self.resize = resize
    
    def load_video(self, video_path: str) -> torch.Tensor:
        """加载视频为张量"""
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = cv2.resize(frame, self.resize)
                frames.append(frame)
        
        cap.release()
        
        # 转换为张量 (T, H, W, C) -> (T, C, H, W)
        frames = np.array(frames)
        frames = torch.from_numpy(frames).permute(0, 3, 1, 2).float() / 255.0
        
        return frames
    
    def compute_optical_flow(self, video_path: str) -> torch.Tensor:
        """计算光流"""
        cap = cv2.VideoCapture(video_path)
        flows = []
        
        ret, prev_frame = cap.read()
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            flows.append(flow)
            prev_gray = gray
        
        cap.release()
        
        flows = np.array(flows)
        flows = torch.from_numpy(flows).permute(0, 3, 1, 2).float()
        
        return flows

class VideoTransform:
    """视频数据增强"""
    
    def __init__(self, mode='train'):
        self.mode = mode
    
    def __call__(self, video: torch.Tensor) -> torch.Tensor:
        if self.mode == 'train':
            # 随机裁剪
            video = self.random_crop(video, 0.8)
            # 随机翻转
            if torch.rand(1) > 0.5:
                video = torch.flip(video, [3])
            # 随机旋转
            video = self.random_rotation(video, 15)
        
        # 标准化
        video = self.normalize(video)
        
        return video
    
    def random_crop(self, video, scale):
        t, c, h, w = video.shape
        new_h, new_w = int(h * scale), int(w * scale)
        i = torch.randint(0, h - new_h, (1,)).item()
        j = torch.randint(0, w - new_w, (1,)).item()
        return video[:, :, i:i+new_h, j:j+new_w]
    
    def random_rotation(self, video, angle):
        # 实现随机旋转
        return video
    
    def normalize(self, video):
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
        return (video - mean) / std

# 使用示例
loader = VideoLoader(num_frames=16, resize=(224, 224))
video = loader.load_video("video.mp4")
print(f"Video shape: {video.shape}")  # (16, 3, 224, 224)

transform = VideoTransform(mode='train')
video = transform(video)
```

#### [场景] 典型应用场景

- 视频数据预处理
- 数据增强
- 特征提取

### 2. 时序建模

#### [概念] 概念解释

时序建模捕获视频帧之间的时间依赖关系。常用方法包括 3D 卷积、LSTM、注意力机制等。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 3D 卷积
class Conv3DBlock(nn.Module):
    """3D 卷积块"""
    
    def __init__(self, in_channels, out_channels, kernel_size=(3, 3, 3), 
                 stride=(1, 1, 1), padding=(1, 1, 1)):
        super().__init__()
        self.conv = nn.Conv3d(in_channels, out_channels, kernel_size, stride, padding)
        self.bn = nn.BatchNorm3d(out_channels)
        self.relu = nn.ReLU(inplace=True)
    
    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))

# 时序 LSTM
class TemporalLSTM(nn.Module):
    """时序 LSTM"""
    
    def __init__(self, input_size, hidden_size, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
    
    def forward(self, x):
        # x: (B, T, C, H, W) -> (B, T, features)
        b, t, c, h, w = x.shape
        x = x.view(b, t, -1)  # 展平空间维度
        
        # LSTM 处理
        lstm_out, _ = self.lstm(x)
        
        # 取最后时刻输出
        out = lstm_out[:, -1, :]
        
        return self.fc(out)

# 时序注意力
class TemporalAttention(nn.Module):
    """时序注意力"""
    
    def __init__(self, hidden_size):
        super().__init__()
        self.attention = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.Tanh(),
            nn.Linear(hidden_size // 2, 1)
        )
    
    def forward(self, x):
        # x: (B, T, hidden_size)
        weights = self.attention(x)  # (B, T, 1)
        weights = F.softmax(weights, dim=1)
        
        # 加权求和
        out = (x * weights).sum(dim=1)  # (B, hidden_size)
        
        return out, weights

# 双流网络
class TwoStreamNetwork(nn.Module):
    """双流网络"""
    
    def __init__(self, num_classes):
        super().__init__()
        
        # RGB 流
        self.rgb_stream = nn.Sequential(
            nn.Conv2d(3, 64, 7, 2, 3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        # 光流流
        self.flow_stream = nn.Sequential(
            nn.Conv2d(2, 64, 7, 2, 3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        # 融合层
        self.fc = nn.Linear(128 * 2, num_classes)
    
    def forward(self, rgb, flow):
        # 处理 RGB
        rgb_feat = self.rgb_stream(rgb)
        rgb_feat = rgb_feat.view(rgb_feat.size(0), -1)
        
        # 处理光流
        flow_feat = self.flow_stream(flow)
        flow_feat = flow_feat.view(flow_feat.size(0), -1)
        
        # 融合
        combined = torch.cat([rgb_feat, flow_feat], dim=1)
        
        return self.fc(combined)
```

#### [场景] 典型应用场景

- 动作识别
- 视频分类
- 时序预测

### 3. 动作识别

#### [概念] 概念解释

动作识别是识别视频中人体动作的任务，如走路、跑步、跳跃等。需要同时理解空间外观和时间运动。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn

# I3D 模型
class I3D(nn.Module):
    """Inflated 3D ConvNet"""
    
    def __init__(self, num_classes=400):
        super().__init__()
        
        # 将 2D 卷积膨胀为 3D
        self.conv1 = nn.Conv3d(3, 64, kernel_size=(7, 7, 7), stride=(2, 2, 2), padding=(3, 3, 3))
        self.pool1 = nn.MaxPool3d(kernel_size=(1, 3, 3), stride=(1, 2, 2), padding=(0, 1, 1))
        
        self.conv2 = nn.Conv3d(64, 64, kernel_size=(1, 1, 1))
        self.conv3 = nn.Conv3d(64, 192, kernel_size=(3, 3, 3), padding=(1, 1, 1))
        self.pool2 = nn.MaxPool3d(kernel_size=(1, 3, 3), stride=(1, 2, 2), padding=(0, 1, 1))
        
        # Inception 模块
        self.inception3a = InceptionBlock(192, 64, 96, 128, 16, 32, 32)
        self.inception3b = InceptionBlock(256, 128, 128, 192, 32, 96, 64)
        self.pool3 = nn.MaxPool3d(kernel_size=(3, 3, 3), stride=(2, 2, 2), padding=(1, 1, 1))
        
        # 更多 Inception 模块...
        
        self.avgpool = nn.AdaptiveAvgPool3d((1, 1, 1))
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(1024, num_classes)
    
    def forward(self, x):
        # x: (B, C, T, H, W)
        x = F.relu(self.conv1(x))
        x = self.pool1(x)
        
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = self.pool2(x)
        
        x = self.inception3a(x)
        x = self.inception3b(x)
        x = self.pool3(x)
        
        # 更多层...
        
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        x = self.fc(x)
        
        return x

class InceptionBlock(nn.Module):
    """Inception 模块"""
    
    def __init__(self, in_channels, ch1x1, ch3x3red, ch3x3, ch5x5red, ch5x5, pool_proj):
        super().__init__()
        
        self.branch1 = nn.Conv3d(in_channels, ch1x1, kernel_size=1)
        
        self.branch2 = nn.Sequential(
            nn.Conv3d(in_channels, ch3x3red, kernel_size=1),
            nn.Conv3d(ch3x3red, ch3x3, kernel_size=3, padding=1)
        )
        
        self.branch3 = nn.Sequential(
            nn.Conv3d(in_channels, ch5x5red, kernel_size=1),
            nn.Conv3d(ch5x5red, ch5x5, kernel_size=3, padding=1)
        )
        
        self.branch4 = nn.Sequential(
            nn.MaxPool3d(kernel_size=3, stride=1, padding=1),
            nn.Conv3d(in_channels, pool_proj, kernel_size=1)
        )
    
    def forward(self, x):
        b1 = self.branch1(x)
        b2 = self.branch2(x)
        b3 = self.branch3(x)
        b4 = self.branch4(x)
        
        return torch.cat([b1, b2, b3, b4], dim=1)

# 使用预训练模型
def use_pretrained_i3d():
    import torchvision.models.video as models
    
    # 加载预训练 I3D
    model = models.i3d_r50(pretrained=True)
    
    # 推理
    video = torch.randn(1, 3, 16, 224, 224)  # (B, C, T, H, W)
    
    model.eval()
    with torch.no_grad():
        output = model(video)
    
    print(f"Output shape: {output.shape}")
    
    return model
```

#### [场景] 典型应用场景

- 安防监控
- 体育分析
- 人机交互

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 视频 Transformer

#### [概念] 概念与解决的问题

视频 Transformer 将 Transformer 架构应用于视频理解，通过自注意力机制建模长距离时序依赖。代表模型包括 TimeSformer、ViViT 等。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import math

class TimeSformer(nn.Module):
    """TimeSformer 视频 Transformer"""
    
    def __init__(self, img_size=224, patch_size=16, num_frames=8, 
                 num_classes=400, embed_dim=768, depth=12, num_heads=12):
        super().__init__()
        
        self.num_patches = (img_size // patch_size) ** 2
        self.num_frames = num_frames
        self.patch_size = patch_size
        
        # Patch 嵌入
        self.patch_embed = nn.Conv2d(3, embed_dim, kernel_size=patch_size, stride=patch_size)
        
        # 位置编码
        self.pos_embed = nn.Parameter(torch.zeros(1, self.num_patches, embed_dim))
        self.time_embed = nn.Parameter(torch.zeros(1, num_frames, embed_dim))
        
        # Transformer 块
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads)
            for _ in range(depth)
        ])
        
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)
    
    def forward(self, x):
        B, T, C, H, W = x.shape
        
        # Patch 嵌入: (B, T, C, H, W) -> (B, T, num_patches, embed_dim)
        x = x.view(B * T, C, H, W)
        x = self.patch_embed(x)
        x = x.view(B, T, -1, x.size(-1))
        
        # 添加位置编码
        x = x + self.pos_embed.unsqueeze(1)
        
        # 添加时间编码
        x = x + self.time_embed.unsqueeze(2)
        
        # 展平: (B, T, N, D) -> (B, T*N, D)
        x = x.view(B, T * self.num_patches, -1)
        
        # Transformer 块
        for block in self.blocks:
            x = block(x)
        
        x = self.norm(x)
        
        # 分类头
        x = x.mean(dim=1)  # 全局平均
        x = self.head(x)
        
        return x

class TransformerBlock(nn.Module):
    """Transformer 块"""
    
    def __init__(self, embed_dim, num_heads, mlp_ratio=4.0):
        super().__init__()
        
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        
        self.norm2 = nn.LayerNorm(embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, int(embed_dim * mlp_ratio)),
            nn.GELU(),
            nn.Linear(int(embed_dim * mlp_ratio), embed_dim)
        )
    
    def forward(self, x):
        # 自注意力
        x = x + self.attn(self.norm1(x), self.norm1(x), self.norm1(x))[0]
        
        # MLP
        x = x + self.mlp(self.norm2(x))
        
        return x
```

#### [关联] 与核心层的关联

视频 Transformer 是时序建模的新方法，相比 3D CNN 更灵活。

### 2. 多模态融合

#### [概念] 概念与解决的问题

多模态融合结合视频、音频、文本等多种模态信息，提高视频理解能力。常见方法包括早期融合、晚期融合、跨模态注意力等。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn

class MultiModalFusion(nn.Module):
    """多模态融合"""
    
    def __init__(self, video_dim, audio_dim, text_dim, hidden_dim, num_classes):
        super().__init__()
        
        # 模态编码器
        self.video_encoder = nn.Linear(video_dim, hidden_dim)
        self.audio_encoder = nn.Linear(audio_dim, hidden_dim)
        self.text_encoder = nn.Linear(text_dim, hidden_dim)
        
        # 跨模态注意力
        self.cross_attn = CrossModalAttention(hidden_dim)
        
        # 融合层
        self.fusion = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, num_classes)
        )
    
    def forward(self, video, audio, text):
        # 编码各模态
        video_feat = self.video_encoder(video)
        audio_feat = self.audio_encoder(audio)
        text_feat = self.text_encoder(text)
        
        # 跨模态注意力
        video_feat = self.cross_attn(video_feat, text_feat)
        audio_feat = self.cross_attn(audio_feat, text_feat)
        
        # 融合
        combined = torch.cat([video_feat, audio_feat, text_feat], dim=-1)
        
        return self.fusion(combined)

class CrossModalAttention(nn.Module):
    """跨模态注意力"""
    
    def __init__(self, hidden_dim):
        super().__init__()
        self.query = nn.Linear(hidden_dim, hidden_dim)
        self.key = nn.Linear(hidden_dim, hidden_dim)
        self.value = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, query, context):
        q = self.query(query)
        k = self.key(context)
        v = self.value(context)
        
        # 注意力权重
        attn = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(q.size(-1))
        attn = F.softmax(attn, dim=-1)
        
        # 加权求和
        out = torch.matmul(attn, v)
        
        return query + out
```

#### [关联] 与核心层的关联

多模态融合扩展了视频理解能力，利用多种信息源。

### 3. 视频检索

#### [概念] 概念与解决的问题

视频检索根据查询（文本或视频）找到相关视频。需要学习视频和文本的联合表示空间。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoTextRetrieval(nn.Module):
    """视频-文本检索"""
    
    def __init__(self, video_dim, text_dim, embed_dim):
        super().__init__()
        
        # 视频编码器
        self.video_encoder = nn.Sequential(
            nn.Linear(video_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim)
        )
        
        # 文本编码器
        self.text_encoder = nn.Sequential(
            nn.Linear(text_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim)
        )
        
        # 温度参数
        self.temperature = nn.Parameter(torch.ones([]) * 0.07)
    
    def forward(self, video_feat, text_feat):
        # 编码
        video_embed = F.normalize(self.video_encoder(video_feat), dim=-1)
        text_embed = F.normalize(self.text_encoder(text_feat), dim=-1)
        
        # 计算相似度
        logits = torch.matmul(video_embed, text_embed.t()) / self.temperature.exp()
        
        return logits, video_embed, text_embed
    
    def contrastive_loss(self, logits):
        """对比损失"""
        batch_size = logits.size(0)
        labels = torch.arange(batch_size, device=logits.device)
        
        loss_v2t = F.cross_entropy(logits, labels)
        loss_t2v = F.cross_entropy(logits.t(), labels)
        
        return (loss_v2t + loss_t2v) / 2
```

#### [关联] 与核心层的关联

视频检索是视频理解的应用，需要有效的特征表示。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| SlowFast | 双速率网络 |
| X3D | 高效 3D 网络 |
| MoViNet | 移动端视频网络 |
| VideoMAE | 视频掩码自编码 |
| ViViT | 视频 Vision Transformer |
| Swin Transformer | 滑动窗口 Transformer |
| AV-HuBERT | 音视频预训练 |
| VideoCLIP | 视频文本预训练 |
| VideoLLaMA | 视频大语言模型 |
| InternVideo | 视频基础模型 |

---

## [实战] 核心实战清单

### 实战任务 1：构建动作识别系统

使用预训练模型构建动作识别系统：

```python
import torch
import torchvision.models.video as models
from torchvision.transforms import Compose, Resize, CenterCrop, ToTensor, Normalize

def build_action_recognition():
    # 加载预训练模型
    model = models.i3d_r50(pretrained=True)
    model.eval()
    
    # 数据预处理
    transform = Compose([
        Resize(256),
        CenterCrop(224),
        ToTensor(),
        Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # 加载视频
    loader = VideoLoader(num_frames=16)
    video = loader.load_video("action.mp4")
    video = transform(video)
    video = video.unsqueeze(0)  # 添加 batch 维度
    
    # 推理
    with torch.no_grad():
        output = model(video)
    
    # 获取预测类别
    pred_class = output.argmax(dim=1).item()
    print(f"Predicted action class: {pred_class}")
    
    return model
```
