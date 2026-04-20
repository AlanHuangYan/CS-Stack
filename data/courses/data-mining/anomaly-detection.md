# 异常检测 三层深度学习教程

## [总览] 技术总览

异常检测识别数据中偏离正常模式的异常点，广泛应用于欺诈检测、系统监控、工业质检等领域。核心方法包括统计学方法、基于距离的方法、基于密度的方法和机器学习方法。

本教程采用三层漏斗学习法：**核心层**聚焦统计学方法、孤立森林、LOF 三大基石；**重点层**深入时间序列异常检测和深度学习方法；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 统计学方法

#### [概念] 概念解释

统计学方法基于数据分布假设，通过计算数据点与分布中心的偏离程度来识别异常。常用方法包括 Z-Score、IQR（四分位距）、百分位数法等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class AnomalyResult:
    """异常检测结果"""
    index: int
    value: float
    score: float
    is_anomaly: bool

class StatisticalAnomalyDetector:
    """统计学异常检测器"""
    
    def __init__(self, method: str = 'zscore', threshold: float = 3.0):
        self.method = method
        self.threshold = threshold
    
    def fit_predict(self, data: np.ndarray) -> List[AnomalyResult]:
        """拟合并预测"""
        data = np.array(data)
        
        if self.method == 'zscore':
            scores = self._zscore(data)
        elif self.method == 'iqr':
            scores = self._iqr_score(data)
        elif self.method == 'percentile':
            scores = self._percentile_score(data)
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        results = []
        for i, (value, score) in enumerate(zip(data, scores)):
            is_anomaly = abs(score) > self.threshold
            results.append(AnomalyResult(
                index=i,
                value=value,
                score=score,
                is_anomaly=is_anomaly
            ))
        
        return results
    
    def _zscore(self, data: np.ndarray) -> np.ndarray:
        """Z-Score 方法"""
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return np.zeros_like(data)
        
        return (data - mean) / std
    
    def _iqr_score(self, data: np.ndarray) -> np.ndarray:
        """IQR 方法"""
        q1 = np.percentile(data, 25)
        q3 = np.percentile(data, 75)
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        scores = np.zeros_like(data, dtype=float)
        
        for i, value in enumerate(data):
            if value < lower_bound:
                scores[i] = (lower_bound - value) / iqr
            elif value > upper_bound:
                scores[i] = (value - upper_bound) / iqr
        
        return scores
    
    def _percentile_score(self, data: np.ndarray) -> np.ndarray:
        """百分位数方法"""
        lower = np.percentile(data, 1)
        upper = np.percentile(data, 99)
        
        scores = np.zeros_like(data, dtype=float)
        range_val = upper - lower if upper != lower else 1
        
        for i, value in enumerate(data):
            if value < lower:
                scores[i] = (lower - value) / range_val * 10
            elif value > upper:
                scores[i] = (value - upper) / range_val * 10
        
        return scores

data = np.array([1, 2, 2, 3, 3, 3, 4, 4, 5, 100])

detector = StatisticalAnomalyDetector(method='zscore', threshold=2.0)
results = detector.fit_predict(data)

for r in results:
    if r.is_anomaly:
        print(f"Index {r.index}: value={r.value}, score={r.score:.2f}")
