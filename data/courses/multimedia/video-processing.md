# 视频处理 三层深度学习教程

## [总览] 技术总览

视频处理分析和操作视频数据，包括视频编码、视频分析、视频增强等。视频处理结合图像处理和音频处理技术，是多媒体技术的核心领域。

本教程采用三层漏斗学习法：**核心层**聚焦视频基础、帧处理、视频编码三大基石；**重点层**深入视频分析和视频增强；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 视频基础

#### [概念] 概念解释

视频由连续的图像帧组成，每帧是一幅静态图像。视频的关键参数包括帧率、分辨率、时长、编码格式等。理解视频基础是视频处理的前提。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class PixelFormat(Enum):
    """像素格式"""
    RGB = "rgb"
    YUV = "yuv"
    GRAYSCALE = "grayscale"

@dataclass
class VideoMetadata:
    """视频元数据"""
    width: int
    height: int
    fps: float
    duration: float
    frame_count: int
    pixel_format: PixelFormat

@dataclass
class VideoFrame:
    """视频帧"""
    data: np.ndarray
    timestamp: float
    frame_number: int

class VideoReader:
    """视频读取器"""
    
    def __init__(self):
        self.metadata: Optional[VideoMetadata] = None
        self.frames: List[VideoFrame] = []
    
    def load_from_array(self, video_array: np.ndarray, fps: float = 30.0):
        """从数组加载视频"""
        n_frames, height, width, channels = video_array.shape
        
        self.metadata = VideoMetadata(
            width=width,
            height=height,
            fps=fps,
            duration=n_frames / fps,
            frame_count=n_frames,
            pixel_format=PixelFormat.RGB
        )
        
        self.frames = []
        for i, frame_data in enumerate(video_array):
            self.frames.append(VideoFrame(
                data=frame_data,
                timestamp=i / fps,
                frame_number=i
            ))
    
    def get_frame(self, frame_number: int) -> Optional[VideoFrame]:
        """获取指定帧"""
        if 0 <= frame_number < len(self.frames):
            return self.frames[frame_number]
        return None
    
    def get_frame_at_time(self, timestamp: float) -> Optional[VideoFrame]:
        """获取指定时间的帧"""
        if self.metadata is None:
            return None
        
        frame_number = int(timestamp * self.metadata.fps)
        return self.get_frame(frame_number)
    
    def iterate_frames(self, start: int = 0, end: int = None, step: int = 1):
        """迭代帧"""
        if end is None:
            end = len(self.frames)
        
        for i in range(start, min(end, len(self.frames)), step):
            yield self.frames[i]

class VideoWriter:
    """视频写入器"""
    
    def __init__(self, fps: float = 30.0):
        self.fps = fps
        self.frames: List[np.ndarray] = []
    
    def add_frame(self, frame: np.ndarray):
        """添加帧"""
        self.frames.append(frame.copy())
    
    def get_video_array(self) -> np.ndarray:
        """获取视频数组"""
        return np.array(self.frames)
    
    def get_metadata(self) -> VideoMetadata:
        """获取元数据"""
        if not self.frames:
            return VideoMetadata(0, 0, self.fps, 0, 0, PixelFormat.RGB)
        
        height, width, _ = self.frames[0].shape
        n_frames = len(self.frames)
        
        return VideoMetadata(
            width=width,
            height=height,
            fps=self.fps,
            duration=n_frames / self.fps,
            frame_count=n_frames,
            pixel_format=PixelFormat.RGB
        )

class VideoUtils:
    """视频工具类"""
    
    @staticmethod
    def create_test_video(width: int = 320, height: int = 240, 
                          n_frames: int = 90, fps: float = 30.0) -> np.ndarray:
        """创建测试视频"""
        frames = []
        
        for i in range(n_frames):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            x = int((width / 2) + (width / 4) * np.cos(2 * np.pi * i / n_frames))
            y = int((height / 2) + (height / 4) * np.sin(2 * np.pi * i / n_frames))
            
            radius = 30
            for dy in range(-radius, radius + 1):
                for dx in range(-radius, radius + 1):
                    if dx * dx + dy * dy <= radius * radius:
                        px, py = x + dx, y + dy
                        if 0 <= px < width and 0 <= py < height:
                            frame[py, px] = [255, 100, 50]
            
            frames.append(frame)
        
        return np.array(frames)
    
    @staticmethod
    def resize_frame(frame: np.ndarray, new_width: int, new_height: int) -> np.ndarray:
        """调整帧大小"""
        old_height, old_width = frame.shape[:2]
        
        scale_x = old_width / new_width
        scale_y = old_height / new_height
        
        resized = np.zeros((new_height, new_width, frame.shape[2]), dtype=frame.dtype)
        
        for y in range(new_height):
            for x in range(new_width):
                src_x = int(x * scale_x)
                src_y = int(y * scale_y)
                resized[y, x] = frame[src_y, src_x]
        
        return resized
    
    @staticmethod
    def crop_frame(frame: np.ndarray, x: int, y: int, 
                   width: int, height: int) -> np.ndarray:
        """裁剪帧"""
        return frame[y:y + height, x:x + width].copy()
    
    @staticmethod
    def convert_to_grayscale(frame: np.ndarray) -> np.ndarray:
        """转换为灰度"""
        return np.dot(frame[..., :3], [0.299, 0.587, 0.114]).astype(np.uint8)

