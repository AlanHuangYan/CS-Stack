# LLM 记忆系统 三层深度学习教程

## [总览] 技术总览

LLM 记忆系统扩展模型的上下文能力，使其能够记住历史对话、用户偏好、领域知识。记忆类型包括短期记忆（当前对话）、长期记忆（持久化存储）、工作记忆（中间状态）。良好的记忆系统是构建智能 Agent 的关键。

本教程采用三层漏斗学习法：**核心层**聚焦对话记忆、向量存储、记忆检索三大基石；**重点层**深入记忆压缩和遗忘机制；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 对话记忆

#### [概念] 概念解释

对话记忆存储历史对话信息，支持多轮对话的上下文理解。实现方式：窗口记忆（固定长度）、摘要记忆（压缩历史）、实体记忆（提取关键实体）。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

@dataclass
class Message:
    """消息"""
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

class ConversationMemory:
    """对话记忆"""
    
    def __init__(self, max_messages: int = 100):
        self.max_messages = max_messages
        self.messages: List[Message] = []
    
    def add_message(self, role: str, content: str, metadata: Dict = None):
        """添加消息"""
        message = Message(
            role=role,
            content=content,
            metadata=metadata or {}
        )
        
        self.messages.append(message)
        
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_messages(self, limit: int = None) -> List[Message]:
        """获取消息"""
        if limit:
            return self.messages[-limit:]
        return self.messages
    
    def get_context_string(self, limit: int = None) -> str:
        """获取上下文字符串"""
        messages = self.get_messages(limit)
        
        context_parts = []
        for msg in messages:
            context_parts.append(f"{msg.role}: {msg.content}")
        
        return "\n".join(context_parts)
    
    def clear(self):
        """清空记忆"""
        self.messages = []
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "metadata": msg.metadata
                }
                for msg in self.messages
            ]
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ConversationMemory':
        """从字典创建"""
        memory = cls()
        for msg_data in data.get("messages", []):
            message = Message(
                role=msg_data["role"],
                content=msg_data["content"],
                timestamp=datetime.fromisoformat(msg_data["timestamp"]),
                metadata=msg_data.get("metadata", {})
            )
            memory.messages.append(message)
        return memory

class WindowMemory:
    """窗口记忆"""
    
    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.memory = ConversationMemory(max_messages=window_size)
    
    def add(self, role: str, content: str):
        """添加消息"""
        self.memory.add_message(role, content)
    
    def get_context(self) -> str:
        """获取上下文"""
        return self.memory.get_context_string()

class SummaryMemory:
    """摘要记忆"""
    
    def __init__(self, max_messages_before_summary: int = 20):
        self.max_messages_before_summary = max_messages_before_summary
        self.raw_memory = ConversationMemory()
        self.summary = ""
    
    def add(self, role: str, content: str):
        """添加消息"""
        self.raw_memory.add_message(role, content)
        
        if len(self.raw_memory.messages) >= self.max_messages_before_summary:
            self._summarize()
    
    def _summarize(self):
        """生成摘要"""
        context = self.raw_memory.get_context_string()
        
        self.summary = f"[Summary of previous conversation: {context[:200]}...]"
        
        self.raw_memory = ConversationMemory()
    
    def get_context(self) -> str:
        """获取上下文"""
        if self.summary:
            return self.summary + "\n" + self.raw_memory.get_context_string()
        return self.raw_memory.get_context_string()

class EntityMemory:
    """实体记忆"""
    
    def __init__(self):
        self.entities: Dict[str, Dict[str, Any]] = {}
    
    def extract_and_store(self, text: str):
        """提取并存储实体"""
        import re
        
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        for email in emails:
            if "emails" not in self.entities:
                self.entities["emails"] = []
            if email not in self.entities["emails"]:
                self.entities["emails"].append(email)
        
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        phones = re.findall(phone_pattern, text)
        for phone in phones:
            if "phones" not in self.entities:
                self.entities["phones"] = []
            if phone not in self.entities["phones"]:
                self.entities["phones"].append(phone)
    
    def get_entities(self) -> Dict[str, Any]:
        """获取实体"""
        return self.entities
    
    def get_entity_context(self) -> str:
        """获取实体上下文"""
        if not self.entities:
            return ""
        
        parts = []
        for entity_type, values in self.entities.items():
            parts.append(f"{entity_type}: {', '.join(values)}")
        
        return "Known entities: " + "; ".join(parts)
