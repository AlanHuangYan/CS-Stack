# Transformer 架构原理 三层深度学习教程

## [总览] 技术总览

Transformer 是一种基于自注意力机制的神经网络架构，由 Google 在 2017 年提出。它彻底改变了自然语言处理领域，是 GPT、BERT、LLaMA 等大语言模型的基础架构。

本教程采用三层漏斗学习法：**核心层**聚焦 Self-Attention 机制、多头注意力、位置编码三大基石；**重点层**深入编码器-解码器结构和残差连接；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能理解 Transformer 的核心原理 **50% 以上**。

### 1. Self-Attention 机制

#### [概念] 概念解释

Self-Attention（自注意力）是 Transformer 的核心创新。它允许模型在处理每个位置时，关注输入序列的所有位置，从而捕获全局依赖关系。通过 Query、Key、Value 三个矩阵的计算，实现信息的动态聚合。

#### [语法] 核心语法 / 命令 / API

**Self-Attention 公式：**

```
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V
```

**核心组件：**

| 组件 | 说明 |
|------|------|
| Query (Q) | 查询向量，表示当前关注点 |
| Key (K) | 键向量，用于匹配查询 |
| Value (V) | 值向量，包含实际信息 |
| d_k | Key 的维度，用于缩放 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SelfAttention(nn.Module):
    def __init__(self, embed_dim):
        super().__init__()
        self.embed_dim = embed_dim
        
        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        
        self.scale = math.sqrt(embed_dim)
    
    def forward(self, x, mask=None):
        Q = self.query(x)
        K = self.key(x)
        V = self.value(x)
        
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        if mask is not None:
            attention_scores = attention_scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = F.softmax(attention_scores, dim=-1)
        
        output = torch.matmul(attention_weights, V)
        
        return output, attention_weights

def self_attention_manual(x, W_q, W_k, W_v):
    """
    手动实现 Self-Attention 计算过程
    
    Args:
        x: 输入张量 (batch_size, seq_len, embed_dim)
        W_q, W_k, W_v: 权重矩阵
    """
    Q = torch.matmul(x, W_q)
    K = torch.matmul(x, W_k)
    V = torch.matmul(x, W_v)
    
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    
    attention_weights = F.softmax(scores, dim=-1)
    
    output = torch.matmul(attention_weights, V)
    
    return output, attention_weights

batch_size = 2
seq_len = 4
embed_dim = 8

x = torch.randn(batch_size, seq_len, embed_dim)

self_attn = SelfAttention(embed_dim)
output, weights = self_attn(x)

print(f"输入形状: {x.shape}")
print(f"输出形状: {output.shape}")
print(f"注意力权重形状: {weights.shape}")
print(f"\n注意力权重示例 (第一个样本):")
print(weights[0])

def visualize_attention(attention_weights, tokens):
    """
    可视化注意力权重
    """
    import matplotlib.pyplot as plt
    import seaborn as sns
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        attention_weights.detach().numpy(),
        xticklabels=tokens,
        yticklabels=tokens,
        annot=True,
        fmt='.2f',
        cmap='Blues'
    )
    plt.xlabel('Key Positions')
    plt.ylabel('Query Positions')
    plt.title('Self-Attention Weights')
    plt.tight_layout()
    plt.savefig('attention_weights.png')
    plt.close()

tokens = ['The', 'cat', 'sat', 'on']
visualize_attention(weights[0], tokens)

class CausalSelfAttention(nn.Module):
    def __init__(self, embed_dim, max_seq_len=512):
        super().__init__()
        self.embed_dim = embed_dim
        
        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        
        self.register_buffer(
            'causal_mask',
            torch.tril(torch.ones(max_seq_len, max_seq_len)).view(1, 1, max_seq_len, max_seq_len)
        )
        
        self.scale = math.sqrt(embed_dim)
    
    def forward(self, x):
        batch_size, seq_len, _ = x.size()
        
        Q = self.query(x)
        K = self.key(x)
        V = self.value(x)
        
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        mask = self.causal_mask[:, :, :seq_len, :seq_len]
        attention_scores = attention_scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = F.softmax(attention_scores, dim=-1)
        
        output = torch.matmul(attention_weights, V)
        
        return output

