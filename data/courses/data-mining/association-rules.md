# 关联规则挖掘 三层深度学习教程

## [总览] 技术总览

关联规则挖掘发现数据项之间的有趣关联关系，经典应用是购物篮分析。核心算法包括 Apriori 和 FP-Growth。关联规则广泛应用于推荐系统、交叉销售、异常检测等领域。

本教程采用三层漏斗学习法：**核心层**聚焦 Apriori 算法、FP-Growth 算法、规则评估指标三大基石；**重点层**深入算法优化和实际应用；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Apriori 算法

#### [概念] 概念解释

Apriori 算法是最经典的关联规则挖掘算法，基于频繁项集的先验性质：频繁项集的所有非空子集也必须是频繁的。通过逐层搜索迭代找出所有频繁项集，然后生成关联规则。

#### [代码] 代码示例

```python
from typing import List, Dict, Set, Tuple
from itertools import combinations
from collections import defaultdict

class Apriori:
    """Apriori 算法实现"""
    
    def __init__(self, min_support: float = 0.5, min_confidence: float = 0.7):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.frequent_itemsets: Dict[frozenset, int] = {}
        self.rules: List[Tuple[frozenset, frozenset, float, float]] = []
    
    def fit(self, transactions: List[List[str]]) -> 'Apriori':
        """训练模型"""
        self.transactions = transactions
        self.n_transactions = len(transactions)
        
        self._find_frequent_itemsets()
        
        self._generate_rules()
        
        return self
    
    def _find_frequent_itemsets(self):
        """找出所有频繁项集"""
        C1 = self._get_C1()
        
        L1 = self._filter_by_support(C1)
        self.frequent_itemsets.update(L1)
        
        k = 2
        L_prev = L1
        
        while L_prev:
            Ck = self._generate_candidates(L_prev, k)
            
            Lk = self._filter_by_support(Ck)
            
            self.frequent_itemsets.update(Lk)
            
            L_prev = Lk
            k += 1
    
    def _get_C1(self) -> Dict[frozenset, int]:
        """生成候选 1-项集"""
        C1 = defaultdict(int)
        
        for transaction in self.transactions:
            for item in transaction:
                C1[frozenset([item])] += 1
        
        return C1
    
    def _filter_by_support(self, candidates: Dict[frozenset, int]) -> Dict[frozenset, int]:
        """根据支持度过滤"""
        min_count = self.min_support * self.n_transactions
        
        return {
            itemset: count
            for itemset, count in candidates.items()
            if count >= min_count
        }
    
    def _generate_candidates(
        self,
        L_prev: Dict[frozenset, int],
        k: int
    ) -> Dict[frozenset, int]:
        """生成候选 k-项集"""
        candidates = defaultdict(int)
        items = list(L_prev.keys())
        
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                union = items[i] | items[j]
                
                if len(union) == k:
                    if self._has_infrequent_subset(union, L_prev):
                        continue
                    
                    for transaction in self.transactions:
                        if union.issubset(set(transaction)):
                            candidates[union] += 1
        
        return candidates
    
    def _has_infrequent_subset(
        self,
        itemset: frozenset,
        L_prev: Dict[frozenset, int]
    ) -> bool:
        """检查是否有非频繁子集"""
        for subset in combinations(itemset, len(itemset) - 1):
            if frozenset(subset) not in L_prev:
                return True
        return False
    
    def _generate_rules(self):
        """生成关联规则"""
        for itemset, support_count in self.frequent_itemsets.items():
            if len(itemset) < 2:
                continue
            
            support = support_count / self.n_transactions
            
            for antecedent_size in range(1, len(itemset)):
                for antecedent in combinations(itemset, antecedent_size):
                    antecedent = frozenset(antecedent)
                    consequent = itemset - antecedent
                    
                    antecedent_support = self.frequent_itemsets.get(antecedent, 0)
                    
                    if antecedent_support == 0:
                        continue
                    
                    confidence = support_count / antecedent_support
                    
                    if confidence >= self.min_confidence:
                        self.rules.append((antecedent, consequent, support, confidence))
    
    def get_rules(self) -> List[Dict]:
        """获取关联规则"""
        return [
            {
                "antecedent": list(rule[0]),
                "consequent": list(rule[1]),
                "support": rule[2],
                "confidence": rule[3]
            }
            for rule in sorted(self.rules, key=lambda x: x[3], reverse=True)
        ]

transactions = [
    ['bread', 'milk', 'butter'],
    ['bread', 'diaper', 'beer', 'eggs'],
    ['milk', 'diaper', 'beer', 'cola'],
    ['bread', 'milk', 'diaper', 'beer'],
    ['bread', 'milk', 'cola']
]

apriori = Apriori(min_support=0.4, min_confidence=0.6)
apriori.fit(transactions)

for rule in apriori.get_rules():
    print(f"{rule['antecedent']} -> {rule['consequent']}")
    print(f"  Support: {rule['support']:.2f}, Confidence: {rule['confidence']:.2f}")
```

