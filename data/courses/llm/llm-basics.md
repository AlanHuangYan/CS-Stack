# 大语言模型基础 三层深度学习教程

## [总览] 技术总览

大语言模型（LLM）是基于 Transformer 架构的超大规模语言模型，具备强大的文本理解和生成能力。核心概念包括预训练、微调、提示工程、上下文学习。掌握 LLM 基础是应用 AI 技术的前提。

本教程采用三层漏斗学习法：**核心层**聚焦 Transformer 架构、注意力机制、预训练方法三大基石；**重点层**深入模型微调和推理优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Transformer 架构

#### [概念] 概念解释

Transformer 是 LLM 的核心架构，由编码器和解码器组成。关键创新是自注意力机制，允许模型并行处理序列，捕捉长距离依赖。主流模型：GPT（仅解码器）、BERT（仅编码器）、T5（编码器-解码器）。

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    """多头注意力机制"""
    
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def scaled_dot_product_attention(self, Q, K, V, mask=None):
        attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            attn_scores = attn_scores.masked_fill(mask == 0, -1e9)
        
        attn_probs = F.softmax(attn_scores, dim=-1)
        output = torch.matmul(attn_probs, V)
        
        return output
    
    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        attn_output = self.scaled_dot_product_attention(Q, K, V, mask)
        
        attn_output = attn_output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.d_model
        )
        
        return self.W_o(attn_output)

class FeedForward(nn.Module):
    """前馈神经网络"""
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        return self.linear2(self.dropout(F.gelu(self.linear1(x))))

class TransformerBlock(nn.Module):
    """Transformer 块"""
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, num_heads)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        attn_output = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))
        
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x

class GPTModel(nn.Module):
    """GPT 模型"""
    
    def __init__(
        self,
        vocab_size: int,
        d_model: int = 768,
        num_heads: int = 12,
        num_layers: int = 12,
        d_ff: int = 3072,
        max_seq_len: int = 1024,
        dropout: float = 0.1
    ):
        super().__init__()
        
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        self.dropout = nn.Dropout(dropout)
        
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        self.norm = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
        self.lm_head.weight = self.token_embedding.weight
    
    def forward(self, input_ids, labels=None):
        batch_size, seq_len = input_ids.shape
        
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        
        x = self.token_embedding(input_ids) + self.position_embedding(positions)
        x = self.dropout(x)
        
        causal_mask = torch.tril(torch.ones(seq_len, seq_len, device=input_ids.device)).unsqueeze(0)
        
        for block in self.blocks:
            x = block(x, causal_mask)
        
        x = self.norm(x)
        logits = self.lm_head(x)
        
        loss = None
        if labels is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                labels.view(-1),
                ignore_index=-100
            )
        
        return {"logits": logits, "loss": loss}
```

### 2. 注意力机制

#### [概念] 概念解释

注意力机制让模型关注输入的不同部分。自注意力计算序列内部的关系，交叉注意力处理编码器-解码器交互。变体包括：稀疏注意力、线性注意力、Flash Attention。

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple

class FlashAttention(nn.Module):
    """Flash Attention 优化实现"""
    
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        is_causal: bool = False
    ) -> torch.Tensor:
        batch_size, seq_len, _ = query.shape
        
        Q = self.W_q(query).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        if hasattr(F, 'scaled_dot_product_attention'):
            attn_output = F.scaled_dot_product_attention(
                Q, K, V,
                attn_mask=attention_mask,
                is_causal=is_causal,
                dropout_p=0.0
            )
        else:
            attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_k ** 0.5)
            if attention_mask is not None:
                attn_scores = attn_scores + attention_mask
            attn_probs = F.softmax(attn_scores, dim=-1)
            attn_output = torch.matmul(attn_probs, V)
        
        attn_output = attn_output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        
        return self.W_o(attn_output)

class KVCache:
    """KV Cache 用于加速推理"""
    
    def __init__(self, num_layers: int, batch_size: int, num_heads: int, d_k: int, max_seq_len: int):
        self.cache = {
            'k': torch.zeros(num_layers, batch_size, num_heads, max_seq_len, d_k),
            'v': torch.zeros(num_layers, batch_size, num_heads, max_seq_len, d_k)
        }
        self.seq_len = 0
    
    def update(self, layer_idx: int, k: torch.Tensor, v: torch.Tensor):
        self.cache['k'][layer_idx, :, :, self.seq_len:self.seq_len + k.size(2), :] = k
        self.cache['v'][layer_idx, :, :, self.seq_len:self.seq_len + v.size(2), :] = v
        self.seq_len += k.size(2)
        
        return (
            self.cache['k'][layer_idx, :, :, :self.seq_len, :],
            self.cache['v'][layer_idx, :, :, :self.seq_len, :]
        )

class GroupedQueryAttention(nn.Module):
    """分组查询注意力 (GQA)"""
    
    def __init__(self, d_model: int, num_heads: int, num_kv_heads: int):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_kv_heads = num_kv_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, num_heads * self.d_k)
        self.W_k = nn.Linear(d_model, num_kv_heads * self.d_k)
        self.W_v = nn.Linear(d_model, num_kv_heads * self.d_k)
        self.W_o = nn.Linear(num_heads * self.d_k, d_model)
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        batch_size, seq_len, _ = x.shape
        
        Q = self.W_q(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch_size, seq_len, self.num_kv_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch_size, seq_len, self.num_kv_heads, self.d_k).transpose(1, 2)
        
        K = K.repeat_interleave(self.num_heads // self.num_kv_heads, dim=1)
        V = V.repeat_interleave(self.num_heads // self.num_kv_heads, dim=1)
        
        attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_k ** 0.5)
        
        if mask is not None:
            attn_scores = attn_scores.masked_fill(mask == 0, float('-inf'))
        
        attn_probs = F.softmax(attn_scores, dim=-1)
        output = torch.matmul(attn_probs, V)
        
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, -1)
        
        return self.W_o(output)
```