causal_attn = CausalSelfAttention(embed_dim)
output = causal_attn(x)
print(f"\n因果注意力输出形状: {output.shape}")
```

#### [场景] 典型应用场景

1. 机器翻译：捕获源语言和目标语言的对应关系
2. 文本摘要：识别文本中的关键信息
3. 问答系统：找到问题与答案的关联

### 2. 多头注意力

#### [概念] 概念解释

Multi-Head Attention 将输入分割到多个子空间，每个头独立计算注意力，最后合并结果。这允许模型同时关注不同位置的不同表示子空间，增强了模型的表达能力。

#### [语法] 核心语法 / 命令 / API

**Multi-Head Attention 公式：**

```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O
where head_i = Attention(Q*W_Qi, K*W_Ki, V*W_Vi)
```

**关键参数：**

| 参数 | 说明 |
|------|------|
| num_heads | 注意力头数量 |
| head_dim | 每个头的维度 |
| embed_dim | 总嵌入维度 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        assert embed_dim % num_heads == 0, "embed_dim 必须能被 num_heads 整除"
        
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)
        
        self.scale = math.sqrt(self.head_dim)
    
    def forward(self, x, mask=None):
        batch_size, seq_len, _ = x.size()
        
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)
        
        Q = Q.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        K = K.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        if mask is not None:
            attention_scores = attention_scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = F.softmax(attention_scores, dim=-1)
        
        output = torch.matmul(attention_weights, V)
        
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.embed_dim)
        
        output = self.out_proj(output)
        
        return output, attention_weights

batch_size = 2
seq_len = 8
embed_dim = 64
num_heads = 8

x = torch.randn(batch_size, seq_len, embed_dim)
mha = MultiHeadAttention(embed_dim, num_heads)
output, weights = mha(x)

print(f"输入形状: {x.shape}")
print(f"输出形状: {output.shape}")
print(f"注意力权重形状: {weights.shape}")
print(f"每个头的维度: {embed_dim // num_heads}")

class CrossAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)
        
        self.scale = math.sqrt(self.head_dim)
    
    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        seq_len_q = query.size(1)
        seq_len_k = key.size(1)
        
        Q = self.q_proj(query).view(batch_size, seq_len_q, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.k_proj(key).view(batch_size, seq_len_k, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.v_proj(value).view(batch_size, seq_len_k, self.num_heads, self.head_dim).transpose(1, 2)
        
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        if mask is not None:
            attention_scores = attention_scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = F.softmax(attention_scores, dim=-1)
        
        output = torch.matmul(attention_weights, V)
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len_q, self.embed_dim)
        output = self.out_proj(output)
        
        return output, attention_weights

encoder_output = torch.randn(batch_size, 10, embed_dim)
decoder_input = torch.randn(batch_size, seq_len, embed_dim)

cross_attn = CrossAttention(embed_dim, num_heads)
cross_output, cross_weights = cross_attn(decoder_input, encoder_output, encoder_output)

print(f"\n交叉注意力:")
print(f"编码器输出形状: {encoder_output.shape}")
print(f"解码器输入形状: {decoder_input.shape}")
print(f"交叉注意力输出形状: {cross_output.shape}")

def analyze_attention_heads(attention_weights, tokens, head_idx=0):
    """
    分析特定注意力头的行为
    """
    import matplotlib.pyplot as plt
    
    head_weights = attention_weights[0, head_idx].detach().numpy()
    
    plt.figure(figsize=(10, 8))
    plt.imshow(head_weights, cmap='viridis')
    plt.colorbar()
    plt.xticks(range(len(tokens)), tokens, rotation=45)
    plt.yticks(range(len(tokens)), tokens)
    plt.title(f'Attention Head {head_idx}')
    plt.tight_layout()
    plt.savefig(f'attention_head_{head_idx}.png')
    plt.close()
    
    return head_weights

print("\n多头注意力分析:")
for h in range(min(3, num_heads)):
    avg_attention = weights[0, h].mean(dim=0).detach().numpy()
    print(f"Head {h} 平均注意力分布: {avg_attention}")
```

#### [场景] 典型应用场景

1. 并行关注：同时关注语法、语义、位置等不同特征
2. 特征提取：每个头学习不同的表示子空间
3. 长距离依赖：通过多个头捕获不同距离的依赖

### 3. 位置编码

#### [概念] 概念解释

由于 Self-Attention 没有顺序概念，位置编码为序列中的每个位置添加位置信息。Transformer 使用正弦和余弦函数生成固定的位置编码，使模型能够理解序列的顺序。