### 2. FP-Growth 算法

#### [概念] 概念解释

FP-Growth 算法通过构建 FP 树（频繁模式树）来发现频繁项集，无需生成候选集。相比 Apriori，FP-Growth 只需扫描数据库两次，效率更高。

#### [代码] 代码示例

```python
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class FPNode:
    """FP 树节点"""
    item: str
    count: int = 1
    parent: Optional['FPNode'] = None
    children: Dict[str, 'FPNode'] = None
    link: Optional['FPNode'] = None
    
    def __post_init__(self):
        if self.children is None:
            self.children = {}

class FPGrowth:
    """FP-Growth 算法实现"""
    
    def __init__(self, min_support: float = 0.5):
        self.min_support = min_support
        self.frequent_itemsets: Dict[frozenset, int] = {}
    
    def fit(self, transactions: List[List[str]]) -> 'FPGrowth':
        """训练模型"""
        self.transactions = transactions
        self.n_transactions = len(transactions)
        self.min_count = int(self.min_support * self.n_transactions)
        
        item_counts = self._count_items()
        
        self.header_table = self._build_header_table(item_counts)
        
        self.root = self._build_fp_tree(item_counts)
        
        self._mine_fp_tree()
        
        return self
    
    def _count_items(self) -> Dict[str, int]:
        """统计单项出现次数"""
        counts = defaultdict(int)
        for transaction in self.transactions:
            for item in transaction:
                counts[item] += 1
        return counts
    
    def _build_header_table(
        self,
        item_counts: Dict[str, int]
    ) -> Dict[str, List]:
        """构建头表"""
        header = {}
        
        for item, count in item_counts.items():
            if count >= self.min_count:
                header[item] = [count, None]
        
        return dict(sorted(
            header.items(),
            key=lambda x: x[1][0],
            reverse=True
        ))
    
    def _build_fp_tree(self, item_counts: Dict[str, int]) -> FPNode:
        """构建 FP 树"""
        root = FPNode(item='root', count=0)
        
        for transaction in self.transactions:
            ordered_items = [
                item for item in sorted(
                    transaction,
                    key=lambda x: item_counts.get(x, 0),
                    reverse=True
                )
                if item in self.header_table
            ]
            
            self._insert_tree(ordered_items, root)
        
        return root
    
    def _insert_tree(self, items: List[str], node: FPNode):
        """插入项到树中"""
        if not items:
            return
        
        first_item = items[0]
        
        if first_item in node.children:
            node.children[first_item].count += 1
        else:
            new_node = FPNode(item=first_item, parent=node)
            node.children[first_item] = new_node
            
            if self.header_table[first_item][1] is None:
                self.header_table[first_item][1] = new_node
            else:
                current = self.header_table[first_item][1]
                while current.link is not None:
                    current = current.link
                current.link = new_node
        
        self._insert_tree(items[1:], node.children[first_item])
    
    def _mine_fp_tree(self):
        """挖掘频繁项集"""
        for item in reversed(list(self.header_table.keys())):
            itemsets = self._find_prefix_paths(item)
            
            self.frequent_itemsets[frozenset([item])] = self.header_table[item][0]
            
            if itemsets:
                conditional_tree = self._build_conditional_tree(itemsets)
                
                self._mine_conditional_tree(conditional_tree, [item])
    
    def _find_prefix_paths(self, item: str) -> List[List[str]]:
        """找前缀路径"""
        paths = []
        
        node = self.header_table[item][1]
        
        while node is not None:
            path = []
            count = node.count
            
            parent = node.parent
            while parent.item != 'root':
                path.append(parent.item)
                parent = parent.parent
            
            if path:
                paths.append((path[::-1], count))
            
            node = node.link
        
        return paths
    
    def _build_conditional_tree(
        self,
        paths: List[Tuple[List[str], int]]
    ) -> Dict[str, int]:
        """构建条件模式树"""
        tree = defaultdict(int)
        
        for path, count in paths:
            for item in path:
                tree[item] += count
        
        return {
            item: count
            for item, count in tree.items()
            if count >= self.min_count
        }
    
    def _mine_conditional_tree(
        self,
        conditional_tree: Dict[str, int],
        suffix: List[str]
    ):
        """挖掘条件模式树"""
        for item, count in conditional_tree.items():
            itemset = frozenset([item] + suffix)
            self.frequent_itemsets[itemset] = count
    
    def get_frequent_itemsets(self) -> List[Dict]:
        """获取频繁项集"""
        return [
            {
                "itemset": list(itemset),
                "support": count / self.n_transactions,
                "count": count
            }
            for itemset, count in sorted(
                self.frequent_itemsets.items(),
                key=lambda x: len(x[0])
            )
        ]

fp_growth = FPGrowth(min_support=0.4)
fp_growth.fit(transactions)

for itemset in fp_growth.get_frequent_itemsets():
    print(f"{itemset['itemset']}: support={itemset['support']:.2f}")
```

