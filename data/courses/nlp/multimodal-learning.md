# 多模态学习 三层深度学习教程

## [总览] 技术总览

多模态学习整合多种模态（文本、图像、音频、视频）的信息，实现跨模态理解和生成。多模态学习是人工智能的前沿方向，应用包括视觉问答、图像描述、跨模态检索等。

本教程采用三层漏斗学习法：**核心层**聚焦多模态表示、跨模态对齐、多模态融合三大基石；**重点层**深入视觉语言模型和跨模态检索；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 多模态表示

#### [概念] 概念解释

多模态表示将不同模态的数据映射到统一的特征空间。常用方法包括联合表示（Joint Representation）和协调表示（Coordinated Representation）。联合表示将多模态特征融合为单一向量，协调表示保持各模态独立但约束其关系。

#### [代码] 代码示例

```python
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ModalityEncoder:
    """模态编码器"""
    
    input_dim: int
    hidden_dim: int
    output_dim: int
    
    def __post_init__(self):
        self.W1 = np.random.randn(self.input_dim, self.hidden_dim) * 0.1
        self.b1 = np.zeros(self.hidden_dim)
        self.W2 = np.random.randn(self.hidden_dim, self.output_dim) * 0.1
        self.b2 = np.zeros(self.output_dim)
    
    def encode(self, x: np.ndarray) -> np.ndarray:
        """编码"""
        h = np.maximum(0, x @ self.W1 + self.b1)
        return h @ self.W2 + self.b2

class JointRepresentation:
    """联合表示"""
    
    def __init__(self, text_dim: int = 300, image_dim: int = 2048, hidden_dim: int = 512, output_dim: int = 256):
        self.text_encoder = ModalityEncoder(text_dim, hidden_dim, output_dim)
        self.image_encoder = ModalityEncoder(image_dim, hidden_dim, output_dim)
    
    def encode(self, text_features: np.ndarray, image_features: np.ndarray) -> np.ndarray:
        """联合编码"""
        text_emb = self.text_encoder.encode(text_features)
        image_emb = self.image_encoder.encode(image_features)
        
        joint_emb = np.concatenate([text_emb, image_emb], axis=-1)
        
        return joint_emb
    
    def similarity(self, text_features: np.ndarray, image_features: np.ndarray) -> float:
        """计算相似度"""
        text_emb = self.text_encoder.encode(text_features)
        image_emb = self.image_encoder.encode(image_features)
        
        text_norm = text_emb / (np.linalg.norm(text_emb) + 1e-8)
        image_norm = image_emb / (np.linalg.norm(image_emb) + 1e-8)
        
        return np.dot(text_norm, image_norm)

class CoordinatedRepresentation:
    """协调表示"""
    
    def __init__(self, text_dim: int = 300, image_dim: int = 2048, output_dim: int = 256):
        self.text_encoder = ModalityEncoder(text_dim, 256, output_dim)
        self.image_encoder = ModalityEncoder(image_dim, 512, output_dim)
    
    def encode_text(self, text_features: np.ndarray) -> np.ndarray:
        """编码文本"""
        return self.text_encoder.encode(text_features)
    
    def encode_image(self, image_features: np.ndarray) -> np.ndarray:
        """编码图像"""
        return self.image_encoder.encode(image_features)
    
    def cross_modal_similarity(self, text_features: np.ndarray, image_features: np.ndarray) -> float:
        """跨模态相似度"""
        text_emb = self.encode_text(text_features)
        image_emb = self.encode_image(image_features)
        
        text_norm = text_emb / (np.linalg.norm(text_emb) + 1e-8)
        image_norm = image_emb / (np.linalg.norm(image_emb) + 1e-8)
        
        return np.dot(text_norm, image_norm)

class MultimodalFeatureExtractor:
    """多模态特征提取器"""
    
    def __init__(self):
        self.text_feature_dim = 300
        self.image_feature_dim = 2048
    
    def extract_text_features(self, text: str) -> np.ndarray:
        """提取文本特征（简化版）"""
        np.random.seed(hash(text) % (2**32))
        return np.random.randn(self.text_feature_dim)
    
    def extract_image_features(self, image_path: str = None) -> np.ndarray:
        """提取图像特征（简化版）"""
        np.random.seed(hash(image_path or "default") % (2**32))
        return np.random.randn(self.image_feature_dim)

text_features = np.random.randn(300)
image_features = np.random.randn(2048)

joint_rep = JointRepresentation()
joint_emb = joint_rep.encode(text_features, image_features)
print(f"Joint Representation shape: {joint_emb.shape}")
print(f"Cross-modal similarity: {joint_rep.similarity(text_features, image_features):.4f}")

coord_rep = CoordinatedRepresentation()
text_emb = coord_rep.encode_text(text_features)
image_emb = coord_rep.encode_image(image_features)
print(f"\nCoordinated Representation:")
print(f"Text embedding shape: {text_emb.shape}")
print(f"Image embedding shape: {image_emb.shape}")
print(f"Cross-modal similarity: {coord_rep.cross_modal_similarity(text_features, image_features):.4f}")
```

