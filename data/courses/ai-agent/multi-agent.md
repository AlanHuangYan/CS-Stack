# 多智能体协作 三层深度学习教程

## [总览] 技术总览

多智能体系统（Multi-Agent System）让多个专业 Agent 协作完成复杂任务。通过角色分工、消息传递、协调机制实现高效协作。常见模式包括层级协作、对等协作、竞争协作。

本教程采用三层漏斗学习法：**核心层**聚焦角色定义、消息传递、协调机制三大基石；**重点层**深入协作模式和冲突解决；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 角色定义

#### [概念] 概念解释

每个 Agent 有明确的角色和专业领域。角色定义包括：名称、职责、能力、工具。清晰的分工避免重复工作和职责模糊。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass, field
from enum import Enum

class AgentRole(Enum):
    """Agent 角色"""
    COORDINATOR = "coordinator"   # 协调者
    RESEARCHER = "researcher"     # 研究员
    WRITER = "writer"             # 写作者
    REVIEWER = "reviewer"         # 审核者
    EXECUTOR = "executor"         # 执行者

@dataclass
class AgentProfile:
    """Agent 档案"""
    name: str
    role: AgentRole
    description: str
    skills: List[str]
    tools: List[str] = field(default_factory=list)
    
    def can_handle(self, task_type: str) -> bool:
        """判断是否能处理某类任务"""
        return task_type.lower() in [s.lower() for s in self.skills]

class Agent:
    """Agent 基类"""
    
    def __init__(self, profile: AgentProfile):
        self.profile = profile
        self.inbox: List[Dict[str, Any]] = []
        self.outbox: List[Dict[str, Any]] = []
    
    def receive(self, message: Dict[str, Any]) -> None:
        """接收消息"""
        self.inbox.append(message)
    
    def process(self) -> Optional[Dict[str, Any]]:
        """处理消息"""
        if not self.inbox:
            return None
        
        message = self.inbox.pop(0)
        task = message.get("task", "")
        
        # 模拟处理
        result = {
            "from": self.profile.name,
            "to": message.get("from", "coordinator"),
            "result": f"[{self.profile.name}] 完成: {task}",
            "status": "completed"
        }
        
        return result
    
    def send(self, receiver: str, content: Any) -> Dict[str, Any]:
        """发送消息"""
        message = {
            "from": self.profile.name,
            "to": receiver,
            "content": content,
            "timestamp": "now"
        }
        self.outbox.append(message)
        return message

# 定义专业 Agent
researcher = Agent(AgentProfile(
    name="researcher",
    role=AgentRole.RESEARCHER,
    description="负责信息搜集和研究",
    skills=["search", "analyze", "summarize"],
    tools=["search_web", "read_document"]
))

writer = Agent(AgentProfile(
    name="writer",
    role=AgentRole.WRITER,
    description="负责内容撰写",
    skills=["write", "edit", "format"],
    tools=["text_editor", "markdown"]
))

reviewer = Agent(AgentProfile(
    name="reviewer",
    role=AgentRole.REVIEWER,
    description="负责质量审核",
    skills=["review", "feedback", "approve"],
    tools=["diff_checker", "grammar_checker"]
))

print("Agent 角色定义:")
for agent in [researcher, writer, reviewer]:
    print(f"  - {agent.profile.name}: {agent.profile.description}")
    print(f"    技能: {agent.profile.skills}")
