# CNN 卷积神经网络 三层深度学习教程

## [总览] 技术总览

卷积神经网络（CNN）是深度学习处理图像数据的核心模型，通过卷积层提取局部特征、池化层降维、全连接层分类。CNN 在图像分类、目标检测、图像分割等任务中表现优异，是计算机视觉的基础架构。

本教程采用三层漏斗学习法：**核心层**聚焦卷积层、池化层、全连接层三大基石；**重点层**深入经典网络架构和训练技巧；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 卷积层

#### [概念] 概念解释

卷积层通过卷积核在输入图像上滑动计算局部区域的加权和，实现特征提取。关键参数包括卷积核大小、步长、填充、输出通道数。

#### [语法] 核心语法 / 命令 / API

| 参数 | 说明 | 常用值 |
|------|------|--------|
| in_channels | 输入通道数 | 1(灰度)/3(RGB) |
| out_channels | 输出通道数 | 32, 64, 128 |
| kernel_size | 卷积核大小 | 3, 5, 7 |
| stride | 步长 | 1, 2 |
| padding | 填充 | 0, 1, 'same' |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 基础卷积层
conv = nn.Conv2d(
    in_channels=3,      # 输入通道数
    out_channels=64,    # 输出通道数
    kernel_size=3,      # 卷积核大小
    stride=1,           # 步长
    padding=1           # 填充
)

# 输入张量: (batch_size, channels, height, width)
x = torch.randn(1, 3, 32, 32)
output = conv(x)
print(f"Input shape: {x.shape}")
print(f"Output shape: {output.shape}")

