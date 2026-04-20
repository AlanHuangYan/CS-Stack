# Agent 应用开发 三层深度学习教程

## [总览] 技术总览

Agent 应用开发是将 AI Agent 能力转化为实际产品的过程。涵盖需求分析、架构设计、功能实现、测试部署等环节。成功的 Agent 应用需要平衡智能性、可用性和成本。

本教程采用三层漏斗学习法：**核心层**聚焦应用架构、用户交互、任务编排三大基石；**重点层**深入多 Agent 协作和性能优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Agent 应用架构

#### [概念] 概念解释

Agent 应用架构定义系统的整体结构。核心组件：用户接口、Agent 核心、工具层、记忆层、外部服务。良好的架构支持扩展、测试和维护。

#### [代码] 代码示例

```python
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from enum import Enum
import asyncio

class AgentState(Enum):
    IDLE = "idle"
    THINKING = "thinking"
    EXECUTING = "executing"
    WAITING = "waiting"
    ERROR = "error"

@dataclass
class AgentConfig:
    """Agent 配置"""
    name: str
    description: str
    model: str = "gpt-4"
    max_tokens: int = 4096
    temperature: float = 0.7
    tools: List[str] = field(default_factory=list)

class BaseAgent(ABC):
    """Agent 基类"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.state = AgentState.IDLE
        self.memory = []
        self.tools: Dict[str, Callable] = {}
    
    @abstractmethod
    def think(self, input_text: str) -> Dict:
        """思考"""
        pass
    
    @abstractmethod
    def act(self, thought: Dict) -> Dict:
        """行动"""
        pass
    
    def execute(self, input_text: str) -> Dict:
        """执行任务"""
        self.state = AgentState.THINKING
        
        try:
            thought = self.think(input_text)
            
            self.state = AgentState.EXECUTING
            result = self.act(thought)
            
            self.state = AgentState.IDLE
            
            return {
                "success": True,
                "result": result,
                "thought": thought
            }
            
        except Exception as e:
            self.state = AgentState.ERROR
            return {
                "success": False,
                "error": str(e)
            }

class ToolRegistry:
    """工具注册表"""
    
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._metadata: Dict[str, Dict] = {}
    
    def register(
        self,
        name: str,
        func: Callable,
        description: str,
        parameters: Dict = None
    ):
        """注册工具"""
        self._tools[name] = func
        self._metadata[name] = {
            "description": description,
            "parameters": parameters or {}
        }
    
    def get(self, name: str) -> Optional[Callable]:
        """获取工具"""
        return self._tools.get(name)
    
    def get_metadata(self, name: str) -> Optional[Dict]:
        """获取工具元数据"""
        return self._metadata.get(name)
    
    def list_tools(self) -> List[str]:
        """列出所有工具"""
        return list(self._tools.keys())
    
    def get_openai_tools(self) -> List[Dict]:
        """获取 OpenAI 格式工具列表"""
        tools = []
        for name, meta in self._metadata.items():
            tools.append({
                "type": "function",
                "function": {
                    "name": name,
                    "description": meta["description"],
                    "parameters": meta["parameters"]
                }
            })
        return tools

class ConversationAgent(BaseAgent):
    """对话 Agent"""
    
    def __init__(self, config: AgentConfig, tool_registry: ToolRegistry = None):
        super().__init__(config)
        self.tool_registry = tool_registry or ToolRegistry()
        self.conversation_history = []
    
    def think(self, input_text: str) -> Dict:
        """思考"""
        self.conversation_history.append({
            "role": "user",
            "content": input_text
        })
        
        thought = {
            "input": input_text,
            "reasoning": f"Processing user input: {input_text}",
            "action": None,
            "action_input": None
        }
        
        if self._needs_tool(input_text):
            tool_name = self._determine_tool(input_text)
            thought["action"] = tool_name
            thought["action_input"] = self._extract_params(input_text, tool_name)
        
        return thought
    
    def act(self, thought: Dict) -> Dict:
        """行动"""
        if thought["action"]:
            tool = self.tool_registry.get(thought["action"])
            if tool:
                result = tool(**thought["action_input"])
                
                self.conversation_history.append({
                    "role": "assistant",
                    "content": f"Tool result: {result}"
                })
                
                return result
        
        response = f"Response to: {thought['input']}"
        
        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })
        
        return {"response": response}
    
    def _needs_tool(self, input_text: str) -> bool:
        """判断是否需要工具"""
        tool_keywords = ["search", "calculate", "fetch", "execute", "run"]
        return any(kw in input_text.lower() for kw in tool_keywords)
    
    def _determine_tool(self, input_text: str) -> str:
        """确定使用哪个工具"""
        if "search" in input_text.lower():
            return "web_search"
        elif "calculate" in input_text.lower():
            return "calculator"
        return "general_tool"
    
    def _extract_params(self, input_text: str, tool_name: str) -> Dict:
        """提取工具参数"""
        return {"query": input_text}

class AgentApplication:
    """Agent 应用"""
    
    def __init__(self, agent: BaseAgent):
        self.agent = agent
        self.middleware: List[Callable] = []
    
    def use(self, middleware: Callable):
        """添加中间件"""
        self.middleware.append(middleware)
        return self
    
    async def process(self, input_text: str) -> Dict:
        """处理输入"""
        context = {"input": input_text}
        
        for mw in self.middleware:
            context = await mw(context) if asyncio.iscoroutinefunction(mw) else mw(context)
            if context.get("stop"):
                return context.get("response", {})
        
        result = self.agent.execute(input_text)
        
        return result
    
    def run(self, input_text: str) -> Dict:
        """同步运行"""
        return asyncio.run(self.process(input_text))
```

