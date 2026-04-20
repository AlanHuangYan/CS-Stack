# LLM 微调技术 三层深度学习教程

## [总览] 技术总览

LLM 微调（Fine-tuning）在预训练模型基础上，使用特定领域数据继续训练，使模型适应特定任务。常用方法包括全参数微调、LoRA、QLoRA、Prefix Tuning 等。

本教程采用三层漏斗学习法：**核心层**聚焦数据准备、训练流程、评估方法三大基石；**重点层**深入 LoRA 和高效微调；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数据准备

#### [概念] 概念解释

微调数据需要高质量、格式正确。常见格式：指令微调（instruction-response）、对话格式、续写格式。数据质量比数量更重要。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class TrainingExample:
    """训练样本"""
    instruction: str
    input: str = ""
    output: str = ""
    
    def to_alpaca_format(self) -> str:
        """转换为 Alpaca 格式"""
        if self.input:
            return f"""### Instruction:
{self.instruction}

### Input:
{self.input}

### Response:
{self.output}"""
        return f"""### Instruction:
{self.instruction}

### Response:
{self.output}"""

@dataclass
class ChatMessage:
    """对话消息"""
    role: str  # system, user, assistant
    content: str

@dataclass
class ChatExample:
    """对话样本"""
    messages: List[ChatMessage]
    
    def to_openai_format(self) -> List[Dict[str, str]]:
        """转换为 OpenAI 格式"""
        return [{"role": m.role, "content": m.content} for m in self.messages]

class DatasetPreparer:
    """数据集准备器"""
    
    def __init__(self):
        self.examples: List[TrainingExample] = []
    
    def add_example(self, instruction: str, output: str, input: str = "") -> None:
        """添加样本"""
        self.examples.append(TrainingExample(
            instruction=instruction,
            input=input,
            output=output
        ))
    
    def load_jsonl(self, filepath: str) -> None:
        """加载 JSONL 文件"""
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                self.add_example(
                    instruction=data.get("instruction", ""),
                    output=data.get("output", ""),
                    input=data.get("input", "")
                )
    
    def save_jsonl(self, filepath: str) -> None:
        """保存为 JSONL"""
        with open(filepath, 'w', encoding='utf-8') as f:
            for example in self.examples:
                data = {
                    "instruction": example.instruction,
                    "input": example.input,
                    "output": example.output
                }
                f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    def split(self, train_ratio: float = 0.9) -> tuple:
        """划分训练集和验证集"""
        split_idx = int(len(self.examples) * train_ratio)
        return self.examples[:split_idx], self.examples[split_idx:]
    
    def validate(self) -> Dict[str, Any]:
        """验证数据质量"""
        issues = []
        
        for i, example in enumerate(self.examples):
            if not example.instruction.strip():
                issues.append(f"样本 {i}: 指令为空")
            if not example.output.strip():
                issues.append(f"样本 {i}: 输出为空")
            if len(example.instruction) < 10:
                issues.append(f"样本 {i}: 指令过短")
        
        return {
            "total": len(self.examples),
            "issues": issues,
            "valid": len(issues) == 0
        }

# 数据增强
class DataAugmenter:
    """数据增强器"""
    
    def paraphrase(self, text: str) -> List[str]:
        """改写（模拟）"""
        # 实际应使用 LLM 或其他模型
        return [text]
    
    def expand_with_variations(self, example: TrainingExample) -> List[TrainingExample]:
        """生成变体"""
        variations = [example]
        
        # 添加不同的表述方式
        alt_instructions = [
            example.instruction,
            f"请{example.instruction}",
            f"帮我{example.instruction}"
        ]
        
        for inst in alt_instructions[1:]:
            variations.append(TrainingExample(
                instruction=inst,
                input=example.input,
                output=example.output
            ))
        
        return variations

# 使用示例
preparer = DatasetPreparer()

# 添加样本
preparer.add_example(
    instruction="解释什么是机器学习",
    output="机器学习是人工智能的一个分支，它使计算机系统能够从数据中学习并改进，而无需显式编程。"
)

