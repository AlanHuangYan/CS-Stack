# LLM 数据处理 三层深度学习教程

## [总览] 技术总览

LLM 数据处理是构建高质量训练数据的关键环节，涵盖数据采集、清洗、预处理、增强、格式化等步骤。数据质量直接影响模型性能，良好的数据处理流程是 LLM 成功的基础。

本教程采用三层漏斗学习法：**核心层**聚焦数据清洗、文本预处理、数据格式化三大基石；**重点层**深入数据增强和质量评估；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数据清洗

#### [概念] 概念解释

数据清洗移除噪声、重复、低质量内容。常见问题：HTML 标签、特殊字符、编码错误、重复文本、低质量内容。清洗策略需平衡质量和数量。

#### [代码] 代码示例

```python
import re
import html
from typing import List, Dict, Optional
from dataclasses import dataclass
import unicodedata

@dataclass
class CleaningConfig:
    remove_html: bool = True
    remove_urls: bool = True
    remove_emails: bool = True
    normalize_whitespace: bool = True
    remove_special_chars: bool = False
    min_length: int = 10
    max_length: int = 100000

class TextCleaner:
    """文本清洗器"""
    
    def __init__(self, config: CleaningConfig = None):
        self.config = config or CleaningConfig()
    
    def clean(self, text: str) -> str:
        """清洗文本"""
        if not text:
            return ""
        
        if self.config.remove_html:
            text = self._remove_html(text)
        
        if self.config.remove_urls:
            text = self._remove_urls(text)
        
        if self.config.remove_emails:
            text = self._remove_emails(text)
        
        if self.config.normalize_whitespace:
            text = self._normalize_whitespace(text)
        
        text = self._normalize_unicode(text)
        
        text = text.strip()
        
        if len(text) < self.config.min_length or len(text) > self.config.max_length:
            return ""
        
        return text
    
    def _remove_html(self, text: str) -> str:
        text = html.unescape(text)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'&[a-zA-Z]+;', ' ', text)
        return text
    
    def _remove_urls(self, text: str) -> str:
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        return re.sub(url_pattern, ' ', text)
    
    def _remove_emails(self, text: str) -> str:
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return re.sub(email_pattern, ' ', text)
    
    def _normalize_whitespace(self, text: str) -> str:
        text = re.sub(r'[\t\n\r]+', ' ', text)
        text = re.sub(r' +', ' ', text)
        return text
    
    def _normalize_unicode(self, text: str) -> str:
        return unicodedata.normalize('NFKC', text)

class Deduplicator:
    """去重器"""
    
    def __init__(self, similarity_threshold: float = 0.8):
        self.similarity_threshold = similarity_threshold
        self.seen_hashes = set()
    
    def is_duplicate(self, text: str) -> bool:
        """检查是否重复"""
        text_hash = hash(text)
        if text_hash in self.seen_hashes:
            return True
        
        self.seen_hashes.add(text_hash)
        return False
    
    def compute_minhash(self, text: str, num_perm: int = 128) -> List[int]:
        """计算 MinHash"""
        words = text.lower().split()
        ngrams = set()
        for i in range(len(words) - 2):
            ngrams.add(' '.join(words[i:i+3]))
        
        import hashlib
        hashes = []
        for i in range(num_perm):
            min_hash = float('inf')
            for ngram in ngrams:
                h = int(hashlib.md5(f"{i}{ngram}".encode()).hexdigest(), 16)
                min_hash = min(min_hash, h)
            hashes.append(min_hash)
        
        return hashes
    
    def jaccard_similarity(self, hash1: List[int], hash2: List[int]) -> float:
        """计算 Jaccard 相似度"""
        if len(hash1) != len(hash2):
            return 0.0
        
        matches = sum(1 for a, b in zip(hash1, hash2) if a == b)
        return matches / len(hash1)

class QualityFilter:
    """质量过滤器"""
    
    def __init__(
        self,
        min_words: int = 10,
        max_words: int = 10000,
        min_avg_word_length: float = 3.0,
        max_avg_word_length: float = 15.0,
        max_symbol_ratio: float = 0.3
    ):
        self.min_words = min_words
        self.max_words = max_words
        self.min_avg_word_length = min_avg_word_length
        self.max_avg_word_length = max_avg_word_length
        self.max_symbol_ratio = max_symbol_ratio
    
    def filter(self, text: str) -> bool:
        """判断文本是否通过质量过滤"""
        words = text.split()
        word_count = len(words)
        
        if word_count < self.min_words or word_count > self.max_words:
            return False
        
        avg_word_length = sum(len(w) for w in words) / word_count
        if avg_word_length < self.min_avg_word_length or avg_word_length > self.max_avg_word_length:
            return False
        
        symbol_count = sum(1 for c in text if not c.isalnum() and not c.isspace())
        symbol_ratio = symbol_count / len(text) if text else 0
        if symbol_ratio > self.max_symbol_ratio:
            return False
        
        return True

class DataCleaningPipeline:
    """数据清洗流水线"""
    
    def __init__(self):
        self.cleaner = TextCleaner()
        self.deduplicator = Deduplicator()
        self.quality_filter = QualityFilter()
    
    def process(self, documents: List[str]) -> List[str]:
        """处理文档列表"""
        cleaned = []
        
        for doc in documents:
            text = self.cleaner.clean(doc)
            
            if not text:
                continue
            
            if self.deduplicator.is_duplicate(text):
                continue
            
            if not self.quality_filter.filter(text):
                continue
            
            cleaned.append(text)
        
        return cleaned
```