### 2. 用户交互设计

#### [概念] 概念解释

用户交互设计定义用户与 Agent 的交互方式。模式：命令式（指令驱动）、对话式（自然语言）、混合式（结合两者）。良好的交互设计提升用户体验。

#### [代码] 代码示例

```python
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import re

class InteractionMode(Enum):
    COMMAND = "command"
    CONVERSATIONAL = "conversational"
    HYBRID = "hybrid"

@dataclass
class UserInput:
    """用户输入"""
    raw_text: str
    intent: str = None
    entities: Dict[str, Any] = None
    context: Dict[str, Any] = None

@dataclass
class AgentResponse:
    """Agent 响应"""
    text: str
    suggestions: List[str] = None
    actions: List[Dict] = None
    metadata: Dict[str, Any] = None

class InputParser:
    """输入解析器"""
    
    def __init__(self):
        self.intent_patterns = {
            "search": [r"search\s+(.+)", r"find\s+(.+)", r"look\s+for\s+(.+)"],
            "create": [r"create\s+(.+)", r"make\s+(.+)", r"new\s+(.+)"],
            "delete": [r"delete\s+(.+)", r"remove\s+(.+)", r"erase\s+(.+)"],
            "update": [r"update\s+(.+)", r"modify\s+(.+)", r"change\s+(.+)"],
            "query": [r"what\s+is\s+(.+)", r"tell\s+me\s+(.+)", r"explain\s+(.+)"]
        }
    
    def parse(self, raw_text: str) -> UserInput:
        """解析输入"""
        input_obj = UserInput(raw_text=raw_text)
        
        input_obj.intent = self._detect_intent(raw_text)
        input_obj.entities = self._extract_entities(raw_text)
        
        return input_obj
    
    def _detect_intent(self, text: str) -> str:
        """检测意图"""
        text_lower = text.lower()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent
        
        return "unknown"
    
    def _extract_entities(self, text: str) -> Dict[str, Any]:
        """提取实体"""
        entities = {}
        
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        if emails:
            entities["emails"] = emails
        
        number_pattern = r'\b\d+(?:\.\d+)?\b'
        numbers = re.findall(number_pattern, text)
        if numbers:
            entities["numbers"] = [float(n) for n in numbers]
        
        date_pattern = r'\b\d{4}-\d{2}-\d{2}\b'
        dates = re.findall(date_pattern, text)
        if dates:
            entities["dates"] = dates
        
        return entities

class ResponseFormatter:
    """响应格式化器"""
    
    def format(self, response: AgentResponse, format_type: str = "text") -> str:
        """格式化响应"""
        if format_type == "text":
            return self._format_text(response)
        elif format_type == "markdown":
            return self._format_markdown(response)
        elif format_type == "json":
            return self._format_json(response)
        
        return response.text
    
    def _format_text(self, response: AgentResponse) -> str:
        """文本格式"""
        text = response.text
        
        if response.suggestions:
            text += "\n\nSuggestions:"
            for i, suggestion in enumerate(response.suggestions, 1):
                text += f"\n{i}. {suggestion}"
        
        return text
    
    def _format_markdown(self, response: AgentResponse) -> str:
        """Markdown 格式"""
        text = response.text
        
        if response.suggestions:
            text += "\n\n### Suggestions\n"
            for suggestion in response.suggestions:
                text += f"- {suggestion}\n"
        
        return text
    
    def _format_json(self, response: AgentResponse) -> str:
        """JSON 格式"""
        import json
        return json.dumps({
            "text": response.text,
            "suggestions": response.suggestions,
            "actions": response.actions,
            "metadata": response.metadata
        }, indent=2)

class ConversationManager:
    """对话管理器"""
    
    def __init__(self, agent: BaseAgent, mode: InteractionMode = InteractionMode.HYBRID):
        self.agent = agent
        self.mode = mode
        self.input_parser = InputParser()
        self.response_formatter = ResponseFormatter()
        self.session_context: Dict[str, Any] = {}
    
    def chat(self, user_input: str) -> str:
        """对话"""
        parsed_input = self.input_parser.parse(user_input)
        
        parsed_input.context = self.session_context.copy()
        
        result = self.agent.execute(user_input)
        
        response = AgentResponse(
            text=result.get("result", {}).get("response", "No response"),
            suggestions=self._generate_suggestions(parsed_input),
            metadata={"intent": parsed_input.intent}
        )
        
        self._update_context(parsed_input, response)
        
        return self.response_formatter.format(response, "markdown")
    
    def _generate_suggestions(self, parsed_input: UserInput) -> List[str]:
        """生成建议"""
        suggestions = []
        
        if parsed_input.intent == "search":
            suggestions.append("Would you like more details?")
            suggestions.append("Should I search for related topics?")
        elif parsed_input.intent == "create":
            suggestions.append("What properties should it have?")
            suggestions.append("Where should I save it?")
        
        return suggestions
    
    def _update_context(self, input_obj: UserInput, response: AgentResponse):
        """更新上下文"""
        if input_obj.entities:
            self.session_context["last_entities"] = input_obj.entities
        
        self.session_context["last_intent"] = input_obj.intent
        self.session_context["last_response"] = response.text

class StreamingResponse:
    """流式响应"""
    
    def __init__(self, agent: BaseAgent):
        self.agent = agent
    
    def stream(self, input_text: str) -> str:
        """流式输出"""
        result = self.agent.execute(input_text)
        
        response_text = result.get("result", {}).get("response", "")
        
        for char in response_text:
            yield char
    
    async def async_stream(self, input_text: str):
        """异步流式输出"""
        result = await asyncio.to_thread(self.agent.execute, input_text)
        
        response_text = result.get("result", {}).get("response", "")
        
        for char in response_text:
            yield char
            await asyncio.sleep(0.01)
```

