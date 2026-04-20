# 流媒体技术 三层深度学习教程

## [总览] 技术总览

流媒体技术实现音视频的实时传输和播放，包括流媒体协议、编解码、CDN 分发等。流媒体是直播、点播、视频会议等应用的核心技术。

本教程采用三层漏斗学习法：**核心层**聚焦流媒体协议、缓冲机制、自适应码率三大基石；**重点层**深入直播技术和点播技术；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 流媒体协议

#### [概念] 概念解释

流媒体协议定义音视频数据的传输方式，常用协议包括 RTMP、HLS、DASH、WebRTC 等。不同协议适用于不同场景，如直播、点播、实时通信。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import time

class ProtocolType(Enum):
    """协议类型"""
    RTMP = "rtmp"
    HLS = "hls"
    DASH = "dash"
    WEBRTC = "webrtc"

@dataclass
class StreamSegment:
    """流媒体分片"""
    sequence_number: int
    duration: float
    data: bytes
    timestamp: float

@dataclass
class Manifest:
    """播放列表"""
    protocol: ProtocolType
    segments: List[StreamSegment]
    duration: float
    bandwidth: int

class HLSProtocol:
    """HLS 协议实现"""
    
    def __init__(self, segment_duration: float = 6.0):
        self.segment_duration = segment_duration
        self.segments: List[StreamSegment] = []
        self.sequence_number = 0
    
    def create_segment(self, data: bytes, duration: float = None) -> StreamSegment:
        """创建分片"""
        if duration is None:
            duration = self.segment_duration
        
        segment = StreamSegment(
            sequence_number=self.sequence_number,
            duration=duration,
            data=data,
            timestamp=time.time()
        )
        
        self.segments.append(segment)
        self.sequence_number += 1
        
        return segment
    
    def generate_m3u8(self, window_size: int = 5) -> str:
        """生成 M3U8 播放列表"""
        lines = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            f"#EXT-X-TARGETDURATION:{int(self.segment_duration)}",
            f"#EXT-X-MEDIA-SEQUENCE:{max(0, len(self.segments) - window_size)}"
        ]
        
        for segment in self.segments[-window_size:]:
            lines.append(f"#EXTINF:{segment.duration:.1f},")
            lines.append(f"segment_{segment.sequence_number}.ts")
        
        return "\n".join(lines)
    
    def parse_m3u8(self, m3u8_content: str) -> List[Dict]:
        """解析 M3U8"""
        segments = []
        lines = m3u8_content.strip().split("\n")
        
        current_duration = 0
        
        for line in lines:
            if line.startswith("#EXTINF:"):
                duration_str = line.split(":")[1].split(",")[0]
                current_duration = float(duration_str)
            elif not line.startswith("#") and line.strip():
                segments.append({
                    'url': line.strip(),
                    'duration': current_duration
                })
        
        return segments

class DASHProtocol:
    """DASH 协议实现"""
    
    def __init__(self):
        self.representations: Dict[str, List[StreamSegment]] = {}
    
    def add_representation(self, bandwidth: str, segments: List[StreamSegment]):
        """添加码率表示"""
        self.representations[bandwidth] = segments
    
    def generate_mpd(self) -> str:
        """生成 MPD 播放列表"""
        mpd = '''<?xml version="1.0" encoding="UTF-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="dynamic">
  <Period>
'''
        
        for bandwidth, segments in self.representations.items():
            mpd += f'''    <AdaptationSet mimeType="video/mp2t">
      <Representation id="{bandwidth}" bandwidth="{bandwidth}">
'''
            for seg in segments:
                mpd += f'''        <S t="{seg.timestamp}" d="{seg.duration}"/>
'''
            mpd += '''      </Representation>
'''
        
        mpd += '''    </AdaptationSet>
  </Period>
</MPD>'''
        
        return mpd

