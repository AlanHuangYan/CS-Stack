# 推荐系统 三层深度学习教程

## [总览] 技术总览

推荐系统预测用户对物品的偏好，广泛应用于电商、视频、音乐等领域。核心方法包括协同过滤、内容过滤、混合推荐等。推荐系统是数据挖掘和机器学习的重要应用场景。

本教程采用三层漏斗学习法：**核心层**聚焦协同过滤、矩阵分解、相似度计算三大基石；**重点层**深入内容推荐和混合方法；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 协同过滤

#### [概念] 概念解释

协同过滤基于用户行为相似性进行推荐。用户协同过滤找相似用户，物品协同过滤找相似物品。核心思想是：相似用户有相似偏好，相似物品被相似用户喜欢。

#### [代码] 代码示例

```python
import numpy as np
from typing import Dict, List, Tuple, Set
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class Rating:
    """评分记录"""
    user_id: int
    item_id: int
    rating: float

class UserBasedCF:
    """基于用户的协同过滤"""
    
    def __init__(self, k: int = 20):
        self.k = k
        self.user_items: Dict[int, Dict[int, float]] = defaultdict(dict)
        self.user_mean: Dict[int, float] = {}
        self.user_similarity: Dict[Tuple[int, int], float] = {}
    
    def fit(self, ratings: List[Rating]) -> 'UserBasedCF':
        """训练模型"""
        for r in ratings:
            self.user_items[r.user_id][r.item_id] = r.rating
        
        for user_id, items in self.user_items.items():
            self.user_mean[user_id] = np.mean(list(items.values()))
        
        users = list(self.user_items.keys())
        for i, u1 in enumerate(users):
            for u2 in users[i + 1:]:
                sim = self._cosine_similarity(u1, u2)
                if sim > 0:
                    self.user_similarity[(u1, u2)] = sim
                    self.user_similarity[(u2, u1)] = sim
        
        return self
    
    def _cosine_similarity(self, u1: int, u2: int) -> float:
        """计算余弦相似度"""
        items1 = self.user_items[u1]
        items2 = self.user_items[u2]
        
        common_items = set(items1.keys()) & set(items2.keys())
        
        if not common_items:
            return 0.0
        
        vec1 = np.array([items1[i] - self.user_mean[u1] for i in common_items])
        vec2 = np.array([items2[i] - self.user_mean[u2] for i in common_items])
        
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (norm1 * norm2)
    
    def predict(self, user_id: int, item_id: int) -> float:
        """预测评分"""
        if user_id not in self.user_mean:
            return 0.0
        
        neighbors = []
        for (u1, u2), sim in self.user_similarity.items():
            if u1 == user_id and item_id in self.user_items[u2]:
                neighbors.append((u2, sim))
        
        neighbors.sort(key=lambda x: x[1], reverse=True)
        neighbors = neighbors[:self.k]
        
        if not neighbors:
            return self.user_mean[user_id]
        
        weighted_sum = 0.0
        sim_sum = 0.0
        
        for neighbor_id, sim in neighbors:
            rating = self.user_items[neighbor_id][item_id]
            mean_rating = self.user_mean[neighbor_id]
            
            weighted_sum += sim * (rating - mean_rating)
            sim_sum += sim
        
        if sim_sum == 0:
            return self.user_mean[user_id]
        
        return self.user_mean[user_id] + weighted_sum / sim_sum
    
    def recommend(self, user_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """推荐物品"""
        if user_id not in self.user_items:
            return []
        
        rated_items = set(self.user_items[user_id].keys())
        all_items = set()
        
        for items in self.user_items.values():
            all_items.update(items.keys())
        
        candidates = all_items - rated_items
        
        predictions = [
            (item_id, self.predict(user_id, item_id))
            for item_id in candidates
        ]
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n]

class ItemBasedCF:
    """基于物品的协同过滤"""
    
    def __init__(self, k: int = 20):
        self.k = k
        self.item_users: Dict[int, Dict[int, float]] = defaultdict(dict)
        self.item_mean: Dict[int, float] = {}
        self.item_similarity: Dict[Tuple[int, int], float] = {}
    
    def fit(self, ratings: List[Rating]) -> 'ItemBasedCF':
        """训练模型"""
        for r in ratings:
            self.item_users[r.item_id][r.user_id] = r.rating
        
        for item_id, users in self.item_users.items():
            self.item_mean[item_id] = np.mean(list(users.values()))
        
        items = list(self.item_users.keys())
        for i, item1 in enumerate(items):
            for item2 in items[i + 1:]:
                sim = self._cosine_similarity(item1, item2)
                if sim > 0:
                    self.item_similarity[(item1, item2)] = sim
                    self.item_similarity[(item2, item1)] = sim
        
        return self
    
    def _cosine_similarity(self, item1: int, item2: int) -> float:
        """计算余弦相似度"""
        users1 = self.item_users[item1]
        users2 = self.item_users[item2]
        
        common_users = set(users1.keys()) & set(users2.keys())
        
        if not common_users:
            return 0.0
        
        vec1 = np.array([users1[u] - self.item_mean[item1] for u in common_users])
        vec2 = np.array([users2[u] - self.item_mean[item2] for u in common_users])
        
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (norm1 * norm2)
    
    def predict(self, user_id: int, item_id: int) -> float:
        """预测评分"""
        if item_id not in self.item_mean:
            return 0.0
        
        neighbors = []
        for (i1, i2), sim in self.item_similarity.items():
            if i1 == item_id and user_id in self.item_users[i2]:
                neighbors.append((i2, sim))
        
        neighbors.sort(key=lambda x: x[1], reverse=True)
        neighbors = neighbors[:self.k]
        
        if not neighbors:
            return self.item_mean[item_id]
        
        weighted_sum = 0.0
        sim_sum = 0.0
        
        for neighbor_id, sim in neighbors:
            rating = self.item_users[neighbor_id][user_id]
            mean_rating = self.item_mean[neighbor_id]
            
            weighted_sum += sim * (rating - mean_rating)
            sim_sum += sim
        
        if sim_sum == 0:
            return self.item_mean[item_id]
        
        return self.item_mean[item_id] + weighted_sum / sim_sum
    
    def recommend(self, user_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """推荐物品"""
        rated_items = set()
        for item_id, users in self.item_users.items():
            if user_id in users:
                rated_items.add(item_id)
        
        all_items = set(self.item_users.keys())
        candidates = all_items - rated_items
        
        predictions = [
            (item_id, self.predict(user_id, item_id))
            for item_id in candidates
        ]
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n]

ratings = [
    Rating(1, 1, 5), Rating(1, 2, 4), Rating(1, 3, 3),
    Rating(2, 1, 4), Rating(2, 2, 5), Rating(2, 4, 4),
    Rating(3, 2, 3), Rating(3, 3, 4), Rating(3, 4, 5),
    Rating(4, 1, 3), Rating(4, 3, 5), Rating(4, 4, 4),
]

user_cf = UserBasedCF(k=2)
user_cf.fit(ratings)
print("User-Based CF Recommendations for User 1:")
for item_id, score in user_cf.recommend(1):
    print(f"  Item {item_id}: predicted score {score:.2f}")

item_cf = ItemBasedCF(k=2)
item_cf.fit(ratings)
print("\nItem-Based CF Recommendations for User 1:")
for item_id, score in item_cf.recommend(1):
    print(f"  Item {item_id}: predicted score {score:.2f}")
```