### 3. 任务编排

#### [概念] 概念解释

任务编排协调多个步骤完成复杂任务。模式：顺序执行、并行执行、条件分支、循环迭代。编排引擎管理任务状态、依赖关系和错误处理。

#### [代码] 代码示例

```python
from typing import Dict, Any, List, Callable, Optional
from dataclasses import dataclass, field
from enum import Enum
import asyncio

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class Task:
    """任务"""
    id: str
    name: str
    action: Callable
    dependencies: List[str] = field(default_factory=list)
    condition: Optional[Callable] = None
    retry_count: int = 0
    max_retries: int = 3
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: Optional[str] = None

@dataclass
class WorkflowResult:
    """工作流结果"""
    success: bool
    results: Dict[str, Any]
    errors: Dict[str, str]
    execution_time: float

class TaskOrchestrator:
    """任务编排器"""
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.context: Dict[str, Any] = {}
    
    def add_task(self, task: Task):
        """添加任务"""
        self.tasks[task.id] = task
    
    def run(self, initial_context: Dict = None) -> WorkflowResult:
        """运行工作流"""
        import time
        start_time = time.time()
        
        self.context = initial_context or {}
        results = {}
        errors = {}
        
        execution_order = self._get_execution_order()
        
        for task_id in execution_order:
            task = self.tasks[task_id]
            
            if not self._check_dependencies(task):
                task.status = TaskStatus.SKIPPED
                continue
            
            if task.condition and not task.condition(self.context):
                task.status = TaskStatus.SKIPPED
                continue
            
            task.status = TaskStatus.RUNNING
            
            for attempt in range(task.max_retries + 1):
                try:
                    result = task.action(self.context)
                    task.result = result
                    task.status = TaskStatus.COMPLETED
                    results[task_id] = result
                    
                    self.context[f"{task_id}_result"] = result
                    break
                    
                except Exception as e:
                    task.error = str(e)
                    if attempt == task.max_retries:
                        task.status = TaskStatus.FAILED
                        errors[task_id] = str(e)
        
        success = all(
            t.status in [TaskStatus.COMPLETED, TaskStatus.SKIPPED]
            for t in self.tasks.values()
        )
        
        return WorkflowResult(
            success=success,
            results=results,
            errors=errors,
            execution_time=time.time() - start_time
        )
    
    async def run_async(self, initial_context: Dict = None) -> WorkflowResult:
        """异步运行"""
        import time
        start_time = time.time()
        
        self.context = initial_context or {}
        results = {}
        errors = {}
        
        levels = self._get_parallel_levels()
        
        for level in levels:
            tasks_to_run = [
                self._run_task_async(task_id)
                for task_id in level
            ]
            
            level_results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
            
            for task_id, result in zip(level, level_results):
                if isinstance(result, Exception):
                    errors[task_id] = str(result)
                    self.tasks[task_id].status = TaskStatus.FAILED
                else:
                    results[task_id] = result
        
        success = all(
            t.status in [TaskStatus.COMPLETED, TaskStatus.SKIPPED]
            for t in self.tasks.values()
        )
        
        return WorkflowResult(
            success=success,
            results=results,
            errors=errors,
            execution_time=time.time() - start_time
        )
    
    async def _run_task_async(self, task_id: str) -> Any:
        """异步运行任务"""
        task = self.tasks[task_id]
        
        if not self._check_dependencies(task):
            task.status = TaskStatus.SKIPPED
            return None
        
        task.status = TaskStatus.RUNNING
        
        try:
            result = await asyncio.to_thread(task.action, self.context)
            task.result = result
            task.status = TaskStatus.COMPLETED
            self.context[f"{task_id}_result"] = result
            return result
        except Exception as e:
            task.error = str(e)
            task.status = TaskStatus.FAILED
            raise
    
    def _get_execution_order(self) -> List[str]:
        """获取执行顺序"""
        visited = set()
        order = []
        
        def visit(task_id: str):
            if task_id in visited:
                return
            visited.add(task_id)
            
            task = self.tasks.get(task_id)
            if task:
                for dep_id in task.dependencies:
                    visit(dep_id)
            
            order.append(task_id)
        
        for task_id in self.tasks:
            visit(task_id)
        
        return order
    
    def _get_parallel_levels(self) -> List[List[str]]:
        """获取并行层级"""
        levels = []
        assigned = set()
        
        while len(assigned) < len(self.tasks):
            level = []
            
            for task_id, task in self.tasks.items():
                if task_id in assigned:
                    continue
                
                if all(dep in assigned for dep in task.dependencies):
                    level.append(task_id)
            
            if not level:
                break
            
            levels.append(level)
            assigned.update(level)
        
        return levels
    
    def _check_dependencies(self, task: Task) -> bool:
        """检查依赖"""
        for dep_id in task.dependencies:
            dep_task = self.tasks.get(dep_id)
            if not dep_task or dep_task.status != TaskStatus.COMPLETED:
                return False
        return True

class WorkflowBuilder:
    """工作流构建器"""
    
    def __init__(self):
        self.orchestrator = TaskOrchestrator()
        self.task_counter = 0
    
    def add_step(
        self,
        name: str,
        action: Callable,
        depends_on: List[str] = None,
        condition: Callable = None
    ) -> str:
        """添加步骤"""
        task_id = f"task_{self.task_counter}"
        self.task_counter += 1
        
        task = Task(
            id=task_id,
            name=name,
            action=action,
            dependencies=depends_on or [],
            condition=condition
        )
        
        self.orchestrator.add_task(task)
        
        return task_id
    
    def build(self) -> TaskOrchestrator:
        """构建编排器"""
        return self.orchestrator
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 多 Agent 协作

#### [概念] 概念解释

多 Agent 协作让多个专业 Agent 共同完成任务。模式：层级协作（主从结构）、对等协作（平等协作）、竞争协作（择优选择）。协作需定义清晰的通信协议和任务分配。

#### [代码] 代码示例

```python
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import asyncio

