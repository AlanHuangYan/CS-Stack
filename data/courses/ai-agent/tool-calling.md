# 工具调用 三层深度学习教程

## [总览] 技术总览

工具调用（Function Calling/Tool Use）是 AI Agent 与外部世界交互的核心机制。通过定义工具 Schema，LLM 可以选择合适的工具并生成参数，实现搜索、计算、API 调用等功能扩展。

本教程采用三层漏斗学习法：**核心层**聚焦工具定义、Schema 设计、调用流程三大基石；**重点层**深入错误处理和工具组合；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 工具定义与 Schema

#### [概念] 概念解释

工具定义包括名称、描述、参数 Schema。Schema 遵循 JSON Schema 规范，定义参数类型、必填项、枚举值等。清晰的描述帮助 LLM 正确选择工具。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
import json

# 方式一：使用 Pydantic 定义
class WeatherParams(BaseModel):
    """天气查询参数"""
    city: str = Field(..., description="城市名称，如：北京、上海")
    unit: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="温度单位"
    )

class SearchParams(BaseModel):
    """搜索参数"""
    query: str = Field(..., description="搜索关键词")
    num_results: int = Field(default=5, ge=1, le=20, description="返回结果数量")

# 方式二：使用 JSON Schema
tools_schema = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的当前天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位，默认摄氏度"
                    }
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "在互联网上搜索信息",
            "parameters": {
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
        }
    }
]

# 工具实现
def get_weather(city: str, unit: str = "celsius") -> Dict[str, Any]:
    """模拟天气 API"""
    weather_data = {
        "北京": {"temp": 25, "condition": "晴"},
        "上海": {"temp": 28, "condition": "多云"},
        "广州": {"temp": 32, "condition": "雷阵雨"}
    }
    
    data = weather_data.get(city, {"temp": 20, "condition": "未知"})
    
    if unit == "fahrenheit":
        data["temp"] = data["temp"] * 9 / 5 + 32
    
    return {
        "city": city,
        "temperature": data["temp"],
        "condition": data["condition"],
        "unit": unit
    }

