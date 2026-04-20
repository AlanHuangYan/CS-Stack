# RAG 检索增强生成 三层深度学习教程

## [总览] 技术总览

RAG（Retrieval-Augmented Generation）结合信息检索与生成模型，先从知识库检索相关文档，再让 LLM 基于检索结果生成回答。解决了 LLM 知识时效性差、幻觉问题，广泛应用于企业知识库、智能客服。

本教程采用三层漏斗学习法：**核心层**聚焦文档处理、向量检索、提示构建三大基石；**重点层**深入检索优化和生成增强；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 文档处理

#### [概念] 概念解释

文档处理是 RAG 的第一步，包括文档加载、文本分割、元数据提取。分割策略影响检索质量：固定长度、语义分割、递归分割。

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

@dataclass
class TextChunk:
    """文本块"""
    content: str
    metadata: Dict[str, Any] = None
    start_index: int = 0
    end_index: int = 0

class TextSplitter:
    """文本分割器"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split_text(self, text: str) -> List[TextChunk]:
        """分割文本"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # 尝试在句子边界分割
            if end < len(text):
                # 找最近的句子结束符
                for sep in ['。', '！', '？', '.', '!', '?', '\n']:
                    last_sep = text.rfind(sep, start, end)
                    if last_sep > start + self.chunk_size // 2:
                        end = last_sep + 1
                        break
            
            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append(TextChunk(
                    content=chunk_content,
                    start_index=start,
                    end_index=end
                ))
            
            start = end - self.chunk_overlap
        
        return chunks
    
    def split_documents(self, documents: List[Document]) -> List[TextChunk]:
        """分割文档列表"""
        all_chunks = []
        
        for doc in documents:
            chunks = self.split_text(doc.content)
            for chunk in chunks:
                chunk.metadata = {
                    **(doc.metadata or {}),
                    "chunk_index": len(all_chunks)
                }
                all_chunks.append(chunk)
        
        return all_chunks