class AgentRole(Enum):
    COORDINATOR = "coordinator"
    WORKER = "worker"
    SPECIALIST = "specialist"
    REVIEWER = "reviewer"

@dataclass
class AgentInfo:
    """Agent 信息"""
    id: str
    name: str
    role: AgentRole
    capabilities: List[str]
    agent: BaseAgent

@dataclass
class TaskAssignment:
    """任务分配"""
    task_id: str
    agent_id: str
    priority: int = 0
    deadline: Optional[float] = None

class AgentTeam:
    """Agent 团队"""
    
    def __init__(self):
        self.agents: Dict[str, AgentInfo] = {}
        self.coordinator: Optional[str] = None
    
    def add_agent(self, agent_info: AgentInfo):
        """添加 Agent"""
        self.agents[agent_info.id] = agent_info
        
        if agent_info.role == AgentRole.COORDINATOR:
            self.coordinator = agent_info.id
    
    def assign_task(self, task: Dict) -> TaskAssignment:
        """分配任务"""
        required_capability = task.get("required_capability")
        
        candidates = [
            agent for agent in self.agents.values()
            if required_capability in agent.capabilities
        ]
        
        if not candidates:
            return None
        
        selected = min(candidates, key=lambda a: len(a.capabilities))
        
        return TaskAssignment(
            task_id=task.get("id"),
            agent_id=selected.id
        )
    
    async def execute_collaboratively(self, task: Dict) -> Dict:
        """协作执行"""
        if self.coordinator:
            coordinator = self.agents[self.coordinator]
            plan = coordinator.agent.execute(task.get("description", ""))
            
            subtasks = plan.get("result", {}).get("subtasks", [task])
        else:
            subtasks = [task]
        
        results = []
        
        for subtask in subtasks:
            assignment = self.assign_task(subtask)
            
            if assignment:
                agent = self.agents[assignment.agent_id]
                result = await asyncio.to_thread(
                    agent.agent.execute,
                    subtask.get("description", "")
                )
                results.append(result)
        
        return {
            "success": True,
            "results": results
        }

