# 图像处理 三层深度学习教程

## [总览] 技术总览

图像处理对数字图像进行分析和操作，包括图像增强、滤波、分割、特征提取等。图像处理是计算机视觉的基础，广泛应用于医学影像、遥感、工业检测等领域。

本教程采用三层漏斗学习法：**核心层**聚焦图像基础、滤波处理、几何变换三大基石；**重点层**深入图像分割和特征提取；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 图像基础

#### [概念] 概念解释

图像由像素矩阵组成，每个像素包含颜色信息。常用颜色空间包括 RGB、HSV、灰度等。理解图像基础是图像处理的前提。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple, List, Optional
from dataclasses import dataclass
from enum import Enum

class ColorSpace(Enum):
    """颜色空间"""
    RGB = "rgb"
    GRAYSCALE = "grayscale"
    HSV = "hsv"
    LAB = "lab"

@dataclass
class ImageMetadata:
    """图像元数据"""
    width: int
    height: int
    channels: int
    dtype: str
    color_space: ColorSpace

class Image:
    """图像类"""
    
    def __init__(self, data: np.ndarray, color_space: ColorSpace = ColorSpace.RGB):
        self.data = data
        self.color_space = color_space
    
    @property
    def width(self) -> int:
        return self.data.shape[1]
    
    @property
    def height(self) -> int:
        return self.data.shape[0]
    
    @property
    def channels(self) -> int:
        if len(self.data.shape) == 2:
            return 1
        return self.data.shape[2]
    
    @property
    def shape(self) -> Tuple[int, int, int]:
        return self.data.shape
    
    def get_metadata(self) -> ImageMetadata:
        """获取元数据"""
        return ImageMetadata(
            width=self.width,
            height=self.height,
            channels=self.channels,
            dtype=str(self.data.dtype),
            color_space=self.color_space
        )
    
    def get_pixel(self, x: int, y: int) -> np.ndarray:
        """获取像素值"""
        if len(self.data.shape) == 2:
            return self.data[y, x]
        return self.data[y, x, :]
    
    def set_pixel(self, x: int, y: int, value: np.ndarray):
        """设置像素值"""
        self.data[y, x] = value
    
    def to_grayscale(self) -> 'Image':
        """转换为灰度图"""
        if self.color_space == ColorSpace.GRAYSCALE:
            return self
        
        if self.channels == 3:
            gray = np.dot(self.data[..., :3], [0.299, 0.587, 0.114])
        else:
            gray = self.data[..., 0]
        
        return Image(gray.astype(np.uint8), ColorSpace.GRAYSCALE)
    
    def to_rgb(self) -> 'Image':
        """转换为 RGB"""
        if self.color_space == ColorSpace.RGB:
            return self
        
        if len(self.data.shape) == 2:
            rgb = np.stack([self.data] * 3, axis=-1)
        else:
            rgb = self.data
        
        return Image(rgb, ColorSpace.RGB)
    
    def to_hsv(self) -> 'Image':
        """转换为 HSV"""
        if self.color_space == ColorSpace.HSV:
            return self
        
        rgb = self.data.astype(float) / 255.0
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        
        max_val = np.maximum(np.maximum(r, g), b)
        min_val = np.minimum(np.minimum(r, g), b)
        diff = max_val - min_val
        
        h = np.zeros_like(max_val)
        s = np.where(max_val > 0, diff / max_val, 0)
        v = max_val
        
        mask_r = (max_val == r) & (diff > 0)
        mask_g = (max_val == g) & (diff > 0)
        mask_b = (max_val == b) & (diff > 0)
        
        h[mask_r] = ((g[mask_r] - b[mask_r]) / diff[mask_r]) % 6
        h[mask_g] = ((b[mask_g] - r[mask_g]) / diff[mask_g]) + 2
        h[mask_b] = ((r[mask_b] - g[mask_b]) / diff[mask_b]) + 4
        
        h = h / 6
        
        hsv = np.stack([h * 180, s * 255, v * 255], axis=-1).astype(np.uint8)
        
        return Image(hsv, ColorSpace.HSV)
    
    def copy(self) -> 'Image':
        """复制图像"""
        return Image(self.data.copy(), self.color_space)