video_array = VideoUtils.create_test_video(width=320, height=240, n_frames=90, fps=30.0)
print(f"Created test video: shape={video_array.shape}")

reader = VideoReader()
reader.load_from_array(video_array, fps=30.0)

print(f"\nVideo Metadata:")
print(f"  Resolution: {reader.metadata.width}x{reader.metadata.height}")
print(f"  FPS: {reader.metadata.fps}")
print(f"  Duration: {reader.metadata.duration:.2f}s")
print(f"  Frame count: {reader.metadata.frame_count}")

frame = reader.get_frame(0)
print(f"\nFrame 0 shape: {frame.data.shape}")
print(f"Frame 0 timestamp: {frame.timestamp:.3f}s")

frame_at_1s = reader.get_frame_at_time(1.0)
print(f"\nFrame at 1s: frame_number={frame_at_1s.frame_number}")

grayscale = VideoUtils.convert_to_grayscale(frame.data)
print(f"\nGrayscale frame shape: {grayscale.shape}")
```

### 2. 帧处理

#### [概念] 概念解释

帧处理对视频的每一帧进行操作，包括颜色调整、滤波、特征提取等。帧处理是视频分析的基础，常用于视频增强和预处理。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class FrameProcessor:
    """帧处理器"""
    
    def adjust_brightness(self, frame: np.ndarray, factor: float) -> np.ndarray:
        """调整亮度"""
        adjusted = frame.astype(float) * factor
        return np.clip(adjusted, 0, 255).astype(np.uint8)
    
    def adjust_contrast(self, frame: np.ndarray, factor: float) -> np.ndarray:
        """调整对比度"""
        mean = np.mean(frame)
        adjusted = (frame.astype(float) - mean) * factor + mean
        return np.clip(adjusted, 0, 255).astype(np.uint8)
    
    def apply_filter(self, frame: np.ndarray, kernel: np.ndarray) -> np.ndarray:
        """应用滤波器"""
        height, width, channels = frame.shape
        kh, kw = kernel.shape
        
        pad_h, pad_w = kh // 2, kw // 2
        
        result = np.zeros_like(frame, dtype=float)
        
        for c in range(channels):
            padded = np.pad(frame[:, :, c], ((pad_h, pad_h), (pad_w, pad_w)), mode='edge')
            
            for i in range(height):
                for j in range(width):
                    region = padded[i:i + kh, j:j + kw]
                    result[i, j, c] = np.sum(region * kernel)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def gaussian_blur(self, frame: np.ndarray, sigma: float = 1.0) -> np.ndarray:
        """高斯模糊"""
        size = int(6 * sigma + 1)
        if size % 2 == 0:
            size += 1
        
        x = np.arange(size) - size // 2
        kernel_1d = np.exp(-x ** 2 / (2 * sigma ** 2))
        kernel_1d = kernel_1d / kernel_1d.sum()
        
        kernel = np.outer(kernel_1d, kernel_1d)
        
        return self.apply_filter(frame, kernel)
    
    def edge_detection(self, frame: np.ndarray) -> np.ndarray:
        """边缘检测"""
        gray = np.dot(frame[..., :3], [0.299, 0.587, 0.114])
        
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
        
        height, width = gray.shape
        padded = np.pad(gray, 1, mode='edge')
        
        edges = np.zeros_like(gray)
        
        for i in range(height):
            for j in range(width):
                region = padded[i:i + 3, j:j + 3]
                gx = np.sum(region * sobel_x)
                gy = np.sum(region * sobel_y)
                edges[i, j] = np.sqrt(gx ** 2 + gy ** 2)
        
        edges = np.clip(edges, 0, 255).astype(np.uint8)
        
        return np.stack([edges] * 3, axis=-1)
    
    def color_inversion(self, frame: np.ndarray) -> np.ndarray:
        """颜色反转"""
        return 255 - frame
    
    def sepia_filter(self, frame: np.ndarray) -> np.ndarray:
        """复古滤镜"""
        sepia_matrix = np.array([
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131]
        ])
        
        result = frame.astype(float) @ sepia_matrix.T
        return np.clip(result, 0, 255).astype(np.uint8)

class FrameSequenceProcessor:
    """帧序列处理器"""
    
    def __init__(self):
        self.processor = FrameProcessor()
    
    def process_all(self, frames: List[np.ndarray], operation: str, **kwargs) -> List[np.ndarray]:
        """处理所有帧"""
        operations = {
            'brightness': lambda f: self.processor.adjust_brightness(f, kwargs.get('factor', 1.2)),
            'contrast': lambda f: self.processor.adjust_contrast(f, kwargs.get('factor', 1.2)),
            'blur': lambda f: self.processor.gaussian_blur(f, kwargs.get('sigma', 1.0)),
            'edge': lambda f: self.processor.edge_detection(f),
            'invert': lambda f: self.processor.color_inversion(f),
            'sepia': lambda f: self.processor.sepia_filter(f),
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
        
        return [operations[operation](frame) for frame in frames]
    
    def compute_frame_difference(self, frame1: np.ndarray, frame2: np.ndarray) -> np.ndarray:
        """计算帧差"""
        diff = np.abs(frame1.astype(float) - frame2.astype(float))
        return diff.astype(np.uint8)
    
    def detect_motion(self, frames: List[np.ndarray], threshold: float = 30.0) -> List[Tuple[int, float]]:
        """检测运动"""
        motion_frames = []
        
        for i in range(1, len(frames)):
            diff = self.compute_frame_difference(frames[i - 1], frames[i])
            motion_score = np.mean(diff)
            
            if motion_score > threshold:
                motion_frames.append((i, motion_score))
        
        return motion_frames
    
    def stabilize(self, frames: List[np.ndarray]) -> List[np.ndarray]:
        """视频稳定"""
        if len(frames) < 2:
            return frames
        
        stabilized = [frames[0]]
        
        for i in range(1, len(frames)):
            offset = self._estimate_motion_offset(frames[i - 1], frames[i])
            
            shifted = self._shift_frame(frames[i], offset)
            stabilized.append(shifted)
        
        return stabilized
    
    def _estimate_motion_offset(self, frame1: np.ndarray, frame2: np.ndarray) -> Tuple[int, int]:
        """估计运动偏移"""
        gray1 = np.dot(frame1[..., :3], [0.299, 0.587, 0.114])
        gray2 = np.dot(frame2[..., :3], [0.299, 0.587, 0.114])
        
        diff = gray1.astype(float) - gray2.astype(float)
        
        offset_x = int(np.mean(np.sign(np.mean(diff, axis=0))))
        offset_y = int(np.mean(np.sign(np.mean(diff, axis=1))))
        
        return (offset_x, offset_y)
    
    def _shift_frame(self, frame: np.ndarray, offset: Tuple[int, int]) -> np.ndarray:
        """平移帧"""
        ox, oy = offset
        shifted = np.roll(frame, ox, axis=1)
        shifted = np.roll(shifted, oy, axis=0)
        return shifted

test_frame = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)

processor = FrameProcessor()

bright = processor.adjust_brightness(test_frame, factor=1.5)
print(f"Brightness adjusted: mean before={test_frame.mean():.1f}, after={bright.mean():.1f}")

blurred = processor.gaussian_blur(test_frame, sigma=2.0)
print(f"Gaussian blur applied")

edges = processor.edge_detection(test_frame)
print(f"Edge detection applied")

frames = [np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8) for _ in range(10)]

seq_processor = FrameSequenceProcessor()

motion = seq_processor.detect_motion(frames, threshold=10.0)
print(f"\nMotion detected in {len(motion)} frames")

processed = seq_processor.process_all(frames, 'brightness', factor=1.2)
print(f"Processed {len(processed)} frames")
```