### 3. 预训练方法

#### [概念] 概念解释

预训练是 LLM 获取知识的关键阶段。方法包括：自回归预训练（预测下一个 token）、掩码语言建模（预测被遮蔽的 token）、对比学习。数据质量、模型规模、训练策略决定模型能力。

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Dict, List, Optional
import random

class PretrainingDataset(Dataset):
    """预训练数据集"""
    
    def __init__(
        self,
        texts: List[str],
        tokenizer,
        max_length: int = 512,
        mlm_probability: float = 0.15
    ):
        self.texts = texts
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.mlm_probability = mlm_probability
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = encoding['input_ids'].squeeze()
        attention_mask = encoding['attention_mask'].squeeze()
        
        labels = input_ids.clone()
        
        probability_matrix = torch.full(labels.shape, self.mlm_probability)
        special_tokens_mask = self.tokenizer.get_special_tokens_mask(labels.tolist(), already_has_special_tokens=True)
        probability_matrix.masked_fill_(torch.tensor(special_tokens_mask, dtype=torch.bool), value=0.0)
        
        masked_indices = torch.bernoulli(probability_matrix).bool()
        labels[~masked_indices] = -100
        
        indices_replaced = torch.bernoulli(torch.full(labels.shape, 0.8)).bool() & masked_indices
        input_ids[indices_replaced] = self.tokenizer.convert_tokens_to_ids(self.tokenizer.mask_token)
        
        indices_random = torch.bernoulli(torch.full(labels.shape, 0.5)).bool() & masked_indices & ~indices_replaced
        random_words = torch.randint(len(self.tokenizer), labels.shape, dtype=torch.long)
        input_ids[indices_random] = random_words[indices_random]
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels
        }

class CausalLMPretraining:
    """因果语言模型预训练"""
    
    def __init__(self, model, tokenizer, learning_rate: float = 1e-4):
        self.model = model
        self.tokenizer = tokenizer
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    
    def prepare_inputs(self, texts: List[str], max_length: int = 512):
        encodings = self.tokenizer(
            texts,
            max_length=max_length,
            padding=True,
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = encodings['input_ids']
        attention_mask = encodings['attention_mask']
        labels = input_ids.clone()
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels
        }
    
    def train_step(self, batch: Dict[str, torch.Tensor]):
        self.model.train()
        self.optimizer.zero_grad()
        
        outputs = self.model(
            input_ids=batch['input_ids'],
            attention_mask=batch['attention_mask'],
            labels=batch['labels']
        )
        
        loss = outputs['loss']
        loss.backward()
        
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        
        self.optimizer.step()
        
        return loss.item()

class PretrainingConfig:
    """预训练配置"""
    
    def __init__(
        self,
        vocab_size: int = 50257,
        d_model: int = 768,
        num_heads: int = 12,
        num_layers: int = 12,
        d_ff: int = 3072,
        max_seq_len: int = 1024,
        dropout: float = 0.1,
        learning_rate: float = 6e-4,
        batch_size: int = 32,
        num_epochs: int = 3,
        warmup_steps: int = 2000,
        weight_decay: float = 0.1
    ):
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.d_ff = d_ff
        self.max_seq_len = max_seq_len
        self.dropout = dropout
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.num_epochs = num_epochs
        self.warmup_steps = warmup_steps
        self.weight_decay = weight_decay

