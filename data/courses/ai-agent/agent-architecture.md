# Agent 架构设计 三层深度学习教程

## [总览] 技术总览

AI Agent 是能够感知环境、做出决策并执行动作的智能系统。现代 Agent 架构基于大语言模型（LLM），通过工具调用、记忆系统和规划推理实现复杂任务。核心设计模式包括 ReAct、Plan-and-Execute、Multi-Agent 等。

本教程采用三层漏斗学习法：**核心层**聚焦 Agent 基础架构、工具调用、记忆系统三大基石；**重点层**深入规划推理和多智能体协作；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Agent 基础架构

#### [概念] 概念解释

Agent 的核心是一个循环：感知 -> 思考 -> 行动 -> 观察。基于 LLM 的 Agent 使用 Prompt 引导模型进行推理和决策。ReAct（Reasoning + Acting）是最经典的架构模式。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
import json

class Agent:
    def __init__(self, name: str, system_prompt: str, tools: Dict[str, Callable]):
        self.name = name
        self.system_prompt = system_prompt
        self.tools = tools
        self.messages = [{"role": "system", "content": system_prompt}]
    
    def think(self, user_input: str) -> str:
        """思考阶段：生成下一步行动"""
        self.messages.append({"role": "user", "content": user_input})
        
        # 调用 LLM（这里用模拟实现）
        response = self._call_llm()
        return response
    
    def act(self, action: Dict[str, Any]) -> Any:
        """行动阶段：执行工具调用"""
        tool_name = action.get("tool")
        tool_args = action.get("args", {})
        
        if tool_name in self.tools:
            result = self.tools[tool_name](**tool_args)
            return result
        return f"Unknown tool: {tool_name}"
    
    def observe(self, observation: Any) -> None:
        """观察阶段：记录执行结果"""
        self.messages.append({
            "role": "assistant",
            "content": json.dumps(observation, ensure_ascii=False)
        })
    
    def run(self, user_input: str, max_iterations: int = 5) -> str:
        """主循环"""
        response = self.think(user_input)
        
        for _ in range(max_iterations):
            # 解析响应中的动作
            action = self._parse_action(response)
            
            if action.get("type") == "finish":
                return action.get("answer", response)
            
            # 执行动作
            observation = self.act(action)
            
            # 观察结果
            self.observe(observation)
            
            # 继续思考
            response = self.think(f"Observation: {observation}")
        
        return "Max iterations reached"
    
    def _call_llm(self) -> str:
        """模拟 LLM 调用"""
        return "思考中..."
    
    def _parse_action(self, response: str) -> Dict[str, Any]:
        """解析响应中的动作"""
        return {"type": "finish", "answer": response}


# ReAct Agent 示例
class ReActAgent(Agent):
    """ReAct 架构 Agent"""
    
    def __init__(self, tools: Dict[str, Callable]):
        system_prompt = """你是一个智能助手，使用 ReAct 模式解决问题。

格式：
Thought: 思考下一步
Action: 工具名称
Action Input: 工具参数

可用工具：
{tool_names}

开始！"""
        
        super().__init__("ReActAgent", system_prompt, tools)


# 使用示例
def search(query: str) -> str:
    return f"搜索结果: {query} 的相关信息..."

def calculate(expression: str) -> float:
    return eval(expression)

tools = {
    "search": search,
    "calculate": calculate
}

