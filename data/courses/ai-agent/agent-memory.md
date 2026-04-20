# Agent 记忆系统 三层深度学习教程

## [总览] 技术总览

记忆系统是 AI Agent 的核心组件，使其能够记住历史对话、用户偏好和任务上下文。分为短期记忆（当前会话）、长期记忆（持久化存储）、工作记忆（当前任务）。向量数据库实现语义检索，让 Agent "记住"相关信息。

本教程采用三层漏斗学习法：**核心层**聚焦记忆类型、存储机制、检索策略三大基石；**重点层**深入向量检索和记忆压缩；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 记忆类型与架构

#### [概念] 概念解释

短期记忆存储当前会话上下文，容量有限；长期记忆持久化重要信息，支持跨会话；工作记忆维护当前任务状态。三者协同工作，实现完整的记忆能力。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from collections import deque
import json

@dataclass
class MemoryItem:
    """记忆项"""
    id: str
    content: str
    role: str  # user, assistant, system
    timestamp: datetime = field(default_factory=datetime.now)
    importance: float = 0.5  # 0-1，用于筛选
    metadata: Dict[str, Any] = field(default_factory=dict)

class ShortTermMemory:
    """短期记忆：滑动窗口"""
    
    def __init__(self, max_size: int = 20):
        self.max_size = max_size
        self.memories: deque = deque(maxlen=max_size)
    
    def add(self, item: MemoryItem) -> None:
        """添加记忆"""
        self.memories.append(item)
    
    def get_all(self) -> List[MemoryItem]:
        """获取所有记忆"""
        return list(self.memories)
    
    def get_recent(self, n: int = 10) -> List[MemoryItem]:
        """获取最近 N 条"""
        return list(self.memories)[-n:]
    
    def clear(self) -> None:
        """清空记忆"""
        self.memories.clear()
    
    def to_messages(self) -> List[Dict[str, str]]:
        """转换为 LLM 消息格式"""
        return [
            {"role": m.role, "content": m.content}
            for m in self.memories
        ]

