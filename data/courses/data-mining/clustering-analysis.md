# 聚类分析 三层深度学习教程

## [总览] 技术总览

聚类分析是将数据对象分组为相似对象集合的无监督学习方法。核心算法包括 K-Means、层次聚类、DBSCAN 等。聚类广泛应用于客户细分、图像分割、异常检测等领域。

本教程采用三层漏斗学习法：**核心层**聚焦 K-Means 算法、层次聚类、DBSCAN 三大基石；**重点层**深入聚类评估和算法选择；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. K-Means 算法

#### [概念] 概念解释

K-Means 是最经典的划分聚类算法，通过迭代优化将数据划分为 K 个簇。算法步骤：初始化质心、分配样本到最近质心、更新质心位置、重复直到收敛。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class KMeansResult:
    """K-Means 结果"""
    labels: np.ndarray
    centroids: np.ndarray
    inertia: float
    n_iterations: int

class KMeans:
    """K-Means 实现"""
    
    def __init__(
        self,
        n_clusters: int = 3,
        max_iter: int = 300,
        tol: float = 1e-4,
        n_init: int = 10,
        random_state: int = None
    ):
        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.tol = tol
        self.n_init = n_init
        self.random_state = random_state
    
    def fit(self, X: np.ndarray) -> 'KMeans':
        """训练模型"""
        self.X = X
        self.n_samples, self.n_features = X.shape
        
        best_inertia = float('inf')
        best_result = None
        
        for _ in range(self.n_init):
            result = self._single_run()
            
            if result.inertia < best_inertia:
                best_inertia = result.inertia
                best_result = result
        
        self.labels_ = best_result.labels
        self.cluster_centers_ = best_result.centroids
        self.inertia_ = best_result.inertia
        self.n_iter_ = best_result.n_iterations
        
        return self
    
    def _single_run(self) -> KMeansResult:
        """单次运行"""
        centroids = self._init_centroids()
        
        for iteration in range(self.max_iter):
            labels = self._assign_clusters(centroids)
            
            new_centroids = self._update_centroids(labels)
            
            shift = np.sum((new_centroids - centroids) ** 2)
            
            centroids = new_centroids
            
            if shift < self.tol:
                break
        
        labels = self._assign_clusters(centroids)
        inertia = self._compute_inertia(labels, centroids)
        
        return KMeansResult(
            labels=labels,
            centroids=centroids,
            inertia=inertia,
            n_iterations=iteration + 1
        )
    
    def _init_centroids(self) -> np.ndarray:
        """初始化质心 - K-Means++"""
        if self.random_state:
            np.random.seed(self.random_state)
        
        centroids = []
        
        idx = np.random.randint(self.n_samples)
        centroids.append(self.X[idx])
        
        for _ in range(1, self.n_clusters):
            distances = np.array([
                min(np.sum((x - c) ** 2) for c in centroids)
                for x in self.X
            ])
            
            probs = distances / distances.sum()
            idx = np.random.choice(self.n_samples, p=probs)
            centroids.append(self.X[idx])
        
        return np.array(centroids)
    
    def _assign_clusters(self, centroids: np.ndarray) -> np.ndarray:
        """分配样本到簇"""
        distances = np.array([
            [np.sum((x - c) ** 2) for c in centroids]
            for x in self.X
        ])
        
        return np.argmin(distances, axis=1)
    
    def _update_centroids(self, labels: np.ndarray) -> np.ndarray:
        """更新质心"""
        new_centroids = np.zeros((self.n_clusters, self.n_features))
        
        for k in range(self.n_clusters):
            cluster_points = self.X[labels == k]
            
            if len(cluster_points) > 0:
                new_centroids[k] = cluster_points.mean(axis=0)
            else:
                new_centroids[k] = self.X[np.random.randint(self.n_samples)]
        
        return new_centroids
    
    def _compute_inertia(
        self,
        labels: np.ndarray,
        centroids: np.ndarray
    ) -> float:
        """计算惯性"""
        return sum(
            np.sum((self.X[labels == k] - centroids[k]) ** 2)
            for k in range(self.n_clusters)
        )
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测簇标签"""
        distances = np.array([
            [np.sum((x - c) ** 2) for c in self.cluster_centers_]
            for x in X
        ])
        return np.argmin(distances, axis=1)
    
    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        """训练并预测"""
        self.fit(X)
        return self.labels_

X = np.array([
    [1, 2], [1, 4], [1, 0],
    [4, 2], [4, 4], [4, 0],
    [10, 2], [10, 4], [10, 0]
])

kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X)

print(f"Labels: {kmeans.labels_}")
print(f"Centroids:\n{kmeans.cluster_centers_}")
```

### 2. 层次聚类

#### [概念] 概念解释

层次聚类构建聚类的层次结构，分为凝聚（自底向上）和分裂（自顶向下）两种方法。结果以树状图（Dendrogram）展示，可灵活选择聚类数量。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

class AgglomerativeClustering:
    """凝聚层次聚类"""
    
    def __init__(self, n_clusters: int = 2, linkage: str = 'ward'):
        self.n_clusters = n_clusters
        self.linkage = linkage
    
    def fit(self, X: np.ndarray) -> 'AgglomerativeClustering':
        """训练模型"""
        self.X = X
        self.n_samples = X.shape[0]
        
        self.labels_ = np.arange(self.n_samples)
        
        self.linkage_matrix = self._compute_linkage()
        
        self._cut_tree()
        
        return self
    
    def _compute_linkage(self) -> np.ndarray:
        """计算链接矩阵"""
        clusters = {i: [i] for i in range(self.n_samples)}
        cluster_sizes = {i: 1 for i in range(self.n_samples)}
        
        linkage_matrix = []
        next_cluster_id = self.n_samples
        
        distances = self._compute_distance_matrix()
        
        active_clusters = set(range(self.n_samples))
        
        while len(active_clusters) > 1:
            min_dist = float('inf')
            merge_pair = None
            
            for i in active_clusters:
                for j in active_clusters:
                    if i < j:
                        dist = self._cluster_distance(
                            clusters[i], clusters[j],
                            cluster_sizes[i], cluster_sizes[j]
                        )
                        if dist < min_dist:
                            min_dist = dist
                            merge_pair = (i, j)
            
            i, j = merge_pair
            
            new_cluster = clusters[i] + clusters[j]
            new_size = cluster_sizes[i] + cluster_sizes[j]
            
            linkage_matrix.append([i, j, min_dist, new_size])
            
            clusters[next_cluster_id] = new_cluster
            cluster_sizes[next_cluster_id] = new_size
            
            active_clusters.remove(i)
            active_clusters.remove(j)
            active_clusters.add(next_cluster_id)
            
            clusters.pop(i)
            clusters.pop(j)
            cluster_sizes.pop(i)
            cluster_sizes.pop(j)
            
            next_cluster_id += 1
        
        return np.array(linkage_matrix)
    
    def _compute_distance_matrix(self) -> np.ndarray:
        """计算距离矩阵"""
        n = self.n_samples
        distances = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i + 1, n):
                distances[i, j] = np.linalg.norm(self.X[i] - self.X[j])
                distances[j, i] = distances[i, j]
        
        return distances
    
    def _cluster_distance(
        self,
        cluster1: List[int],
        cluster2: List[int],
        size1: int,
        size2: int
    ) -> float:
        """计算簇间距离"""
        if self.linkage == 'single':
            return min(
                np.linalg.norm(self.X[i] - self.X[j])
                for i in cluster1
                for j in cluster2
            )
        elif self.linkage == 'complete':
            return max(
                np.linalg.norm(self.X[i] - self.X[j])
                for i in cluster1
                for j in cluster2
            )
        elif self.linkage == 'average':
            distances = [
                np.linalg.norm(self.X[i] - self.X[j])
                for i in cluster1
                for j in cluster2
            ]
            return sum(distances) / len(distances)
        elif self.linkage == 'ward':
            centroid1 = self.X[cluster1].mean(axis=0)
            centroid2 = self.X[cluster2].mean(axis=0)
            new_centroid = (size1 * centroid1 + size2 * centroid2) / (size1 + size2)
            
            sse1 = np.sum((self.X[cluster1] - centroid1) ** 2)
            sse2 = np.sum((self.X[cluster2] - centroid2) ** 2)
            sse_new = np.sum((self.X[cluster1 + cluster2] - new_centroid) ** 2)
            
            return sse_new - sse1 - sse2
        
        return 0
    
    def _cut_tree(self):
        """切割树获取聚类"""
        n = self.n_samples
        k = self.n_clusters
        
        self.labels_ = np.zeros(n, dtype=int)
        
        merges = self.linkage_matrix[-(k - 1):]
        
        cluster_map = {i: i for i in range(n)}
        next_label = n
        
        for merge in merges:
            i, j = int(merge[0]), int(merge[1])
            
            for idx in cluster_map:
                if cluster_map[idx] == i or cluster_map[idx] == j:
                    cluster_map[idx] = next_label
            
            next_label += 1
        
        unique_labels = sorted(set(cluster_map.values()))
        label_mapping = {old: new for new, old in enumerate(unique_labels)}
        
        for i in range(n):
            self.labels_[i] = label_mapping[cluster_map[i]]
    
    def plot_dendrogram(self):
        """绘制树状图"""
        plt.figure(figsize=(10, 7))
        dendrogram(self.linkage_matrix)
        plt.title('Hierarchical Clustering Dendrogram')
        plt.xlabel('Sample Index')
        plt.ylabel('Distance')
        plt.show()

agg = AgglomerativeClustering(n_clusters=3, linkage='ward')
agg.fit(X)
print(f"Labels: {agg.labels_}")
```

### 3. DBSCAN 算法

#### [概念] 概念解释

DBSCAN（Density-Based Spatial Clustering）基于密度聚类，能发现任意形状的簇并识别噪声点。核心概念：核心点、边界点、噪声点。参数：eps（邻域半径）、min_samples（最小样本数）。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Set
from collections import deque

class DBSCAN:
    """DBSCAN 实现"""
    
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        self.eps = eps
        self.min_samples = min_samples
    
    def fit(self, X: np.ndarray) -> 'DBSCAN':
        """训练模型"""
        self.X = X
        self.n_samples = X.shape[0]
        
        self.labels_ = np.full(self.n_samples, -1)
        
        self._compute_neighbors()
        
        cluster_id = 0
        
        for i in range(self.n_samples):
            if self.labels_[i] != -1:
                continue
            
            if len(self.neighbors[i]) < self.min_samples:
                continue
            
            self._expand_cluster(i, cluster_id)
            
            cluster_id += 1
        
        self.n_clusters_ = cluster_id
        
        return self
    
    def _compute_neighbors(self):
        """计算每个点的邻居"""
        self.neighbors = []
        
        for i in range(self.n_samples):
            neighbor_indices = []
            
            for j in range(self.n_samples):
                if np.linalg.norm(self.X[i] - self.X[j]) <= self.eps:
                    neighbor_indices.append(j)
            
            self.neighbors.append(set(neighbor_indices))
    
    def _expand_cluster(self, start_idx: int, cluster_id: int):
        """扩展簇"""
        queue = deque([start_idx])
        self.labels_[start_idx] = cluster_id
        
        while queue:
            current = queue.popleft()
            
            if len(self.neighbors[current]) >= self.min_samples:
                for neighbor in self.neighbors[current]:
                    if self.labels_[neighbor] == -1:
                        self.labels_[neighbor] = cluster_id
                        queue.append(neighbor)
    
    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        """训练并预测"""
        self.fit(X)
        return self.labels_
    
    def get_core_samples(self) -> np.ndarray:
        """获取核心样本索引"""
        return np.array([
            i for i in range(self.n_samples)
            if len(self.neighbors[i]) >= self.min_samples
        ])
    
    def get_noise_samples(self) -> np.ndarray:
        """获取噪声样本索引"""
        return np.where(self.labels_ == -1)[0]

X_moons = np.array([
    [0, 0], [0.5, 0.5], [1, 0], [1.5, 0.5], [2, 0],
    [0, 2], [0.5, 1.5], [1, 2], [1.5, 1.5], [2, 2],
    [10, 10]
])

dbscan = DBSCAN(eps=1.0, min_samples=2)
dbscan.fit(X_moons)

print(f"Labels: {dbscan.labels_}")
print(f"Number of clusters: {dbscan.n_clusters_}")
print(f"Noise samples: {dbscan.get_noise_samples()}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 聚类评估

#### [概念] 概念解释

聚类评估衡量聚类质量，分为内部评估（不使用标签）和外部评估（使用标签）。常用指标：轮廓系数、Calinski-Harabasz 指数、Davies-Bouldin 指数、调整兰德指数。

#### [代码] 代码示例

```python
import numpy as np
from typing import Optional

class ClusteringEvaluator:
    """聚类评估器"""
    
    def __init__(self, X: np.ndarray, labels: np.ndarray):
        self.X = X
        self.labels = labels
        self.n_samples = X.shape[0]
        self.unique_labels = np.unique(labels)
        self.n_clusters = len(self.unique_labels[labels >= 0])
    
    def silhouette_score(self) -> float:
        """轮廓系数"""
        scores = []
        
        for i in range(self.n_samples):
            if self.labels[i] < 0:
                continue
            
            cluster_i = self.labels[i]
            
            a_i = self._compute_a(i, cluster_i)
            
            b_i = self._compute_b(i, cluster_i)
            
            if a_i == 0:
                scores.append(0)
            else:
                scores.append((b_i - a_i) / max(a_i, b_i))
        
        return np.mean(scores) if scores else 0
    
    def _compute_a(self, i: int, cluster: int) -> float:
        """计算簇内平均距离"""
        cluster_points = np.where(self.labels == cluster)[0]
        cluster_points = cluster_points[cluster_points != i]
        
        if len(cluster_points) == 0:
            return 0
        
        distances = [
            np.linalg.norm(self.X[i] - self.X[j])
            for j in cluster_points
        ]
        
        return np.mean(distances)
    
    def _compute_b(self, i: int, cluster: int) -> float:
        """计算最近簇的平均距离"""
        other_clusters = [
            c for c in self.unique_labels
            if c >= 0 and c != cluster
        ]
        
        if not other_clusters:
            return 0
        
        min_b = float('inf')
        
        for other_cluster in other_clusters:
            cluster_points = np.where(self.labels == other_cluster)[0]
            
            distances = [
                np.linalg.norm(self.X[i] - self.X[j])
                for j in cluster_points
            ]
            
            avg_dist = np.mean(distances)
            min_b = min(min_b, avg_dist)
        
        return min_b
    
    def calinski_harabasz_score(self) -> float:
        """Calinski-Harabasz 指数"""
        global_center = self.X.mean(axis=0)
        
        ssb = 0
        ssw = 0
        
        for label in self.unique_labels:
            if label < 0:
                continue
            
            cluster_points = self.X[self.labels == label]
            n_k = len(cluster_points)
            
            if n_k == 0:
                continue
            
            cluster_center = cluster_points.mean(axis=0)
            
            ssb += n_k * np.sum((cluster_center - global_center) ** 2)
            
            ssw += np.sum((cluster_points - cluster_center) ** 2)
        
        if ssw == 0:
            return 0
        
        return (ssb / (self.n_clusters - 1)) / (ssw / (self.n_samples - self.n_clusters))
    
    def davies_bouldin_score(self) -> float:
        """Davies-Bouldin 指数"""
        cluster_centers = []
        cluster_dispersions = []
        
        for label in self.unique_labels:
            if label < 0:
                continue
            
            cluster_points = self.X[self.labels == label]
            
            center = cluster_points.mean(axis=0)
            cluster_centers.append(center)
            
            dispersion = np.mean([
                np.linalg.norm(x - center)
                for x in cluster_points
            ])
            cluster_dispersions.append(dispersion)
        
        if len(cluster_centers) < 2:
            return 0
        
        db_sum = 0
        
        for i in range(len(cluster_centers)):
            max_ratio = 0
            
            for j in range(len(cluster_centers)):
                if i != j:
                    dist = np.linalg.norm(cluster_centers[i] - cluster_centers[j])
                    
                    if dist > 0:
                        ratio = (cluster_dispersions[i] + cluster_dispersions[j]) / dist
                        max_ratio = max(max_ratio, ratio)
            
            db_sum += max_ratio
        
        return db_sum / len(cluster_centers)
    
    def inertia(self) -> float:
        """簇内平方和"""
        total = 0
        
        for label in self.unique_labels:
            if label < 0:
                continue
            
            cluster_points = self.X[self.labels == label]
            center = cluster_points.mean(axis=0)
            
            total += np.sum((cluster_points - center) ** 2)
        
        return total

def find_optimal_k(X: np.ndarray, k_range: range) -> dict:
    """寻找最优 K 值"""
    results = {
        'k': [],
        'silhouette': [],
        'calinski_harabasz': [],
        'davies_bouldin': [],
        'inertia': []
    }
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k)
        kmeans.fit(X)
        
        evaluator = ClusteringEvaluator(X, kmeans.labels_)
        
        results['k'].append(k)
        results['silhouette'].append(evaluator.silhouette_score())
        results['calinski_harabasz'].append(evaluator.calinski_harabasz_score())
        results['davies_bouldin'].append(evaluator.davies_bouldin_score())
        results['inertia'].append(evaluator.inertia())
    
    return results
```

### 2. 算法选择

#### [概念] 概念解释

不同聚类算法适用于不同场景：K-Means 适合球形簇、层次聚类适合层次结构、DBSCAN 适合任意形状和噪声数据。选择算法需考虑数据特征、簇形状、噪声比例等因素。

#### [代码] 代码示例

```python
import numpy as np
from typing import Dict, List, Tuple

class ClusteringSelector:
    """聚类算法选择器"""
    
    def __init__(self, X: np.ndarray):
        self.X = X
        self.n_samples, self.n_features = X.shape
    
    def analyze_data_characteristics(self) -> Dict:
        """分析数据特征"""
        from scipy.spatial.distance import pdist
        
        distances = pdist(self.X)
        
        return {
            'n_samples': self.n_samples,
            'n_features': self.n_features,
            'density': self.n_samples / (np.max(self.X, axis=0) - np.min(self.X, axis=0)).prod(),
            'avg_distance': np.mean(distances),
            'std_distance': np.std(distances),
            'distance_variation': np.std(distances) / np.mean(distances)
        }
    
    def estimate_dbscan_params(self) -> Tuple[float, int]:
        """估计 DBSCAN 参数"""
        from sklearn.neighbors import NearestNeighbors
        
        k = min(5, self.n_samples - 1)
        nbrs = NearestNeighbors(n_neighbors=k).fit(self.X)
        distances, _ = nbrs.kneighbors(self.X)
        
        k_distances = np.sort(distances[:, -1])
        
        eps = np.percentile(k_distances, 90)
        
        min_samples = max(3, int(np.log(self.n_samples)))
        
        return eps, min_samples
    
    def compare_algorithms(
        self,
        n_clusters_range: range = range(2, 11)
    ) -> Dict:
        """比较不同算法"""
        results = {
            'kmeans': [],
            'hierarchical': [],
            'dbscan': []
        }
        
        for k in n_clusters_range:
            kmeans = KMeans(n_clusters=k)
            kmeans.fit(self.X)
            evaluator = ClusteringEvaluator(self.X, kmeans.labels_)
            
            results['kmeans'].append({
                'k': k,
                'silhouette': evaluator.silhouette_score(),
                'inertia': evaluator.inertia()
            })
        
        for linkage in ['ward', 'complete', 'average']:
            agg = AgglomerativeClustering(n_clusters=3, linkage=linkage)
            agg.fit(self.X)
            evaluator = ClusteringEvaluator(self.X, agg.labels_)
            
            results['hierarchical'].append({
                'linkage': linkage,
                'silhouette': evaluator.silhouette_score()
            })
        
        eps, min_samples = self.estimate_dbscan_params()
        
        for eps_mult in [0.5, 1.0, 1.5]:
            dbscan = DBSCAN(eps=eps * eps_mult, min_samples=min_samples)
            dbscan.fit(self.X)
            
            if dbscan.n_clusters_ > 1:
                evaluator = ClusteringEvaluator(self.X, dbscan.labels_)
                results['dbscan'].append({
                    'eps': eps * eps_mult,
                    'min_samples': min_samples,
                    'n_clusters': dbscan.n_clusters_,
                    'silhouette': evaluator.silhouette_score(),
                    'noise_ratio': len(dbscan.get_noise_samples()) / self.n_samples
                })
        
        return results
    
    def recommend_algorithm(self) -> Dict:
        """推荐算法"""
        chars = self.analyze_data_characteristics()
        
        recommendations = []
        
        if chars['distance_variation'] < 0.5:
            recommendations.append({
                'algorithm': 'K-Means',
                'reason': 'Data has uniform density, suitable for centroid-based clustering',
                'params': {'n_clusters': 'Use elbow method to determine'}
            })
        
        if chars['n_samples'] < 1000:
            recommendations.append({
                'algorithm': 'Hierarchical',
                'reason': 'Small dataset, can visualize dendrogram',
                'params': {'linkage': 'ward', 'n_clusters': 'Cut dendrogram at desired level'}
            })
        
        if chars['distance_variation'] > 0.5:
            eps, min_samples = self.estimate_dbscan_params()
            recommendations.append({
                'algorithm': 'DBSCAN',
                'reason': 'Variable density data, can detect noise',
                'params': {'eps': eps, 'min_samples': min_samples}
            })
        
        return {
            'data_characteristics': chars,
            'recommendations': recommendations
        }
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| K-Medoids | K-中心点聚类，对噪声鲁棒 |
| Gaussian Mixture | 高斯混合模型，概率聚类 |
| Spectral Clustering | 谱聚类，图划分方法 |
| Mean Shift | 均值漂移，自动确定簇数 |
| OPTICS | 有序聚类，变密度数据 |
| BIRCH | 大规模数据聚类 |
| CURE | 代表点聚类，任意形状 |
| Affinity Propagation | 亲和力传播，自动确定簇数 |
| Mini-Batch K-Means | 增量 K-Means，大数据 |
| Fuzzy C-Means | 模糊 C 均值，软聚类 |
