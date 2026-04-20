# 文本挖掘 三层深度学习教程

## [总览] 技术总览

文本挖掘从非结构化文本中提取有价值的信息，包括文本分类、情感分析、主题建模、命名实体识别等。文本挖掘是自然语言处理的重要应用领域。

本教程采用三层漏斗学习法：**核心层**聚焦文本预处理、TF-IDF、文本分类三大基石；**重点层**深入主题建模和情感分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 文本预处理

#### [概念] 概念解释

文本预处理将原始文本转换为结构化格式，包括分词、去除停用词、词干提取、词形还原等步骤。预处理质量直接影响后续分析效果。

#### [代码] 代码示例

```python
import re
from typing import List, Set, Dict
from collections import Counter
from dataclasses import dataclass

@dataclass
class TextPreprocessor:
    """文本预处理器"""
    
    lowercase: bool = True
    remove_punctuation: bool = True
    remove_numbers: bool = False
    remove_stopwords: bool = True
    
    def __post_init__(self):
        self.stopwords: Set[str] = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
            'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
            'through', 'during', 'before', 'after', 'above', 'below',
            'between', 'under', 'again', 'further', 'then', 'once',
            'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'each', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
            'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because',
            'until', 'while', 'this', 'that', 'these', 'those', 'it'
        }
        
        self.punctuation_pattern = re.compile(r'[^\w\s]')
        self.number_pattern = re.compile(r'\d+')
    
    def tokenize(self, text: str) -> List[str]:
        """分词"""
        if self.lowercase:
            text = text.lower()
        
        if self.remove_punctuation:
            text = self.punctuation_pattern.sub(' ', text)
        
        if self.remove_numbers:
            text = self.number_pattern.sub('', text)
        
        tokens = text.split()
        
        if self.remove_stopwords:
            tokens = [t for t in tokens if t not in self.stopwords]
        
        return tokens
    
    def preprocess(self, texts: List[str]) -> List[List[str]]:
        """预处理文本列表"""
        return [self.tokenize(text) for text in texts]

class Stemmer:
    """词干提取器（Porter 算法简化版）"""
    
    def __init__(self):
        self.vowels = set('aeiou')
    
    def _is_consonant(self, word: str, i: int) -> bool:
        """判断是否辅音"""
        if word[i] in self.vowels:
            return False
        if word[i] == 'y':
            if i == 0:
                return True
            return not self._is_consonant(word, i - 1)
        return True
    
    def _measure(self, word: str) -> int:
        """计算词的度量"""
        m = 0
        i = 0
        n = len(word)
        
        while i < n and self._is_consonant(word, i):
            i += 1
        
        while i < n:
            while i < n and not self._is_consonant(word, i):
                i += 1
            if i < n:
                m += 1
                while i < n and self._is_consonant(word, i):
                    i += 1
        
        return m
    
    def stem(self, word: str) -> str:
        """提取词干"""
        if len(word) <= 2:
            return word
        
        if word.endswith('sses'):
            word = word[:-2]
        elif word.endswith('ies'):
            word = word[:-2]
        elif word.endswith('ss'):
            pass
        elif word.endswith('s'):
            word = word[:-1]
        
        if word.endswith('eed'):
            stem = word[:-3]
            if self._measure(stem) > 0:
                word = stem
        
        if word.endswith('ing') or word.endswith('ed'):
            stem = word[:-3] if word.endswith('ing') else word[:-2]
            if any(v in stem for v in self.vowels):
                word = stem
                if word.endswith('at') or word.endswith('bl') or word.endswith('iz'):
                    word += 'e'
        
        if word.endswith('y'):
            stem = word[:-1]
            if any(v in stem for v in self.vowels):
                word = stem + 'i'
        
        return word
    
    def stem_words(self, words: List[str]) -> List[str]:
        """批量提取词干"""
        return [self.stem(word) for word in words]

class Lemmatizer:
    """词形还原器（简化版）"""
    
    def __init__(self):
        self.lemmas: Dict[str, str] = {
            'running': 'run', 'runs': 'run', 'ran': 'run',
            'going': 'go', 'goes': 'go', 'went': 'go', 'gone': 'go',
            'eating': 'eat', 'eats': 'eat', 'ate': 'eat', 'eaten': 'eat',
            'better': 'good', 'best': 'good',
            'worse': 'bad', 'worst': 'bad',
            'children': 'child', 'men': 'man', 'women': 'woman',
            'teeth': 'tooth', 'feet': 'foot',
            'studies': 'study', 'studied': 'study', 'studying': 'study',
            'flies': 'fly', 'flew': 'fly', 'flown': 'fly', 'flying': 'fly',
        }
    
    def lemmatize(self, word: str) -> str:
        """词形还原"""
        word_lower = word.lower()
        
        if word_lower in self.lemmas:
            return self.lemmas[word_lower]
        
        if word_lower.endswith('ies'):
            return word_lower[:-3] + 'y'
        if word_lower.endswith('es') and len(word_lower) > 3:
            return word_lower[:-2]
        if word_lower.endswith('s') and len(word_lower) > 2:
            return word_lower[:-1]
        if word_lower.endswith('ed') and len(word_lower) > 3:
            return word_lower[:-2]
        if word_lower.endswith('ing') and len(word_lower) > 4:
            return word_lower[:-3]
        
        return word_lower
    
    def lemmatize_words(self, words: List[str]) -> List[str]:
        """批量词形还原"""
        return [self.lemmatize(word) for word in words]

texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Natural language processing is a fascinating field!",
    "Text mining extracts valuable information from documents."
]

preprocessor = TextPreprocessor()
tokens_list = preprocessor.preprocess(texts)

print("Tokenized texts:")
for i, tokens in enumerate(tokens_list):
    print(f"  {i + 1}: {tokens}")

stemmer = Stemmer()
stemmed = [stemmer.stem_words(tokens) for tokens in tokens_list]
print("\nStemmed texts:")
for i, tokens in enumerate(stemmed):
    print(f"  {i + 1}: {tokens}")

lemmatizer = Lemmatizer()
lemmatized = [lemmatizer.lemmatize_words(tokens) for tokens in tokens_list]
print("\nLemmatized texts:")
for i, tokens in enumerate(lemmatized):
    print(f"  {i + 1}: {tokens}")
```