### 3. 规则评估指标

#### [概念] 概念解释

关联规则的质量通过多个指标评估：支持度（规则出现的频率）、置信度（规则的可信程度）、提升度（规则的实际提升效果）、杠杆率、确信度等。

#### [代码] 代码示例

```python
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class RuleMetrics:
    """规则评估指标"""
    antecedent: frozenset
    consequent: frozenset
    support: float
    confidence: float
    lift: float
    leverage: float
    conviction: float
    interest: float

class RuleEvaluator:
    """规则评估器"""
    
    def __init__(self, transactions: List[List[str]]):
        self.transactions = [set(t) for t in transactions]
        self.n_transactions = len(transactions)
    
    def evaluate(
        self,
        antecedent: set,
        consequent: set
    ) -> RuleMetrics:
        """评估规则"""
        antecedent = frozenset(antecedent)
        consequent = frozenset(consequent)
        union = antecedent | consequent
        
        support_A = self._count(antecedent) / self.n_transactions
        support_C = self._count(consequent) / self.n_transactions
        support_AC = self._count(union) / self.n_transactions
        
        confidence = support_AC / support_A if support_A > 0 else 0
        
        lift = support_AC / (support_A * support_C) if support_A * support_C > 0 else 0
        
        leverage = support_AC - (support_A * support_C)
        
        conviction = (1 - support_C) / (1 - confidence) if confidence < 1 else float('inf')
        
        interest = confidence - support_C
        
        return RuleMetrics(
            antecedent=antecedent,
            consequent=consequent,
            support=support_AC,
            confidence=confidence,
            lift=lift,
            leverage=leverage,
            conviction=conviction,
            interest=interest
        )
    
    def _count(self, itemset: frozenset) -> int:
        """统计项集出现次数"""
        return sum(1 for t in self.transactions if itemset.issubset(t))
    
    def evaluate_all_rules(
        self,
        rules: List[Tuple[set, set]]
    ) -> List[RuleMetrics]:
        """评估所有规则"""
        return [
            self.evaluate(antecedent, consequent)
            for antecedent, consequent in rules
        ]
    
    def filter_rules(
        self,
        rules: List[RuleMetrics],
        min_support: float = 0.1,
        min_confidence: float = 0.5,
        min_lift: float = 1.0
    ) -> List[RuleMetrics]:
        """过滤规则"""
        return [
            rule for rule in rules
            if rule.support >= min_support
            and rule.confidence >= min_confidence
            and rule.lift >= min_lift
        ]
    
    def rank_rules(
        self,
        rules: List[RuleMetrics],
        by: str = 'lift'
    ) -> List[RuleMetrics]:
        """排序规则"""
        return sorted(
            rules,
            key=lambda r: getattr(r, by),
            reverse=True
        )
    
    def print_rules(self, rules: List[RuleMetrics], top_n: int = 10):
        """打印规则"""
        for i, rule in enumerate(rules[:top_n], 1):
            print(f"\nRule {i}:")
            print(f"  {set(rule.antecedent)} -> {set(rule.consequent)}")
            print(f"  Support: {rule.support:.4f}")
            print(f"  Confidence: {rule.confidence:.4f}")
            print(f"  Lift: {rule.lift:.4f}")
            print(f"  Leverage: {rule.leverage:.4f}")
            print(f"  Conviction: {rule.conviction:.4f}")

evaluator = RuleEvaluator(transactions)

rules = [
    ({'bread'}, {'milk'}),
    ({'diaper'}, {'beer'}),
    ({'bread', 'milk'}, {'butter'}),
]

metrics = evaluator.evaluate_all_rules(rules)
metrics = evaluator.filter_rules(metrics, min_lift=1.0)
metrics = evaluator.rank_rules(metrics, by='lift')

evaluator.print_rules(metrics)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 算法优化

#### [概念] 概念解释

关联规则挖掘算法的优化方向：减少数据库扫描次数、优化候选项集生成、并行化处理、增量更新。优化后的算法能处理更大规模的数据集。

#### [代码] 代码示例

```python
from typing import List, Dict, Set
from collections import defaultdict
import multiprocessing as mp

