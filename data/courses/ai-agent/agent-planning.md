# Agent 规划与推理 三层深度学习教程

## [总览] 技术总览

规划与推理是 AI Agent 解决复杂任务的核心能力。规划将目标分解为子任务，推理选择最优行动路径。常用方法包括 Plan-and-Execute、Tree of Thoughts、Self-Reflection、ReWOO 等。

本教程采用三层漏斗学习法：**核心层**聚焦任务分解、执行规划、结果验证三大基石；**重点层**深入思维树和自我反思；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 任务分解

#### [概念] 概念解释

任务分解将复杂目标拆分为可执行的子任务。分解原则：原子性（每个子任务独立完成）、顺序性（明确依赖关系）、可验证性（可判断完成状态）。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Task:
    """任务定义"""
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    dependencies: List[str] = field(default_factory=list)
    result: Any = None
    subtasks: List['Task'] = field(default_factory=list)

class TaskPlanner:
    """任务规划器"""
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
    
    def decompose(self, goal: str) -> Task:
        """分解目标为任务树"""
        # 模拟 LLM 分解（实际应调用 LLM）
        root = Task(id="root", description=goal)
        
        # 根据目标类型分解
        if "写" in goal or "文章" in goal:
            root.subtasks = [
                Task(id="research", description="研究主题相关资料"),
                Task(id="outline", description="制定文章大纲", dependencies=["research"]),
                Task(id="write", description="撰写文章内容", dependencies=["outline"]),
                Task(id="review", description="审核修改文章", dependencies=["write"])
            ]
        elif "分析" in goal or "报告" in goal:
            root.subtasks = [
                Task(id="collect", description="收集数据"),
                Task(id="process", description="处理数据", dependencies=["collect"]),
                Task(id="analyze", description="分析数据", dependencies=["process"]),
                Task(id="report", description="生成报告", dependencies=["analyze"])
            ]
        else:
            root.subtasks = [
                Task(id="understand", description="理解需求"),
                Task(id="plan", description="制定计划", dependencies=["understand"]),
                Task(id="execute", description="执行任务", dependencies=["plan"]),
                Task(id="verify", description="验证结果", dependencies=["execute"])
            ]
        
        # 注册所有任务
        self._register_tasks(root)
        return root
    
    def _register_tasks(self, task: Task) -> None:
        """注册任务到字典"""
        self.tasks[task.id] = task
        for subtask in task.subtasks:
            self._register_tasks(subtask)
    
    def get_ready_tasks(self) -> List[Task]:
        """获取可执行的任务"""
        ready = []
        for task in self.tasks.values():
            if task.status != TaskStatus.PENDING:
                continue
            
            # 检查依赖是否完成
            deps_completed = all(
                self.tasks.get(dep_id, Task(id="", description="")).status == TaskStatus.COMPLETED
                for dep_id in task.dependencies
            )
            
            if deps_completed:
                ready.append(task)
        
        return ready
    
    def get_execution_order(self) -> List[List[Task]]:
        """获取执行顺序（拓扑排序）"""
        order = []
        remaining = set(self.tasks.keys())
        
        while remaining:
            # 找出当前可执行的任务
            batch = []
            for task_id in list(remaining):
                task = self.tasks[task_id]
                if all(d not in remaining for d in task.dependencies):
                    batch.append(task)
            
            if not batch:
                break  # 存在循环依赖
            
            order.append(batch)
            for task in batch:
                remaining.remove(task.id)
        
        return order

# 使用示例
planner = TaskPlanner()
root = planner.decompose("写一篇关于 AI Agent 的技术文章")

print("任务分解结果:")
for subtask in root.subtasks:
    deps = f" (依赖: {', '.join(subtask.dependencies)})" if subtask.dependencies else ""
    print(f"  - {subtask.id}: {subtask.description}{deps}")

print("\n执行顺序:")
for i, batch in enumerate(planner.get_execution_order(), 1):
    print(f"  第 {i} 批: {[t.id for t in batch]}")
