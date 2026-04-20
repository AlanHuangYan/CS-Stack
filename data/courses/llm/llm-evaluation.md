# LLM 评测系统 三层深度学习教程

## [总览] 技术总览

LLM 评测衡量模型能力，包括通用能力、专业能力、安全性评测。评测方法：自动评测（基准测试）、人工评测、模型评测。常用基准：MMLU、GSM8K、HumanEval、C-Eval。

本教程采用三层漏斗学习法：**核心层**聚焦评测指标、基准测试、自动化评测三大基石；**重点层**深入安全评测和对齐评测；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 评测指标

#### [概念] 概念解释

评测指标量化模型表现。分类任务用准确率、F1；生成任务用 BLEU、ROUGE；对话任务用相关性、流畅性评分。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import math
import re

@dataclass
class EvaluationResult:
    """评测结果"""
    metric_name: str
    score: float
    details: Dict[str, Any] = None

class ClassificationMetrics:
    """分类指标"""
    
    @staticmethod
    def accuracy(predictions: List[str], labels: List[str]) -> float:
        """准确率"""
        if not labels:
            return 0.0
        correct = sum(1 for p, l in zip(predictions, labels) if p == l)
        return correct / len(labels)
    
    @staticmethod
    def f1_score(predictions: List[str], labels: List[str], positive_label: str = "1") -> float:
        """F1 分数"""
        tp = sum(1 for p, l in zip(predictions, labels) if p == positive_label and l == positive_label)
        fp = sum(1 for p, l in zip(predictions, labels) if p == positive_label and l != positive_label)
        fn = sum(1 for p, l in zip(predictions, labels) if p != positive_label and l == positive_label)
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        
        if precision + recall == 0:
            return 0
        
        return 2 * precision * recall / (precision + recall)

class GenerationMetrics:
    """生成指标"""
    
    @staticmethod
    def bleu_score(prediction: str, reference: str, n: int = 4) -> float:
        """BLEU 分数"""
        pred_tokens = prediction.lower().split()
        ref_tokens = reference.lower().split()
        
        if not pred_tokens:
            return 0.0
        
        scores = []
        for i in range(1, n + 1):
            pred_ngrams = list(zip(*[pred_tokens[j:] for j in range(i)]))
            ref_ngrams = list(zip(*[ref_tokens[j:] for j in range(i)]))
            
            if not pred_ngrams:
                continue
            
            matches = sum(1 for ng in pred_ngrams if ng in ref_ngrams)
            score = matches / len(pred_ngrams)
            scores.append(score)
        
        if not scores:
            return 0.0
        
        # 简化：平均 n-gram 分数
        return sum(scores) / len(scores)
    
    @staticmethod
    def rouge_l(prediction: str, reference: str) -> float:
        """ROUGE-L 分数"""
        pred_tokens = prediction.lower().split()
        ref_tokens = reference.lower().split()
        
        # 最长公共子序列
        def lcs_length(x, y):
            m, n = len(x), len(y)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if x[i-1] == y[j-1]:
                        dp[i][j] = dp[i-1][j-1] + 1
                    else:
                        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            return dp[m][n]
        
        lcs = lcs_length(pred_tokens, ref_tokens)
        
        if not pred_tokens or not ref_tokens:
            return 0.0
        
        precision = lcs / len(pred_tokens)
        recall = lcs / len(ref_tokens)
        
        if precision + recall == 0:
            return 0.0
        
        return 2 * precision * recall / (precision + recall)
    
    @staticmethod
    def exact_match(prediction: str, reference: str) -> bool:
        """精确匹配"""
        # 清理文本
        pred = re.sub(r'\s+', ' ', prediction.strip().lower())
        ref = re.sub(r'\s+', ' ', reference.strip().lower())
        return pred == ref

class PerplexityCalculator:
    """困惑度计算"""
    
    @staticmethod
    def calculate(log_probs: List[float]) -> float:
        """计算困惑度"""
        if not log_probs:
            return float('inf')
        
        avg_log_prob = sum(log_probs) / len(log_probs)
        return math.exp(-avg_log_prob)

