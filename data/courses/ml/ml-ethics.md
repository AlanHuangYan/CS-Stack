# ML 伦理与公平性 三层深度学习教程

## [总览] 技术总览

ML 伦理关注机器学习系统的社会影响。核心议题：公平性（避免歧视）、可解释性（理解决策）、隐私保护（数据安全）、问责制（责任归属）。负责任的 AI 开发需要考虑技术和社会双重维度。

本教程采用三层漏斗学习法：**核心层**聚焦公平性评估、偏见检测、隐私保护三大基石；**重点层**深入可解释性和问责制；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 公平性评估

#### [概念] 概念解释

公平性评估衡量模型对不同群体的待遇差异。常用指标：人口统计学均等、机会均等、预测均等。目标是确保模型不因敏感属性（性别、种族等）产生歧视。

#### [代码] 代码示例

```python
import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class FairnessMetrics:
    """公平性指标"""
    demographic_parity: float
    equalized_odds: float
    predictive_parity: float

class FairnessEvaluator:
    """公平性评估器"""
    
    def __init__(self, y_true: np.ndarray, y_pred: np.ndarray, sensitive_attr: np.ndarray):
        self.y_true = y_true
        self.y_pred = y_pred
        self.sensitive_attr = sensitive_attr
    
    def demographic_parity(self) -> float:
        """人口统计学均等
        
        不同群体的预测正例率应该相近
        """
        groups = np.unique(self.sensitive_attr)
        positive_rates = []
        
        for group in groups:
            mask = self.sensitive_attr == group
            positive_rate = np.mean(self.y_pred[mask] == 1)
            positive_rates.append(positive_rate)
        
        # 计算差异（越小越公平）
        return max(positive_rates) - min(positive_rates)
    
    def equalized_odds(self) -> float:
        """机会均等
        
        不同群体在真实正例中的预测正例率应该相近
        """
        groups = np.unique(self.sensitive_attr)
        tpr_diffs = []
        fpr_diffs = []
        
        tprs = []
        fprs = []
        
        for group in groups:
            mask = self.sensitive_attr == group
            y_true_group = self.y_true[mask]
            y_pred_group = self.y_pred[mask]
            
            # 真正例率
            positive_mask = y_true_group == 1
            if np.sum(positive_mask) > 0:
                tpr = np.mean(y_pred_group[positive_mask] == 1)
                tprs.append(tpr)
            
            # 假正例率
            negative_mask = y_true_group == 0
            if np.sum(negative_mask) > 0:
                fpr = np.mean(y_pred_group[negative_mask] == 1)
                fprs.append(fpr)
        
        tpr_diff = max(tprs) - min(tprs) if tprs else 0
        fpr_diff = max(fprs) - min(fprs) if fprs else 0
        
        return max(tpr_diff, fpr_diff)
    
    def predictive_parity(self) -> float:
        """预测均等
        
        不同群体在预测正例中的真实正例率应该相近
        """
        groups = np.unique(self.sensitive_attr)
        precisions = []
        
        for group in groups:
            mask = self.sensitive_attr == group
            y_true_group = self.y_true[mask]
            y_pred_group = self.y_pred[mask]
            
            # 精确率
            positive_mask = y_pred_group == 1
            if np.sum(positive_mask) > 0:
                precision = np.mean(y_true_group[positive_mask] == 1)
                precisions.append(precision)
        
        return max(precisions) - min(precisions) if precisions else 0
    
    def evaluate(self) -> FairnessMetrics:
        """计算所有公平性指标"""
        return FairnessMetrics(
            demographic_parity=self.demographic_parity(),
            equalized_odds=self.equalized_odds(),
            predictive_parity=self.predictive_parity()
        )

class BiasMitigator:
    """偏见缓解器"""
    
    @staticmethod
    def reweight_samples(
        y_true: np.ndarray,
        sensitive_attr: np.ndarray
    ) -> np.ndarray:
        """样本重加权
        
        为不同群体分配不同权重，使总体分布更均衡
        """
        weights = np.ones(len(y_true))
        
        groups = np.unique(sensitive_attr)
        
        for group in groups:
            for label in [0, 1]:
                mask = (sensitive_attr == group) & (y_true == label)
                count = np.sum(mask)
                
                if count > 0:
                    # 计算期望比例
                    expected_ratio = len(y_true) / (len(groups) * 2)
                    actual_ratio = count
                    
                    weights[mask] = expected_ratio / actual_ratio
        
        # 归一化
        weights = weights / np.mean(weights)
        
        return weights
    
    @staticmethod
    def threshold_adjustment(
        y_scores: np.ndarray,
        sensitive_attr: np.ndarray,
        target_rate: float = None
    ) -> np.ndarray:
        """阈值调整
        
        为不同群体设置不同的决策阈值
        """
        y_pred = np.zeros(len(y_scores))
        groups = np.unique(sensitive_attr)
        
        if target_rate is None:
            target_rate = np.mean(y_scores)
        
        for group in groups:
            mask = sensitive_attr == group
            group_scores = y_scores[mask]
            
            # 找到使正例率接近目标的阈值
            threshold = np.percentile(group_scores, (1 - target_rate) * 100)
            y_pred[mask] = (group_scores >= threshold).astype(int)
        
        return y_pred

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    n_samples = 1000
    
    # 模拟数据
    y_true = np.random.randint(0, 2, n_samples)
    y_pred = np.random.randint(0, 2, n_samples)
    sensitive_attr = np.random.choice([0, 1], n_samples)  # 敏感属性
    
    # 评估公平性
    evaluator = FairnessEvaluator(y_true, y_pred, sensitive_attr)
    metrics = evaluator.evaluate()
    
    print("公平性指标:")
    print(f"  人口统计学均等差异: {metrics.demographic_parity:.4f}")
    print(f"  机会均等差异: {metrics.equalized_odds:.4f}")
    print(f"  预测均等差异: {metrics.predictive_parity:.4f}")
    
    # 样本重加权
    weights = BiasMitigator.reweight_samples(y_true, sensitive_attr)
    print(f"\n样本权重范围: [{weights.min():.2f}, {weights.max():.2f}]")
```