### 2. 跨模态对齐

#### [概念] 概念解释

跨模态对齐学习不同模态之间的对应关系，包括显式对齐（如词-区域对齐）和隐式对齐（通过注意力机制）。对齐是多模态理解的关键步骤。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class AlignmentResult:
    """对齐结果"""
    source_idx: int
    target_idx: int
    score: float

class CrossModalAlignment:
    """跨模态对齐"""
    
    def __init__(self, similarity_threshold: float = 0.5):
        self.similarity_threshold = similarity_threshold
    
    def align(self, source_features: np.ndarray, target_features: np.ndarray) -> List[AlignmentResult]:
        """对齐"""
        similarity_matrix = self._compute_similarity_matrix(source_features, target_features)
        
        alignments = []
        
        for i in range(len(source_features)):
            best_j = np.argmax(similarity_matrix[i])
            best_score = similarity_matrix[i, best_j]
            
            if best_score >= self.similarity_threshold:
                alignments.append(AlignmentResult(
                    source_idx=i,
                    target_idx=best_j,
                    score=best_score
                ))
        
        return alignments
    
    def _compute_similarity_matrix(self, source: np.ndarray, target: np.ndarray) -> np.ndarray:
        """计算相似度矩阵"""
        source_norm = source / (np.linalg.norm(source, axis=1, keepdims=True) + 1e-8)
        target_norm = target / (np.linalg.norm(target, axis=1, keepdims=True) + 1e-8)
        
        return source_norm @ target_norm.T