```

### 2. 孤立森林

#### [概念] 概念解释

孤立森林通过随机划分数据空间来隔离异常点。异常点更容易被孤立（需要更少的划分），因此路径长度更短。该方法无需定义正常模式，适合高维数据。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Optional
from dataclasses import dataclass
import random

@dataclass
class IsolationTreeNode:
    """孤立树节点"""
    split_feature: int
    split_value: float
    left: Optional['IsolationTreeNode'] = None
    right: Optional['IsolationTreeNode'] = None
    size: int = 0
    is_leaf: bool = False

class IsolationTree:
    """孤立树"""
    
    def __init__(self, max_depth: int = 10):
        self.max_depth = max_depth
        self.root: Optional[IsolationTreeNode] = None
    
    def fit(self, data: np.ndarray, current_depth: int = 0) -> IsolationTreeNode:
        """构建孤立树"""
        n_samples, n_features = data.shape
        
        if current_depth >= self.max_depth or n_samples <= 1:
            return IsolationTreeNode(
                split_feature=0,
                split_value=0,
                size=n_samples,
                is_leaf=True
            )
        
        split_feature = random.randint(0, n_features - 1)
        
        feature_values = data[:, split_feature]
        min_val, max_val = feature_values.min(), feature_values.max()
        
        if min_val == max_val:
            return IsolationTreeNode(
                split_feature=split_feature,
                split_value=min_val,
                size=n_samples,
                is_leaf=True
            )
        
        split_value = random.uniform(min_val, max_val)
        
        left_mask = data[:, split_feature] < split_value
        right_mask = ~left_mask
        
        node = IsolationTreeNode(
            split_feature=split_feature,
            split_value=split_value
        )
        
        node.left = self.fit(data[left_mask], current_depth + 1)
        node.right = self.fit(data[right_mask], current_depth + 1)
        
        return node
    
    def path_length(self, x: np.ndarray, node: IsolationTreeNode, current_depth: int = 0) -> float:
        """计算路径长度"""
        if node.is_leaf:
            return current_depth + self._c(node.size)
        
        if x[node.split_feature] < node.split_value:
            return self.path_length(x, node.left, current_depth + 1)
        else:
            return self.path_length(x, node.right, current_depth + 1)
    
    def _c(self, n: int) -> float:
        """调整因子"""
        if n <= 1:
            return 0
        H = lambda i: np.log(i) + 0.5772156649
        return 2 * H(n - 1) - (2 * (n - 1) / n)

class IsolationForest:
    """孤立森林"""
    
    def __init__(self, n_trees: int = 100, max_depth: int = 10, subsample_size: int = 256):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.subsample_size = subsample_size
        self.trees: List[IsolationTree] = []
    
    def fit(self, data: np.ndarray) -> 'IsolationForest':
        """训练模型"""
        data = np.array(data)
        n_samples = data.shape[0]
        
        actual_subsample = min(self.subsample_size, n_samples)
        max_depth = int(np.ceil(np.log2(actual_subsample)))
        self.max_depth = max(max_depth, self.max_depth)
        
        for _ in range(self.n_trees):
            indices = np.random.choice(n_samples, actual_subsample, replace=False)
            subsample = data[indices]
            
            tree = IsolationTree(max_depth=self.max_depth)
            tree.root = tree.fit(subsample)
            self.trees.append(tree)
        
        return self
    
    def anomaly_score(self, data: np.ndarray) -> np.ndarray:
        """计算异常分数"""
        data = np.array(data)
        n_samples = data.shape[0]
        scores = np.zeros(n_samples)
        
        c_norm = self._c(self.subsample_size)
        
        for i, x in enumerate(data):
            path_lengths = [
                tree.path_length(x, tree.root)
                for tree in self.trees
            ]
            avg_path = np.mean(path_lengths)
            scores[i] = 2 ** (-avg_path / c_norm)
        
        return scores
    
    def predict(self, data: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """预测异常"""
        scores = self.anomaly_score(data)
        return scores > threshold
    
    def _c(self, n: int) -> float:
        """调整因子"""
        if n <= 1:
            return 1
        H = lambda i: np.log(i) + 0.5772156649
        return 2 * H(n - 1) - (2 * (n - 1) / n)

np.random.seed(42)
normal_data = np.random.randn(100, 2)
anomaly_data = np.random.uniform(low=-5, high=5, size=(10, 2))
data = np.vstack([normal_data, anomaly_data])

iso_forest = IsolationForest(n_trees=100, subsample_size=64)
iso_forest.fit(data)

scores = iso_forest.anomaly_score(data)
predictions = iso_forest.predict(data, threshold=0.6)

print(f"Detected {predictions.sum()} anomalies")
for i, (score, is_anomaly) in enumerate(zip(scores, predictions)):
    if is_anomaly:
        print(f"  Index {i}: score={score:.3f}")
```