class MessageBus:
    """消息总线"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.message_queue: List[Dict] = []
    
    def subscribe(self, topic: str, handler: Callable):
        """订阅主题"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(handler)
    
    def publish(self, topic: str, message: Dict):
        """发布消息"""
        self.message_queue.append({
            "topic": topic,
            "message": message
        })
        
        if topic in self.subscribers:
            for handler in self.subscribers[topic]:
                handler(message)
    
    def get_messages(self, topic: str = None) -> List[Dict]:
        """获取消息"""
        if topic:
            return [
                m for m in self.message_queue
                if m["topic"] == topic
            ]
        return self.message_queue.copy()
```

### 2. 性能优化

#### [概念] 概念解释

Agent 应用性能优化提升响应速度和资源利用率。策略：缓存、并行处理、流式响应、模型量化。优化需平衡性能和质量。

#### [代码] 代码示例

```python
from typing import Dict, Any, Callable, Optional
from functools import wraps
import time
import hashlib
import json

class ResponseCache:
    """响应缓存"""
    
    def __init__(self, ttl: int = 3600, max_size: int = 1000):
        self.ttl = ttl
        self.max_size = max_size
        self.cache: Dict[str, Dict] = {}
    
    def _hash_key(self, input_text: str) -> str:
        """生成缓存键"""
        return hashlib.md5(input_text.encode()).hexdigest()
    
    def get(self, input_text: str) -> Optional[Dict]:
        """获取缓存"""
        key = self._hash_key(input_text)
        
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["result"]
            else:
                del self.cache[key]
        
        return None
    
    def set(self, input_text: str, result: Dict):
        """设置缓存"""
        if len(self.cache) >= self.max_size:
            oldest_key = min(
                self.cache.keys(),
                key=lambda k: self.cache[k]["timestamp"]
            )
            del self.cache[oldest_key]
        
        key = self._hash_key(input_text)
        self.cache[key] = {
            "result": result,
            "timestamp": time.time()
        }