### 2. TF-IDF

#### [概念] 概念解释

TF-IDF（词频-逆文档频率）衡量词语在文档中的重要性。TF 表示词频，IDF 衡量词语的区分度。TF-IDF 是文本表示的经典方法。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass
import math

@dataclass
class TFIDFVectorizer:
    """TF-IDF 向量化器"""
    
    max_features: int = None
    min_df: int = 1
    max_df: float = 1.0
    norm: str = 'l2'
    
    def fit(self, documents: List[List[str]]) -> 'TFIDFVectorizer':
        """拟合"""
        self.n_docs = len(documents)
        
        doc_freq = Counter()
        for doc in documents:
            unique_terms = set(doc)
            for term in unique_terms:
                doc_freq[term] += 1
        
        if self.max_df < 1.0:
            max_df_count = int(self.max_df * self.n_docs)
            doc_freq = {k: v for k, v in doc_freq.items() if v <= max_df_count}
        
        doc_freq = {k: v for k, v in doc_freq.items() if v >= self.min_df}
        
        if self.max_features:
            doc_freq = dict(sorted(doc_freq.items(), key=lambda x: x[1], reverse=True)[:self.max_features])
        
        self.vocabulary_ = {term: i for i, term in enumerate(sorted(doc_freq.keys()))}
        self.idf_ = {}
        
        for term, df in doc_freq.items():
            self.idf_[term] = math.log((self.n_docs + 1) / (df + 1)) + 1
        
        return self
    
    def transform(self, documents: List[List[str]]) -> np.ndarray:
        """转换"""
        n_features = len(self.vocabulary_)
        result = np.zeros((len(documents), n_features))
        
        for i, doc in enumerate(documents):
            tf = Counter(doc)
            doc_len = len(doc)
            
            for term, count in tf.items():
                if term in self.vocabulary_:
                    j = self.vocabulary_[term]
                    tf_val = count / doc_len if doc_len > 0 else 0
                    idf_val = self.idf_.get(term, 0)
                    result[i, j] = tf_val * idf_val
        
        if self.norm == 'l2':
            norms = np.linalg.norm(result, axis=1, keepdims=True)
            norms[norms == 0] = 1
            result = result / norms
        elif self.norm == 'l1':
            norms = np.sum(np.abs(result), axis=1, keepdims=True)
            norms[norms == 0] = 1
            result = result / norms
        
        return result
    
    def fit_transform(self, documents: List[List[str]]) -> np.ndarray:
        """拟合并转换"""
        return self.fit(documents).transform(documents)
    
    def get_feature_names(self) -> List[str]:
        """获取特征名"""
        return sorted(self.vocabulary_.keys(), key=lambda x: self.vocabulary_[x])