agent = ReActAgent(tools)
result = agent.run("帮我搜索 Python 并计算 2+2")
print(result)
```

### 2. 工具调用

#### [概念] 概念解释

工具调用是 Agent 与外部世界交互的核心机制。定义工具包括名称、描述、参数 Schema。LLM 根据用户请求选择合适的工具并生成参数。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Callable
from pydantic import BaseModel, Field
import json

class ToolSchema(BaseModel):
    """工具 Schema 定义"""
    name: str = Field(..., description="工具名称")
    description: str = Field(..., description="工具描述")
    parameters: Dict[str, Any] = Field(..., description="参数 Schema")

class ToolRegistry:
    """工具注册中心"""
    
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._schemas: Dict[str, ToolSchema] = {}
    
    def register(self, name: str, description: str, parameters: Dict[str, Any]):
        """注册工具装饰器"""
        def decorator(func: Callable) -> Callable:
            self._tools[name] = func
            self._schemas[name] = ToolSchema(
                name=name,
                description=description,
                parameters=parameters
            )
            return func
        return decorator
    
    def get_tool(self, name: str) -> Optional[Callable]:
        return self._tools.get(name)
    
    def get_schema(self, name: str) -> Optional[ToolSchema]:
        return self._schemas.get(name)
    
    def get_all_schemas(self) -> List[Dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": schema.name,
                    "description": schema.description,
                    "parameters": schema.parameters
                }
            }
            for schema in self._schemas.values()
        ]

# 创建工具注册中心
registry = ToolRegistry()

# 注册工具
@registry.register(
    name="get_weather",
    description="获取指定城市的天气信息",
    parameters={
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "温度单位"
            }
        },
        "required": ["city"]
    }
)
def get_weather(city: str, unit: str = "celsius") -> Dict[str, Any]:
    """模拟天气 API"""
    return {
        "city": city,
        "temperature": 25 if unit == "celsius" else 77,
        "condition": "sunny",
        "unit": unit
    }

@registry.register(
    name="search_web",
    description="搜索互联网获取信息",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "搜索关键词"
            },
            "num_results": {
                "type": "integer",
                "description": "返回结果数量",
                "default": 5
            }
        },
        "required": ["query"]
    }
)
def search_web(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """模拟搜索 API"""
    return [
        {"title": f"结果 {i+1}", "url": f"https://example.com/{i+1}", "snippet": f"关于 {query} 的内容..."}
        for i in range(num_results)
    ]

# 工具调用 Agent
class ToolCallingAgent:
    """支持 Function Calling 的 Agent"""
    
    def __init__(self, registry: ToolRegistry):
        self.registry = registry
        self.messages: List[Dict[str, Any]] = []
    
    def process_tool_call(self, tool_name: str, tool_args: Dict[str, Any]) -> Any:
        """处理工具调用"""
        tool = self.registry.get_tool(tool_name)
        if tool:
            return tool(**tool_args)
        raise ValueError(f"Unknown tool: {tool_name}")
    
    def run(self, user_message: str) -> str:
        """运行 Agent"""
        self.messages.append({"role": "user", "content": user_message})
        
        # 模拟 LLM 响应（实际应调用 OpenAI/Claude API）
        # 这里展示工具调用的流程
        
        # 1. 获取可用工具 Schema
        tools = self.registry.get_all_schemas()
        
        # 2. LLM 决定调用哪个工具
        # 假设 LLM 决定调用 get_weather
        tool_call = {
            "name": "get_weather",
            "arguments": '{"city": "北京"}'
        }
        
        # 3. 执行工具调用
        tool_args = json.loads(tool_call["arguments"])
        result = self.process_tool_call(tool_call["name"], tool_args)
        
        # 4. 将结果返回给 LLM 生成最终回答
        return f"北京今天天气晴朗，温度 25°C"

# 使用示例
agent = ToolCallingAgent(registry)
result = agent.run("北京今天天气怎么样？")
print(result)
```

### 3. 记忆系统

#### [概念] 概念解释

记忆系统让 Agent 能够记住历史对话和上下文。分为短期记忆（当前会话）、长期记忆（持久化存储）、工作记忆（当前任务相关）。常用向量数据库实现语义检索。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

@dataclass
class Message:
    """消息记录"""
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

class ShortTermMemory:
    """短期记忆：当前会话上下文"""
    
    def __init__(self, max_messages: int = 100):
        self.messages: List[Message] = []
        self.max_messages = max_messages
    
    def add(self, role: str, content: str, **metadata) -> None:
        """添加消息"""
        self.messages.append(Message(role=role, content=content, metadata=metadata))
        
        # 限制消息数量
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self, last_n: int = 10) -> List[Dict[str, str]]:
        """获取最近 N 条消息作为上下文"""
        return [
            {"role": msg.role, "content": msg.content}
            for msg in self.messages[-last_n:]
        ]
    
    def clear(self) -> None:
        """清空记忆"""
        self.messages.clear()

class LongTermMemory:
    """长期记忆：持久化存储"""
    
    def __init__(self):
        self.storage: Dict[str, List[Dict[str, Any]]] = {}
    
    def save(self, user_id: str, key: str, value: Any) -> None:
        """保存记忆"""
        if user_id not in self.storage:
            self.storage[user_id] = []
        
        self.storage[user_id].append({
            "key": key,
            "value": value,
            "timestamp": datetime.now().isoformat()
        })
    
    def recall(self, user_id: str, key: Optional[str] = None) -> List[Dict[str, Any]]:
        """回忆记忆"""
        if user_id not in self.storage:
            return []
        
        if key:
            return [m for m in self.storage[user_id] if m["key"] == key]
        return self.storage[user_id]

