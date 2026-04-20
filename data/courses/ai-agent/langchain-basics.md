# LangChain 基础 三层深度学习教程

## [总览] 技术总览

LangChain 是构建 LLM 应用的开源框架，提供模型集成、提示管理、链式调用、记忆系统、Agent 等组件。支持快速构建聊天机器人、RAG 系统、Agent 应用。

本教程采用三层漏斗学习法：**核心层**聚焦模型调用、提示模板、链式调用三大基石；**重点层**深入 RAG 和 Agent 构建；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 模型调用

#### [概念] 概念解释

LangChain 提供统一的模型接口，支持 OpenAI、Claude、本地模型等。核心类包括 `BaseLanguageModel`、`BaseChatModel`、`BaseLLM`。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import os

# 模拟 LangChain 核心类（实际使用需要安装 langchain）

@dataclass
class Message:
    """消息"""
    role: str
    content: str

class MockChatModel:
    """模拟聊天模型"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.model_name = model_name
    
    def invoke(self, messages: List[Message]) -> str:
        """调用模型"""
        # 模拟响应
        last_message = messages[-1].content if messages else ""
        return f"[{self.model_name}] 回复: {last_message[:50]}..."
    
    def batch(self, messages_list: List[List[Message]]) -> List[str]:
        """批量调用"""
        return [self.invoke(msgs) for msgs in messages_list]
    
    def stream(self, messages: List[Message]):
        """流式输出"""
        response = self.invoke(messages)
        for char in response:
            yield char

# LangChain 风格的模型配置
class ModelConfig:
    """模型配置"""
    
    def __init__(self):
        self.providers = {
            "openai": {
                "models": ["gpt-4", "gpt-3.5-turbo"],
                "default": "gpt-3.5-turbo"
            },
            "anthropic": {
                "models": ["claude-3-opus", "claude-3-sonnet"],
                "default": "claude-3-sonnet"
            },
            "local": {
                "models": ["llama2", "mistral"],
                "default": "llama2"
            }
        }
    
    def get_model(self, provider: str, model_name: str = None) -> MockChatModel:
        """获取模型实例"""
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}")
        
        model = model_name or self.providers[provider]["default"]
        return MockChatModel(model)

# 使用示例
config = ModelConfig()

# OpenAI 模型
openai_model = config.get_model("openai", "gpt-4")
response = openai_model.invoke([
    Message(role="user", content="什么是 LangChain?")
])
print(response)

# 流式输出
print("\n流式输出:")
for char in openai_model.stream([Message(role="user", content="你好")]):
    print(char, end="", flush=True)
```

### 2. 提示模板

#### [概念] 概念解释

提示模板将变量注入到提示中，支持格式化和部分填充。核心类包括 `PromptTemplate`、`ChatPromptTemplate`、`FewShotPromptTemplate`。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from string import Template

class PromptTemplate:
    """提示模板"""
    
    def __init__(self, template: str, input_variables: List[str]):
        self.template = template
        self.input_variables = input_variables
    
    def format(self, **kwargs) -> str:
        """格式化模板"""
        for var in self.input_variables:
            if var not in kwargs:
                raise ValueError(f"Missing variable: {var}")
        
        return self.template.format(**kwargs)
    
    def partial(self, **kwargs) -> 'PromptTemplate':
        """部分填充"""
        new_template = self.template.format(**kwargs)
        remaining_vars = [v for v in self.input_variables if v not in kwargs]
        return PromptTemplate(new_template, remaining_vars)

class ChatPromptTemplate:
    """聊天提示模板"""
    
    def __init__(self, messages: List[Dict[str, str]]):
        self.messages = messages
        self.input_variables = set()
        
        # 提取变量
        for msg in messages:
            content = msg.get("content", "")
            import re
            variables = re.findall(r'\{(\w+)\}', content)
            self.input_variables.update(variables)
    
    def format_messages(self, **kwargs) -> List[Message]:
        """格式化为消息列表"""
        formatted = []
        for msg in self.messages:
            content = msg["content"].format(**kwargs)
            formatted.append(Message(role=msg["role"], content=content))
        return formatted
    
    @classmethod
    def from_messages(cls, messages: List[tuple]) -> 'ChatPromptTemplate':
        """从消息元组创建"""
        msg_list = [{"role": role, "content": content} for role, content in messages]
        return cls(msg_list)

class FewShotPromptTemplate:
    """少样本提示模板"""
    
    def __init__(
        self,
        examples: List[Dict[str, str]],
        example_prompt: PromptTemplate,
        prefix: str = "",
        suffix: str = "",
        input_variables: List[str] = None
    ):
        self.examples = examples
        self.example_prompt = example_prompt
        self.prefix = prefix
        self.suffix = suffix
        self.input_variables = input_variables or []
    
    def format(self, **kwargs) -> str:
        """格式化"""
        parts = [self.prefix] if self.prefix else []
        
        # 添加示例
        for example in self.examples:
            parts.append(self.example_prompt.format(**example))
        
        # 添加后缀
        if self.suffix:
            parts.append(self.suffix.format(**kwargs))
        
        return "\n\n".join(parts)

# 使用示例

# 基础模板
template = PromptTemplate(
    template="请用{style}风格回答问题：{question}",
    input_variables=["style", "question"]
)
prompt = template.format(style="幽默", question="什么是 AI?")
print(f"基础模板:\n{prompt}\n")

# 聊天模板
chat_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}专家。"),
    ("user", "{question}")
])
messages = chat_template.format_messages(role="Python", question="如何学习 Python?")
print("聊天模板:")
for msg in messages:
    print(f"  {msg.role}: {msg.content}")

# 少样本模板
example_prompt = PromptTemplate(
    template="输入: {input}\n输出: {output}",
    input_variables=["input", "output"]
)

few_shot = FewShotPromptTemplate(
    examples=[
        {"input": "开心", "output": "悲伤"},
        {"input": "大", "output": "小"}
    ],
    example_prompt=example_prompt,
    prefix="给出反义词:",
    suffix="输入: {input}\n输出:",
    input_variables=["input"]
)

prompt = few_shot.format(input="高")
print(f"\n少样本模板:\n{prompt}")
```

### 3. 链式调用

#### [概念] 概念解释

链（Chain）将多个组件串联执行。支持顺序链、路由链、转换链。LangChain Expression Language (LCEL) 提供简洁的链式语法。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

class Runnable(ABC):
    """可运行组件基类"""
    
    @abstractmethod
    def invoke(self, input: Any) -> Any:
        pass
    
    def __or__(self, other: 'Runnable') -> 'RunnableSequence':
        """支持 | 操作符"""
        return RunnableSequence(steps=[self, other])

class RunnableSequence(Runnable):
    """顺序执行链"""
    
    def __init__(self, steps: List[Runnable]):
        self.steps = steps
    
    def invoke(self, input: Any) -> Any:
        """顺序执行"""
        result = input
        for step in self.steps:
            result = step.invoke(result)
        return result
    
    def __or__(self, other: Runnable) -> 'RunnableSequence':
        """链式组合"""
        return RunnableSequence(steps=self.steps + [other])

class RunnableLambda(Runnable):
    """Lambda 函数包装"""
    
    def __init__(self, func: Callable):
        self.func = func
    
    def invoke(self, input: Any) -> Any:
        return self.func(input)

class RunnableParallel(Runnable):
    """并行执行"""
    
    def __init__(self, **runnables: Runnable):
        self.runnables = runnables
    
    def invoke(self, input: Any) -> Dict[str, Any]:
        return {
            name: runnable.invoke(input)
            for name, runnable in self.runnables.items()
        }

class RunnablePassthrough(Runnable):
    """透传"""
    
    def invoke(self, input: Any) -> Any:
        return input

# 简化的 LLM 包装
class SimpleLLM(Runnable):
    """简单 LLM 包装"""
    
    def __init__(self, model: MockChatModel):
        self.model = model
    
    def invoke(self, input: Any) -> str:
        if isinstance(input, str):
            messages = [Message(role="user", content=input)]
        elif isinstance(input, list):
            messages = input
        else:
            messages = [Message(role="user", content=str(input))]
        
        return self.model.invoke(messages)

# 使用示例
model = MockChatModel("gpt-4")

# 使用 LCEL 语法构建链
chain = (
    RunnablePassthrough()
    | RunnableLambda(lambda x: f"请详细解释: {x}")
    | SimpleLLM(model)
    | RunnableLambda(lambda x: f"总结: {x[:30]}...")
)

result = chain.invoke("什么是机器学习?")
print(f"链式调用结果:\n{result}\n")

# 并行链
parallel_chain = RunnableParallel(
    summary=RunnableLambda(lambda x: f"摘要: {x[:20]}"),
    length=RunnableLambda(lambda x: len(x)),
    words=RunnableLambda(lambda x: len(x.split()))
)

result = parallel_chain.invoke("这是一个测试句子用于演示并行处理")
print(f"并行链结果:\n{result}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. RAG 系统

#### [概念] 概念解释

RAG（Retrieval-Augmented Generation）结合检索和生成，先从知识库检索相关文档，再让 LLM 基于检索结果生成回答。核心组件：文档加载器、文本分割器、向量存储、检索器。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import re

@dataclass
class Document:
    """文档"""
    content: str
    metadata: Dict[str, Any] = None

class TextSplitter:
    """文本分割器"""
    
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def split_text(self, text: str) -> List[str]:
        """分割文本"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk = text[start:end]
            
            # 尝试在句子边界分割
            last_period = chunk.rfind('。')
            if last_period > self.chunk_size // 2:
                end = start + last_period + 1
                chunk = text[start:end]
            
            chunks.append(chunk.strip())
            start = end - self.overlap
        
        return chunks
    
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """分割文档"""
        split_docs = []
        
        for doc in documents:
            chunks = self.split_text(doc.content)
            for i, chunk in enumerate(chunks):
                split_docs.append(Document(
                    content=chunk,
                    metadata={
                        **(doc.metadata or {}),
                        "chunk": i
                    }
                ))
        
        return split_docs