def get_cosine_schedule_with_warmup(optimizer, num_warmup_steps, num_training_steps):
    """余弦学习率调度"""
    def lr_lambda(current_step):
        if current_step < num_warmup_steps:
            return float(current_step) / float(max(1, num_warmup_steps))
        progress = float(current_step - num_warmup_steps) / float(max(1, num_training_steps - num_warmup_steps))
        return max(0.0, 0.5 * (1.0 + math.cos(math.pi * progress)))
    
    return torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 模型微调

#### [概念] 概念解释

微调将预训练模型适配到特定任务。方法包括：全参数微调、参数高效微调（LoRA、Prefix Tuning）、指令微调。微调需要高质量数据和适当的超参数。

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
from typing import Optional
from dataclasses import dataclass

@dataclass
class LoRAConfig:
    lora_r: int = 8
    lora_alpha: int = 16
    lora_dropout: float = 0.05
    target_modules: list = None

class LoRALinear(nn.Module):
    """LoRA 线性层"""
    
    def __init__(
        self,
        in_features: int,
        out_features: int,
        r: int = 8,
        alpha: int = 16,
        dropout: float = 0.05
    ):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.r = r
        self.alpha = alpha
        self.scaling = alpha / r
        
        self.weight = nn.Parameter(torch.zeros(out_features, in_features))
        self.bias = nn.Parameter(torch.zeros(out_features)) if True else None
        
        self.lora_A = nn.Parameter(torch.zeros(r, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, r))
        self.lora_dropout = nn.Dropout(dropout)
        
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        result = F.linear(x, self.weight, self.bias)
        
        lora_output = self.lora_dropout(x) @ self.lora_A.T @ self.lora_B.T
        result = result + lora_output * self.scaling
        
        return result

def apply_lora_to_model(model, config: LoRAConfig):
    """将 LoRA 应用到模型"""
    for name, module in model.named_modules():
        if isinstance(module, nn.Linear):
            if any(target in name for target in config.target_modules or ['q_proj', 'v_proj']):
                parent_name = '.'.join(name.split('.')[:-1])
                child_name = name.split('.')[-1]
                
                parent = model
                for part in parent_name.split('.'):
                    if part:
                        parent = getattr(parent, part)
                
                new_module = LoRALinear(
                    module.in_features,
                    module.out_features,
                    r=config.lora_r,
                    alpha=config.lora_alpha,
                    dropout=config.lora_dropout
                )
                
                new_module.weight.data = module.weight.data.clone()
                if module.bias is not None:
                    new_module.bias.data = module.bias.data.clone()
                
                setattr(parent, child_name, new_module)
    
    return model

class InstructionTuningDataset(Dataset):
    """指令微调数据集"""
    
    def __init__(self, data: List[Dict], tokenizer, max_length: int = 512):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        prompt = f"### Instruction:\n{item['instruction']}\n\n"
        if item.get('input'):
            prompt += f"### Input:\n{item['input']}\n\n"
        prompt += f"### Response:\n{item['output']}"
        
        encoding = self.tokenizer(
            prompt,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = encoding['input_ids'].squeeze()
        attention_mask = encoding['attention_mask'].squeeze()
        
        labels = input_ids.clone()
        response_start = prompt.find("### Response:\n") + len("### Response:\n")
        response_tokens = self.tokenizer(prompt[response_start:], add_special_tokens=False)['input_ids']
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels
        }