# 卷积层详细示例
class ConvLayer(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
    
    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        x = self.relu(x)
        return x

# 使用示例
conv_layer = ConvLayer(3, 64)
x = torch.randn(1, 3, 224, 224)
output = conv_layer(x)
print(f"Output shape: {output.shape}")

# 手动实现卷积操作理解
def manual_convolution(image, kernel):
    """手动实现卷积操作"""
    import numpy as np
    
    h, w = image.shape
    kh, kw = kernel.shape
    
    # 输出尺寸
    out_h = h - kh + 1
    out_w = w - kw + 1
    output = np.zeros((out_h, out_w))
    
    # 滑动窗口计算
    for i in range(out_h):
        for j in range(out_w):
            region = image[i:i+kh, j:j+kw]
            output[i, j] = np.sum(region * kernel)
    
    return output

# 边缘检测卷积核示例
sobel_x = torch.tensor([
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
], dtype=torch.float32).unsqueeze(0).unsqueeze(0)

sobel_y = torch.tensor([
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
], dtype=torch.float32).unsqueeze(0).unsqueeze(0)
```

#### [场景] 典型应用场景

- 图像特征提取
- 边缘检测
- 纹理识别

### 2. 池化层

#### [概念] 概念解释

池化层用于降维和控制过拟合，通过聚合局部区域的信息减少参数数量。常见池化方式包括最大池化和平均池化。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn

# 最大池化
max_pool = nn.MaxPool2d(
    kernel_size=2,      # 池化窗口大小
    stride=2,           # 步长
    padding=0           # 填充
)

# 平均池化
avg_pool = nn.AvgPool2d(
    kernel_size=2,
    stride=2
)

# 自适应池化 - 输出固定尺寸
adaptive_pool = nn.AdaptiveAvgPool2d((1, 1))  # 全局平均池化

# 使用示例
x = torch.randn(1, 64, 32, 32)
print(f"Input shape: {x.shape}")

# 最大池化
out_max = max_pool(x)
print(f"After MaxPool: {out_max.shape}")  # (1, 64, 16, 16)

# 平均池化
out_avg = avg_pool(x)
print(f"After AvgPool: {out_avg.shape}")  # (1, 64, 16, 16)

# 全局平均池化
out_global = adaptive_pool(x)
print(f"After Global Pool: {out_global.shape}")  # (1, 64, 1, 1)

# 池化层组合示例
class PoolingBlock(nn.Module):
    def __init__(self, pool_type='max', kernel_size=2):
        super().__init__()
        if pool_type == 'max':
            self.pool = nn.MaxPool2d(kernel_size, stride=kernel_size)
        elif pool_type == 'avg':
            self.pool = nn.AvgPool2d(kernel_size, stride=kernel_size)
        else:
            raise ValueError(f"Unknown pool type: {pool_type}")
    
    def forward(self, x):
        return self.pool(x)

# 多尺度池化 (Inception 风格)
class MultiScalePooling(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.branch1 = nn.AdaptiveAvgPool2d((1, 1))
        self.branch2 = nn.AdaptiveAvgPool2d((2, 2))
        self.branch3 = nn.AdaptiveAvgPool2d((3, 3))
        
        total_features = in_channels * (1 + 4 + 9)
        self.fc = nn.Linear(total_features, out_channels)
    
    def forward(self, x):
        b1 = self.branch1(x).view(x.size(0), -1)
        b2 = self.branch2(x).view(x.size(0), -1)
        b3 = self.branch3(x).view(x.size(0), -1)
        
        out = torch.cat([b1, b2, b3], dim=1)
        return self.fc(out)
```

#### [场景] 典型应用场景

- 特征图降维
- 增加感受野
- 减少计算量

### 3. 全连接层

#### [概念] 概念解释

全连接层将卷积层提取的特征展平后进行分类决策。通常位于网络末端，输出类别概率。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn

# 基础全连接层
fc = nn.Linear(in_features=512, out_features=10)

# 输入需要展平
x = torch.randn(1, 512)
output = fc(x)
print(f"Output shape: {output.shape}")

# 分类头示例
class ClassificationHead(nn.Module):
    def __init__(self, in_features, num_classes, dropout=0.5):
        super().__init__()
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(in_features, 512)
        self.bn1 = nn.BatchNorm1d(512)
        self.relu = nn.ReLU(inplace=True)
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(512, num_classes)
    
    def forward(self, x):
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x

# 完整 CNN 模型
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        
        # 特征提取层
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Block 2
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            # Block 3
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        
        # 分类层
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

# 使用示例
model = SimpleCNN(num_classes=10)
x = torch.randn(1, 3, 32, 32)
output = model(x)
print(f"Output shape: {output.shape}")
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

#### [场景] 典型应用场景

- 图像分类
- 特征映射到类别
- 多任务学习

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 经典网络架构

#### [概念] 概念与解决的问题

经典 CNN 架构如 VGG、ResNet、Inception 等提供了经过验证的网络设计模式，可以直接使用或作为迁移学习的基础。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import torchvision.models as models

# 使用预训练模型
# ResNet
resnet18 = models.resnet18(pretrained=True)
resnet50 = models.resnet50(pretrained=True)

# VGG
vgg16 = models.vgg16(pretrained=True)

# EfficientNet
efficientnet = models.efficientnet_b0(pretrained=True)

# 修改分类头
num_classes = 10
resnet18.fc = nn.Linear(resnet18.fc.in_features, num_classes)

# 自定义 ResNet Block
class BasicBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
    
    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        out = F.relu(out)
        return out

# 自定义 ResNet
class CustomResNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, 7, 2, 3, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.maxpool = nn.MaxPool2d(3, 2, 1)
        
        self.layer1 = self._make_layer(64, 64, 2, 1)
        self.layer2 = self._make_layer(64, 128, 2, 2)
        self.layer3 = self._make_layer(128, 256, 2, 2)
        
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(256, num_classes)
    
    def _make_layer(self, in_channels, out_channels, num_blocks, stride):
        layers = [BasicBlock(in_channels, out_channels, stride)]
        for _ in range(1, num_blocks):
            layers.append(BasicBlock(out_channels, out_channels))
        return nn.Sequential(*layers)
    
    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = self.maxpool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)
        return x
```

#### [代码] 代码示例

```python
# 迁移学习示例
import torch
import torch.nn as nn
import torchvision.models as models

def create_transfer_model(num_classes, pretrained=True):
    # 加载预训练模型
    model = models.resnet50(pretrained=pretrained)
    
    # 冻结特征提取层
    for param in model.parameters():
        param.requires_grad = False
    
    # 替换分类头
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(512, num_classes)
    )
    
    return model

# 微调训练
def fine_tune_model(model, train_loader, num_epochs=10):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    # 只训练分类头
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(num_epochs):
        model.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
        
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {loss.item():.4f}")
    
    return model