### 2. 文本预处理

#### [概念] 概念解释

文本预处理将原始文本转换为模型可理解的格式。步骤包括：分词、子词分割、编码、填充。不同模型使用不同的分词器和预处理策略。

#### [代码] 代码示例

```python
from typing import List, Dict, Optional
from dataclasses import dataclass
import json
import re

@dataclass
class TokenizerConfig:
    vocab_size: int = 50000
    max_length: int = 512
    pad_token: str = "<pad>"
    unk_token: str = "<unk>"
    bos_token: str = "<s>"
    eos_token: str = "</s>"

class BPETokenizer:
    """BPE 分词器"""
    
    def __init__(self, config: TokenizerConfig = None):
        self.config = config or TokenizerConfig()
        self.vocab = {}
        self.merges = []
        self.special_tokens = {
            self.config.pad_token: 0,
            self.config.unk_token: 1,
            self.config.bos_token: 2,
            self.config.eos_token: 3
        }
    
    def train(self, texts: List[str], vocab_size: int = None):
        """训练分词器"""
        vocab_size = vocab_size or self.config.vocab_size
        
        word_freqs = {}
        for text in texts:
            words = text.split()
            for word in words:
                word_freqs[word] = word_freqs.get(word, 0) + 1
        
        splits = {}
        for word in word_freqs:
            splits[word] = list(word)
        
        self.vocab = set()
        for word in splits:
            for char in splits[word]:
                self.vocab.add(char)
        
        while len(self.vocab) < vocab_size:
            pair_freqs = self._compute_pair_freqs(splits, word_freqs)
            if not pair_freqs:
                break
            
            best_pair = max(pair_freqs, key=pair_freqs.get)
            self.merges.append(best_pair)
            self.vocab.add(best_pair[0] + best_pair[1])
            
            splits = self._merge_pair(best_pair, splits)
        
        self._build_vocab()
    
    def _compute_pair_freqs(self, splits: Dict, word_freqs: Dict) -> Dict:
        pair_freqs = {}
        for word, split in splits.items():
            if len(split) < 2:
                continue
            for i in range(len(split) - 1):
                pair = (split[i], split[i + 1])
                pair_freqs[pair] = pair_freqs.get(pair, 0) + word_freqs[word]
        return pair_freqs
    
    def _merge_pair(self, pair: tuple, splits: Dict) -> Dict:
        new_splits = {}
        bigram = pair[0] + pair[1]
        replacement = bigram
        
        for word, split in splits.items():
            new_split = []
            i = 0
            while i < len(split):
                if i < len(split) - 1 and split[i] == pair[0] and split[i + 1] == pair[1]:
                    new_split.append(replacement)
                    i += 2
                else:
                    new_split.append(split[i])
                    i += 1
            new_splits[word] = new_split
        
        return new_splits
    
    def _build_vocab(self):
        self.token_to_id = {**self.special_tokens}
        for i, token in enumerate(sorted(self.vocab)):
            if token not in self.token_to_id:
                self.token_to_id[token] = len(self.token_to_id)
        
        self.id_to_token = {v: k for k, v in self.token_to_id.items()}
    
    def encode(self, text: str, add_special_tokens: bool = True) -> List[int]:
        """编码文本"""
        tokens = []
        
        if add_special_tokens:
            tokens.append(self.special_tokens[self.config.bos_token])
        
        words = text.split()
        for word in words:
            word_tokens = self._tokenize_word(word)
            for token in word_tokens:
                if token in self.token_to_id:
                    tokens.append(self.token_to_id[token])
                else:
                    tokens.append(self.special_tokens[self.config.unk_token])
        
        if add_special_tokens:
            tokens.append(self.special_tokens[self.config.eos_token])
        
        return tokens
    
    def _tokenize_word(self, word: str) -> List[str]:
        splits = list(word)
        
        for merge in self.merges:
            i = 0
            while i < len(splits) - 1:
                if splits[i] == merge[0] and splits[i + 1] == merge[1]:
                    splits = splits[:i] + [merge[0] + merge[1]] + splits[i + 2:]
                else:
                    i += 1
        
        return splits
    
    def decode(self, token_ids: List[int]) -> str:
        """解码 token IDs"""
        tokens = []
        for token_id in token_ids:
            if token_id in self.id_to_token:
                token = self.id_to_token[token_id]
                if token not in self.special_tokens:
                    tokens.append(token)
        
        return ' '.join(tokens)
    
    def pad_sequence(self, token_ids: List[int], max_length: int = None) -> List[int]:
        """填充序列"""
        max_length = max_length or self.config.max_length
        pad_id = self.special_tokens[self.config.pad_token]
        
        if len(token_ids) > max_length:
            return token_ids[:max_length]
        
        return token_ids + [pad_id] * (max_length - len(token_ids))

class TextPreprocessor:
    """文本预处理器"""
    
    def __init__(self, tokenizer: BPETokenizer):
        self.tokenizer = tokenizer
    
    def preprocess(
        self,
        texts: List[str],
        max_length: int = None,
        padding: bool = True,
        truncation: bool = True
    ) -> Dict[str, List[List[int]]]:
        """预处理文本列表"""
        max_length = max_length or self.tokenizer.config.max_length
        
        input_ids = []
        attention_masks = []
        
        for text in texts:
            tokens = self.tokenizer.encode(text)
            
            if truncation and len(tokens) > max_length:
                tokens = tokens[:max_length]
            
            if padding:
                attention_mask = [1] * len(tokens)
                tokens = self.tokenizer.pad_sequence(tokens, max_length)
                attention_mask = attention_mask + [0] * (max_length - len(attention_mask))
            else:
                attention_mask = [1] * len(tokens)
            
            input_ids.append(tokens)
            attention_masks.append(attention_mask)
        
        return {
            "input_ids": input_ids,
            "attention_mask": attention_masks
        }
```