class OptimizedApriori:
    """优化的 Apriori 算法"""
    
    def __init__(self, min_support: float = 0.5, n_workers: int = 4):
        self.min_support = min_support
        self.n_workers = n_workers
    
    def fit(self, transactions: List[List[str]]) -> Dict[frozenset, int]:
        """并行训练"""
        self.transactions = transactions
        self.n_transactions = len(transactions)
        self.min_count = int(self.min_support * self.n_transactions)
        
        frequent_itemsets = {}
        
        L1 = self._find_frequent_1_itemsets()
        frequent_itemsets.update(L1)
        
        k = 2
        L_prev = L1
        
        while L_prev:
            candidates = self._generate_candidates_optimized(L_prev, k)
            
            Lk = self._count_candidates_parallel(candidates)
            
            Lk = {
                itemset: count
                for itemset, count in Lk.items()
                if count >= self.min_count
            }
            
            frequent_itemsets.update(Lk)
            L_prev = Lk
            k += 1
        
        return frequent_itemsets
    
    def _find_frequent_1_itemsets(self) -> Dict[frozenset, int]:
        """找出频繁 1-项集"""
        counts = defaultdict(int)
        
        for transaction in self.transactions:
            for item in set(transaction):
                counts[frozenset([item])] += 1
        
        return {
            itemset: count
            for itemset, count in counts.items()
            if count >= self.min_count
        }
    
    def _generate_candidates_optimized(
        self,
        L_prev: Dict[frozenset, int],
        k: int
    ) -> Set[frozenset]:
        """优化的候选生成"""
        candidates = set()
        items = list(L_prev.keys())
        
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                union = items[i] | items[j]
                
                if len(union) == k:
                    candidates.add(union)
        
        return candidates
    
    def _count_candidates_parallel(
        self,
        candidates: Set[frozenset]
    ) -> Dict[frozenset, int]:
        """并行计数"""
        chunk_size = len(self.transactions) // self.n_workers
        
        chunks = [
            self.transactions[i:i + chunk_size]
            for i in range(0, len(self.transactions), chunk_size)
        ]
        
        with mp.Pool(self.n_workers) as pool:
            results = pool.starmap(
                self._count_chunk,
                [(chunk, candidates) for chunk in chunks]
            )
        
        combined = defaultdict(int)
        for result in results:
            for itemset, count in result.items():
                combined[itemset] += count
        
        return combined
    
    def _count_chunk(
        self,
        transactions: List[List[str]],
        candidates: Set[frozenset]
    ) -> Dict[frozenset, int]:
        """计算块中的候选计数"""
        counts = defaultdict(int)
        
        for transaction in transactions:
            transaction_set = set(transaction)
            for candidate in candidates:
                if candidate.issubset(transaction_set):
                    counts[candidate] += 1
        
        return counts

