# 特征工程 三层深度学习教程

## [总览] 技术总览

特征工程将原始数据转换为机器学习算法可用的特征，是机器学习项目成功的关键。特征工程包括特征提取、特征转换、特征选择等步骤，直接影响模型性能。

本教程采用三层漏斗学习法：**核心层**聚焦缺失值处理、特征缩放、编码转换三大基石；**重点层**深入特征选择和特征构造；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 缺失值处理

#### [概念] 概念解释

缺失值处理是数据预处理的第一步。常用方法包括删除、均值/中位数/众数填充、插值法、模型预测等。选择合适的方法需要理解缺失机制（MCAR、MAR、MNAR）。

#### [代码] 代码示例

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Union
from dataclasses import dataclass

@dataclass
class MissingValueHandler:
    """缺失值处理器"""
    
    strategy: str = 'mean'
    fill_value: Optional[float] = None
    
    def fit(self, data: pd.DataFrame) -> 'MissingValueHandler':
        """拟合填充值"""
        self.fill_values_ = {}
        
        for col in data.columns:
            if data[col].isnull().any():
                if self.strategy == 'mean':
                    self.fill_values_[col] = data[col].mean()
                elif self.strategy == 'median':
                    self.fill_values_[col] = data[col].median()
                elif self.strategy == 'mode':
                    mode_val = data[col].mode()
                    self.fill_values_[col] = mode_val.iloc[0] if len(mode_val) > 0 else 0
                elif self.strategy == 'constant':
                    self.fill_values_[col] = self.fill_value
                elif self.strategy == 'forward_fill':
                    self.fill_values_[col] = 'ffill'
                elif self.strategy == 'backward_fill':
                    self.fill_values_[col] = 'bfill'
        
        return self
    
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """转换数据"""
        result = data.copy()
        
        for col, fill_val in self.fill_values_.items():
            if col in result.columns:
                if fill_val == 'ffill':
                    result[col] = result[col].fillna(method='ffill')
                elif fill_val == 'bfill':
                    result[col] = result[col].fillna(method='bfill')
                else:
                    result[col] = result[col].fillna(fill_val)
        
        return result
    
    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """拟合并转换"""
        return self.fit(data).transform(data)

class AdvancedMissingHandler:
    """高级缺失值处理"""
    
    def __init__(self, method: str = 'knn', n_neighbors: int = 5):
        self.method = method
        self.n_neighbors = n_neighbors
    
    def knn_impute(self, data: np.ndarray) -> np.ndarray:
        """KNN 填充"""
        result = data.copy()
        n_samples, n_features = data.shape
        
        for i in range(n_samples):
            missing_mask = np.isnan(data[i])
            if not missing_mask.any():
                continue
            
            observed_mask = ~missing_mask
            
            distances = []
            for j in range(n_samples):
                if i == j:
                    continue
                
                common_observed = observed_mask & ~np.isnan(data[j])
                if not common_observed.any():
                    continue
                
                diff = data[i, common_observed] - data[j, common_observed]
                dist = np.sqrt(np.sum(diff ** 2))
                distances.append((j, dist))
            
            distances.sort(key=lambda x: x[1])
            neighbors = distances[:self.n_neighbors]
            
            for feat in np.where(missing_mask)[0]:
                neighbor_values = []
                for j, _ in neighbors:
                    if not np.isnan(data[j, feat]):
                        neighbor_values.append(data[j, feat])
                
                if neighbor_values:
                    result[i, feat] = np.mean(neighbor_values)
        
        return result
    
    def interpolate(self, data: pd.Series, method: str = 'linear') -> pd.Series:
        """插值填充"""
        return data.interpolate(method=method)

data = pd.DataFrame({
    'A': [1, 2, np.nan, 4, 5],
    'B': [10, np.nan, 30, 40, 50],
    'C': ['a', 'b', np.nan, 'b', 'a']
})

print("Original Data:")
print(data)

handler = MissingValueHandler(strategy='mean')
filled = handler.fit_transform(data[['A', 'B']])
print("\nMean Filled:")
print(filled)