class RTMPProtocol:
    """RTMP 协议实现（简化版）"""
    
    def __init__(self):
        self.chunk_size = 128
        self.connected = False
    
    def connect(self, url: str) -> bool:
        """连接服务器"""
        self.connected = True
        return True
    
    def create_stream(self) -> int:
        """创建流"""
        return 1
    
    def publish(self, stream_name: str, data: bytes) -> bool:
        """发布流"""
        if not self.connected:
            return False
        
        chunks = self._chunk_data(data)
        return True
    
    def _chunk_data(self, data: bytes) -> List[bytes]:
        """分块数据"""
        chunks = []
        for i in range(0, len(data), self.chunk_size):
            chunks.append(data[i:i + self.chunk_size])
        return chunks

class WebRTCProtocol:
    """WebRTC 协议实现（简化版）"""
    
    def __init__(self):
        self.ice_candidates: List[Dict] = []
        self.local_sdp: str = ""
        self.remote_sdp: str = ""
    
    def create_offer(self) -> str:
        """创建 Offer"""
        self.local_sdp = f"v=0\no=- {time.time()} IN IP4 127.0.0.1\ns=-\nt=0 0\n"
        return self.local_sdp
    
    def create_answer(self, offer: str) -> str:
        """创建 Answer"""
        self.remote_sdp = offer
        self.local_sdp = f"v=0\no=- {time.time()} IN IP4 127.0.0.1\ns=-\nt=0 0\n"
        return self.local_sdp
    
    def add_ice_candidate(self, candidate: Dict):
        """添加 ICE 候选"""
        self.ice_candidates.append(candidate)
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            'bytes_sent': 1000000,
            'bytes_received': 2000000,
            'packets_lost': 5,
            'jitter': 0.02
        }

hls = HLSProtocol(segment_duration=6.0)

for i in range(5):
    segment = hls.create_segment(f"video_data_{i}".encode(), duration=6.0)
    print(f"Created segment {segment.sequence_number}")

m3u8 = hls.generate_m3u8(window_size=3)
print(f"\nM3U8 Playlist:\n{m3u8}")

dash = DASHProtocol()
dash.add_representation("1000000", hls.segments[:3])
dash.add_representation("2000000", hls.segments[:3])

mpd = dash.generate_mpd()
print(f"\nMPD generated ({len(mpd)} bytes)")

webrtc = WebRTCProtocol()
offer = webrtc.create_offer()
print(f"\nWebRTC Offer created ({len(offer)} bytes)")

