# 音频处理 三层深度学习教程

## [总览] 技术总览

音频处理分析和操作声音信号，包括语音识别、音乐分析、音频增强等。音频处理是多媒体技术的重要组成部分，广泛应用于语音助手、音乐推荐、通信等领域。

本教程采用三层漏斗学习法：**核心层**聚焦音频特征提取、音频信号处理、语音识别基础三大基石；**重点层**深入音频分类和语音合成；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 音频特征提取

#### [概念] 概念解释

音频特征提取将原始音频信号转换为有意义的特征表示。常用特征包括时域特征（能量、过零率）、频域特征（频谱、MFCC）。特征提取是音频分析的基础。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class AudioFeatures:
    """音频特征"""
    mfcc: np.ndarray
    energy: np.ndarray
    zero_crossing_rate: np.ndarray
    spectral_centroid: np.ndarray

class AudioFeatureExtractor:
    """音频特征提取器"""
    
    def __init__(self, sample_rate: int = 16000, n_mfcc: int = 13, 
                 n_fft: int = 512, hop_length: int = 160):
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.n_fft = n_fft
        self.hop_length = hop_length
    
    def extract_features(self, audio: np.ndarray) -> AudioFeatures:
        """提取所有特征"""
        mfcc = self.extract_mfcc(audio)
        energy = self.extract_energy(audio)
        zcr = self.extract_zero_crossing_rate(audio)
        spectral_centroid = self.extract_spectral_centroid(audio)
        
        return AudioFeatures(
            mfcc=mfcc,
            energy=energy,
            zero_crossing_rate=zcr,
            spectral_centroid=spectral_centroid
        )
    
    def extract_mfcc(self, audio: np.ndarray) -> np.ndarray:
        """提取 MFCC 特征"""
        frames = self._frame_audio(audio)
        
        window = np.hamming(self.n_fft)
        windowed_frames = frames * window
        
        spectrum = np.abs(np.fft.rfft(windowed_frames, axis=1))
        
        mel_filterbank = self._create_mel_filterbank()
        mel_spectrum = spectrum @ mel_filterbank.T
        
        mel_spectrum = np.where(mel_spectrum == 0, np.finfo(float).eps, mel_spectrum)
        log_mel_spectrum = np.log(mel_spectrum)
        
        mfcc = self._dct(log_mel_spectrum)[:, :self.n_mfcc]
        
        return mfcc
    
    def extract_energy(self, audio: np.ndarray) -> np.ndarray:
        """提取能量特征"""
        frames = self._frame_audio(audio)
        energy = np.sum(frames ** 2, axis=1)
        return energy
    
    def extract_zero_crossing_rate(self, audio: np.ndarray) -> np.ndarray:
        """提取过零率"""
        frames = self._frame_audio(audio)
        zcr = np.sum(np.abs(np.diff(np.sign(frames), axis=1)), axis=1) / (2 * frames.shape[1])
        return zcr
    
    def extract_spectral_centroid(self, audio: np.ndarray) -> np.ndarray:
        """提取频谱质心"""
        frames = self._frame_audio(audio)
        
        window = np.hamming(self.n_fft)
        windowed_frames = frames * window
        
        spectrum = np.abs(np.fft.rfft(windowed_frames, axis=1))
        
        frequencies = np.fft.rfftfreq(self.n_fft, 1 / self.sample_rate)
        
        centroid = np.sum(spectrum * frequencies, axis=1) / (np.sum(spectrum, axis=1) + 1e-10)
        
        return centroid
    
    def _frame_audio(self, audio: np.ndarray) -> np.ndarray:
        """分帧"""
        n_frames = 1 + (len(audio) - self.n_fft) // self.hop_length
        
        frames = np.zeros((n_frames, self.n_fft))
        for i in range(n_frames):
            start = i * self.hop_length
            frames[i] = audio[start:start + self.n_fft]
        
        return frames
    
    def _create_mel_filterbank(self, n_filters: int = 26) -> np.ndarray:
        """创建 Mel 滤波器组"""
        low_freq = 0
        high_freq = self.sample_rate / 2
        
        low_mel = self._hz_to_mel(low_freq)
        high_mel = self._hz_to_mel(high_freq)
        
        mel_points = np.linspace(low_mel, high_mel, n_filters + 2)
        hz_points = self._mel_to_hz(mel_points)
        
        bin_points = np.floor((self.n_fft + 1) * hz_points / self.sample_rate).astype(int)
        
        filterbank = np.zeros((n_filters, self.n_fft // 2 + 1))
        
        for i in range(n_filters):
            for j in range(bin_points[i], bin_points[i + 1]):
                if j < filterbank.shape[1]:
                    filterbank[i, j] = (j - bin_points[i]) / (bin_points[i + 1] - bin_points[i])
            for j in range(bin_points[i + 1], bin_points[i + 2]):
                if j < filterbank.shape[1]:
                    filterbank[i, j] = (bin_points[i + 2] - j) / (bin_points[i + 2] - bin_points[i + 1])
        
        return filterbank
    
    def _hz_to_mel(self, hz: float) -> float:
        """Hz 转 Mel"""
        return 2595 * np.log10(1 + hz / 700)
    
    def _mel_to_hz(self, mel: float) -> float:
        """Mel 转 Hz"""
        return 700 * (10 ** (mel / 2595) - 1)
    
    def _dct(self, x: np.ndarray) -> np.ndarray:
        """离散余弦变换"""
        n = x.shape[1]
        dct_matrix = np.zeros((n, n))
        
        for k in range(n):
            for i in range(n):
                dct_matrix[k, i] = np.cos(np.pi * k * (2 * i + 1) / (2 * n))
        
        dct_matrix *= np.sqrt(2 / n)
        dct_matrix[0] *= 1 / np.sqrt(2)
        
        return x @ dct_matrix.T

sample_rate = 16000
duration = 1.0
t = np.linspace(0, duration, int(sample_rate * duration))
audio = np.sin(2 * np.pi * 440 * t) + 0.5 * np.sin(2 * np.pi * 880 * t)

extractor = AudioFeatureExtractor(sample_rate=sample_rate)
features = extractor.extract_features(audio)

print(f"MFCC shape: {features.mfcc.shape}")
print(f"Energy shape: {features.energy.shape}")
print(f"Zero Crossing Rate shape: {features.zero_crossing_rate.shape}")
print(f"Spectral Centroid shape: {features.spectral_centroid.shape}")

print(f"\nMean MFCC: {features.mfcc.mean(axis=0)[:5]}")
print(f"Mean Energy: {features.energy.mean():.4f}")
print(f"Mean ZCR: {features.zero_crossing_rate.mean():.4f}")
```

### 2. 音频信号处理

#### [概念] 概念解释

音频信号处理对音频进行变换和增强，包括滤波、降噪、混响、均衡等。信号处理改善音频质量，为后续分析提供更好的输入。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class FilterConfig:
    """滤波器配置"""
    cutoff_freq: float
    filter_type: str
    order: int = 4

class AudioSignalProcessor:
    """音频信号处理器"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
    
    def normalize(self, audio: np.ndarray, target_db: float = -20.0) -> np.ndarray:
        """归一化音频"""
        rms = np.sqrt(np.mean(audio ** 2))
        current_db = 20 * np.log10(rms + 1e-10)
        gain = 10 ** ((target_db - current_db) / 20)
        return audio * gain
    
    def low_pass_filter(self, audio: np.ndarray, cutoff: float, order: int = 4) -> np.ndarray:
        """低通滤波"""
        nyquist = self.sample_rate / 2
        normalized_cutoff = cutoff / nyquist
        
        b, a = self._butterworth_coefficients(normalized_cutoff, 'low', order)
        
        return self._apply_filter(audio, b, a)
    
    def high_pass_filter(self, audio: np.ndarray, cutoff: float, order: int = 4) -> np.ndarray:
        """高通滤波"""
        nyquist = self.sample_rate / 2
        normalized_cutoff = cutoff / nyquist
        
        b, a = self._butterworth_coefficients(normalized_cutoff, 'high', order)
        
        return self._apply_filter(audio, b, a)
    
    def band_pass_filter(self, audio: np.ndarray, low_cutoff: float, 
                         high_cutoff: float, order: int = 4) -> np.ndarray:
        """带通滤波"""
        nyquist = self.sample_rate / 2
        low = low_cutoff / nyquist
        high = high_cutoff / nyquist
        
        b, a = self._butterworth_coefficients([low, high], 'band', order)
        
        return self._apply_filter(audio, b, a)
    
    def _butterworth_coefficients(self, cutoff, filter_type: str, order: int) -> Tuple[np.ndarray, np.ndarray]:
        """计算 Butterworth 滤波器系数"""
        if filter_type == 'low':
            b = np.zeros(order + 1)
            a = np.zeros(order + 1)
            
            b[0] = 1.0
            for i in range(1, order + 1):
                b[i] = b[i - 1] * (order - i + 1) / i
            
            b = b * (cutoff ** order)
            
            a[0] = 1.0
            for i in range(1, order + 1):
                a[i] = a[i - 1] * (cutoff - 1) * (order - i + 1) / i
            
            norm = np.sum(np.abs(b))
            b = b / norm
            a = a / norm
        
        else:
            b = np.array([0.5, 0.5])
            a = np.array([1.0, -0.5 * (2 * cutoff - 1)])
        
        return b, a
    
    def _apply_filter(self, audio: np.ndarray, b: np.ndarray, a: np.ndarray) -> np.ndarray:
        """应用滤波器"""
        output = np.zeros_like(audio)
        
        for i in range(len(audio)):
            output[i] = b[0] * audio[i]
            
            for j in range(1, len(b)):
                if i - j >= 0:
                    output[i] += b[j] * audio[i - j]
            
            for j in range(1, len(a)):
                if i - j >= 0:
                    output[i] -= a[j] * output[i - j]
        
        return output
    
    def noise_reduction(self, audio: np.ndarray, noise_threshold: float = 0.02) -> np.ndarray:
        """降噪"""
        frame_size = 1024
        hop_size = 512
        
        frames = []
        for i in range(0, len(audio) - frame_size, hop_size):
            frames.append(audio[i:i + frame_size])
        
        frames = np.array(frames)
        
        spectrum = np.fft.rfft(frames, axis=1)
        magnitude = np.abs(spectrum)
        phase = np.angle(spectrum)
        
        noise_mask = magnitude < noise_threshold * np.max(magnitude)
        magnitude[noise_mask] *= 0.1
        
        cleaned_spectrum = magnitude * np.exp(1j * phase)
        cleaned_frames = np.fft.irfft(cleaned_spectrum, axis=1)
        
        output = np.zeros(len(audio))
        for i, frame in enumerate(cleaned_frames):
            start = i * hop_size
            output[start:start + frame_size] += frame * np.hamming(frame_size)
        
        return output
    
    def add_reverb(self, audio: np.ndarray, delay_ms: float = 50, 
                   decay: float = 0.5, num_reflections: int = 5) -> np.ndarray:
        """添加混响"""
        delay_samples = int(delay_ms * self.sample_rate / 1000)
        
        output = audio.copy()
        
        for i in range(1, num_reflections + 1):
            delay = delay_samples * i
            amplitude = decay ** i
            
            delayed = np.zeros_like(audio)
            delayed[delay:] = audio[:-delay] * amplitude
            
            output += delayed
        
        return output / (1 + sum(decay ** i for i in range(1, num_reflections + 1)))

sample_rate = 16000
duration = 1.0
t = np.linspace(0, duration, int(sample_rate * duration))
audio = np.sin(2 * np.pi * 440 * t) + 0.3 * np.random.randn(len(t))

processor = AudioSignalProcessor(sample_rate=sample_rate)

normalized = processor.normalize(audio)
print(f"Original RMS: {np.sqrt(np.mean(audio ** 2)):.4f}")
print(f"Normalized RMS: {np.sqrt(np.mean(normalized ** 2)):.4f}")

filtered = processor.low_pass_filter(audio, cutoff=1000)
print(f"\nLow-pass filter applied (cutoff=1000Hz)")

denoised = processor.noise_reduction(audio)
print(f"Noise reduction applied")

reverb = processor.add_reverb(audio[:sample_rate], delay_ms=50, decay=0.5)
print(f"Reverb added (delay=50ms, decay=0.5)")
```

### 3. 语音识别基础

#### [概念] 概念解释

语音识别将音频转换为文本，是音频处理的核心应用。基础方法包括声学模型、语言模型和解码器。现代方法使用端到端深度学习模型。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class RecognitionResult:
    """识别结果"""
    text: str
    confidence: float
    word_timestamps: List[Tuple[str, float, float]]

class SimpleSpeechRecognizer:
    """简化版语音识别器"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.feature_extractor = AudioFeatureExtractor(sample_rate)
        
        self.phoneme_models: Dict[str, np.ndarray] = {}
        self.vocabulary: List[str] = []
        self.word_to_phonemes: Dict[str, List[str]] = {}
    
    def build_phoneme_models(self, phoneme_examples: Dict[str, List[np.ndarray]]):
        """构建音素模型"""
        for phoneme, examples in phoneme_examples.items():
            all_features = []
            for audio in examples:
                features = self.feature_extractor.extract_mfcc(audio)
                all_features.append(features.mean(axis=0))
            
            self.phoneme_models[phoneme] = {
                'mean': np.mean(all_features, axis=0),
                'std': np.std(all_features, axis=0) + 1e-10
            }
    
    def recognize(self, audio: np.ndarray) -> RecognitionResult:
        """识别语音"""
        mfcc = self.feature_extractor.extract_mfcc(audio)
        
        phoneme_sequence = self._decode_phonemes(mfcc)
        
        text = self._phonemes_to_text(phoneme_sequence)
        
        confidence = self._compute_confidence(mfcc, phoneme_sequence)
        
        word_timestamps = self._estimate_word_timestamps(text, len(audio))
        
        return RecognitionResult(
            text=text,
            confidence=confidence,
            word_timestamps=word_timestamps
        )
    
    def _decode_phonemes(self, mfcc: np.ndarray) -> List[str]:
        """解码音素序列"""
        phoneme_sequence = []
        
        for frame in mfcc:
            best_phoneme = None
            best_score = float('-inf')
            
            for phoneme, model in self.phoneme_models.items():
                score = -np.sum(((frame - model['mean']) / model['std']) ** 2)
                
                if score > best_score:
                    best_score = score
                    best_phoneme = phoneme
            
            if best_phoneme:
                phoneme_sequence.append(best_phoneme)
        
        return self._merge_repeated(phoneme_sequence)
    
    def _merge_repeated(self, sequence: List[str]) -> List[str]:
        """合并重复音素"""
        if not sequence:
            return []
        
        merged = [sequence[0]]
        for phoneme in sequence[1:]:
            if phoneme != merged[-1]:
                merged.append(phoneme)
        
        return merged
    
    def _phonemes_to_text(self, phonemes: List[str]) -> str:
        """音素转文本"""
        phoneme_to_char = {
            'sil': '',
            'aa': 'a', 'ae': 'a', 'ah': 'a',
            'b': 'b', 'ch': 'ch', 'd': 'd',
            'eh': 'e', 'er': 'er', 'ey': 'ay',
            'f': 'f', 'g': 'g', 'hh': 'h',
            'ih': 'i', 'iy': 'ee', 'jh': 'j',
            'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'ng': 'ng', 'ow': 'o',
            'oy': 'oy', 'p': 'p', 'r': 'r',
            's': 's', 'sh': 'sh', 't': 't',
            'th': 'th', 'uh': 'u', 'uw': 'oo',
            'v': 'v', 'w': 'w', 'y': 'y', 'z': 'z',
        }
        
        chars = [phoneme_to_char.get(p, '') for p in phonemes]
        return ''.join(chars)
    
    def _compute_confidence(self, mfcc: np.ndarray, phonemes: List[str]) -> float:
        """计算置信度"""
        if not phonemes or len(phonemes) != len(mfcc):
            return 0.0
        
        scores = []
        for frame, phoneme in zip(mfcc, phonemes):
            if phoneme in self.phoneme_models:
                model = self.phoneme_models[phoneme]
                score = -np.sum(((frame - model['mean']) / model['std']) ** 2)
                scores.append(np.exp(score / 100))
        
        return np.mean(scores) if scores else 0.0
    
    def _estimate_word_timestamps(self, text: str, audio_length: int) -> List[Tuple[str, float, float]]:
        """估计词时间戳"""
        words = text.split()
        if not words:
            return []
        
        timestamps = []
        word_duration = audio_length / len(words)
        
        for i, word in enumerate(words):
            start_time = i * word_duration / self.sample_rate
            end_time = (i + 1) * word_duration / self.sample_rate
            timestamps.append((word, start_time, end_time))
        
        return timestamps

class AudioFeatureExtractor:
    """音频特征提取器（简化版）"""
    
    def __init__(self, sample_rate: int = 16000, n_mfcc: int = 13, 
                 n_fft: int = 512, hop_length: int = 160):
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.n_fft = n_fft
        self.hop_length = hop_length
    
    def extract_mfcc(self, audio: np.ndarray) -> np.ndarray:
        """提取 MFCC"""
        n_frames = max(1, 1 + (len(audio) - self.n_fft) // self.hop_length)
        
        frames = np.zeros((n_frames, self.n_fft))
        for i in range(n_frames):
            start = i * self.hop_length
            end = min(start + self.n_fft, len(audio))
            frames[i, :end - start] = audio[start:end]
        
        window = np.hamming(self.n_fft)
        windowed = frames * window
        
        spectrum = np.abs(np.fft.rfft(windowed, axis=1))
        
        n_mel = 26
        mel_filter = np.random.rand(n_mel, spectrum.shape[1]) * 0.1 + 0.1
        mel_spectrum = spectrum @ mel_filter.T
        
        mel_spectrum = np.maximum(mel_spectrum, 1e-10)
        log_mel = np.log(mel_spectrum)
        
        mfcc = np.zeros((n_frames, self.n_mfcc))
        for i in range(self.n_mfcc):
            mfcc[:, i] = log_mel[:, i] if i < n_mel else 0
        
        return mfcc

sample_rate = 16000
duration = 1.0
t = np.linspace(0, duration, int(sample_rate * duration))

phoneme_examples = {
    'ah': [np.sin(2 * np.pi * 700 * t) for _ in range(3)],
    'eh': [np.sin(2 * np.pi * 500 * t) for _ in range(3)],
    'sil': [np.zeros(int(sample_rate * 0.1)) for _ in range(3)],
}

recognizer = SimpleSpeechRecognizer(sample_rate)
recognizer.build_phoneme_models(phoneme_examples)

test_audio = np.sin(2 * np.pi * 600 * t)
result = recognizer.recognize(test_audio)

print(f"Recognized text: {result.text}")
print(f"Confidence: {result.confidence:.4f}")
print(f"Word timestamps: {result.word_timestamps[:3]}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 音频分类

#### [概念] 概念解释

音频分类将音频分到预定义类别，包括语音/音乐分类、情感识别、环境声音分类等。音频分类是音频理解的重要应用。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class AudioClassificationResult:
    """音频分类结果"""
    label: str
    confidence: float
    all_scores: Dict[str, float]

class AudioClassifier:
    """音频分类器"""
    
    def __init__(self, sample_rate: int = 16000, n_classes: int = 5):
        self.sample_rate = sample_rate
        self.n_classes = n_classes
        self.feature_extractor = AudioFeatureExtractor(sample_rate)
        
        self.class_names = ['speech', 'music', 'noise', 'silence', 'mixed']
        
        self.class_models: Dict[str, Dict] = {}
    
    def train(self, audio_samples: List[Tuple[np.ndarray, str]]):
        """训练分类器"""
        class_features: Dict[str, List[np.ndarray]] = {}
        
        for audio, label in audio_samples:
            mfcc = self.feature_extractor.extract_mfcc(audio)
            features = mfcc.mean(axis=0)
            
            if label not in class_features:
                class_features[label] = []
            class_features[label].append(features)
        
        for label, features in class_features.items():
            features_array = np.array(features)
            self.class_models[label] = {
                'mean': features_array.mean(axis=0),
                'std': features_array.std(axis=0) + 1e-10,
                'prior': len(features) / len(audio_samples)
            }
    
    def classify(self, audio: np.ndarray) -> AudioClassificationResult:
        """分类音频"""
        mfcc = self.feature_extractor.extract_mfcc(audio)
        features = mfcc.mean(axis=0)
        
        scores = {}
        for label, model in self.class_models.items():
            distance = np.sum(((features - model['mean']) / model['std']) ** 2)
            scores[label] = np.exp(-distance / 2) * model['prior']
        
        total = sum(scores.values())
        if total > 0:
            scores = {k: v / total for k, v in scores.items()}
        
        best_label = max(scores, key=scores.get)
        
        return AudioClassificationResult(
            label=best_label,
            confidence=scores[best_label],
            all_scores=scores
        )

class SoundEventDetector:
    """声音事件检测器"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.feature_extractor = AudioFeatureExtractor(sample_rate)
        self.event_models: Dict[str, Dict] = {}
    
    def register_event(self, event_name: str, examples: List[np.ndarray]):
        """注册事件"""
        all_features = []
        
        for audio in examples:
            mfcc = self.feature_extractor.extract_mfcc(audio)
            all_features.append(mfcc.mean(axis=0))
        
        features_array = np.array(all_features)
        self.event_models[event_name] = {
            'mean': features_array.mean(axis=0),
            'std': features_array.std(axis=0) + 1e-10
        }
    
    def detect(self, audio: np.ndarray, threshold: float = 0.5) -> List[Tuple[str, float, float]]:
        """检测事件"""
        frame_size = int(self.sample_rate * 0.5)
        hop_size = int(self.sample_rate * 0.25)
        
        detections = []
        
        for i in range(0, len(audio) - frame_size, hop_size):
            frame = audio[i:i + frame_size]
            
            mfcc = self.feature_extractor.extract_mfcc(frame)
            features = mfcc.mean(axis=0)
            
            best_event = None
            best_score = 0
            
            for event_name, model in self.event_models.items():
                distance = np.sum(((features - model['mean']) / model['std']) ** 2)
                score = np.exp(-distance / 10)
                
                if score > best_score:
                    best_score = score
                    best_event = event_name
            
            if best_event and best_score > threshold:
                start_time = i / self.sample_rate
                end_time = (i + frame_size) / self.sample_rate
                detections.append((best_event, best_score, start_time, end_time))
        
        return self._merge_detections(detections)
    
    def _merge_detections(self, detections: List) -> List[Tuple[str, float, float]]:
        """合并检测结果"""
        if not detections:
            return []
        
        merged = []
        current_event, current_score, current_start = detections[0][0], detections[0][1], detections[0][2]
        
        for event, score, start, end in detections[1:]:
            if event == current_event:
                current_score = max(current_score, score)
            else:
                merged.append((current_event, current_score, current_start))
                current_event = event
                current_score = score
                current_start = start
        
        merged.append((current_event, current_score, current_start))
        
        return merged

sample_rate = 16000
duration = 1.0
t = np.linspace(0, duration, int(sample_rate * duration))

training_data = [
    (np.sin(2 * np.pi * 440 * t), 'music'),
    (np.sin(2 * np.pi * 200 * t), 'speech'),
    (np.random.randn(len(t)) * 0.1, 'noise'),
    (np.zeros(len(t)), 'silence'),
]

classifier = AudioClassifier(sample_rate)
classifier.train(training_data)

test_audio = np.sin(2 * np.pi * 300 * t)
result = classifier.classify(test_audio)

print(f"Classification result: {result.label}")
print(f"Confidence: {result.confidence:.4f}")
print(f"All scores: {result.all_scores}")

detector = SoundEventDetector(sample_rate)
detector.register_event('doorbell', [np.sin(2 * np.pi * 1000 * t) for _ in range(3)])
detector.register_event('alarm', [np.sin(2 * np.pi * 2000 * t) for _ in range(3)])

long_audio = np.zeros(int(sample_rate * 3))
long_audio[sample_rate:sample_rate * 2] = np.sin(2 * np.pi * 1000 * t)

events = detector.detect(long_audio, threshold=0.3)
print(f"\nDetected events: {len(events)}")
for event, score, start in events:
    print(f"  {event} at {start:.2f}s (confidence: {score:.4f})")
```

### 2. 语音合成

#### [概念] 概念解释

语音合成将文本转换为语音，包括文本分析、韵律预测、声学生成等步骤。现代语音合成使用神经网络生成自然流畅的语音。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class SynthesisConfig:
    """合成配置"""
    sample_rate: int = 16000
    frame_shift_ms: float = 12.5
    frame_length_ms: float = 50

class TextToPhonemeConverter:
    """文本转音素"""
    
    def __init__(self):
        self.char_to_phoneme = {
            'a': 'ah', 'b': 'b', 'c': 'k', 'd': 'd',
            'e': 'eh', 'f': 'f', 'g': 'g', 'h': 'hh',
            'i': 'ih', 'j': 'jh', 'k': 'k', 'l': 'l',
            'm': 'm', 'n': 'n', 'o': 'ow', 'p': 'p',
            'q': 'k', 'r': 'r', 's': 's', 't': 't',
            'u': 'uh', 'v': 'v', 'w': 'w', 'x': 'k s',
            'y': 'y', 'z': 'z', ' ': 'sil',
        }
    
    def convert(self, text: str) -> List[str]:
        """转换文本到音素"""
        phonemes = []
        
        for char in text.lower():
            if char in self.char_to_phoneme:
                phoneme = self.char_to_phoneme[char]
                if ' ' in phoneme:
                    phonemes.extend(phoneme.split())
                else:
                    phonemes.append(phoneme)
        
        return phonemes

class ProsodyPredictor:
    """韵律预测器"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        
        self.phoneme_duration = {
            'ah': 0.1, 'eh': 0.1, 'ih': 0.08, 'ow': 0.12,
            'b': 0.05, 'd': 0.05, 'f': 0.08, 'g': 0.05,
            'hh': 0.06, 'k': 0.06, 'l': 0.05, 'm': 0.06,
            'n': 0.05, 'p': 0.06, 'r': 0.05, 's': 0.1,
            't': 0.05, 'v': 0.06, 'w': 0.05, 'y': 0.05,
            'z': 0.08, 'jh': 0.08, 'ch': 0.1, 'sh': 0.1,
            'sil': 0.15,
        }
        
        self.phoneme_f0 = {
            'ah': 200, 'eh': 180, 'ih': 200, 'ow': 170,
            'b': 0, 'd': 0, 'f': 0, 'g': 0,
            'hh': 0, 'k': 0, 'l': 150, 'm': 0,
            'n': 0, 'p': 0, 'r': 150, 's': 0,
            't': 0, 'v': 0, 'w': 0, 'y': 0,
            'z': 0, 'jh': 0, 'ch': 0, 'sh': 0,
            'sil': 0,
        }
    
    def predict(self, phonemes: List[str]) -> Tuple[List[float], List[float]]:
        """预测韵律"""
        durations = []
        f0_values = []
        
        for phoneme in phonemes:
            duration = self.phoneme_duration.get(phoneme, 0.08)
            f0 = self.phoneme_f0.get(phoneme, 150)
            
            durations.append(duration)
            f0_values.append(f0)
        
        return durations, f0_values

class Vocoder:
    """声码器"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
    
    def synthesize(self, phonemes: List[str], durations: List[float], 
                   f0_values: List[float]) -> np.ndarray:
        """合成语音"""
        audio_segments = []
        
        for phoneme, duration, f0 in zip(phonemes, durations, f0_values):
            n_samples = int(duration * self.sample_rate)
            
            if f0 > 0:
                t = np.linspace(0, duration, n_samples)
                segment = np.sin(2 * np.pi * f0 * t)
                
                envelope = np.ones(n_samples)
                attack = int(0.01 * self.sample_rate)
                release = int(0.02 * self.sample_rate)
                envelope[:attack] = np.linspace(0, 1, attack)
                envelope[-release:] = np.linspace(1, 0, release)
                
                segment = segment * envelope * 0.3
            else:
                segment = np.random.randn(n_samples) * 0.05
            
            audio_segments.append(segment)
        
        return np.concatenate(audio_segments)

class TextToSpeech:
    """文本转语音系统"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.text_converter = TextToPhonemeConverter()
        self.prosody_predictor = ProsodyPredictor(sample_rate)
        self.vocoder = Vocoder(sample_rate)
    
    def synthesize(self, text: str) -> np.ndarray:
        """合成语音"""
        phonemes = self.text_converter.convert(text)
        
        durations, f0_values = self.prosody_predictor.predict(phonemes)
        
        audio = self.vocoder.synthesize(phonemes, durations, f0_values)
        
        return audio
    
    def get_phoneme_info(self, text: str) -> Dict:
        """获取音素信息"""
        phonemes = self.text_converter.convert(text)
        durations, f0_values = self.prosody_predictor.predict(phonemes)
        
        return {
            'phonemes': phonemes,
            'durations': durations,
            'f0_values': f0_values,
            'total_duration': sum(durations)
        }

tts = TextToSpeech(sample_rate=16000)

text = "hello"
phoneme_info = tts.get_phoneme_info(text)

print(f"Text: {text}")
print(f"Phonemes: {phoneme_info['phonemes']}")
print(f"Durations: {[f'{d:.3f}' for d in phoneme_info['durations']]}")
print(f"F0 values: {phoneme_info['f0_values']}")
print(f"Total duration: {phoneme_info['total_duration']:.3f}s")

audio = tts.synthesize(text)
print(f"\nGenerated audio length: {len(audio)} samples ({len(audio)/16000:.3f}s)")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Mel Spectrogram | Mel 频谱图 |
| Griffin-Lim | 相位重建算法 |
| WaveNet | 波形生成网络 |
| Tacotron | 端到端语音合成 |
| FastSpeech | 快速语音合成 |
| VITS | 变分推断语音合成 |
| Whisper | OpenAI 语音识别 |
| Wav2Vec | 预训练语音模型 |
| HuBERT | 自监督语音表示 |
| Speaker Diarization | 说话人分离 |
| Voice Conversion | 声音转换 |
| Speech Enhancement | 语音增强 |
| Sound Source Separation | 声源分离 |
| Music Information Retrieval | 音乐信息检索 |
| Audio Super Resolution | 音频超分辨率 |

---

## [实战] 核心实战清单

### 实战任务 1：语音命令识别系统

构建一个语音命令识别系统。要求：
1. 提取音频 MFCC 特征
2. 训练简单的命令分类器
3. 实现实时音频分段检测
4. 添加噪声鲁棒性处理
5. 评估识别准确率