handler_mode = MissingValueHandler(strategy='mode')
filled_mode = handler_mode.fit_transform(data[['C']])
print("\nMode Filled:")
print(filled_mode)

numeric_data = data[['A', 'B']].values
advanced = AdvancedMissingHandler(method='knn', n_neighbors=2)
knn_filled = advanced.knn_impute(numeric_data)
print("\nKNN Imputed:")
print(knn_filled)
```

### 2. 特征缩放

#### [概念] 概念解释

特征缩放将不同量纲的特征转换到同一尺度，避免数值大的特征主导模型。常用方法包括标准化（Z-Score）、归一化（Min-Max）、鲁棒缩放等。

#### [代码] 代码示例

```python
import numpy as np
from typing import Optional
from dataclasses import dataclass

@dataclass
class StandardScaler:
    """标准化缩放器"""
    
    with_mean: bool = True
    with_std: bool = True
    
    def fit(self, X: np.ndarray) -> 'StandardScaler':
        """拟合参数"""
        X = np.array(X)
        
        if self.with_mean:
            self.mean_ = np.mean(X, axis=0)
        else:
            self.mean_ = np.zeros(X.shape[1])
        
        if self.with_std:
            self.std_ = np.std(X, axis=0)
            self.std_[self.std_ == 0] = 1.0
        else:
            self.std_ = np.ones(X.shape[1])
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换数据"""
        X = np.array(X)
        return (X - self.mean_) / self.std_
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X: np.ndarray) -> np.ndarray:
        """逆转换"""
        X = np.array(X)
        return X * self.std_ + self.mean_

@dataclass
class MinMaxScaler:
    """归一化缩放器"""
    
    feature_range: tuple = (0, 1)
    
    def fit(self, X: np.ndarray) -> 'MinMaxScaler':
        """拟合参数"""
        X = np.array(X)
        
        self.min_ = np.min(X, axis=0)
        self.max_ = np.max(X, axis=0)
        self.scale_ = self.max_ - self.min_
        self.scale_[self.scale_ == 0] = 1.0
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换数据"""
        X = np.array(X)
        X_std = (X - self.min_) / self.scale_
        return X_std * (self.feature_range[1] - self.feature_range[0]) + self.feature_range[0]
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X: np.ndarray) -> np.ndarray:
        """逆转换"""
        X = np.array(X)
        X_std = (X - self.feature_range[0]) / (self.feature_range[1] - self.feature_range[0])
        return X_std * self.scale_ + self.min_