class BM25:
    """BM25 相关性评分"""
    
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
    
    def fit(self, documents: List[List[str]]) -> 'BM25':
        """拟合"""
        self.documents = documents
        self.n_docs = len(documents)
        self.doc_lengths = [len(doc) for doc in documents]
        self.avg_doc_length = np.mean(self.doc_lengths)
        
        doc_freq = Counter()
        for doc in documents:
            for term in set(doc):
                doc_freq[term] += 1
        
        self.idf = {}
        for term, df in doc_freq.items():
            self.idf[term] = math.log((self.n_docs - df + 0.5) / (df + 0.5) + 1)
        
        self.doc_term_freqs = []
        for doc in documents:
            self.doc_term_freqs.append(Counter(doc))
        
        return self
    
    def score(self, query: List[str], doc_id: int) -> float:
        """计算文档得分"""
        score = 0.0
        doc_len = self.doc_lengths[doc_id]
        doc_tf = self.doc_term_freqs[doc_id]
        
        for term in query:
            if term not in self.idf:
                continue
            
            tf = doc_tf.get(term, 0)
            idf = self.idf[term]
            
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avg_doc_length)
            
            score += idf * numerator / denominator
        
        return score
    
    def search(self, query: List[str], top_k: int = 5) -> List[Tuple[int, float]]:
        """搜索相关文档"""
        scores = []
        
        for doc_id in range(self.n_docs):
            score = self.score(query, doc_id)
            scores.append((doc_id, score))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return scores[:top_k]

documents = [
    ['machine', 'learning', 'is', 'awesome'],
    ['deep', 'learning', 'neural', 'networks'],
    ['natural', 'language', 'processing', 'text'],
    ['machine', 'learning', 'algorithms', 'data'],
    ['text', 'mining', 'natural', 'language']
]

vectorizer = TFIDFVectorizer()
tfidf_matrix = vectorizer.fit_transform(documents)

print("TF-IDF Matrix shape:", tfidf_matrix.shape)
print("Feature names:", vectorizer.get_feature_names())
print("\nTF-IDF values for document 0:")
for i, feat in enumerate(vectorizer.get_feature_names()):
    if tfidf_matrix[0, i] > 0:
        print(f"  {feat}: {tfidf_matrix[0, i]:.4f}")

bm25 = BM25(k1=1.5, b=0.75)
bm25.fit(documents)

query = ['machine', 'learning']
results = bm25.search(query, top_k=3)

print(f"\nBM25 search for '{query}':")
for doc_id, score in results:
    print(f"  Doc {doc_id}: score={score:.4f}, content={documents[doc_id]}")