stats = webrtc.get_stats()
print(f"WebRTC Stats: {stats}")
```

### 2. 缓冲机制

#### [概念] 概念解释

缓冲机制平滑网络波动对播放的影响，包括预缓冲、播放缓冲、追帧策略等。合理的缓冲策略平衡延迟和流畅性。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from collections import deque
import time

@dataclass
class BufferConfig:
    """缓冲配置"""
    min_buffer_size: float = 2.0
    max_buffer_size: float = 10.0
    target_buffer_size: float = 5.0
    segment_duration: float = 2.0

@dataclass
class BufferStats:
    """缓冲统计"""
    current_level: float
    target_level: float
    underruns: int
    overflows: int

class StreamBuffer:
    """流媒体缓冲区"""
    
    def __init__(self, config: BufferConfig = None):
        self.config = config or BufferConfig()
        self.buffer: deque = deque()
        self.current_level = 0.0
        self.underruns = 0
        self.overflows = 0
        self.last_playback_time = time.time()
    
    def append(self, segment: StreamSegment) -> bool:
        """添加分片"""
        if self.current_level >= self.config.max_buffer_size:
            self.overflows += 1
            return False
        
        self.buffer.append(segment)
        self.current_level += segment.duration
        return True
    
    def consume(self) -> Optional[StreamSegment]:
        """消费分片"""
        if not self.buffer:
            self.underruns += 1
            return None
        
        segment = self.buffer.popleft()
        self.current_level -= segment.duration
        return segment
    
    def get_stats(self) -> BufferStats:
        """获取统计"""
        return BufferStats(
            current_level=self.current_level,
            target_level=self.config.target_buffer_size,
            underruns=self.underruns,
            overflows=self.overflows
        )
    
    def needs_buffering(self) -> bool:
        """是否需要缓冲"""
        return self.current_level < self.config.min_buffer_size
    
    def is_healthy(self) -> bool:
        """缓冲区是否健康"""
        return self.current_level >= self.config.target_buffer_size

class AdaptiveBufferController:
    """自适应缓冲控制器"""
    
    def __init__(self, config: BufferConfig = None):
        self.config = config or BufferConfig()
        self.buffer = StreamBuffer(config)
        self.bandwidth_samples: List[float] = []
        self.latency_samples: List[float] = []
    
    def update_bandwidth(self, bandwidth: float):
        """更新带宽样本"""
        self.bandwidth_samples.append(bandwidth)
        if len(self.bandwidth_samples) > 10:
            self.bandwidth_samples.pop(0)
    
    def estimate_bandwidth(self) -> float:
        """估计带宽"""
        if not self.bandwidth_samples:
            return 1000000
        
        weights = np.exp(np.linspace(-1, 0, len(self.bandwidth_samples)))
        weighted = np.average(self.bandwidth_samples, weights=weights)
        return weighted
    
    def adjust_buffer_target(self):
        """调整缓冲目标"""
        if len(self.bandwidth_samples) < 3:
            return
        
        bandwidth_var = np.var(self.bandwidth_samples)
        mean_bandwidth = np.mean(self.bandwidth_samples)
        
        if mean_bandwidth > 0:
            cv = np.sqrt(bandwidth_var) / mean_bandwidth
            
            if cv > 0.3:
                self.config.target_buffer_size = min(15.0, self.config.target_buffer_size * 1.2)
            elif cv < 0.1:
                self.config.target_buffer_size = max(3.0, self.config.target_buffer_size * 0.9)
    
    def get_buffer_health(self) -> Dict:
        """获取缓冲健康状态"""
        stats = self.buffer.get_stats()
        
        health_score = 1.0
        if stats.underruns > 0:
            health_score -= 0.3
        if stats.current_level < self.config.min_buffer_size:
            health_score -= 0.4
        if stats.current_level > self.config.max_buffer_size * 0.9:
            health_score -= 0.2
        
        return {
            'health_score': max(0, health_score),
            'buffer_level': stats.current_level,
            'target_level': stats.target_buffer_size,
            'underruns': stats.underruns,
            'overflows': stats.overflows,
            'estimated_bandwidth': self.estimate_bandwidth()
        }

class PlaybackController:
    """播放控制器"""
    
    def __init__(self, buffer: StreamBuffer):
        self.buffer = buffer
        self.playback_rate = 1.0
        self.is_playing = False
        self.current_time = 0.0
    
    def play(self):
        """开始播放"""
        if self.buffer.needs_buffering():
            return False
        self.is_playing = True
        return True
    
    def pause(self):
        """暂停播放"""
        self.is_playing = False
    
    def update(self, dt: float):
        """更新播放状态"""
        if not self.is_playing:
            return
        
        self.current_time += dt * self.playback_rate
        
        if self.buffer.current_level < 0.5:
            self.playback_rate = 0.9
        elif self.buffer.current_level > self.config.target_buffer_size * 1.5:
            self.playback_rate = 1.1
        else:
            self.playback_rate = 1.0
    
    def seek(self, time: float) -> bool:
        """跳转"""
        self.current_time = time
        return True

config = BufferConfig(min_buffer_size=2.0, max_buffer_size=10.0, target_buffer_size=5.0)
buffer = StreamBuffer(config)

for i in range(5):
    segment = StreamSegment(sequence_number=i, duration=2.0, data=b"", timestamp=time.time())
    success = buffer.append(segment)
    print(f"Added segment {i}: success={success}, buffer_level={buffer.current_level:.1f}s")

stats = buffer.get_stats()
print(f"\nBuffer stats: level={stats.current_level:.1f}s, underruns={stats.underruns}")

controller = AdaptiveBufferController(config)

for bw in [500000, 800000, 1200000, 1000000, 900000]:
    controller.update_bandwidth(bw)

print(f"\nEstimated bandwidth: {controller.estimate_bandwidth():.0f} bps")
print(f"Buffer health: {controller.get_buffer_health()}")
```