### 2. 偏见检测

#### [概念] 概念解释

偏见检测识别数据和模型中的不公平因素。数据偏见：采样偏差、标签偏差、历史偏见。模型偏见：算法放大了数据中的偏见。

#### [代码] 代码示例

```python
import numpy as np
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass

@dataclass
class BiasReport:
    """偏见报告"""
    bias_type: str
    severity: str  # low, medium, high
    description: str
    affected_groups: List[Any]
    recommendation: str

class BiasDetector:
    """偏见检测器"""
    
    def __init__(self, data: np.ndarray, labels: np.ndarray, feature_names: List[str]):
        self.data = data
        self.labels = labels
        self.feature_names = feature_names
    
    def detect_representation_bias(self, sensitive_idx: int) -> BiasReport:
        """检测表示偏见
        
        检查敏感属性的不同值在数据中的分布
        """
        unique_values, counts = np.unique(self.data[:, sensitive_idx], return_counts=True)
        proportions = counts / len(self.data)
        
        # 检查是否有群体被低估
        max_prop = np.max(proportions)
        min_prop = np.min(proportions)
        
        if min_prop < 0.1:
            severity = "high"
        elif min_prop < 0.2:
            severity = "medium"
        else:
            severity = "low"
        
        return BiasReport(
            bias_type="representation_bias",
            severity=severity,
            description=f"群体分布不均，最小群体占比 {min_prop:.2%}，最大群体占比 {max_prop:.2%}",
            affected_groups=unique_values[np.argsort(counts)[:2]].tolist(),
            recommendation="收集更多少数群体数据或使用过采样技术"
        )
    
    def detect_label_bias(
        self,
        sensitive_idx: int,
        positive_label: int = 1
    ) -> BiasReport:
        """检测标签偏见
        
        检查不同群体的正例比例差异
        """
        unique_values = np.unique(self.data[:, sensitive_idx])
        positive_rates = {}
        
        for value in unique_values:
            mask = self.data[:, sensitive_idx] == value
            positive_rate = np.mean(self.labels[mask] == positive_label)
            positive_rates[value] = positive_rate
        
        rates = list(positive_rates.values())
        max_rate = max(rates)
        min_rate = min(rates)
        rate_diff = max_rate - min_rate
        
        if rate_diff > 0.3:
            severity = "high"
        elif rate_diff > 0.15:
            severity = "medium"
        else:
            severity = "low"
        
        return BiasReport(
            bias_type="label_bias",
            severity=severity,
            description=f"不同群体正例率差异 {rate_diff:.2%}",
            affected_groups=list(positive_rates.keys()),
            recommendation="检查标签过程是否存在偏见，考虑重新标注"
        )
    
    def detect_feature_correlation(
        self,
        sensitive_idx: int,
        threshold: float = 0.3
    ) -> List[BiasReport]:
        """检测特征相关性
        
        检查敏感属性与其他特征的相关性
        """
        reports = []
        sensitive_feature = self.data[:, sensitive_idx]
        
        for i, name in enumerate(self.feature_names):
            if i == sensitive_idx:
                continue
            
            # 计算相关系数
            correlation = np.corrcoef(sensitive_feature, self.data[:, i])[0, 1]
            
            if abs(correlation) > threshold:
                reports.append(BiasReport(
                    bias_type="feature_correlation",
                    severity="medium" if abs(correlation) > 0.5 else "low",
                    description=f"敏感属性与特征 '{name}' 高度相关 (r={correlation:.3f})",
                    affected_groups=[],
                    recommendation="考虑移除或转换相关特征"
                ))
        
        return reports
    
    def generate_report(self, sensitive_feature: str) -> Dict[str, Any]:
        """生成完整偏见报告"""
        sensitive_idx = self.feature_names.index(sensitive_feature)
        
        return {
            "representation_bias": self.detect_representation_bias(sensitive_idx),
            "label_bias": self.detect_label_bias(sensitive_idx),
            "feature_correlations": self.detect_feature_correlation(sensitive_idx)
        }

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    
    # 模拟数据
    n_samples = 1000
    n_features = 5
    
    data = np.random.randn(n_samples, n_features)
    # 添加敏感属性（性别）
    data[:, 0] = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])  # 不平衡分布
    labels = np.random.randint(0, 2, n_samples)
    
    feature_names = ["gender", "age", "income", "education", "experience"]
    
    detector = BiasDetector(data, labels, feature_names)
    report = detector.generate_report("gender")
    
    print("偏见检测报告:")
    print(f"\n表示偏见: {report['representation_bias'].description}")
    print(f"严重程度: {report['representation_bias'].severity}")
    print(f"建议: {report['representation_bias'].recommendation}")
    
    print(f"\n标签偏见: {report['label_bias'].description}")
    print(f"严重程度: {report['label_bias'].severity}")
```

