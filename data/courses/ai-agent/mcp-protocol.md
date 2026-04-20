# MCP 协议与集成 三层深度学习教程

## [总览] 技术总览

MCP（Model Context Protocol）是 Anthropic 提出的开放协议，标准化 AI 模型与外部工具、数据源的交互方式。通过统一的接口定义，让 AI 应用能够安全、可控地访问各种资源。

本教程采用三层漏斗学习法：**核心层**聚焦协议规范、资源定义、工具实现三大基石；**重点层**深入服务器开发和客户端集成；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 协议规范

#### [概念] 概念解释

MCP 定义了客户端-服务器架构，通过 JSON-RPC 2.0 进行通信。核心概念包括：Resources（资源）、Prompts（提示模板）、Tools（工具）。服务器提供能力，客户端消费能力。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional, Literal
from dataclasses import dataclass, field
from enum import Enum
import json

class MCPMethod(Enum):
    """MCP 方法"""
    INITIALIZE = "initialize"
    LIST_RESOURCES = "resources/list"
    READ_RESOURCE = "resources/read"
    LIST_TOOLS = "tools/list"
    CALL_TOOL = "tools/call"
    LIST_PROMPTS = "prompts/list"
    GET_PROMPT = "prompts/get"

@dataclass
class JSONRPCRequest:
    """JSON-RPC 请求"""
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    method: str = ""
    params: Dict[str, Any] = field(default_factory=dict)

@dataclass
class JSONRPCResponse:
    """JSON-RPC 响应"""
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    result: Any = None
    error: Optional[Dict[str, Any]] = None

@dataclass
class MCPCapabilities:
    """MCP 能力"""
    resources: bool = False
    tools: bool = False
    prompts: bool = False
    logging: bool = False

@dataclass
class ServerInfo:
    """服务器信息"""
    name: str
    version: str
    protocolVersion: str = "2024-11-05"

# MCP 消息示例
def create_initialize_request() -> JSONRPCRequest:
    """创建初始化请求"""
    return JSONRPCRequest(
        id=1,
        method="initialize",
        params={
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "resources": {},
                "tools": {}
            },
            "clientInfo": {
                "name": "my-client",
                "version": "1.0.0"
            }
        }
    )

def create_list_tools_request() -> JSONRPCRequest:
    """创建工具列表请求"""
    return JSONRPCRequest(
        id=2,
        method="tools/list",
        params={}
    )

def create_call_tool_request(tool_name: str, arguments: Dict[str, Any]) -> JSONRPCRequest:
    """创建工具调用请求"""
    return JSONRPCRequest(
        id=3,
        method="tools/call",
        params={
            "name": tool_name,
            "arguments": arguments
        }
    )

# 示例
print("MCP 请求示例:")
print(json.dumps(create_initialize_request().__dict__, indent=2))
```

### 2. 资源定义

#### [概念] 概念解释

资源是 MCP 服务器暴露的数据源，通过 URI 标识。支持文本和二进制资源，支持列表和订阅。资源可以是文件、数据库记录、API 响应等。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from urllib.parse import urlparse

@dataclass
class Resource:
    """MCP 资源"""
    uri: str
    name: str
    description: Optional[str] = None
    mimeType: Optional[str] = None

@dataclass
class ResourceContent:
    """资源内容"""
    uri: str
    mimeType: Optional[str] = None
    text: Optional[str] = None
    blob: Optional[bytes] = None

@dataclass
class ResourceTemplate:
    """资源模板"""
    uriTemplate: str
    name: str
    description: Optional[str] = None
    mimeType: Optional[str] = None

class ResourceManager:
    """资源管理器"""
    
    def __init__(self):
        self.resources: Dict[str, Resource] = {}
        self.templates: List[ResourceTemplate] = []
    
    def register_resource(self, resource: Resource) -> None:
        """注册资源"""
        self.resources[resource.uri] = resource
    
    def register_template(self, template: ResourceTemplate) -> None:
        """注册资源模板"""
        self.templates.append(template)
    
    def list_resources(self) -> List[Resource]:
        """列出所有资源"""
        return list(self.resources.values())
    
    def read_resource(self, uri: str) -> Optional[ResourceContent]:
        """读取资源"""
        if uri in self.resources:
            # 模拟读取资源
            return ResourceContent(
                uri=uri,
                mimeType="text/plain",
                text=f"Content of {uri}"
            )
        return None
    
    def match_template(self, uri: str) -> Optional[ResourceTemplate]:
        """匹配资源模板"""
        for template in self.templates:
            # 简单模板匹配
            template_prefix = template.uriTemplate.replace("{id}", "")
            if uri.startswith(template_prefix):
                return template
        return None

# 使用示例
resource_manager = ResourceManager()

# 注册静态资源
resource_manager.register_resource(Resource(
    uri="file:///data/config.json",
    name="配置文件",
    description="应用配置",
    mimeType="application/json"
))

# 注册资源模板
resource_manager.register_template(ResourceTemplate(
    uriTemplate="db:///users/{id}",
    name="用户数据",
    description="用户信息",
    mimeType="application/json"
))

# 列出资源
print("可用资源:")
for res in resource_manager.list_resources():
    print(f"  - {res.uri}: {res.name}")

# 读取资源
content = resource_manager.read_resource("file:///data/config.json")
if content:
    print(f"\n资源内容: {content.text}")
```

