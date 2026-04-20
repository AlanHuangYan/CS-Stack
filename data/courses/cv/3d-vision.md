# 3D 视觉 三层深度学习教程

## [总览] 技术总览

3D 视觉是从 2D 图像或点云中重建和理解三维空间信息的技术。核心任务包括点云处理、三维重建、SLAM、3D 目标检测等。广泛应用于自动驾驶、机器人导航、AR/VR、工业检测等领域。

本教程采用三层漏斗学习法：**核心层**聚焦点云表示、点云处理、3D 变换三大基石；**重点层**深入 PointNet 架构和 SLAM 技术；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 点云表示

#### [概念] 概念解释

点云是三维空间中点的集合，每个点包含坐标信息（x, y, z）和可选的属性（颜色、强度、法向量等）。点云是 3D 视觉最常用的数据表示形式。

#### [语法] 核心语法 / 命令 / API

| 表示形式 | 数据结构 | 特点 |
|----------|----------|------|
| 点云 | (N, 3+) 数组 | 稀疏、无序 |
| 体素 | 3D 网格 | 规则、内存大 |
| 网格 | 顶点+面 | 精确、复杂 |
| 深度图 | 2D 图像 | 简单、有遮挡 |

#### [代码] 代码示例

```python
import numpy as np
import open3d as o3d

# 创建点云
def create_point_cloud():
    # 随机生成点云
    points = np.random.rand(1000, 3) * 10
    
    # 创建 Open3D 点云对象
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    
    # 添加颜色
    colors = np.random.rand(1000, 3)
    pcd.colors = o3d.utility.Vector3dVector(colors)
    
    # 添加法向量
    pcd.estimate_normals()
    
    return pcd

# 从深度图生成点云
def depth_to_pointcloud(depth_image, camera_intrinsics):
    """
    从深度图生成点云
    depth_image: (H, W) 深度图
    camera_intrinsics: 相机内参 [fx, fy, cx, cy]
    """
    fx, fy, cx, cy = camera_intrinsics
    H, W = depth_image.shape
    
    # 创建像素坐标网格
    u = np.arange(W)
    v = np.arange(H)
    u, v = np.meshgrid(u, v)
    
    # 反投影到 3D
    z = depth_image
    x = (u - cx) * z / fx
    y = (v - cy) * z / fy
    
    # 组合点云
    points = np.stack([x, y, z], axis=-1).reshape(-1, 3)
    
    # 移除无效点
    valid_mask = points[:, 2] > 0
    points = points[valid_mask]
    
    return points

# 点云读写
def pointcloud_io():
    # 读取点云文件
    pcd = o3d.io.read_point_cloud("pointcloud.ply")
    
    # 获取点云信息
    points = np.asarray(pcd.points)
    print(f"点云包含 {len(points)} 个点")
    print(f"点云边界: {pcd.get_min_bound()}, {pcd.get_max_bound()}")
    
    # 保存点云
    o3d.io.write_point_cloud("output.ply", pcd)
    
    # 可视化
    o3d.visualization.draw_geometries([pcd])

# 点云统计信息
def pointcloud_statistics(pcd):
    points = np.asarray(pcd.points)
    
    stats = {
        'num_points': len(points),
        'min_bound': np.min(points, axis=0),
        'max_bound': np.max(points, axis=0),
        'center': np.mean(points, axis=0),
        'std': np.std(points, axis=0)
    }
    
    return stats
```

#### [场景] 典型应用场景

- 激光雷达数据处理
- RGB-D 相机数据采集
- 三维扫描重建

### 2. 点云处理

#### [概念] 概念解释

点云处理包括滤波、降采样、配准、分割等操作。这些操作是点云分析和理解的基础。

#### [语法] 核心语法 / 命令 / API