### 3. 自适应码率

#### [概念] 概念解释

自适应码率（ABR）根据网络条件动态选择视频质量，平衡画质和流畅性。常用算法包括基于带宽、基于缓冲、混合策略等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class QualityLevel(Enum):
    """质量等级"""
    LOW = "240p"
    MEDIUM = "480p"
    HIGH = "720p"
    ULTRA = "1080p"
    ULTRA_HD = "4k"

@dataclass
class Representation:
    """码率表示"""
    quality: QualityLevel
    bandwidth: int
    resolution: Tuple[int, int]
    codec: str

@dataclass
class ABRStats:
    """ABR 统计"""
    current_quality: QualityLevel
    bandwidth_estimate: float
    buffer_level: float
    quality_switches: int

class ABRAlgorithm:
    """ABR 算法基类"""
    
    def __init__(self, representations: List[Representation]):
        self.representations = sorted(representations, key=lambda r: r.bandwidth)
        self.current_quality_idx = 0
        self.quality_switches = 0
    
    def select_quality(self, bandwidth: float, buffer_level: float) -> Representation:
        """选择质量"""
        raise NotImplementedError

class ThroughputBasedABR(ABRAlgorithm):
    """基于吞吐量的 ABR"""
    
    def __init__(self, representations: List[Representation], safety_factor: float = 0.8):
        super().__init__(representations)
        self.safety_factor = safety_factor
    
    def select_quality(self, bandwidth: float, buffer_level: float) -> Representation:
        """选择质量"""
        safe_bandwidth = bandwidth * self.safety_factor
        
        best_idx = 0
        for i, rep in enumerate(self.representations):
            if rep.bandwidth <= safe_bandwidth:
                best_idx = i
        
        if best_idx != self.current_quality_idx:
            self.quality_switches += 1
            self.current_quality_idx = best_idx
        
        return self.representations[best_idx]

class BufferBasedABR(ABRAlgorithm):
    """基于缓冲的 ABR"""
    
    def __init__(self, representations: List[Representation], 
                 min_buffer: float = 5.0, max_buffer: float = 20.0):
        super().__init__(representations)
        self.min_buffer = min_buffer
        self.max_buffer = max_buffer
    
    def select_quality(self, bandwidth: float, buffer_level: float) -> Representation:
        """选择质量"""
        n_qualities = len(self.representations)
        
        buffer_ratio = (buffer_level - self.min_buffer) / (self.max_buffer - self.min_buffer)
        buffer_ratio = np.clip(buffer_ratio, 0, 1)
        
        target_idx = int(buffer_ratio * (n_qualities - 1))
        
        if target_idx != self.current_quality_idx:
            self.quality_switches += 1
            self.current_quality_idx = target_idx
        
        return self.representations[target_idx]

class HybridABR(ABRAlgorithm):
    """混合 ABR"""
    
    def __init__(self, representations: List[Representation]):
        super().__init__(representations)
        self.throughput_abr = ThroughputBasedABR(representations)
        self.buffer_abr = BufferBasedABR(representations)
    
    def select_quality(self, bandwidth: float, buffer_level: float) -> Representation:
        """选择质量"""
        throughput_quality = self.throughput_abr.select_quality(bandwidth, buffer_level)
        buffer_quality = self.buffer_abr.select_quality(bandwidth, buffer_level)
        
        tp_idx = self.representations.index(throughput_quality)
        buf_idx = self.representations.index(buffer_quality)
        
        if buffer_level < 5.0:
            selected_idx = min(tp_idx, buf_idx)
        else:
            selected_idx = min(tp_idx, buf_idx + 1)
        
        selected_idx = min(selected_idx, len(self.representations) - 1)
        
        if selected_idx != self.current_quality_idx:
            self.quality_switches += 1
            self.current_quality_idx = selected_idx
        
        return self.representations[selected_idx]