@dataclass
class RobustScaler:
    """鲁棒缩放器"""
    
    with_centering: bool = True
    with_scaling: bool = True
    quantile_range: tuple = (25.0, 75.0)
    
    def fit(self, X: np.ndarray) -> 'RobustScaler':
        """拟合参数"""
        X = np.array(X)
        
        if self.with_centering:
            self.center_ = np.median(X, axis=0)
        else:
            self.center_ = np.zeros(X.shape[1])
        
        if self.with_scaling:
            q_min, q_max = self.quantile_range
            self.scale_ = np.percentile(X, q_max, axis=0) - np.percentile(X, q_min, axis=0)
            self.scale_[self.scale_ == 0] = 1.0
        else:
            self.scale_ = np.ones(X.shape[1])
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换数据"""
        X = np.array(X)
        return (X - self.center_) / self.scale_
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

@dataclass
class LogTransformer:
    """对数变换器"""
    
    base: float = np.e
    
    def fit(self, X: np.ndarray) -> 'LogTransformer':
        """拟合"""
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        if self.base == np.e:
            return np.log1p(X)
        else:
            return np.log1p(X) / np.log(self.base)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

data = np.array([[1, 100, 1000],
                 [2, 200, 2000],
                 [3, 300, 3000],
                 [4, 400, 4000],
                 [5, 500, 5000]])

print("Original Data:")
print(data)

scaler = StandardScaler()
scaled = scaler.fit_transform(data)
print("\nStandard Scaled:")
print(scaled)

minmax = MinMaxScaler(feature_range=(0, 1))
minmax_scaled = minmax.fit_transform(data)
print("\nMinMax Scaled:")
print(minmax_scaled)

robust = RobustScaler()
robust_scaled = robust.fit_transform(data)
print("\nRobust Scaled:")
print(robust_scaled)
```

### 3. 编码转换

#### [概念] 概念解释

编码转换将类别特征转换为数值特征。常用方法包括标签编码、独热编码、目标编码、频率编码等。选择合适的编码方法对模型性能至关重要。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class LabelEncoder:
    """标签编码器"""
    
    def fit(self, y: np.ndarray) -> 'LabelEncoder':
        """拟合"""
        self.classes_ = np.unique(y)
        self.class_to_index_ = {c: i for i, c in enumerate(self.classes_)}
        return self
    
    def transform(self, y: np.ndarray) -> np.ndarray:
        """转换"""
        return np.array([self.class_to_index_[c] for c in y])
    
    def fit_transform(self, y: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(y).transform(y)
    
    def inverse_transform(self, y: np.ndarray) -> np.ndarray:
        """逆转换"""
        return np.array([self.classes_[i] for i in y])

@dataclass
class OneHotEncoder:
    """独热编码器"""
    
    sparse: bool = False
    handle_unknown: str = 'error'
    
    def fit(self, X: np.ndarray) -> 'OneHotEncoder':
        """拟合"""
        X = np.array(X)
        
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        
        self.categories_ = []
        self.category_to_index_ = []
        
        for i in range(X.shape[1]):
            cats = np.unique(X[:, i])
            self.categories_.append(cats)
            self.category_to_index_.append({c: j for j, c in enumerate(cats)})
        
        self.n_features_ = X.shape[1]
        self.n_categories_ = [len(cats) for cats in self.categories_]
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        
        if X.ndim == 1:
            X = X.reshape(-1, 1)
        
        n_samples = X.shape[0]
        total_cats = sum(self.n_categories_)
        
        result = np.zeros((n_samples, total_cats))
        
        offset = 0
        for i in range(self.n_features_):
            n_cats = self.n_categories_[i]
            
            for j in range(n_samples):
                val = X[j, i]
                if val in self.category_to_index_[i]:
                    idx = self.category_to_index_[i][val]
                    result[j, offset + idx] = 1
                elif self.handle_unknown == 'ignore':
                    pass
                else:
                    raise ValueError(f"Unknown category: {val}")
            
            offset += n_cats
        
        return result
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

@dataclass
class TargetEncoder:
    """目标编码器"""
    
    smoothing: float = 1.0
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'TargetEncoder':
        """拟合"""
        X = np.array(X)
        y = np.array(y)
        
        self.global_mean_ = np.mean(y)
        self.encoding_ = {}
        
        unique_vals = np.unique(X)
        
        for val in unique_vals:
            mask = X == val
            n = np.sum(mask)
            mean = np.mean(y[mask])
            
            smoothed = (n * mean + self.smoothing * self.global_mean_) / (n + self.smoothing)
            self.encoding_[val] = smoothed
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        
        result = np.zeros(len(X))
        for i, val in enumerate(X):
            result[i] = self.encoding_.get(val, self.global_mean_)
        
        return result
    
    def fit_transform(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X, y).transform(X)

@dataclass
class FrequencyEncoder:
    """频率编码器"""
    
    def fit(self, X: np.ndarray) -> 'FrequencyEncoder':
        """拟合"""
        X = np.array(X)
        
        unique, counts = np.unique(X, return_counts=True)
        total = len(X)
        
        self.encoding_ = {val: count / total for val, count in zip(unique, counts)}
        
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        return np.array([self.encoding_.get(val, 0) for val in X])
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

categories = np.array(['apple', 'banana', 'apple', 'orange', 'banana', 'apple'])

le = LabelEncoder()
labels = le.fit_transform(categories)
print(f"Label Encoding: {labels}")

ohe = OneHotEncoder()
onehot = ohe.fit_transform(categories)
print(f"\nOne-Hot Encoding:\n{onehot}")

target = np.array([1, 0, 1, 0, 0, 1])
te = TargetEncoder(smoothing=1.0)
target_encoded = te.fit_transform(categories, target)
print(f"\nTarget Encoding: {target_encoded}")

fe = FrequencyEncoder()
freq_encoded = fe.fit_transform(categories)
print(f"\nFrequency Encoding: {freq_encoded}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 特征选择

#### [概念] 概念解释

特征选择从原始特征中选择最相关的子集，减少维度灾难、提高模型性能、加快训练速度。常用方法包括过滤法、包装法、嵌入法。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class VarianceThreshold:
    """方差阈值选择器"""
    
    threshold: float = 0.0
    
    def fit(self, X: np.ndarray) -> 'VarianceThreshold':
        """拟合"""
        X = np.array(X)
        self.variances_ = np.var(X, axis=0)
        self.support_ = self.variances_ > self.threshold
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        return X[:, self.support_]
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

@dataclass
class SelectKBest:
    """选择 K 个最佳特征"""
    
    k: int = 10
    score_func: str = 'f_classif'
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'SelectKBest':
        """拟合"""
        X = np.array(X)
        y = np.array(y)
        
        if self.score_func == 'f_classif':
            self.scores_ = self._f_classif(X, y)
        elif self.score_func == 'mutual_info':
            self.scores_ = self._mutual_info(X, y)
        elif self.score_func == 'chi2':
            self.scores_ = self._chi2(X, y)
        
        self.support_ = np.zeros(X.shape[1], dtype=bool)
        top_k = np.argsort(self.scores_)[-self.k:]
        self.support_[top_k] = True
        
        return self
    
    def _f_classif(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """F 检验"""
        classes = np.unique(y)
        n_features = X.shape[1]
        scores = np.zeros(n_features)
        
        for i in range(n_features):
            overall_mean = np.mean(X[:, i])
            overall_var = np.var(X[:, i])
            
            between_var = 0
            within_var = 0
            
            for c in classes:
                mask = y == c
                n_c = np.sum(mask)
                mean_c = np.mean(X[mask, i])
                var_c = np.var(X[mask, i])
                
                between_var += n_c * (mean_c - overall_mean) ** 2
                within_var += (n_c - 1) * var_c
            
            if within_var > 0:
                scores[i] = between_var / within_var
        
        return scores
    
    def _mutual_info(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """互信息"""
        n_features = X.shape[1]
        scores = np.zeros(n_features)
        
        for i in range(n_features):
            scores[i] = self._compute_mi(X[:, i], y)
        
        return scores
    
    def _compute_mi(self, x: np.ndarray, y: np.ndarray) -> float:
        """计算互信息"""
        n = len(x)
        
        x_bins = np.percentile(x, np.linspace(0, 100, 11))
        x_discrete = np.digitize(x, x_bins)
        
        y_values, y_counts = np.unique(y, return_counts=True)
        p_y = y_counts / n
        
        x_values, x_counts = np.unique(x_discrete, return_counts=True)
        p_x = x_counts / n
        
        mi = 0.0
        for xi, pxi in zip(x_values, p_x):
            mask_x = x_discrete == xi
            if not mask_x.any():
                continue
            
            for yi, pyi in zip(y_values, p_y):
                mask_y = y == yi
                p_xy = np.sum(mask_x & mask_y) / n
                
                if p_xy > 0:
                    mi += p_xy * np.log(p_xy / (pxi * pyi))
        
        return max(0, mi)
    
    def _chi2(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """卡方检验"""
        X = np.maximum(X, 0)
        n_features = X.shape[1]
        scores = np.zeros(n_features)
        
        y_values, y_counts = np.unique(y, return_counts=True)
        n = len(y)
        
        for i in range(n_features):
            feature_sum = np.sum(X[:, i])
            
            chi2 = 0.0
            for j, (yi, count) in enumerate(zip(y_values, y_counts)):
                observed = np.sum(X[y == yi, i])
                expected = feature_sum * count / n
                
                if expected > 0:
                    chi2 += (observed - expected) ** 2 / expected
            
            scores[i] = chi2
        
        return scores
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        return X[:, self.support_]
    
    def fit_transform(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X, y).transform(X)

class RecursiveFeatureElimination:
    """递归特征消除"""
    
    def __init__(self, n_features_to_select: int = 5, step: int = 1):
        self.n_features_to_select = n_features_to_select
        self.step = step
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'RecursiveFeatureElimination':
        """拟合"""
        X = np.array(X)
        y = np.array(y)
        
        n_features = X.shape[1]
        self.support_ = np.ones(n_features, dtype=bool)
        
        while np.sum(self.support_) > self.n_features_to_select:
            remaining_features = np.where(self.support_)[0]
            X_remaining = X[:, remaining_features]
            
            feature_importance = self._compute_importance(X_remaining, y)
            
            n_to_remove = min(self.step, len(remaining_features) - self.n_features_to_select)
            indices_to_remove = np.argsort(feature_importance)[:n_to_remove]
            
            self.support_[remaining_features[indices_to_remove]] = False
        
        return self
    
    def _compute_importance(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """计算特征重要性"""
        n_features = X.shape[1]
        importance = np.zeros(n_features)
        
        for i in range(n_features):
            correlation = np.abs(np.corrcoef(X[:, i], y)[0, 1])
            importance[i] = correlation if not np.isnan(correlation) else 0
        
        return importance
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        return X[:, self.support_]
    
    def fit_transform(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X, y).transform(X)

np.random.seed(42)
X = np.random.randn(100, 10)
y = (X[:, 0] + X[:, 1] + np.random.randn(100) * 0.1) > 0

vt = VarianceThreshold(threshold=0.5)
X_var = vt.fit_transform(X)
print(f"Variance Threshold: {X.shape[1]} -> {X_var.shape[1]} features")

skb = SelectKBest(k=5, score_func='f_classif')
X_kbest = skb.fit_transform(X, y)
print(f"\nSelectKBest scores: {skb.scores_}")
print(f"Selected features: {np.where(skb.support_)[0]}")

rfe = RecursiveFeatureElimination(n_features_to_select=5)
X_rfe = rfe.fit_transform(X, y)
print(f"\nRFE selected features: {np.where(rfe.support_)[0]}")
```

### 2. 特征构造

#### [概念] 概念解释

特征构造通过组合、变换原始特征创建新特征，挖掘数据中的潜在信息。常用方法包括多项式特征、交互特征、统计特征、时间特征等。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class PolynomialFeatures:
    """多项式特征"""
    
    degree: int = 2
    include_bias: bool = True
    interaction_only: bool = False
    
    def fit(self, X: np.ndarray) -> 'PolynomialFeatures':
        """拟合"""
        X = np.array(X)
        self.n_input_features_ = X.shape[1]
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        n_samples = X.shape[0]
        
        result = [X]
        
        if self.include_bias:
            result.insert(0, np.ones((n_samples, 1)))
        
        if self.degree >= 2:
            for d in range(2, self.degree + 1):
                if self.interaction_only:
                    result.append(X ** d)
                else:
                    result.append(X ** d)
                    for i in range(self.n_input_features_):
                        for j in range(i + 1, self.n_input_features_):
                            result.append((X[:, i] * X[:, j]).reshape(-1, 1))
        
        return np.hstack(result)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """拟合并转换"""
        return self.fit(X).transform(X)

class FeatureConstructor:
    """特征构造器"""
    
    def __init__(self):
        self.features = []
    
    def add_polynomial(self, degree: int = 2):
        """添加多项式特征"""
        self.features.append(('polynomial', degree))
        return self
    
    def add_interaction(self):
        """添加交互特征"""
        self.features.append(('interaction', None))
        return self
    
    def add_statistics(self, axis: int = 1):
        """添加统计特征"""
        self.features.append(('statistics', axis))
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """转换"""
        X = np.array(X)
        result = [X]
        
        for feature_type, param in self.features:
            if feature_type == 'polynomial':
                pf = PolynomialFeatures(degree=param, include_bias=False)
                result.append(pf.fit_transform(X))
            
            elif feature_type == 'interaction':
                n_features = X.shape[1]
                interactions = []
                for i in range(n_features):
                    for j in range(i + 1, n_features):
                        interactions.append((X[:, i] * X[:, j]).reshape(-1, 1))
                if interactions:
                    result.append(np.hstack(interactions))
            
            elif feature_type == 'statistics':
                stats = np.column_stack([
                    np.mean(X, axis=param),
                    np.std(X, axis=param),
                    np.min(X, axis=param),
                    np.max(X, axis=param),
                    np.median(X, axis=param)
                ])
                result.append(stats)
        
        return np.hstack(result)

class TimeFeatureExtractor:
    """时间特征提取器"""
    
    def __init__(self):
        self.features = []
    
    def extract(self, timestamps: np.ndarray) -> np.ndarray:
        """提取时间特征"""
        import datetime
        
        features = []
        
        for ts in timestamps:
            if isinstance(ts, (int, float)):
                dt = datetime.datetime.fromtimestamp(ts)
            else:
                dt = pd.to_datetime(ts)
            
            feat = [
                dt.year,
                dt.month,
                dt.day,
                dt.hour,
                dt.minute,
                dt.weekday(),
                dt.dayofyear if hasattr(dt, 'dayofyear') else dt.timetuple().tm_yday,
                1 if dt.weekday() >= 5 else 0,
            ]
            features.append(feat)
        
        return np.array(features)

class TextFeatureExtractor:
    """文本特征提取器"""
    
    def __init__(self, max_features: int = 1000):
        self.max_features = max_features
        self.vocabulary_ = {}
    
    def fit(self, texts: List[str]) -> 'TextFeatureExtractor':
        """拟合"""
        word_counts = {}
        
        for text in texts:
            words = text.lower().split()
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1
        
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        self.vocabulary_ = {word: i for i, (word, _) in enumerate(sorted_words[:self.max_features])}
        
        return self
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """转换"""
        n_samples = len(texts)
        n_features = len(self.vocabulary_)
        
        result = np.zeros((n_samples, n_features))
        
        for i, text in enumerate(texts):
            words = text.lower().split()
            for word in words:
                if word in self.vocabulary_:
                    result[i, self.vocabulary_[word]] += 1
        
        return result
    
    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """拟合并转换"""
        return self.fit(texts).transform(texts)

X = np.array([[1, 2], [3, 4], [5, 6]])
print("Original:")
print(X)

pf = PolynomialFeatures(degree=2, include_bias=False)
X_poly = pf.fit_transform(X)
print(f"\nPolynomial Features (degree=2):")
print(X_poly)

constructor = FeatureConstructor()
constructor.add_interaction().add_statistics()
X_constructed = constructor.transform(X)
print(f"\nConstructed Features:")
print(X_constructed)

texts = ["hello world", "hello python", "python programming"]
text_extractor = TextFeatureExtractor(max_features=5)
X_text = text_extractor.fit_transform(texts)
print(f"\nText Features:")
print(X_text)
print(f"Vocabulary: {text_extractor.vocabulary_}")
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| PCA | 主成分分析降维 |
| LDA | 线性判别分析 |
| t-SNE | t 分布随机邻域嵌入 |
| UMAP | 均匀流形近似投影 |
| Feature Hashing | 特征哈希 |
| Embedding | 特征嵌入 |
| Binning | 分箱处理 |
| Quantile Transform | 分位数变换 |
| Power Transform | 幂变换 |
| Box-Cox | Box-Cox 变换 |
| Yeo-Johnson | Yeo-Johnson 变换 |
| Feature Crossing | 特征交叉 |
| Feature Importance | 特征重要性 |
| Permutation Importance | 排列重要性 |
| SHAP | SHAP 特征解释 |

---

## [实战] 核心实战清单

### 实战任务 1：房价预测特征工程

对房价预测数据集进行完整的特征工程。要求：
1. 处理缺失值，选择合适的填充策略
2. 对数值特征进行缩放，对类别特征进行编码
3. 使用特征选择方法筛选重要特征
4. 构造多项式特征和交互特征
5. 输出处理后的特征矩阵