```

### 2. 向量存储

#### [概念] 概念解释

向量存储将文本转换为向量并存储，支持语义相似度检索。常用数据库：Pinecone、Weaviate、Milvus、Chroma。向量存储是长期记忆的核心组件。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np

@dataclass
class Document:
    """文档"""
    id: str
    content: str
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = None

class SimpleVectorStore:
    """简单向量存储"""
    
    def __init__(self, embedding_dim: int = 768):
        self.embedding_dim = embedding_dim
        self.documents: List[Document] = []
    
    def add(self, doc: Document):
        """添加文档"""
        if doc.embedding is None:
            doc.embedding = self._generate_embedding(doc.content)
        self.documents.append(doc)
    
    def add_batch(self, docs: List[Document]):
        """批量添加"""
        for doc in docs:
            self.add(doc)
    
    def search(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.0
    ) -> List[Tuple[Document, float]]:
        """搜索相似文档"""
        query_embedding = self._generate_embedding(query)
        
        scores = []
        for doc in self.documents:
            if doc.embedding is None:
                continue
            
            similarity = self._cosine_similarity(query_embedding, doc.embedding)
            
            if similarity >= threshold:
                scores.append((doc, similarity))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return scores[:top_k]
    
    def _generate_embedding(self, text: str) -> List[float]:
        """生成嵌入向量"""
        np.random.seed(hash(text) % (2**32))
        embedding = np.random.randn(self.embedding_dim)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding.tolist()
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """计算余弦相似度"""
        arr1 = np.array(vec1)
        arr2 = np.array(vec2)
        
        dot_product = np.dot(arr1, arr2)
        norm1 = np.linalg.norm(arr1)
        norm2 = np.linalg.norm(arr2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def delete(self, doc_id: str):
        """删除文档"""
        self.documents = [d for d in self.documents if d.id != doc_id]
    
    def clear(self):
        """清空存储"""
        self.documents = []

class LongTermMemory:
    """长期记忆"""
    
    def __init__(self, vector_store: SimpleVectorStore = None):
        self.vector_store = vector_store or SimpleVectorStore()
        self.doc_counter = 0
    
    def store(self, content: str, metadata: Dict = None):
        """存储记忆"""
        doc_id = f"mem_{self.doc_counter}"
        self.doc_counter += 1
        
        doc = Document(
            id=doc_id,
            content=content,
            metadata=metadata or {}
        )
        
        self.vector_store.add(doc)
        
        return doc_id
    
    def recall(self, query: str, top_k: int = 5) -> List[Dict]:
        """回忆记忆"""
        results = self.vector_store.search(query, top_k)
        
        return [
            {
                "content": doc.content,
                "score": score,
                "metadata": doc.metadata
            }
            for doc, score in results
        ]
    
    def forget(self, doc_id: str):
        """遗忘记忆"""
        self.vector_store.delete(doc_id)

class HybridMemory:
    """混合记忆系统"""
    
    def __init__(self):
        self.short_term = WindowMemory(window_size=10)
        self.long_term = LongTermMemory()
        self.entity_memory = EntityMemory()
    
    def add_interaction(self, user_input: str, assistant_output: str):
        """添加交互"""
        self.short_term.add("user", user_input)
        self.short_term.add("assistant", assistant_output)
        
        self.entity_memory.extract_and_store(user_input)
        self.entity_memory.extract_and_store(assistant_output)
        
        if self._should_store_long_term(user_input, assistant_output):
            self.long_term.store(
                f"User: {user_input}\nAssistant: {assistant_output}",
                metadata={"timestamp": datetime.now().isoformat()}
            )
    
    def _should_store_long_term(self, user_input: str, assistant_output: str) -> bool:
        """判断是否存储到长期记忆"""
        important_keywords = ["remember", "important", "save", "note"]
        
        combined = (user_input + " " + assistant_output).lower()
        return any(kw in combined for kw in important_keywords)
    
    def get_context(self, query: str = None) -> str:
        """获取完整上下文"""
        parts = []
        
        entity_context = self.entity_memory.get_entity_context()
        if entity_context:
            parts.append(entity_context)
        
        parts.append("Recent conversation:")
        parts.append(self.short_term.get_context())
        
        if query:
            relevant_memories = self.long_term.recall(query, top_k=3)
            if relevant_memories:
                parts.append("\nRelevant past memories:")
                for mem in relevant_memories:
                    parts.append(f"- {mem['content'][:200]}...")
        
        return "\n".join(parts)
```