#### [语法] 核心语法 / 命令 / API

**位置编码公式：**

```
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

**关键特性：**

| 特性 | 说明 |
|------|------|
| 固定编码 | 不需要学习 |
| 外推能力 | 可处理任意长度 |
| 相对位置 | 可通过线性变换得到相对位置 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import math
import numpy as np

class PositionalEncoding(nn.Module):
    def __init__(self, embed_dim, max_seq_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)
        
        pe = torch.zeros(max_seq_len, embed_dim)
        position = torch.arange(0, max_seq_len, dtype=torch.float).unsqueeze(1)
        
        div_term = torch.exp(
            torch.arange(0, embed_dim, 2).float() * (-math.log(10000.0) / embed_dim)
        )
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        pe = pe.unsqueeze(0)
        
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        x = x + self.pe[:, :x.size(1), :]
        return self.dropout(x)

embed_dim = 64
max_seq_len = 100

pos_encoding = PositionalEncoding(embed_dim, max_seq_len)

x = torch.randn(2, 10, embed_dim)
output = pos_encoding(x)

print(f"输入形状: {x.shape}")
print(f"输出形状: {output.shape}")

def visualize_positional_encoding(pe, max_positions=50, embed_dims=16):
    """
    可视化位置编码
    """
    import matplotlib.pyplot as plt
    
    pe_matrix = pe[0, :max_positions, :embed_dims].numpy()
    
    plt.figure(figsize=(12, 6))
    plt.imshow(pe_matrix, aspect='auto', cmap='RdBu')
    plt.colorbar(label='Encoding Value')
    plt.xlabel('Embedding Dimension')
    plt.ylabel('Position')
    plt.title('Positional Encoding Visualization')
    plt.tight_layout()
    plt.savefig('positional_encoding.png')
    plt.close()

visualize_positional_encoding(pos_encoding.pe)

class LearnedPositionalEncoding(nn.Module):
    def __init__(self, embed_dim, max_seq_len=512):
        super().__init__()
        self.pos_embedding = nn.Embedding(max_seq_len, embed_dim)
    
    def forward(self, x):
        batch_size, seq_len, _ = x.size()
        positions = torch.arange(seq_len, device=x.device).unsqueeze(0).expand(batch_size, -1)
        pos_encoding = self.pos_embedding(positions)
        return x + pos_encoding

class RotaryPositionalEncoding(nn.Module):
    """
    旋转位置编码 (RoPE) - 现代LLM常用
    """
    def __init__(self, embed_dim, max_seq_len=2048, base=10000):
        super().__init__()
        self.embed_dim = embed_dim
        
        inv_freq = 1.0 / (base ** (torch.arange(0, embed_dim, 2).float() / embed_dim))
        self.register_buffer('inv_freq', inv_freq)
        
        self._build_cache(max_seq_len)
    
    def _build_cache(self, seq_len):
        t = torch.arange(seq_len, device=self.inv_freq.device, dtype=self.inv_freq.dtype)
        freqs = torch.einsum('i,j->ij', t, self.inv_freq)
        emb = torch.cat((freqs, freqs), dim=-1)
        self.register_buffer('cos_cached', emb.cos()[None, :, None, :])
        self.register_buffer('sin_cached', emb.sin()[None, :, None, :])
    
    def forward(self, x, seq_len=None):
        return x
    
    def apply_rotary_pos_emb(self, q, k, seq_len):
        def rotate_half(x):
            x1, x2 = x[..., :x.shape[-1]//2], x[..., x.shape[-1]//2:]
            return torch.cat((-x2, x1), dim=-1)
        
        cos = self.cos_cached[:, :seq_len, :, :]
        sin = self.sin_cached[:, :seq_len, :, :]
        
        q_embed = (q * cos) + (rotate_half(q) * sin)
        k_embed = (k * cos) + (rotate_half(k) * sin)
        
        return q_embed, k_embed

def analyze_position_similarity(pe):
    """
    分析位置编码的相似性
    """
    pe_matrix = pe[0].numpy()
    
    similarity = np.dot(pe_matrix, pe_matrix.T)
    
    distance = np.zeros((pe_matrix.shape[0], pe_matrix.shape[0]))
    for i in range(pe_matrix.shape[0]):
        for j in range(pe_matrix.shape[0]):
            distance[i, j] = np.linalg.norm(pe_matrix[i] - pe_matrix[j])
    
    return similarity, distance

similarity, distance = analyze_position_similarity(pos_encoding.pe)
print(f"\n位置相似性矩阵形状: {similarity.shape}")
print(f"位置距离矩阵形状: {distance.shape}")

print("\n位置编码特点:")
print("1. 每个位置有唯一的编码")
print("2. 相邻位置编码相似")
print("3. 可以外推到训练时未见过的长度")
print("4. 编码值在 [-1, 1] 范围内")
```