```python
import open3d as o3d
import numpy as np

# 点云滤波
def pointcloud_filtering(pcd):
    # 统计离群点移除
    pcd_filtered, ind = pcd.remove_statistical_outlier(
        nb_neighbors=20,
        std_ratio=2.0
    )
    
    # 半径离群点移除
    pcd_radius, ind = pcd.remove_radius_outlier(
        nb_points=16,
        radius=0.05
    )
    
    return pcd_filtered

# 点云降采样
def pointcloud_downsampling(pcd, voxel_size=0.05):
    # 体素降采样
    pcd_down = pcd.voxel_down_sample(voxel_size=voxel_size)
    return pcd_down

# 点云配准 (ICP)
def pointcloud_registration(source, target, threshold=0.02):
    # 初始对齐
    trans_init = np.identity(4)
    
    # 点对点 ICP
    reg_p2p = o3d.pipelines.registration.registration_icp(
        source, target, threshold, trans_init,
        o3d.pipelines.registration.TransformationEstimationPointToPoint(),
        o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=2000)
    )
    
    print(f"配准结果:")
    print(f"  拟合度: {reg_p2p.fitness}")
    print(f"  RMSE: {reg_p2p.inlier_rmse}")
    print(f"  变换矩阵:\n{reg_p2p.transformation}")
    
    # 应用变换
    source.transform(reg_p2p.transformation)
    
    return source, reg_p2p.transformation

# 点云分割
def pointcloud_segmentation(pcd, distance_threshold=0.02):
    # 平面分割 (RANSAC)
    plane_model, inliers = pcd.segment_plane(
        distance_threshold=distance_threshold,
        ransac_n=3,
        num_iterations=1000
    )
    
    # 提取平面和非平面点
    plane_cloud = pcd.select_by_index(inliers)
    non_plane_cloud = pcd.select_by_index(inliers, invert=True)
    
    # 平面方程: ax + by + cz + d = 0
    a, b, c, d = plane_model
    print(f"平面方程: {a:.2f}x + {b:.2f}y + {c:.2f}z + {d:.2f} = 0")
    
    return plane_cloud, non_plane_cloud

# 点云聚类
def pointcloud_clustering(pcd, eps=0.02, min_points=10):
    # DBSCAN 聚类
    labels = np.array(pcd.cluster_dbscan(eps=eps, min_points=min_points))
    
    max_label = labels.max()
    print(f"检测到 {max_label + 1} 个聚类")
    
    # 为每个聚类着色
    colors = plt.get_cmap("tab20")(labels / (max_label + 1 if max_label > 0 else 1))
    colors[labels < 0] = 0
    pcd.colors = o3d.utility.Vector3dVector(colors[:, :3])
    
    return pcd, labels

# 点云法向量估计
def estimate_normals(pcd, radius=0.1):
    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(
            radius=radius,
            max_nn=30
        )
    )
    return pcd
```

#### [场景] 典型应用场景

- 点云去噪
- 多视角点云融合
- 地面分割

### 3. 3D 变换

#### [概念] 概念解释

3D 变换描述点云在三维空间中的旋转、平移、缩放等操作。常用表示方法包括欧拉角、四元数、变换矩阵等。

#### [语法] 核心语法 / 命令 / API

```python
import numpy as np
from scipy.spatial.transform import Rotation

# 旋转表示转换
def rotation_representations():
    # 欧拉角 (roll, pitch, yaw)
    euler_angles = np.array([30, 45, 60])  # 度
    rotation = Rotation.from_euler('xyz', euler_angles, degrees=True)
    
    # 旋转矩阵
    rotation_matrix = rotation.as_matrix()
    
    # 四元数
    quaternion = rotation.as_quat()  # [x, y, z, w]
    
    # 旋转向量
    rotation_vector = rotation.as_rotvec()
    
    print(f"欧拉角: {euler_angles}")
    print(f"旋转矩阵:\n{rotation_matrix}")
    print(f"四元数: {quaternion}")
    print(f"旋转向量: {rotation_vector}")
    
    return rotation_matrix

# 变换矩阵构建
def build_transformation_matrix(translation, rotation):
    """
    构建 4x4 变换矩阵
    translation: (3,) 平移向量
    rotation: (3, 3) 旋转矩阵
    """
    T = np.eye(4)
    T[:3, :3] = rotation
    T[:3, 3] = translation
    return T

# 点云变换
def transform_pointcloud(points, transformation):
    """
    应用变换到点云
    points: (N, 3) 点云坐标
    transformation: (4, 4) 变换矩阵
    """
    # 转换为齐次坐标
    ones = np.ones((points.shape[0], 1))
    points_homo = np.hstack([points, ones])
    
    # 应用变换
    transformed = (transformation @ points_homo.T).T
    
    return transformed[:, :3]

# 刚体变换
def rigid_transform_3D(A, B):
    """
    计算将点集 A 变换到 B 的刚体变换
    A, B: (N, 3) 对应点集
    返回: R, t 旋转矩阵和平移向量
    """
    assert A.shape == B.shape
    
    # 计算质心
    centroid_A = np.mean(A, axis=0)
    centroid_B = np.mean(B, axis=0)
    
    # 中心化
    AA = A - centroid_A
    BB = B - centroid_B
    
    # 计算协方差矩阵
    H = AA.T @ BB
    
    # SVD 分解
    U, S, Vt = np.linalg.svd(H)
    
    # 计算旋转矩阵
    R = Vt.T @ U.T
    
    # 处理反射情况
    if np.linalg.det(R) < 0:
        Vt[2, :] *= -1
        R = Vt.T @ U.T
    
    # 计算平移向量
    t = centroid_B - R @ centroid_A
    
    return R, t

# 使用示例
if __name__ == "__main__":
    # 创建测试点云
    A = np.random.rand(100, 3)
    
    # 创建变换
    R = Rotation.from_euler('xyz', [30, 0, 0], degrees=True).as_matrix()
    t = np.array([1, 2, 3])
    
    # 应用变换
    B = (R @ A.T).T + t
    
    # 恢复变换
    R_recovered, t_recovered = rigid_transform_3D(A, B)
    print(f"原始旋转:\n{R}")
    print(f"恢复旋转:\n{R_recovered}")
    print(f"原始平移: {t}")
    print(f"恢复平移: {t_recovered}")
```

