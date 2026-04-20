# NLP 应用开发 三层深度学习教程

## [总览] 技术总览

NLP 应用开发将自然语言处理技术应用于实际场景，包括文本分类、信息抽取、问答系统、机器翻译等。掌握 NLP 应用开发是成为 NLP 工程师的关键。

本教程采用三层漏斗学习法：**核心层**聚焦文本分类、信息抽取、文本摘要三大基石；**重点层**深入问答系统和对话系统；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 文本分类应用

#### [概念] 概念解释

文本分类是 NLP 最常见的应用之一，包括垃圾邮件检测、情感分析、新闻分类、意图识别等。构建文本分类系统需要数据准备、特征工程、模型训练、评估部署等步骤。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass
import re

@dataclass
class TextClassificationPipeline:
    """文本分类流水线"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.vectorizer = TFIDFVectorizer(max_features=5000)
        self.classifier = NaiveBayesClassifier()
    
    def fit(self, texts: List[str], labels: List[str]) -> 'TextClassificationPipeline':
        """训练"""
        processed = [self.preprocessor.preprocess(text) for text in texts]
        X = self.vectorizer.fit_transform(processed)
        y = np.array(labels)
        self.classifier.fit(X, y)
        return self
    
    def predict(self, texts: List[str]) -> List[str]:
        """预测"""
        processed = [self.preprocessor.preprocess(text) for text in texts]
        X = self.vectorizer.transform(processed)
        return self.classifier.predict(X).tolist()
    
    def evaluate(self, texts: List[str], labels: List[str]) -> Dict:
        """评估"""
        predictions = self.predict(texts)
        
        correct = sum(p == l for p, l in zip(predictions, labels))
        accuracy = correct / len(labels)
        
        label_metrics = {}
        unique_labels = set(labels)
        
        for label in unique_labels:
            tp = sum(1 for p, l in zip(predictions, labels) if p == label and l == label)
            fp = sum(1 for p, l in zip(predictions, labels) if p == label and l != label)
            fn = sum(1 for p, l in zip(predictions, labels) if p != label and l == label)
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            label_metrics[label] = {
                'precision': precision,
                'recall': recall,
                'f1': f1
            }
        
        return {
            'accuracy': accuracy,
            'label_metrics': label_metrics
        }

class TextPreprocessor:
    """文本预处理器"""
    
    def __init__(self):
        self.stopwords = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as'}
    
    def preprocess(self, text: str) -> List[str]:
        """预处理"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        tokens = text.split()
        tokens = [t for t in tokens if t not in self.stopwords and len(t) > 1]
        return tokens

class TFIDFVectorizer:
    """TF-IDF 向量化器"""
    
    def __init__(self, max_features: int = 5000):
        self.max_features = max_features
        self.vocabulary_: Dict[str, int] = {}
        self.idf_: Dict[str, float] = {}
    
    def fit(self, documents: List[List[str]]) -> 'TFIDFVectorizer':
        """拟合"""
        doc_freq = Counter()
        for doc in documents:
            for word in set(doc):
                doc_freq[word] += 1
        
        n_docs = len(documents)
        top_words = sorted(doc_freq.items(), key=lambda x: x[1], reverse=True)[:self.max_features]
        
        self.vocabulary_ = {word: i for i, (word, _) in enumerate(top_words)}
        
        import math
        for word in self.vocabulary_:
            self.idf_[word] = math.log((n_docs + 1) / (doc_freq[word] + 1)) + 1
        
        return self
    
    def transform(self, documents: List[List[str]]) -> np.ndarray:
        """转换"""
        n_features = len(self.vocabulary_)
        result = np.zeros((len(documents), n_features))
        
        for i, doc in enumerate(documents):
            tf = Counter(doc)
            doc_len = len(doc)
            
            for word, count in tf.items():
                if word in self.vocabulary_:
                    j = self.vocabulary_[word]
                    tf_val = count / doc_len if doc_len > 0 else 0
                    result[i, j] = tf_val * self.idf_.get(word, 0)
        
        norms = np.linalg.norm(result, axis=1, keepdims=True)
        norms[norms == 0] = 1
        result = result / norms
        
        return result
    
    def fit_transform(self, documents: List[List[str]]) -> np.ndarray:
        """拟合并转换"""
        return self.fit(documents).transform(documents)