#### [场景] 典型应用场景

1. 序列建模：为序列添加位置信息
2. 长文本处理：支持超长序列的位置编码
3. 相对位置：通过编码捕获相对位置关系

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你将深入理解 Transformer 的完整架构。

### 1. 编码器-解码器架构

#### [概念] 概念与解决的问题

Transformer 由编码器和解码器组成。编码器将输入序列编码为连续表示，解码器根据编码器的输出生成目标序列。两者通过交叉注意力连接。

#### [语法] 核心用法

**架构组成：**

| 组件 | 说明 |
|------|------|
| Encoder | 多层编码器堆叠 |
| Decoder | 多层解码器堆叠 |
| Cross Attention | 编码器-解码器注意力 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import math

class TransformerEmbedding(nn.Module):
    def __init__(self, vocab_size, embed_dim, max_seq_len, dropout=0.1):
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)
        self.position_embedding = PositionalEncoding(embed_dim, max_seq_len, dropout)
    
    def forward(self, x):
        x = self.token_embedding(x)
        x = self.position_embedding(x)
        return x

class EncoderLayer(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        
        self.self_attention = MultiHeadAttention(embed_dim, num_heads)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.dropout1 = nn.Dropout(dropout)
        
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim)
        )
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout2 = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        attn_output, _ = self.self_attention(x, mask)
        x = self.norm1(x + self.dropout1(attn_output))
        
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout2(ff_output))
        
        return x

class DecoderLayer(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        
        self.self_attention = MultiHeadAttention(embed_dim, num_heads)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.dropout1 = nn.Dropout(dropout)
        
        self.cross_attention = CrossAttention(embed_dim, num_heads)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout2 = nn.Dropout(dropout)
        
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim)
        )
        self.norm3 = nn.LayerNorm(embed_dim)
        self.dropout3 = nn.Dropout(dropout)
    
    def forward(self, x, encoder_output, tgt_mask=None, src_mask=None):
        attn_output, _ = self.self_attention(x, tgt_mask)
        x = self.norm1(x + self.dropout1(attn_output))
        
        cross_output, _ = self.cross_attention(x, encoder_output, encoder_output, src_mask)
        x = self.norm2(x + self.dropout2(cross_output))
        
        ff_output = self.feed_forward(x)
        x = self.norm3(x + self.dropout3(ff_output))
        
        return x

class Transformer(nn.Module):
    def __init__(self, src_vocab_size, tgt_vocab_size, embed_dim, num_heads,
                 num_layers, ff_dim, max_seq_len, dropout=0.1):
        super().__init__()
        
        self.encoder_embedding = TransformerEmbedding(src_vocab_size, embed_dim, max_seq_len, dropout)
        self.decoder_embedding = TransformerEmbedding(tgt_vocab_size, embed_dim, max_seq_len, dropout)
        
        self.encoder_layers = nn.ModuleList([
            EncoderLayer(embed_dim, num_heads, ff_dim, dropout)
            for _ in range(num_layers)
        ])
        
        self.decoder_layers = nn.ModuleList([
            DecoderLayer(embed_dim, num_heads, ff_dim, dropout)
            for _ in range(num_layers)
        ])
        
        self.fc_out = nn.Linear(embed_dim, tgt_vocab_size)
        self.dropout = nn.Dropout(dropout)
    
    def encode(self, src, src_mask=None):
        x = self.encoder_embedding(src)
        for layer in self.encoder_layers:
            x = layer(x, src_mask)
        return x
    
    def decode(self, tgt, encoder_output, tgt_mask=None, src_mask=None):
        x = self.decoder_embedding(tgt)
        for layer in self.decoder_layers:
            x = layer(x, encoder_output, tgt_mask, src_mask)
        return x
    
    def forward(self, src, tgt, src_mask=None, tgt_mask=None):
        encoder_output = self.encode(src, src_mask)
        decoder_output = self.decode(tgt, encoder_output, tgt_mask, src_mask)
        output = self.fc_out(decoder_output)
        return output