### 3. 记忆检索

#### [概念] 概念解释

记忆检索从存储中找到相关信息。检索策略：语义检索（向量相似度）、关键词检索（BM25）、混合检索（结合语义和关键词）。检索质量影响 Agent 的响应准确性。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Tuple, Callable
from dataclasses import dataclass
import re

@dataclass
class RetrievalResult:
    """检索结果"""
    content: str
    score: float
    source: str
    metadata: Dict[str, Any] = None

class SemanticRetriever:
    """语义检索器"""
    
    def __init__(self, vector_store: SimpleVectorStore):
        self.vector_store = vector_store
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.5
    ) -> List[RetrievalResult]:
        """语义检索"""
        results = self.vector_store.search(query, top_k, threshold)
        
        return [
            RetrievalResult(
                content=doc.content,
                score=score,
                source="semantic",
                metadata=doc.metadata
            )
            for doc, score in results
        ]

class KeywordRetriever:
    """关键词检索器"""
    
    def __init__(self, documents: List[Document]):
        self.documents = documents
        self.inverted_index = self._build_index()
    
    def _build_index(self) -> Dict[str, List[str]]:
        """构建倒排索引"""
        index = {}
        
        for doc in self.documents:
            words = self._tokenize(doc.content)
            
            for word in words:
                if word not in index:
                    index[word] = []
                if doc.id not in index[word]:
                    index[word].append(doc.id)
        
        return index
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        return words
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5
    ) -> List[RetrievalResult]:
        """关键词检索"""
        query_words = self._tokenize(query)
        
        doc_scores = {}
        for word in query_words:
            if word in self.inverted_index:
                for doc_id in self.inverted_index[word]:
                    doc_scores[doc_id] = doc_scores.get(doc_id, 0) + 1
        
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
        
        results = []
        for doc_id, score in sorted_docs[:top_k]:
            doc = next((d for d in self.documents if d.id == doc_id), None)
            if doc:
                results.append(RetrievalResult(
                    content=doc.content,
                    score=score / len(query_words),
                    source="keyword",
                    metadata=doc.metadata
                ))
        
        return results

class HybridRetriever:
    """混合检索器"""
    
    def __init__(
        self,
        semantic_retriever: SemanticRetriever,
        keyword_retriever: KeywordRetriever,
        semantic_weight: float = 0.7
    ):
        self.semantic_retriever = semantic_retriever
        self.keyword_retriever = keyword_retriever
        self.semantic_weight = semantic_weight
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5
    ) -> List[RetrievalResult]:
        """混合检索"""
        semantic_results = self.semantic_retriever.retrieve(query, top_k * 2)
        keyword_results = self.keyword_retriever.retrieve(query, top_k * 2)
        
        combined = {}
        
        for result in semantic_results:
            key = result.content[:100]
            combined[key] = {
                "content": result.content,
                "semantic_score": result.score,
                "keyword_score": 0,
                "metadata": result.metadata
            }
        
        for result in keyword_results:
            key = result.content[:100]
            if key in combined:
                combined[key]["keyword_score"] = result.score
            else:
                combined[key] = {
                    "content": result.content,
                    "semantic_score": 0,
                    "keyword_score": result.score,
                    "metadata": result.metadata
                }
        
        for key in combined:
            combined[key]["final_score"] = (
                self.semantic_weight * combined[key]["semantic_score"] +
                (1 - self.semantic_weight) * combined[key]["keyword_score"]
            )
        
        sorted_results = sorted(
            combined.values(),
            key=lambda x: x["final_score"],
            reverse=True
        )
        
        return [
            RetrievalResult(
                content=r["content"],
                score=r["final_score"],
                source="hybrid",
                metadata=r["metadata"]
            )
            for r in sorted_results[:top_k]
        ]

