# 聚类算法基础 三层深度学习教程

## [总览] 技术总览

聚类是无监督学习的核心技术，将相似的数据点分组到同一簇中。常用算法包括 K-Means、层次聚类、DBSCAN。广泛应用于客户分群、图像分割、异常检测等场景。

本教程采用三层漏斗学习法：**核心层**聚焦 K-Means、层次聚类、评估指标三大基石；**重点层**深入 DBSCAN 和高维聚类；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. K-Means 聚类

#### [概念] 概念解释

K-Means 是最经典的聚类算法，通过迭代优化将数据划分为 K 个簇。核心思想：最小化簇内平方误差和（SSE）。算法步骤：初始化中心点 -> 分配样本 -> 更新中心点 -> 重复直到收敛。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
import random

class KMeans:
    """K-Means 聚类实现"""
    
    def __init__(self, n_clusters: int = 3, max_iters: int = 100, random_state: int = 42):
        self.n_clusters = n_clusters
        self.max_iters = max_iters
        self.random_state = random_state
        self.centroids = None
        self.labels = None
    
    def fit(self, X: np.ndarray) -> 'KMeans':
        """训练模型"""
        np.random.seed(self.random_state)
        n_samples, n_features = X.shape
        
        # 随机初始化中心点
        idx = np.random.choice(n_samples, self.n_clusters, replace=False)
        self.centroids = X[idx].copy()
        
        for _ in range(self.max_iters):
            # 分配样本到最近的中心点
            distances = self._compute_distances(X)
            self.labels = np.argmin(distances, axis=1)
            
            # 更新中心点
            new_centroids = np.zeros((self.n_clusters, n_features))
            for k in range(self.n_clusters):
                cluster_points = X[self.labels == k]
                if len(cluster_points) > 0:
                    new_centroids[k] = cluster_points.mean(axis=0)
                else:
                    new_centroids[k] = self.centroids[k]
            
            # 检查收敛
            if np.allclose(self.centroids, new_centroids):
                break
            
            self.centroids = new_centroids
        
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测样本所属簇"""
        distances = self._compute_distances(X)
        return np.argmin(distances, axis=1)
    
    def _compute_distances(self, X: np.ndarray) -> np.ndarray:
        """计算样本到各中心点的距离"""
        distances = np.zeros((X.shape[0], self.n_clusters))
        for k in range(self.n_clusters):
            distances[:, k] = np.sqrt(np.sum((X - self.centroids[k]) ** 2, axis=1))
        return distances
    
    def inertia(self, X: np.ndarray) -> float:
        """计算簇内平方误差和"""
        distances = self._compute_distances(X)
        return np.sum(np.min(distances, axis=1) ** 2)

# 使用示例
if __name__ == "__main__":
    # 生成示例数据
    np.random.seed(42)
    cluster1 = np.random.randn(100, 2) + np.array([0, 0])
    cluster2 = np.random.randn(100, 2) + np.array([5, 5])
    cluster3 = np.random.randn(100, 2) + np.array([5, 0])
    X = np.vstack([cluster1, cluster2, cluster3])
    
    # 训练模型
    kmeans = KMeans(n_clusters=3)
    kmeans.fit(X)
    
    print(f"中心点:\n{kmeans.centroids}")
    print(f"SSE: {kmeans.inertia(X):.2f}")
```

### 2. 层次聚类

#### [概念] 概念解释

层次聚类构建树状聚类结构，分为凝聚（自底向上）和分裂（自顶向下）两种方法。凝聚层次聚类从每个样本开始，逐步合并最相似的簇，直到达到指定簇数。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.spatial.distance import pdist, squareform

class AgglomerativeClustering:
    """凝聚层次聚类实现"""
    
    def __init__(self, n_clusters: int = 2, linkage: str = 'ward'):
        self.n_clusters = n_clusters
        self.linkage = linkage
        self.labels = None
    
    def fit(self, X: np.ndarray) -> 'AgglomerativeClustering':
        """训练模型"""
        n_samples = X.shape[0]
        
        # 计算距离矩阵
        distances = self._compute_distance_matrix(X)
        
        # 初始化：每个样本是一个簇
        clusters = [[i] for i in range(n_samples)]
        cluster_sizes = [1] * n_samples
        
        # 合并过程
        active_clusters = set(range(n_samples))
        
        while len(active_clusters) > self.n_clusters:
            # 找到最近的两个簇
            min_dist = float('inf')
            merge_i, merge_j = -1, -1
            
            for i in active_clusters:
                for j in active_clusters:
                    if i >= j:
                        continue
                    dist = self._cluster_distance(
                        clusters[i], clusters[j], distances, cluster_sizes
                    )
                    if dist < min_dist:
                        min_dist = dist
                        merge_i, merge_j = i, j
            
            # 合并簇
            clusters[merge_i].extend(clusters[merge_j])
            cluster_sizes[merge_i] += cluster_sizes[merge_j]
            active_clusters.remove(merge_j)
        
        # 分配标签
        self.labels = np.zeros(n_samples, dtype=int)
        for label, cluster_idx in enumerate(sorted(active_clusters)):
            for sample_idx in clusters[cluster_idx]:
                self.labels[sample_idx] = label
        
        return self
    
    def _compute_distance_matrix(self, X: np.ndarray) -> np.ndarray:
        """计算样本间距离矩阵"""
        n = X.shape[0]
        distances = np.zeros((n, n))
        for i in range(n):
            for j in range(i + 1, n):
                distances[i, j] = np.sqrt(np.sum((X[i] - X[j]) ** 2))
                distances[j, i] = distances[i, j]
        return distances
    
    def _cluster_distance(
        self, 
        cluster1: List[int], 
        cluster2: List[int],
        distances: np.ndarray,
        sizes: List[int]
    ) -> float:
        """计算两个簇之间的距离"""
        if self.linkage == 'single':
            # 单链接：最小距离
            return min(distances[i, j] for i in cluster1 for j in cluster2)
        elif self.linkage == 'complete':
            # 全链接：最大距离
            return max(distances[i, j] for i in cluster1 for j in cluster2)
        elif self.linkage == 'average':
            # 平均链接：平均距离
            total = sum(distances[i, j] for i in cluster1 for j in cluster2)
            return total / (len(cluster1) * len(cluster2))
        else:
            # Ward：最小化方差增量
            return min(distances[i, j] for i in cluster1 for j in cluster2)

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    X = np.random.randn(50, 2)
    
    model = AgglomerativeClustering(n_clusters=3, linkage='average')
    model.fit(X)
    
    print(f"聚类标签: {model.labels}")
```

### 3. 聚类评估指标

#### [概念] 概念解释

聚类评估衡量聚类质量。内部指标（无需标签）：轮廓系数、Calinski-Harabasz 指数、Davies-Bouldin 指数。外部指标（需要标签）：调整兰德指数、互信息。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple

class ClusteringMetrics:
    """聚类评估指标"""
    
    @staticmethod
    def silhouette_score(X: np.ndarray, labels: np.ndarray) -> float:
        """计算轮廓系数
        
        范围 [-1, 1]，越大越好
        """
        n_samples = X.shape[0]
        unique_labels = np.unique(labels)
        n_clusters = len(unique_labels)
        
        if n_clusters == 1 or n_clusters == n_samples:
            return 0.0
        
        silhouette_values = np.zeros(n_samples)
        
        for i in range(n_samples):
            # 计算簇内平均距离 a(i)
            same_cluster = labels == labels[i]
            same_cluster[i] = False
            if np.sum(same_cluster) > 0:
                a_i = np.mean(np.sqrt(np.sum((X[same_cluster] - X[i]) ** 2, axis=1)))
            else:
                a_i = 0
            
            # 计算最近簇的平均距离 b(i)
            b_i = float('inf')
            for label in unique_labels:
                if label == labels[i]:
                    continue
                other_cluster = labels == label
                dist = np.mean(np.sqrt(np.sum((X[other_cluster] - X[i]) ** 2, axis=1)))
                b_i = min(b_i, dist)
            
            # 计算轮廓值
            if b_i == float('inf'):
                silhouette_values[i] = 0
            else:
                silhouette_values[i] = (b_i - a_i) / max(a_i, b_i)
        
        return np.mean(silhouette_values)
    
    @staticmethod
    def calinski_harabasz_score(X: np.ndarray, labels: np.ndarray) -> float:
        """计算 Calinski-Harabasz 指数
        
        越大越好
        """
        n_samples = X.shape[0]
        n_clusters = len(np.unique(labels))
        
        if n_clusters == 1:
            return 0.0
        
        # 计算全局中心
        global_center = X.mean(axis=0)
        
        # 计算组间离散度
        between_dispersion = 0
        for label in np.unique(labels):
            cluster_points = X[labels == label]
            cluster_center = cluster_points.mean(axis=0)
            between_dispersion += len(cluster_points) * np.sum((cluster_center - global_center) ** 2)
        
        # 计算组内离散度
        within_dispersion = 0
        for label in np.unique(labels):
            cluster_points = X[labels == label]
            cluster_center = cluster_points.mean(axis=0)
            within_dispersion += np.sum((cluster_points - cluster_center) ** 2)
        
        # 计算 CH 指数
        ch_score = (between_dispersion / (n_clusters - 1)) / (within_dispersion / (n_samples - n_clusters))
        return ch_score
    
    @staticmethod
    def davies_bouldin_score(X: np.ndarray, labels: np.ndarray) -> float:
        """计算 Davies-Bouldin 指数
        
        越小越好
        """
        unique_labels = np.unique(labels)
        n_clusters = len(unique_labels)
        
        if n_clusters == 1:
            return 0.0
        
        # 计算每个簇的中心和平均距离
        centroids = []
        avg_distances = []
        
        for label in unique_labels:
            cluster_points = X[labels == label]
            centroid = cluster_points.mean(axis=0)
            centroids.append(centroid)
            avg_dist = np.mean(np.sqrt(np.sum((cluster_points - centroid) ** 2, axis=1)))
            avg_distances.append(avg_dist)
        
        centroids = np.array(centroids)
        avg_distances = np.array(avg_distances)
        
        # 计算 DB 指数
        db_values = []
        for i in range(n_clusters):
            max_ratio = 0
            for j in range(n_clusters):
                if i == j:
                    continue
                dist = np.sqrt(np.sum((centroids[i] - centroids[j]) ** 2))
                ratio = (avg_distances[i] + avg_distances[j]) / dist
                max_ratio = max(max_ratio, ratio)
            db_values.append(max_ratio)
        
        return np.mean(db_values)

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    
    # 生成聚类数据
    cluster1 = np.random.randn(50, 2) + np.array([0, 0])
    cluster2 = np.random.randn(50, 2) + np.array([5, 5])
    X = np.vstack([cluster1, cluster2])
    labels = np.array([0] * 50 + [1] * 50)
    
    metrics = ClusteringMetrics()
    
    print(f"轮廓系数: {metrics.silhouette_score(X, labels):.4f}")
    print(f"CH 指数: {metrics.calinski_harabasz_score(X, labels):.4f}")
    print(f"DB 指数: {metrics.davies_bouldin_score(X, labels):.4f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. DBSCAN 密度聚类

#### [概念] 概念解释

DBSCAN 基于密度进行聚类，能发现任意形状的簇并识别噪声点。核心概念：核心点（邻域内点数 >= min_samples）、边界点、噪声点。参数：eps（邻域半径）、min_samples（最小点数）。

#### [代码] 代码示例

```python
import numpy as np
from collections import deque
from typing import List, Set

class DBSCAN:
    """DBSCAN 密度聚类实现"""
    
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        self.eps = eps
        self.min_samples = min_samples
        self.labels = None
        self.core_samples = None
    
    def fit(self, X: np.ndarray) -> 'DBSCAN':
        """训练模型"""
        n_samples = X.shape[0]
        self.labels = np.full(n_samples, -1)  # -1 表示噪声
        self.core_samples = np.zeros(n_samples, dtype=bool)
        
        # 计算邻域
        neighborhoods = self._compute_neighborhoods(X)
        
        # 识别核心点
        for i in range(n_samples):
            if len(neighborhoods[i]) >= self.min_samples:
                self.core_samples[i] = True
        
        # 扩展簇
        cluster_id = 0
        for i in range(n_samples):
            if self.labels[i] != -1:
                continue
            if not self.core_samples[i]:
                continue
            
            # 开始新簇
            self.labels[i] = cluster_id
            queue = deque(neighborhoods[i])
            
            while queue:
                j = queue.popleft()
                if self.labels[j] == -1:
                    self.labels[j] = cluster_id
                    if self.core_samples[j]:
                        queue.extend(neighborhoods[j])
            
            cluster_id += 1
        
        return self
    
    def _compute_neighborhoods(self, X: np.ndarray) -> List[Set[int]]:
        """计算每个点的邻域"""
        n_samples = X.shape[0]
        neighborhoods = []
        
        for i in range(n_samples):
            neighbors = set()
            for j in range(n_samples):
                if i != j:
                    dist = np.sqrt(np.sum((X[i] - X[j]) ** 2))
                    if dist <= self.eps:
                        neighbors.add(j)
            neighborhoods.append(neighbors)
        
        return neighborhoods
    
    def n_clusters(self) -> int:
        """获取簇数量"""
        return len(set(self.labels)) - (1 if -1 in self.labels else 0)
    
    def n_noise(self) -> int:
        """获取噪声点数量"""
        return np.sum(self.labels == -1)

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    
    # 生成非凸形状数据
    theta = np.linspace(0, 2 * np.pi, 100)
    circle1 = np.column_stack([np.cos(theta), np.sin(theta)]) + np.random.randn(100, 2) * 0.1
    circle2 = np.column_stack([2 * np.cos(theta), 2 * np.sin(theta)]) + np.random.randn(100, 2) * 0.1
    X = np.vstack([circle1, circle2])
    
    dbscan = DBSCAN(eps=0.3, min_samples=5)
    dbscan.fit(X)
    
    print(f"簇数量: {dbscan.n_clusters()}")
    print(f"噪声点: {dbscan.n_noise()}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| K-Means++ | 改进的中心点初始化 |
| Mini-batch K-Means | 大规模数据聚类 |
| Gaussian Mixture | 高斯混合模型 |
| Spectral Clustering | 谱聚类 |
| Affinity Propagation | 亲和力传播 |
| Mean Shift | 均值漂移 |
| OPTICS | 有序聚类 |
| BIRCH | 大数据层次聚类 |
| Elbow Method | 肘部法则选 K |
| Silhouette Analysis | 轮廓分析选 K |

---

## [实战] 核心实战清单

1. 使用 K-Means 对鸢尾花数据集进行聚类，并用肘部法则选择 K
2. 实现层次聚类并绘制树状图
3. 使用 DBSCAN 对非凸数据集进行聚类，比较与 K-Means 的效果

## [避坑] 三层避坑提醒

- **核心层误区**：K-Means 对初始中心敏感，使用 K-Means++ 初始化
- **重点层误区**：DBSCAN 参数选择不当，导致所有点都是噪声或一个簇
- **扩展层建议**：使用 scikit-learn 的成熟实现，避免重复造轮子