class VectorMemory:
    """向量记忆：语义检索"""
    
    def __init__(self):
        self.vectors: List[Dict[str, Any]] = []
    
    def add(self, text: str, embedding: List[float], metadata: Dict[str, Any] = None) -> None:
        """添加向量"""
        self.vectors.append({
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {}
        })
    
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """语义搜索"""
        # 简化实现：实际应使用向量数据库如 Pinecone, Milvus
        def cosine_similarity(a: List[float], b: List[float]) -> float:
            return sum(x * y for x, y in zip(a, b)) / (
                sum(x ** 2 for x in a) ** 0.5 * sum(y ** 2 for y in b) ** 0.5
            )
        
        similarities = [
            (item, cosine_similarity(query_embedding, item["embedding"]))
            for item in self.vectors
        ]
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [item for item, _ in similarities[:top_k]]

# 记忆管理器
class MemoryManager:
    """统一记忆管理"""
    
    def __init__(self):
        self.short_term = ShortTermMemory()
        self.long_term = LongTermMemory()
        self.vector_memory = VectorMemory()
    
    def remember(self, role: str, content: str, user_id: str = "default") -> None:
        """记住信息"""
        # 短期记忆
        self.short_term.add(role, content)
        
        # 长期记忆（重要信息）
        if role == "user":
            self.long_term.save(user_id, "interaction", content)
    
    def get_context_for_llm(self) -> List[Dict[str, str]]:
        """获取 LLM 上下文"""
        return self.short_term.get_context()

# 使用示例
memory = MemoryManager()

# 记住对话
memory.remember("user", "你好，我是 Alice")
memory.remember("assistant", "你好 Alice！有什么我可以帮助你的吗？")
memory.remember("user", "我想了解 Python 编程")