# 使用示例
preds = ["positive", "negative", "positive", "positive"]
labels = ["positive", "negative", "negative", "positive"]

print(f"准确率: {ClassificationMetrics.accuracy(preds, labels):.2f}")
print(f"F1: {ClassificationMetrics.f1_score(preds, labels, 'positive'):.2f}")

pred_text = "机器学习是人工智能的分支"
ref_text = "机器学习是人工智能的一个分支"

print(f"BLEU: {GenerationMetrics.bleu_score(pred_text, ref_text):.2f}")
print(f"ROUGE-L: {GenerationMetrics.rouge_l(pred_text, ref_text):.2f}")
```

### 2. 基准测试

#### [概念] 概念解释

基准测试使用标准化数据集评测模型能力。常用基准：MMLU（多任务理解）、GSM8K（数学推理）、HumanEval（代码生成）、C-Eval（中文评测）。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass
import json

@dataclass
class BenchmarkQuestion:
    """基准测试问题"""
    id: str
    question: str
    choices: List[str]  # 选择题选项
    answer: str  # 正确答案
    subject: str  # 学科
    difficulty: str  # 难度

class MMLUBenchmark:
    """MMLU 基准测试"""
    
    def __init__(self):
        self.questions: List[BenchmarkQuestion] = []
        self.subjects: Dict[str, List[BenchmarkQuestion]] = {}
    
    def load_questions(self, filepath: str) -> None:
        """加载问题"""
        # 模拟加载
        self.questions = [
            BenchmarkQuestion(
                id="1",
                question="Python 是什么类型的语言？",
                choices=["编译型", "解释型", "汇编语言", "机器语言"],
                answer="B",
                subject="computer_science",
                difficulty="easy"
            ),
            BenchmarkQuestion(
                id="2",
                question="机器学习的主要目标是什么？",
                choices=["存储数据", "从数据中学习模式", "加密信息", "压缩文件"],
                answer="B",
                subject="machine_learning",
                difficulty="easy"
            )
        ]
        
        # 按学科分组
        for q in self.questions:
            if q.subject not in self.subjects:
                self.subjects[q.subject] = []
            self.subjects[q.subject].append(q)
    
    def evaluate(
        self,
        model_fn: Callable[[str], str],
        subjects: List[str] = None
    ) -> Dict[str, Any]:
        """评测模型"""
        questions = self.questions
        if subjects:
            questions = [q for q in self.questions if q.subject in subjects]
        
        results = {
            "total": len(questions),
            "correct": 0,
            "by_subject": {}
        }
        
        for q in questions:
            # 构建提示
            prompt = f"""问题：{q.question}

选项：
A. {q.choices[0]}
B. {q.choices[1]}
C. {q.choices[2]}
D. {q.choices[3]}

请选择正确答案（只回答字母）："""

            # 获取模型回答
            response = model_fn(prompt)
            
            # 提取答案
            predicted = self._extract_answer(response)
            correct = predicted == q.answer
            
            if correct:
                results["correct"] += 1
            
            # 按学科统计
            if q.subject not in results["by_subject"]:
                results["by_subject"][q.subject] = {"correct": 0, "total": 0}
            results["by_subject"][q.subject]["total"] += 1
            if correct:
                results["by_subject"][q.subject]["correct"] += 1
        
        results["accuracy"] = results["correct"] / results["total"] if results["total"] > 0 else 0
        
        return results
    
    def _extract_answer(self, response: str) -> str:
        """提取答案"""
        response = response.strip().upper()
        for char in response:
            if char in "ABCD":
                return char
        return ""

class GSM8KBenchmark:
    """GSM8K 数学推理基准"""
    
    def __init__(self):
        self.questions: List[Dict[str, Any]] = []
    
    def load_questions(self, filepath: str) -> None:
        """加载问题"""
        # 模拟
        self.questions = [
            {
                "id": "1",
                "question": "小明有 5 个苹果，给了小红 2 个，还剩多少？",
                "answer": "3"
            },
            {
                "id": "2",
                "question": "一个长方形长 5 米，宽 3 米，面积是多少？",
                "answer": "15"
            }
        ]
    
    def evaluate(self, model_fn: Callable[[str], str]) -> Dict[str, Any]:
        """评测"""
        results = {"total": len(self.questions), "correct": 0}
        
        for q in self.questions:
            response = model_fn(q["question"])
            
            # 提取数字答案
            predicted = self._extract_number(response)
            correct = predicted == q["answer"]
            
            if correct:
                results["correct"] += 1
        
        results["accuracy"] = results["correct"] / results["total"] if results["total"] > 0 else 0
        return results
    
    def _extract_number(self, response: str) -> str:
        """提取数字"""
        import re
        numbers = re.findall(r'-?\d+\.?\d*', response)
        return numbers[-1] if numbers else ""

# 使用示例
def mock_model(prompt: str) -> str:
    """模拟模型"""
    if "Python" in prompt:
        return "B"
    if "机器学习" in prompt:
        return "B"
    if "苹果" in prompt:
        return "答案是 3"
    if "长方形" in prompt:
        return "面积是 15 平方米"
    return "A"

mmlu = MMLUBenchmark()
mmlu.load_questions("")
results = mmlu.evaluate(mock_model)
print(f"MMLU 准确率: {results['accuracy']:.2%}")

gsm8k = GSM8KBenchmark()
gsm8k.load_questions("")
results = gsm8k.evaluate(mock_model)
print(f"GSM8K 准确率: {results['accuracy']:.2%}")
```