class MemoryRetrievalPipeline:
    """记忆检索流水线"""
    
    def __init__(self, hybrid_memory: HybridMemory):
        self.memory = hybrid_memory
    
    def retrieve_for_query(
        self,
        query: str,
        max_context_length: int = 2000
    ) -> str:
        """为查询检索上下文"""
        parts = []
        current_length = 0
        
        entity_context = self.memory.entity_memory.get_entity_context()
        if entity_context:
            parts.append(entity_context)
            current_length += len(entity_context)
        
        recent_context = self.memory.short_term.get_context()
        if current_length + len(recent_context) < max_context_length:
            parts.append("\nRecent conversation:\n" + recent_context)
            current_length += len(recent_context)
        
        relevant_memories = self.memory.long_term.recall(query, top_k=5)
        
        memory_parts = []
        for mem in relevant_memories:
            memory_text = f"- {mem['content']}"
            if current_length + len(memory_text) < max_context_length:
                memory_parts.append(memory_text)
                current_length += len(memory_text)
        
        if memory_parts:
            parts.append("\nRelevant memories:\n" + "\n".join(memory_parts))
        
        return "\n".join(parts)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 记忆压缩

#### [概念] 概念解释

记忆压缩减少存储空间和检索时间。方法：摘要压缩、关键信息提取、分层存储。压缩需保留关键信息，避免信息丢失。

#### [代码] 代码示例

```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class CompressedMemory:
    """压缩记忆"""
    summary: str
    key_points: List[str]
    entities: Dict[str, List[str]]
    timestamp: str

class MemoryCompressor:
    """记忆压缩器"""
    
    def __init__(self, max_summary_length: int = 200):
        self.max_summary_length = max_summary_length
    
    def compress(self, messages: List[Message]) -> CompressedMemory:
        """压缩记忆"""
        full_text = "\n".join([f"{m.role}: {m.content}" for m in messages])
        
        summary = self._generate_summary(full_text)
        key_points = self._extract_key_points(full_text)
        entities = self._extract_entities(full_text)
        
        return CompressedMemory(
            summary=summary,
            key_points=key_points,
            entities=entities,
            timestamp=datetime.now().isoformat()
        )
    
    def _generate_summary(self, text: str) -> str:
        """生成摘要"""
        sentences = text.split(". ")
        
        if len(sentences) <= 3:
            return text[:self.max_summary_length]
        
        important_sentences = sentences[:2] + sentences[-1:]
        summary = ". ".join(important_sentences)
        
        return summary[:self.max_summary_length]
    
    def _extract_key_points(self, text: str) -> List[str]:
        """提取关键点"""
        key_phrases = [
            "important",
            "remember",
            "note",
            "key",
            "critical",
            "must"
        ]
        
        sentences = text.split(". ")
        key_points = []
        
        for sentence in sentences:
            if any(phrase in sentence.lower() for phrase in key_phrases):
                key_points.append(sentence.strip())
        
        return key_points[:5]
    
    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """提取实体"""
        import re
        
        entities = {}
        
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if emails:
            entities["emails"] = list(set(emails))
        
        phones = re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text)
        if phones:
            entities["phones"] = list(set(phones))
        
        dates = re.findall(r'\b\d{4}-\d{2}-\d{2}\b', text)
        if dates:
            entities["dates"] = list(set(dates))
        
        return entities

class HierarchicalMemory:
    """分层记忆"""
    
    def __init__(self):
        self.levels = {
            "immediate": [],
            "short_term": [],
            "long_term": []
        }
        
        self.compressor = MemoryCompressor()
        
        self.thresholds = {
            "immediate": 5,
            "short_term": 20,
            "long_term": 100
        }
    
    def add(self, message: Message):
        """添加消息"""
        self.levels["immediate"].append(message)
        
        self._check_promotion()
    
    def _check_promotion(self):
        """检查晋升"""
        if len(self.levels["immediate"]) > self.thresholds["immediate"]:
            compressed = self.compressor.compress(self.levels["immediate"])
            self.levels["short_term"].append(compressed)
            self.levels["immediate"] = []
        
        if len(self.levels["short_term"]) > self.thresholds["short_term"]:
            all_summaries = [m.summary for m in self.levels["short_term"]]
            super_summary = self.compressor.compress([
                Message(role="system", content=" ".join(all_summaries))
            ])
            self.levels["long_term"].append(super_summary)
            self.levels["short_term"] = []
    
    def get_context(self, query: str = None) -> str:
        """获取上下文"""
        parts = []
        
        if self.levels["immediate"]:
            parts.append("Current conversation:")
            for msg in self.levels["immediate"]:
                parts.append(f"{msg.role}: {msg.content}")
        
        if self.levels["short_term"]:
            parts.append("\nRecent context:")
            for compressed in self.levels["short_term"][-3:]:
                parts.append(f"- {compressed.summary}")
        
        if self.levels["long_term"]:
            parts.append("\nHistorical context:")
            for compressed in self.levels["long_term"][-2:]:
                parts.append(f"- {compressed.summary}")
        
        return "\n".join(parts)
```

