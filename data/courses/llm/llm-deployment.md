# LLM 部署与推理优化 三层深度学习教程

## [总览] 技术总览

LLM 部署涉及模型加载、推理服务、性能优化。优化技术包括量化、KV Cache、注意力优化、批处理。常用框架：vLLM、TensorRT-LLM、TGI、 llama.cpp。

本教程采用三层漏斗学习法：**核心层**聚焦模型加载、推理服务、基础优化三大基石；**重点层**深入量化和 KV Cache；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 模型加载

#### [概念] 概念解释

模型加载需要处理权重文件、设备分配、内存管理。支持不同精度（FP32/FP16/BF16）、不同格式（PyTorch/SafeTensors/GGUF）。

#### [代码] 代码示例

```python
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum
import json

class Precision(Enum):
    """精度类型"""
    FP32 = "fp32"
    FP16 = "fp16"
    BF16 = "bf16"
    INT8 = "int8"
    INT4 = "int4"

@dataclass
class ModelConfig:
    """模型配置"""
    name: str
    hidden_size: int
    num_layers: int
    num_heads: int
    vocab_size: int
    max_position_embeddings: int
    precision: Precision = Precision.FP16
    
    def get_param_count(self) -> int:
        """估算参数量"""
        # 简化估算
        embed = self.vocab_size * self.hidden_size
        attention = 4 * self.hidden_size * self.hidden_size * self.num_layers
        ffn = 8 * self.hidden_size * self.hidden_size * self.num_layers
        return embed + attention + ffn

class ModelLoader:
    """模型加载器"""
    
    def __init__(self, device: str = "cuda"):
        self.device = device
        self.loaded_models: Dict[str, Any] = {}
    
    def load_config(self, config_path: str) -> ModelConfig:
        """加载模型配置"""
        with open(config_path, 'r') as f:
            data = json.load(f)
        
        return ModelConfig(
            name=data.get("model_type", "unknown"),
            hidden_size=data.get("hidden_size", 4096),
            num_layers=data.get("num_hidden_layers", 32),
            num_heads=data.get("num_attention_heads", 32),
            vocab_size=data.get("vocab_size", 32000),
            max_position_embeddings=data.get("max_position_embeddings", 2048)
        )
    
    def estimate_memory(self, config: ModelConfig, precision: Precision) -> float:
        """估算显存需求（GB）"""
        params = config.get_param_count()
        
        bytes_per_param = {
            Precision.FP32: 4,
            Precision.FP16: 2,
            Precision.BF16: 2,
            Precision.INT8: 1,
            Precision.INT4: 0.5
        }
        
        model_memory = params * bytes_per_param[precision] / (1024**3)
        # 激活值和 KV Cache 预留
        overhead = model_memory * 0.5
        
        return model_memory + overhead
    
    def load_model(self, model_path: str, precision: Precision = Precision.FP16) -> Dict[str, Any]:
        """加载模型（模拟）"""
        config = self.load_config(f"{model_path}/config.json")
        memory = self.estimate_memory(config, precision)
        
        print(f"加载模型: {config.name}")
        print(f"参数量: {config.get_param_count() / 1e9:.2f}B")
        print(f"预估显存: {memory:.2f} GB")
        
        return {
            "config": config,
            "precision": precision,
            "memory_gb": memory
        }

# 使用示例
loader = ModelLoader()

# 模拟配置
config = ModelConfig(
    name="llama-7b",
    hidden_size=4096,
    num_layers=32,
    num_heads=32,
    vocab_size=32000,
    max_position_embeddings=4096
)

print(f"参数量: {config.get_param_count() / 1e9:.2f}B")
print(f"FP16 显存: {loader.estimate_memory(config, Precision.FP16):.2f} GB")
print(f"INT8 显存: {loader.estimate_memory(config, Precision.INT8):.2f} GB")
```

### 2. 推理服务

#### [概念] 概念解释

推理服务提供 API 接口，支持流式输出、批处理、并发请求。常用框架：FastAPI、gRPC。需要处理请求队列、超时、错误重试。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from enum import Enum
import asyncio
import time

class FinishReason(Enum):
    """结束原因"""
    STOP = "stop"
    LENGTH = "length"
    ERROR = "error"

@dataclass
class GenerationRequest:
    """生成请求"""
    prompt: str
    max_tokens: int = 100
    temperature: float = 1.0
    top_p: float = 0.9
    stream: bool = False

@dataclass
class GenerationResponse:
    """生成响应"""
    text: str
    tokens_generated: int
    finish_reason: FinishReason
    latency_ms: float