### 2. 矩阵分解

#### [概念] 概念解释

矩阵分解将用户-物品评分矩阵分解为用户矩阵和物品矩阵的乘积，发现潜在特征。常用方法包括 SVD、ALS 等。矩阵分解能有效处理稀疏矩阵问题。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class MatrixFactorization:
    """矩阵分解推荐"""
    
    n_factors: int = 10
    learning_rate: float = 0.01
    regularization: float = 0.1
    n_epochs: int = 100
    
    def __post_init__(self):
        self.user_factors: np.ndarray = None
        self.item_factors: np.ndarray = None
        self.user_bias: np.ndarray = None
        self.item_bias: np.ndarray = None
        self.global_mean: float = 0.0
        self.user_map: Dict[int, int] = {}
        self.item_map: Dict[int, int] = {}
    
    def fit(self, ratings: List[Rating]) -> 'MatrixFactorization':
        """训练模型"""
        users = sorted(set(r.user_id for r in ratings))
        items = sorted(set(r.item_id for r in ratings))
        
        self.user_map = {u: i for i, u in enumerate(users)}
        self.item_map = {i: j for j, i in enumerate(items)}
        
        n_users = len(users)
        n_items = len(items)
        
        self.global_mean = np.mean([r.rating for r in ratings])
        
        self.user_factors = np.random.randn(n_users, self.n_factors) * 0.1
        self.item_factors = np.random.randn(n_items, self.n_factors) * 0.1
        self.user_bias = np.zeros(n_users)
        self.item_bias = np.zeros(n_items)
        
        for epoch in range(self.n_epochs):
            np.random.shuffle(ratings)
            
            for r in ratings:
                u = self.user_map[r.user_id]
                i = self.item_map[r.item_id]
                
                pred = self._predict_single(u, i)
                error = r.rating - pred
                
                self.user_bias[u] += self.learning_rate * (error - self.regularization * self.user_bias[u])
                self.item_bias[i] += self.learning_rate * (error - self.regularization * self.item_bias[i])
                
                user_factor = self.user_factors[u].copy()
                self.user_factors[u] += self.learning_rate * (error * self.item_factors[i] - self.regularization * self.user_factors[u])
                self.item_factors[i] += self.learning_rate * (error * user_factor - self.regularization * self.item_factors[i])
        
        return self
    
    def _predict_single(self, u: int, i: int) -> float:
        """预测单个评分"""
        return (
            self.global_mean +
            self.user_bias[u] +
            self.item_bias[i] +
            np.dot(self.user_factors[u], self.item_factors[i])
        )
    
    def predict(self, user_id: int, item_id: int) -> float:
        """预测评分"""
        if user_id not in self.user_map or item_id not in self.item_map:
            return self.global_mean
        
        u = self.user_map[user_id]
        i = self.item_map[item_id]
        
        return self._predict_single(u, i)
    
    def recommend(self, user_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """推荐物品"""
        if user_id not in self.user_map:
            return []
        
        u = self.user_map[user_id]
        
        predictions = []
        for item_id, i in self.item_map.items():
            score = self._predict_single(u, i)
            predictions.append((item_id, score))
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n]