class LongTermMemory:
    """长期记忆：持久化存储"""
    
    def __init__(self, storage_path: str = "memory_store.json"):
        self.storage_path = storage_path
        self.memories: Dict[str, List[MemoryItem]] = {}
        self._load()
    
    def _load(self) -> None:
        """从文件加载"""
        try:
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for user_id, items in data.items():
                    self.memories[user_id] = [
                        MemoryItem(**item) for item in items
                    ]
        except FileNotFoundError:
            pass
    
    def _save(self) -> None:
        """保存到文件"""
        data = {}
        for user_id, items in self.memories.items():
            data[user_id] = [
                {
                    "id": m.id,
                    "content": m.content,
                    "role": m.role,
                    "timestamp": m.timestamp.isoformat(),
                    "importance": m.importance,
                    "metadata": m.metadata
                }
                for m in items
            ]
        
        with open(self.storage_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def save(self, user_id: str, item: MemoryItem) -> None:
        """保存记忆"""
        if user_id not in self.memories:
            self.memories[user_id] = []
        self.memories[user_id].append(item)
        self._save()
    
    def recall(self, user_id: str, limit: int = 50) -> List[MemoryItem]:
        """回忆记忆"""
        return self.memories.get(user_id, [])[-limit:]
    
    def search_by_importance(self, user_id: str, min_importance: float = 0.7) -> List[MemoryItem]:
        """按重要性搜索"""
        memories = self.memories.get(user_id, [])
        return [m for m in memories if m.importance >= min_importance]

class WorkingMemory:
    """工作记忆：当前任务状态"""
    
    def __init__(self):
        self.current_task: Optional[str] = None
        self.task_context: Dict[str, Any] = {}
        self.intermediate_results: List[Dict[str, Any]] = []
    
    def set_task(self, task: str) -> None:
        """设置当前任务"""
        self.current_task = task
        self.task_context = {}
        self.intermediate_results = []
    
    def update_context(self, key: str, value: Any) -> None:
        """更新上下文"""
        self.task_context[key] = value
    
    def add_result(self, result: Dict[str, Any]) -> None:
        """添加中间结果"""
        self.intermediate_results.append(result)
    
    def get_context_summary(self) -> str:
        """获取上下文摘要"""
        parts = [f"当前任务: {self.current_task}"]
        if self.task_context:
            parts.append(f"上下文: {json.dumps(self.task_context, ensure_ascii=False)}")
        if self.intermediate_results:
            parts.append(f"已完成步骤: {len(self.intermediate_results)}")
        return "\n".join(parts)

# 统一记忆管理器
class MemoryManager:
    """记忆管理器"""
    
    def __init__(self, user_id: str = "default"):
        self.user_id = user_id
        self.short_term = ShortTermMemory()
        self.long_term = LongTermMemory()
        self.working = WorkingMemory()
    
    def remember(self, role: str, content: str, importance: float = 0.5) -> None:
        """记住信息"""
        item = MemoryItem(
            id=f"{datetime.now().timestamp()}",
            content=content,
            role=role,
            importance=importance
        )
        
        # 短期记忆
        self.short_term.add(item)
        
        # 重要信息存入长期记忆
        if importance >= 0.7:
            self.long_term.save(self.user_id, item)
    
    def get_context_for_llm(self, include_long_term: bool = True) -> List[Dict[str, str]]:
        """获取 LLM 上下文"""
        messages = []
        
        # 长期记忆（重要信息）
        if include_long_term:
            important = self.long_term.search_by_importance(self.user_id)
            for m in important[-5:]:  # 最近 5 条重要记忆
                messages.append({"role": m.role, "content": m.content})
        
        # 短期记忆
        messages.extend(self.short_term.to_messages())
        
        return messages

# 使用示例
memory = MemoryManager("user_001")

# 记住对话
memory.remember("user", "我叫 Alice，喜欢编程", importance=0.8)
memory.remember("assistant", "你好 Alice！我会记住你喜欢编程")
memory.remember("user", "今天想学习 Python")

# 获取上下文
context = memory.get_context_for_llm()
for msg in context:
    print(f"{msg['role']}: {msg['content']}")
```

### 2. 向量检索记忆

#### [概念] 概念解释

向量检索通过语义相似度查找相关记忆。将文本转换为向量，使用余弦相似度或欧氏距离计算相似性。常用向量数据库包括 Pinecone、Milvus、Chroma。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np

@dataclass
class VectorMemoryItem:
    """向量记忆项"""
    id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any]

class VectorMemoryStore:
    """向量记忆存储"""
    
    def __init__(self, embedding_dim: int = 1536):
        self.embedding_dim = embedding_dim
        self.items: List[VectorMemoryItem] = []
    
    def _get_embedding(self, text: str) -> List[float]:
        """获取文本嵌入向量（模拟）"""
        # 实际应调用 OpenAI embeddings API 或本地模型
        # 这里使用简单的哈希模拟
        np.random.seed(hash(text) % (2**32))
        return np.random.randn(self.embedding_dim).tolist()
    
    def add(self, content: str, metadata: Dict[str, Any] = None) -> str:
        """添加记忆"""
        item_id = f"mem_{len(self.items)}"
        embedding = self._get_embedding(content)
        
        self.items.append(VectorMemoryItem(
            id=item_id,
            content=content,
            embedding=embedding,
            metadata=metadata or {}
        ))
        
        return item_id
    
    def search(self, query: str, top_k: int = 5) -> List[Tuple[VectorMemoryItem, float]]:
        """语义搜索"""
        query_embedding = np.array(self._get_embedding(query))
        
        results = []
        for item in self.items:
            item_embedding = np.array(item.embedding)
            
            # 余弦相似度
            similarity = np.dot(query_embedding, item_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(item_embedding)
            )
            results.append((item, similarity))
        
        # 按相似度排序
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
    
    def delete(self, item_id: str) -> bool:
        """删除记忆"""
        for i, item in enumerate(self.items):
            if item.id == item_id:
                self.items.pop(i)
                return True
        return False

# 带向量检索的记忆系统
class SemanticMemoryManager:
    """语义记忆管理器"""
    
    def __init__(self):
        self.vector_store = VectorMemoryStore()
        self.short_term = ShortTermMemory()
    
    def remember(self, content: str, role: str = "user", metadata: Dict[str, Any] = None) -> None:
        """记住信息"""
        # 短期记忆
        self.short_term.add(MemoryItem(
            id=f"stm_{datetime.now().timestamp()}",
            content=content,
            role=role
        ))
        
        # 向量记忆
        self.vector_store.add(content, {
            "role": role,
            **(metadata or {})
        })
    
    def recall_relevant(self, query: str, top_k: int = 5) -> List[str]:
        """回忆相关信息"""
        results = self.vector_store.search(query, top_k)
        return [item.content for item, score in results]
    
    def get_context_with_retrieval(self, query: str) -> str:
        """获取带检索的上下文"""
        # 获取相关记忆
        relevant = self.recall_relevant(query, top_k=3)
        
        # 获取最近对话
        recent = self.short_term.get_recent(5)
        
        context_parts = ["相关历史记忆:"]
        for i, mem in enumerate(relevant, 1):
            context_parts.append(f"{i}. {mem}")
        
        context_parts.append("\n最近对话:")
        for m in recent:
            context_parts.append(f"{m.role}: {m.content}")
        
        return "\n".join(context_parts)

# 使用示例
from datetime import datetime

semantic_memory = SemanticMemoryManager()

# 记住信息
semantic_memory.remember("用户喜欢 Python 编程", "system")
semantic_memory.remember("用户正在学习机器学习", "system")
semantic_memory.remember("用户的项目是关于图像识别的", "system")

# 检索相关记忆
relevant = semantic_memory.recall_relevant("编程语言推荐")
print("相关记忆:")
for mem in relevant:
    print(f"  - {mem}")
```

### 3. 记忆压缩与摘要

#### [概念] 概念解释

记忆压缩减少上下文长度，保留关键信息。方法包括：滑动窗口、摘要压缩、重要性过滤。LLM 可用于生成对话摘要。

#### [代码] 代码示例

```python
from typing import List, Dict, Any
import re

class MemoryCompressor:
    """记忆压缩器"""
    
    def __init__(self, max_tokens: int = 4000, overlap: int = 200):
        self.max_tokens = max_tokens
        self.overlap = overlap
    
    def estimate_tokens(self, text: str) -> int:
        """估算 token 数量"""
        # 简单估算：中文约 1.5 字/token，英文约 4 字符/token
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        other_chars = len(text) - chinese_chars
        return int(chinese_chars / 1.5 + other_chars / 4)
    
    def sliding_window(self, messages: List[Dict[str, str]], 
                       max_messages: int = 20) -> List[Dict[str, str]]:
        """滑动窗口压缩"""
        return messages[-max_messages:]
    
    def summarize(self, messages: List[Dict[str, str]]) -> str:
        """生成摘要（模拟 LLM）"""
        # 实际应调用 LLM 生成摘要
        topics = set()
        for msg in messages:
            # 简单提取关键词
            words = msg["content"].split()
            topics.update(w for w in words if len(w) > 3)
        
        return f"对话摘要：讨论了 {', '.join(list(topics)[:5])} 等话题"
    
    def compress(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """智能压缩"""
        total_tokens = sum(self.estimate_tokens(m["content"]) for m in messages)
        
        if total_tokens <= self.max_tokens:
            return messages
        
        # 策略1：滑动窗口
        compressed = self.sliding_window(messages)
        
        # 策略2：如果仍然太长，生成摘要
        remaining_tokens = sum(self.estimate_tokens(m["content"]) for m in compressed)
        if remaining_tokens > self.max_tokens:
            summary = self.summarize(messages[:-10])
            compressed = [
                {"role": "system", "content": f"[历史摘要] {summary}"}
            ] + messages[-10:]
        
        return compressed

class HierarchicalMemory:
    """分层记忆系统"""
    
    def __init__(self):
        self.raw_memories: List[Dict[str, Any]] = []
        self.summaries: List[Dict[str, Any]] = []
        self.compressor = MemoryCompressor()
    
    def add_memory(self, role: str, content: str) -> None:
        """添加记忆"""
        self.raw_memories.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # 定期生成摘要
        if len(self.raw_memories) % 10 == 0:
            self._create_summary()
    
    def _create_summary(self) -> None:
        """创建摘要"""
        recent = self.raw_memories[-10:]
        summary = self.compressor.summarize(recent)
        
        self.summaries.append({
            "content": summary,
            "range": f"记忆 {len(self.raw_memories)-10} - {len(self.raw_memories)}",
            "timestamp": datetime.now().isoformat()
        })
    
    def get_context(self, max_raw: int = 5) -> str:
        """获取上下文"""
        parts = []
        
        # 添加摘要
        if self.summaries:
            parts.append("历史摘要:")
            for s in self.summaries[-2:]:  # 最近 2 个摘要
                parts.append(f"  - {s['content']}")
        
        # 添加原始记忆
        parts.append("\n最近对话:")
        for m in self.raw_memories[-max_raw:]:
            parts.append(f"  {m['role']}: {m['content']}")
        
        return "\n".join(parts)

# 使用示例
from datetime import datetime

hierarchical = HierarchicalMemory()

# 添加多轮对话
for i in range(15):
    hierarchical.add_memory("user", f"这是第 {i+1} 条用户消息")
    hierarchical.add_memory("assistant", f"这是第 {i+1} 条助手回复")

print(hierarchical.get_context())
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 记忆更新与遗忘

#### [概念] 概念解释

记忆需要动态更新：修正错误信息、合并重复记忆、遗忘过时内容。遗忘机制防止记忆膨胀，保留重要信息。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import math

class DynamicMemory:
    """动态记忆系统"""
    
    def __init__(self, decay_rate: float = 0.1):
        self.memories: List[Dict[str, Any]] = []
        self.decay_rate = decay_rate
    
    def add(self, content: str, importance: float = 0.5) -> None:
        """添加记忆"""
        self.memories.append({
            "content": content,
            "importance": importance,
            "created_at": datetime.now(),
            "access_count": 0,
            "last_accessed": datetime.now()
        })
    
    def access(self, index: int) -> Optional[str]:
        """访问记忆"""
        if 0 <= index < len(self.memories):
            mem = self.memories[index]
            mem["access_count"] += 1
            mem["last_accessed"] = datetime.now()
            return mem["content"]
        return None
    
    def calculate_strength(self, memory: Dict[str, Any]) -> float:
        """计算记忆强度"""
        # 基于时间衰减
        age = (datetime.now() - memory["created_at"]).total_seconds() / 3600  # 小时
        time_decay = math.exp(-self.decay_rate * age)
        
        # 基于访问频率增强
        access_boost = 1 + math.log(1 + memory["access_count"]) * 0.1
        
        # 综合强度
        return memory["importance"] * time_decay * access_boost
    
    def forget(self, threshold: float = 0.1) -> int:
        """遗忘弱记忆"""
        before = len(self.memories)
        self.memories = [
            m for m in self.memories 
            if self.calculate_strength(m) >= threshold
        ]
        return before - len(self.memories)
    
    def update(self, old_content: str, new_content: str) -> bool:
        """更新记忆"""
        for mem in self.memories:
            if mem["content"] == old_content:
                mem["content"] = new_content
                mem["importance"] = min(1.0, mem["importance"] + 0.1)
                return True
        return False
    
    def merge_duplicates(self) -> int:
        """合并重复记忆"""
        seen = {}
        unique = []
        merged = 0
        
        for mem in self.memories:
            key = mem["content"][:50]  # 使用前 50 字符作为键
            if key in seen:
                # 合并重要性
                seen[key]["importance"] = max(seen[key]["importance"], mem["importance"])
                seen[key]["access_count"] += mem["access_count"]
                merged += 1
            else:
                seen[key] = mem
                unique.append(mem)
        
        self.memories = unique
        return merged

# 使用示例
dynamic_mem = DynamicMemory()

# 添加记忆
dynamic_mem.add("用户喜欢 Python", importance=0.8)
dynamic_mem.add("用户正在学习 AI", importance=0.6)
dynamic_mem.add("用户喜欢 Python", importance=0.7)  # 重复

# 访问记忆
dynamic_mem.access(0)  # 增加强度

# 遗忘
forgotten = dynamic_mem.forget(threshold=0.05)
print(f"遗忘了 {forgotten} 条记忆")

# 合并重复
merged = dynamic_mem.merge_duplicates()
print(f"合并了 {merged} 条重复记忆")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| RAG | 检索增强生成 |
| Pinecone | 云向量数据库 |
| Milvus | 开源向量数据库 |
| Chroma | 轻量向量数据库 |
| FAISS | Facebook 向量检索 |
| knowledge graph | 知识图谱记忆 |
| entity memory | 实体记忆 |
| conversation KG | 对话知识图谱 |
| memory window | 记忆窗口 |
| token budget | Token 预算 |

---

## [实战] 核心实战清单

1. 实现一个完整的分层记忆系统，支持短期、长期和工作记忆
2. 集成向量数据库，实现语义检索记忆
3. 设计记忆压缩策略，在有限 Token 内保留关键信息

## [避坑] 三层避坑提醒

- **核心层误区**：过度依赖短期记忆，忽略长期记忆的持久化
- **重点层误区**：向量检索返回过多无关记忆，降低回答质量
- **扩展层建议**：使用成熟的向量数据库如 Chroma 或 Pinecone，避免自己实现