preparer.add_example(
    instruction="用 Python 写一个 Hello World 程序",
    output='```python\nprint("Hello, World!")\n```'
)

# 验证数据
validation = preparer.validate()
print(f"数据验证: {validation}")

# 划分数据集
train, val = preparer.split()
print(f"训练集: {len(train)}, 验证集: {len(val)}")
```

### 2. 训练流程

#### [概念] 概念解释

训练流程包括：模型加载、数据预处理、训练配置、训练循环、模型保存。关键参数：学习率、批次大小、训练轮数、梯度累积。

#### [代码] 代码示例

```python
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
import math

@dataclass
class TrainingConfig:
    """训练配置"""
    learning_rate: float = 2e-5
    batch_size: int = 8
    num_epochs: int = 3
    warmup_ratio: float = 0.1
    weight_decay: float = 0.01
    max_grad_norm: float = 1.0
    save_steps: int = 500
    eval_steps: int = 500
    logging_steps: int = 100
    output_dir: str = "./output"
    
    def get_warmup_steps(self, total_steps: int) -> int:
        """获取预热步数"""
        return int(total_steps * self.warmup_ratio)

@dataclass
class TrainingState:
    """训练状态"""
    epoch: int = 0
    global_step: int = 0
    loss: float = 0.0
    learning_rate: float = 0.0

class SimpleTrainer:
    """简单训练器（模拟）"""
    
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.state = TrainingState()
        self.history: List[Dict[str, Any]] = []
    
    def compute_loss(self, batch: List[Any]) -> float:
        """计算损失（模拟）"""
        # 实际应调用模型前向传播
        base_loss = 2.0
        decay = math.exp(-self.state.global_step * 0.001)
        return base_loss * decay + 0.1 * random.random()
    
    def train_step(self, batch: List[Any]) -> float:
        """训练一步"""
        loss = self.compute_loss(batch)
        self.state.loss = loss
        self.state.global_step += 1
        
        # 记录
        if self.state.global_step % self.config.logging_steps == 0:
            self.history.append({
                "step": self.state.global_step,
                "loss": loss
            })
        
        return loss
    
    def train_epoch(self, dataloader: List[List[Any]]) -> Dict[str, float]:
        """训练一个 epoch"""
        total_loss = 0
        
        for batch in dataloader:
            loss = self.train_step(batch)
            total_loss += loss
        
        self.state.epoch += 1
        avg_loss = total_loss / len(dataloader)
        
        return {"epoch": self.state.epoch, "avg_loss": avg_loss}
    
    def train(self, train_data: List[Any], eval_data: List[Any] = None) -> Dict[str, Any]:
        """完整训练"""
        # 构建 dataloader
        batch_size = self.config.batch_size
        dataloader = [
            train_data[i:i+batch_size] 
            for i in range(0, len(train_data), batch_size)
        ]
        
        results = {"epochs": []}
        
        for epoch in range(self.config.num_epochs):
            epoch_result = self.train_epoch(dataloader)
            results["epochs"].append(epoch_result)
            print(f"Epoch {epoch+1}: loss = {epoch_result['avg_loss']:.4f}")
        
        return results

# 学习率调度器
class LRScheduler:
    """学习率调度器"""
    
    def __init__(self, base_lr: float, warmup_steps: int, total_steps: int):
        self.base_lr = base_lr
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
    
    def get_lr(self, step: int) -> float:
        """获取当前学习率"""
        if step < self.warmup_steps:
            # 线性预热
            return self.base_lr * step / self.warmup_steps
        else:
            # 余弦衰减
            progress = (step - self.warmup_steps) / (self.total_steps - self.warmup_steps)
            return self.base_lr * (0.5 * (1 + math.cos(math.pi * progress)))

# 使用示例
import random

config = TrainingConfig(
    learning_rate=2e-5,
    batch_size=4,
    num_epochs=3
)