### 3. 数据格式化

#### [概念] 概念解释

数据格式化将处理后的数据转换为训练可用的格式。常见格式：JSONL、Parquet、TFRecord。格式选择影响加载效率和存储空间。

#### [代码] 代码示例

```python
import json
from typing import List, Dict, Any, Iterator
from dataclasses import dataclass, asdict
import os

@dataclass
class TrainingExample:
    """训练样本"""
    text: str
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict:
        result = {"text": self.text}
        if self.metadata:
            result["metadata"] = self.metadata
        return result

class JSONLWriter:
    """JSONL 格式写入器"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filepath, 'w', encoding='utf-8')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
    
    def write(self, example: TrainingExample):
        """写入样本"""
        self.file.write(json.dumps(example.to_dict(), ensure_ascii=False) + '\n')
    
    def write_batch(self, examples: List[TrainingExample]):
        """批量写入"""
        for example in examples:
            self.write(example)

class JSONLReader:
    """JSONL 格式读取器"""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
    
    def read_all(self) -> List[Dict]:
        """读取所有数据"""
        examples = []
        with open(self.filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    examples.append(json.loads(line))
        return examples
    
    def stream(self) -> Iterator[Dict]:
        """流式读取"""
        with open(self.filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    yield json.loads(line)

class DatasetFormatter:
    """数据集格式化器"""
    
    @staticmethod
    def to_instruction_format(
        instruction: str,
        input_text: str = "",
        output: str = ""
    ) -> Dict:
        """转换为指令格式"""
        return {
            "instruction": instruction,
            "input": input_text,
            "output": output
        }
    
    @staticmethod
    def to_conversation_format(messages: List[Dict[str, str]]) -> Dict:
        """转换为对话格式"""
        return {
            "messages": messages
        }
    
    @staticmethod
    def to_completion_format(text: str) -> Dict:
        """转换为补全格式"""
        return {
            "text": text
        }

class DatasetSplitter:
    """数据集分割器"""
    
    @staticmethod
    def split(
        examples: List[Dict],
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
        test_ratio: float = 0.1,
        shuffle: bool = True,
        seed: int = 42
    ) -> Dict[str, List[Dict]]:
        """分割数据集"""
        import random
        random.seed(seed)
        
        if shuffle:
            examples = examples.copy()
            random.shuffle(examples)
        
        n = len(examples)
        train_end = int(n * train_ratio)
        val_end = train_end + int(n * val_ratio)
        
        return {
            "train": examples[:train_end],
            "validation": examples[train_end:val_end],
            "test": examples[val_end:]
        }

class DatasetStatistics:
    """数据集统计"""
    
    @staticmethod
    def compute(examples: List[Dict]) -> Dict:
        """计算统计信息"""
        texts = [ex.get("text", "") for ex in examples]
        
        lengths = [len(text.split()) for text in texts]
        
        import statistics
        return {
            "total_examples": len(examples),
            "total_tokens": sum(lengths),
            "avg_length": statistics.mean(lengths) if lengths else 0,
            "median_length": statistics.median(lengths) if lengths else 0,
            "min_length": min(lengths) if lengths else 0,
            "max_length": max(lengths) if lengths else 0,
            "std_length": statistics.stdev(lengths) if len(lengths) > 1 else 0
        }
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 数据增强

#### [概念] 概念解释

数据增强扩充训练数据，提高模型泛化能力。方法包括：同义词替换、回译、随机删除、句子重组。增强需保持语义一致性。

#### [代码] 代码示例

```python
import random
from typing import List, Dict, Optional
import re