### 3. 工具实现

#### [概念] 概念解释

工具是 MCP 服务器提供的可执行功能。定义包括名称、描述、输入 Schema。工具执行后返回文本或结构化结果。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
import json

@dataclass
class ToolDefinition:
    """工具定义"""
    name: str
    description: str
    inputSchema: Dict[str, Any]

@dataclass
class ToolResult:
    """工具执行结果"""
    content: List[Dict[str, Any]]
    isError: bool = False

class ToolRegistry:
    """工具注册中心"""
    
    def __init__(self):
        self.tools: Dict[str, ToolDefinition] = {}
        self.handlers: Dict[str, Callable] = {}
    
    def register(
        self,
        name: str,
        description: str,
        input_schema: Dict[str, Any],
        handler: Callable
    ) -> None:
        """注册工具"""
        self.tools[name] = ToolDefinition(
            name=name,
            description=description,
            inputSchema=input_schema
        )
        self.handlers[name] = handler
    
    def list_tools(self) -> List[ToolDefinition]:
        """列出所有工具"""
        return list(self.tools.values())
    
    def get_tool_schema(self, name: str) -> Optional[Dict[str, Any]]:
        """获取工具 Schema"""
        if name in self.tools:
            tool = self.tools[name]
            return {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": tool.inputSchema
            }
        return None
    
    def call_tool(self, name: str, arguments: Dict[str, Any]) -> ToolResult:
        """调用工具"""
        if name not in self.handlers:
            return ToolResult(
                content=[{"type": "text", "text": f"Unknown tool: {name}"}],
                isError=True
            )
        
        try:
            result = self.handlers[name](**arguments)
            return ToolResult(
                content=[{"type": "text", "text": str(result)}]
            )
        except Exception as e:
            return ToolResult(
                content=[{"type": "text", "text": f"Error: {str(e)}"}],
                isError=True
            )

# 使用示例
registry = ToolRegistry()

# 注册工具
registry.register(
    name="get_weather",
    description="获取指定城市的天气信息",
    input_schema={
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称"
            }
        },
        "required": ["city"]
    },
    handler=lambda city: f"{city} 今天天气晴朗，温度 25°C"
)

registry.register(
    name="search",
    description="搜索互联网",
    input_schema={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "搜索关键词"
            },
            "limit": {
                "type": "integer",
                "description": "结果数量",
                "default": 5
            }
        },
        "required": ["query"]
    },
    handler=lambda query, limit=5: f"找到 {limit} 条关于 '{query}' 的结果"
)

# 列出工具
print("可用工具:")
for tool in registry.list_tools():
    print(f"  - {tool.name}: {tool.description}")