class RecursiveTextSplitter:
    """递归文本分割器"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", "。", " ", ""]
    
    def split_text(self, text: str) -> List[TextChunk]:
        """递归分割"""
        return self._split_text_recursive(text, self.separators)
    
    def _split_text_recursive(self, text: str, separators: List[str]) -> List[TextChunk]:
        """递归分割实现"""
        if len(text) <= self.chunk_size:
            return [TextChunk(content=text)] if text.strip() else []
        
        for sep in separators:
            if sep in text:
                parts = text.split(sep)
                chunks = []
                current = ""
                
                for part in parts:
                    if len(current) + len(part) + len(sep) <= self.chunk_size:
                        current += (sep if current else "") + part
                    else:
                        if current:
                            chunks.append(TextChunk(content=current.strip()))
                        current = part
                
                if current:
                    chunks.append(TextChunk(content=current.strip()))
                
                # 检查是否需要进一步分割
                final_chunks = []
                for chunk in chunks:
                    if len(chunk.content) > self.chunk_size:
                        final_chunks.extend(
                            self._split_text_recursive(chunk.content, separators[separators.index(sep)+1:])
                        )
                    else:
                        final_chunks.append(chunk)
                
                return final_chunks
        
        # 无法分割，强制按长度切分
        return [TextChunk(content=text[i:i+self.chunk_size]) 
                for i in range(0, len(text), self.chunk_size - self.chunk_overlap)]

# 使用示例
splitter = TextSplitter(chunk_size=200, chunk_overlap=20)

doc = Document(
    content="Python 是一种高级编程语言。它由 Guido van Rossum 于 1991 年创建。Python 以其简洁的语法著称。它广泛应用于 Web 开发、数据科学、人工智能等领域。Python 拥有丰富的第三方库生态系统。",
    metadata={"source": "python_intro.txt"}
)

chunks = splitter.split_documents([doc])
print(f"分割为 {len(chunks)} 个块:")
for i, chunk in enumerate(chunks):
    print(f"  [{i+1}] {chunk.content[:50]}...")
```

### 2. 向量检索

#### [概念] 概念解释

向量检索将文本转换为高维向量，通过相似度计算找到最相关的文档。常用向量数据库：Pinecone、Milvus、Chroma、FAISS。相似度计算：余弦相似度、欧氏距离。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import math
import random

@dataclass
class VectorDocument:
    """向量文档"""
    id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any] = None

class SimpleEmbedding:
    """简单嵌入模型（模拟）"""
    
    def __init__(self, dim: int = 128):
        self.dim = dim
    
    def embed(self, text: str) -> List[float]:
        """生成嵌入向量"""
        # 模拟：实际应调用 OpenAI embeddings 或本地模型
        random.seed(hash(text) % (2**32))
        vec = [random.gauss(0, 1) for _ in range(self.dim)]
        # 归一化
        norm = math.sqrt(sum(v**2 for v in vec))
        return [v / norm for v in vec]
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """批量生成嵌入"""
        return [self.embed(t) for t in texts]

class SimpleVectorStore:
    """简单向量存储"""
    
    def __init__(self, embedding: SimpleEmbedding):
        self.embedding = embedding
        self.documents: List[VectorDocument] = []
    
    def add_documents(self, documents: List[TextChunk]) -> None:
        """添加文档"""
        for i, doc in enumerate(documents):
            self.documents.append(VectorDocument(
                id=f"doc_{i}",
                content=doc.content,
                embedding=self.embedding.embed(doc.content),
                metadata=doc.metadata
            ))
    
    def similarity_search(self, query: str, k: int = 4) -> List[Tuple[VectorDocument, float]]:
        """相似度搜索"""
        query_embedding = self.embedding.embed(query)
        
        results = []
        for doc in self.documents:
            # 余弦相似度
            similarity = self._cosine_similarity(query_embedding, doc.embedding)
            results.append((doc, similarity))
        
        # 排序返回 top-k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:k]
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """计算余弦相似度"""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x**2 for x in a))
        norm_b = math.sqrt(sum(y**2 for y in b))
        return dot / (norm_a * norm_b) if norm_a and norm_b else 0

class HybridRetriever:
    """混合检索器"""
    
    def __init__(self, vector_store: SimpleVectorStore):
        self.vector_store = vector_store
        self.documents = vector_store.documents
    
    def keyword_search(self, query: str, k: int = 4) -> List[Tuple[VectorDocument, float]]:
        """关键词搜索"""
        query_words = set(query.lower().split())
        results = []
        
        for doc in self.documents:
            doc_words = set(doc.content.lower().split())
            overlap = len(query_words & doc_words)
            score = overlap / max(len(query_words), 1)
            results.append((doc, score))
        
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:k]
    
    def hybrid_search(self, query: str, k: int = 4, alpha: float = 0.5) -> List[Tuple[VectorDocument, float]]:
        """混合搜索"""
        vector_results = self.vector_store.similarity_search(query, k * 2)
        keyword_results = self.keyword_search(query, k * 2)
        
        # 合并分数
        scores = {}
        for doc, score in vector_results:
            scores[doc.id] = scores.get(doc.id, 0) + alpha * score
        for doc, score in keyword_results:
            scores[doc.id] = scores.get(doc.id, 0) + (1 - alpha) * score
        
        # 排序
        doc_map = {doc.id: doc for doc in self.documents}
        results = [(doc_map[doc_id], score) for doc_id, score in scores.items()]
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results[:k]

# 使用示例
embedding = SimpleEmbedding()
vector_store = SimpleVectorStore(embedding)

# 添加文档
docs = [
    TextChunk(content="Python 是一种高级编程语言"),
    TextChunk(content="机器学习是人工智能的分支"),
    TextChunk(content="深度学习使用神经网络"),
    TextChunk(content="Python 广泛应用于数据科学")
]
vector_store.add_documents(docs)

# 检索
results = vector_store.similarity_search("Python 编程", k=2)
print("向量检索结果:")
for doc, score in results:
    print(f"  [{score:.3f}] {doc.content}")
```

### 3. 提示构建

#### [概念] 概念解释

提示构建将检索结果与用户问题组合，引导 LLM 基于上下文生成回答。关键要素：系统提示、上下文注入、问题重述、回答约束。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class RAGPrompt:
    """RAG 提示模板"""
    system_template: str
    context_template: str
    question_template: str

class RAGPromptBuilder:
    """RAG 提示构建器"""
    
    def __init__(self):
        self.default_prompt = RAGPrompt(
            system_template="""你是一个专业的问答助手。请基于提供的上下文回答用户问题。
如果上下文中没有相关信息，请明确说明"根据提供的上下文，我无法回答这个问题"。
回答要准确、简洁、有条理。""",
            context_template="""上下文：
{context}

问题：{question}

请基于上下文回答问题：""",
            question_template="{question}"
        )
    
    def build_prompt(
        self,
        question: str,
        context_docs: List[Any],
        max_context_length: int = 2000
    ) -> str:
        """构建提示"""
        # 构建上下文
        context_parts = []
        current_length = 0
        
        for i, doc in enumerate(context_docs):
            content = doc.content if hasattr(doc, 'content') else str(doc)
            if current_length + len(content) > max_context_length:
                break
            context_parts.append(f"[文档 {i+1}]\n{content}")
            current_length += len(content)
        
        context = "\n\n".join(context_parts)
        
        # 组合提示
        prompt = f"""{self.default_prompt.system_template}

{self.default_prompt.context_template.format(context=context, question=question)}"""
        
        return prompt
    
    def build_messages(
        self,
        question: str,
        context_docs: List[Any],
        chat_history: List[Dict[str, str]] = None
    ) -> List[Dict[str, str]]:
        """构建消息列表"""
        messages = [
            {"role": "system", "content": self.default_prompt.system_template}
        ]
        
        # 添加历史对话
        if chat_history:
            messages.extend(chat_history)
        
        # 构建用户消息
        context_parts = []
        for i, doc in enumerate(context_docs[:5]):
            content = doc.content if hasattr(doc, 'content') else str(doc)
            context_parts.append(f"[参考 {i+1}] {content}")
        
        context = "\n".join(context_parts)
        user_message = f"""参考信息：
{context}