class DataAugmenter:
    """数据增强器"""
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
    
    def synonym_replace(self, text: str, n: int = 1) -> str:
        """同义词替换"""
        synonyms = {
            "good": ["great", "excellent", "fine", "nice"],
            "bad": ["poor", "terrible", "awful", "horrible"],
            "big": ["large", "huge", "enormous", "massive"],
            "small": ["tiny", "little", "miniature", "petite"],
            "fast": ["quick", "rapid", "swift", "speedy"],
            "slow": ["sluggish", "gradual", "leisurely", "unhurried"]
        }
        
        words = text.split()
        replaced = 0
        
        for i, word in enumerate(words):
            if replaced >= n:
                break
            
            word_lower = word.lower()
            if word_lower in synonyms:
                synonym = random.choice(synonyms[word_lower])
                words[i] = synonym if word.islower() else synonym.capitalize()
                replaced += 1
        
        return ' '.join(words)
    
    def random_delete(self, text: str, p: float = 0.1) -> str:
        """随机删除词"""
        words = text.split()
        
        if len(words) == 1:
            return text
        
        new_words = []
        for word in words:
            if random.random() > p:
                new_words.append(word)
        
        if not new_words:
            return random.choice(words)
        
        return ' '.join(new_words)
    
    def random_swap(self, text: str, n: int = 1) -> str:
        """随机交换词"""
        words = text.split()
        
        if len(words) < 2:
            return text
        
        for _ in range(n):
            idx1, idx2 = random.sample(range(len(words)), 2)
            words[idx1], words[idx2] = words[idx2], words[idx1]
        
        return ' '.join(words)
    
    def random_insert(self, text: str, n: int = 1) -> str:
        """随机插入词"""
        synonyms = {
            "good": ["great", "excellent", "fine"],
            "bad": ["poor", "terrible", "awful"],
            "big": ["large", "huge", "enormous"],
            "small": ["tiny", "little", "miniature"]
        }
        
        words = text.split()
        
        for _ in range(n):
            word = random.choice(words)
            word_lower = word.lower()
            
            if word_lower in synonyms:
                synonym = random.choice(synonyms[word_lower])
                insert_idx = random.randint(0, len(words))
                words.insert(insert_idx, synonym)
        
        return ' '.join(words)
    
    def augment(self, text: str, methods: List[str] = None) -> List[str]:
        """应用多种增强方法"""
        methods = methods or ["synonym_replace", "random_delete", "random_swap"]
        
        augmented = [text]
        
        for method in methods:
            if method == "synonym_replace":
                augmented.append(self.synonym_replace(text))
            elif method == "random_delete":
                augmented.append(self.random_delete(text))
            elif method == "random_swap":
                augmented.append(self.random_swap(text))
            elif method == "random_insert":
                augmented.append(self.random_insert(text))
        
        return augmented