```

#### [关联] 与核心层的关联

经典架构是核心层组件的组合，提供了经过验证的设计模式。

### 2. 训练技巧

#### [概念] 概念与解决的问题

CNN 训练技巧包括数据增强、正则化、学习率调度等，可以提高模型性能和泛化能力。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torch.utils.data import DataLoader

# 数据增强
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 正则化
class RegularizedCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Dropout2d(0.2),  # Spatial Dropout
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Dropout2d(0.3),
            nn.MaxPool2d(2),
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 8 * 8, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

# 学习率调度
def get_scheduler(optimizer, scheduler_type='step'):
    if scheduler_type == 'step':
        return torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)
    elif scheduler_type == 'cosine':
        return torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)
    elif scheduler_type == 'plateau':
        return torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5)

# 完整训练循环
def train_model(model, train_loader, val_loader, num_epochs=50):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
    scheduler = get_scheduler(optimizer, 'cosine')
    
    best_acc = 0
    
    for epoch in range(num_epochs):
        # Training
        model.train()
        train_loss = 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            train_loss += loss.item()
        
        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
        
        val_acc = 100. * correct / total
        scheduler.step()
        
        print(f"Epoch {epoch+1}: Train Loss: {train_loss/len(train_loader):.4f}, Val Acc: {val_acc:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), 'best_model.pth')
    
    return model
```

#### [关联] 与核心层的关联

训练技巧优化核心层组件的学习过程，提高模型性能。

### 3. 可视化与解释

#### [概念] 概念与解决的问题

CNN 可视化帮助理解模型学到的特征，包括特征图可视化、类激活图（CAM）、梯度可视化等。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import numpy as np

# 特征图可视化
def visualize_feature_maps(model, image, layer_name='features'):
    model.eval()
    
    # 注册钩子获取特征图
    features = []
    def hook(module, input, output):
        features.append(output.detach())
    
    # 获取指定层
    layer = dict(model.named_modules())[layer_name]
    handle = layer.register_forward_hook(hook)
    
    # 前向传播
    with torch.no_grad():
        _ = model(image.unsqueeze(0))
    
    handle.remove()
    
    # 可视化
    feature_maps = features[0][0]
    num_maps = min(16, feature_maps.shape[0])
    
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    for i, ax in enumerate(axes.flat):
        if i < num_maps:
            ax.imshow(feature_maps[i].cpu().numpy(), cmap='viridis')
        ax.axis('off')
    plt.tight_layout()
    plt.show()

# Grad-CAM 实现
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # 注册钩子
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)
    
    def save_activation(self, module, input, output):
        self.activations = output.detach()
    
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()
    
    def __call__(self, x, class_idx=None):
        self.model.eval()
        
        # 前向传播
        output = self.model(x)
        
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()
        
        # 反向传播
        self.model.zero_grad()
        output[0, class_idx].backward(retain_graph=True)
        
        # 计算 CAM
        weights = self.gradients.mean(dim=[2, 3], keepdim=True)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=x.shape[2:], mode='bilinear', align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        
        # 归一化
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        
        return cam

# 使用示例
def visualize_gradcam(model, image, target_layer):
    grad_cam = GradCAM(model, target_layer)
    cam = grad_cam(image.unsqueeze(0))
    
    # 显示原图和 CAM
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    
    # 原图
    img_np = image.permute(1, 2, 0).cpu().numpy()
    axes[0].imshow(img_np)
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    # CAM 叠加
    axes[1].imshow(img_np)
    axes[1].imshow(cam, cmap='jet', alpha=0.5)
    axes[1].set_title('Grad-CAM')
    axes[1].axis('off')
    
    plt.tight_layout()
    plt.show()
```

#### [关联] 与核心层的关联

可视化帮助理解核心层组件的工作原理，便于调试和优化。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| LeNet | 早期 CNN 架构 |
| AlexNet | ImageNet 突破 |
| VGG | 深层小卷积核 |
| ResNet | 残差连接 |
| DenseNet | 密集连接 |
| Inception | 多尺度卷积 |
| MobileNet | 轻量级网络 |
| EfficientNet | 高效架构搜索 |
| Attention | 注意力机制 |
| Vision Transformer | 图像 Transformer |

---

## [实战] 核心实战清单

### 实战任务 1：构建图像分类模型

使用 CNN 构建完整的图像分类模型：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
import torchvision.transforms as transforms

# 完整训练流程
def main():
    # 数据准备
    transform = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomCrop(32, padding=4),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])
    
    trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=128, shuffle=True)
    
    testset = torchvision.datasets.CIFAR10(root='./data', train=False, download=True, transform=transform)
    testloader = torch.utils.data.DataLoader(testset, batch_size=100, shuffle=False)
    
    # 模型
    model = SimpleCNN(num_classes=10)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    # 训练
    train_model(model, trainloader, testloader, num_epochs=50)
    
    # 评估
    evaluate_model(model, testloader)

if __name__ == '__main__':
    main()
```