class ALS:
    """交替最小二乘法"""
    
    def __init__(self, n_factors: int = 10, regularization: float = 0.1, n_epochs: int = 20):
        self.n_factors = n_factors
        self.regularization = regularization
        self.n_epochs = n_epochs
        self.user_factors: np.ndarray = None
        self.item_factors: np.ndarray = None
    
    def fit(self, rating_matrix: np.ndarray) -> 'ALS':
        """训练模型"""
        n_users, n_items = rating_matrix.shape
        
        self.user_factors = np.random.randn(n_users, self.n_factors) * 0.1
        self.item_factors = np.random.randn(n_items, self.n_factors) * 0.1
        
        mask = rating_matrix > 0
        
        for _ in range(self.n_epochs):
            for u in range(n_users):
                user_mask = mask[u]
                if not user_mask.any():
                    continue
                
                V = self.item_factors[user_mask]
                R = rating_matrix[u, user_mask]
                
                A = V.T @ V + self.regularization * np.eye(self.n_factors)
                b = V.T @ R
                
                self.user_factors[u] = np.linalg.solve(A, b)
            
            for i in range(n_items):
                item_mask = mask[:, i]
                if not item_mask.any():
                    continue
                
                U = self.user_factors[item_mask]
                R = rating_matrix[item_mask, i]
                
                A = U.T @ U + self.regularization * np.eye(self.n_factors)
                b = U.T @ R
                
                self.item_factors[i] = np.linalg.solve(A, b)
        
        return self
    
    def predict(self, user_id: int, item_id: int) -> float:
        """预测评分"""
        return np.dot(self.user_factors[user_id], self.item_factors[item_id])
    
    def recommend(self, user_id: int, rated_items: set, n: int = 10) -> List[Tuple[int, float]]:
        """推荐物品"""
        scores = self.user_factors[user_id] @ self.item_factors.T
        
        predictions = []
        for item_id, score in enumerate(scores):
            if item_id not in rated_items:
                predictions.append((item_id, score))
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n]

mf = MatrixFactorization(n_factors=5, n_epochs=50)
mf.fit(ratings)