class BackTranslator:
    """回译增强器"""
    
    def __init__(self):
        pass
    
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """翻译文本"""
        return f"[Translated from {source_lang} to {target_lang}]: {text}"
    
    def back_translate(self, text: str, intermediate_lang: str = "zh") -> str:
        """回译"""
        translated = self.translate(text, "en", intermediate_lang)
        back_translated = self.translate(translated, intermediate_lang, "en")
        return back_translated

class InstructionAugmenter:
    """指令数据增强"""
    
    def augment_instruction(self, instruction: str) -> List[str]:
        """增强指令"""
        templates = [
            "Please {instruction}",
            "Can you {instruction}?",
            "I need you to {instruction}",
            "Help me {instruction}",
            "{instruction}"
        ]
        
        instruction_lower = instruction.lower()
        if instruction_lower.startswith("please "):
            base = instruction[7:]
        elif instruction_lower.startswith("can you "):
            base = instruction[8:]
        elif instruction_lower.startswith("i need you to "):
            base = instruction[14:]
        elif instruction_lower.startswith("help me "):
            base = instruction[8:]
        else:
            base = instruction
        
        augmented = []
        for template in templates:
            augmented.append(template.format(instruction=base))
        
        return augmented
```

### 2. 数据质量评估

#### [概念] 概念解释

数据质量评估衡量数据集的整体质量。维度包括：完整性、准确性、一致性、多样性。高质量数据是模型性能的保障。

#### [代码] 代码示例

```python
from typing import List, Dict, Any
from dataclasses import dataclass
import statistics