def cached(cache: ResponseCache):
    """缓存装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(input_text: str, *args, **kwargs):
            cached_result = cache.get(input_text)
            if cached_result:
                return cached_result
            
            result = func(input_text, *args, **kwargs)
            
            cache.set(input_text, result)
            
            return result
        
        return wrapper
    return decorator

class PerformanceMonitor:
    """性能监控"""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
    
    def record(self, operation: str, duration: float):
        """记录指标"""
        if operation not in self.metrics:
            self.metrics[operation] = []
        self.metrics[operation].append(duration)
    
    def get_stats(self, operation: str) -> Dict:
        """获取统计"""
        if operation not in self.metrics:
            return {}
        
        values = self.metrics[operation]
        
        import statistics
        return {
            "count": len(values),
            "avg": statistics.mean(values),
            "min": min(values),
            "max": max(values),
            "p95": sorted(values)[int(len(values) * 0.95)] if len(values) > 20 else max(values)
        }

def measure_time(monitor: PerformanceMonitor, operation: str):
    """计时装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start
            monitor.record(operation, duration)
            return result
        return wrapper
    return decorator

class BatchProcessor:
    """批量处理器"""
    
    def __init__(self, agent: BaseAgent, batch_size: int = 10):
        self.agent = agent
        self.batch_size = batch_size
    
    def process_batch(self, inputs: List[str]) -> List[Dict]:
        """批量处理"""
        results = []
        
        for i in range(0, len(inputs), self.batch_size):
            batch = inputs[i:i + self.batch_size]
            
            batch_results = []
            for input_text in batch:
                result = self.agent.execute(input_text)
                batch_results.append(result)
            
            results.extend(batch_results)
        
        return results
    
    async def process_batch_async(self, inputs: List[str]) -> List[Dict]:
        """异步批量处理"""
        results = []
        
        for i in range(0, len(inputs), self.batch_size):
            batch = inputs[i:i + self.batch_size]
            
            tasks = [
                asyncio.to_thread(self.agent.execute, input_text)
                for input_text in batch
            ]
            
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
        
        return results
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| LangChain | LLM 应用开发框架 |
| AutoGPT | 自主 Agent 框架 |
| CrewAI | 多 Agent 协作框架 |
| Semantic Kernel | 微软 Agent 框架 |
| Haystack | RAG 应用框架 |
| LlamaIndex | 数据连接框架 |
| AgentOps | Agent 运维平台 |
| LangSmith | LLM 应用监控 |
| Prompt Flow | 提示流编排 |
| Flowise | 可视化 Agent 构建 |