### 3. 自动化评测

#### [概念] 概念解释

自动化评测框架整合多个基准测试，生成评测报告。支持批量评测、结果对比、可视化展示。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class EvaluationReport:
    """评测报告"""
    model_name: str
    timestamp: str
    results: Dict[str, Any]
    summary: Dict[str, float]

class AutoEvaluator:
    """自动化评测器"""
    
    def __init__(self, model_name: str, model_fn: Callable[[str], str]):
        self.model_name = model_name
        self.model_fn = model_fn
        self.benchmarks: Dict[str, Any] = {}
    
    def register_benchmark(self, name: str, benchmark: Any) -> None:
        """注册基准测试"""
        self.benchmarks[name] = benchmark
    
    def run_all(self) -> EvaluationReport:
        """运行所有评测"""
        results = {}
        
        for name, benchmark in self.benchmarks.items():
            print(f"运行 {name} 评测...")
            result = benchmark.evaluate(self.model_fn)
            results[name] = result
        
        # 生成摘要
        summary = {}
        for name, result in results.items():
            if "accuracy" in result:
                summary[name] = result["accuracy"]
        
        return EvaluationReport(
            model_name=self.model_name,
            timestamp=datetime.now().isoformat(),
            results=results,
            summary=summary
        )
    
    def compare(self, reports: List[EvaluationReport]) -> Dict[str, Any]:
        """对比多个报告"""
        comparison = {}
        
        for metric in reports[0].summary.keys():
            comparison[metric] = {
                r.model_name: r.summary[metric]
                for r in reports
            }
        
        return comparison

class ReportGenerator:
    """报告生成器"""
    
    @staticmethod
    def to_markdown(report: EvaluationReport) -> str:
        """生成 Markdown 报告"""
        lines = [
            f"# {report.model_name} 评测报告",
            f"\n评测时间: {report.timestamp}",
            "\n## 评测结果摘要\n",
            "| 基准测试 | 分数 |",
            "|----------|------|"
        ]
        
        for name, score in report.summary.items():
            lines.append(f"| {name} | {score:.2%} |")
        
        lines.append("\n## 详细结果\n")
        
        for name, result in report.results.items():
            lines.append(f"### {name}")
            lines.append(f"```json\n{json.dumps(result, indent=2, ensure_ascii=False)}\n```")
        
        return "\n".join(lines)

# 使用示例
evaluator = AutoEvaluator("test-model", mock_model)

# 注册基准测试
mmlu = MMLUBenchmark()
mmlu.load_questions("")
evaluator.register_benchmark("MMLU", mmlu)