# 获取上下文
context = memory.get_context_for_llm()
for msg in context:
    print(f"{msg['role']}: {msg['content']}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 规划与推理

#### [概念] 概念解释

规划让 Agent 能够分解复杂任务为子任务，按顺序执行。常见模式包括 Plan-and-Execute、Tree of Thoughts（ToT）、Self-Reflection。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
import json

@dataclass
class Task:
    """任务定义"""
    id: str
    description: str
    status: str = "pending"  # pending, running, completed, failed
    result: Any = None
    dependencies: List[str] = None

class Planner:
    """任务规划器"""
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
    
    def decompose(self, goal: str) -> List[Task]:
        """分解目标为子任务"""
        # 模拟 LLM 分解任务
        subtasks = [
            Task(id="1", description="分析用户需求"),
            Task(id="2", description="搜索相关信息", dependencies=["1"]),
            Task(id="3", description="整理答案", dependencies=["2"]),
            Task(id="4", description="验证答案完整性", dependencies=["3"])
        ]
        
        for task in subtasks:
            self.tasks[task.id] = task
        
        return subtasks
    
    def get_ready_tasks(self) -> List[Task]:
        """获取可执行的任务"""
        ready = []
        for task in self.tasks.values():
            if task.status != "pending":
                continue
            
            if task.dependencies:
                deps_completed = all(
                    self.tasks[dep_id].status == "completed"
                    for dep_id in task.dependencies
                    if dep_id in self.tasks
                )
                if not deps_completed:
                    continue
            
            ready.append(task)
        return ready

class PlanAndExecuteAgent:
    """Plan-and-Execute Agent"""
    
    def __init__(self, tools: Dict[str, Callable]):
        self.tools = tools
        self.planner = Planner()
    
    def execute_task(self, task: Task) -> Any:
        """执行单个任务"""
        task.status = "running"
        
        # 简化：直接返回模拟结果
        result = f"完成: {task.description}"
        task.result = result
        task.status = "completed"
        
        return result
    
    def run(self, goal: str) -> str:
        """运行 Agent"""
        # 1. 规划阶段
        tasks = self.planner.decompose(goal)
        print(f"规划完成，共 {len(tasks)} 个任务")
        
        # 2. 执行阶段
        results = []
        while True:
            ready_tasks = self.planner.get_ready_tasks()
            if not ready_tasks:
                break
            
            for task in ready_tasks:
                print(f"执行任务: {task.description}")
                result = self.execute_task(task)
                results.append(result)
        
        # 3. 汇总结果
        return "\n".join(results)

# 使用示例
agent = PlanAndExecuteAgent(tools={})
result = agent.run("帮我写一篇关于 AI Agent 的文章")
print(result)
```

### 2. 多智能体协作

#### [概念] 概念解释

多智能体系统让多个专业 Agent 协作完成复杂任务。常见模式包括层级协作、对等协作、竞争协作。需要定义 Agent 角色、通信协议和协调机制。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass, field
from enum import Enum
import queue

class AgentRole(Enum):
    """Agent 角色"""
    COORDINATOR = "coordinator"  # 协调者
    WORKER = "worker"           # 执行者
    REVIEWER = "reviewer"       # 审核者

@dataclass
class AgentMessage:
    """Agent 间消息"""
    sender: str
    receiver: str
    content: Any
    message_type: str  # task, result, feedback

class MultiAgent:
    """多智能体系统"""
    
    def __init__(self):
        self.agents: Dict[str, 'WorkerAgent'] = {}
        self.message_queue: queue.Queue = queue.Queue()
        self.coordinator: Optional['CoordinatorAgent'] = None
    
    def add_agent(self, agent: 'WorkerAgent') -> None:
        """添加 Agent"""
        self.agents[agent.name] = agent
    
    def set_coordinator(self, coordinator: 'CoordinatorAgent') -> None:
        """设置协调者"""
        self.coordinator = coordinator
    
    def send_message(self, message: AgentMessage) -> None:
        """发送消息"""
        self.message_queue.put(message)
    
    def process_messages(self) -> None:
        """处理消息"""
        while not self.message_queue.empty():
            msg = self.message_queue.get()
            if msg.receiver in self.agents:
                self.agents[msg.receiver].receive(msg)
            elif msg.receiver == "coordinator" and self.coordinator:
                self.coordinator.receive(msg)

class WorkerAgent:
    """工作 Agent"""
    
    def __init__(self, name: str, specialty: str, system: MultiAgent):
        self.name = name
        self.specialty = specialty
        self.system = system
    
    def receive(self, message: AgentMessage) -> None:
        """接收消息"""
        if message.message_type == "task":
            result = self.execute(message.content)
            self.system.send_message(AgentMessage(
                sender=self.name,
                receiver="coordinator",
                content=result,
                message_type="result"
            ))
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """执行任务"""
        return {
            "agent": self.name,
            "task": task,
            "result": f"由 {self.specialty} 专家完成"
        }

class CoordinatorAgent:
    """协调 Agent"""
    
    def __init__(self, system: MultiAgent):
        self.system = system
        self.pending_tasks: List[Dict[str, Any]] = []
        self.completed_results: List[Dict[str, Any]] = []
    
    def assign_task(self, task: str) -> None:
        """分配任务"""
        # 根据任务类型分配给合适的 Agent
        for name, agent in self.system.agents.items():
            if agent.specialty in task.lower():
                self.system.send_message(AgentMessage(
                    sender="coordinator",
                    receiver=name,
                    content={"task": task},
                    message_type="task"
                ))
                return
    
    def receive(self, message: AgentMessage) -> None:
        """接收结果"""
        if message.message_type == "result":
            self.completed_results.append(message.content)

# 使用示例
system = MultiAgent()

# 添加专业 Agent
system.add_agent(WorkerAgent("researcher", "research", system))
system.add_agent(WorkerAgent("writer", "writing", system))
system.add_agent(WorkerAgent("reviewer", "review", system))

# 设置协调者
coordinator = CoordinatorAgent(system)
system.set_coordinator(coordinator)

# 分配任务
coordinator.assign_task("research AI trends")

# 处理消息
system.process_messages()

print("Completed tasks:", coordinator.completed_results)
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| ReAct | 推理+行动模式 |
| Chain of Thought | 思维链推理 |
| Tree of Thoughts | 思维树搜索 |
| Self-Reflection | 自我反思优化 |
| RAG | 检索增强生成 |
| Function Calling | 函数调用机制 |
| LangChain | Agent 开发框架 |
| AutoGPT | 自主 Agent |
| BabyAGI | 任务驱动 Agent |
| MetaGPT | 多 Agent 协作 |

---

## [实战] 核心实战清单

1. 实现一个支持工具调用的 ReAct Agent
2. 构建一个具有短期和长期记忆的对话 Agent
3. 设计一个多 Agent 协作系统，完成文档写作任务

## [避坑] 三层避坑提醒

- **核心层误区**：过度依赖 LLM，缺乏结构化的工具定义
- **重点层误区**：任务分解粒度不当，过粗或过细
- **扩展层建议**：优先使用成熟的 Agent 框架如 LangChain，避免重复造轮子