class InferenceEngine:
    """推理引擎"""
    
    def __init__(self, model: Dict[str, Any]):
        self.model = model
        self.request_queue: asyncio.Queue = asyncio.Queue()
        self.is_running = False
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 1.0
    ) -> GenerationResponse:
        """生成文本"""
        start_time = time.time()
        
        # 模拟生成
        generated = f"这是对 '{prompt[:20]}...' 的回复"
        tokens = len(generated.split())
        
        latency = (time.time() - start_time) * 1000
        
        return GenerationResponse(
            text=generated,
            tokens_generated=tokens,
            finish_reason=FinishReason.STOP,
            latency_ms=latency
        )
    
    async def generate_stream(
        self,
        prompt: str,
        max_tokens: int = 100
    ) -> AsyncGenerator[str, None]:
        """流式生成"""
        words = ["这是", "一个", "流式", "生成的", "回复"]
        
        for word in words:
            await asyncio.sleep(0.1)  # 模拟延迟
            yield word

class InferenceServer:
    """推理服务器"""
    
    def __init__(self, engine: InferenceEngine, max_concurrent: int = 10):
        self.engine = engine
        self.max_concurrent = max_concurrent
        self.active_requests = 0
        self.request_count = 0
    
    async def handle_request(self, request: GenerationRequest) -> GenerationResponse:
        """处理请求"""
        self.request_count += 1
        
        if self.active_requests >= self.max_concurrent:
            return GenerationResponse(
                text="",
                tokens_generated=0,
                finish_reason=FinishReason.ERROR,
                latency_ms=0
            )
        
        self.active_requests += 1
        try:
            response = await self.engine.generate(
                prompt=request.prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature
            )
            return response
        finally:
            self.active_requests -= 1
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            "total_requests": self.request_count,
            "active_requests": self.active_requests,
            "max_concurrent": self.max_concurrent
        }

# 使用示例
async def test_server():
    engine = InferenceEngine({"name": "test-model"})
    server = InferenceServer(engine)
    
    # 普通请求
    request = GenerationRequest(prompt="你好", max_tokens=50)
    response = await server.handle_request(request)
    print(f"响应: {response.text}")
    print(f"延迟: {response.latency_ms:.2f}ms")
    
    # 流式请求
    print("\n流式输出:")
    async for chunk in engine.generate_stream("测试"):
        print(chunk, end="", flush=True)
    print()