# 调用工具
result = registry.call_tool("get_weather", {"city": "北京"})
print(f"\n工具调用结果: {result.content[0]['text']}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. MCP 服务器开发

#### [概念] 概念解释

MCP 服务器实现协议规范，暴露资源和工具。支持 stdio、HTTP、WebSocket 传输。需要处理初始化、能力协商、请求处理。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
import json

class MCPServer:
    """MCP 服务器"""
    
    def __init__(self, name: str, version: str):
        self.info = ServerInfo(name=name, version=version)
        self.capabilities = MCPCapabilities(
            resources=True,
            tools=True,
            prompts=False
        )
        self.resource_manager = ResourceManager()
        self.tool_registry = ToolRegistry()
        self.request_handlers: Dict[str, Callable] = {}
        
        self._setup_handlers()
    
    def _setup_handlers(self) -> None:
        """设置请求处理器"""
        self.request_handlers = {
            "initialize": self._handle_initialize,
            "resources/list": self._handle_list_resources,
            "resources/read": self._handle_read_resource,
            "tools/list": self._handle_list_tools,
            "tools/call": self._handle_call_tool
        }
    
    def _handle_initialize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """处理初始化请求"""
        return {
            "protocolVersion": self.info.protocolVersion,
            "capabilities": {
                "resources": {},
                "tools": {}
            },
            "serverInfo": {
                "name": self.info.name,
                "version": self.info.version
            }
        }
    
    def _handle_list_resources(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """处理资源列表请求"""
        resources = self.resource_manager.list_resources()
        return {
            "resources": [
                {
                    "uri": r.uri,
                    "name": r.name,
                    "description": r.description,
                    "mimeType": r.mimeType
                }
                for r in resources
            ]
        }
    
    def _handle_read_resource(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """处理资源读取请求"""
        uri = params.get("uri")
        content = self.resource_manager.read_resource(uri)
        
        if content:
            return {
                "contents": [{
                    "uri": content.uri,
                    "mimeType": content.mimeType,
                    "text": content.text
                }]
            }
        
        return {"error": {"code": -32602, "message": f"Resource not found: {uri}"}}
    
    def _handle_list_tools(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """处理工具列表请求"""
        tools = self.tool_registry.list_tools()
        return {
            "tools": [
                {
                    "name": t.name,
                    "description": t.description,
                    "inputSchema": t.inputSchema
                }
                for t in tools
            ]
        }
    
    def _handle_call_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """处理工具调用请求"""
        name = params.get("name")
        arguments = params.get("arguments", {})
        
        result = self.tool_registry.call_tool(name, arguments)
        
        return {
            "content": result.content,
            "isError": result.isError
        }
    
    def handle_request(self, request: JSONRPCRequest) -> JSONRPCResponse:
        """处理请求"""
        method = request.method
        
        if method in self.request_handlers:
            try:
                result = self.request_handlers[method](request.params)
                return JSONRPCResponse(
                    id=request.id,
                    result=result
                )
            except Exception as e:
                return JSONRPCResponse(
                    id=request.id,
                    error={"code": -32603, "message": str(e)}
                )
        
        return JSONRPCResponse(
            id=request.id,
            error={"code": -32601, "message": f"Method not found: {method}"}
        )
    
    def add_resource(self, resource: Resource) -> None:
        """添加资源"""
        self.resource_manager.register_resource(resource)
    
    def add_tool(self, name: str, description: str, 
                 input_schema: Dict[str, Any], handler: Callable) -> None:
        """添加工具"""
        self.tool_registry.register(name, description, input_schema, handler)

# 使用示例
server = MCPServer("my-mcp-server", "1.0.0")

# 添加资源
server.add_resource(Resource(
    uri="file:///data/readme.md",
    name="README",
    mimeType="text/markdown"
))

# 添加工具
server.add_tool(
    name="echo",
    description="回显输入内容",
    input_schema={
        "type": "object",
        "properties": {
            "message": {"type": "string"}
        },
        "required": ["message"]
    },
    handler=lambda message: f"Echo: {message}"
)

# 处理请求
init_request = create_initialize_request()
response = server.handle_request(init_request)
print("初始化响应:")
print(json.dumps(response.__dict__, indent=2, default=str))
```

### 2. 客户端集成

#### [概念] 概念解释

MCP 客户端连接服务器，发现能力并调用。需要处理连接管理、能力发现、请求构建。Claude Desktop、Cursor 等 IDE 已内置 MCP 支持。

#### [代码] 代码示例

```python
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class ServerCapabilities:
    """服务器能力"""
    resources: bool = False
    tools: bool = False
    prompts: bool = False

class MCPClient:
    """MCP 客户端"""
    
    def __init__(self):
        self.server_info: Optional[ServerInfo] = None
        self.capabilities: Optional[ServerCapabilities] = None
        self.request_id = 0
        self.server: Optional[MCPServer] = None  # 模拟服务器连接
    
    def connect(self, server: MCPServer) -> bool:
        """连接服务器"""
        self.server = server
        
        # 发送初始化请求
        response = self._send_request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "my-client", "version": "1.0.0"}
        })
        
        if response.result:
            self.server_info = ServerInfo(
                name=response.result["serverInfo"]["name"],
                version=response.result["serverInfo"]["version"]
            )
            caps = response.result.get("capabilities", {})
            self.capabilities = ServerCapabilities(
                resources="resources" in caps,
                tools="tools" in caps
            )
            return True
        
        return False
    
    def _send_request(self, method: str, params: Dict[str, Any]) -> JSONRPCResponse:
        """发送请求"""
        self.request_id += 1
        request = JSONRPCRequest(
            id=self.request_id,
            method=method,
            params=params
        )
        return self.server.handle_request(request)
    
    def list_resources(self) -> List[Resource]:
        """列出资源"""
        if not self.capabilities or not self.capabilities.resources:
            return []
        
        response = self._send_request("resources/list", {})
        
        if response.result:
            return [
                Resource(
                    uri=r["uri"],
                    name=r["name"],
                    description=r.get("description"),
                    mimeType=r.get("mimeType")
                )
                for r in response.result.get("resources", [])
            ]
        
        return []
    
    def read_resource(self, uri: str) -> Optional[str]:
        """读取资源"""
        response = self._send_request("resources/read", {"uri": uri})
        
        if response.result:
            contents = response.result.get("contents", [])
            if contents:
                return contents[0].get("text")
        
        return None
    
    def list_tools(self) -> List[ToolDefinition]:
        """列出工具"""
        if not self.capabilities or not self.capabilities.tools:
            return []
        
        response = self._send_request("tools/list", {})
        
        if response.result:
            return [
                ToolDefinition(
                    name=t["name"],
                    description=t["description"],
                    inputSchema=t["inputSchema"]
                )
                for t in response.result.get("tools", [])
            ]
        
        return []
    
    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
        """调用工具"""
        response = self._send_request("tools/call", {
            "name": name,
            "arguments": arguments
        })
        
        if response.result:
            content = response.result.get("content", [])
            if content:
                return content[0].get("text")
        
        return None

# 使用示例
client = MCPClient()

# 连接服务器
if client.connect(server):
    print(f"已连接到: {client.server_info.name} v{client.server_info.version}")
    
    # 列出资源
    print("\n可用资源:")
    for res in client.list_resources():
        print(f"  - {res.uri}: {res.name}")
    
    # 列出工具
    print("\n可用工具:")
    for tool in client.list_tools():
        print(f"  - {tool.name}: {tool.description}")
    
    # 调用工具
    result = client.call_tool("echo", {"message": "Hello MCP!"})
    print(f"\n工具调用结果: {result}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| stdio | 标准输入输出传输 |
| HTTP | HTTP 传输 |
| WebSocket | WebSocket 传输 |
| SSE | 服务器发送事件 |
| Sampling | 模型采样请求 |
| Roots | 根目录配置 |
| Prompts | 提示模板 |
| Logging | 日志系统 |
| Pagination | 分页支持 |
| Subscriptions | 资源订阅 |

---

## [实战] 核心实战清单

1. 实现一个简单的 MCP 服务器，暴露文件资源
2. 开发 MCP 客户端，连接并调用服务器能力
3. 集成 MCP 到现有 AI 应用中

## [避坑] 三层避坑提醒

- **核心层误区**：混淆资源和工具的概念，资源是数据，工具是操作
- **重点层误区**：忽略能力协商，导致调用不支持的功能
- **扩展层建议**：使用官方 SDK 简化开发，遵循协议规范