class ABRController:
    """ABR 控制器"""
    
    def __init__(self, algorithm: ABRAlgorithm):
        self.algorithm = algorithm
        self.bandwidth_samples: List[float] = []
        self.current_bandwidth = 0.0
    
    def update_bandwidth(self, sample: float):
        """更新带宽"""
        self.bandwidth_samples.append(sample)
        if len(self.bandwidth_samples) > 10:
            self.bandwidth_samples.pop(0)
        
        self.current_bandwidth = np.mean(self.bandwidth_samples)
    
    def select_representation(self, buffer_level: float) -> Representation:
        """选择表示"""
        return self.algorithm.select_quality(self.current_bandwidth, buffer_level)
    
    def get_stats(self, buffer_level: float) -> ABRStats:
        """获取统计"""
        current = self.algorithm.representations[self.algorithm.current_quality_idx]
        
        return ABRStats(
            current_quality=current.quality,
            bandwidth_estimate=self.current_bandwidth,
            buffer_level=buffer_level,
            quality_switches=self.algorithm.quality_switches
        )

representations = [
    Representation(QualityLevel.LOW, 500000, (426, 240), "h264"),
    Representation(QualityLevel.MEDIUM, 1000000, (854, 480), "h264"),
    Representation(QualityLevel.HIGH, 2500000, (1280, 720), "h264"),
    Representation(QualityLevel.ULTRA, 5000000, (1920, 1080), "h264"),
]

throughput_abr = ThroughputBasedABR(representations)
buffer_abr = BufferBasedABR(representations)
hybrid_abr = HybridABR(representations)

test_cases = [
    (800000, 3.0),
    (2000000, 8.0),
    (4000000, 15.0),
]

print("ABR Quality Selection:")
for bandwidth, buffer_level in test_cases:
    tp_q = throughput_abr.select_quality(bandwidth, buffer_level)
    buf_q = buffer_abr.select_quality(bandwidth, buffer_level)
    hyb_q = hybrid_abr.select_quality(bandwidth, buffer_level)
    
    print(f"  BW={bandwidth/1000000:.1f}Mbps, Buffer={buffer_level:.0f}s:")
    print(f"    Throughput: {tp_q.quality.value}")
    print(f"    Buffer: {buf_q.quality.value}")
    print(f"    Hybrid: {hyb_q.quality.value}")

controller = ABRController(hybrid_abr)
for bw in [500000, 1000000, 2000000, 3000000]:
    controller.update_bandwidth(bw)

rep = controller.select_representation(10.0)
print(f"\nSelected representation: {rep.quality.value} @ {rep.bandwidth/1000000:.1f}Mbps")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 直播技术

#### [概念] 概念解释

直播技术实现音视频的实时传输，包括推流、转码、分发、拉流等环节。直播对延迟和稳定性要求高，常用协议包括 RTMP、WebRTC。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from collections import deque
import time

@dataclass
class LiveStreamConfig:
    """直播配置"""
    push_url: str
    pull_url: str
    bitrate: int = 2000000
    fps: int = 30
    resolution: tuple = (1280, 720)
    keyframe_interval: int = 2

@dataclass
class StreamStats:
    """流统计"""
    fps: float
    bitrate: int
    latency: float
    dropped_frames: int
    timestamp: float