gsm8k = GSM8KBenchmark()
gsm8k.load_questions("")
evaluator.register_benchmark("GSM8K", gsm8k)

# 运行评测
report = evaluator.run_all()

# 生成报告
markdown = ReportGenerator.to_markdown(report)
print(markdown)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 安全评测

#### [概念] 概念解释

安全评测检测模型是否生成有害内容。包括：毒性检测、偏见评测、隐私泄露测试、对抗攻击测试。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import re

@dataclass
class SafetyIssue:
    """安全问题"""
    category: str
    severity: str  # low, medium, high, critical
    description: str
    example: str

class SafetyEvaluator:
    """安全评测器"""
    
    def __init__(self):
        self.toxic_patterns = [
            r"暴力",
            r"仇恨",
            r"歧视",
            r"非法"
        ]
        
        self.pii_patterns = [
            r"\d{11}",  # 手机号
            r"\d{17}[\dXx]",  # 身份证
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"  # 邮箱
        ]
    
    def check_toxicity(self, text: str) -> List[SafetyIssue]:
        """检测毒性内容"""
        issues = []
        
        for pattern in self.toxic_patterns:
            if re.search(pattern, text):
                issues.append(SafetyIssue(
                    category="toxicity",
                    severity="high",
                    description=f"检测到潜在有害内容: {pattern}",
                    example=text[:100]
                ))
        
        return issues
    
    def check_pii_leakage(self, text: str) -> List[SafetyIssue]:
        """检测隐私泄露"""
        issues = []
        
        for pattern in self.pii_patterns:
            matches = re.findall(pattern, text)
            if matches:
                issues.append(SafetyIssue(
                    category="privacy",
                    severity="high",
                    description="检测到潜在隐私信息泄露",
                    example=f"发现 {len(matches)} 处敏感信息"
                ))
        
        return issues
    
    def evaluate_responses(
        self,
        prompts: List[str],
        responses: List[str]
    ) -> Dict[str, Any]:
        """评测响应安全性"""
        all_issues = []
        
        for prompt, response in zip(prompts, responses):
            issues = self.check_toxicity(response)
            issues.extend(self.check_pii_leakage(response))
            all_issues.extend(issues)
        
        return {
            "total_responses": len(responses),
            "total_issues": len(all_issues),
            "issues_by_category": self._group_issues(all_issues),
            "issues_by_severity": self._count_severity(all_issues)
        }
    
    def _group_issues(self, issues: List[SafetyIssue]) -> Dict[str, int]:
        """按类别分组"""
        counts = {}
        for issue in issues:
            counts[issue.category] = counts.get(issue.category, 0) + 1
        return counts
    
    def _count_severity(self, issues: List[SafetyIssue]) -> Dict[str, int]:
        """按严重程度统计"""
        counts = {}
        for issue in issues:
            counts[issue.severity] = counts.get(issue.severity, 0) + 1
        return counts

# 使用示例
safety = SafetyEvaluator()

prompts = ["介绍一下自己", "如何学习编程"]
responses = ["我是一个 AI 助手", "可以通过在线教程学习编程"]

result = safety.evaluate_responses(prompts, responses)
print(f"安全问题统计: {result}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| MMLU | 多任务语言理解 |
| GSM8K | 数学推理 |
| HumanEval | 代码生成 |
| C-Eval | 中文综合评测 |
| CMMLU | 中文多任务评测 |
| Safety | 安全性评测 |
| Bias | 偏见评测 |
| Hallucination | 幻觉评测 |
| MT-Bench | 多轮对话评测 |
| AlpacaEval | 指令遵循评测 |

---

## [实战] 核心实战清单

1. 实现一个多指标评测系统
2. 构建基准测试框架，支持 MMLU 和 GSM8K
3. 开发安全评测模块，检测有害内容

## [避坑] 三层避坑提醒

- **核心层误区**：单一指标无法全面评估模型能力
- **重点层误区**：忽略评测数据的污染问题
- **扩展层建议**：使用开源评测框架如 lm-evaluation-harness