def search_web(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """模拟搜索 API"""
    return [
        {
            "title": f"{query} - 结果 {i+1}",
            "url": f"https://example.com/result/{i+1}",
            "snippet": f"关于 {query} 的详细信息..."
        }
        for i in range(num_results)
    ]

# 工具注册表
TOOLS = {
    "get_weather": get_weather,
    "search_web": search_web
}

print("工具 Schema:")
print(json.dumps(tools_schema, indent=2, ensure_ascii=False))
```

### 2. 调用流程

#### [概念] 概念解释

工具调用流程：1) 发送用户消息和工具 Schema 给 LLM；2) LLM 返回工具调用请求；3) 执行工具获取结果；4) 将结果返回给 LLM；5) LLM 生成最终回答。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
import json

class ToolCallingClient:
    """工具调用客户端"""
    
    def __init__(self, tools_schema: List[Dict], tools_impl: Dict[str, callable]):
        self.tools_schema = tools_schema
        self.tools_impl = tools_impl
        self.messages: List[Dict[str, Any]] = []
    
    def chat(self, user_message: str) -> str:
        """主对话入口"""
        self.messages.append({"role": "user", "content": user_message})
        
        while True:
            # 调用 LLM（这里模拟 OpenAI API 响应）
            response = self._call_llm()
            
            # 检查是否有工具调用
            if response.get("tool_calls"):
                # 处理所有工具调用
                tool_results = []
                for tool_call in response["tool_calls"]:
                    result = self._execute_tool(tool_call)
                    tool_results.append(result)
                
                # 将工具结果添加到消息
                self.messages.append({
                    "role": "assistant",
                    "tool_calls": response["tool_calls"]
                })
                
                for result in tool_results:
                    self.messages.append({
                        "role": "tool",
                        "tool_call_id": result["tool_call_id"],
                        "content": result["content"]
                    })
            else:
                # 没有工具调用，返回最终回答
                return response.get("content", "")
    
    def _call_llm(self) -> Dict[str, Any]:
        """模拟 LLM 调用（实际应调用 OpenAI/Claude API）"""
        # 模拟：根据用户消息决定调用哪个工具
        last_message = self.messages[-1]["content"]
        
        if "天气" in last_message:
            # 提取城市名（简化）
            city = "北京"
            if "上海" in last_message:
                city = "上海"
            elif "广州" in last_message:
                city = "广州"
            
            return {
                "content": None,
                "tool_calls": [{
                    "id": "call_1",
                    "type": "function",
                    "function": {
                        "name": "get_weather",
                        "arguments": json.dumps({"city": city})
                    }
                }]
            }
        elif "搜索" in last_message or "查找" in last_message:
            query = last_message.replace("搜索", "").replace("查找", "").strip()
            return {
                "content": None,
                "tool_calls": [{
                    "id": "call_1",
                    "type": "function",
                    "function": {
                        "name": "search_web",
                        "arguments": json.dumps({"query": query})
                    }
                }]
            }
        else:
            return {
                "content": f"我理解您的问题是：{last_message}",
                "tool_calls": None
            }
    
    def _execute_tool(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        """执行工具调用"""
        function_name = tool_call["function"]["name"]
        arguments = json.loads(tool_call["function"]["arguments"])
        
        if function_name in self.tools_impl:
            result = self.tools_impl[function_name](**arguments)
            return {
                "tool_call_id": tool_call["id"],
                "content": json.dumps(result, ensure_ascii=False)
            }
        
        return {
            "tool_call_id": tool_call["id"],
            "content": json.dumps({"error": f"Unknown tool: {function_name}"})
        }

# 使用示例
client = ToolCallingClient(tools_schema, TOOLS)

# 测试天气查询
response = client.chat("北京今天天气怎么样？")
print(f"回答: {response}")

# 测试搜索
client.messages = []  # 清空历史
response = client.chat("搜索 Python 教程")
print(f"回答: {response}")
```

### 3. OpenAI Function Calling 实战

#### [概念] 概念解释

OpenAI 的 Function Calling 是最成熟的工具调用实现。支持并行调用多个工具、自动参数验证、结构化输出。

#### [代码] 代码示例

```python
from openai import OpenAI
from typing import List, Dict, Any
import json

class OpenAIToolCaller:
    """OpenAI Function Calling 封装"""
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.tools: List[Dict] = []
        self.tool_implementations: Dict[str, callable] = {}
    
    def register_tool(self, name: str, description: str, 
                      parameters: Dict, implementation: callable):
        """注册工具"""
        self.tools.append({
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": parameters
            }
        })
        self.tool_implementations[name] = implementation
    
    def run(self, user_message: str, max_iterations: int = 5) -> str:
        """运行对话"""
        messages = [{"role": "user", "content": user_message}]
        
        for _ in range(max_iterations):
            # 调用 OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto"
            )
            
            assistant_message = response.choices[0].message
            messages.append(assistant_message.to_dict())
            
            # 检查是否需要调用工具
            if not assistant_message.tool_calls:
                return assistant_message.content or ""
            
            # 执行所有工具调用
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                
                print(f"调用工具: {function_name}({arguments})")
                
                # 执行工具
                if function_name in self.tool_implementations:
                    result = self.tool_implementations[function_name](**arguments)
                else:
                    result = {"error": f"Unknown tool: {function_name}"}
                
                # 添加工具结果
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })
        
        return "达到最大迭代次数"

# 使用示例（需要设置 OPENAI_API_KEY）
def main():
    caller = OpenAIToolCaller(api_key="your-api-key")
    
    # 注册工具
    caller.register_tool(
        name="get_current_weather",
        description="获取指定城市的当前天气",
        parameters={
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名称"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        },
        implementation=get_weather
    )
    
    # 运行
    result = caller.run("北京和上海今天的天气怎么样？")
    print(result)

# 注意：实际使用时需要安装 openai 库并设置 API Key
# pip install openai
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 错误处理与重试

#### [概念] 概念解释

工具调用可能失败：参数验证失败、工具执行异常、网络错误等。需要实现错误处理、参数修正、自动重试机制。

#### [代码] 代码示例

```python
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import json
import traceback

@dataclass
class ToolResult:
    """工具执行结果"""
    success: bool
    data: Any
    error: Optional[str] = None

class RobustToolCaller:
    """健壮的工具调用器"""
    
    def __init__(self, tools_impl: Dict[str, callable], max_retries: int = 3):
        self.tools_impl = tools_impl
        self.max_retries = max_retries
    
    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> ToolResult:
        """执行工具（带错误处理）"""
        if tool_name not in self.tools_impl:
            return ToolResult(
                success=False,
                data=None,
                error=f"Unknown tool: {tool_name}"
            )
        
        for attempt in range(self.max_retries):
            try:
                result = self.tools_impl[tool_name](**arguments)
                return ToolResult(success=True, data=result)
            
            except TypeError as e:
                # 参数错误，尝试修正
                corrected = self._try_fix_arguments(tool_name, arguments, str(e))
                if corrected:
                    arguments = corrected
                    continue
                return ToolResult(success=False, data=None, error=f"参数错误: {e}")
            
            except Exception as e:
                # 其他错误
                if attempt == self.max_retries - 1:
                    return ToolResult(
                        success=False,
                        data=None,
                        error=f"执行失败: {str(e)}\n{traceback.format_exc()}"
                    )
        
        return ToolResult(success=False, data=None, error="超过最大重试次数")
    
    def _try_fix_arguments(self, tool_name: str, arguments: Dict, error: str) -> Optional[Dict]:
        """尝试修正参数"""
        # 简单的参数修正逻辑
        corrected = arguments.copy()
        
        # 处理缺少必填参数
        if "missing" in error.lower():
            # 添加默认值
            if "unit" not in corrected:
                corrected["unit"] = "celsius"
            return corrected
        
        # 处理类型错误
        if "type" in error.lower():
            # 尝试类型转换
            for key, value in corrected.items():
                if isinstance(value, str) and value.isdigit():
                    corrected[key] = int(value)
            return corrected
        
        return None

# 参数验证器
def validate_arguments(schema: Dict, arguments: Dict) -> List[str]:
    """验证参数是否符合 Schema"""
    errors = []
    
    # 检查必填参数
    required = schema.get("required", [])
    for param in required:
        if param not in arguments:
            errors.append(f"缺少必填参数: {param}")
    
    # 检查参数类型
    properties = schema.get("properties", {})
    for param, value in arguments.items():
        if param in properties:
            expected_type = properties[param].get("type")
            if expected_type == "string" and not isinstance(value, str):
                errors.append(f"参数 {param} 应为字符串")
            elif expected_type == "integer" and not isinstance(value, int):
                errors.append(f"参数 {param} 应为整数")
            elif expected_type == "number" and not isinstance(value, (int, float)):
                errors.append(f"参数 {param} 应为数字")
    
    return errors

# 使用示例
caller = RobustToolCaller(TOOLS)

# 测试错误处理
result = caller.execute_tool("get_weather", {"city": "北京"})
print(f"成功: {result.success}, 数据: {result.data}")

result = caller.execute_tool("unknown_tool", {})
print(f"成功: {result.success}, 错误: {result.error}")
```

### 2. 工具组合与链式调用

#### [概念] 概念解释

复杂任务需要多个工具协作。可以定义组合工具、实现工具链、支持工具间数据传递。LLM 可以自动规划工具调用顺序。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
import json

@dataclass
class ToolChain:
    """工具链定义"""
    name: str
    description: str
    steps: List[Dict[str, Any]]  # [{"tool": "name", "input_mapping": {...}}]

class ToolComposer:
    """工具组合器"""
    
    def __init__(self, tools_impl: Dict[str, Callable]):
        self.tools_impl = tools_impl
        self.chains: Dict[str, ToolChain] = {}
    
    def register_chain(self, chain: ToolChain):
        """注册工具链"""
        self.chains[chain.name] = chain
    
    def execute_chain(self, chain_name: str, initial_input: Dict[str, Any]) -> Dict[str, Any]:
        """执行工具链"""
        if chain_name not in self.chains:
            return {"error": f"Unknown chain: {chain_name}"}
        
        chain = self.chains[chain_name]
        context = initial_input.copy()
        results = []
        
        for step in chain.steps:
            tool_name = step["tool"]
            input_mapping = step.get("input_mapping", {})
            
            # 映射输入
            tool_input = {}
            for target, source in input_mapping.items():
                if source.startswith("$"):
                    # 从上下文获取值
                    key = source[1:]
                    tool_input[target] = context.get(key)
                else:
                    tool_input[target] = source
            
            # 执行工具
            if tool_name in self.tools_impl:
                result = self.tools_impl[tool_name](**tool_input)
                results.append({"tool": tool_name, "result": result})
                
                # 更新上下文
                context.update(result if isinstance(result, dict) else {"result": result})
            else:
                results.append({"tool": tool_name, "error": "Unknown tool"})
        
        return {
            "chain": chain_name,
            "results": results,
            "final_context": context
        }

# 定义工具链
weather_chain = ToolChain(
    name="weather_report",
    description="生成天气报告",
    steps=[
        {
            "tool": "get_weather",
            "input_mapping": {"city": "$city"}
        },
        {
            "tool": "search_web",
            "input_mapping": {
                "query": "天气建议",
                "num_results": 3
            }
        }
    ]
)

# 使用示例
composer = ToolComposer(TOOLS)
composer.register_chain(weather_chain)

result = composer.execute_chain("weather_report", {"city": "北京"})
print(json.dumps(result, indent=2, ensure_ascii=False))
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| JSON Schema | 参数验证规范 |
| parallel calls | 并行工具调用 |
| streaming | 流式工具调用 |
| structured output | 结构化输出 |
| tool choice | 强制/禁止工具调用 |
| MCP | 模型上下文协议 |
| semantic kernel | 微软 Agent SDK |
| tool caching | 工具结果缓存 |
| rate limiting | 调用频率限制 |
| sandboxing | 工具执行沙箱 |

---

## [实战] 核心实战清单

1. 实现一个支持多种工具类型的工具注册中心
2. 构建一个带错误处理和重试机制的工具调用器
3. 设计一个工具链系统，支持复杂的任务编排

## [避坑] 三层避坑提醒

- **核心层误区**：工具描述不清晰，导致 LLM 选择错误
- **重点层误区**：忽略错误处理，单点故障导致整个流程失败
- **扩展层建议**：使用成熟的 SDK 如 LangChain Tools，减少重复开发