class AttentionAlignment:
    """注意力对齐"""
    
    def __init__(self, hidden_dim: int = 256):
        self.hidden_dim = hidden_dim
        self.W_q = np.random.randn(hidden_dim, hidden_dim) * 0.1
        self.W_k = np.random.randn(hidden_dim, hidden_dim) * 0.1
    
    def compute_attention(self, query_features: np.ndarray, key_features: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """计算注意力"""
        Q = query_features @ self.W_q
        K = key_features @ self.W_k
        
        scores = Q @ K.T / np.sqrt(self.hidden_dim)
        
        attention_weights = self._softmax(scores)
        
        attended_features = attention_weights @ key_features
        
        return attended_features, attention_weights
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Softmax"""
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

class WordRegionAlignment:
    """词-区域对齐"""
    
    def __init__(self, word_dim: int = 300, region_dim: int = 2048, hidden_dim: int = 512):
        self.word_dim = word_dim
        self.region_dim = region_dim
        self.hidden_dim = hidden_dim
        
        self.word_proj = np.random.randn(word_dim, hidden_dim) * 0.1
        self.region_proj = np.random.randn(region_dim, hidden_dim) * 0.1
    
    def align_words_to_regions(self, word_embeddings: np.ndarray, region_features: np.ndarray) -> Dict[int, List[int]]:
        """词到区域的对齐"""
        word_proj = word_embeddings @ self.word_proj
        region_proj = region_features @ self.region_proj
        
        word_norm = word_proj / (np.linalg.norm(word_proj, axis=1, keepdims=True) + 1e-8)
        region_norm = region_proj / (np.linalg.norm(region_proj, axis=1, keepdims=True) + 1e-8)
        
        similarity = word_norm @ region_norm.T
        
        alignment = {}
        for word_idx in range(len(word_embeddings)):
            top_regions = np.where(similarity[word_idx] > 0.3)[0]
            alignment[word_idx] = top_regions.tolist()
        
        return alignment
    
    def get_alignment_scores(self, word_embeddings: np.ndarray, region_features: np.ndarray) -> np.ndarray:
        """获取对齐分数"""
        word_proj = word_embeddings @ self.word_proj
        region_proj = region_features @ self.region_proj
        
        word_norm = word_proj / (np.linalg.norm(word_proj, axis=1, keepdims=True) + 1e-8)
        region_norm = region_proj / (np.linalg.norm(region_proj, axis=1, keepdims=True) + 1e-8)
        
        return word_norm @ region_norm.T

source_features = np.random.randn(5, 256)
target_features = np.random.randn(8, 256)

alignment = CrossModalAlignment()
results = alignment.align(source_features, target_features)

print("Cross-modal Alignment Results:")
for r in results:
    print(f"  Source {r.source_idx} -> Target {r.target_idx}: score={r.score:.4f}")

attention_align = AttentionAlignment()
attended, weights = attention_align.compute_attention(source_features, target_features)

print(f"\nAttention weights shape: {weights.shape}")
print(f"Attended features shape: {attended.shape}")

word_embeddings = np.random.randn(10, 300)
region_features = np.random.randn(15, 2048)

word_region = WordRegionAlignment()
alignment_map = word_region.align_words_to_regions(word_embeddings, region_features)

print(f"\nWord-Region Alignment:")
for word_idx, regions in alignment_map.items():
    if regions:
        print(f"  Word {word_idx} -> Regions {regions}")
```

### 3. 多模态融合

#### [概念] 概念解释

多模态融合整合不同模态的信息，包括早期融合（特征级）、晚期融合（决策级）和混合融合。融合策略影响多模态任务的性能。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass

@dataclass
class FusionConfig:
    """融合配置"""
    text_dim: int = 300
    image_dim: int = 2048
    audio_dim: int = 128
    hidden_dim: int = 512
    output_dim: int = 256

class EarlyFusion:
    """早期融合"""
    
    def __init__(self, config: FusionConfig):
        self.config = config
        
        total_dim = config.text_dim + config.image_dim + config.audio_dim
        self.W1 = np.random.randn(total_dim, config.hidden_dim) * 0.1
        self.b1 = np.zeros(config.hidden_dim)
        self.W2 = np.random.randn(config.hidden_dim, config.output_dim) * 0.1
        self.b2 = np.zeros(config.output_dim)
    
    def fuse(self, text_features: np.ndarray, image_features: np.ndarray, audio_features: np.ndarray = None) -> np.ndarray:
        """融合"""
        if audio_features is None:
            audio_features = np.zeros(self.config.audio_dim)
        
        concatenated = np.concatenate([text_features, image_features, audio_features])
        
        h = np.maximum(0, concatenated @ self.W1 + self.b1)
        output = h @ self.W2 + self.b2
        
        return output

class LateFusion:
    """晚期融合"""
    
    def __init__(self, config: FusionConfig, num_classes: int = 10):
        self.config = config
        self.num_classes = num_classes
        
        self.text_classifier = np.random.randn(config.text_dim, num_classes) * 0.1
        self.image_classifier = np.random.randn(config.image_dim, num_classes) * 0.1
        self.audio_classifier = np.random.randn(config.audio_dim, num_classes) * 0.1
        
        self.fusion_weights = np.array([0.4, 0.4, 0.2])
    
    def fuse(self, text_features: np.ndarray, image_features: np.ndarray, audio_features: np.ndarray = None) -> np.ndarray:
        """融合"""
        text_logits = text_features @ self.text_classifier
        image_logits = image_features @ self.image_classifier
        
        if audio_features is not None:
            audio_logits = audio_features @ self.audio_classifier
            logits = np.array([text_logits, image_logits, audio_logits])
        else:
            logits = np.array([text_logits, image_logits])
            self.fusion_weights = np.array([0.5, 0.5])
        
        fused_logits = np.average(logits, axis=0, weights=self.fusion_weights[:len(logits)])
        
        return fused_logits
    
    def predict(self, text_features: np.ndarray, image_features: np.ndarray, audio_features: np.ndarray = None) -> int:
        """预测"""
        logits = self.fuse(text_features, image_features, audio_features)
        return np.argmax(logits)

class HybridFusion:
    """混合融合"""
    
    def __init__(self, config: FusionConfig):
        self.config = config
        
        self.text_encoder = np.random.randn(config.text_dim, config.hidden_dim) * 0.1
        self.image_encoder = np.random.randn(config.image_dim, config.hidden_dim) * 0.1
        
        self.cross_attention_Wq = np.random.randn(config.hidden_dim, config.hidden_dim) * 0.1
        self.cross_attention_Wk = np.random.randn(config.hidden_dim, config.hidden_dim) * 0.1
        self.cross_attention_Wv = np.random.randn(config.hidden_dim, config.hidden_dim) * 0.1
        
        self.output_W = np.random.randn(config.hidden_dim * 2, config.output_dim) * 0.1
    
    def fuse(self, text_features: np.ndarray, image_features: np.ndarray) -> np.ndarray:
        """融合"""
        text_emb = text_features @ self.text_encoder
        image_emb = image_features @ self.image_encoder
        
        attended_image = self._cross_attention(text_emb, image_emb)
        
        fused = np.concatenate([text_emb, attended_image], axis=-1)
        
        output = fused @ self.output_W
        
        return output
    
    def _cross_attention(self, query: np.ndarray, key_value: np.ndarray) -> np.ndarray:
        """交叉注意力"""
        Q = query @ self.cross_attention_Wq
        K = key_value @ self.cross_attention_Wk
        V = key_value @ self.cross_attention_Wv
        
        scores = np.dot(Q, K.T) / np.sqrt(self.config.hidden_dim)
        
        attention = np.exp(scores - np.max(scores))
        attention = attention / attention.sum()
        
        return attention @ V

class GatedFusion:
    """门控融合"""
    
    def __init__(self, config: FusionConfig):
        self.config = config
        
        self.text_proj = np.random.randn(config.text_dim, config.hidden_dim) * 0.1
        self.image_proj = np.random.randn(config.image_dim, config.hidden_dim) * 0.1
        
        self.gate_W = np.random.randn(config.hidden_dim * 2, config.hidden_dim) * 0.1
        self.gate_b = np.zeros(config.hidden_dim)
        
        self.output_W = np.random.randn(config.hidden_dim, config.output_dim) * 0.1
    
    def fuse(self, text_features: np.ndarray, image_features: np.ndarray) -> np.ndarray:
        """门控融合"""
        text_emb = text_features @ self.text_proj
        image_emb = image_features @ self.image_proj
        
        concat = np.concatenate([text_emb, image_emb])
        
        gate = self._sigmoid(concat @ self.gate_W + self.gate_b)
        
        fused = gate * text_emb + (1 - gate) * image_emb
        
        return fused @ self.output_W
    
    def _sigmoid(self, x: np.ndarray) -> np.ndarray:
        """Sigmoid"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

config = FusionConfig()

text_features = np.random.randn(config.text_dim)
image_features = np.random.randn(config.image_dim)
audio_features = np.random.randn(config.audio_dim)

early = EarlyFusion(config)
early_result = early.fuse(text_features, image_features, audio_features)
print(f"Early Fusion output shape: {early_result.shape}")

late = LateFusion(config, num_classes=10)
late_result = late.fuse(text_features, image_features, audio_features)
print(f"Late Fusion logits shape: {late_result.shape}")
print(f"Predicted class: {late.predict(text_features, image_features, audio_features)}")

hybrid = HybridFusion(config)
hybrid_result = hybrid.fuse(text_features, image_features)
print(f"Hybrid Fusion output shape: {hybrid_result.shape}")

gated = GatedFusion(config)
gated_result = gated.fuse(text_features, image_features)
print(f"Gated Fusion output shape: {gated_result.shape}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 视觉语言模型

#### [概念] 概念解释

视觉语言模型（VLM）结合视觉和语言能力，实现图像描述、视觉问答等任务。代表性模型包括 CLIP、BLIP、LLaVA 等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class VLMConfig:
    """VLM 配置"""
    text_dim: int = 512
    image_dim: int = 768
    hidden_dim: int = 512
    vocab_size: int = 10000
    max_seq_len: int = 50

class SimpleVLM:
    """简化版视觉语言模型"""
    
    def __init__(self, config: VLMConfig):
        self.config = config
        
        self.image_encoder = np.random.randn(config.image_dim, config.hidden_dim) * 0.1
        self.text_encoder = np.random.randn(config.text_dim, config.hidden_dim) * 0.1
        
        self.cross_modal_W = np.random.randn(config.hidden_dim, config.hidden_dim) * 0.1
        
        self.embedding = np.random.randn(config.vocab_size, config.hidden_dim) * 0.1
        self.output_W = np.random.randn(config.hidden_dim, config.vocab_size) * 0.1
    
    def encode_image(self, image_features: np.ndarray) -> np.ndarray:
        """编码图像"""
        return np.maximum(0, image_features @ self.image_encoder)
    
    def encode_text(self, text_features: np.ndarray) -> np.ndarray:
        """编码文本"""
        return np.maximum(0, text_features @ self.text_encoder)
    
    def image_captioning(self, image_features: np.ndarray, max_length: int = 20) -> List[int]:
        """图像描述生成"""
        image_emb = self.encode_image(image_features)
        
        captions = []
        hidden = image_emb
        
        for _ in range(max_length):
            logits = hidden @ self.output_W
            next_token = np.argmax(logits)
            
            captions.append(int(next_token))
            
            if next_token == 0:
                break
            
            hidden = self.embedding[next_token] @ self.cross_modal_W + image_emb
        
        return captions
    
    def visual_qa(self, image_features: np.ndarray, question_features: np.ndarray) -> List[int]:
        """视觉问答"""
        image_emb = self.encode_image(image_features)
        question_emb = self.encode_text(question_features)
        
        combined = image_emb + question_emb
        
        answers = []
        hidden = combined
        
        for _ in range(10):
            logits = hidden @ self.output_W
            next_token = np.argmax(logits)
            
            answers.append(int(next_token))
            
            if next_token == 0:
                break
            
            hidden = self.embedding[next_token] @ self.cross_modal_W + combined
        
        return answers

class CLIPStyleModel:
    """CLIP 风格模型"""
    
    def __init__(self, image_dim: int = 768, text_dim: int = 512, shared_dim: int = 256):
        self.image_dim = image_dim
        self.text_dim = text_dim
        self.shared_dim = shared_dim
        
        self.image_proj = np.random.randn(image_dim, shared_dim) * 0.1
        self.text_proj = np.random.randn(text_dim, shared_dim) * 0.1
        
        self.logit_scale = np.log(1 / 0.07)
    
    def encode_image(self, image_features: np.ndarray) -> np.ndarray:
        """编码图像"""
        emb = image_features @ self.image_proj
        return emb / (np.linalg.norm(emb, axis=-1, keepdims=True) + 1e-8)
    
    def encode_text(self, text_features: np.ndarray) -> np.ndarray:
        """编码文本"""
        emb = text_features @ self.text_proj
        return emb / (np.linalg.norm(emb, axis=-1, keepdims=True) + 1e-8)
    
    def compute_similarity(self, image_features: np.ndarray, text_features: np.ndarray) -> np.ndarray:
        """计算相似度"""
        image_emb = self.encode_image(image_features)
        text_emb = self.encode_text(text_features)
        
        logits = image_emb @ text_emb.T * np.exp(self.logit_scale)
        
        return logits
    
    def retrieve_images(self, query_text: np.ndarray, image_features: np.ndarray, top_k: int = 5) -> List[int]:
        """图像检索"""
        similarities = self.compute_similarity(image_features, query_text.reshape(1, -1))
        
        top_indices = np.argsort(similarities[0])[::-1][:top_k]
        
        return top_indices.tolist()
    
    def retrieve_texts(self, query_image: np.ndarray, text_features: np.ndarray, top_k: int = 5) -> List[int]:
        """文本检索"""
        similarities = self.compute_similarity(query_image.reshape(1, -1), text_features)
        
        top_indices = np.argsort(similarities[0])[::-1][:top_k]
        
        return top_indices.tolist()

config = VLMConfig()

image_features = np.random.randn(config.image_dim)
text_features = np.random.randn(config.text_dim)

vlm = SimpleVLM(config)
caption = vlm.image_captioning(image_features)
print(f"Generated caption tokens: {caption[:5]}...")

answer = vlm.visual_qa(image_features, text_features)
print(f"Generated answer tokens: {answer}")

clip = CLIPStyleModel()

images = np.random.randn(10, 768)
texts = np.random.randn(10, 512)

similarities = clip.compute_similarity(images, texts)
print(f"\nSimilarity matrix shape: {similarities.shape}")

query_text = np.random.randn(512)
retrieved_images = clip.retrieve_images(query_text, images, top_k=3)
print(f"Retrieved image indices: {retrieved_images}")
```

### 2. 跨模态检索

#### [概念] 概念解释

跨模态检索在不同模态之间进行搜索，如以文搜图、以图搜文。核心是将不同模态映射到共享空间，通过相似度计算进行检索。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class RetrievalResult:
    """检索结果"""
    index: int
    score: float
    modality: str

class CrossModalRetriever:
    """跨模态检索器"""
    
    def __init__(self, embedding_dim: int = 256):
        self.embedding_dim = embedding_dim
        self.image_embeddings: np.ndarray = None
        self.text_embeddings: np.ndarray = None
        self.image_metadata: List[Dict] = []
        self.text_metadata: List[Dict] = []
    
    def index_images(self, image_features: np.ndarray, metadata: List[Dict] = None):
        """索引图像"""
        self.image_embeddings = image_features / (np.linalg.norm(image_features, axis=1, keepdims=True) + 1e-8)
        self.image_metadata = metadata or [{} for _ in range(len(image_features))]
    
    def index_texts(self, text_features: np.ndarray, metadata: List[Dict] = None):
        """索引文本"""
        self.text_embeddings = text_features / (np.linalg.norm(text_features, axis=1, keepdims=True) + 1e-8)
        self.text_metadata = metadata or [{} for _ in range(len(text_features))]
    
    def text_to_image(self, query_text: np.ndarray, top_k: int = 10) -> List[RetrievalResult]:
        """以文搜图"""
        query_norm = query_text / (np.linalg.norm(query_text) + 1e-8)
        
        similarities = query_norm @ self.image_embeddings.T
        
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [
            RetrievalResult(
                index=int(idx),
                score=float(similarities[idx]),
                modality='image'
            )
            for idx in top_indices
        ]
    
    def image_to_text(self, query_image: np.ndarray, top_k: int = 10) -> List[RetrievalResult]:
        """以图搜文"""
        query_norm = query_image / (np.linalg.norm(query_image) + 1e-8)
        
        similarities = query_norm @ self.text_embeddings.T
        
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [
            RetrievalResult(
                index=int(idx),
                score=float(similarities[idx]),
                modality='text'
            )
            for idx in top_indices
        ]

class MultiModalIndex:
    """多模态索引"""
    
    def __init__(self, embedding_dim: int = 256, n_clusters: int = 10):
        self.embedding_dim = embedding_dim
        self.n_clusters = n_clusters
        self.centroids: np.ndarray = None
        self.inverted_index: Dict[int, List[Tuple[int, str]]] = defaultdict(list)
    
    def build_index(self, image_embeddings: np.ndarray, text_embeddings: np.ndarray):
        """构建索引"""
        all_embeddings = np.vstack([image_embeddings, text_embeddings])
        
        self.centroids = self._kmeans(all_embeddings, self.n_clusters)
        
        for i, emb in enumerate(image_embeddings):
            cluster_id = self._find_nearest_cluster(emb)
            self.inverted_index[cluster_id].append((i, 'image'))
        
        for i, emb in enumerate(text_embeddings):
            cluster_id = self._find_nearest_cluster(emb)
            self.inverted_index[cluster_id].append((i + len(image_embeddings), 'text'))
    
    def search(self, query: np.ndarray, top_k: int = 10) -> List[Tuple[int, str, float]]:
        """搜索"""
        cluster_id = self._find_nearest_cluster(query)
        
        candidates = self.inverted_index[cluster_id]
        
        return [(idx, modality, 0.5) for idx, modality in candidates[:top_k]]
    
    def _kmeans(self, data: np.ndarray, n_clusters: int, max_iter: int = 10) -> np.ndarray:
        """K-Means 聚类"""
        indices = np.random.choice(len(data), n_clusters, replace=False)
        centroids = data[indices]
        
        for _ in range(max_iter):
            distances = np.linalg.norm(data[:, np.newaxis] - centroids, axis=2)
            labels = np.argmin(distances, axis=1)
            
            new_centroids = np.array([
                data[labels == k].mean(axis=0) if np.sum(labels == k) > 0 else centroids[k]
                for k in range(n_clusters)
            ])
            
            centroids = new_centroids
        
        return centroids
    
    def _find_nearest_cluster(self, query: np.ndarray) -> int:
        """找最近的聚类"""
        distances = np.linalg.norm(self.centroids - query, axis=1)
        return int(np.argmin(distances))

class CrossModalReranker:
    """跨模态重排序"""
    
    def __init__(self, alpha: float = 0.5):
        self.alpha = alpha
    
    def rerank(self, initial_results: List[RetrievalResult], query_features: np.ndarray, 
               candidate_features: np.ndarray) -> List[RetrievalResult]:
        """重排序"""
        query_norm = query_features / (np.linalg.norm(query_features) + 1e-8)
        candidate_norms = candidate_features / (np.linalg.norm(candidate_features, axis=1, keepdims=True) + 1e-8)
        
        similarities = candidate_norms @ query_norm
        
        reranked = []
        for i, result in enumerate(initial_results):
            new_score = self.alpha * result.score + (1 - self.alpha) * similarities[i]
            reranked.append(RetrievalResult(
                index=result.index,
                score=float(new_score),
                modality=result.modality
            ))
        
        reranked.sort(key=lambda x: x.score, reverse=True)
        
        return reranked

images = np.random.randn(100, 256)
texts = np.random.randn(100, 256)

retriever = CrossModalRetriever()
retriever.index_images(images)
retriever.index_texts(texts)

query_text = np.random.randn(256)
image_results = retriever.text_to_image(query_text, top_k=5)

print("Text-to-Image Retrieval Results:")
for r in image_results[:3]:
    print(f"  Image {r.index}: score={r.score:.4f}")

query_image = np.random.randn(256)
text_results = retriever.image_to_text(query_image, top_k=5)

print("\nImage-to-Text Retrieval Results:")
for r in text_results[:3]:
    print(f"  Text {r.index}: score={r.score:.4f}")

index = MultiModalIndex(n_clusters=5)
index.build_index(images, texts)

search_results = index.search(query_text, top_k=5)
print(f"\nIndexed search results: {len(search_results)} items")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| CLIP | 对比语言-图像预训练 |
| BLIP | 引导语言-图像预训练 |
| LLaVA | 大语言视觉助手 |
| Flamingo | 视觉语言模型 |
| ViLT | 无卷积视觉语言 Transformer |
| ALBEF | 对齐后融合 |
| VQA | 视觉问答 |
| Image Captioning | 图像描述 |
| Text-to-Image | 文本生成图像 |
| DALL-E | 文本生成图像模型 |
| Stable Diffusion | 稳定扩散模型 |
| Midjourney | 图像生成工具 |
| Audio-Visual | 音视频学习 |
| Video Understanding | 视频理解 |
| Multimodal RAG | 多模态检索增强生成 |

---

## [实战] 核心实战清单

### 实战任务 1：图文检索系统

构建一个图文检索系统。要求：
1. 实现图像和文本特征提取
2. 构建跨模态索引
3. 实现以文搜图和以图搜文功能
4. 添加重排序模块提升检索精度
5. 评估检索性能（Recall@K, MRR）