print("Matrix Factorization Recommendations for User 1:")
for item_id, score in mf.recommend(1):
    print(f"  Item {item_id}: predicted score {score:.2f}")
```

### 3. 相似度计算

#### [概念] 概念解释

相似度计算是推荐系统的核心，常用方法包括余弦相似度、皮尔逊相关系数、Jaccard 相似度等。选择合适的相似度度量对推荐效果至关重要。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Set
from dataclasses import dataclass

@dataclass
class SimilarityMetrics:
    """相似度度量"""
    
    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """余弦相似度"""
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (norm1 * norm2)
    
    @staticmethod
    def pearson_correlation(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """皮尔逊相关系数"""
        mean1 = np.mean(vec1)
        mean2 = np.mean(vec2)
        
        centered1 = vec1 - mean1
        centered2 = vec2 - mean2
        
        norm1 = np.linalg.norm(centered1)
        norm2 = np.linalg.norm(centered2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return np.dot(centered1, centered2) / (norm1 * norm2)
    
    @staticmethod
    def jaccard_similarity(set1: Set, set2: Set) -> float:
        """Jaccard 相似度"""
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    @staticmethod
    def euclidean_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """欧氏距离相似度"""
        distance = np.linalg.norm(vec1 - vec2)
        return 1 / (1 + distance)

class SimilarityCalculator:
    """相似度计算器"""
    
    def __init__(self, metric: str = 'cosine'):
        self.metric = metric
        self.metrics = SimilarityMetrics()
    
    def compute(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """计算相似度"""
        if self.metric == 'cosine':
            return self.metrics.cosine_similarity(vec1, vec2)
        elif self.metric == 'pearson':
            return self.metrics.pearson_correlation(vec1, vec2)
        elif self.metric == 'euclidean':
            return self.metrics.euclidean_similarity(vec1, vec2)
        else:
            raise ValueError(f"Unknown metric: {self.metric}")
    
    def compute_matrix(self, matrix: np.ndarray) -> np.ndarray:
        """计算相似度矩阵"""
        n = matrix.shape[0]
        similarity_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i + 1, n):
                sim = self.compute(matrix[i], matrix[j])
                similarity_matrix[i, j] = sim
                similarity_matrix[j, i] = sim
        
        np.fill_diagonal(similarity_matrix, 1.0)
        
        return similarity_matrix

vec1 = np.array([1, 2, 3, 4, 5])
vec2 = np.array([2, 3, 4, 5, 6])
vec3 = np.array([5, 4, 3, 2, 1])

calc = SimilarityCalculator(metric='cosine')
print(f"Cosine Similarity(vec1, vec2): {calc.compute(vec1, vec2):.4f}")
print(f"Cosine Similarity(vec1, vec3): {calc.compute(vec1, vec3):.4f}")

calc_pearson = SimilarityCalculator(metric='pearson')
print(f"Pearson Correlation(vec1, vec2): {calc_pearson.compute(vec1, vec2):.4f}")
print(f"Pearson Correlation(vec1, vec3): {calc_pearson.compute(vec1, vec3):.4f}")

set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}
print(f"Jaccard Similarity: {SimilarityMetrics.jaccard_similarity(set1, set2):.4f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 内容推荐

#### [概念] 概念解释

内容推荐基于物品特征和用户偏好进行推荐。通过分析物品的内容特征（文本、标签、属性等），找到与用户历史偏好相似的物品。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from dataclasses import dataclass

@dataclass
class Item:
    """物品"""
    id: int
    title: str
    tags: List[str]
    features: np.ndarray = None

class ContentBasedRecommender:
    """基于内容的推荐"""
    
    def __init__(self, n_features: int = 10):
        self.n_features = n_features
        self.items: Dict[int, Item] = {}
        self.tag_index: Dict[str, int] = {}
        self.user_profiles: Dict[int, np.ndarray] = {}
    
    def add_items(self, items: List[Item]):
        """添加物品"""
        all_tags = set()
        for item in items:
            all_tags.update(item.tags)
        
        self.tag_index = {tag: i for i, tag in enumerate(sorted(all_tags))}
        
        for item in items:
            features = np.zeros(len(self.tag_index))
            for tag in item.tags:
                if tag in self.tag_index:
                    features[self.tag_index[tag]] = 1.0
            item.features = features
            self.items[item.id] = item
    
    def update_user_profile(self, user_id: int, liked_items: List[int]):
        """更新用户画像"""
        if not liked_items:
            return
        
        profile = np.zeros(len(self.tag_index))
        
        for item_id in liked_items:
            if item_id in self.items:
                profile += self.items[item_id].features
        
        norm = np.linalg.norm(profile)
        if norm > 0:
            profile = profile / norm
        
        self.user_profiles[user_id] = profile
    
    def recommend(self, user_id: int, n: int = 10, exclude: List[int] = None) -> List[Tuple[int, float]]:
        """推荐物品"""
        if user_id not in self.user_profiles:
            return []
        
        profile = self.user_profiles[user_id]
        exclude = exclude or []
        
        scores = []
        for item_id, item in self.items.items():
            if item_id in exclude:
                continue
            
            similarity = np.dot(profile, item.features)
            norm = np.linalg.norm(item.features)
            if norm > 0:
                similarity /= norm
            
            scores.append((item_id, similarity))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return scores[:n]

class TFIDFRecommender:
    """TF-IDF 内容推荐"""
    
    def __init__(self):
        self.idf: Dict[str, float] = {}
        self.items: Dict[int, Dict[str, float]] = {}
    
    def fit(self, documents: Dict[int, List[str]]):
        """训练模型"""
        n_docs = len(documents)
        doc_freq = Counter()
        
        for doc_id, terms in documents.items():
            unique_terms = set(terms)
            for term in unique_terms:
                doc_freq[term] += 1
        
        self.idf = {
            term: np.log(n_docs / (freq + 1)) + 1
            for term, freq in doc_freq.items()
        }
        
        for doc_id, terms in documents.items():
            tf = Counter(terms)
            total = len(terms)
            
            tfidf = {}
            for term, count in tf.items():
                tf_val = count / total
                tfidf[term] = tf_val * self.idf.get(term, 1.0)
            
            self.items[doc_id] = tfidf
    
    def similarity(self, doc1: Dict[str, float], doc2: Dict[str, float]) -> float:
        """计算相似度"""
        common_terms = set(doc1.keys()) & set(doc2.keys())
        
        if not common_terms:
            return 0.0
        
        dot_product = sum(doc1[t] * doc2[t] for t in common_terms)
        norm1 = np.sqrt(sum(v ** 2 for v in doc1.values()))
        norm2 = np.sqrt(sum(v ** 2 for v in doc2.values()))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def recommend(self, query_doc: int, n: int = 10) -> List[Tuple[int, float]]:
        """推荐相似文档"""
        if query_doc not in self.items:
            return []
        
        query_vec = self.items[query_doc]
        
        scores = []
        for doc_id, doc_vec in self.items.items():
            if doc_id == query_doc:
                continue
            
            sim = self.similarity(query_vec, doc_vec)
            scores.append((doc_id, sim))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return scores[:n]

items = [
    Item(1, "Python 入门", ["编程", "Python", "入门"]),
    Item(2, "Java 基础", ["编程", "Java", "入门"]),
    Item(3, "Python 数据分析", ["Python", "数据", "分析"]),
    Item(4, "机器学习", ["AI", "机器学习", "Python"]),
    Item(5, "深度学习", ["AI", "深度学习", "神经网络"]),
]

recommender = ContentBasedRecommender()
recommender.add_items(items)
recommender.update_user_profile(1, [1, 3])

print("Content-Based Recommendations for User 1:")
for item_id, score in recommender.recommend(1, n=3, exclude=[1, 3]):
    print(f"  Item {item_id}: {recommender.items[item_id].title} (score: {score:.4f})")
```