#### [场景] 典型应用场景

- 相机标定
- 点云配准
- 坐标系转换

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. PointNet 架构

#### [概念] 概念与解决的问题

PointNet 是处理点云的深度学习模型，直接处理无序点集，通过共享 MLP 提取点特征，使用最大池化聚合全局特征。是点云深度学习的基础架构。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TNet(nn.Module):
    """空间变换网络"""
    
    def __init__(self, k=3):
        super().__init__()
        self.k = k
        
        self.conv1 = nn.Conv1d(k, 64, 1)
        self.conv2 = nn.Conv1d(64, 128, 1)
        self.conv3 = nn.Conv1d(128, 1024, 1)
        
        self.fc1 = nn.Linear(1024, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, k * k)
        
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(1024)
        self.bn4 = nn.BatchNorm1d(512)
        self.bn5 = nn.BatchNorm1d(256)
        
        # 初始化为单位矩阵
        self.fc3.weight.data.zero_()
        self.fc3.bias.data.copy_(torch.eye(k).view(-1))
    
    def forward(self, x):
        batch_size = x.size(0)
        
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        
        x = x.max(dim=-1)[0]
        
        x = F.relu(self.bn4(self.fc1(x)))
        x = F.relu(self.bn5(self.fc2(x)))
        x = self.fc3(x)
        
        return x.view(batch_size, self.k, self.k)

class PointNetEncoder(nn.Module):
    """PointNet 编码器"""
    
    def __init__(self, input_channels=3, global_feat=True):
        super().__init__()
        self.global_feat = global_feat
        
        self.tnet1 = TNet(k=input_channels)
        self.tnet2 = TNet(k=64)
        
        self.conv1 = nn.Conv1d(input_channels, 64, 1)
        self.conv2 = nn.Conv1d(64, 64, 1)
        self.conv3 = nn.Conv1d(64, 64, 1)
        self.conv4 = nn.Conv1d(64, 128, 1)
        self.conv5 = nn.Conv1d(128, 1024, 1)
        
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(64)
        self.bn3 = nn.BatchNorm1d(64)
        self.bn4 = nn.BatchNorm1d(128)
        self.bn5 = nn.BatchNorm1d(1024)
    
    def forward(self, x):
        batch_size = x.size(0)
        num_points = x.size(2)
        
        # 输入变换
        t1 = self.tnet1(x)
        x = x.transpose(2, 1)
        x = torch.bmm(x, t1)
        x = x.transpose(2, 1)
        
        # 第一层特征
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        
        # 特征变换
        t2 = self.tnet2(x)
        x = x.transpose(2, 1)
        x = torch.bmm(x, t2)
        x = x.transpose(2, 1)
        
        point_feat = x
        
        # 更多特征层
        x = F.relu(self.bn3(self.conv3(x)))
        x = F.relu(self.bn4(self.conv4(x)))
        x = F.relu(self.bn5(self.conv5(x)))
        
        # 全局特征
        global_feat = x.max(dim=-1)[0]
        
        if self.global_feat:
            return global_feat, t2
        else:
            # 扩展全局特征到每个点
            global_feat_expanded = global_feat.unsqueeze(-1).repeat(1, 1, num_points)
            return torch.cat([point_feat, global_feat_expanded], dim=1), t2