```

### 3. 文本分类

#### [概念] 概念解释

文本分类将文本分配到预定义类别，是文本挖掘的核心任务。常用方法包括朴素贝叶斯、支持向量机、深度学习等。文本分类广泛应用于垃圾邮件检测、情感分析、新闻分类等场景。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass
import math

@dataclass
class NaiveBayesClassifier:
    """朴素贝叶斯文本分类器"""
    
    alpha: float = 1.0
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'NaiveBayesClassifier':
        """训练"""
        self.classes_ = np.unique(y)
        self.n_features = X.shape[1]
        
        self.class_prior_ = {}
        self.feature_log_prob_ = {}
        
        for c in self.classes_:
            X_c = X[y == c]
            n_c = X_c.shape[0]
            
            self.class_prior_[c] = math.log(n_c / len(y))
            
            feature_counts = X_c.sum(axis=0) + self.alpha
            total_count = feature_counts.sum()
            
            self.feature_log_prob_[c] = np.log(feature_counts / total_count)
        
        return self
    
    def predict_log_proba(self, X: np.ndarray) -> np.ndarray:
        """预测对数概率"""
        result = np.zeros((X.shape[0], len(self.classes_)))
        
        for i, c in enumerate(self.classes_):
            log_proba = self.class_prior_[c]
            log_proba += X @ self.feature_log_prob_[c]
            result[:, i] = log_proba
        
        return result
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测"""
        log_proba = self.predict_log_proba(X)
        return self.classes_[np.argmax(log_proba, axis=1)]
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """预测概率"""
        log_proba = self.predict_log_proba(X)
        log_proba -= log_proba.max(axis=1, keepdims=True)
        proba = np.exp(log_proba)
        proba /= proba.sum(axis=1, keepdims=True)
        return proba

class TextClassifier:
    """文本分类器"""
    
    def __init__(self):
        self.vectorizer = TFIDFVectorizer()
        self.classifier = NaiveBayesClassifier()
    
    def fit(self, texts: List[List[str]], labels: List[str]) -> 'TextClassifier':
        """训练"""
        X = self.vectorizer.fit_transform(texts)
        y = np.array(labels)
        self.classifier.fit(X, y)
        return self
    
    def predict(self, texts: List[List[str]]) -> List[str]:
        """预测"""
        X = self.vectorizer.transform(texts)
        return self.classifier.predict(X).tolist()
    
    def predict_proba(self, texts: List[List[str]]) -> np.ndarray:
        """预测概率"""
        X = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X)

class SentimentAnalyzer:
    """情感分析器"""
    
    def __init__(self):
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful',
            'fantastic', 'awesome', 'love', 'happy', 'best',
            'beautiful', 'perfect', 'nice', 'brilliant', 'superb'
        }
        
        self.negative_words = {
            'bad', 'terrible', 'awful', 'horrible', 'worst',
            'hate', 'poor', 'disappointing', 'boring', 'waste',
            'ugly', 'fail', 'stupid', 'annoying', 'dreadful'
        }
        
        self.negation_words = {'not', 'no', 'never', 'neither', 'nobody', 'nothing'}
    
    def analyze(self, tokens: List[str]) -> Dict:
        """分析情感"""
        positive_count = 0
        negative_count = 0
        negated = False
        
        for i, token in enumerate(tokens):
            if token in self.negation_words:
                negated = True
                continue
            
            if token in self.positive_words:
                if negated:
                    negative_count += 1
                else:
                    positive_count += 1
            elif token in self.negative_words:
                if negated:
                    positive_count += 1
                else:
                    negative_count += 1
            
            if i > 0 and tokens[i - 1] not in self.negation_words:
                negated = False
        
        total = positive_count + negative_count
        if total == 0:
            sentiment = 'neutral'
            score = 0.0
        else:
            score = (positive_count - negative_count) / total
            if score > 0.1:
                sentiment = 'positive'
            elif score < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'score': score,
            'positive_count': positive_count,
            'negative_count': negative_count
        }

train_texts = [
    ['great', 'movie', 'loved', 'it'],
    ['terrible', 'film', 'waste', 'time'],
    ['awesome', 'acting', 'wonderful', 'story'],
    ['boring', 'disappointing', 'bad', 'movie'],
    ['excellent', 'performance', 'great', 'direction'],
    ['horrible', 'plot', 'worst', 'movie', 'ever']
]

train_labels = ['positive', 'negative', 'positive', 'negative', 'positive', 'negative']

classifier = TextClassifier()
classifier.fit(train_texts, train_labels)

test_texts = [
    ['great', 'film', 'loved', 'acting'],
    ['bad', 'movie', 'waste', 'money']
]

predictions = classifier.predict(test_texts)
print("Predictions:")
for text, pred in zip(test_texts, predictions):
    print(f"  {text} -> {pred}")

analyzer = SentimentAnalyzer()
reviews = [
    ['great', 'movie', 'loved', 'it'],
    ['not', 'good', 'terrible', 'acting'],
    ['the', 'movie', 'was', 'okay']
]

print("\nSentiment Analysis:")
for review in reviews:
    result = analyzer.analyze(review)
    print(f"  {review}")
    print(f"    Sentiment: {result['sentiment']}, Score: {result['score']:.2f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 主题建模

#### [概念] 概念解释

主题建模发现文档集合中的潜在主题，常用方法包括 LDA（潜在狄利克雷分配）、LSA（潜在语义分析）、NMF（非负矩阵分解）等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass

@dataclass
class LDASimple:
    """简化版 LDA 主题模型"""
    
    n_topics: int = 5
    n_iter: int = 100
    alpha: float = 0.1
    beta: float = 0.1
    
    def fit(self, documents: List[List[str]]) -> 'LDASimple':
        """训练"""
        self.vocabulary = list(set(word for doc in documents for word in doc))
        self.word2id = {w: i for i, w in enumerate(self.vocabulary)}
        self.n_words = len(self.vocabulary)
        self.n_docs = len(documents)
        
        self.doc_word_ids = []
        for doc in documents:
            self.doc_word_ids.append([self.word2id[w] for w in doc if w in self.word2id])
        
        self.topic_assignments = []
        for doc in self.doc_word_ids:
            self.topic_assignments.append([np.random.randint(self.n_topics) for _ in doc])
        
        self.topic_word_counts = np.zeros((self.n_topics, self.n_words))
        self.doc_topic_counts = np.zeros((self.n_docs, self.n_topics))
        self.topic_counts = np.zeros(self.n_topics)
        
        for d, doc in enumerate(self.doc_word_ids):
            for i, word_id in enumerate(doc):
                topic = self.topic_assignments[d][i]
                self.topic_word_counts[topic, word_id] += 1
                self.doc_topic_counts[d, topic] += 1
                self.topic_counts[topic] += 1
        
        for _ in range(self.n_iter):
            self._gibbs_sample()
        
        self.topic_word_dist = self._compute_topic_word_dist()
        self.doc_topic_dist = self._compute_doc_topic_dist()
        
        return self
    
    def _gibbs_sample(self):
        """Gibbs 采样"""
        for d, doc in enumerate(self.doc_word_ids):
            for i, word_id in enumerate(doc):
                old_topic = self.topic_assignments[d][i]
                
                self.topic_word_counts[old_topic, word_id] -= 1
                self.doc_topic_counts[d, old_topic] -= 1
                self.topic_counts[old_topic] -= 1
                
                probs = np.zeros(self.n_topics)
                for k in range(self.n_topics):
                    p_word_given_topic = (self.topic_word_counts[k, word_id] + self.beta) / \
                                        (self.topic_counts[k] + self.n_words * self.beta)
                    p_topic_given_doc = (self.doc_topic_counts[d, k] + self.alpha) / \
                                       (len(doc) + self.n_topics * self.alpha)
                    probs[k] = p_word_given_topic * p_topic_given_doc
                
                probs /= probs.sum()
                new_topic = np.random.choice(self.n_topics, p=probs)
                
                self.topic_assignments[d][i] = new_topic
                self.topic_word_counts[new_topic, word_id] += 1
                self.doc_topic_counts[d, new_topic] += 1
                self.topic_counts[new_topic] += 1
    
    def _compute_topic_word_dist(self) -> np.ndarray:
        """计算主题-词分布"""
        dist = (self.topic_word_counts + self.beta) / \
               (self.topic_counts.reshape(-1, 1) + self.n_words * self.beta)
        return dist
    
    def _compute_doc_topic_dist(self) -> np.ndarray:
        """计算文档-主题分布"""
        dist = (self.doc_topic_counts + self.alpha) / \
               (self.doc_topic_counts.sum(axis=1, keepdims=True) + self.n_topics * self.alpha)
        return dist
    
    def get_top_words(self, topic_id: int, n: int = 10) -> List[Tuple[str, float]]:
        """获取主题的 top 词"""
        word_probs = self.topic_word_dist[topic_id]
        top_indices = np.argsort(word_probs)[-n:][::-1]
        
        return [(self.vocabulary[i], word_probs[i]) for i in top_indices]

class NMF:
    """非负矩阵分解主题模型"""
    
    def __init__(self, n_components: int = 5, max_iter: int = 100):
        self.n_components = n_components
        self.max_iter = max_iter
    
    def fit(self, X: np.ndarray) -> 'NMF':
        """训练"""
        X = np.maximum(X, 0)
        n_docs, n_words = X.shape
        
        self.W = np.random.rand(n_docs, self.n_components)
        self.H = np.random.rand(self.n_components, n_words)
        
        for _ in range(self.max_iter):
            self.H *= (self.W.T @ X) / (self.W.T @ self.W @ self.H + 1e-10)
            self.W *= (X @ self.H.T) / (self.W @ self.H @ self.H.T + 1e-10)
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        return self.W
    
    def get_topics(self, vocabulary: List[str], n: int = 10) -> List[List[Tuple[str, float]]]:
        """获取主题"""
        topics = []
        
        for k in range(self.n_components):
            word_weights = self.H[k]
            top_indices = np.argsort(word_weights)[-n:][::-1]
            topics.append([(vocabulary[i], word_weights[i]) for i in top_indices])
        
        return topics

documents = [
    ['machine', 'learning', 'data', 'algorithm'],
    ['deep', 'learning', 'neural', 'network'],
    ['natural', 'language', 'processing', 'text'],
    ['computer', 'vision', 'image', 'recognition'],
    ['machine', 'learning', 'model', 'training'],
    ['text', 'classification', 'natural', 'language']
]

lda = LDASimple(n_topics=3, n_iter=50)
lda.fit(documents)

print("LDA Topics:")
for k in range(lda.n_topics):
    top_words = lda.get_top_words(k, n=5)
    print(f"  Topic {k}: {top_words}")

vectorizer = TFIDFVectorizer()
X = vectorizer.fit_transform(documents)

nmf = NMF(n_components=3, max_iter=100)
nmf.fit(X)

print("\nNMF Topics:")
topics = nmf.get_topics(vectorizer.get_feature_names(), n=5)
for k, topic in enumerate(topics):
    print(f"  Topic {k}: {topic}")
```