class LivePusher:
    """直播推流器"""
    
    def __init__(self, config: LiveStreamConfig):
        self.config = config
        self.is_pushing = False
        self.frame_count = 0
        self.dropped_frames = 0
        self.start_time: Optional[float] = None
        self.stats_history: deque = deque(maxlen=100)
    
    def start(self) -> bool:
        """开始推流"""
        self.is_pushing = True
        self.start_time = time.time()
        self.frame_count = 0
        return True
    
    def stop(self):
        """停止推流"""
        self.is_pushing = False
    
    def push_frame(self, frame_data: bytes) -> bool:
        """推送帧"""
        if not self.is_pushing:
            return False
        
        self.frame_count += 1
        
        return True
    
    def push_audio(self, audio_data: bytes) -> bool:
        """推送音频"""
        if not self.is_pushing:
            return False
        
        return True
    
    def get_stats(self) -> StreamStats:
        """获取统计"""
        elapsed = time.time() - self.start_time if self.start_time else 1
        fps = self.frame_count / elapsed if elapsed > 0 else 0
        
        stats = StreamStats(
            fps=fps,
            bitrate=self.config.bitrate,
            latency=0.5,
            dropped_frames=self.dropped_frames,
            timestamp=time.time()
        )
        
        self.stats_history.append(stats)
        return stats

class LivePlayer:
    """直播播放器"""
    
    def __init__(self, config: LiveStreamConfig):
        self.config = config
        self.is_playing = False
        self.buffer: deque = deque(maxlen=30)
        self.current_latency = 0.0
        self.start_time: Optional[float] = None
    
    def start(self) -> bool:
        """开始播放"""
        self.is_playing = True
        self.start_time = time.time()
        return True
    
    def stop(self):
        """停止播放"""
        self.is_playing = False
    
    def receive_segment(self, segment: bytes, timestamp: float):
        """接收分片"""
        if not self.is_playing:
            return
        
        self.buffer.append({
            'data': segment,
            'timestamp': timestamp,
            'received_at': time.time()
        })
    
    def get_frame(self) -> Optional[bytes]:
        """获取帧"""
        if not self.buffer:
            return None
        
        item = self.buffer.popleft()
        self.current_latency = time.time() - item['timestamp']
        
        return item['data']
    
    def get_latency(self) -> float:
        """获取延迟"""
        return self.current_latency

class Transcoder:
    """转码器"""
    
    def __init__(self):
        self.output_configs: List[Dict] = []
    
    def add_output(self, resolution: tuple, bitrate: int, codec: str = "h264"):
        """添加输出配置"""
        self.output_configs.append({
            'resolution': resolution,
            'bitrate': bitrate,
            'codec': codec
        })
    
    def transcode(self, input_data: bytes) -> List[bytes]:
        """转码"""
        outputs = []
        
        for config in self.output_configs:
            output = self._encode(input_data, config)
            outputs.append(output)
        
        return outputs
    
    def _encode(self, data: bytes, config: Dict) -> bytes:
        """编码"""
        return data

class LiveStreamManager:
    """直播流管理器"""
    
    def __init__(self):
        self.streams: Dict[str, LivePusher] = {}
        self.players: Dict[str, List[LivePlayer]] = {}
    
    def create_stream(self, stream_id: str, config: LiveStreamConfig) -> LivePusher:
        """创建直播流"""
        pusher = LivePusher(config)
        self.streams[stream_id] = pusher
        self.players[stream_id] = []
        return pusher
    
    def get_stream(self, stream_id: str) -> Optional[LivePusher]:
        """获取直播流"""
        return self.streams.get(stream_id)
    
    def add_player(self, stream_id: str, player: LivePlayer):
        """添加播放器"""
        if stream_id in self.players:
            self.players[stream_id].append(player)
    
    def broadcast(self, stream_id: str, segment: bytes, timestamp: float):
        """广播分片"""
        if stream_id in self.players:
            for player in self.players[stream_id]:
                player.receive_segment(segment, timestamp)
    
    def get_stream_count(self) -> int:
        """获取流数量"""
        return len(self.streams)
    
    def get_viewer_count(self, stream_id: str) -> int:
        """获取观众数量"""
        return len(self.players.get(stream_id, []))

config = LiveStreamConfig(
    push_url="rtmp://localhost/live/stream",
    pull_url="http://localhost/live/stream.m3u8",
    bitrate=2000000,
    fps=30
)

pusher = LivePusher(config)
pusher.start()