class ImageUtils:
    """图像工具类"""
    
    @staticmethod
    def create_solid(width: int, height: int, color: Tuple[int, int, int] = (0, 0, 0)) -> Image:
        """创建纯色图像"""
        data = np.zeros((height, width, 3), dtype=np.uint8)
        data[:, :] = color
        return Image(data)
    
    @staticmethod
    def create_gradient(width: int, height: int, 
                        start_color: Tuple[int, int, int], 
                        end_color: Tuple[int, int, int]) -> Image:
        """创建渐变图像"""
        data = np.zeros((height, width, 3), dtype=np.uint8)
        
        for y in range(height):
            ratio = y / height
            color = tuple(int(start_color[i] + (end_color[i] - start_color[i]) * ratio) for i in range(3))
            data[y, :] = color
        
        return Image(data)
    
    @staticmethod
    def create_noise(width: int, height: int, channels: int = 3) -> Image:
        """创建噪声图像"""
        data = np.random.randint(0, 256, (height, width, channels), dtype=np.uint8)
        return Image(data)
    
    @staticmethod
    def create_checkerboard(width: int, height: int, 
                            block_size: int = 50,
                            color1: Tuple[int, int, int] = (255, 255, 255),
                            color2: Tuple[int, int, int] = (0, 0, 0)) -> Image:
        """创建棋盘格图像"""
        data = np.zeros((height, width, 3), dtype=np.uint8)
        
        for y in range(height):
            for x in range(width):
                if ((x // block_size) + (y // block_size)) % 2 == 0:
                    data[y, x] = color1
                else:
                    data[y, x] = color2
        
        return Image(data)

rgb_image = ImageUtils.create_gradient(200, 100, (255, 0, 0), (0, 0, 255))
print(f"RGB Image: {rgb_image.width}x{rgb_image.height}, channels={rgb_image.channels}")

gray_image = rgb_image.to_grayscale()
print(f"Grayscale Image: channels={gray_image.channels}")

hsv_image = rgb_image.to_hsv()
print(f"HSV Image: color_space={hsv_image.color_space.value}")

metadata = rgb_image.get_metadata()
print(f"\nMetadata: {metadata.width}x{metadata.height}, {metadata.color_space.value}")

pixel = rgb_image.get_pixel(50, 50)
print(f"Pixel at (50, 50): {pixel}")
```

### 2. 滤波处理

#### [概念] 概念解释

滤波处理对图像进行平滑、锐化、边缘检测等操作。常用滤波器包括均值滤波、高斯滤波、中值滤波、Sobel 边缘检测等。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple, List, Optional
from dataclasses import dataclass

@dataclass
class Kernel:
    """卷积核"""
    data: np.ndarray
    
    @property
    def size(self) -> int:
        return self.data.shape[0]
    
    @classmethod
    def gaussian(cls, size: int, sigma: float = 1.0) -> 'Kernel':
        """高斯核"""
        x = np.arange(size) - size // 2
        kernel_1d = np.exp(-x ** 2 / (2 * sigma ** 2))
        kernel_2d = np.outer(kernel_1d, kernel_1d)
        return cls(kernel_2d / kernel_2d.sum())
    
    @classmethod
    def sobel_x(cls) -> 'Kernel':
        """Sobel X 核"""
        return cls(np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]))
    
    @classmethod
    def sobel_y(cls) -> 'Kernel':
        """Sobel Y 核"""
        return cls(np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]]))
    
    @classmethod
    def laplacian(cls) -> 'Kernel':
        """拉普拉斯核"""
        return cls(np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]]))
    
    @classmethod
    def sharpen(cls) -> 'Kernel':
        """锐化核"""
        return cls(np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))

class ImageFilter:
    """图像滤波器"""
    
    def __init__(self):
        pass
    
    def convolve(self, image: Image, kernel: Kernel) -> Image:
        """卷积"""
        data = image.data.astype(float)
        k = kernel.data
        
        if len(data.shape) == 2:
            result = self._convolve_channel(data, k)
        else:
            result = np.zeros_like(data)
            for c in range(data.shape[2]):
                result[:, :, c] = self._convolve_channel(data[:, :, c], k)
        
        return Image(np.clip(result, 0, 255).astype(np.uint8), image.color_space)
    
    def _convolve_channel(self, channel: np.ndarray, kernel: np.ndarray) -> np.ndarray:
        """单通道卷积"""
        height, width = channel.shape
        kh, kw = kernel.shape
        pad_h, pad_w = kh // 2, kw // 2
        
        padded = np.pad(channel, ((pad_h, pad_h), (pad_w, pad_w)), mode='edge')
        
        result = np.zeros_like(channel)
        
        for i in range(height):
            for j in range(width):
                region = padded[i:i + kh, j:j + kw]
                result[i, j] = np.sum(region * kernel)
        
        return result
    
    def gaussian_blur(self, image: Image, size: int = 5, sigma: float = 1.0) -> Image:
        """高斯模糊"""
        kernel = Kernel.gaussian(size, sigma)
        return self.convolve(image, kernel)
    
    def median_filter(self, image: Image, size: int = 3) -> Image:
        """中值滤波"""
        data = image.data
        pad = size // 2
        
        if len(data.shape) == 2:
            padded = np.pad(data, pad, mode='edge')
            result = np.zeros_like(data)
            
            for i in range(data.shape[0]):
                for j in range(data.shape[1]):
                    region = padded[i:i + size, j:j + size]
                    result[i, j] = np.median(region)
        else:
            padded = np.pad(data, ((pad, pad), (pad, pad), (0, 0)), mode='edge')
            result = np.zeros_like(data)
            
            for i in range(data.shape[0]):
                for j in range(data.shape[1]):
                    for c in range(data.shape[2]):
                        region = padded[i:i + size, j:j + size, c]
                        result[i, j, c] = np.median(region)
        
        return Image(result.astype(np.uint8), image.color_space)
    
    def edge_detection(self, image: Image) -> Image:
        """边缘检测"""
        gray = image.to_grayscale()
        
        sobel_x = Kernel.sobel_x()
        sobel_y = Kernel.sobel_y()
        
        gx = self._convolve_channel(gray.data.astype(float), sobel_x.data)
        gy = self._convolve_channel(gray.data.astype(float), sobel_y.data)
        
        magnitude = np.sqrt(gx ** 2 + gy ** 2)
        magnitude = np.clip(magnitude, 0, 255).astype(np.uint8)
        
        return Image(magnitude, ColorSpace.GRAYSCALE)
    
    def sharpen(self, image: Image) -> Image:
        """锐化"""
        kernel = Kernel.sharpen()
        return self.convolve(image, kernel)
    
    def bilateral_filter(self, image: Image, spatial_sigma: float = 2.0, 
                         color_sigma: float = 30.0, size: int = 5) -> Image:
        """双边滤波"""
        data = image.data.astype(float)
        height, width = data.shape[:2]
        channels = data.shape[2] if len(data.shape) > 2 else 1
        
        pad = size // 2
        if channels > 1:
            padded = np.pad(data, ((pad, pad), (pad, pad), (0, 0)), mode='edge')
        else:
            padded = np.pad(data, pad, mode='edge')
        
        result = np.zeros_like(data)
        
        spatial_kernel = np.zeros((size, size))
        for i in range(size):
            for j in range(size):
                spatial_kernel[i, j] = np.exp(-((i - pad) ** 2 + (j - pad) ** 2) / (2 * spatial_sigma ** 2))
        
        for i in range(height):
            for j in range(width):
                if channels > 1:
                    center = padded[i + pad, j + pad]
                    region = padded[i:i + size, j:j + size]
                    
                    color_diff = np.sqrt(np.sum((region - center) ** 2, axis=2))
                    color_kernel = np.exp(-color_diff ** 2 / (2 * color_sigma ** 2))
                    
                    weights = spatial_kernel * color_kernel
                    weights = weights[:, :, np.newaxis]
                    
                    result[i, j] = np.sum(region * weights, axis=(0, 1)) / np.sum(weights)
                else:
                    center = padded[i + pad, j + pad]
                    region = padded[i:i + size, j:j + size]
                    
                    color_diff = np.abs(region - center)
                    color_kernel = np.exp(-color_diff ** 2 / (2 * color_sigma ** 2))
                    
                    weights = spatial_kernel * color_kernel
                    result[i, j] = np.sum(region * weights) / np.sum(weights)
        
        return Image(np.clip(result, 0, 255).astype(np.uint8), image.color_space)

test_image = ImageUtils.create_noise(100, 100)

filter_processor = ImageFilter()

blurred = filter_processor.gaussian_blur(test_image, size=5, sigma=1.5)
print(f"Gaussian blur applied")

edges = filter_processor.edge_detection(test_image)
print(f"Edge detection applied, result shape: {edges.shape}")

sharpened = filter_processor.sharpen(test_image)
print(f"Sharpening applied")

median = filter_processor.median_filter(test_image, size=3)
print(f"Median filter applied")
```

### 3. 几何变换

#### [概念] 概念解释

几何变换改变图像的空间位置，包括平移、旋转、缩放、翻转等。几何变换是图像配准和增强的基础操作。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple, Optional
from dataclasses import dataclass

@dataclass
class TransformMatrix:
    """变换矩阵"""
    matrix: np.ndarray
    
    @classmethod
    def identity(cls) -> 'TransformMatrix':
        """单位矩阵"""
        return cls(np.eye(3))
    
    @classmethod
    def translation(cls, tx: float, ty: float) -> 'TransformMatrix':
        """平移矩阵"""
        matrix = np.eye(3)
        matrix[0, 2] = tx
        matrix[1, 2] = ty
        return cls(matrix)
    
    @classmethod
    def rotation(cls, angle: float, cx: float = 0, cy: float = 0) -> 'TransformMatrix':
        """旋转矩阵"""
        rad = np.radians(angle)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        
        matrix = np.array([
            [cos_a, -sin_a, cx - cx * cos_a + cy * sin_a],
            [sin_a, cos_a, cy - cx * sin_a - cy * cos_a],
            [0, 0, 1]
        ])
        return cls(matrix)
    
    @classmethod
    def scale(cls, sx: float, sy: float, cx: float = 0, cy: float = 0) -> 'TransformMatrix':
        """缩放矩阵"""
        matrix = np.array([
            [sx, 0, cx * (1 - sx)],
            [0, sy, cy * (1 - sy)],
            [0, 0, 1]
        ])
        return cls(matrix)
    
    @classmethod
    def shear(cls, shx: float = 0, shy: float = 0) -> 'TransformMatrix':
        """剪切矩阵"""
        matrix = np.array([
            [1, shx, 0],
            [shy, 1, 0],
            [0, 0, 1]
        ])
        return cls(matrix)
    
    def compose(self, other: 'TransformMatrix') -> 'TransformMatrix':
        """组合变换"""
        return TransformMatrix(self.matrix @ other.matrix)
    
    def inverse(self) -> 'TransformMatrix':
        """逆变换"""
        return TransformMatrix(np.linalg.inv(self.matrix))

class GeometricTransform:
    """几何变换"""
    
    def __init__(self):
        pass
    
    def translate(self, image: Image, tx: int, ty: int) -> Image:
        """平移"""
        height, width = image.height, image.width
        data = image.data
        
        result = np.zeros_like(data)
        
        src_x_start = max(0, -tx)
        src_x_end = min(width, width - tx)
        src_y_start = max(0, -ty)
        src_y_end = min(height, height - ty)
        
        dst_x_start = max(0, tx)
        dst_x_end = min(width, width + tx)
        dst_y_start = max(0, ty)
        dst_y_end = min(height, height + ty)
        
        result[dst_y_start:dst_y_end, dst_x_start:dst_x_end] = \
            data[src_y_start:src_y_end, src_x_start:src_x_end]
        
        return Image(result, image.color_space)
    
    def rotate(self, image: Image, angle: float, 
               center: Tuple[int, int] = None) -> Image:
        """旋转"""
        height, width = image.height, image.width
        
        if center is None:
            center = (width // 2, height // 2)
        
        cx, cy = center
        rad = np.radians(angle)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        
        result = np.zeros_like(image.data)
        
        for y in range(height):
            for x in range(width):
                dx, dy = x - cx, y - cy
                
                src_x = int(cos_a * dx + sin_a * dy + cx)
                src_y = int(-sin_a * dx + cos_a * dy + cy)
                
                if 0 <= src_x < width and 0 <= src_y < height:
                    result[y, x] = image.data[src_y, src_x]
        
        return Image(result, image.color_space)
    
    def scale(self, image: Image, scale_x: float, scale_y: float = None) -> Image:
        """缩放"""
        if scale_y is None:
            scale_y = scale_x
        
        new_width = int(image.width * scale_x)
        new_height = int(image.height * scale_y)
        
        result = np.zeros((new_height, new_width, image.channels), 
                         dtype=image.data.dtype)
        
        for y in range(new_height):
            for x in range(new_width):
                src_x = int(x / scale_x)
                src_y = int(y / scale_y)
                
                src_x = min(src_x, image.width - 1)
                src_y = min(src_y, image.height - 1)
                
                if len(image.data.shape) == 2:
                    result[y, x] = image.data[src_y, src_x]
                else:
                    result[y, x] = image.data[src_y, src_x]
        
        return Image(result, image.color_space)
    
    def flip_horizontal(self, image: Image) -> Image:
        """水平翻转"""
        return Image(np.flip(image.data, axis=1), image.color_space)
    
    def flip_vertical(self, image: Image) -> Image:
        """垂直翻转"""
        return Image(np.flip(image.data, axis=0), image.color_space)
    
    def crop(self, image: Image, x: int, y: int, 
             width: int, height: int) -> Image:
        """裁剪"""
        return Image(image.data[y:y + height, x:x + width].copy(), image.color_space)
    
    def resize(self, image: Image, new_width: int, new_height: int, 
               interpolation: str = 'nearest') -> Image:
        """调整大小"""
        result = np.zeros((new_height, new_width, image.channels), 
                         dtype=image.data.dtype)
        
        scale_x = image.width / new_width
        scale_y = image.height / new_height
        
        for y in range(new_height):
            for x in range(new_width):
                src_x = int(x * scale_x)
                src_y = int(y * scale_y)
                
                if interpolation == 'bilinear':
                    x0, y0 = int(x * scale_x), int(y * scale_y)
                    x1, y1 = min(x0 + 1, image.width - 1), min(y0 + 1, image.height - 1)
                    
                    fx, fy = x * scale_x - x0, y * scale_y - y0
                    
                    if len(image.data.shape) == 2:
                        result[y, x] = (1 - fx) * (1 - fy) * image.data[y0, x0] + \
                                       fx * (1 - fy) * image.data[y0, x1] + \
                                       (1 - fx) * fy * image.data[y1, x0] + \
                                       fx * fy * image.data[y1, x1]
                    else:
                        for c in range(image.channels):
                            result[y, x, c] = (1 - fx) * (1 - fy) * image.data[y0, x0, c] + \
                                              fx * (1 - fy) * image.data[y0, x1, c] + \
                                              (1 - fx) * fy * image.data[y1, x0, c] + \
                                              fx * fy * image.data[y1, x1, c]
                else:
                    if len(image.data.shape) == 2:
                        result[y, x] = image.data[src_y, src_x]
                    else:
                        result[y, x] = image.data[src_y, src_x]
        
        return Image(result.astype(np.uint8), image.color_space)
    
    def affine_transform(self, image: Image, matrix: TransformMatrix) -> Image:
        """仿射变换"""
        height, width = image.height, image.width
        result = np.zeros_like(image.data)
        
        inv_matrix = matrix.inverse().matrix
        
        for y in range(height):
            for x in range(width):
                src = inv_matrix @ np.array([x, y, 1])
                src_x, src_y = int(src[0]), int(src[1])
                
                if 0 <= src_x < width and 0 <= src_y < height:
                    result[y, x] = image.data[src_y, src_x]
        
        return Image(result, image.color_space)

test_image = ImageUtils.create_checkerboard(200, 200, block_size=25)

transform = GeometricTransform()

translated = transform.translate(test_image, tx=30, ty=20)
print(f"Translated: offset=(30, 20)")

rotated = transform.rotate(test_image, angle=45)
print(f"Rotated: angle=45 degrees")

scaled = transform.scale(test_image, scale_x=0.5, scale_y=0.5)
print(f"Scaled: 0.5x")

flipped = transform.flip_horizontal(test_image)
print(f"Flipped horizontally")

cropped = transform.crop(test_image, x=50, y=50, width=100, height=100)
print(f"Cropped: 100x100 from (50, 50)")

resized = transform.resize(test_image, new_width=400, new_height=400, interpolation='bilinear')
print(f"Resized: 400x400")

affine_matrix = TransformMatrix.rotation(30, cx=100, cy=100)
affine_result = transform.affine_transform(test_image, affine_matrix)
print(f"Affine transform: rotation 30 degrees around center")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 图像分割

#### [概念] 概念解释

图像分割将图像划分为有意义的区域，常用方法包括阈值分割、区域生长、边缘检测分割、聚类分割等。图像分割是图像分析的关键步骤。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass
from collections import deque

@dataclass
class SegmentationResult:
    """分割结果"""
    mask: np.ndarray
    num_regions: int
    region_props: List[Dict]

class ThresholdSegmenter:
    """阈值分割器"""
    
    def __init__(self):
        pass
    
    def global_threshold(self, image: Image, threshold: int = 128) -> np.ndarray:
        """全局阈值"""
        gray = image.to_grayscale()
        return (gray.data > threshold).astype(np.uint8) * 255
    
    def otsu_threshold(self, image: Image) -> Tuple[np.ndarray, int]:
        """Otsu 阈值"""
        gray = image.to_grayscale()
        hist, _ = np.histogram(gray.data.flatten(), bins=256, range=(0, 256))
        
        total = gray.data.size
        sum_total = np.sum(np.arange(256) * hist)
        
        sum_bg = 0
        weight_bg = 0
        
        max_variance = 0
        best_threshold = 0
        
        for t in range(256):
            weight_bg += hist[t]
            if weight_bg == 0:
                continue
            
            weight_fg = total - weight_bg
            if weight_fg == 0:
                break
            
            sum_bg += t * hist[t]
            
            mean_bg = sum_bg / weight_bg
            mean_fg = (sum_total - sum_bg) / weight_fg
            
            variance = weight_bg * weight_fg * (mean_bg - mean_fg) ** 2
            
            if variance > max_variance:
                max_variance = variance
                best_threshold = t
        
        mask = (gray.data > best_threshold).astype(np.uint8) * 255
        
        return mask, best_threshold
    
    def adaptive_threshold(self, image: Image, block_size: int = 11, 
                           c: int = 2) -> np.ndarray:
        """自适应阈值"""
        gray = image.to_grayscale()
        height, width = gray.data.shape
        result = np.zeros_like(gray.data)
        
        half_block = block_size // 2
        
        for y in range(height):
            for x in range(width):
                y_start = max(0, y - half_block)
                y_end = min(height, y + half_block + 1)
                x_start = max(0, x - half_block)
                x_end = min(width, x + half_block + 1)
                
                local_mean = np.mean(gray.data[y_start:y_end, x_start:x_end])
                
                if gray.data[y, x] > local_mean - c:
                    result[y, x] = 255
        
        return result

class RegionGrowing:
    """区域生长分割"""
    
    def __init__(self, tolerance: int = 10):
        self.tolerance = tolerance
    
    def grow(self, image: Image, seeds: List[Tuple[int, int]]) -> np.ndarray:
        """区域生长"""
        gray = image.to_grayscale()
        height, width = gray.data.shape
        
        mask = np.zeros((height, width), dtype=np.uint8)
        visited = np.zeros((height, width), dtype=bool)
        
        queue = deque()
        
        for seed in seeds:
            queue.append(seed)
            visited[seed[1], seed[0]] = True
        
        seed_values = [gray.data[seed[1], seed[0]] for seed in seeds]
        target_value = np.mean(seed_values)
        
        while queue:
            x, y = queue.popleft()
            
            if abs(gray.data[y, x] - target_value) <= self.tolerance:
                mask[y, x] = 255
                
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    
                    if 0 <= nx < width and 0 <= ny < height and not visited[ny, nx]:
                        visited[ny, nx] = True
                        queue.append((nx, ny))
        
        return mask

class WatershedSegmenter:
    """分水岭分割"""
    
    def __init__(self):
        pass
    
    def segment(self, image: Image, markers: np.ndarray) -> np.ndarray:
        """分水岭分割"""
        gray = image.to_grayscale()
        
        height, width = gray.data.shape
        result = markers.copy()
        
        current_level = 0
        max_level = 256
        
        while current_level < max_level:
            current_level += 1
            
            for y in range(height):
                for x in range(width):
                    if gray.data[y, x] <= current_level and result[y, x] == 0:
                        neighbors = []
                        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < width and 0 <= ny < height:
                                if result[ny, nx] > 0:
                                    neighbors.append(result[ny, nx])
                        
                        if len(set(neighbors)) == 1:
                            result[y, x] = neighbors[0]
        
        return result

class ConnectedComponents:
    """连通组件分析"""
    
    def __init__(self):
        pass
    
    def label(self, binary: np.ndarray) -> Tuple[np.ndarray, int]:
        """标记连通组件"""
        height, width = binary.shape
        labels = np.zeros_like(binary, dtype=np.int32)
        current_label = 0
        
        for y in range(height):
            for x in range(width):
                if binary[y, x] > 0 and labels[y, x] == 0:
                    current_label += 1
                    self._flood_fill(binary, labels, x, y, current_label)
        
        return labels, current_label
    
    def _flood_fill(self, binary: np.ndarray, labels: np.ndarray, 
                    start_x: int, start_y: int, label: int):
        """泛洪填充"""
        height, width = binary.shape
        queue = deque([(start_x, start_y)])
        labels[start_y, start_x] = label
        
        while queue:
            x, y = queue.popleft()
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height:
                    if binary[ny, nx] > 0 and labels[ny, nx] == 0:
                        labels[ny, nx] = label
                        queue.append((nx, ny))
    
    def get_region_properties(self, labels: np.ndarray, num_regions: int) -> List[Dict]:
        """获取区域属性"""
        props = []
        
        for label in range(1, num_regions + 1):
            mask = labels == label
            
            area = np.sum(mask)
            
            ys, xs = np.where(mask)
            centroid = (np.mean(xs), np.mean(ys)) if len(xs) > 0 else (0, 0)
            
            bbox = (int(np.min(xs)), int(np.min(ys)), 
                    int(np.max(xs)), int(np.max(ys))) if len(xs) > 0 else (0, 0, 0, 0)
            
            props.append({
                'label': label,
                'area': area,
                'centroid': centroid,
                'bbox': bbox
            })
        
        return props

test_image = ImageUtils.create_checkerboard(200, 200, block_size=50)

segmenter = ThresholdSegmenter()

mask, threshold = segmenter.otsu_threshold(test_image)
print(f"Otsu threshold: {threshold}")

adaptive = segmenter.adaptive_threshold(test_image)
print(f"Adaptive threshold applied")

cc = ConnectedComponents()
labels, num = cc.label(mask)
print(f"Found {num} connected components")

props = cc.get_region_properties(labels, num)
print(f"Region 1 area: {props[0]['area']}")
print(f"Region 1 centroid: {props[0]['centroid']}")
```

### 2. 特征提取

#### [概念] 概念解释

特征提取从图像中提取有代表性的特征，包括颜色特征、纹理特征、形状特征等。特征提取是图像识别和检索的基础。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class ImageFeatures:
    """图像特征"""
    color_histogram: np.ndarray
    texture_features: np.ndarray
    shape_features: np.ndarray

class ColorFeatureExtractor:
    """颜色特征提取器"""
    
    def __init__(self, bins: int = 64):
        self.bins = bins
    
    def extract_histogram(self, image: Image) -> np.ndarray:
        """提取颜色直方图"""
        if image.channels == 1:
            hist, _ = np.histogram(image.data.flatten(), bins=self.bins, range=(0, 256))
            return hist / hist.sum()
        else:
            histograms = []
            for c in range(image.channels):
                hist, _ = np.histogram(image.data[:, :, c].flatten(), 
                                       bins=self.bins, range=(0, 256))
                histograms.append(hist)
            
            combined = np.concatenate(histograms)
            return combined / combined.sum()
    
    def extract_color_moments(self, image: Image) -> np.ndarray:
        """提取颜色矩"""
        moments = []
        
        if image.channels == 1:
            data = image.data.flatten()
            moments.extend([
                np.mean(data),
                np.std(data),
                self._skewness(data)
            ])
        else:
            for c in range(image.channels):
                data = image.data[:, :, c].flatten()
                moments.extend([
                    np.mean(data),
                    np.std(data),
                    self._skewness(data)
                ])
        
        return np.array(moments)
    
    def _skewness(self, data: np.ndarray) -> float:
        """计算偏度"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 3)

class TextureFeatureExtractor:
    """纹理特征提取器"""
    
    def __init__(self):
        pass
    
    def extract_glcm_features(self, image: Image, distances: List[int] = None, 
                               angles: List[float] = None) -> np.ndarray:
        """提取 GLCM 特征"""
        if distances is None:
            distances = [1]
        if angles is None:
            angles = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]
        
        gray = image.to_grayscale()
        
        features = []
        
        for d in distances:
            for a in angles:
                glcm = self._compute_glcm(gray.data, d, a)
                
                features.extend([
                    self._contrast(glcm),
                    self._dissimilarity(glcm),
                    self._homogeneity(glcm),
                    self._energy(glcm),
                    self._correlation(glcm)
                ])
        
        return np.array(features)
    
    def _compute_glcm(self, image: np.ndarray, distance: int, angle: float) -> np.ndarray:
        """计算灰度共生矩阵"""
        levels = 256
        glcm = np.zeros((levels, levels))
        
        dx = int(distance * np.cos(angle))
        dy = int(distance * np.sin(angle))
        
        height, width = image.shape
        
        for y in range(height):
            for x in range(width):
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height:
                    i, j = image[y, x], image[ny, nx]
                    glcm[i, j] += 1
        
        glcm = glcm / glcm.sum() if glcm.sum() > 0 else glcm
        
        return glcm
    
    def _contrast(self, glcm: np.ndarray) -> float:
        """对比度"""
        levels = glcm.shape[0]
        result = 0
        for i in range(levels):
            for j in range(levels):
                result += glcm[i, j] * (i - j) ** 2
        return result
    
    def _dissimilarity(self, glcm: np.ndarray) -> float:
        """差异性"""
        levels = glcm.shape[0]
        result = 0
        for i in range(levels):
            for j in range(levels):
                result += glcm[i, j] * abs(i - j)
        return result
    
    def _homogeneity(self, glcm: np.ndarray) -> float:
        """同质性"""
        levels = glcm.shape[0]
        result = 0
        for i in range(levels):
            for j in range(levels):
                result += glcm[i, j] / (1 + (i - j) ** 2)
        return result
    
    def _energy(self, glcm: np.ndarray) -> float:
        """能量"""
        return np.sum(glcm ** 2)
    
    def _correlation(self, glcm: np.ndarray) -> float:
        """相关性"""
        levels = glcm.shape[0]
        
        i_indices = np.arange(levels)
        j_indices = np.arange(levels)
        
        mean_i = np.sum(glcm * i_indices[:, np.newaxis])
        mean_j = np.sum(glcm * j_indices[np.newaxis, :])
        
        std_i = np.sqrt(np.sum(glcm * (i_indices[:, np.newaxis] - mean_i) ** 2))
        std_j = np.sqrt(np.sum(glcm * (j_indices[np.newaxis, :] - mean_j) ** 2))
        
        if std_i == 0 or std_j == 0:
            return 0
        
        result = 0
        for i in range(levels):
            for j in range(levels):
                result += glcm[i, j] * (i - mean_i) * (j - mean_j)
        
        return result / (std_i * std_j)

class ShapeFeatureExtractor:
    """形状特征提取器"""
    
    def __init__(self):
        pass
    
    def extract_hu_moments(self, binary: np.ndarray) -> np.ndarray:
        """提取 Hu 矩"""
        moments = self._compute_moments(binary)
        
        hu = np.zeros(7)
        
        m00 = moments.get((0, 0), 1)
        m10 = moments.get((1, 0), 0) / m00
        m01 = moments.get((0, 1), 0) / m00
        
        mu20 = moments.get((2, 0), 0) / m00 - m10 ** 2
        mu02 = moments.get((0, 2), 0) / m00 - m01 ** 2
        mu11 = moments.get((1, 1), 0) / m00 - m10 * m01
        mu30 = moments.get((3, 0), 0) / m00 - 3 * m10 * mu20 - m10 ** 3
        mu03 = moments.get((0, 3), 0) / m00 - 3 * m01 * mu02 - m01 ** 3
        mu21 = moments.get((2, 1), 0) / m00 - 2 * m10 * mu11 - m01 * mu20 - m10 ** 2 * m01
        mu12 = moments.get((1, 2), 0) / m00 - 2 * m01 * mu11 - m10 * mu02 - m01 ** 2 * m10
        
        hu[0] = mu20 + mu02
        hu[1] = (mu20 - mu02) ** 2 + 4 * mu11 ** 2
        hu[2] = (mu30 - 3 * mu12) ** 2 + (3 * mu21 - mu03) ** 2
        hu[3] = (mu30 + mu12) ** 2 + (mu21 + mu03) ** 2
        hu[4] = (mu30 - 3 * mu12) * (mu30 + mu12) * ((mu30 + mu12) ** 2 - 3 * (mu21 + mu03) ** 2) + \
                (3 * mu21 - mu03) * (mu21 + mu03) * (3 * (mu30 + mu12) ** 2 - (mu21 + mu03) ** 2)
        hu[5] = (mu20 - mu02) * ((mu30 + mu12) ** 2 - (mu21 + mu03) ** 2) + \
                4 * mu11 * (mu30 + mu12) * (mu21 + mu03)
        hu[6] = (3 * mu21 - mu03) * (mu30 + mu12) * ((mu30 + mu12) ** 2 - 3 * (mu21 + mu03) ** 2) - \
                (mu30 - 3 * mu12) * (mu21 + mu03) * (3 * (mu30 + mu12) ** 2 - (mu21 + mu03) ** 2)
        
        return hu
    
    def _compute_moments(self, binary: np.ndarray) -> Dict:
        """计算矩"""
        moments = {}
        height, width = binary.shape
        
        for y in range(height):
            for x in range(width):
                if binary[y, x] > 0:
                    for p in range(4):
                        for q in range(4 - p):
                            key = (p, q)
                            moments[key] = moments.get(key, 0) + (x ** p) * (y ** q)
        
        return moments
    
    def extract_contour_features(self, binary: np.ndarray) -> np.ndarray:
        """提取轮廓特征"""
        contours = self._find_contours(binary)
        
        if not contours:
            return np.zeros(5)
        
        main_contour = max(contours, key=len)
        
        perimeter = len(main_contour)
        
        area = np.sum(binary > 0)
        
        compactness = (perimeter ** 2) / (4 * np.pi * area) if area > 0 else 0
        
        if len(main_contour) >= 3:
            x_coords = [p[0] for p in main_contour]
            y_coords = [p[1] for p in main_contour]
            eccentricity = (max(x_coords) - min(x_coords)) / (max(y_coords) - min(y_coords) + 1)
        else:
            eccentricity = 0
        
        convexity = 1.0
        
        solidity = 1.0
        
        return np.array([perimeter, area, compactness, eccentricity, solidity])
    
    def _find_contours(self, binary: np.ndarray) -> List[List[Tuple[int, int]]]:
        """查找轮廓"""
        height, width = binary.shape
        visited = np.zeros_like(binary, dtype=bool)
        contours = []
        
        for y in range(height):
            for x in range(width):
                if binary[y, x] > 0 and not visited[y, x]:
                    contour = self._trace_contour(binary, visited, x, y)
                    if len(contour) > 2:
                        contours.append(contour)
        
        return contours
    
    def _trace_contour(self, binary: np.ndarray, visited: np.ndarray, 
                       start_x: int, start_y: int) -> List[Tuple[int, int]]:
        """追踪轮廓"""
        contour = []
        x, y = start_x, start_y
        
        directions = [(1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1)]
        
        height, width = binary.shape
        
        for _ in range(height * width):
            if visited[y, x]:
                break
            
            visited[y, x] = True
            contour.append((x, y))
            
            found = False
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if binary[ny, nx] > 0:
                        x, y = nx, ny
                        found = True
                        break
            
            if not found:
                break
        
        return contour

test_image = ImageUtils.create_noise(100, 100)

color_extractor = ColorFeatureExtractor()
color_hist = color_extractor.extract_histogram(test_image)
print(f"Color histogram shape: {color_hist.shape}")

color_moments = color_extractor.extract_color_moments(test_image)
print(f"Color moments: {color_moments}")

texture_extractor = TextureFeatureExtractor()
glcm_features = texture_extractor.extract_glcm_features(test_image)
print(f"GLCM features shape: {glcm_features.shape}")

binary = (test_image.to_grayscale().data > 128).astype(np.uint8) * 255

shape_extractor = ShapeFeatureExtractor()
hu_moments = shape_extractor.extract_hu_moments(binary)
print(f"Hu moments: {hu_moments[:3]}...")

contour_features = shape_extractor.extract_contour_features(binary)
print(f"Contour features: {contour_features}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| OpenCV | 开源计算机视觉库 |
| PIL/Pillow | Python 图像处理库 |
| ImageMagick | 图像处理工具 |
| Morphology | 形态学操作 |
| Histogram Equalization | 直方图均衡化 |
| Fourier Transform | 傅里叶变换 |
| Wavelet Transform | 小波变换 |
| Hough Transform | 霍夫变换 |
| SIFT | 尺度不变特征变换 |
| SURF | 加速稳健特征 |
| ORB | 定向 FAST 和旋转 BRIEF |
| HOG | 方向梯度直方图 |
| LBP | 局部二值模式 |
| Image Registration | 图像配准 |
| Panorama Stitching | 全景拼接 |

---

## [实战] 核心实战清单

### 实战任务 1：图像处理流水线

构建一个完整的图像处理流水线。要求：
1. 实现多种滤波器（高斯、中值、双边）
2. 实现几何变换（旋转、缩放、仿射）
3. 实现图像分割（阈值、区域生长）
4. 提取图像特征（颜色、纹理、形状）
5. 评估处理效果