### 3. 局部异常因子 (LOF)

#### [概念] 概念解释

LOF 通过比较数据点与其邻居的局部密度来识别异常。异常点的局部密度明显低于其邻居。LOF 能有效识别局部异常，适合密度不均匀的数据。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from collections import defaultdict

class LOF:
    """局部异常因子"""
    
    def __init__(self, k: int = 20):
        self.k = k
        self.X: np.ndarray = None
    
    def fit(self, X: np.ndarray) -> 'LOF':
        """拟合模型"""
        self.X = np.array(X)
        return self
    
    def _k_distance(self, x: np.ndarray) -> Tuple[float, List[int]]:
        """计算 k-距离"""
        distances = np.linalg.norm(self.X - x, axis=1)
        sorted_indices = np.argsort(distances)
        k_dist = distances[sorted_indices[self.k]]
        neighbors = sorted_indices[1:self.k + 1].tolist()
        
        return k_dist, neighbors
    
    def _reachability_distance(self, x_idx: int, neighbor_idx: int) -> float:
        """可达距离"""
        x = self.X[x_idx]
        neighbor = self.X[neighbor_idx]
        dist = np.linalg.norm(x - neighbor)
        k_dist, _ = self._k_distance(neighbor)
        
        return max(dist, k_dist)
    
    def _local_reachability_density(self, x_idx: int) -> float:
        """局部可达密度"""
        _, neighbors = self._k_distance(self.X[x_idx])
        
        if not neighbors:
            return 1.0
        
        reach_dists = [
            self._reachability_distance(x_idx, n_idx)
            for n_idx in neighbors
        ]
        
        avg_reach_dist = np.mean(reach_dists)
        
        if avg_reach_dist == 0:
            return 1.0
        
        return 1.0 / avg_reach_dist
    
    def _lof_score(self, x_idx: int) -> float:
        """计算 LOF 分数"""
        _, neighbors = self._k_distance(self.X[x_idx])
        
        if not neighbors:
            return 1.0
        
        lrd_x = self._local_reachability_density(x_idx)
        
        lrd_neighbors = [
            self._local_reachability_density(n_idx)
            for n_idx in neighbors
        ]
        
        avg_lrd_neighbors = np.mean(lrd_neighbors)
        
        if lrd_x == 0:
            return float('inf')
        
        return avg_lrd_neighbors / lrd_x
    
    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        """拟合并预测"""
        self.fit(X)
        n_samples = X.shape[0]
        scores = np.array([self._lof_score(i) for i in range(n_samples)])
        return scores
    
    def predict(self, X: np.ndarray, threshold: float = 1.5) -> np.ndarray:
        """预测异常"""
        scores = self.fit_predict(X)
        return scores > threshold

np.random.seed(42)
cluster1 = np.random.randn(50, 2) + np.array([0, 0])
cluster2 = np.random.randn(50, 2) + np.array([5, 5])
anomalies = np.array([[10, 10], [-5, -5], [0, 10], [10, 0]])
data = np.vstack([cluster1, cluster2, anomalies])

lof = LOF(k=10)
scores = lof.fit_predict(data)
predictions = lof.predict(data, threshold=1.5)