@dataclass
class QualityReport:
    """质量报告"""
    total_samples: int
    valid_samples: int
    invalid_samples: int
    duplicate_count: int
    avg_length: float
    length_distribution: Dict[str, int]
    language_distribution: Dict[str, float]
    issues: List[Dict[str, Any]]

class DataQualityAssessor:
    """数据质量评估器"""
    
    def __init__(self):
        self.min_length = 10
        self.max_length = 100000
    
    def assess(self, examples: List[Dict]) -> QualityReport:
        """评估数据质量"""
        total = len(examples)
        valid = 0
        invalid = 0
        duplicates = 0
        issues = []
        
        seen = set()
        lengths = []
        languages = {}
        
        for i, example in enumerate(examples):
            text = example.get("text", "")
            
            if not text:
                invalid += 1
                issues.append({
                    "index": i,
                    "type": "empty_text",
                    "message": "Text is empty"
                })
                continue
            
            text_hash = hash(text)
            if text_hash in seen:
                duplicates += 1
                issues.append({
                    "index": i,
                    "type": "duplicate",
                    "message": "Duplicate text found"
                })
                continue
            seen.add(text_hash)
            
            length = len(text.split())
            lengths.append(length)
            
            if length < self.min_length:
                issues.append({
                    "index": i,
                    "type": "too_short",
                    "message": f"Text too short: {length} words"
                })
            elif length > self.max_length:
                issues.append({
                    "index": i,
                    "type": "too_long",
                    "message": f"Text too long: {length} words"
                })
            else:
                valid += 1
        
        length_dist = self._compute_length_distribution(lengths)
        
        return QualityReport(
            total_samples=total,
            valid_samples=valid,
            invalid_samples=invalid,
            duplicate_count=duplicates,
            avg_length=statistics.mean(lengths) if lengths else 0,
            length_distribution=length_dist,
            language_distribution=languages,
            issues=issues
        )
    
    def _compute_length_distribution(self, lengths: List[int]) -> Dict[str, int]:
        """计算长度分布"""
        bins = {
            "0-100": 0,
            "100-500": 0,
            "500-1000": 0,
            "1000-5000": 0,
            "5000+": 0
        }
        
        for length in lengths:
            if length < 100:
                bins["0-100"] += 1
            elif length < 500:
                bins["100-500"] += 1
            elif length < 1000:
                bins["500-1000"] += 1
            elif length < 5000:
                bins["1000-5000"] += 1
            else:
                bins["5000+"] += 1
        
        return bins

class DiversityAnalyzer:
    """多样性分析器"""
    
    def analyze(self, examples: List[Dict]) -> Dict:
        """分析数据多样性"""
        texts = [ex.get("text", "") for ex in examples]
        
        vocab = set()
        total_words = 0
        
        for text in texts:
            words = text.lower().split()
            vocab.update(words)
            total_words += len(words)
        
        unique_ratio = len(vocab) / total_words if total_words > 0 else 0
        
        topics = self._extract_topics(texts)
        
        return {
            "vocabulary_size": len(vocab),
            "total_words": total_words,
            "unique_word_ratio": unique_ratio,
            "estimated_topics": len(topics)
        }
    
    def _extract_topics(self, texts: List[str]) -> List[str]:
        """提取主题"""
        return ["topic_1", "topic_2", "topic_3"]
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Data Deduplication | 数据去重，MinHash、SimHash |
| PII Detection | 个人信息检测与脱敏 |
| Language Detection | 语言检测，多语言处理 |
| SentencePiece | 子词分词算法 |
| Byte-Pair Encoding | BPE 子词分割 |
| WordPiece | WordPiece 分词算法 |
| Data Mixing | 数据混合策略 |
| Curriculum Learning | 课程学习，数据排序 |
| Active Learning | 主动学习，数据选择 |
| Synthetic Data | 合成数据生成 |