```

### 2. 执行规划

#### [概念] 概念解释

执行规划确定任务执行顺序、资源分配和错误处理。支持顺序执行、并行执行、条件分支。Plan-and-Execute 是经典模式：先规划，再执行。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class ExecutionResult:
    """执行结果"""
    task_id: str
    success: bool
    output: Any
    error: Optional[str] = None

class PlanAndExecute:
    """Plan-and-Execute Agent"""
    
    def __init__(self, tools: Dict[str, Callable]):
        self.tools = tools
        self.planner = TaskPlanner()
        self.results: Dict[str, ExecutionResult] = {}
    
    async def execute_task(self, task: Task) -> ExecutionResult:
        """执行单个任务"""
        task.status = TaskStatus.RUNNING
        
        try:
            # 模拟任务执行
            await asyncio.sleep(0.1)  # 模拟耗时
            
            # 根据任务类型选择工具
            output = f"完成: {task.description}"
            
            task.status = TaskStatus.COMPLETED
            return ExecutionResult(task_id=task.id, success=True, output=output)
        
        except Exception as e:
            task.status = TaskStatus.FAILED
            return ExecutionResult(task_id=task.id, success=False, output=None, error=str(e))
    
    async def run(self, goal: str) -> Dict[str, Any]:
        """运行 Agent"""
        # 1. 规划阶段
        root_task = self.planner.decompose(goal)
        print(f"[规划] 分解为 {len(root_task.subtasks)} 个子任务")
        
        # 2. 执行阶段
        execution_order = self.planner.get_execution_order()
        
        for batch_num, batch in enumerate(execution_order, 1):
            print(f"\n[执行] 第 {batch_num} 批任务: {[t.id for t in batch]}")
            
            # 并行执行同一批次的任务
            tasks = [self.execute_task(t) for t in batch]
            results = await asyncio.gather(*tasks)
            
            for result in results:
                self.results[result.task_id] = result
                status = "成功" if result.success else f"失败: {result.error}"
                print(f"  - {result.task_id}: {status}")
        
        # 3. 汇总结果
        return {
            "goal": goal,
            "total_tasks": len(self.results),
            "successful": sum(1 for r in self.results.values() if r.success),
            "results": {k: v.output for k, v in self.results.items() if v.success}
        }

# 带重试的执行器
class RobustExecutor(PlanAndExecute):
    """健壮的执行器"""
    
    def __init__(self, tools: Dict[str, Callable], max_retries: int = 3):
        super().__init__(tools)
        self.max_retries = max_retries
    
    async def execute_task(self, task: Task) -> ExecutionResult:
        """带重试的任务执行"""
        for attempt in range(self.max_retries):
            result = await super().execute_task(task)
            
            if result.success:
                return result
            
            print(f"  - {task.id} 失败，重试 {attempt + 1}/{self.max_retries}")
            await asyncio.sleep(0.5)  # 重试间隔
        
        return ExecutionResult(
            task_id=task.id,
            success=False,
            output=None,
            error=f"超过最大重试次数 {self.max_retries}"
        )

# 使用示例
async def main():
    executor = RobustExecutor(tools={})
    result = await executor.run("写一篇关于 AI Agent 的技术文章")
    print(f"\n最终结果: {result}")

# asyncio.run(main())
```

### 3. 结果验证

#### [概念] 概念解释

结果验证确保任务输出符合预期。包括格式验证、内容验证、目标达成验证。验证失败时可触发重新规划或修正。

#### [代码] 代码示例