class SimpleVectorStore:
    """简单向量存储"""
    
    def __init__(self):
        self.documents: List[Document] = []
        self.embeddings: List[List[float]] = []
    
    def _embed(self, text: str) -> List[float]:
        """生成嵌入向量（模拟）"""
        import random
        random.seed(hash(text) % (2**32))
        return [random.gauss(0, 1) for _ in range(128)]
    
    def add_documents(self, documents: List[Document]) -> None:
        """添加文档"""
        for doc in documents:
            self.documents.append(doc)
            self.embeddings.append(self._embed(doc.content))
    
    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """相似度搜索"""
        query_embedding = self._embed(query)
        
        # 计算余弦相似度
        import math
        similarities = []
        
        for i, doc_emb in enumerate(self.embeddings):
            dot = sum(a * b for a, b in zip(query_embedding, doc_emb))
            norm1 = math.sqrt(sum(a**2 for a in query_embedding))
            norm2 = math.sqrt(sum(b**2 for b in doc_emb))
            similarity = dot / (norm1 * norm2) if norm1 and norm2 else 0
            similarities.append((i, similarity))
        
        # 排序返回 top-k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [self.documents[i] for i, _ in similarities[:k]]

class SimpleRAG:
    """简单 RAG 系统"""
    
    def __init__(self, model: MockChatModel):
        self.model = model
        self.splitter = TextSplitter(chunk_size=300, overlap=30)
        self.vectorstore = SimpleVectorStore()
    
    def add_documents(self, documents: List[Document]) -> None:
        """添加文档到知识库"""
        split_docs = self.splitter.split_documents(documents)
        self.vectorstore.add_documents(split_docs)
        print(f"已添加 {len(split_docs)} 个文档块")
    
    def retrieve(self, query: str, k: int = 3) -> List[Document]:
        """检索相关文档"""
        return self.vectorstore.similarity_search(query, k)
    
    def generate(self, query: str, context: List[Document]) -> str:
        """生成回答"""
        context_text = "\n\n".join([doc.content for doc in context])
        
        prompt = f"""基于以下上下文回答问题。如果上下文中没有相关信息，请说明。

上下文:
{context_text}

问题: {query}

回答:"""
        
        return self.model.invoke([Message(role="user", content=prompt)])
    
    def query(self, question: str) -> Dict[str, Any]:
        """查询"""
        # 1. 检索
        context = self.retrieve(question)
        
        # 2. 生成
        answer = self.generate(question, context)
        
        return {
            "question": question,
            "answer": answer,
            "sources": [
                {"content": doc.content[:100] + "...", "metadata": doc.metadata}
                for doc in context
            ]
        }