### 3. 视频编码

#### [概念] 概念解释

视频编码压缩视频数据以减少存储和传输开销。常用编码标准包括 H.264、H.265、VP9 等。编码涉及帧间预测、变换编码、熵编码等技术。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class FrameType(Enum):
    """帧类型"""
    I_FRAME = "I"
    P_FRAME = "P"
    B_FRAME = "B"

@dataclass
class EncodedFrame:
    """编码帧"""
    frame_type: FrameType
    data: np.ndarray
    motion_vectors: Optional[List[Tuple[int, int]]] = None
    reference_frame: Optional[int] = None

class SimpleVideoEncoder:
    """简化视频编码器"""
    
    def __init__(self, block_size: int = 16, search_range: int = 8):
        self.block_size = block_size
        self.search_range = search_range
    
    def encode(self, frames: List[np.ndarray], gop_size: int = 10) -> List[EncodedFrame]:
        """编码视频"""
        encoded = []
        
        for i, frame in enumerate(frames):
            if i % gop_size == 0:
                encoded_frame = self._encode_i_frame(frame, i)
            else:
                prev_frame = frames[i - 1]
                encoded_frame = self._encode_p_frame(frame, prev_frame, i)
            
            encoded.append(encoded_frame)
        
        return encoded
    
    def _encode_i_frame(self, frame: np.ndarray, frame_num: int) -> EncodedFrame:
        """编码 I 帧"""
        compressed = self._compress_frame(frame)
        
        return EncodedFrame(
            frame_type=FrameType.I_FRAME,
            data=compressed,
            frame_number=frame_num
        )
    
    def _encode_p_frame(self, frame: np.ndarray, ref_frame: np.ndarray, 
                        frame_num: int) -> EncodedFrame:
        """编码 P 帧"""
        motion_vectors = []
        residual = np.zeros_like(frame)
        
        height, width = frame.shape[:2]
        
        for y in range(0, height - self.block_size, self.block_size):
            for x in range(0, width - self.block_size, self.block_size):
                block = frame[y:y + self.block_size, x:x + self.block_size]
                
                mv = self._motion_search(block, ref_frame, x, y)
                motion_vectors.append(mv)
                
                ref_x, ref_y = x + mv[0], y + mv[1]
                
                if 0 <= ref_x < width - self.block_size and 0 <= ref_y < height - self.block_size:
                    ref_block = ref_frame[ref_y:ref_y + self.block_size, ref_x:ref_x + self.block_size]
                    residual[y:y + self.block_size, x:x + self.block_size] = block.astype(int) - ref_block.astype(int)
        
        return EncodedFrame(
            frame_type=FrameType.P_FRAME,
            data=residual.astype(np.int16),
            motion_vectors=motion_vectors,
            reference_frame=frame_num - 1
        )
    
    def _motion_search(self, block: np.ndarray, ref_frame: np.ndarray, 
                       x: int, y: int) -> Tuple[int, int]:
        """运动搜索"""
        height, width = ref_frame.shape[:2]
        best_mv = (0, 0)
        best_error = float('inf')
        
        for dy in range(-self.search_range, self.search_range + 1):
            for dx in range(-self.search_range, self.search_range + 1):
                ref_x, ref_y = x + dx, y + dy
                
                if 0 <= ref_x < width - self.block_size and 0 <= ref_y < height - self.block_size:
                    ref_block = ref_frame[ref_y:ref_y + self.block_size, ref_x:ref_x + self.block_size]
                    error = np.sum(np.abs(block.astype(float) - ref_block.astype(float)))
                    
                    if error < best_error:
                        best_error = error
                        best_mv = (dx, dy)
        
        return best_mv
    
    def _compress_frame(self, frame: np.ndarray) -> np.ndarray:
        """压缩帧"""
        return frame
    
    def decode(self, encoded: List[EncodedFrame]) -> List[np.ndarray]:
        """解码视频"""
        decoded = []
        reference_frames: Dict[int, np.ndarray] = {}
        
        for enc_frame in encoded:
            if enc_frame.frame_type == FrameType.I_FRAME:
                frame = self._decompress_frame(enc_frame.data)
                reference_frames[enc_frame.frame_number] = frame
            else:
                ref_frame = reference_frames.get(enc_frame.reference_frame)
                if ref_frame is not None:
                    frame = self._decode_p_frame(enc_frame, ref_frame)
                    reference_frames[enc_frame.frame_number] = frame
                else:
                    frame = np.zeros((240, 320, 3), dtype=np.uint8)
            
            decoded.append(frame)
        
        return decoded
    
    def _decode_p_frame(self, enc_frame: EncodedFrame, ref_frame: np.ndarray) -> np.ndarray:
        """解码 P 帧"""
        height, width = ref_frame.shape[:2]
        frame = ref_frame.copy().astype(int)
        
        block_idx = 0
        for y in range(0, height - self.block_size, self.block_size):
            for x in range(0, width - self.block_size, self.block_size):
                if block_idx < len(enc_frame.motion_vectors):
                    mv = enc_frame.motion_vectors[block_idx]
                    ref_x, ref_y = x + mv[0], y + mv[1]
                    
                    if 0 <= ref_x < width - self.block_size and 0 <= ref_y < height - self.block_size:
                        frame[y:y + self.block_size, x:x + self.block_size] = \
                            ref_frame[ref_y:ref_y + self.block_size, ref_x:ref_x + self.block_size].astype(int)
                
                block_idx += 1
        
        frame = frame + enc_frame.data
        return np.clip(frame, 0, 255).astype(np.uint8)
    
    def _decompress_frame(self, data: np.ndarray) -> np.ndarray:
        """解压帧"""
        return data