for i in range(10):
    pusher.push_frame(f"frame_{i}".encode())

stats = pusher.get_stats()
print(f"Pusher stats: fps={stats.fps:.1f}, dropped={stats.dropped_frames}")

player = LivePlayer(config)
player.start()

for i in range(5):
    player.receive_segment(f"segment_{i}".encode(), time.time())

frame = player.get_frame()
print(f"Received frame, latency={player.get_latency():.3f}s")

manager = LiveStreamManager()
stream = manager.create_stream("live_1", config)
print(f"\nActive streams: {manager.get_stream_count()}")
```

### 2. 点播技术

#### [概念] 概念解释

点播技术实现音视频的按需播放，包括内容存储、索引构建、分片传输等。点播对画质和交互性要求高，常用协议包括 HLS、DASH。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from collections import OrderedDict
import time

@dataclass
class VODMetadata:
    """点播元数据"""
    video_id: str
    title: str
    duration: float
    representations: List[Dict]
    segments: List[Dict]

@dataclass
class VODConfig:
    """点播配置"""
    segment_duration: float = 6.0
    cache_size: int = 100
    preload_segments: int = 3

class VODServer:
    """点播服务器"""
    
    def __init__(self, config: VODConfig = None):
        self.config = config or VODConfig()
        self.videos: Dict[str, VODMetadata] = {}
        self.segment_cache: OrderedDict = OrderedDict()
    
    def add_video(self, metadata: VODMetadata):
        """添加视频"""
        self.videos[metadata.video_id] = metadata
    
    def get_video(self, video_id: str) -> Optional[VODMetadata]:
        """获取视频"""
        return self.videos.get(video_id)
    
    def get_segment(self, video_id: str, quality: str, 
                    segment_number: int) -> Optional[bytes]:
        """获取分片"""
        cache_key = f"{video_id}_{quality}_{segment_number}"
        
        if cache_key in self.segment_cache:
            self.segment_cache.move_to_end(cache_key)
            return self.segment_cache[cache_key]
        
        video = self.videos.get(video_id)
        if not video:
            return None
        
        segment_data = f"segment_{video_id}_{quality}_{segment_number}".encode()
        
        if len(self.segment_cache) >= self.config.cache_size:
            self.segment_cache.popitem(last=False)
        
        self.segment_cache[cache_key] = segment_data
        
        return segment_data
    
    def get_manifest(self, video_id: str, protocol: str = "hls") -> Optional[str]:
        """获取播放列表"""
        video = self.videos.get(video_id)
        if not video:
            return None
        
        if protocol == "hls":
            return self._generate_hls_manifest(video)
        else:
            return self._generate_dash_manifest(video)
    
    def _generate_hls_manifest(self, video: VODMetadata) -> str:
        """生成 HLS 播放列表"""
        lines = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            f"#EXT-X-TARGETDURATION:{int(self.config.segment_duration)}",
        ]
        
        for seg in video.segments:
            lines.append(f"#EXTINF:{seg['duration']:.1f},")
            lines.append(seg['url'])
        
        lines.append("#EXT-X-ENDLIST")
        
        return "\n".join(lines)
    
    def _generate_dash_manifest(self, video: VODMetadata) -> str:
        """生成 DASH 播放列表"""
        return f"<?xml version='1.0'?><MPD><Period duration='{video.duration}'></Period></MPD>"

class VODPlayer:
    """点播播放器"""
    
    def __init__(self, config: VODConfig = None):
        self.config = config or VODConfig()
        self.current_video: Optional[VODMetadata] = None
        self.current_quality: str = "720p"
        self.current_segment: int = 0
        self.playback_position: float = 0.0
        self.is_playing: bool = False
        self.buffer: List[bytes] = []
    
    def load_video(self, video: VODMetadata):
        """加载视频"""
        self.current_video = video
        self.current_segment = 0
        self.playback_position = 0.0
    
    def play(self):
        """播放"""
        if self.current_video:
            self.is_playing = True
            self._preload_segments()
    
    def pause(self):
        """暂停"""
        self.is_playing = False
    
    def seek(self, position: float):
        """跳转"""
        if not self.current_video:
            return
        
        self.playback_position = position
        self.current_segment = int(position / self.config.segment_duration)
        self.buffer.clear()
        self._preload_segments()
    
    def _preload_segments(self):
        """预加载分片"""
        for i in range(self.config.preload_segments):
            seg_num = self.current_segment + i
            if seg_num < len(self.current_video.segments):
                segment_data = f"preloaded_segment_{seg_num}".encode()
                self.buffer.append(segment_data)
    
    def get_current_segment(self) -> Optional[bytes]:
        """获取当前分片"""
        if self.buffer:
            return self.buffer.pop(0)
        return None
    
    def get_playback_info(self) -> Dict:
        """获取播放信息"""
        return {
            'video_id': self.current_video.video_id if self.current_video else None,
            'position': self.playback_position,
            'duration': self.current_video.duration if self.current_video else 0,
            'quality': self.current_quality,
            'is_playing': self.is_playing,
            'buffer_size': len(self.buffer)
        }

class VODCache:
    """点播缓存"""
    
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.cache: OrderedDict = OrderedDict()
        self.hit_count = 0
        self.miss_count = 0
    
    def get(self, key: str) -> Optional[bytes]:
        """获取缓存"""
        if key in self.cache:
            self.cache.move_to_end(key)
            self.hit_count += 1
            return self.cache[key]
        
        self.miss_count += 1
        return None
    
    def put(self, key: str, data: bytes):
        """放入缓存"""
        if len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        
        self.cache[key] = data
    
    def get_hit_rate(self) -> float:
        """获取命中率"""
        total = self.hit_count + self.miss_count
        return self.hit_count / total if total > 0 else 0.0

metadata = VODMetadata(
    video_id="video_001",
    title="Sample Video",
    duration=120.0,
    representations=[
        {'quality': '720p', 'bitrate': 2000000},
        {'quality': '480p', 'bitrate': 1000000},
    ],
    segments=[
        {'number': i, 'duration': 6.0, 'url': f'segment_{i}.ts'}
        for i in range(20)
    ]
)

server = VODServer()
server.add_video(metadata)

manifest = server.get_manifest("video_001", "hls")
print(f"HLS Manifest ({len(manifest)} bytes)")

segment = server.get_segment("video_001", "720p", 0)
print(f"Segment 0: {segment[:30]}...")

player = VODPlayer()
player.load_video(metadata)
player.play()

info = player.get_playback_info()
print(f"\nPlayback info: position={info['position']:.1f}s, buffer={info['buffer_size']}")

player.seek(60.0)
info = player.get_playback_info()
print(f"After seek: position={info['position']:.1f}s, segment={player.current_segment}")

cache = VODCache(max_size=10)
for i in range(15):
    cache.put(f"key_{i}", f"data_{i}".encode())

print(f"\nCache hit rate: {cache.get_hit_rate():.2%}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| CDN | 内容分发网络 |
| Edge Computing | 边缘计算 |
| Low Latency HLS | 低延迟 HLS |
| CMAF | 公共媒体应用格式 |
| SRT | 安全可靠传输 |
| RIST | 可靠互联网流传输 |
| NDI | 网络设备接口 |
| SRT Live Server | SRT 直播服务器 |
| Media Server | 流媒体服务器 |
| Wowza | 流媒体平台 |
| Nginx-RTMP | RTMP 模块 |
| FFmpeg Streaming | FFmpeg 推流 |
| OBS | 开源直播软件 |
| WebRTC SFU | 选择性转发单元 |
| WebRTC MCU | 多点控制单元 |

---

## [实战] 核心实战清单

### 实战任务 1：简易直播系统

构建一个简易直播系统。要求：
1. 实现 RTMP 推流接收
2. 实现 HLS 分片生成
3. 实现自适应码率选择
4. 添加缓冲管理
5. 实现播放器客户端