# 使用示例
rag = SimpleRAG(MockChatModel("gpt-4"))

# 添加文档
documents = [
    Document(content="Python 是一种高级编程语言，由 Guido van Rossum 于 1991 年创建。Python 以其简洁的语法和丰富的库生态系统著称。", metadata={"source": "python_intro"}),
    Document(content="机器学习是人工智能的一个分支，它使计算机系统能够从数据中学习并改进，而无需显式编程。", metadata={"source": "ml_intro"}),
    Document(content="深度学习是机器学习的子领域，使用神经网络处理复杂模式识别任务。", metadata={"source": "dl_intro"})
]

rag.add_documents(documents)

# 查询
result = rag.query("Python 是什么时候创建的？")
print(f"问题: {result['question']}")
print(f"回答: {result['answer']}")
```

### 2. Agent 构建

#### [概念] 概念解释

LangChain Agent 使用 LLM 决定调用哪些工具。核心组件：工具定义、Agent 类型、Agent Executor。支持 ReAct、OpenAI Functions、Structured Chat 等类型。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass
import json

@dataclass
class Tool:
    """工具定义"""
    name: str
    description: str
    func: Callable
    args_schema: Dict[str, Any] = None

class SimpleAgent:
    """简单 Agent"""
    
    def __init__(self, model: MockChatModel, tools: List[Tool]):
        self.model = model
        self.tools = {tool.name: tool for tool in tools}
        self.messages: List[Message] = []
    
    def _format_tools_prompt(self) -> str:
        """格式化工具描述"""
        tool_descriptions = []
        for name, tool in self.tools.items():
            desc = f"- {name}: {tool.description}"
            if tool.args_schema:
                desc += f"\n  参数: {json.dumps(tool.args_schema, ensure_ascii=False)}"
            tool_descriptions.append(desc)
        
        return "\n".join(tool_descriptions)
    
    def _parse_tool_call(self, response: str) -> Optional[Dict[str, Any]]:
        """解析工具调用"""
        # 简单解析：查找 Action: 和 Action Input:
        if "Action:" in response and "Action Input:" in response:
            lines = response.split("\n")
            action = None
            action_input = None
            
            for line in lines:
                if line.startswith("Action:"):
                    action = line.replace("Action:", "").strip()
                elif line.startswith("Action Input:"):
                    action_input = line.replace("Action Input:", "").strip()
            
            if action and action_input:
                return {
                    "tool": action,
                    "input": action_input
                }
        
        return None
    
    def run(self, query: str, max_iterations: int = 5) -> str:
        """运行 Agent"""
        system_prompt = f"""你是一个智能助手，可以使用以下工具：

{self._format_tools_prompt()}

使用以下格式：
Thought: 思考下一步
Action: 工具名称
Action Input: 工具输入
Observation: 工具输出
... (重复 Thought/Action/Action Input/Observation)
Thought: 我现在知道最终答案
Final Answer: 最终答案

开始！"""
        
        self.messages = [
            Message(role="system", content=system_prompt),
            Message(role="user", content=query)
        ]
        
        for _ in range(max_iterations):
            response = self.model.invoke(self.messages)
            self.messages.append(Message(role="assistant", content=response))
            
            # 检查是否有最终答案
            if "Final Answer:" in response:
                return response.split("Final Answer:")[-1].strip()
            
            # 解析工具调用
            tool_call = self._parse_tool_call(response)
            
            if tool_call:
                tool_name = tool_call["tool"]
                tool_input = tool_call["input"]
                
                if tool_name in self.tools:
                    result = self.tools[tool_name].func(tool_input)
                    observation = f"Observation: {result}"
                else:
                    observation = f"Observation: Unknown tool {tool_name}"
                
                self.messages.append(Message(role="user", content=observation))
            else:
                # 没有工具调用，返回响应
                return response
        
        return "达到最大迭代次数"

# 定义工具
def search_tool(query: str) -> str:
    return f"搜索结果: 关于 '{query}' 的相关信息..."

def calculate_tool(expression: str) -> str:
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except:
        return "计算错误"

tools = [
    Tool(
        name="search",
        description="搜索互联网获取信息",
        func=search_tool,
        args_schema={"query": "搜索关键词"}
    ),
    Tool(
        name="calculator",
        description="执行数学计算",
        func=calculate_tool,
        args_schema={"expression": "数学表达式"}
    )
]

# 使用示例
agent = SimpleAgent(MockChatModel("gpt-4"), tools)
result = agent.run("搜索 Python 并计算 2+2")
print(f"Agent 结果: {result}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| LCEL | LangChain 表达式语言 |
| Runnable | 可运行组件 |
| Chain | 链式调用 |
| Memory | 记忆系统 |
| Retriever | 检索器 |
| VectorStore | 向量存储 |
| Document Loader | 文档加载器 |
| Text Splitter | 文本分割器 |
| Agent Executor | Agent 执行器 |
| LangSmith | 调试监控平台 |

---

## [实战] 核心实战清单

1. 使用 LCEL 构建一个数据处理管道
2. 实现一个简单的 RAG 问答系统
3. 创建一个支持工具调用的 Agent

## [避坑] 三层避坑提醒

- **核心层误区**：过度使用链式调用，导致难以调试
- **重点层误区**：RAG 检索质量差，影响生成效果
- **扩展层建议**：使用 LangSmith 进行调试和监控，提高开发效率