```python
from typing import Any, Callable, List, Dict
from dataclasses import dataclass

@dataclass
class ValidationResult:
    """验证结果"""
    passed: bool
    issues: List[str]
    suggestions: List[str]

class ResultValidator:
    """结果验证器"""
    
    def __init__(self):
        self.validators: Dict[str, Callable] = {}
    
    def register(self, name: str, validator: Callable) -> None:
        """注册验证器"""
        self.validators[name] = validator
    
    def validate(self, result: Any, criteria: Dict[str, Any]) -> ValidationResult:
        """验证结果"""
        issues = []
        suggestions = []
        
        # 格式验证
        if "format" in criteria:
            fmt = criteria["format"]
            if fmt == "string" and not isinstance(result, str):
                issues.append(f"期望字符串，实际为 {type(result).__name__}")
            elif fmt == "list" and not isinstance(result, list):
                issues.append(f"期望列表，实际为 {type(result).__name__}")
            elif fmt == "dict" and not isinstance(result, dict):
                issues.append(f"期望字典，实际为 {type(result).__name__}")
        
        # 长度验证
        if "min_length" in criteria:
            if len(str(result)) < criteria["min_length"]:
                issues.append(f"长度不足，期望至少 {criteria['min_length']}")
                suggestions.append("增加内容长度")
        
        # 关键词验证
        if "keywords" in criteria:
            missing = [kw for kw in criteria["keywords"] if kw not in str(result)]
            if missing:
                issues.append(f"缺少关键词: {missing}")
                suggestions.append(f"添加关键词: {missing}")
        
        # 自定义验证器
        if "validator" in criteria and criteria["validator"] in self.validators:
            custom_result = self.validators[criteria["validator"]](result)
            issues.extend(custom_result.get("issues", []))
            suggestions.extend(custom_result.get("suggestions", []))
        
        return ValidationResult(
            passed=len(issues) == 0,
            issues=issues,
            suggestions=suggestions
        )

# 带验证的执行器
class ValidatedExecutor(PlanAndExecute):
    """带验证的执行器"""
    
    def __init__(self, tools: Dict[str, Callable]):
        super().__init__(tools)
        self.validator = ResultValidator()
    
    async def execute_with_validation(
        self, 
        task: Task, 
        criteria: Dict[str, Any]
    ) -> ExecutionResult:
        """带验证的执行"""
        result = await self.execute_task(task)
        
        if result.success:
            validation = self.validator.validate(result.output, criteria)
            
            if not validation.passed:
                result.success = False
                result.error = f"验证失败: {validation.issues}"
                print(f"  - {task.id} 验证失败")
                for suggestion in validation.suggestions:
                    print(f"    建议: {suggestion}")
        
        return result

# 使用示例
validator = ResultValidator()

# 注册自定义验证器
def validate_article(content: str) -> Dict[str, List[str]]:
    issues = []
    suggestions = []
    
    if "引言" not in content:
        issues.append("缺少引言部分")
        suggestions.append("添加引言")
    
    if len(content) < 500:
        issues.append("文章太短")
        suggestions.append("扩展内容")
    
    return {"issues": issues, "suggestions": suggestions}

validator.register("article", validate_article)

# 验证示例
result = "这是一篇关于 AI 的文章..."
validation = validator.validate(result, {
    "format": "string",
    "min_length": 100,
    "keywords": ["AI", "技术"],
    "validator": "article"
})

print(f"验证通过: {validation.passed}")
if validation.issues:
    print(f"问题: {validation.issues}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Tree of Thoughts (ToT)

#### [概念] 概念解释

思维树（ToT）将推理过程展开为搜索树，每个节点代表一个思考状态。通过广度优先或深度优先搜索找到最优解，支持回溯和剪枝。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
import heapq

@dataclass
class ThoughtNode:
    """思维节点"""
    id: str
    thought: str
    score: float = 0.0
    parent: Optional['ThoughtNode'] = None
    children: List['ThoughtNode'] = field(default_factory=list)
    is_solution: bool = False

class TreeOfThoughts:
    """思维树推理"""
    
    def __init__(self, max_depth: int = 5, beam_width: int = 3):
        self.max_depth = max_depth
        self.beam_width = beam_width
        self.root: Optional[ThoughtNode] = None
    
    def generate_thoughts(self, current_thought: str, n: int = 3) -> List[str]:
        """生成下一步思考（模拟 LLM）"""
        # 实际应调用 LLM 生成
        templates = [
            f"分析 {current_thought} 的关键因素",
            f"考虑 {current_thought} 的替代方案",
            f"评估 {current_thought} 的可行性",
            f"分解 {current_thought} 为子问题",
            f"寻找 {current_thought} 的相关资源"
        ]
        return templates[:n]
    
    def evaluate_thought(self, thought: str) -> float:
        """评估思考质量（模拟 LLM）"""
        # 实际应调用 LLM 评分
        score = 0.5
        
        # 简单规则评分
        if "分析" in thought:
            score += 0.2
        if "评估" in thought:
            score += 0.15
        if "分解" in thought:
            score += 0.1
        
        return min(1.0, score)
    
    def search(self, problem: str) -> Optional[ThoughtNode]:
        """搜索最优解"""
        self.root = ThoughtNode(id="0", thought=problem)
        
        # Beam Search
        current_beam = [self.root]
        
        for depth in range(self.max_depth):
            next_beam = []
            
            for node in current_beam:
                # 生成子节点
                thoughts = self.generate_thoughts(node.thought)
                
                for i, thought in enumerate(thoughts):
                    child = ThoughtNode(
                        id=f"{node.id}_{i}",
                        thought=thought,
                        parent=node,
                        score=self.evaluate_thought(thought)
                    )
                    node.children.append(child)
                    next_beam.append(child)
            
            # 保留 top-k
            next_beam.sort(key=lambda x: x.score, reverse=True)
            current_beam = next_beam[:self.beam_width]
            
            # 检查是否找到解
            for node in current_beam:
                if node.score > 0.9:
                    node.is_solution = True
                    return node
        
        # 返回最高分节点
        return current_beam[0] if current_beam else None
    
    def get_path(self, node: ThoughtNode) -> List[str]:
        """获取从根到节点的路径"""
        path = []
        current = node
        while current:
            path.append(current.thought)
            current = current.parent
        return list(reversed(path))

# 使用示例
tot = TreeOfThoughts(max_depth=4, beam_width=3)
solution = tot.search("如何提高 AI Agent 的推理能力？")

if solution:
    print("找到解决方案:")
    for i, thought in enumerate(tot.get_path(solution)):
        print(f"  {i+1}. {thought}")
```