class IncrementalApriori:
    """增量 Apriori 算法"""
    
    def __init__(self, min_support: float = 0.5):
        self.min_support = min_support
        self.frequent_itemsets: Dict[frozenset, int] = {}
        self.n_transactions = 0
    
    def initial_fit(self, transactions: List[List[str]]):
        """初始训练"""
        self.n_transactions = len(transactions)
        self.min_count = int(self.min_support * self.n_transactions)
        
        apriori = Apriori(min_support=self.min_support)
        apriori.fit(transactions)
        
        self.frequent_itemsets = apriori.frequent_itemsets
    
    def update(self, new_transactions: List[List[str]]):
        """增量更新"""
        old_min_count = self.min_count
        
        self.n_transactions += len(new_transactions)
        self.min_count = int(self.min_support * self.n_transactions)
        
        for transaction in new_transactions:
            for size in range(1, len(transaction) + 1):
                for itemset in combinations(transaction, size):
                    itemset = frozenset(itemset)
                    if itemset in self.frequent_itemsets:
                        self.frequent_itemsets[itemset] += 1
        
        new_apriori = Apriori(min_support=self.min_support)
        new_apriori.fit(new_transactions)
        
        for itemset, count in new_apriori.frequent_itemsets.items():
            if itemset in self.frequent_itemsets:
                self.frequent_itemsets[itemset] += count
            else:
                self.frequent_itemsets[itemset] = count
        
        self.frequent_itemsets = {
            itemset: count
            for itemset, count in self.frequent_itemsets.items()
            if count >= self.min_count
        }
```

### 2. 实际应用

#### [概念] 概念解释

关联规则挖掘在实际中有广泛应用：购物篮分析、网页推荐、交叉销售、异常检测、生物信息学。应用时需考虑业务背景和规则可解释性。

#### [代码] 代码示例

```python
from typing import List, Dict, Any
from dataclasses import dataclass
import pandas as pd

@dataclass
class ProductRecommendation:
    """商品推荐"""
    product: str
    recommended_products: List[str]
    confidence: float
    lift: float