### 3. 隐私保护

#### [概念] 概念解释

隐私保护防止模型泄露敏感信息。常用技术：差分隐私、联邦学习、数据脱敏。差分隐私通过添加噪声保护个体数据。

#### [代码] 代码示例

```python
import numpy as np
from typing import Callable, Any

class DifferentialPrivacy:
    """差分隐私"""
    
    def __init__(self, epsilon: float = 1.0):
        self.epsilon = epsilon
    
    def add_laplace_noise(self, value: float, sensitivity: float = 1.0) -> float:
        """添加拉普拉斯噪声
        
        epsilon: 隐私预算，越小隐私保护越强
        sensitivity: 函数敏感度
        """
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale)
        return value + noise
    
    def add_gaussian_noise(self, value: float, sensitivity: float = 1.0, delta: float = 1e-5) -> float:
        """添加高斯噪声"""
        sigma = sensitivity * np.sqrt(2 * np.log(1.25 / delta)) / self.epsilon
        noise = np.random.normal(0, sigma)
        return value + noise
    
    def private_mean(self, data: np.ndarray, bounds: Tuple[float, float]) -> float:
        """差分隐私均值"""
        # 裁剪数据到指定范围
        clipped = np.clip(data, bounds[0], bounds[1])
        
        # 计算敏感度
        sensitivity = (bounds[1] - bounds[0]) / len(data)
        
        # 计算均值并添加噪声
        mean = np.mean(clipped)
        return self.add_laplace_noise(mean, sensitivity)
    
    def private_count(self, data: np.ndarray, condition: Callable) -> int:
        """差分隐私计数"""
        count = np.sum(condition(data))
        return int(self.add_laplace_noise(count, sensitivity=1.0))

class DataAnonymizer:
    """数据脱敏"""
    
    @staticmethod
    def mask_sensitive(value: str, mask_char: str = "*", visible_chars: int = 2) -> str:
        """掩码脱敏"""
        if len(value) <= visible_chars:
            return mask_char * len(value)
        
        return value[:visible_chars] + mask_char * (len(value) - visible_chars)
    
    @staticmethod
    def hash_value(value: str, salt: str = "") -> str:
        """哈希脱敏"""
        import hashlib
        return hashlib.sha256((value + salt).encode()).hexdigest()[:16]
    
    @staticmethod
    def generalize(value: Any, generalization_map: Dict) -> Any:
        """泛化脱敏"""
        return generalization_map.get(value, value)
    
    @staticmethod
    def add_noise_numeric(value: float, noise_range: float = 0.1) -> float:
        """数值噪声脱敏"""
        noise = np.random.uniform(-noise_range, noise_range) * value
        return value + noise

# 使用示例
if __name__ == "__main__":
    # 差分隐私示例
    dp = DifferentialPrivacy(epsilon=0.5)
    
    salaries = np.array([50000, 60000, 70000, 80000, 90000])
    
    true_mean = np.mean(salaries)
    private_mean = dp.private_mean(salaries, bounds=(40000, 100000))
    
    print(f"真实均值: {true_mean:.2f}")
    print(f"差分隐私均值: {private_mean:.2f}")
    
    # 数据脱敏示例
    anonymizer = DataAnonymizer()
    
    email = "alice@example.com"
    print(f"\n原始邮箱: {email}")
    print(f"掩码脱敏: {anonymizer.mask_sensitive(email)}")
    print(f"哈希脱敏: {anonymizer.hash_value(email)}")
    
    # 泛化脱敏
    age_map = {
        25: "20-30",
        30: "30-40",
        45: "40-50"
    }
    print(f"\n年龄泛化: 25 -> {anonymizer.generalize(25, age_map)}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 可解释性

#### [概念] 概念解释

可解释性帮助理解模型决策过程。方法：特征重要性、SHAP 值、LIME、注意力可视化。目标是让用户信任并理解模型预测。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict, Any

class FeatureImportance:
    """特征重要性分析"""
    
    def __init__(self, model, X: np.ndarray, y: np.ndarray):
        self.model = model
        self.X = X
        self.y = y
    
    def permutation_importance(self, n_repeats: int = 10) -> np.ndarray:
        """排列重要性"""
        # 获取基准分数
        baseline_score = self._score(self.X, self.y)
        
        n_features = self.X.shape[1]
        importances = np.zeros(n_features)
        
        for i in range(n_features):
            scores = []
            for _ in range(n_repeats):
                # 打乱第 i 个特征
                X_permuted = self.X.copy()
                np.random.shuffle(X_permuted[:, i])
                
                score = self._score(X_permuted, self.y)
                scores.append(baseline_score - score)
            
            importances[i] = np.mean(scores)
        
        return importances
    
    def _score(self, X: np.ndarray, y: np.ndarray) -> float:
        """计算模型分数（简化）"""
        return np.random.random()  # 模拟

class SimpleSHAP:
    """简化版 SHAP 值计算"""
    
    def __init__(self, model, X_background: np.ndarray):
        self.model = model
        self.X_background = X_background
    
    def explain(self, X: np.ndarray, n_samples: int = 100) -> np.ndarray:
        """计算 SHAP 值"""
        n_features = X.shape[1]
        shap_values = np.zeros_like(X)
        
        for i in range(len(X)):
            for j in range(n_features):
                # 简化：使用随机采样估计
                contributions = []
                for _ in range(n_samples):
                    # 随机选择背景样本
                    bg_idx = np.random.randint(len(self.X_background))
                    bg_sample = self.X_background[bg_idx].copy()
                    
                    # 计算有无特征 j 的预测差异
                    original_value = X[i, j]
                    
                    # 有特征 j
                    sample_with = X[i].copy()
                    pred_with = self._predict(sample_with)
                    
                    # 无特征 j（用背景值替代）
                    sample_without = X[i].copy()
                    sample_without[j] = bg_sample[j]
                    pred_without = self._predict(sample_without)
                    
                    contributions.append(pred_with - pred_without)
                
                shap_values[i, j] = np.mean(contributions)
        
        return shap_values
    
    def _predict(self, x: np.ndarray) -> float:
        """预测（模拟）"""
        return np.random.random()

# 使用示例
if __name__ == "__main__":
    # 模拟数据
    np.random.seed(42)
    X = np.random.randn(100, 5)
    y = np.random.randint(0, 2, 100)
    
    # 特征重要性
    model = None  # 模拟模型
    fi = FeatureImportance(model, X, y)
    importances = fi.permutation_importance()
    
    print("特征重要性:")
    for i, imp in enumerate(importances):
        print(f"  特征 {i}: {imp:.4f}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| Algorithmic Bias | 算法偏见 |
| Fair ML | 公平机器学习 |
| Explainable AI | 可解释 AI |
| SHAP | Shapley 值解释 |
| LIME | 局部可解释模型 |
| Differential Privacy | 差分隐私 |
| Federated Learning | 联邦学习 |
| GDPR | 数据保护法规 |
| AI Ethics | AI 伦理准则 |
| Responsible AI | 负责任 AI |

---

## [实战] 核心实战清单

1. 实现公平性评估，检测模型对不同群体的偏见
2. 使用差分隐私保护数据隐私
3. 构建特征重要性分析工具

## [避坑] 三层避坑提醒

- **核心层误区**：忽视数据偏见，导致模型歧视
- **重点层误区**：过度追求公平性，牺牲模型性能
- **扩展层建议**：建立完整的 AI 伦理审查流程