src_vocab_size = 10000
tgt_vocab_size = 10000
embed_dim = 512
num_heads = 8
num_layers = 6
ff_dim = 2048
max_seq_len = 128

transformer = Transformer(
    src_vocab_size, tgt_vocab_size, embed_dim, num_heads,
    num_layers, ff_dim, max_seq_len
)

batch_size = 2
src_seq_len = 20
tgt_seq_len = 15

src = torch.randint(0, src_vocab_size, (batch_size, src_seq_len))
tgt = torch.randint(0, tgt_vocab_size, (batch_size, tgt_seq_len))

output = transformer(src, tgt)

print(f"源序列形状: {src.shape}")
print(f"目标序列形状: {tgt.shape}")
print(f"输出形状: {output.shape}")
print(f"模型参数量: {sum(p.numel() for p in transformer.parameters()):,}")
```

#### [关联] 与核心层的关联

编码器-解码器架构是 Self-Attention、Multi-Head Attention 和位置编码的完整应用。

### 2. 残差连接与层归一化

#### [概念] 概念与解决的问题

残差连接解决了深层网络的梯度消失问题，层归一化稳定了训练过程。两者结合是 Transformer 训练稳定的关键。

#### [语法] 核心用法

**Pre-Norm vs Post-Norm：**

| 方式 | 公式 | 特点 |
|------|------|------|
| Post-Norm | x + LayerNorm(Sublayer(x)) | 原始 Transformer |
| Pre-Norm | x + Sublayer(LayerNorm(x)) | 训练更稳定 |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn

class PostNormEncoderLayer(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        self.self_attention = MultiHeadAttention(embed_dim, num_heads)
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Linear(ff_dim, embed_dim)
        )
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        attn_out, _ = self.self_attention(x, mask)
        x = self.norm1(x + self.dropout(attn_out))
        
        ff_out = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_out))
        
        return x

class PreNormEncoderLayer(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        self.self_attention = MultiHeadAttention(embed_dim, num_heads)
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Linear(ff_dim, embed_dim)
        )
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        attn_out, _ = self.self_attention(self.norm1(x), mask)
        x = x + self.dropout(attn_out)
        
        ff_out = self.feed_forward(self.norm2(x))
        x = x + self.dropout(ff_out)
        
        return x

class RMSNorm(nn.Module):
    """
    Root Mean Square Layer Normalization
    现代LLM常用的归一化方式
    """
    def __init__(self, embed_dim, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(embed_dim))
        self.eps = eps
    
    def forward(self, x):
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        return x / rms * self.weight

embed_dim = 64
num_heads = 8
ff_dim = 256
batch_size = 2
seq_len = 10

x = torch.randn(batch_size, seq_len, embed_dim)

post_norm = PostNormEncoderLayer(embed_dim, num_heads, ff_dim)
pre_norm = PreNormEncoderLayer(embed_dim, num_heads, ff_dim)
rms_norm = RMSNorm(embed_dim)

print("Post-Norm 输出:", post_norm(x).shape)
print("Pre-Norm 输出:", pre_norm(x).shape)
print("RMSNorm 输出:", rms_norm(x).shape)
```

#### [关联] 与核心层的关联

残差连接和层归一化是 Transformer 层的基本组件，确保深层网络可以稳定训练。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Flash Attention | 需要高效注意力计算 |
| KV Cache | 需要加速推理 |
| Grouped Query Attention | 需要减少内存占用 |
| Sliding Window Attention | 需要处理长序列 |
| Linear Attention | 需要 O(n) 复杂度 |
| Sparse Attention | 需要稀疏注意力模式 |
| ALiBi | 需要更好的位置外推 |
| RoPE | 需要旋转位置编码 |
| SwiGLU | 需要更好的激活函数 |
| DeepNorm | 需要训练深层 Transformer |
| LayerScale | 需要稳定深层训练 |
| Mixture of Experts | 需要稀疏专家模型 |
| Parallel Attention | 需要并行注意力计算 |
| Cross-Layer Attention | 需要跨层注意力 |
| Relative Position | 需要相对位置编码 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个简单的 GPT 模型