```

### 2. 推理优化

#### [概念] 概念解释

推理优化降低 LLM 部署成本。技术包括：量化（INT8/INT4）、KV Cache、投机解码、模型并行。优化后可在消费级硬件上运行大模型。

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
from typing import Optional, Tuple
import time

class QuantizedLinear(nn.Module):
    """量化线性层"""
    
    def __init__(self, in_features: int, out_features: int, bits: int = 8):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.bits = bits
        
        self.weight = nn.Parameter(torch.zeros(out_features, in_features))
        self.bias = nn.Parameter(torch.zeros(out_features))
        
        self.scale = nn.Parameter(torch.ones(out_features))
        self.zero_point = nn.Parameter(torch.zeros(out_features))
    
    def quantize(self, x: torch.Tensor) -> torch.Tensor:
        qmin = 0
        qmax = 2 ** self.bits - 1
        
        min_val = x.min(dim=1).values
        max_val = x.max(dim=1).values
        
        scale = (max_val - min_val) / (qmax - qmin)
        zero_point = qmin - min_val / scale
        
        self.scale.data = scale
        self.zero_point.data = zero_point
        
        quantized = torch.clamp(torch.round(x / scale.unsqueeze(1) + zero_point.unsqueeze(1)), qmin, qmax)
        
        return quantized.to(torch.int8 if self.bits == 8 else torch.int32)
    
    def dequantize(self, q: torch.Tensor) -> torch.Tensor:
        return (q.float() - self.zero_point.unsqueeze(1)) * self.scale.unsqueeze(1)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return F.linear(x, self.weight, self.bias)

class SpeculativeDecoder:
    """投机解码"""
    
    def __init__(self, target_model, draft_model, num_speculative_tokens: int = 4):
        self.target_model = target_model
        self.draft_model = draft_model
        self.num_speculative_tokens = num_speculative_tokens
    
    @torch.no_grad()
    def generate(
        self,
        input_ids: torch.Tensor,
        max_new_tokens: int,
        temperature: float = 1.0,
        top_p: float = 0.9
    ) -> torch.Tensor:
        generated = input_ids.clone()
        
        for _ in range(max_new_tokens // self.num_speculative_tokens):
            draft_outputs = self.draft_model.generate(
                generated,
                max_new_tokens=self.num_speculative_tokens,
                temperature=temperature,
                top_p=top_p
            )
            
            draft_tokens = draft_outputs[:, generated.size(1):]
            
            target_outputs = self.target_model(generated)
            target_logits = target_outputs['logits'][:, -1, :]
            
            accepted = 0
            for i in range(self.num_speculative_tokens):
                if generated.size(1) + i >= draft_outputs.size(1):
                    break
                
                draft_token = draft_tokens[:, i]
                
                target_probs = F.softmax(target_logits / temperature, dim=-1)
                draft_probs = F.softmax(
                    self.draft_model(generated)['logits'][:, -1, :] / temperature, dim=-1
                )
                
                acceptance_prob = torch.min(
                    target_probs[:, draft_token] / (draft_probs[:, draft_token] + 1e-10),
                    torch.ones(1, device=input_ids.device)
                )
                
                if torch.rand(1, device=input_ids.device) < acceptance_prob:
                    generated = torch.cat([generated, draft_token.unsqueeze(1)], dim=1)
                    accepted += 1
                else:
                    break
            
            if accepted < self.num_speculative_tokens:
                target_probs = F.softmax(target_logits / temperature, dim=-1)
                next_token = torch.multinomial(target_probs, num_samples=1)
                generated = torch.cat([generated, next_token], dim=1)
        
        return generated

class BatchedGeneration:
    """批量生成"""
    
    def __init__(self, model, tokenizer, device: str = 'cuda'):
        self.model = model
        self.tokenizer = tokenizer
        self.device = device
    
    @torch.no_grad()
    def generate_batch(
        self,
        prompts: list,
        max_new_tokens: int = 100,
        temperature: float = 1.0,
        top_p: float = 0.9,
        do_sample: bool = True
    ) -> list:
        encodings = self.tokenizer(
            prompts,
            padding=True,
            truncation=True,
            return_tensors='pt'
        ).to(self.device)
        
        input_ids = encodings['input_ids']
        attention_mask = encodings['attention_mask']
        
        generated = input_ids.clone()
        
        for _ in range(max_new_tokens):
            outputs = self.model(generated, attention_mask=attention_mask)
            logits = outputs['logits'][:, -1, :] / temperature
            
            if do_sample:
                probs = F.softmax(logits, dim=-1)
                
                if top_p < 1.0:
                    sorted_probs, sorted_indices = torch.sort(probs, descending=True)
                    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
                    sorted_indices_to_remove = cumulative_probs > top_p
                    sorted_indices_to_remove[:, 1:] = sorted_indices_to_remove[:, :-1].clone()
                    sorted_indices_to_remove[:, 0] = 0
                    
                    indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                    probs = probs.masked_fill(indices_to_remove, 0.0)
                    probs = probs / probs.sum(dim=-1, keepdim=True)
                
                next_token = torch.multinomial(probs, num_samples=1)
            else:
                next_token = torch.argmax(logits, dim=-1, keepdim=True)
            
            generated = torch.cat([generated, next_token], dim=1)
            attention_mask = torch.cat([
                attention_mask,
                torch.ones((attention_mask.size(0), 1), device=self.device)
            ], dim=1)
        
        return self.tokenizer.batch_decode(generated, skip_special_tokens=True)
```

### 3. 模型评估

#### [概念] 概念解释

LLM 评估衡量模型能力。方法包括：基准测试（MMLU、HellaSwag）、人工评估、模型评估。评估维度：知识、推理、代码、安全性。