问题：{question}"""
        
        messages.append({"role": "user", "content": user_message})
        
        return messages

# 使用示例
builder = RAGPromptBuilder()

# 模拟检索结果
class MockDoc:
    def __init__(self, content):
        self.content = content

context_docs = [
    MockDoc("Python 是一种高级编程语言，由 Guido van Rossum 创建。"),
    MockDoc("Python 广泛应用于 Web 开发、数据科学和人工智能领域。")
]

prompt = builder.build_prompt("Python 是什么？", context_docs)
print("构建的提示:")
print(prompt)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 检索优化

#### [概念] 概念解释

检索优化提高召回率和准确率。方法包括：查询重写、多查询扩展、重排序、元数据过滤。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Tuple
import re

class QueryRewriter:
    """查询重写器"""
    
    def rewrite(self, query: str) -> List[str]:
        """重写查询，生成多个变体"""
        variants = [query]
        
        # 1. 提取关键词
        keywords = re.findall(r'\b\w+\b', query.lower())
        if keywords:
            variants.append(" ".join(keywords[:5]))
        
        # 2. 同义词扩展（简化版）
        synonyms = {
            "python": ["python语言", "py"],
            "学习": "教程",
            "教程": "学习",
            "入门": "基础",
            "基础": "入门"
        }
        
        for word, syns in synonyms.items():
            if word in query.lower():
                syn_list = syns if isinstance(syns, list) else [syns]
                for syn in syn_list:
                    variants.append(query.lower().replace(word, syn))
        
        return list(set(variants))

class Reranker:
    """重排序器"""
    
    def __init__(self):
        self.stop_words = {"的", "是", "在", "和", "了", "有", "不", "这", "个"}
    
    def rerank(
        self,
        query: str,
        documents: List[Tuple[Any, float]],
        top_k: int = 5
    ) -> List[Tuple[Any, float]]:
        """重排序"""
        query_terms = set(query.lower().split()) - self.stop_words
        
        reranked = []
        for doc, score in documents:
            content = doc.content.lower()
            
            # 计算关键词覆盖度
            doc_terms = set(content.split()) - self.stop_words
            coverage = len(query_terms & doc_terms) / max(len(query_terms), 1)
            
            # 计算位置分数
            position_score = 0
            for term in query_terms:
                pos = content.find(term)
                if pos >= 0:
                    position_score += 1 / (pos + 1)
            
            # 综合分数
            final_score = 0.5 * score + 0.3 * coverage + 0.2 * position_score
            reranked.append((doc, final_score))
        
        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked[:top_k]

class MetadataFilter:
    """元数据过滤器"""
    
    def filter(
        self,
        documents: List[Any],
        filters: Dict[str, Any]
    ) -> List[Any]:
        """过滤文档"""
        filtered = []
        
        for doc in documents:
            metadata = doc.metadata or {}
            match = True
            
            for key, value in filters.items():
                if key not in metadata:
                    match = False
                    break
                
                if isinstance(value, list):
                    if metadata[key] not in value:
                        match = False
                        break
                elif metadata[key] != value:
                    match = False
                    break
            
            if match:
                filtered.append(doc)
        
        return filtered

# 使用示例
rewriter = QueryRewriter()
queries = rewriter.rewrite("Python 入门教程")
print(f"查询变体: {queries}")

reranker = Reranker()
docs_with_scores = [
    (MockDoc("Python 入门教程 适合初学者"), 0.8),
    (MockDoc("Python 高级编程指南"), 0.7),
    (MockDoc("Python 入门到精通"), 0.75)
]
reranked = reranker.rerank("Python 入门", docs_with_scores)
print("\n重排序结果:")
for doc, score in reranked:
    print(f"  [{score:.3f}] {doc.content}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| Chunking | 文档分块策略 |
| Embedding | 文本嵌入模型 |
| Vector DB | 向量数据库 |
| BM25 | 传统检索算法 |
| Reranking | 重排序优化 |
| Query Expansion | 查询扩展 |
| Hybrid Search | 混合检索 |
| Multi-hop | 多跳检索 |
| GraphRAG | 图增强检索 |
| ColBERT | 晚交互模型 |

---

## [实战] 核心实战清单

1. 实现一个完整的文档处理和分割流程
2. 构建向量检索系统，支持相似度搜索
3. 开发一个端到端的 RAG 问答系统

## [避坑] 三层避坑提醒

- **核心层误区**：分块过大或过小，影响检索效果
- **重点层误区**：忽略检索质量评估，无法持续优化
- **扩展层建议**：使用成熟的向量数据库如 Chroma 或 Pinecone