```

### 2. 消息传递

#### [概念] 概念解释

消息传递是 Agent 间通信的基础。消息包含发送者、接收者、内容、类型。支持同步和异步通信，支持广播和点对点。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import queue

class MessageType(Enum):
    """消息类型"""
    TASK = "task"           # 任务分配
    RESULT = "result"       # 结果汇报
    QUERY = "query"         # 查询请求
    RESPONSE = "response"   # 查询响应
    FEEDBACK = "feedback"   # 反馈意见
    CONTROL = "control"     # 控制指令

@dataclass
class AgentMessage:
    """Agent 消息"""
    id: str
    sender: str
    receiver: str  # "broadcast" 表示广播
    type: MessageType
    content: Any
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

class MessageBus:
    """消息总线"""
    
    def __init__(self):
        self.queues: Dict[str, queue.Queue] = {}
        self.history: List[AgentMessage] = []
    
    def register(self, agent_name: str) -> None:
        """注册 Agent"""
        if agent_name not in self.queues:
            self.queues[agent_name] = queue.Queue()
    
    def send(self, message: AgentMessage) -> bool:
        """发送消息"""
        self.history.append(message)
        
        if message.receiver == "broadcast":
            # 广播给所有 Agent
            for name, q in self.queues.items():
                if name != message.sender:
                    q.put(message)
            return True
        
        elif message.receiver in self.queues:
            self.queues[message.receiver].put(message)
            return True
        
        return False
    
    def receive(self, agent_name: str, timeout: float = None) -> Optional[AgentMessage]:
        """接收消息"""
        if agent_name not in self.queues:
            return None
        
        try:
            return self.queues[agent_name].get(timeout=timeout)
        except queue.Empty:
            return None
    
    def get_history(self, agent_name: str = None) -> List[AgentMessage]:
        """获取消息历史"""
        if agent_name:
            return [m for m in self.history 
                    if m.sender == agent_name or m.receiver == agent_name]
        return self.history

# 使用示例
bus = MessageBus()
bus.register("researcher")
bus.register("writer")
bus.register("reviewer")

# 发送任务
bus.send(AgentMessage(
    id="msg_1",
    sender="coordinator",
    receiver="researcher",
    type=MessageType.TASK,
    content={"task": "研究 AI Agent 架构"}
))

# 接收消息
msg = bus.receive("researcher")
if msg:
    print(f"researcher 收到: {msg.content}")

# 广播消息
bus.send(AgentMessage(
    id="msg_2",
    sender="coordinator",
    receiver="broadcast",
    type=MessageType.CONTROL,
    content={"command": "pause"}
))
```

### 3. 协调机制

#### [概念] 概念解释

协调机制管理 Agent 间的协作流程。包括任务分配、进度跟踪、冲突解决。协调者（Coordinator）负责全局调度和资源分配。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
import uuid

class TaskPriority(Enum):
    """任务优先级"""
    HIGH = 1
    MEDIUM = 2
    LOW = 3

@dataclass
class Task:
    """任务"""
    id: str
    description: str
    assigned_to: Optional[str] = None
    status: str = "pending"
    priority: TaskPriority = TaskPriority.MEDIUM
    dependencies: List[str] = field(default_factory=list)
    result: Any = None

class Coordinator:
    """协调者"""
    
    def __init__(self, message_bus: MessageBus):
        self.bus = message_bus
        self.bus.register("coordinator")
        self.agents: Dict[str, AgentProfile] = {}
        self.tasks: Dict[str, Task] = {}
        self.task_queue: List[Task] = []
    
    def register_agent(self, profile: AgentProfile) -> None:
        """注册 Agent"""
        self.agents[profile.name] = profile
        self.bus.register(profile.name)
    
    def create_task(self, description: str, priority: TaskPriority = TaskPriority.MEDIUM) -> Task:
        """创建任务"""
        task = Task(
            id=str(uuid.uuid4())[:8],
            description=description,
            priority=priority
        )
        self.tasks[task.id] = task
        self.task_queue.append(task)
        return task
    
    def assign_task(self, task: Task) -> bool:
        """分配任务"""
        # 找到最合适的 Agent
        best_agent = None
        best_score = 0
        
        for name, profile in self.agents.items():
            if profile.can_handle(task.description):
                # 简单评分
                score = len([s for s in profile.skills if s in task.description.lower()])
                if score > best_score:
                    best_score = score
                    best_agent = name
        
        if best_agent:
            task.assigned_to = best_agent
            task.status = "assigned"
            
            # 发送任务消息
            self.bus.send(AgentMessage(
                id=str(uuid.uuid4())[:8],
                sender="coordinator",
                receiver=best_agent,
                type=MessageType.TASK,
                content={"task_id": task.id, "description": task.description}
            ))
            return True
        
        return False
    
    def check_progress(self) -> Dict[str, Any]:
        """检查进度"""
        status_counts = {}
        for task in self.tasks.values():
            status_counts[task.status] = status_counts.get(task.status, 0) + 1
        
        return {
            "total": len(self.tasks),
            "by_status": status_counts,
            "pending_tasks": [t.id for t in self.task_queue if t.status == "pending"]
        }
    
    def process_results(self) -> List[Dict[str, Any]]:
        """处理结果"""
        results = []
        
        while True:
            msg = self.bus.receive("coordinator", timeout=0.1)
            if not msg:
                break
            
            if msg.type == MessageType.RESULT:
                task_id = msg.content.get("task_id")
                if task_id in self.tasks:
                    self.tasks[task_id].result = msg.content.get("result")
                    self.tasks[task_id].status = "completed"
                    results.append({
                        "task_id": task_id,
                        "agent": msg.sender,
                        "result": msg.content.get("result")
                    })
        
        return results
    
    def run_workflow(self, goal: str) -> Dict[str, Any]:
        """运行工作流"""
        # 1. 分解任务
        tasks = [
            self.create_task(f"研究 {goal} 相关资料"),
            self.create_task(f"撰写 {goal} 内容"),
            self.create_task(f"审核 {goal} 质量")
        ]
        
        # 2. 分配任务
        for task in tasks:
            self.assign_task(task)
        
        # 3. 等待结果
        import time
        time.sleep(0.5)  # 模拟等待
        
        # 4. 收集结果
        results = self.process_results()
        
        return {
            "goal": goal,
            "tasks_created": len(tasks),
            "tasks_completed": len(results),
            "results": results
        }