class NaiveBayesClassifier:
    """朴素贝叶斯分类器"""
    
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'NaiveBayesClassifier':
        """训练"""
        self.classes_ = np.unique(y)
        self.class_prior_ = {}
        self.feature_log_prob_ = {}
        
        import math
        for c in self.classes_:
            X_c = X[y == c]
            n_c = X_c.shape[0]
            
            self.class_prior_[c] = math.log(n_c / len(y))
            
            feature_counts = X_c.sum(axis=0) + self.alpha
            total_count = feature_counts.sum()
            
            self.feature_log_prob_[c] = np.log(feature_counts / total_count)
        
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测"""
        result = []
        
        for x in X:
            best_class = None
            best_score = float('-inf')
            
            for c in self.classes_:
                score = self.class_prior_[c] + np.sum(x * self.feature_log_prob_[c])
                if score > best_score:
                    best_score = score
                    best_class = c
            
            result.append(best_class)
        
        return np.array(result)

train_texts = [
    "This movie is great and amazing",
    "Terrible film waste of time",
    "Excellent performance wonderful story",
    "Boring and disappointing movie",
    "Loved the acting and direction",
    "Worst movie ever horrible plot"
]

train_labels = ["positive", "negative", "positive", "negative", "positive", "negative"]

pipeline = TextClassificationPipeline()
pipeline.fit(train_texts, train_labels)

test_texts = [
    "Great film loved it",
    "Bad movie waste of money"
]

predictions = pipeline.predict(test_texts)
print("Predictions:")
for text, pred in zip(test_texts, predictions):
    print(f"  '{text}' -> {pred}")

metrics = pipeline.evaluate(train_texts, train_labels)
print(f"\nTraining Accuracy: {metrics['accuracy']:.2f}")
```

### 2. 信息抽取应用

#### [概念] 概念解释

信息抽取从非结构化文本中提取结构化信息，包括实体抽取、关系抽取、事件抽取等。信息抽取是构建知识图谱的基础。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from dataclasses import dataclass
import re

@dataclass
class ExtractedEntity:
    """提取的实体"""
    text: str
    label: str
    start: int
    end: int
    confidence: float

@dataclass
class ExtractedRelation:
    """提取的关系"""
    subject: str
    predicate: str
    object: str
    confidence: float

class EntityExtractor:
    """实体抽取器"""
    
    def __init__(self):
        self.patterns = {
            'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'PHONE': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'DATE': r'\b\d{4}[-/]\d{2}[-/]\d{2}\b',
            'MONEY': r'\$\d+(?:,\d{3})*(?:\.\d{2})?',
            'URL': r'https?://[^\s]+',
        }
        
        self.gazetteers = {
            'PERSON': ['John', 'Mary', 'David', 'Michael', 'Sarah', 'James', 'Robert', 'Emma', 'Lisa'],
            'ORG': ['Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Tesla', 'OpenAI'],
            'LOCATION': ['New York', 'London', 'Paris', 'Tokyo', 'Beijing', 'Shanghai', 'Silicon Valley'],
        }
    
    def extract(self, text: str) -> List[ExtractedEntity]:
        """提取实体"""
        entities = []
        
        for label, pattern in self.patterns.items():
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append(ExtractedEntity(
                    text=match.group(),
                    label=label,
                    start=match.start(),
                    end=match.end(),
                    confidence=1.0
                ))
        
        for label, gazetteer in self.gazetteers.items():
            for entity_text in gazetteer:
                pattern = r'\b' + re.escape(entity_text) + r'\b'
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    entities.append(ExtractedEntity(
                        text=match.group(),
                        label=label,
                        start=match.start(),
                        end=match.end(),
                        confidence=0.9
                    ))
        
        entities.sort(key=lambda e: e.start)
        
        return entities

class RelationExtractor:
    """关系抽取器"""
    
    def __init__(self):
        self.patterns = [
            (r'(.+?)\s+works\s+at\s+(.+)', 'WORKS_AT'),
            (r'(.+?)\s+is\s+the\s+CEO\s+of\s+(.+)', 'CEO_OF'),
            (r'(.+?)\s+located\s+in\s+(.+)', 'LOCATED_IN'),
            (r'(.+?)\s+founded\s+(.+)', 'FOUNDED'),
            (r'(.+?)\s+acquired\s+(.+)', 'ACQUIRED'),
        ]
    
    def extract(self, text: str, entities: List[ExtractedEntity] = None) -> List[ExtractedRelation]:
        """提取关系"""
        relations = []
        
        for pattern, predicate in self.patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                subject = match.group(1).strip()
                obj = match.group(2).strip()
                
                relations.append(ExtractedRelation(
                    subject=subject,
                    predicate=predicate,
                    object=obj,
                    confidence=0.8
                ))
        
        return relations

class EventExtractor:
    """事件抽取器"""
    
    def __init__(self):
        self.event_patterns = {
            'ACQUISITION': r'(.+?)\s+acquired\s+(.+?)\s+for\s+\$?([\d,]+)',
            'LAUNCH': r'(.+?)\s+launched\s+(.+)',
            'PARTNERSHIP': r'(.+?)\s+partnered\s+with\s+(.+)',
            'HIRING': r'(.+?)\s+hired\s+(.+?)\s+as\s+(.+)',
        }
    
    def extract(self, text: str) -> List[Dict]:
        """提取事件"""
        events = []
        
        for event_type, pattern in self.event_patterns.items():
            for match in re.finditer(pattern, text, re.IGNORECASE):
                event = {
                    'type': event_type,
                    'groups': match.groups(),
                    'span': (match.start(), match.end())
                }
                events.append(event)
        
        return events

class InformationExtractionPipeline:
    """信息抽取流水线"""
    
    def __init__(self):
        self.entity_extractor = EntityExtractor()
        self.relation_extractor = RelationExtractor()
        self.event_extractor = EventExtractor()
    
    def extract(self, text: str) -> Dict:
        """抽取信息"""
        entities = self.entity_extractor.extract(text)
        relations = self.relation_extractor.extract(text, entities)
        events = self.event_extractor.extract(text)
        
        return {
            'entities': entities,
            'relations': relations,
            'events': events
        }

text = "John works at Google in New York. Microsoft acquired OpenAI for $10,000,000,000."

pipeline = InformationExtractionPipeline()
result = pipeline.extract(text)

print("Entities:")
for entity in result['entities']:
    print(f"  {entity.label}: '{entity.text}' (confidence: {entity.confidence})")

print("\nRelations:")
for rel in result['relations']:
    print(f"  {rel.subject} --[{rel.predicate}]--> {rel.object}")

print("\nEvents:")
for event in result['events']:
    print(f"  {event['type']}: {event['groups']}")
```

### 3. 文本摘要应用

#### [概念] 概念解释

文本摘要生成文本的简短概述，包括抽取式摘要和生成式摘要。抽取式摘要从原文选择重要句子，生成式摘要重新组织语言生成摘要。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass
import re

@dataclass
class Sentence:
    """句子"""
    text: str
    index: int
    score: float = 0.0

class ExtractiveSummarizer:
    """抽取式摘要器"""
    
    def __init__(self, ratio: float = 0.3):
        self.ratio = ratio
    
    def summarize(self, text: str, n_sentences: int = None) -> str:
        """生成摘要"""
        sentences = self._split_sentences(text)
        
        if len(sentences) == 0:
            return ""
        
        if n_sentences is None:
            n_sentences = max(1, int(len(sentences) * self.ratio))
        
        scored_sentences = self._score_sentences(sentences)
        
        top_sentences = sorted(scored_sentences, key=lambda s: s.score, reverse=True)[:n_sentences]
        
        top_sentences.sort(key=lambda s: s.index)
        
        return ' '.join(s.text for s in top_sentences)
    
    def _split_sentences(self, text: str) -> List[str]:
        """分句"""
        sentences = re.split(r'[.!?。！？]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _score_sentences(self, sentences: List[str]) -> List[Sentence]:
        """句子评分"""
        word_freq = Counter()
        
        for sentence in sentences:
            words = self._tokenize(sentence)
            word_freq.update(words)
        
        max_freq = max(word_freq.values()) if word_freq else 1
        
        scored = []
        for i, sentence in enumerate(sentences):
            words = self._tokenize(sentence)
            
            if not words:
                score = 0
            else:
                score = sum(word_freq[w] / max_freq for w in set(words)) / len(words)
            
            position_bonus = 1.0 if i < 3 else 0.8
            length_penalty = min(1.0, len(words) / 20)
            
            final_score = score * position_bonus * length_penalty
            
            scored.append(Sentence(text=sentence, index=i, score=final_score))
        
        return scored
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        stopwords = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'this', 'that', 'these', 'those', 'it', 'its'}
        return [w for w in words if w not in stopwords]

class TextRankSummarizer:
    """TextRank 摘要器"""
    
    def __init__(self, damping: float = 0.85, max_iter: int = 100):
        self.damping = damping
        self.max_iter = max_iter
    
    def summarize(self, text: str, n_sentences: int = 3) -> str:
        """生成摘要"""
        sentences = self._split_sentences(text)
        
        if len(sentences) <= n_sentences:
            return text
        
        similarity_matrix = self._build_similarity_matrix(sentences)
        
        scores = self._text_rank(similarity_matrix)
        
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        top_indices = sorted(ranked_indices[:n_sentences])
        
        return ' '.join(sentences[i] for i in top_indices)
    
    def _split_sentences(self, text: str) -> List[str]:
        """分句"""
        sentences = re.split(r'[.!?。！？]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _build_similarity_matrix(self, sentences: List[str]) -> List[List[float]]:
        """构建相似度矩阵"""
        n = len(sentences)
        matrix = [[0.0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(i + 1, n):
                sim = self._sentence_similarity(sentences[i], sentences[j])
                matrix[i][j] = sim
                matrix[j][i] = sim
        
        return matrix
    
    def _sentence_similarity(self, sent1: str, sent2: str) -> float:
        """句子相似度"""
        words1 = set(self._tokenize(sent1))
        words2 = set(self._tokenize(sent2))
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1 & words2
        
        return len(intersection) / (len(words1) + len(words2) - len(intersection))
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        return re.findall(r'\b\w+\b', text.lower())
    
    def _text_rank(self, matrix: List[List[float]]) -> List[float]:
        """TextRank 算法"""
        n = len(matrix)
        scores = [1.0] * n
        
        for _ in range(self.max_iter):
            new_scores = []
            
            for i in range(n):
                score = 0.0
                
                for j in range(n):
                    if i != j and matrix[j][i] > 0:
                        out_weight = sum(matrix[j])
                        if out_weight > 0:
                            score += matrix[j][i] / out_weight * scores[j]
                
                new_scores.append((1 - self.damping) + self.damping * score)
            
            scores = new_scores
        
        return scores

text = """
Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language. It focuses on how to program computers to process and analyze large amounts of natural language data. The result is a computer capable of understanding the contents of documents. Challenges in natural language processing frequently involve speech recognition, natural language understanding, and natural language generation. Modern NLP algorithms are based on machine learning, especially statistical machine learning and deep learning.
"""

summarizer = ExtractiveSummarizer(ratio=0.4)
summary = summarizer.summarize(text)
print(f"Extractive Summary:\n{summary}")

textrank = TextRankSummarizer()
summary_tr = textrank.summarize(text, n_sentences=2)
print(f"\nTextRank Summary:\n{summary_tr}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 问答系统

#### [概念] 概念解释

问答系统自动回答用户问题，包括检索式问答、知识库问答、阅读理解问答等。问答系统是智能助手和客服机器人的核心技术。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import re

@dataclass
class QAResult:
    """问答结果"""
    question: str
    answer: str
    confidence: float
    source: str

class RetrievalQA:
    """检索式问答系统"""
    
    def __init__(self):
        self.knowledge_base: List[Dict] = []
        self.vectorizer = SimpleVectorizer()
    
    def add_knowledge(self, qa_pairs: List[Tuple[str, str]]):
        """添加知识"""
        for question, answer in qa_pairs:
            self.knowledge_base.append({
                'question': question,
                'answer': answer,
                'vector': self.vectorizer.vectorize(question)
            })
    
    def answer(self, question: str, top_k: int = 1) -> List[QAResult]:
        """回答问题"""
        query_vector = self.vectorizer.vectorize(question)
        
        scores = []
        for item in self.knowledge_base:
            score = self._cosine_similarity(query_vector, item['vector'])
            scores.append((item, score))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        
        results = []
        for item, score in scores[:top_k]:
            results.append(QAResult(
                question=question,
                answer=item['answer'],
                confidence=score,
                source='knowledge_base'
            ))
        
        return results
    
    def _cosine_similarity(self, vec1: Dict, vec2: Dict) -> float:
        """余弦相似度"""
        common_keys = set(vec1.keys()) & set(vec2.keys())
        
        if not common_keys:
            return 0.0
        
        dot = sum(vec1[k] * vec2[k] for k in common_keys)
        norm1 = sum(v ** 2 for v in vec1.values()) ** 0.5
        norm2 = sum(v ** 2 for v in vec2.values()) ** 0.5
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot / (norm1 * norm2)

class SimpleVectorizer:
    """简单向量化器"""
    
    def vectorize(self, text: str) -> Dict[str, float]:
        """向量化文本"""
        words = re.findall(r'\b\w+\b', text.lower())
        tf = {}
        
        for word in words:
            tf[word] = tf.get(word, 0) + 1
        
        return tf

class ReadingComprehensionQA:
    """阅读理解问答"""
    
    def __init__(self):
        self.documents: List[str] = []
    
    def add_documents(self, documents: List[str]):
        """添加文档"""
        self.documents.extend(documents)
    
    def answer(self, question: str, context: str = None) -> QAResult:
        """回答问题"""
        if context is None:
            context = self._find_relevant_context(question)
        
        answer = self._extract_answer(question, context)
        
        return QAResult(
            question=question,
            answer=answer,
            confidence=0.7,
            source='reading_comprehension'
        )
    
    def _find_relevant_context(self, question: str) -> str:
        """查找相关上下文"""
        if not self.documents:
            return ""
        
        question_words = set(re.findall(r'\b\w+\b', question.lower()))
        
        best_doc = ""
        best_score = 0
        
        for doc in self.documents:
            doc_words = set(re.findall(r'\b\w+\b', doc.lower()))
            overlap = len(question_words & doc_words)
            
            if overlap > best_score:
                best_score = overlap
                best_doc = doc
        
        return best_doc
    
    def _extract_answer(self, question: str, context: str) -> str:
        """提取答案"""
        sentences = re.split(r'[.!?。！？]+', context)
        
        question_words = set(re.findall(r'\b\w+\b', question.lower()))
        
        best_sentence = ""
        best_score = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            sentence_words = set(re.findall(r'\b\w+\b', sentence.lower()))
            overlap = len(question_words & sentence_words)
            
            if overlap > best_score:
                best_score = overlap
                best_sentence = sentence
        
        return best_sentence if best_sentence else "I cannot find the answer."

qa_pairs = [
    ("What is NLP?", "NLP stands for Natural Language Processing, a field of AI that focuses on the interaction between computers and human language."),
    ("What is machine learning?", "Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed."),
    ("What is deep learning?", "Deep learning is a type of machine learning that uses neural networks with multiple layers to learn complex patterns."),
]

retrieval_qa = RetrievalQA()
retrieval_qa.add_knowledge(qa_pairs)

result = retrieval_qa.answer("What is NLP?")[0]
print(f"Question: {result.question}")
print(f"Answer: {result.answer}")
print(f"Confidence: {result.confidence:.4f}")

documents = [
    "Python is a popular programming language. It was created by Guido van Rossum in 1991.",
    "Machine learning algorithms build models based on sample data to make predictions.",
]

rc_qa = ReadingComprehensionQA()
rc_qa.add_documents(documents)

result = rc_qa.answer("Who created Python?")
print(f"\nQuestion: {result.question}")
print(f"Answer: {result.answer}")
```

### 2. 对话系统

#### [概念] 概念解释

对话系统与用户进行多轮交互，包括任务型对话和闲聊对话。对话系统需要理解用户意图、管理对话状态、生成回复。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum
import re

class Intent(Enum):
    """意图枚举"""
    GREETING = "greeting"
    GOODBYE = "goodbye"
    ASK_WEATHER = "ask_weather"
    ASK_TIME = "ask_time"
    BOOK_TICKET = "book_ticket"
    UNKNOWN = "unknown"

@dataclass
class DialogState:
    """对话状态"""
    intent: Intent = Intent.UNKNOWN
    slots: Dict[str, str] = field(default_factory=dict)
    turn_count: int = 0
    history: List[Tuple[str, str]] = field(default_factory=list)

class IntentClassifier:
    """意图分类器"""
    
    def __init__(self):
        self.patterns = {
            Intent.GREETING: [r'hello', r'hi', r'hey', r'good morning', r'good afternoon'],
            Intent.GOODBYE: [r'bye', r'goodbye', r'see you', r'farewell'],
            Intent.ASK_WEATHER: [r'weather', r'temperature', r'rain', r'sunny'],
            Intent.ASK_TIME: [r'time', r'clock', r'what time'],
            Intent.BOOK_TICKET: [r'book', r'ticket', r'reserve', r'seat'],
        }
    
    def classify(self, text: str) -> Intent:
        """分类意图"""
        text = text.lower()
        
        for intent, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return intent
        
        return Intent.UNKNOWN

class SlotFiller:
    """槽位填充器"""
    
    def __init__(self):
        self.slot_patterns = {
            'destination': [r'to\s+(\w+)', r'destination\s+(?:is\s+)?(\w+)'],
            'date': [r'on\s+(\d{4}-\d{2}-\d{2})', r'(\d{4}-\d{2}-\d{2})'],
            'time': [r'at\s+(\d{1,2}:\d{2})', r'(\d{1,2}:\d{2})'],
            'city': [r'in\s+(\w+)', r'for\s+(\w+)'],
        }
    
    def fill(self, text: str, intent: Intent) -> Dict[str, str]:
        """填充槽位"""
        slots = {}
        
        if intent == Intent.BOOK_TICKET:
            for slot, patterns in self.slot_patterns.items():
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        slots[slot] = match.group(1)
                        break
        
        elif intent == Intent.ASK_WEATHER:
            for pattern in self.slot_patterns['city']:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    slots['city'] = match.group(1)
                    break
        
        return slots

class DialogManager:
    """对话管理器"""
    
    def __init__(self):
        self.state = DialogState()
        self.intent_classifier = IntentClassifier()
        self.slot_filler = SlotFiller()
        self.responses = {
            Intent.GREETING: "Hello! How can I help you today?",
            Intent.GOODBYE: "Goodbye! Have a nice day!",
            Intent.ASK_WEATHER: "The weather in {city} is sunny today.",
            Intent.ASK_TIME: "The current time is 14:30.",
            Intent.BOOK_TICKET: "I've booked your ticket to {destination} on {date}.",
            Intent.UNKNOWN: "I'm sorry, I didn't understand that. Can you rephrase?",
        }
    
    def process(self, user_input: str) -> str:
        """处理用户输入"""
        self.state.turn_count += 1
        self.state.history.append(('user', user_input))
        
        intent = self.intent_classifier.classify(user_input)
        self.state.intent = intent
        
        slots = self.slot_filler.fill(user_input, intent)
        self.state.slots.update(slots)
        
        response = self._generate_response(intent, slots)
        
        self.state.history.append(('system', response))
        
        return response
    
    def _generate_response(self, intent: Intent, slots: Dict[str, str]) -> str:
        """生成回复"""
        template = self.responses.get(intent, self.responses[Intent.UNKNOWN])
        
        try:
            return template.format(**slots)
        except KeyError:
            if intent == Intent.BOOK_TICKET:
                missing = []
                if 'destination' not in slots:
                    missing.append('destination')
                if 'date' not in slots:
                    missing.append('date')
                
                if missing:
                    return f"I need more information. Please provide: {', '.join(missing)}"
            
            return template
    
    def reset(self):
        """重置对话状态"""
        self.state = DialogState()

dialog_manager = DialogManager()

print("Dialog System Demo:")
print("-" * 40)

responses = [
    dialog_manager.process("Hello!"),
    dialog_manager.process("I want to book a ticket to Beijing on 2024-01-15"),
    dialog_manager.process("What's the weather in Shanghai?"),
    dialog_manager.process("Goodbye!"),
]

for i, response in enumerate(responses, 1):
    print(f"Turn {i}: {response}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| RAG | 检索增强生成 |
| Knowledge Graph QA | 知识图谱问答 |
| Slot Filling | 槽位填充 |
| DST | 对话状态追踪 |
| NLG | 自然语言生成 |
| Text Generation | 文本生成 |
| Machine Translation | 机器翻译 |
| Summarization | 文本摘要 |
| Paraphrase | 复述生成 |
| Style Transfer | 风格迁移 |
| Data Augmentation | 数据增强 |
| Active Learning | 主动学习 |
| Few-shot Learning | 少样本学习 |
| Zero-shot Learning | 零样本学习 |
| Prompt Engineering | 提示工程 |

---

## [实战] 核心实战清单

### 实战任务 1：智能客服系统

构建一个智能客服系统。要求：
1. 实现意图识别和槽位填充
2. 构建知识库问答模块
3. 实现多轮对话管理
4. 添加情感分析功能，对负面情绪用户转人工
5. 评估系统准确率和用户满意度