trainer = SimpleTrainer(config)

# 模拟训练数据
train_data = [f"sample_{i}" for i in range(100)]
results = trainer.train(train_data)

print(f"\n训练完成，共 {len(trainer.history)} 条日志")
```

### 3. 评估方法

#### [概念] 概念解释

评估微调效果包括：损失曲线、困惑度、下游任务指标、人工评估。常用基准测试：MMLU、GSM8K、HumanEval。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
import math

@dataclass
class EvalResult:
    """评估结果"""
    metric_name: str
    score: float
    details: Dict[str, Any] = None

class ModelEvaluator:
    """模型评估器"""
    
    def __init__(self):
        self.metrics: Dict[str, Callable] = {}
    
    def register_metric(self, name: str, func: Callable) -> None:
        """注册评估指标"""
        self.metrics[name] = func
    
    def compute_perplexity(self, losses: List[float]) -> float:
        """计算困惑度"""
        avg_loss = sum(losses) / len(losses)
        return math.exp(avg_loss)
    
    def compute_accuracy(self, predictions: List[str], labels: List[str]) -> float:
        """计算准确率"""
        correct = sum(1 for p, l in zip(predictions, labels) if p == l)
        return correct / len(labels) if labels else 0
    
    def evaluate_generation(
        self,
        model_outputs: List[str],
        references: List[str]
    ) -> Dict[str, float]:
        """评估生成质量"""
        # BLEU 分数（简化）
        def bleu_score(output: str, ref: str) -> float:
            output_words = set(output.lower().split())
            ref_words = set(ref.lower().split())
            overlap = len(output_words & ref_words)
            return overlap / max(len(output_words), 1)
        
        scores = [bleu_score(o, r) for o, r in zip(model_outputs, references)]
        
        return {
            "bleu": sum(scores) / len(scores) if scores else 0,
            "exact_match": sum(1 for o, r in zip(model_outputs, references) if o == r) / len(references)
        }

class BenchmarkRunner:
    """基准测试运行器"""
    
    def __init__(self):
        self.benchmarks: Dict[str, List[Dict[str, str]]] = {}
    
    def load_benchmark(self, name: str, data: List[Dict[str, str]]) -> None:
        """加载基准测试"""
        self.benchmarks[name] = data
    
    def run_benchmark(
        self,
        name: str,
        model_fn: Callable[[str], str]
    ) -> Dict[str, float]:
        """运行基准测试"""
        if name not in self.benchmarks:
            return {}
        
        data = self.benchmarks[name]
        predictions = []
        labels = []
        
        for item in data:
            question = item.get("question", item.get("instruction", ""))
            answer = item.get("answer", item.get("output", ""))
            
            pred = model_fn(question)
            predictions.append(pred)
            labels.append(answer)
        
        # 计算指标
        evaluator = ModelEvaluator()
        return evaluator.evaluate_generation(predictions, labels)

# 使用示例
evaluator = ModelEvaluator()

# 计算困惑度
losses = [2.5, 2.3, 2.1, 1.9, 1.8]
ppl = evaluator.compute_perplexity(losses)
print(f"困惑度: {ppl:.2f}")

# 评估生成质量
outputs = ["Python 是编程语言", "机器学习是 AI 分支"]
refs = ["Python 是一种编程语言", "机器学习是人工智能的分支"]
scores = evaluator.evaluate_generation(outputs, refs)
print(f"生成质量: {scores}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. LoRA 微调

#### [概念] 概念解释

LoRA（Low-Rank Adaptation）通过低秩分解减少可训练参数。在原始权重旁添加小矩阵，只训练这些小矩阵。大幅降低显存需求，支持多任务切换。

#### [代码] 代码示例

```python
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import math

@dataclass
class LoRAConfig:
    """LoRA 配置"""
    r: int = 8  # 秩
    lora_alpha: int = 16  # 缩放因子
    lora_dropout: float = 0.1
    target_modules: List[str] = None  # 目标模块
    
    def __post_init__(self):
        if self.target_modules is None:
            self.target_modules = ["q_proj", "v_proj"]