class MarketBasketAnalyzer:
    """购物篮分析器"""
    
    def __init__(self, min_support: float = 0.01, min_confidence: float = 0.3):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.rules: List[Dict] = []
    
    def analyze(self, transactions: List[List[str]]) -> List[ProductRecommendation]:
        """分析购物篮"""
        apriori = Apriori(
            min_support=self.min_support,
            min_confidence=self.min_confidence
        )
        apriori.fit(transactions)
        
        self.rules = apriori.get_rules()
        
        recommendations = {}
        
        for rule in self.rules:
            antecedent = rule['antecedent']
            consequent = rule['consequent']
            
            if len(antecedent) == 1:
                product = antecedent[0]
                
                if product not in recommendations:
                    recommendations[product] = []
                
                recommendations[product].append({
                    'product': consequent[0] if len(consequent) == 1 else consequent,
                    'confidence': rule['confidence'],
                    'lift': rule.get('lift', 1.0)
                })
        
        result = []
        for product, recs in recommendations.items():
            recs.sort(key=lambda x: x['lift'], reverse=True)
            
            result.append(ProductRecommendation(
                product=product,
                recommended_products=[r['product'] for r in recs[:5]],
                confidence=recs[0]['confidence'] if recs else 0,
                lift=recs[0]['lift'] if recs else 0
            ))
        
        return result
    
    def cross_sell_suggestions(
        self,
        cart: List[str],
        top_n: int = 5
    ) -> List[Dict]:
        """交叉销售建议"""
        suggestions = []
        
        for rule in self.rules:
            antecedent = set(rule['antecedent'])
            
            if antecedent.issubset(set(cart)):
                consequent = rule['consequent']
                
                for item in consequent:
                    if item not in cart:
                        suggestions.append({
                            'product': item,
                            'confidence': rule['confidence'],
                            'reason': f"Customers who bought {rule['antecedent']} also bought {item}"
                        })
        
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return suggestions[:top_n]

class AnomalyDetector:
    """基于关联规则的异常检测"""
    
    def __init__(self, min_support: float = 0.1, min_confidence: float = 0.7):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.normal_patterns: List[Dict] = []
    
    def train(self, normal_transactions: List[List[str]]):
        """训练正常模式"""
        apriori = Apriori(
            min_support=self.min_support,
            min_confidence=self.min_confidence
        )
        apriori.fit(normal_transactions)
        
        self.normal_patterns = apriori.get_rules()
    
    def detect(self, transaction: List[str]) -> Dict:
        """检测异常"""
        anomalies = []
        transaction_set = set(transaction)
        
        for pattern in self.normal_patterns:
            antecedent = set(pattern['antecedent'])
            consequent = set(pattern['consequent'])
            
            if antecedent.issubset(transaction_set):
                if not consequent.issubset(transaction_set):
                    anomalies.append({
                        'type': 'missing_expected',
                        'expected': list(consequent),
                        'based_on': list(antecedent),
                        'confidence': pattern['confidence']
                    })
        
        return {
            'is_anomaly': len(anomalies) > 0,
            'anomalies': anomalies,
            'anomaly_score': len(anomalies) / max(len(self.normal_patterns), 1)
        }

class WebUsageMiner:
    """Web 使用模式挖掘"""
    
    def __init__(self, min_support: float = 0.05):
        self.min_support = min_support
        self.page_patterns: List[Dict] = []
    
    def analyze_sessions(self, sessions: List[List[str]]):
        """分析会话模式"""
        apriori = Apriori(min_support=self.min_support, min_confidence=0.5)
        apriori.fit(sessions)
        
        self.page_patterns = apriori.get_rules()
    
    def predict_next_pages(self, current_path: List[str], top_n: int = 3) -> List[str]:
        """预测下一页面"""
        predictions = []
        current_set = set(current_path)
        
        for pattern in self.page_patterns:
            antecedent = set(pattern['antecedent'])
            
            if antecedent.issubset(current_set):
                consequent = pattern['consequent']
                
                for page in consequent:
                    if page not in current_set:
                        predictions.append({
                            'page': page,
                            'confidence': pattern['confidence']
                        })
        
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return [p['page'] for p in predictions[:top_n]]
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Eclat Algorithm | 垂直数据格式挖掘算法 |
| Declat | 差集 Eclat 算法 |
| Closed Itemset | 闭频繁项集挖掘 |
| Maximal Itemset | 最大频繁项集挖掘 |
| Multi-level Association | 多层关联规则 |
| Quantitative Association | 量化关联规则 |
| Temporal Association | 时序关联规则 |
| Spatial Association | 空间关联规则 |
| Negative Association | 负关联规则 |
| Weighted Association | 加权关联规则 |