# 使用示例
coordinator = Coordinator(bus)
coordinator.register_agent(researcher.profile)
coordinator.register_agent(writer.profile)
coordinator.register_agent(reviewer.profile)

result = coordinator.run_workflow("AI Agent 教程")
print(f"工作流结果: {result}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 协作模式

#### [概念] 概念解释

常见协作模式：层级协作（树状结构）、对等协作（网状结构）、流水线协作（顺序执行）、竞争协作（多方案择优）。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
from dataclasses import dataclass

class CollaborationPattern(ABC):
    """协作模式基类"""
    
    @abstractmethod
    def execute(self, agents: List[Agent], task: str) -> Dict[str, Any]:
        pass

class HierarchicalPattern(CollaborationPattern):
    """层级协作模式"""
    
    def execute(self, agents: List[Agent], task: str) -> Dict[str, Any]:
        """层级执行：协调者 -> 执行者 -> 审核者"""
        results = []
        
        # 找到各角色
        coordinator = next((a for a in agents if a.profile.role == AgentRole.COORDINATOR), None)
        workers = [a for a in agents if a.profile.role in [AgentRole.RESEARCHER, AgentRole.WRITER]]
        reviewers = [a for a in agents if a.profile.role == AgentRole.REVIEWER]
        
        # 协调者分配任务
        if coordinator:
            results.append({"phase": "coordinate", "agent": coordinator.profile.name})
        
        # 执行者处理
        for worker in workers:
            results.append({"phase": "execute", "agent": worker.profile.name})
        
        # 审核者检查
        for reviewer in reviewers:
            results.append({"phase": "review", "agent": reviewer.profile.name})
        
        return {"pattern": "hierarchical", "results": results}

class PipelinePattern(CollaborationPattern):
    """流水线协作模式"""
    
    def execute(self, agents: List[Agent], task: str) -> Dict[str, Any]:
        """流水线执行：按顺序传递"""
        pipeline = [
            AgentRole.RESEARCHER,
            AgentRole.WRITER,
            AgentRole.REVIEWER
        ]
        
        results = []
        current_output = task
        
        for role in pipeline:
            agent = next((a for a in agents if a.profile.role == role), None)
            if agent:
                # 模拟处理
                current_output = f"[{agent.profile.name}] 处理: {current_output}"
                results.append({
                    "role": role.value,
                    "agent": agent.profile.name,
                    "output": current_output
                })
        
        return {"pattern": "pipeline", "results": results}

class CompetitivePattern(CollaborationPattern):
    """竞争协作模式"""
    
    def __init__(self, judge_role: AgentRole = AgentRole.REVIEWER):
        self.judge_role = judge_role
    
    def execute(self, agents: List[Agent], task: str) -> Dict[str, Any]:
        """竞争执行：多方案择优"""
        # 多个执行者并行工作
        workers = [a for a in agents if a.profile.role in [AgentRole.WRITER, AgentRole.RESEARCHER]]
        
        proposals = []
        for worker in workers:
            proposals.append({
                "agent": worker.profile.name,
                "proposal": f"[{worker.profile.name}] 方案"
            })
        
        # 审核者选择最佳方案
        judge = next((a for a in agents if a.profile.role == self.judge_role), None)
        
        if judge and proposals:
            # 模拟评分
            best = max(proposals, key=lambda p: len(p["proposal"]))
            return {
                "pattern": "competitive",
                "proposals": proposals,
                "winner": best
            }
        
        return {"pattern": "competitive", "proposals": proposals}

# 使用示例
agents = [researcher, writer, reviewer]

patterns = {
    "hierarchical": HierarchicalPattern(),
    "pipeline": PipelinePattern(),
    "competitive": CompetitivePattern()
}

for name, pattern in patterns.items():
    result = pattern.execute(agents, "写一篇 AI 教程")
    print(f"\n{name} 模式:")
    print(f"  {result}")
```

### 2. 冲突解决

#### [概念] 概念解释

多 Agent 协作可能出现冲突：资源竞争、意见分歧、优先级冲突。解决策略包括：投票机制、权重决策、协调者裁决。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from collections import Counter

@dataclass
class Conflict:
    """冲突定义"""
    id: str
    type: str  # resource, opinion, priority
    parties: List[str]
    description: str
    proposals: List[Dict[str, Any]]

class ConflictResolver:
    """冲突解决器"""
    
    def __init__(self):
        self.resolution_history: List[Dict[str, Any]] = []
    
    def resolve_by_voting(self, conflict: Conflict) -> Dict[str, Any]:
        """投票解决"""
        votes = Counter()
        
        for proposal in conflict.proposals:
            option = proposal.get("option")
            votes[option] += 1
        
        winner = votes.most_common(1)[0][0]
        
        return {
            "method": "voting",
            "conflict_id": conflict.id,
            "winner": winner,
            "votes": dict(votes)
        }
    
    def resolve_by_weight(self, conflict: Conflict, weights: Dict[str, float]) -> Dict[str, Any]:
        """权重决策"""
        scores = {}
        
        for proposal in conflict.proposals:
            option = proposal.get("option")
            proposer = proposal.get("proposer")
            weight = weights.get(proposer, 1.0)
            scores[option] = scores.get(option, 0) + weight
        
        winner = max(scores, key=scores.get)
        
        return {
            "method": "weighted",
            "conflict_id": conflict.id,
            "winner": winner,
            "scores": scores
        }
    
    def resolve_by_coordinator(self, conflict: Conflict, coordinator_decision: str) -> Dict[str, Any]:
        """协调者裁决"""
        return {
            "method": "coordinator",
            "conflict_id": conflict.id,
            "decision": coordinator_decision
        }

# 使用示例
resolver = ConflictResolver()

conflict = Conflict(
    id="conflict_1",
    type="opinion",
    parties=["writer", "reviewer"],
    description="关于文章风格的选择",
    proposals=[
        {"option": "技术风格", "proposer": "writer"},
        {"option": "通俗风格", "proposer": "reviewer"},
        {"option": "技术风格", "proposer": "researcher"}
    ]
)

# 投票解决
result = resolver.resolve_by_voting(conflict)
print(f"投票结果: {result}")

# 权重决策
weights = {"writer": 1.0, "reviewer": 1.5, "researcher": 0.8}
result = resolver.resolve_by_weight(conflict, weights)
print(f"权重决策: {result}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| AutoGen | 微软多 Agent 框架 |
| CrewAI | 多 Agent 协作框架 |
| MetaGPT | 多角色协作框架 |
| LangGraph | 状态图协作 |
| Swarm | OpenAI Agent 框架 |
| hierarchical | 层级协作 |
| mesh | 网状协作 |
| blackboard | 黑板模式 |
| contract net | 合同网协议 |
| auction | 拍卖机制 |

---

## [实战] 核心实战清单

1. 实现一个支持多角色的 Agent 系统
2. 构建消息总线实现 Agent 间通信
3. 设计一个多 Agent 协作的文档写作系统

## [避坑] 三层避坑提醒

- **核心层误区**：角色定义不清晰，导致职责重叠或遗漏
- **重点层误区**：协作模式选择不当，效率低下
- **扩展层建议**：使用成熟框架如 AutoGen 或 CrewAI，简化多 Agent 开发