class LoRALayer:
    """LoRA 层"""
    
    def __init__(self, in_features: int, out_features: int, config: LoRAConfig):
        self.in_features = in_features
        self.out_features = out_features
        self.r = config.r
        self.alpha = config.lora_alpha
        self.scaling = self.alpha / self.r
        
        # 初始化低秩矩阵
        # A: (r, in_features), B: (out_features, r)
        self.lora_A = self._init_weight((self.r, in_features))
        self.lora_B = self._init_weight((out_features, self.r))
    
    def _init_weight(self, shape: tuple) -> List[List[float]]:
        """初始化权重"""
        import random
        scale = 1.0 / math.sqrt(shape[1])
        return [[random.gauss(0, scale) for _ in range(shape[1])] for _ in range(shape[0])]
    
    def forward(self, x: List[float], original_output: List[float]) -> List[float]:
        """前向传播"""
        # LoRA 输出: x @ A.T @ B.T * scaling
        # 简化实现
        lora_output = [0.0] * self.out_features
        
        # 矩阵乘法（简化）
        for i in range(self.out_features):
            for j in range(self.r):
                for k in range(self.in_features):
                    lora_output[i] += x[k] * self.lora_A[j][k] * self.lora_B[i][j]
            lora_output[i] *= self.scaling
        
        # 合并原始输出
        return [o + l for o, l in zip(original_output, lora_output)]

class LoRAModel:
    """LoRA 模型包装"""
    
    def __init__(self, config: LoRAConfig):
        self.config = config
        self.lora_layers: Dict[str, LoRALayer] = {}
        self.trainable_params = 0
    
    def add_lora_layer(self, name: str, in_features: int, out_features: int) -> None:
        """添加 LoRA 层"""
        layer = LoRALayer(in_features, out_features, self.config)
        self.lora_layers[name] = layer
        self.trainable_params += in_features * self.r + out_features * self.r
    
    def get_trainable_parameters(self) -> int:
        """获取可训练参数数量"""
        return self.trainable_params
    
    def merge_weights(self) -> None:
        """合并 LoRA 权重到原始权重"""
        # 实际实现需要修改原始模型权重
        pass
    
    def save_lora_weights(self, path: str) -> None:
        """保存 LoRA 权重"""
        import json
        weights = {}
        for name, layer in self.lora_layers.items():
            weights[name] = {
                "lora_A": layer.lora_A,
                "lora_B": layer.lora_B,
                "scaling": layer.scaling
            }
        
        with open(path, 'w') as f:
            json.dump(weights, f)

# 使用示例
config = LoRAConfig(r=8, lora_alpha=16)
model = LoRAModel(config)

# 添加 LoRA 层
model.add_lora_layer("q_proj", 4096, 4096)
model.add_lora_layer("v_proj", 4096, 4096)

print(f"可训练参数: {model.get_trainable_parameters():,}")
print(f"相比全参数微调减少: {1 - model.get_trainable_parameters() / (4096 * 4096 * 2):.2%}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| Full Fine-tuning | 全参数微调 |
| LoRA | 低秩适应 |
| QLoRA | 量化 LoRA |
| Prefix Tuning | 前缀微调 |
| P-Tuning | 提示微调 |
| Adapter | 适配器微调 |
| PEFT | 参数高效微调 |
| RLHF | 人类反馈强化学习 |
| DPO | 直接偏好优化 |
| Instruction Tuning | 指令微调 |

---

## [实战] 核心实战清单

1. 准备一个高质量的指令微调数据集
2. 使用 LoRA 微调一个小型语言模型
3. 评估微调前后的模型性能差异

## [避坑] 三层避坑提醒

- **核心层误区**：数据质量差，导致模型学偏
- **重点层误区**：学习率过大，破坏预训练知识
- **扩展层建议**：使用 PEFT 库简化微调流程