class VideoCompressor:
    """视频压缩器"""
    
    def __init__(self, quality: int = 75):
        self.quality = quality
    
    def compress(self, frame: np.ndarray) -> Dict:
        """压缩帧"""
        height, width, channels = frame.shape
        
        yuv = self._rgb_to_yuv(frame)
        
        y_subsampled = yuv[:, :, 0]
        u_subsampled = self._subsample(yuv[:, :, 1], 2)
        v_subsampled = self._subsample(yuv[:, :, 2], 2)
        
        y_quantized = self._quantize(y_subsampled, self.quality)
        u_quantized = self._quantize(u_subsampled, self.quality)
        v_quantized = self._quantize(v_subsampled, self.quality)
        
        return {
            'y': y_quantized,
            'u': u_quantized,
            'v': v_quantized,
            'height': height,
            'width': width,
            'quality': self.quality
        }
    
    def decompress(self, compressed: Dict) -> np.ndarray:
        """解压帧"""
        height = compressed['height']
        width = compressed['width']
        
        y = self._dequantize(compressed['y'], compressed['quality'])
        u = self._upsample(self._dequantize(compressed['u'], compressed['quality']), 2, height, width)
        v = self._upsample(self._dequantize(compressed['v'], compressed['quality']), 2, height, width)
        
        yuv = np.stack([y, u, v], axis=-1)
        
        return self._yuv_to_rgb(yuv)
    
    def _rgb_to_yuv(self, rgb: np.ndarray) -> np.ndarray:
        """RGB 转 YUV"""
        yuv = np.zeros_like(rgb, dtype=float)
        yuv[:, :, 0] = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
        yuv[:, :, 1] = -0.1687 * rgb[:, :, 0] - 0.3313 * rgb[:, :, 1] + 0.5 * rgb[:, :, 2] + 128
        yuv[:, :, 2] = 0.5 * rgb[:, :, 0] - 0.4187 * rgb[:, :, 1] - 0.0813 * rgb[:, :, 2] + 128
        return yuv
    
    def _yuv_to_rgb(self, yuv: np.ndarray) -> np.ndarray:
        """YUV 转 RGB"""
        rgb = np.zeros_like(yuv, dtype=float)
        y, u, v = yuv[:, :, 0], yuv[:, :, 1], yuv[:, :, 2]
        rgb[:, :, 0] = y + 1.402 * (v - 128)
        rgb[:, :, 1] = y - 0.3441 * (u - 128) - 0.7141 * (v - 128)
        rgb[:, :, 2] = y + 1.772 * (u - 128)
        return np.clip(rgb, 0, 255).astype(np.uint8)
    
    def _subsample(self, channel: np.ndarray, factor: int) -> np.ndarray:
        """下采样"""
        return channel[::factor, ::factor]
    
    def _upsample(self, channel: np.ndarray, factor: int, 
                  target_height: int, target_width: int) -> np.ndarray:
        """上采样"""
        result = np.zeros((target_height, target_width))
        for i in range(target_height):
            for j in range(target_width):
                src_i = min(i // factor, channel.shape[0] - 1)
                src_j = min(j // factor, channel.shape[1] - 1)
                result[i, j] = channel[src_i, src_j]
        return result
    
    def _quantize(self, data: np.ndarray, quality: int) -> np.ndarray:
        """量化"""
        step = 256 // quality
        return (data // step) * step
    
    def _dequantize(self, data: np.ndarray, quality: int) -> np.ndarray:
        """反量化"""
        return data

frames = [np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8) for _ in range(5)]

encoder = SimpleVideoEncoder(block_size=16, search_range=4)
encoded = encoder.encode(frames, gop_size=3)

print("Encoded frames:")
for i, enc in enumerate(encoded):
    print(f"  Frame {i}: type={enc.frame_type.value}")

decoded = encoder.decode(encoded)
print(f"\nDecoded {len(decoded)} frames")

compressor = VideoCompressor(quality=50)
compressed = compressor.compress(frames[0])
print(f"\nCompressed frame Y shape: {compressed['y'].shape}")
print(f"Compressed frame U shape: {compressed['u'].shape}")
print(f"Compressed frame V shape: {compressed['v'].shape}")

decompressed = compressor.decompress(compressed)
print(f"Decompressed frame shape: {decompressed.shape}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 视频分析

#### [概念] 概念解释

视频分析从视频中提取有意义的信息，包括目标检测、行为识别、场景理解等。视频分析是计算机视觉的重要应用领域。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class DetectedObject:
    """检测到的对象"""
    label: str
    confidence: float
    bbox: Tuple[int, int, int, int]
    frame_number: int

@dataclass
class TrackedObject:
    """跟踪的对象"""
    track_id: int
    label: str
    trajectory: List[Tuple[int, int, int]]
    last_bbox: Tuple[int, int, int, int]

class VideoAnalyzer:
    """视频分析器"""
    
    def __init__(self):
        self.next_track_id = 0
    
    def detect_objects(self, frame: np.ndarray, frame_number: int) -> List[DetectedObject]:
        """检测对象"""
        objects = []
        
        gray = np.dot(frame[..., :3], [0.299, 0.587, 0.114])
        
        threshold = gray.mean() + gray.std()
        binary = (gray > threshold).astype(np.uint8) * 255
        
        regions = self._find_connected_components(binary)
        
        for region in regions[:5]:
            x, y, w, h = region
            objects.append(DetectedObject(
                label='object',
                confidence=0.8,
                bbox=(x, y, x + w, y + h),
                frame_number=frame_number
            ))
        
        return objects
    
    def _find_connected_components(self, binary: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """查找连通区域"""
        height, width = binary.shape
        visited = np.zeros_like(binary, dtype=bool)
        regions = []
        
        for y in range(height):
            for x in range(width):
                if binary[y, x] > 0 and not visited[y, x]:
                    region = self._flood_fill(binary, visited, x, y)
                    if len(region) > 100:
                        min_x = min(p[0] for p in region)
                        max_x = max(p[0] for p in region)
                        min_y = min(p[1] for p in region)
                        max_y = max(p[1] for p in region)
                        regions.append((min_x, min_y, max_x - min_x, max_y - min_y))
        
        return sorted(regions, key=lambda r: r[2] * r[3], reverse=True)
    
    def _flood_fill(self, binary: np.ndarray, visited: np.ndarray, 
                    start_x: int, start_y: int) -> List[Tuple[int, int]]:
        """泛洪填充"""
        height, width = binary.shape
        region = []
        stack = [(start_x, start_y)]
        
        while stack:
            x, y = stack.pop()
            
            if x < 0 or x >= width or y < 0 or y >= height:
                continue
            if visited[y, x] or binary[y, x] == 0:
                continue
            
            visited[y, x] = True
            region.append((x, y))
            
            stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
        
        return region
    
    def track_objects(self, detections_per_frame: List[List[DetectedObject]]) -> List[TrackedObject]:
        """跟踪对象"""
        active_tracks: Dict[int, TrackedObject] = {}
        completed_tracks: List[TrackedObject] = []
        
        for frame_number, detections in enumerate(detections_per_frame):
            matched = set()
            
            for det in detections:
                best_track_id = None
                best_iou = 0.3
                
                for track_id, track in active_tracks.items():
                    iou = self._compute_iou(det.bbox, track.last_bbox)
                    
                    if iou > best_iou:
                        best_iou = iou
                        best_track_id = track_id
                
                if best_track_id is not None:
                    track = active_tracks[best_track_id]
                    center = self._bbox_center(det.bbox)
                    track.trajectory.append((frame_number, center[0], center[1]))
                    track.last_bbox = det.bbox
                    matched.add(best_track_id)
                else:
                    new_track = TrackedObject(
                        track_id=self.next_track_id,
                        label=det.label,
                        trajectory=[(frame_number, *self._bbox_center(det.bbox))],
                        last_bbox=det.bbox
                    )
                    active_tracks[self.next_track_id] = new_track
                    self.next_track_id += 1
            
            lost_tracks = [tid for tid in active_tracks if tid not in matched]
            for tid in lost_tracks:
                completed_tracks.append(active_tracks.pop(tid))
        
        completed_tracks.extend(active_tracks.values())
        
        return completed_tracks
    
    def _compute_iou(self, bbox1: Tuple[int, int, int, int], 
                     bbox2: Tuple[int, int, int, int]) -> float:
        """计算 IoU"""
        x1_1, y1_1, x2_1, y2_1 = bbox1
        x1_2, y1_2, x2_2, y2_2 = bbox2
        
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i < x1_i or y2_i < y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _bbox_center(self, bbox: Tuple[int, int, int, int]) -> Tuple[int, int]:
        """计算边界框中心"""
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) // 2, (y1 + y2) // 2)

class SceneAnalyzer:
    """场景分析器"""
    
    def __init__(self):
        pass
    
    def detect_scene_change(self, frames: List[np.ndarray], threshold: float = 30.0) -> List[int]:
        """检测场景变化"""
        scene_changes = []
        
        for i in range(1, len(frames)):
            diff = np.abs(frames[i].astype(float) - frames[i - 1].astype(float))
            diff_score = np.mean(diff)
            
            if diff_score > threshold:
                scene_changes.append(i)
        
        return scene_changes
    
    def compute_histogram(self, frame: np.ndarray) -> np.ndarray:
        """计算直方图"""
        hist = np.zeros(256)
        
        for channel in range(3):
            for val in frame[:, :, channel].flatten():
                hist[val] += 1
        
        return hist / hist.sum()
    
    def classify_scene(self, frame: np.ndarray) -> str:
        """分类场景"""
        hist = self.compute_histogram(frame)
        
        brightness = np.sum(hist * np.arange(256))
        
        if brightness < 85:
            return 'dark'
        elif brightness > 170:
            return 'bright'
        else:
            return 'normal'

frames = [np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8) for _ in range(10)]

analyzer = VideoAnalyzer()

detections = []
for i, frame in enumerate(frames):
    dets = analyzer.detect_objects(frame, i)
    detections.append(dets)
    print(f"Frame {i}: detected {len(dets)} objects")

tracks = analyzer.track_objects(detections)
print(f"\nTotal tracks: {len(tracks)}")
for track in tracks[:3]:
    print(f"  Track {track.track_id}: {len(track.trajectory)} points")

scene_analyzer = SceneAnalyzer()
scene_changes = scene_analyzer.detect_scene_change(frames)
print(f"\nScene changes at frames: {scene_changes}")

scene = scene_analyzer.classify_scene(frames[0])
print(f"Scene classification: {scene}")
```

### 2. 视频增强

#### [概念] 概念解释

视频增强改善视频质量，包括去噪、超分辨率、帧插值等。视频增强提升观看体验，是视频处理的重要应用。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class EnhancementConfig:
    """增强配置"""
    denoise_strength: float = 0.5
    sharpen_amount: float = 1.0
    contrast_factor: float = 1.1

class VideoEnhancer:
    """视频增强器"""
    
    def __init__(self, config: EnhancementConfig = None):
        self.config = config or EnhancementConfig()
    
    def denoise(self, frame: np.ndarray) -> np.ndarray:
        """去噪"""
        height, width, channels = frame.shape
        
        result = frame.astype(float).copy()
        
        for c in range(channels):
            padded = np.pad(frame[:, :, c], 1, mode='edge')
            
            for i in range(1, height + 1):
                for j in range(1, width + 1):
                    neighborhood = padded[i - 1:i + 2, j - 1:j + 2].flatten()
                    center = padded[i, j]
                    
                    weights = np.exp(-((neighborhood - center) ** 2) / (2 * (self.config.denoise_strength * 50) ** 2))
                    weights = weights / weights.sum()
                    
                    result[i - 1, j - 1, c] = np.sum(neighborhood * weights)
        
        return result.astype(np.uint8)
    
    def sharpen(self, frame: np.ndarray) -> np.ndarray:
        """锐化"""
        kernel = np.array([
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ]) * self.config.sharpen_amount
        
        kernel[1, 1] = 4 * self.config.sharpen_amount + 1
        
        height, width, channels = frame.shape
        result = np.zeros_like(frame, dtype=float)
        
        for c in range(channels):
            padded = np.pad(frame[:, :, c], 1, mode='edge')
            
            for i in range(height):
                for j in range(width):
                    region = padded[i:i + 3, j:j + 3]
                    result[i, j, c] = np.sum(region * kernel)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def enhance_contrast(self, frame: np.ndarray) -> np.ndarray:
        """增强对比度"""
        mean = np.mean(frame)
        adjusted = (frame.astype(float) - mean) * self.config.contrast_factor + mean
        return np.clip(adjusted, 0, 255).astype(np.uint8)
    
    def enhance_all(self, frames: List[np.ndarray]) -> List[np.ndarray]:
        """增强所有帧"""
        enhanced = []
        
        for frame in frames:
            frame = self.denoise(frame)
            frame = self.sharpen(frame)
            frame = self.enhance_contrast(frame)
            enhanced.append(frame)
        
        return enhanced

class FrameInterpolator:
    """帧插值器"""
    
    def __init__(self):
        pass
    
    def interpolate(self, frame1: np.ndarray, frame2: np.ndarray, 
                    num_frames: int = 1) -> List[np.ndarray]:
        """插值生成中间帧"""
        interpolated = []
        
        for i in range(1, num_frames + 1):
            alpha = i / (num_frames + 1)
            
            mid_frame = (1 - alpha) * frame1.astype(float) + alpha * frame2.astype(float)
            interpolated.append(mid_frame.astype(np.uint8))
        
        return interpolated
    
    def double_fps(self, frames: List[np.ndarray]) -> List[np.ndarray]:
        """帧率翻倍"""
        result = []
        
        for i in range(len(frames) - 1):
            result.append(frames[i])
            
            mid = self.interpolate(frames[i], frames[i + 1], num_frames=1)[0]
            result.append(mid)
        
        result.append(frames[-1])
        
        return result

class VideoUpscaler:
    """视频超分辨率"""
    
    def __init__(self, scale_factor: int = 2):
        self.scale_factor = scale_factor
    
    def upscale(self, frame: np.ndarray) -> np.ndarray:
        """上采样"""
        height, width, channels = frame.shape
        new_height = height * self.scale_factor
        new_width = width * self.scale_factor
        
        result = np.zeros((new_height, new_width, channels), dtype=np.uint8)
        
        for y in range(new_height):
            for x in range(new_width):
                src_y = y / self.scale_factor
                src_x = x / self.scale_factor
                
                y0 = int(src_y)
                x0 = int(src_x)
                y1 = min(y0 + 1, height - 1)
                x1 = min(x0 + 1, width - 1)
                
                fy = src_y - y0
                fx = src_x - x0
                
                for c in range(channels):
                    value = (1 - fx) * (1 - fy) * frame[y0, x0, c] + \
                            fx * (1 - fy) * frame[y0, x1, c] + \
                            (1 - fx) * fy * frame[y1, x0, c] + \
                            fx * fy * frame[y1, x1, c]
                    result[y, x, c] = int(value)
        
        return result
    
    def sharpen_upscaled(self, frame: np.ndarray) -> np.ndarray:
        """锐化上采样结果"""
        kernel = np.array([
            [0, -0.5, 0],
            [-0.5, 3, -0.5],
            [0, -0.5, 0]
        ])
        
        height, width, channels = frame.shape
        result = np.zeros_like(frame, dtype=float)
        
        for c in range(channels):
            padded = np.pad(frame[:, :, c], 1, mode='edge')
            
            for i in range(height):
                for j in range(width):
                    region = padded[i:i + 3, j:j + 3]
                    result[i, j, c] = np.sum(region * kernel)
        
        return np.clip(result, 0, 255).astype(np.uint8)

test_frame = np.random.randint(0, 255, (120, 160, 3), dtype=np.uint8)

enhancer = VideoEnhancer()
denoised = enhancer.denoise(test_frame)
print(f"Denoised frame shape: {denoised.shape}")

sharpened = enhancer.sharpen(test_frame)
print(f"Sharpened frame shape: {sharpened.shape}")

frames = [np.random.randint(0, 255, (120, 160, 3), dtype=np.uint8) for _ in range(5)]

interpolator = FrameInterpolator()
doubled = interpolator.double_fps(frames)
print(f"\nFrame count: {len(frames)} -> {len(doubled)}")

upsampler = VideoUpscaler(scale_factor=2)
upscaled = upsampler.upscale(test_frame)
print(f"\nUpscaled frame shape: {upscaled.shape}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| FFmpeg | 视频处理工具 |
| H.264 | 视频编码标准 |
| H.265/HEVC | 高效视频编码 |
| AV1 | 开源视频编码 |
| Motion Estimation | 运动估计 |
| Rate Control | 码率控制 |
| Video Super Resolution | 视频超分辨率 |
| Video Inpainting | 视频修复 |
| Video Object Segmentation | 视频对象分割 |
| Action Recognition | 动作识别 |
| Video Captioning | 视频描述 |
| Video Summarization | 视频摘要 |
| Slow Motion | 慢动作生成 |
| Video Stabilization | 视频稳定 |
| 360 Video | 全景视频 |

---

## [实战] 核心实战清单

### 实战任务 1：视频监控系统

构建一个简单的视频监控系统。要求：
1. 实现视频帧读取和显示
2. 添加运动检测功能
3. 实现简单的目标跟踪
4. 添加视频增强功能
5. 实现视频存储和回放