print(f"LOF Scores for anomalies:")
for i, (score, is_anomaly) in enumerate(zip(scores, predictions)):
    if is_anomaly:
        print(f"  Index {i}: score={score:.3f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 时间序列异常检测

#### [概念] 概念解释

时间序列异常检测识别时序数据中的异常模式，包括点异常、上下文异常和集体异常。常用方法包括移动平均、指数平滑、STL 分解、LSTM 等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class TimeSeriesAnomaly:
    """时间序列异常"""
    index: int
    value: float
    expected: float
    score: float

class MovingAverageDetector:
    """移动平均异常检测"""
    
    def __init__(self, window: int = 10, threshold: float = 3.0):
        self.window = window
        self.threshold = threshold
    
    def detect(self, data: np.ndarray) -> List[TimeSeriesAnomaly]:
        """检测异常"""
        data = np.array(data)
        n = len(data)
        anomalies = []
        
        for i in range(self.window, n):
            window_data = data[i - self.window:i]
            mean = np.mean(window_data)
            std = np.std(window_data)
            
            if std > 0:
                z_score = abs(data[i] - mean) / std
                
                if z_score > self.threshold:
                    anomalies.append(TimeSeriesAnomaly(
                        index=i,
                        value=data[i],
                        expected=mean,
                        score=z_score
                    ))
        
        return anomalies

class STLDecomposition:
    """STL 分解异常检测"""
    
    def __init__(self, period: int = 12, threshold: float = 3.0):
        self.period = period
        self.threshold = threshold
    
    def decompose(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """分解时间序列"""
        data = np.array(data)
        n = len(data)
        
        trend = self._extract_trend(data)
        detrended = data - trend
        seasonal = self._extract_seasonal(detrended)
        residual = detrended - seasonal
        
        return trend, seasonal, residual
    
    def _extract_trend(self, data: np.ndarray) -> np.ndarray:
        """提取趋势"""
        n = len(data)
        trend = np.zeros(n)
        half_window = self.period // 2
        
        for i in range(n):
            start = max(0, i - half_window)
            end = min(n, i + half_window + 1)
            trend[i] = np.mean(data[start:end])
        
        return trend
    
    def _extract_seasonal(self, data: np.ndarray) -> np.ndarray:
        """提取季节性"""
        n = len(data)
        seasonal = np.zeros(n)
        
        for p in range(self.period):
            indices = range(p, n, self.period)
            if indices:
                seasonal[indices] = np.mean([data[i] for i in indices])
        
        return seasonal
    
    def detect(self, data: np.ndarray) -> List[TimeSeriesAnomaly]:
        """检测异常"""
        trend, seasonal, residual = self.decompose(data)
        
        std = np.std(residual)
        if std == 0:
            return []
        
        anomalies = []
        for i, r in enumerate(residual):
            z_score = abs(r) / std
            
            if z_score > self.threshold:
                expected = trend[i] + seasonal[i]
                anomalies.append(TimeSeriesAnomaly(
                    index=i,
                    value=data[i],
                    expected=expected,
                    score=z_score
                ))
        
        return anomalies

np.random.seed(42)
n = 100
trend = np.linspace(0, 10, n)
seasonal = 2 * np.sin(np.linspace(0, 4 * np.pi, n))
noise = np.random.randn(n) * 0.5
data = trend + seasonal + noise
data[50] += 10
data[75] -= 8

detector = MovingAverageDetector(window=10, threshold=2.5)
anomalies = detector.detect(data)

print("Moving Average Detection:")
for a in anomalies:
    print(f"  Index {a.index}: value={a.value:.2f}, expected={a.expected:.2f}, score={a.score:.2f}")

stl = STLDecomposition(period=20, threshold=2.5)
stl_anomalies = stl.detect(data)

print("\nSTL Detection:")
for a in stl_anomalies:
    print(f"  Index {a.index}: value={a.value:.2f}, expected={a.expected:.2f}, score={a.score:.2f}")
```

### 2. 深度学习方法

#### [概念] 概念解释

深度学习方法使用神经网络学习正常数据的表示，通过重构误差或异常分数检测异常。常用方法包括自编码器、VAE、GAN 等。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple

class AutoencoderAnomalyDetector:
    """自编码器异常检测"""
    
    def __init__(self, input_dim: int, encoding_dim: int = 8, learning_rate: float = 0.01):
        self.input_dim = input_dim
        self.encoding_dim = encoding_dim
        self.learning_rate = learning_rate
        
        self.encoder_weights = np.random.randn(input_dim, encoding_dim) * 0.1
        self.encoder_bias = np.zeros(encoding_dim)
        self.decoder_weights = np.random.randn(encoding_dim, input_dim) * 0.1
        self.decoder_bias = np.zeros(input_dim)
    
    def _sigmoid(self, x: np.ndarray) -> np.ndarray:
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def _encode(self, x: np.ndarray) -> np.ndarray:
        return self._sigmoid(x @ self.encoder_weights + self.encoder_bias)
    
    def _decode(self, encoded: np.ndarray) -> np.ndarray:
        return encoded @ self.decoder_weights + self.decoder_bias
    
    def fit(self, X: np.ndarray, epochs: int = 100) -> 'AutoencoderAnomalyDetector':
        """训练模型"""
        X = np.array(X)
        n_samples = X.shape[0]
        
        for epoch in range(epochs):
            for i in range(n_samples):
                x = X[i]
                
                encoded = self._encode(x)
                decoded = self._decode(encoded)
                
                error = decoded - x
                
                decoder_grad = np.outer(encoded, error)
                self.decoder_weights -= self.learning_rate * decoder_grad
                self.decoder_bias -= self.learning_rate * error
                
                encoded_grad = error @ self.decoder_weights.T
                sigmoid_grad = encoded * (1 - encoded)
                encoder_grad = np.outer(x, encoded_grad * sigmoid_grad)
                
                self.encoder_weights -= self.learning_rate * encoder_grad
                self.encoder_bias -= self.learning_rate * encoded_grad * sigmoid_grad
        
        return self
    
    def reconstruct(self, X: np.ndarray) -> np.ndarray:
        """重构数据"""
        X = np.array(X)
        encoded = self._encode(X)
        return self._decode(encoded)
    
    def anomaly_score(self, X: np.ndarray) -> np.ndarray:
        """计算异常分数"""
        X = np.array(X)
        reconstructed = self.reconstruct(X)
        errors = np.mean((X - reconstructed) ** 2, axis=1)
        return errors
    
    def predict(self, X: np.ndarray, threshold: float = None) -> np.ndarray:
        """预测异常"""
        scores = self.anomaly_score(X)
        
        if threshold is None:
            threshold = np.percentile(scores, 95)
        
        return scores > threshold

np.random.seed(42)
normal_data = np.random.randn(200, 10)
anomaly_data = np.random.uniform(low=5, high=10, size=(20, 10))
train_data = normal_data[:150]
test_data = np.vstack([normal_data[150:], anomaly_data])

detector = AutoencoderAnomalyDetector(input_dim=10, encoding_dim=5)
detector.fit(train_data, epochs=50)

scores = detector.anomaly_score(test_data)
predictions = detector.predict(test_data)

print(f"Average score for normal: {scores[:50].mean():.4f}")
print(f"Average score for anomalies: {scores[50:].mean():.4f}")
print(f"Detected {predictions[50:].sum()} out of {len(anomaly_data)} anomalies")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| One-Class SVM | 单类支持向量机异常检测 |
| DBSCAN | 基于聚类的异常检测 |
| HBOS | 直方图异常检测 |
| COPOD | Copula 异常检测 |
| AutoEncoder | 自编码器异常检测 |
| VAE | 变分自编码器异常检测 |
| GAN | 生成对抗网络异常检测 |
| LSTM-AD | LSTM 时序异常检测 |
| DeepAnT | 深度学习时序异常检测 |
| OmniAnomaly | 多变量时序异常检测 |
| TA-DGAN | 时序异常检测 GAN |
| USAD | 无监督异常检测 |
| DAGMM | 深度自编码高斯混合模型 |
| AnoGAN | 异常检测 GAN |
| f-AnoGAN | 快速异常检测 GAN |

---

## [实战] 核心实战清单

### 实战任务 1：信用卡欺诈检测

使用孤立森林和 LOF 方法检测信用卡交易中的欺诈行为。要求：
1. 加载交易数据，进行预处理
2. 使用孤立森林和 LOF 分别检测异常
3. 比较两种方法的结果，计算准确率
4. 输出检测到的异常交易详情