#### [代码] 代码示例

```python
import torch
from typing import List, Dict
from dataclasses import dataclass
import json

@dataclass
class EvaluationResult:
    task: str
    accuracy: float
    samples: int
    details: Dict = None

class LLMEvaluator:
    """LLM 评估器"""
    
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
    
    def evaluate_perplexity(self, texts: List[str]) -> float:
        """计算困惑度"""
        total_loss = 0
        total_tokens = 0
        
        self.model.eval()
        
        with torch.no_grad():
            for text in texts:
                encoding = self.tokenizer(text, return_tensors='pt')
                input_ids = encoding['input_ids']
                
                outputs = self.model(input_ids, labels=input_ids)
                loss = outputs['loss']
                
                total_loss += loss.item() * input_ids.size(1)
                total_tokens += input_ids.size(1)
        
        avg_loss = total_loss / total_tokens
        perplexity = torch.exp(torch.tensor(avg_loss))
        
        return perplexity.item()
    
    def evaluate_multiple_choice(self, questions: List[Dict]) -> EvaluationResult:
        """多选题评估"""
        correct = 0
        total = len(questions)
        
        for q in questions:
            prompt = f"Question: {q['question']}\n"
            for i, choice in enumerate(q['choices']):
                prompt += f"{chr(65 + i)}. {choice}\n"
            prompt += "Answer:"
            
            encoding = self.tokenizer(prompt, return_tensors='pt')
            
            with torch.no_grad():
                outputs = self.model(encoding['input_ids'])
                logits = outputs['logits'][0, -1, :]
            
            choice_logits = []
            for i in range(len(q['choices'])):
                choice_token = self.tokenizer.encode(chr(65 + i))[-1]
                choice_logits.append(logits[choice_token].item())
            
            predicted = choice_logits.index(max(choice_logits))
            
            if predicted == q['answer']:
                correct += 1
        
        return EvaluationResult(
            task='multiple_choice',
            accuracy=correct / total,
            samples=total
        )
    
    def evaluate_generation(self, prompts: List[str], references: List[str]) -> Dict:
        """生成任务评估"""
        from collections import Counter
        
        results = {
            'bleu_scores': [],
            'exact_matches': 0
        }
        
        for prompt, reference in zip(prompts, references):
            encoding = self.tokenizer(prompt, return_tensors='pt')
            
            with torch.no_grad():
                outputs = self.model.generate(
                    encoding['input_ids'],
                    max_new_tokens=100
                )
            
            generated = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            generated = generated[len(prompt):].strip()
            
            if generated == reference:
                results['exact_matches'] += 1
            
            bleu = self._calculate_bleu(generated, reference)
            results['bleu_scores'].append(bleu)
        
        results['exact_match_rate'] = results['exact_matches'] / len(prompts)
        results['avg_bleu'] = sum(results['bleu_scores']) / len(results['bleu_scores'])
        
        return results
    
    def _calculate_bleu(self, candidate: str, reference: str, n: int = 4) -> float:
        """计算 BLEU 分数"""
        candidate_tokens = candidate.split()
        reference_tokens = reference.split()
        
        if len(candidate_tokens) == 0:
            return 0.0
        
        scores = []
        for i in range(1, n + 1):
            candidate_ngrams = list(zip(*[candidate_tokens[j:] for j in range(i)]))
            reference_ngrams = list(zip(*[reference_tokens[j:] for j in range(i)]))
            
            if len(candidate_ngrams) == 0:
                scores.append(0)
                continue
            
            candidate_counts = Counter(candidate_ngrams)
            reference_counts = Counter(reference_ngrams)
            
            matches = sum(min(candidate_counts[ng], reference_counts.get(ng, 0)) for ng in candidate_counts)
            total = len(candidate_ngrams)
            
            scores.append(matches / total)
        
        if min(scores) == 0:
            return 0.0
        
        brevity_penalty = min(1.0, len(candidate_tokens) / len(reference_tokens)) if len(reference_tokens) > 0 else 0.0
        
        return brevity_penalty * (sum(scores) / len(scores))
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| GPT Series | GPT-1/2/3/4 系列模型演进 |
| LLaMA | Meta 开源大语言模型 |
| Claude | Anthropic 对话模型 |
| Mistral | Mistral AI 开源模型 |
| Mixture of Experts | 混合专家模型架构 |
| Rotary Embedding | 旋转位置编码 RoPE |
| ALiBi | 线性偏置注意力 |
| Sliding Window Attention | 滑动窗口注意力 |
| Continuous Pretraining | 持续预训练 |
| Instruction Following | 指令遵循能力 |