class PointNetClassifier(nn.Module):
    """PointNet 分类器"""
    
    def __init__(self, num_classes=40, input_channels=3):
        super().__init__()
        
        self.encoder = PointNetEncoder(input_channels, global_feat=True)
        
        self.fc1 = nn.Linear(1024, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, num_classes)
        
        self.bn1 = nn.BatchNorm1d(512)
        self.bn2 = nn.BatchNorm1d(256)
        
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        global_feat, trans = self.encoder(x)
        
        x = F.relu(self.bn1(self.fc1(global_feat)))
        x = self.dropout(x)
        x = F.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = self.fc3(x)
        
        return x, trans

# 使用示例
def train_pointnet():
    model = PointNetClassifier(num_classes=40)
    
    # 模拟输入 (batch, channels, points)
    x = torch.randn(8, 3, 1024)
    
    # 前向传播
    output, trans = model(x)
    print(f"输入形状: {x.shape}")
    print(f"输出形状: {output.shape}")
```

#### [关联] 与核心层的关联

PointNet 直接处理点云数据，是点云深度学习的核心架构。

### 2. SLAM 技术

#### [概念] 概念与解决的问题

SLAM（Simultaneous Localization and Mapping）在移动过程中同时定位和建图。是机器人导航和自动驾驶的核心技术。

#### [语法] 核心用法

```python
import numpy as np
from collections import deque

class SimpleSLAM:
    """简化版 SLAM 示例"""
    
    def __init__(self):
        self.poses = []  # 相机位姿
        self.map_points = []  # 地图点
        self.keyframes = []  # 关键帧
    
    def add_frame(self, points, descriptors, pose):
        """添加新帧"""
        self.keyframes.append({
            'points': points,
            'descriptors': descriptors,
            'pose': pose
        })
        
        # 更新地图
        self.update_map(points, pose)
    
    def update_map(self, points, pose):
        """更新地图点"""
        # 将局部坐标转换为全局坐标
        R, t = pose[:3, :3], pose[:3, 3]
        global_points = (R @ points.T).T + t
        
        self.map_points.extend(global_points.tolist())
    
    def localize(self, current_points, current_descriptors):
        """定位当前帧"""
        # 特征匹配
        # ... 简化实现
        
        # 计算位姿
        # ... PnP 求解
        
        return np.eye(4)  # 返回估计的位姿

# 视觉里程计
class VisualOdometry:
    """视觉里程计"""
    
    def __init__(self):
        self.prev_frame = None
        self.cur_pose = np.eye(4)
        self.trajectory = [self.cur_pose.copy()]
    
    def process_frame(self, frame):
        """处理新帧"""
        if self.prev_frame is None:
            self.prev_frame = frame
            return self.cur_pose
        
        # 特征提取和匹配
        # ... OpenCV 实现
        
        # 计算相对位姿
        # relative_pose = self.estimate_motion(prev_frame, frame)
        
        # 累积位姿
        # self.cur_pose = self.cur_pose @ relative_pose
        # self.trajectory.append(self.cur_pose.copy())
        
        self.prev_frame = frame
        return self.cur_pose
    
    def get_trajectory(self):
        """获取轨迹"""
        return np.array([p[:3, 3] for p in self.trajectory])
```

#### [关联] 与核心层的关联

SLAM 基于点云处理和 3D 变换，实现实时定位和建图。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| PointNet++ | 层次化点云处理 |
| DGCNN | 动态图卷积 |
| PointCNN | 点云卷积 |
| VoxelNet | 体素网络 |
| PointPillars | 激光雷达检测 |
| LOAM | 激光雷达 SLAM |
| ORB-SLAM | 视觉 SLAM |
| COLMAP | 三维重建 |
| NeRF | 神经辐射场 |
| Gaussian Splatting | 3D 高斯渲染 |

---

## [实战] 核心实战清单

### 实战任务 1：点云分类与分割

使用 PointNet 实现点云分类和分割：

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# 训练循环
def train_pointnet_classifier():
    model = PointNetClassifier(num_classes=40)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    for epoch in range(100):
        model.train()
        for points, labels in train_loader:
            optimizer.zero_grad()
            
            outputs, trans = model(points)
            loss = criterion(outputs, labels)
            
            # 添加正则化
            loss += 0.001 * torch.mean(torch.norm(
                torch.bmm(trans, trans.transpose(1, 2)) - torch.eye(3).unsqueeze(0), 
                dim=(1, 2)
            ))
            
            loss.backward()
            optimizer.step()
        
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")
```
