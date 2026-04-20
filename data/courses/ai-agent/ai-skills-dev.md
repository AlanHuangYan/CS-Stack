# AI Skills 开发 三层深度学习教程

## [总览] 技术总览

AI Skills 是为 AI Agent 设计的可复用能力模块，封装特定领域的知识和操作。良好的 Skills 设计使 Agent 具备专业能力，如代码生成、数据分析、文档处理等。开发 Skills 需要定义接口、实现逻辑、处理异常。

本教程采用三层漏斗学习法：**核心层**聚焦 Skill 定义、输入输出设计、错误处理三大基石；**重点层**深入 Skill 组合和测试；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Skill 定义与注册

#### [概念] 概念解释

Skill 是 Agent 可调用的能力单元，包含名称、描述、输入参数、输出格式。通过注册机制将 Skill 暴露给 Agent，Agent 根据用户意图选择合适的 Skill 执行。

#### [代码] 代码示例

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Callable
from abc import ABC, abstractmethod
import json
import inspect

@dataclass
class SkillParameter:
    """Skill 参数定义"""
    name: str
    type: str
    description: str
    required: bool = True
    default: Any = None
    enum: List[str] = None

@dataclass
class SkillMetadata:
    """Skill 元数据"""
    name: str
    description: str
    parameters: List[SkillParameter]
    returns: str
    examples: List[Dict] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)

class BaseSkill(ABC):
    """Skill 基类"""
    
    @property
    @abstractmethod
    def metadata(self) -> SkillMetadata:
        pass
    
    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        pass
    
    def validate_parameters(self, kwargs: Dict[str, Any]) -> bool:
        """验证参数"""
        for param in self.metadata.parameters:
            if param.required and param.name not in kwargs:
                raise ValueError(f"Missing required parameter: {param.name}")
            
            if param.name in kwargs and param.enum:
                if kwargs[param.name] not in param.enum:
                    raise ValueError(f"Invalid value for {param.name}: {kwargs[param.name]}")
        
        return True
    
    def to_openai_function(self) -> Dict:
        """转换为 OpenAI Function 格式"""
        properties = {}
        required = []
        
        for param in self.metadata.parameters:
            properties[param.name] = {
                "type": param.type,
                "description": param.description
            }
            if param.enum:
                properties[param.name]["enum"] = param.enum
            
            if param.required:
                required.append(param.name)
        
        return {
            "type": "function",
            "function": {
                "name": self.metadata.name,
                "description": self.metadata.description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required
                }
            }
        }

class SkillRegistry:
    """Skill 注册表"""
    
    def __init__(self):
        self._skills: Dict[str, BaseSkill] = {}
    
    def register(self, skill: BaseSkill):
        """注册 Skill"""
        name = skill.metadata.name
        if name in self._skills:
            raise ValueError(f"Skill {name} already registered")
        self._skills[name] = skill
    
    def get(self, name: str) -> Optional[BaseSkill]:
        """获取 Skill"""
        return self._skills.get(name)
    
    def list_skills(self) -> List[str]:
        """列出所有 Skill"""
        return list(self._skills.keys())
    
    def get_openai_functions(self) -> List[Dict]:
        """获取 OpenAI Functions 格式"""
        return [skill.to_openai_function() for skill in self._skills.values()]
    
    def execute(self, name: str, **kwargs) -> Dict[str, Any]:
        """执行 Skill"""
        skill = self.get(name)
        if not skill:
            raise ValueError(f"Skill {name} not found")
        
        skill.validate_parameters(kwargs)
        return skill.execute(**kwargs)