### 2. 命名实体识别

#### [概念] 概念解释

命名实体识别从文本中识别出人名、地名、机构名等实体。常用方法包括规则匹配、统计模型、深度学习等。

#### [代码] 代码示例

```python
import re
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class Entity:
    """实体"""
    text: str
    label: str
    start: int
    end: int

class RuleBasedNER:
    """基于规则的命名实体识别"""
    
    def __init__(self):
        self.patterns = {
            'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'PHONE': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'DATE': r'\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b\d{2}[-/]\d{2}[-/]\d{4}\b',
            'URL': r'https?://[^\s]+|www\.[^\s]+',
            'MONEY': r'\$\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|USD)',
            'PERCENT': r'\d+(?:\.\d+)?%',
        }
        
        self.gazetteers = {
            'PERSON': ['John', 'Mary', 'David', 'Michael', 'Sarah', 'James', 'Robert'],
            'ORG': ['Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Tesla'],
            'GPE': ['New York', 'London', 'Paris', 'Tokyo', 'Beijing', 'Shanghai'],
        }
    
    def extract(self, text: str) -> List[Entity]:
        """提取实体"""
        entities = []
        
        for label, pattern in self.patterns.items():
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append(Entity(
                    text=match.group(),
                    label=label,
                    start=match.start(),
                    end=match.end()
                ))
        
        for label, gazetteer in self.gazetteers.items():
            for entity_text in gazetteer:
                pattern = r'\b' + re.escape(entity_text) + r'\b'
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    entities.append(Entity(
                        text=match.group(),
                        label=label,
                        start=match.start(),
                        end=match.end()
                    ))
        
        entities.sort(key=lambda e: e.start)
        
        return entities

class Chunker:
    """分块器"""
    
    def __init__(self):
        self.grammar = {
            'NP': r'<DT>?<JJ>*<NN>+',
            'VP': r'<VB.*><NP|PP>*',
            'PP': r'<IN><NP>',
        }
    
    def chunk(self, pos_tags: List[Tuple[str, str]]) -> List[Dict]:
        """分块"""
        chunks = []
        current_chunk = []
        current_type = None
        
        for word, tag in pos_tags:
            if tag.startswith('NN'):
                if current_type != 'NP':
                    if current_chunk:
                        chunks.append({'type': current_type, 'words': current_chunk})
                    current_chunk = [(word, tag)]
                    current_type = 'NP'
                else:
                    current_chunk.append((word, tag))
            elif tag.startswith('VB'):
                if current_chunk:
                    chunks.append({'type': current_type, 'words': current_chunk})
                current_chunk = [(word, tag)]
                current_type = 'VP'
            elif tag == 'IN':
                if current_chunk:
                    chunks.append({'type': current_type, 'words': current_chunk})
                current_chunk = [(word, tag)]
                current_type = 'PP'
            else:
                if current_chunk:
                    chunks.append({'type': current_type, 'words': current_chunk})
                    current_chunk = []
                    current_type = None
        
        if current_chunk:
            chunks.append({'type': current_type, 'words': current_chunk})
        
        return chunks

text = "John works at Google in New York. Contact him at john@google.com or call 555-123-4567."

ner = RuleBasedNER()
entities = ner.extract(text)

print("Named Entities:")
for entity in entities:
    print(f"  {entity.label}: '{entity.text}' at position {entity.start}-{entity.end}")

pos_tags = [
    ('John', 'NNP'), ('works', 'VBZ'), ('at', 'IN'), ('Google', 'NNP'),
    ('in', 'IN'), ('New', 'NNP'), ('York', 'NNP'), ('.', '.')
]

chunker = Chunker()
chunks = chunker.chunk(pos_tags)

print("\nChunks:")
for chunk in chunks:
    words = [w for w, t in chunk['words']]
    print(f"  {chunk['type']}: {' '.join(words)}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Word2Vec | 词向量表示 |
| GloVe | 全局词向量 |
| FastText | 子词嵌入 |
| BERT | 预训练语言模型 |
| GPT | 生成式预训练模型 |
| TextRank | 文本摘要 |
| KeyBERT | 关键词提取 |
| NER | 命名实体识别 |
| POS Tagging | 词性标注 |
| Dependency Parsing | 依存句法分析 |
| Coreference Resolution | 指代消解 |
| Relation Extraction | 关系抽取 |
| Event Extraction | 事件抽取 |
| Knowledge Graph | 知识图谱 |
| Question Answering | 问答系统 |

---

## [实战] 核心实战清单

### 实战任务 1：新闻分类系统

构建一个新闻分类系统。要求：
1. 加载新闻数据集，进行文本预处理
2. 使用 TF-IDF 提取特征
3. 训练朴素贝叶斯分类器
4. 评估分类性能，输出准确率和混淆矩阵
5. 对新新闻进行分类预测