**任务描述：**

实现一个简化版 GPT 模型，包括：
1. 因果自注意力
2. 前馈网络
3. 层归一化
4. 文本生成

**要求：**
- 使用 Pre-Norm 结构
- 支持因果掩码
- 实现文本生成

**参考实现：**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class GPTConfig:
    def __init__(self, vocab_size=50257, embed_dim=768, num_heads=12,
                 num_layers=12, ff_dim=3072, max_seq_len=1024, dropout=0.1):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.ff_dim = ff_dim
        self.max_seq_len = max_seq_len
        self.dropout = dropout

class CausalSelfAttention(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.num_heads = config.num_heads
        self.head_dim = config.embed_dim // config.num_heads
        
        self.c_attn = nn.Linear(config.embed_dim, 3 * config.embed_dim)
        self.c_proj = nn.Linear(config.embed_dim, config.embed_dim)
        
        self.register_buffer(
            'causal_mask',
            torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
            .view(1, 1, config.max_seq_len, config.max_seq_len)
        )
        
        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)
        
        self.scale = 1.0 / math.sqrt(self.head_dim)
    
    def forward(self, x):
        B, T, C = x.size()
        
        qkv = self.c_attn(x)
        q, k, v = qkv.split(C, dim=2)
        
        q = q.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.masked_fill(self.causal_mask[:, :, :T, :T] == 0, float('-inf'))
        attn = F.softmax(attn, dim=-1)
        attn = self.attn_dropout(attn)
        
        y = attn @ v
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        y = self.resid_dropout(self.c_proj(y))
        
        return y

class MLP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.c_fc = nn.Linear(config.embed_dim, config.ff_dim)
        self.gelu = nn.GELU()
        self.c_proj = nn.Linear(config.ff_dim, config.embed_dim)
        self.dropout = nn.Dropout(config.dropout)
    
    def forward(self, x):
        x = self.c_fc(x)
        x = self.gelu(x)
        x = self.c_proj(x)
        x = self.dropout(x)
        return x

class Block(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config.embed_dim)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config.embed_dim)
        self.mlp = MLP(config)
    
    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x

class GPT(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
        
        self.transformer = nn.ModuleDict(dict(
            wte = nn.Embedding(config.vocab_size, config.embed_dim),
            wpe = nn.Embedding(config.max_seq_len, config.embed_dim),
            drop = nn.Dropout(config.dropout),
            h = nn.ModuleList([Block(config) for _ in range(config.num_layers)]),
            ln_f = nn.LayerNorm(config.embed_dim),
        ))
        
        self.lm_head = nn.Linear(config.embed_dim, config.vocab_size, bias=False)
        
        self.transformer.wte.weight = self.lm_head.weight
        
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, idx, targets=None):
        B, T = idx.size()
        
        pos = torch.arange(0, T, dtype=torch.long, device=idx.device).unsqueeze(0)
        
        tok_emb = self.transformer.wte(idx)
        pos_emb = self.transformer.wpe(pos)
        x = self.transformer.drop(tok_emb + pos_emb)
        
        for block in self.transformer.h:
            x = block(x)
        
        x = self.transformer.ln_f(x)
        
        logits = self.lm_head(x)
        
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        
        return logits, loss
    
    @torch.no_grad()
    def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None):
        for _ in range(max_new_tokens):
            idx_cond = idx if idx.size(1) <= self.config.max_seq_len else idx[:, -self.config.max_seq_len:]
            
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :] / temperature
            
            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = float('-inf')
            
            probs = F.softmax(logits, dim=-1)
            
            idx_next = torch.multinomial(probs, num_samples=1)
            
            idx = torch.cat((idx, idx_next), dim=1)
        
        return idx

config = GPTConfig(vocab_size=1000, embed_dim=128, num_heads=4,
                   num_layers=4, ff_dim=512, max_seq_len=256)

model = GPT(config)
print(f"模型参数量: {sum(p.numel() for p in model.parameters()):,}")

input_ids = torch.randint(0, config.vocab_size, (1, 10))
logits, loss = model(input_ids)
print(f"输入形状: {input_ids.shape}")
print(f"输出形状: {logits.shape}")

generated = model.generate(input_ids, max_new_tokens=20, temperature=0.8, top_k=40)
print(f"生成序列长度: {generated.shape}")
```