# 具体 Skill 实现
class CodeExecutionSkill(BaseSkill):
    """代码执行 Skill"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="execute_code",
            description="Execute Python code and return the result",
            parameters=[
                SkillParameter(
                    name="code",
                    type="string",
                    description="Python code to execute",
                    required=True
                ),
                SkillParameter(
                    name="timeout",
                    type="integer",
                    description="Execution timeout in seconds",
                    required=False,
                    default=30
                )
            ],
            returns="Execution result with stdout, stderr, and return value",
            tags=["code", "execution", "python"]
        )
    
    def execute(self, code: str, timeout: int = 30) -> Dict[str, Any]:
        import subprocess
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                ['python', temp_file],
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Execution timed out after {timeout} seconds"
            }
        finally:
            os.unlink(temp_file)

class WebSearchSkill(BaseSkill):
    """网络搜索 Skill"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="web_search",
            description="Search the web for information",
            parameters=[
                SkillParameter(
                    name="query",
                    type="string",
                    description="Search query",
                    required=True
                ),
                SkillParameter(
                    name="num_results",
                    type="integer",
                    description="Number of results to return",
                    required=False,
                    default=5
                )
            ],
            returns="List of search results with titles, URLs, and snippets",
            tags=["web", "search", "information"]
        )
    
    def execute(self, query: str, num_results: int = 5) -> Dict[str, Any]:
        return {
            "query": query,
            "results": [
                {
                    "title": f"Result {i+1} for: {query}",
                    "url": f"https://example.com/result/{i+1}",
                    "snippet": f"This is a snippet for result {i+1}..."
                }
                for i in range(num_results)
            ]
        }

# 使用示例
registry = SkillRegistry()
registry.register(CodeExecutionSkill())
registry.register(WebSearchSkill())

print(registry.list_skills())
print(json.dumps(registry.get_openai_functions(), indent=2))
```

### 2. 输入输出设计

#### [概念] 概念解释

良好的输入输出设计是 Skill 可用性的关键。输入需要清晰的参数定义和验证，输出需要结构化的格式和错误信息。设计原则：简洁、明确、可扩展。

#### [代码] 代码示例

```python
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Generic, TypeVar
from enum import Enum
import json

T = TypeVar('T')

class SkillStatus(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"

@dataclass
class SkillResult(Generic[T]):
    """Skill 执行结果"""
    status: SkillStatus
    data: Optional[T] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict:
        result = {
            "status": self.status.value,
            "success": self.status == SkillStatus.SUCCESS
        }
        
        if self.data is not None:
            result["data"] = self.data
        
        if self.error:
            result["error"] = self.error
        
        if self.metadata:
            result["metadata"] = self.metadata
        
        return result
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)

@dataclass
class FileReadResult:
    """文件读取结果"""
    content: str
    file_path: str
    encoding: str
    line_count: int
    size_bytes: int

class FileReadSkill(BaseSkill):
    """文件读取 Skill"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="read_file",
            description="Read content from a file",
            parameters=[
                SkillParameter(
                    name="file_path",
                    type="string",
                    description="Path to the file to read",
                    required=True
                ),
                SkillParameter(
                    name="encoding",
                    type="string",
                    description="File encoding",
                    required=False,
                    default="utf-8",
                    enum=["utf-8", "gbk", "ascii", "latin-1"]
                ),
                SkillParameter(
                    name="start_line",
                    type="integer",
                    description="Start line number (1-indexed)",
                    required=False,
                    default=1
                ),
                SkillParameter(
                    name="end_line",
                    type="integer",
                    description="End line number",
                    required=False,
                    default=None
                )
            ],
            returns="File content with metadata",
            tags=["file", "read", "io"]
        )
    
    def execute(
        self,
        file_path: str,
        encoding: str = "utf-8",
        start_line: int = 1,
        end_line: int = None
    ) -> Dict[str, Any]:
        import os
        
        try:
            if not os.path.exists(file_path):
                return SkillResult(
                    status=SkillStatus.FAILURE,
                    error=f"File not found: {file_path}"
                ).to_dict()
            
            file_size = os.path.getsize(file_path)
            
            with open(file_path, 'r', encoding=encoding) as f:
                lines = f.readlines()
            
            total_lines = len(lines)
            
            start_idx = max(0, start_line - 1)
            end_idx = end_line if end_line else total_lines
            
            selected_lines = lines[start_idx:end_idx]
            content = ''.join(selected_lines)
            
            result = FileReadResult(
                content=content,
                file_path=file_path,
                encoding=encoding,
                line_count=len(selected_lines),
                size_bytes=file_size
            )
            
            return SkillResult(
                status=SkillStatus.SUCCESS,
                data=asdict(result),
                metadata={
                    "total_lines": total_lines,
                    "start_line": start_line,
                    "end_line": min(end_line or total_lines, total_lines)
                }
            ).to_dict()
            
        except UnicodeDecodeError as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=f"Encoding error: {str(e)}. Try a different encoding."
            ).to_dict()
        except Exception as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=f"Failed to read file: {str(e)}"
            ).to_dict()

@dataclass
class DataAnalysisResult:
    """数据分析结果"""
    summary: Dict[str, Any]
    statistics: Dict[str, float]
    insights: List[str]
    visualizations: List[str]

class DataAnalysisSkill(BaseSkill):
    """数据分析 Skill"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="analyze_data",
            description="Analyze data and generate insights",
            parameters=[
                SkillParameter(
                    name="data",
                    type="array",
                    description="Data to analyze (list of objects)",
                    required=True
                ),
                SkillParameter(
                    name="analysis_type",
                    type="string",
                    description="Type of analysis to perform",
                    required=False,
                    default="summary",
                    enum=["summary", "statistical", "trend", "correlation"]
                )
            ],
            returns="Analysis results with summary, statistics, and insights",
            tags=["data", "analysis", "statistics"]
        )
    
    def execute(self, data: List[Dict], analysis_type: str = "summary") -> Dict[str, Any]:
        try:
            if not data:
                return SkillResult(
                    status=SkillStatus.FAILURE,
                    error="Empty data provided"
                ).to_dict()
            
            summary = {
                "row_count": len(data),
                "column_count": len(data[0].keys()) if data else 0,
                "columns": list(data[0].keys()) if data else []
            }
            
            statistics = {}
            if analysis_type in ["summary", "statistical"]:
                for key in data[0].keys():
                    values = [row.get(key) for row in data if key in row]
                    numeric_values = [v for v in values if isinstance(v, (int, float))]
                    
                    if numeric_values:
                        statistics[key] = {
                            "count": len(numeric_values),
                            "mean": sum(numeric_values) / len(numeric_values),
                            "min": min(numeric_values),
                            "max": max(numeric_values)
                        }
            
            insights = []
            if analysis_type == "trend":
                insights.append("Trend analysis would be performed here")
            elif analysis_type == "correlation":
                insights.append("Correlation analysis would be performed here")
            
            result = DataAnalysisResult(
                summary=summary,
                statistics=statistics,
                insights=insights,
                visualizations=[]
            )
            
            return SkillResult(
                status=SkillStatus.SUCCESS,
                data=asdict(result)
            ).to_dict()
            
        except Exception as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=f"Analysis failed: {str(e)}"
            ).to_dict()