# asyncio.run(test_server())
```

### 3. 基础优化

#### [概念] 概念解释

基础优化包括：批处理、缓存、异步处理。批处理提高吞吐量，缓存减少重复计算，异步提高并发能力。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import time

@dataclass
class BatchRequest:
    """批处理请求"""
    prompts: List[str]
    max_tokens: int = 100

@dataclass
class BatchResponse:
    """批处理响应"""
    texts: List[str]
    total_tokens: int
    latency_ms: float

class BatchProcessor:
    """批处理器"""
    
    def __init__(self, engine: InferenceEngine, batch_size: int = 8, timeout_ms: int = 100):
        self.engine = engine
        self.batch_size = batch_size
        self.timeout_ms = timeout_ms
        self.pending: List[str] = []
        self.results: Dict[int, str] = {}
        self.request_id = 0
    
    async def add_request(self, prompt: str) -> str:
        """添加请求"""
        self.request_id += 1
        current_id = self.request_id
        
        self.pending.append(prompt)
        
        # 等待结果
        while current_id not in self.results:
            await asyncio.sleep(0.01)
        
        return self.results.pop(current_id)
    
    async def process_batch(self) -> None:
        """处理批次"""
        while True:
            if len(self.pending) >= self.batch_size:
                batch = self.pending[:self.batch_size]
                self.pending = self.pending[self.batch_size:]
                
                # 批量处理
                start_time = time.time()
                results = await self._process_batch(batch)
                latency = (time.time() - start_time) * 1000
                
                print(f"批处理 {len(batch)} 个请求，延迟 {latency:.2f}ms")
            
            await asyncio.sleep(0.01)
    
    async def _process_batch(self, prompts: List[str]) -> List[str]:
        """实际批处理"""
        results = []
        for prompt in prompts:
            response = await self.engine.generate(prompt)
            results.append(response.text)
        return results

class RequestCache:
    """请求缓存"""
    
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, str] = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
    
    def get(self, prompt: str) -> Optional[str]:
        """获取缓存"""
        key = self._hash(prompt)
        if key in self.cache:
            self.hits += 1
            return self.cache[key]
        self.misses += 1
        return None
    
    def set(self, prompt: str, response: str) -> None:
        """设置缓存"""
        if len(self.cache) >= self.max_size:
            # 简单 LRU：删除最早的
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        
        key = self._hash(prompt)
        self.cache[key] = response
    
    def _hash(self, text: str) -> str:
        """计算哈希"""
        import hashlib
        return hashlib.md5(text.encode()).hexdigest()
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计"""
        total = self.hits + self.misses
        return {
            "size": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total > 0 else 0
        }

# 使用示例
cache = RequestCache()

# 缓存测试
cache.set("你好", "你好！有什么可以帮你的？")
print(f"缓存命中: {cache.get('你好')}")
print(f"缓存未命中: {cache.get('再见')}")
print(f"统计: {cache.get_stats()}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 模型量化

#### [概念] 概念解释

量化将模型权重从高精度转换为低精度，减少显存占用和推理延迟。方法包括：训练后量化（PTQ）、量化感知训练（QAT）、GPTQ、AWQ。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import struct

@dataclass
class QuantizationConfig:
    """量化配置"""
    bits: int = 4  # 4-bit 或 8-bit
    group_size: int = 128  # 分组大小
    sym: bool = True  # 对称量化

class SimpleQuantizer:
    """简单量化器"""
    
    def __init__(self, config: QuantizationConfig):
        self.config = config
    
    def quantize_weights(self, weights: List[float]) -> Tuple[List[int], float, float]:
        """量化权重"""
        # 计算量化范围
        min_val = min(weights)
        max_val = max(weights)
        
        # 对称量化
        if self.config.sym:
            abs_max = max(abs(min_val), abs(max_val))
            scale = abs_max / (2 ** (self.config.bits - 1) - 1)
            zero_point = 0
        else:
            scale = (max_val - min_val) / (2 ** self.config.bits - 1)
            zero_point = -min_val / scale
        
        # 量化
        quantized = []
        for w in weights:
            q = round(w / scale + zero_point)
            # 裁剪到范围
            q = max(0, min(q, 2 ** self.config.bits - 1))
            quantized.append(int(q))
        
        return quantized, scale, zero_point
    
    def dequantize_weights(
        self,
        quantized: List[int],
        scale: float,
        zero_point: float
    ) -> List[float]:
        """反量化"""
        return [(q - zero_point) * scale for q in quantized]
    
    def quantize_error(self, original: List[float], quantized: List[float]) -> float:
        """计算量化误差"""
        mse = sum((o - q) ** 2 for o, q in zip(original, quantized)) / len(original)
        return mse ** 0.5  # RMSE

class GPTQQuantizer:
    """GPTQ 量化器（简化）"""
    
    def __init__(self, bits: int = 4, group_size: int = 128):
        self.bits = bits
        self.group_size = group_size
    
    def quantize_layer(
        self,
        weights: List[List[float]],
        hessian: List[List[float]]
    ) -> Dict[str, Any]:
        """量化一层权重"""
        # GPTQ 算法：逐列量化，使用 Hessian 信息更新
        # 简化实现
        quantized_weights = []
        scales = []
        
        for col in range(len(weights[0])):
            column = [weights[row][col] for row in range(len(weights))]
            
            # 简单量化
            max_val = max(abs(v) for v in column)
            scale = max_val / (2 ** (self.bits - 1) - 1)
            
            q_col = [round(v / scale) for v in column]
            quantized_weights.append(q_col)
            scales.append(scale)
        
        return {
            "quantized": quantized_weights,
            "scales": scales,
            "bits": self.bits
        }

# 使用示例
config = QuantizationConfig(bits=4)
quantizer = SimpleQuantizer(config)

# 模拟权重
weights = [0.1, -0.5, 0.8, -0.3, 0.2, -0.7, 0.4, -0.1]

quantized, scale, zp = quantizer.quantize_weights(weights)
dequantized = quantizer.dequantize_weights(quantized, scale, zp)
error = quantizer.quantize_error(weights, dequantized)

print(f"原始权重: {weights}")
print(f"量化后: {quantized}")
print(f"反量化: {[round(v, 3) for v in dequantized]}")
print(f"量化误差: {error:.4f}")
```

### 2. KV Cache 优化

#### [概念] 概念解释

KV Cache 缓存注意力计算中的 Key 和 Value，避免重复计算。优化技术包括：PagedAttention、连续批处理、前缀缓存。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

@dataclass
class KVCache:
    """KV Cache"""
    key_cache: List[List[List[float]]] = field(default_factory=list)
    value_cache: List[List[List[float]]] = field(default_factory=list)
    seq_len: int = 0
    
    def update(
        self,
        new_keys: List[List[List[float]]],
        new_values: List[List[List[float]]]
    ) -> None:
        """更新缓存"""
        if not self.key_cache:
            self.key_cache = new_keys
            self.value_cache = new_values
        else:
            for layer_idx in range(len(new_keys)):
                self.key_cache[layer_idx].extend(new_keys[layer_idx])
                self.value_cache[layer_idx].extend(new_values[layer_idx])
        
        self.seq_len = len(self.key_cache[0]) if self.key_cache else 0
    
    def get_size(self, hidden_size: int, num_layers: int, precision_bytes: int = 2) -> float:
        """获取缓存大小（GB）"""
        if not self.key_cache:
            return 0
        
        # 每个元素的大小
        elements = self.seq_len * hidden_size * num_layers * 2  # K + V
        return elements * precision_bytes / (1024 ** 3)