### 2. Self-Reflection

#### [概念] 概念解释

自我反思让 Agent 评估自己的输出，发现不足并改进。包括：输出评估、错误识别、改进建议、重新生成。形成"生成-评估-改进"的迭代循环。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class Reflection:
    """反思结果"""
    score: float
    issues: List[str]
    suggestions: List[str]
    should_retry: bool

class SelfReflectingAgent:
    """自我反思 Agent"""
    
    def __init__(self, max_iterations: int = 3, threshold: float = 0.8):
        self.max_iterations = max_iterations
        self.threshold = threshold
        self.history: List[Dict[str, Any]] = []
    
    def generate(self, prompt: str) -> str:
        """生成回答（模拟 LLM）"""
        return f"关于 {prompt} 的回答..."
    
    def reflect(self, prompt: str, response: str) -> Reflection:
        """反思回答质量"""
        # 模拟 LLM 反思
        issues = []
        suggestions = []
        
        # 简单规则检查
        if len(response) < 50:
            issues.append("回答太短")
            suggestions.append("提供更详细的解释")
        
        if "..." in response:
            issues.append("回答不完整")
            suggestions.append("补充完整内容")
        
        # 计算分数
        score = 1.0 - len(issues) * 0.2
        
        return Reflection(
            score=score,
            issues=issues,
            suggestions=suggestions,
            should_retry=score < self.threshold
        )
    
    def improve(self, prompt: str, response: str, reflection: Reflection) -> str:
        """根据反思改进回答"""
        improvements = []
        
        for suggestion in reflection.suggestions:
            improvements.append(f"[改进: {suggestion}]")
        
        return f"{response}\n\n补充说明: {'; '.join(improvements)}"
    
    def run(self, prompt: str) -> str:
        """运行带反思的生成"""
        response = self.generate(prompt)
        
        for i in range(self.max_iterations):
            reflection = self.reflect(prompt, response)
            
            self.history.append({
                "iteration": i + 1,
                "response": response,
                "reflection": {
                    "score": reflection.score,
                    "issues": reflection.issues
                }
            })
            
            print(f"迭代 {i+1}: 分数 {reflection.score:.2f}")
            
            if not reflection.should_retry:
                print("  - 达到质量标准")
                break
            
            print(f"  - 问题: {reflection.issues}")
            print(f"  - 改进中...")
            
            response = self.improve(prompt, response, reflection)
        
        return response

# 使用示例
agent = SelfReflectingAgent(max_iterations=3, threshold=0.8)
result = agent.run("解释什么是机器学习")
print(f"\n最终回答:\n{result}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| Plan-and-Execute | 先规划后执行 |
| Tree of Thoughts | 思维树搜索 |
| Self-Reflection | 自我反思优化 |
| ReWOO | 无观察推理 |
| LATS | 语言 Agent 树搜索 |
| Reflexion | 反思强化学习 |
| Reasoning without Observation | 无观察推理 |
| Multi-Plan | 多路径规划 |
| Backtracking | 回溯搜索 |
| Monte Carlo Tree Search | 蒙特卡洛树搜索 |

---

## [实战] 核心实战清单

1. 实现一个支持依赖管理的任务规划器
2. 构建 Tree of Thoughts 推理系统
3. 设计一个带自我反思的迭代生成器

## [避坑] 三层避坑提醒

- **核心层误区**：任务分解粒度过细，增加执行开销
- **重点层误区**：思维树搜索空间过大，效率低下
- **扩展层建议**：使用成熟的规划框架如 LangGraph，简化开发