### 2. 遗忘机制

#### [概念] 概念解释

遗忘机制模拟人类记忆的遗忘过程，移除过时或不重要的记忆。策略：时间衰减、重要性评分、容量限制。合理的遗忘避免记忆过载。

#### [代码] 代码示例

```python
from typing import List, Dict, Any
from datetime import datetime, timedelta
import math

class ForgettingMechanism:
    """遗忘机制"""
    
    def __init__(
        self,
        half_life_hours: float = 24.0,
        min_importance: float = 0.1
    ):
        self.half_life_hours = half_life_hours
        self.min_importance = min_importance
    
    def compute_retention(self, timestamp: datetime, importance: float = 1.0) -> float:
        """计算保留概率"""
        age_hours = (datetime.now() - timestamp).total_seconds() / 3600
        
        decay_factor = math.exp(-age_hours * math.log(2) / self.half_life_hours)
        
        retention = importance * decay_factor
        
        return retention
    
    def should_forget(self, memory: Dict) -> bool:
        """判断是否应该遗忘"""
        timestamp = datetime.fromisoformat(memory.get("timestamp", datetime.now().isoformat()))
        importance = memory.get("importance", 1.0)
        
        retention = self.compute_retention(timestamp, importance)
        
        return retention < self.min_importance
    
    def apply_forgetting(self, memories: List[Dict]) -> List[Dict]:
        """应用遗忘"""
        return [m for m in memories if not self.should_forget(m)]

class ImportanceScorer:
    """重要性评分器"""
    
    def __init__(self):
        self.important_keywords = [
            "important", "critical", "must", "remember",
            "key", "essential", "vital", "crucial"
        ]
        
        self.unimportant_keywords = [
            "maybe", "perhaps", "possibly", "might",
            "just", "only", "minor", "trivial"
        ]
    
    def score(self, content: str) -> float:
        """计算重要性分数"""
        content_lower = content.lower()
        
        important_count = sum(1 for kw in self.important_keywords if kw in content_lower)
        unimportant_count = sum(1 for kw in self.unimportant_keywords if kw in content_lower)
        
        base_score = 0.5
        base_score += important_count * 0.1
        base_score -= unimportant_count * 0.1
        
        return max(0.0, min(1.0, base_score))

class MemoryManager:
    """记忆管理器"""
    
    def __init__(
        self,
        max_memories: int = 1000,
        forgetting_mechanism: ForgettingMechanism = None
    ):
        self.max_memories = max_memories
        self.forgetting = forgetting_mechanism or ForgettingMechanism()
        self.importance_scorer = ImportanceScorer()
        self.memories: List[Dict] = []
    
    def store(self, content: str, metadata: Dict = None):
        """存储记忆"""
        importance = self.importance_scorer.score(content)
        
        memory = {
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "importance": importance,
            "access_count": 0,
            "metadata": metadata or {}
        }
        
        self.memories.append(memory)
        
        if len(self.memories) > self.max_memories:
            self._cleanup()
    
    def _cleanup(self):
        """清理记忆"""
        self.memories = self.forgetting.apply_forgetting(self.memories)
        
        if len(self.memories) > self.max_memories:
            self.memories.sort(key=lambda m: m.get("importance", 0), reverse=True)
            self.memories = self.memories[:self.max_memories]
    
    def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        """检索记忆"""
        for memory in self.memories:
            if query.lower() in memory["content"].lower():
                memory["access_count"] = memory.get("access_count", 0) + 1
        
        relevant = [
            m for m in self.memories
            if query.lower() in m["content"].lower()
        ]
        
        relevant.sort(
            key=lambda m: m.get("importance", 0) * (1 + m.get("access_count", 0) * 0.1),
            reverse=True
        )
        
        return relevant[:top_k]
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Pinecone | 云向量数据库 |
| Weaviate | 开源向量搜索引擎 |
| Milvus | 高性能向量数据库 |
| Chroma | 嵌入式向量数据库 |
| FAISS | Facebook 向量检索库 |
| RAG | 检索增强生成 |
| Knowledge Graph | 知识图谱记忆 |
| Episodic Memory | 情景记忆 |
| Semantic Memory | 语义记忆 |
| Working Memory | 工作记忆 |