### 2. 混合推荐

#### [概念] 概念解释

混合推荐结合多种推荐方法的优势，常见策略包括加权融合、切换、级联、特征组合等。混合推荐能有效缓解冷启动和数据稀疏问题。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class HybridRecommender:
    """混合推荐系统"""
    
    cf_weight: float = 0.5
    content_weight: float = 0.5
    
    def __post_init__(self):
        self.cf_scores: Dict[int, Dict[int, float]] = {}
        self.content_scores: Dict[int, Dict[int, float]] = {}
    
    def set_cf_scores(self, scores: Dict[int, Dict[int, float]]):
        """设置协同过滤分数"""
        self.cf_scores = scores
    
    def set_content_scores(self, scores: Dict[int, Dict[int, float]]):
        """设置内容推荐分数"""
        self.content_scores = scores
    
    def _normalize_scores(self, scores: Dict[int, float]) -> Dict[int, float]:
        """归一化分数"""
        if not scores:
            return {}
        
        values = list(scores.values())
        min_val = min(values)
        max_val = max(values)
        
        if max_val == min_val:
            return {k: 0.5 for k in scores}
        
        return {
            k: (v - min_val) / (max_val - min_val)
            for k, v in scores.items()
        }
    
    def recommend(self, user_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """混合推荐"""
        cf_user_scores = self.cf_scores.get(user_id, {})
        content_user_scores = self.content_scores.get(user_id, {})
        
        cf_norm = self._normalize_scores(cf_user_scores)
        content_norm = self._normalize_scores(content_user_scores)
        
        all_items = set(cf_norm.keys()) | set(content_norm.keys())
        
        final_scores = []
        for item_id in all_items:
            cf_score = cf_norm.get(item_id, 0.0)
            content_score = content_norm.get(item_id, 0.0)
            
            final_score = self.cf_weight * cf_score + self.content_weight * content_score
            final_scores.append((item_id, final_score))
        
        final_scores.sort(key=lambda x: x[1], reverse=True)
        
        return final_scores[:n]

class CascadeRecommender:
    """级联推荐"""
    
    def __init__(self, n_candidates: int = 50):
        self.n_candidates = n_candidates
        self.first_stage = None
        self.second_stage = None
    
    def set_stages(self, first_stage, second_stage):
        """设置推荐阶段"""
        self.first_stage = first_stage
        self.second_stage = second_stage
    
    def recommend(self, user_id: int, n: int = 10) -> List[Tuple[int, float]]:
        """级联推荐"""
        if self.first_stage is None:
            return []
        
        candidates = self.first_stage.recommend(user_id, n=self.n_candidates)
        
        if self.second_stage is None:
            return candidates[:n]
        
        candidate_items = [item_id for item_id, _ in candidates]
        
        final_scores = []
        for item_id in candidate_items:
            score = self.second_stage.predict(user_id, item_id)
            final_scores.append((item_id, score))
        
        final_scores.sort(key=lambda x: x[1], reverse=True)
        
        return final_scores[:n]

cf_scores = {
    1: {1: 4.5, 2: 4.0, 3: 3.5, 4: 4.2, 5: 3.0},
    2: {1: 3.0, 2: 4.5, 3: 4.0, 4: 3.5, 5: 4.0},
}

content_scores = {
    1: {1: 4.0, 2: 3.0, 3: 4.5, 4: 4.8, 5: 3.5},
    2: {1: 3.5, 2: 4.0, 3: 3.0, 4: 4.0, 5: 4.5},
}

hybrid = HybridRecommender(cf_weight=0.6, content_weight=0.4)
hybrid.set_cf_scores(cf_scores)
hybrid.set_content_scores(content_scores)

print("Hybrid Recommendations for User 1:")
for item_id, score in hybrid.recommend(1, n=5):
    print(f"  Item {item_id}: score={score:.4f}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| SVD++ | 考虑隐式反馈的矩阵分解 |
| BPR | 贝叶斯个性化排序 |
| WRMF | 加权正则化矩阵分解 |
| LightFM | 混合推荐库 |
| Factorization Machines | 因子分解机 |
| DeepFM | 深度因子分解机 |
| NCF | 神经协同过滤 |
| AutoRec | 自编码器推荐 |
| CDAE | 协同去噪自编码器 |
| Graph Neural Networks | 图神经网络推荐 |
| Knowledge Graph | 知识图谱推荐 |
| Session-based | 会话推荐 |
| Sequential | 序列推荐 |
| Multi-task | 多任务推荐 |
| Reinforcement Learning | 强化学习推荐 |

---

## [实战] 核心实战清单

### 实战任务 1：电影推荐系统

构建一个完整的电影推荐系统。要求：
1. 加载电影评分数据
2. 实现用户协同过滤和矩阵分解两种方法
3. 比较两种方法的推荐效果
4. 实现混合推荐，输出最终推荐列表