```

### 3. 错误处理与重试

#### [概念] 概念解释

健壮的错误处理确保 Skill 在异常情况下仍能返回有意义的信息。策略包括：参数验证、异常捕获、重试机制、降级处理。良好的错误信息帮助 Agent 理解问题并采取正确行动。

#### [代码] 代码示例

```python
from functools import wraps
from typing import Callable, Any, Dict
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SkillError(Exception):
    """Skill 错误基类"""
    
    def __init__(self, message: str, code: str = "UNKNOWN_ERROR", recoverable: bool = False):
        self.message = message
        self.code = code
        self.recoverable = recoverable
        super().__init__(message)

class ValidationError(SkillError):
    """参数验证错误"""
    
    def __init__(self, message: str, parameter: str = None):
        super().__init__(message, "VALIDATION_ERROR", recoverable=True)
        self.parameter = parameter

class ExecutionError(SkillError):
    """执行错误"""
    
    def __init__(self, message: str, recoverable: bool = False):
        super().__init__(message, "EXECUTION_ERROR", recoverable)

class TimeoutError(SkillError):
    """超时错误"""
    
    def __init__(self, timeout: int):
        super().__init__(f"Operation timed out after {timeout} seconds", "TIMEOUT_ERROR", recoverable=True)
        self.timeout = timeout

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """重试装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_error = None
            current_delay = delay
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    
                    if attempt < max_attempts - 1:
                        logger.warning(
                            f"Attempt {attempt + 1} failed: {str(e)}. "
                            f"Retrying in {current_delay} seconds..."
                        )
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"All {max_attempts} attempts failed")
            
            raise last_error
        
        return wrapper
    return decorator

def handle_errors(func: Callable) -> Callable:
    """错误处理装饰器"""
    @wraps(func)
    def wrapper(self, *args, **kwargs) -> Dict[str, Any]:
        try:
            return func(self, *args, **kwargs)
        except ValidationError as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=f"Validation error: {e.message}",
                metadata={"parameter": e.parameter, "code": e.code}
            ).to_dict()
        except TimeoutError as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=e.message,
                metadata={"timeout": e.timeout, "code": e.code}
            ).to_dict()
        except SkillError as e:
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=e.message,
                metadata={"code": e.code, "recoverable": e.recoverable}
            ).to_dict()
        except Exception as e:
            logger.exception("Unexpected error in skill execution")
            return SkillResult(
                status=SkillStatus.FAILURE,
                error=f"Unexpected error: {str(e)}",
                metadata={"code": "INTERNAL_ERROR"}
            ).to_dict()
    
    return wrapper

class APICallSkill(BaseSkill):
    """API 调用 Skill（带错误处理）"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="api_call",
            description="Make an HTTP API call",
            parameters=[
                SkillParameter(
                    name="url",
                    type="string",
                    description="API endpoint URL",
                    required=True
                ),
                SkillParameter(
                    name="method",
                    type="string",
                    description="HTTP method",
                    required=False,
                    default="GET",
                    enum=["GET", "POST", "PUT", "DELETE", "PATCH"]
                ),
                SkillParameter(
                    name="headers",
                    type="object",
                    description="HTTP headers",
                    required=False,
                    default={}
                ),
                SkillParameter(
                    name="body",
                    type="object",
                    description="Request body",
                    required=False,
                    default=None
                ),
                SkillParameter(
                    name="timeout",
                    type="integer",
                    description="Request timeout in seconds",
                    required=False,
                    default=30
                )
            ],
            returns="API response with status code and data",
            tags=["api", "http", "network"]
        )
    
    @handle_errors
    @retry(max_attempts=3, delay=1.0, exceptions=(ConnectionError,))
    def execute(
        self,
        url: str,
        method: str = "GET",
        headers: Dict = None,
        body: Dict = None,
        timeout: int = 30
    ) -> Dict[str, Any]:
        import requests
        
        if not url.startswith(('http://', 'https://')):
            raise ValidationError("URL must start with http:// or https://", "url")
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers or {},
                json=body,
                timeout=timeout
            )
            
            return SkillResult(
                status=SkillStatus.SUCCESS if response.ok else SkillStatus.PARTIAL,
                data={
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "body": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                },
                metadata={
                    "url": url,
                    "method": method,
                    "response_time_ms": response.elapsed.total_seconds() * 1000
                }
            ).to_dict()
            
        except requests.exceptions.Timeout:
            raise TimeoutError(timeout)
        except requests.exceptions.ConnectionError as e:
            raise ExecutionError(f"Connection failed: {str(e)}", recoverable=True)
        except requests.exceptions.RequestException as e:
            raise ExecutionError(f"Request failed: {str(e)}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Skill 组合与编排

#### [概念] 概念解释

复杂任务需要多个 Skill 协同完成。编排模式包括：顺序执行、并行执行、条件分支、循环迭代。良好的编排设计提高效率和可靠性。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
from enum import Enum
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ExecutionMode(Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"

@dataclass
class SkillStep:
    """Skill 执行步骤"""
    skill_name: str
    params: Dict[str, Any]
    condition: Callable[[Dict], bool] = None
    output_key: str = None

class SkillOrchestrator:
    """Skill 编排器"""
    
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def execute_sequential(
        self,
        steps: List[SkillStep],
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """顺序执行"""
        context = context or {}
        results = {}
        
        for i, step in enumerate(steps):
            params = self._resolve_params(step.params, context, results)
            
            if step.condition and not step.condition({**context, **results}):
                continue
            
            result = self.registry.execute(step.skill_name, **params)
            
            if step.output_key:
                results[step.output_key] = result
            
            results[f"step_{i}"] = result
            
            if not result.get("success", False):
                break
        
        return results
    
    async def execute_parallel(
        self,
        steps: List[SkillStep],
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """并行执行"""
        context = context or {}
        
        async def execute_step(step: SkillStep, idx: int):
            params = self._resolve_params(step.params, context, {})
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.registry.execute(step.skill_name, **params)
            )
            return idx, step.output_key, result
        
        tasks = [execute_step(step, i) for i, step in enumerate(steps)]
        results = {}
        
        for coro in asyncio.as_completed(tasks):
            idx, output_key, result = await coro
            if output_key:
                results[output_key] = result
            results[f"step_{idx}"] = result
        
        return results
    
    def execute_conditional(
        self,
        steps: List[SkillStep],
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """条件执行"""
        context = context or {}
        results = {}
        
        for i, step in enumerate(steps):
            if step.condition and not step.condition({**context, **results}):
                continue
            
            params = self._resolve_params(step.params, context, results)
            result = self.registry.execute(step.skill_name, **params)
            
            if step.output_key:
                results[step.output_key] = result
            
            results[f"step_{i}"] = result
        
        return results
    
    def _resolve_params(
        self,
        params: Dict[str, Any],
        context: Dict[str, Any],
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """解析参数中的引用"""
        resolved = {}
        
        for key, value in params.items():
            if isinstance(value, str) and value.startswith("$"):
                ref_path = value[1:].split(".")
                ref_value = {**context, **results}
                
                for part in ref_path:
                    if isinstance(ref_value, dict):
                        ref_value = ref_value.get(part)
                    else:
                        ref_value = None
                        break
                
                resolved[key] = ref_value
            else:
                resolved[key] = value
        
        return resolved

# 使用示例
orchestrator = SkillOrchestrator(registry)

workflow = [
    SkillStep(
        skill_name="read_file",
        params={"file_path": "/data/input.txt"},
        output_key="file_content"
    ),
    SkillStep(
        skill_name="analyze_data",
        params={"data": "$file_content.data.content"},
        output_key="analysis"
    ),
    SkillStep(
        skill_name="web_search",
        params={"query": "$analysis.data.insights.0"},
        condition=lambda ctx: ctx.get("analysis", {}).get("success", False),
        output_key="search_results"
    )
]

results = orchestrator.execute_sequential(workflow)
```

### 2. Skill 测试与验证

#### [概念] 概念解释

Skill 测试确保功能正确性和稳定性。测试类型：单元测试、集成测试、边界测试。验证包括参数验证、输出验证、性能验证。

#### [代码] 代码示例

```python
import unittest
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class TestCase:
    """测试用例"""
    name: str
    params: Dict[str, Any]
    expected_status: str
    expected_keys: List[str] = None
    should_raise: bool = False

class SkillTestSuite:
    """Skill 测试套件"""
    
    def __init__(self, skill: BaseSkill):
        self.skill = skill
        self.test_cases: List[TestCase] = []
    
    def add_test(self, test_case: TestCase):
        self.test_cases.append(test_case)
        return self
    
    def run_all(self) -> Dict[str, Any]:
        """运行所有测试"""
        results = {
            "skill": self.skill.metadata.name,
            "total": len(self.test_cases),
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        
        for test in self.test_cases:
            try:
                result = self._run_test(test)
                
                if result["passed"]:
                    results["passed"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append({
                        "test": test.name,
                        "reason": result["reason"]
                    })
                    
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "test": test.name,
                    "reason": str(e)
                })
        
        results["success_rate"] = results["passed"] / results["total"] if results["total"] > 0 else 0
        
        return results
    
    def _run_test(self, test: TestCase) -> Dict[str, Any]:
        """运行单个测试"""
        try:
            result = self.skill.execute(**test.params)
            
            if result.get("status") != test.expected_status:
                return {
                    "passed": False,
                    "reason": f"Expected status {test.expected_status}, got {result.get('status')}"
                }
            
            if test.expected_keys:
                for key in test.expected_keys:
                    if key not in result:
                        return {
                            "passed": False,
                            "reason": f"Missing expected key: {key}"
                        }
            
            return {"passed": True}
            
        except Exception as e:
            if test.should_raise:
                return {"passed": True}
            
            return {
                "passed": False,
                "reason": f"Unexpected exception: {str(e)}"
            }

# 单元测试示例
class TestCodeExecutionSkill(unittest.TestCase):
    
    def setUp(self):
        self.skill = CodeExecutionSkill()
    
    def test_metadata(self):
        self.assertEqual(self.skill.metadata.name, "execute_code")
        self.assertIn("code", [p.name for p in self.skill.metadata.parameters])
    
    def test_simple_execution(self):
        result = self.skill.execute(code="print('Hello, World!')")
        self.assertEqual(result["status"], "success")
        self.assertIn("Hello, World!", result["data"]["stdout"])
    
    def test_execution_with_error(self):
        result = self.skill.execute(code="raise ValueError('test error')")
        self.assertEqual(result["status"], "failure")
        self.assertIn("test error", result["data"]["stderr"])
    
    def test_timeout(self):
        result = self.skill.execute(code="while True: pass", timeout=1)
        self.assertEqual(result["status"], "failure")
        self.assertIn("timeout", result["error"].lower())
    
    def test_parameter_validation(self):
        with self.assertRaises(ValueError):
            self.skill.validate_parameters({})

class TestFileReadSkill(unittest.TestCase):
    
    def setUp(self):
        self.skill = FileReadSkill()
        import tempfile
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        self.temp_file.write("Line 1\nLine 2\nLine 3\n")
        self.temp_file.close()
    
    def tearDown(self):
        import os
        os.unlink(self.temp_file.name)
    
    def test_read_file(self):
        result = self.skill.execute(file_path=self.temp_file.name)
        self.assertEqual(result["status"], "success")
        self.assertIn("Line 1", result["data"]["content"])
    
    def test_read_nonexistent_file(self):
        result = self.skill.execute(file_path="/nonexistent/file.txt")
        self.assertEqual(result["status"], "failure")
        self.assertIn("not found", result["error"].lower())
    
    def test_read_partial_file(self):
        result = self.skill.execute(
            file_path=self.temp_file.name,
            start_line=2,
            end_line=2
        )
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["data"]["line_count"], 1)

# 运行测试
if __name__ == "__main__":
    unittest.main()
```

### 3. Skill 文档生成

#### [概念] 概念解释

清晰的文档帮助用户和 Agent 理解 Skill 用法。文档包括：描述、参数说明、返回值格式、示例、注意事项。自动化文档生成确保文档与代码同步。

#### [代码] 代码示例

```python
from typing import Dict, Any
import json

class SkillDocumentationGenerator:
    """Skill 文档生成器"""
    
    @staticmethod
    def generate_markdown(skill: BaseSkill) -> str:
        """生成 Markdown 文档"""
        meta = skill.metadata
        
        doc = f"# {meta.name}\n\n"
        doc += f"{meta.description}\n\n"
        
        doc += "## Parameters\n\n"
        doc += "| Name | Type | Required | Default | Description |\n"
        doc += "|------|------|----------|---------|-------------|\n"
        
        for param in meta.parameters:
            default = param.default if param.default is not None else "-"
            doc += f"| {param.name} | {param.type} | {'Yes' if param.required else 'No'} | {default} | {param.description} |\n"
        
        doc += f"\n## Returns\n\n{meta.returns}\n\n"
        
        if meta.examples:
            doc += "## Examples\n\n"
            for i, example in enumerate(meta.examples, 1):
                doc += f"### Example {i}\n\n"
                doc += f"```json\n{json.dumps(example['input'], indent=2)}\n```\n\n"
                doc += f"**Output:**\n\n```json\n{json.dumps(example['output'], indent=2)}\n```\n\n"
        
        if meta.tags:
            doc += f"\n## Tags\n\n{', '.join(meta.tags)}\n"
        
        return doc
    
    @staticmethod
    def generate_openapi_spec(skill: BaseSkill) -> Dict:
        """生成 OpenAPI 规范"""
        meta = skill.metadata
        
        properties = {}
        required = []
        
        for param in meta.parameters:
            properties[param.name] = {
                "type": param.type,
                "description": param.description
            }
            if param.enum:
                properties[param.name]["enum"] = param.enum
            if param.default is not None:
                properties[param.name]["default"] = param.default
            
            if param.required:
                required.append(param.name)
        
        return {
            "openapi": "3.0.0",
            "info": {
                "title": meta.name,
                "description": meta.description,
                "version": "1.0.0"
            },
            "paths": {
                f"/skills/{meta.name}": {
                    "post": {
                        "summary": meta.description,
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": properties,
                                        "required": required
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": meta.returns,
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string"},
                                                "data": {"type": "object"},
                                                "error": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

# 使用示例
doc = SkillDocumentationGenerator.generate_markdown(CodeExecutionSkill())
print(doc)

openapi = SkillDocumentationGenerator.generate_openapi_spec(CodeExecutionSkill())
print(json.dumps(openapi, indent=2))
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| MCP Protocol | 模型上下文协议，Skill 通信标准 |
| Tool Calling | 工具调用，OpenAI Function Calling |
| Plugin System | 插件系统，动态加载 Skill |
| Skill Versioning | Skill 版本管理 |
| Rate Limiting | 速率限制，防止滥用 |
| Caching | 结果缓存，提高性能 |
| Streaming | 流式输出，实时响应 |
| Authentication | 认证授权，安全访问 |
| Monitoring | 监控告警，性能追踪 |
| A/B Testing | A/B 测试，效果评估 |