class PagedKVCache:
    """分页 KV Cache"""
    
    def __init__(self, block_size: int = 16, num_blocks: int = 1000):
        self.block_size = block_size
        self.num_blocks = num_blocks
        self.blocks: List[Optional[Dict[str, Any]]] = [None] * num_blocks
        self.block_tables: Dict[int, List[int]] = {}  # seq_id -> block_ids
    
    def allocate(self, seq_id: int, num_tokens: int) -> List[int]:
        """分配块"""
        num_blocks_needed = (num_tokens + self.block_size - 1) // self.block_size
        
        allocated = []
        for i, block in enumerate(self.blocks):
            if block is None:
                allocated.append(i)
                self.blocks[i] = {"seq_id": seq_id, "tokens": []}
                if len(allocated) == num_blocks_needed:
                    break
        
        self.block_tables[seq_id] = allocated
        return allocated
    
    def write(self, seq_id: int, token_idx: int, kv_data: Dict[str, Any]) -> None:
        """写入 KV 数据"""
        if seq_id not in self.block_tables:
            return
        
        block_idx = token_idx // self.block_size
        local_idx = token_idx % self.block_size
        
        if block_idx < len(self.block_tables[seq_id]):
            block_id = self.block_tables[seq_id][block_idx]
            if self.blocks[block_id]:
                self.blocks[block_id]["tokens"].append(kv_data)
    
    def read(self, seq_id: int) -> List[Dict[str, Any]]:
        """读取 KV 数据"""
        if seq_id not in self.block_tables:
            return []
        
        data = []
        for block_id in self.block_tables[seq_id]:
            if self.blocks[block_id]:
                data.extend(self.blocks[block_id]["tokens"])
        
        return data
    
    def free(self, seq_id: int) -> None:
        """释放块"""
        if seq_id in self.block_tables:
            for block_id in self.block_tables[seq_id]:
                self.blocks[block_id] = None
            del self.block_tables[seq_id]

class ContinuousBatching:
    """连续批处理"""
    
    def __init__(self, max_batch_size: int = 32):
        self.max_batch_size = max_batch_size
        self.active_sequences: Dict[int, Dict[str, Any]] = {}
    
    def add_sequence(self, seq_id: int, prompt: str) -> None:
        """添加序列"""
        if len(self.active_sequences) < self.max_batch_size:
            self.active_sequences[seq_id] = {
                "prompt": prompt,
                "generated": "",
                "is_finished": False
            }
    
    def step(self) -> Dict[int, str]:
        """执行一步生成"""
        results = {}
        
        for seq_id, seq_data in list(self.active_sequences.items()):
            if seq_data["is_finished"]:
                continue
            
            # 模拟生成一个 token
            new_token = " token"
            seq_data["generated"] += new_token
            
            # 检查是否完成
            if len(seq_data["generated"]) > 10:
                seq_data["is_finished"] = True
                results[seq_id] = seq_data["generated"]
        
        return results
    
    def remove_finished(self) -> List[int]:
        """移除完成的序列"""
        finished = [
            seq_id for seq_id, data in self.active_sequences.items()
            if data["is_finished"]
        ]
        
        for seq_id in finished:
            del self.active_sequences[seq_id]
        
        return finished

# 使用示例
paged_cache = PagedKVCache(block_size=16, num_blocks=100)

# 分配块
blocks = paged_cache.allocate(seq_id=1, num_tokens=50)
print(f"分配了 {len(blocks)} 个块")

# 写入数据
paged_cache.write(seq_id=1, token_idx=0, kv_data={"k": [1, 2], "v": [3, 4]})

# 读取数据
data = paged_cache.read(seq_id=1)
print(f"读取到 {len(data)} 条数据")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| vLLM | 高性能推理引擎 |
| TensorRT-LLM | NVIDIA 推理优化 |
| llama.cpp | CPU 推理框架 |
| GGUF | 量化模型格式 |
| AWQ | 激活感知量化 |
| GPTQ | 训练后量化 |
| PagedAttention | 分页注意力 |
| Flash Attention | 快速注意力 |
| Speculative Decoding | 推测解码 |
| Continuous Batching | 连续批处理 |

---

## [实战] 核心实战清单

1. 实现一个简单的模型加载和推理服务
2. 构建 KV Cache 系统支持增量生成
3. 实现基础的模型量化流程

## [避坑] 三层避坑提醒

- **核心层误区**：忽略显存管理，导致 OOM
- **重点层误区**：量化精度损失过大，影响模型效果
- **扩展层建议**：使用成熟的推理框架如 vLLM 或 TensorRT-LLM
