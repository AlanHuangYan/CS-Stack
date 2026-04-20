# 图像生成 三层深度学习教程

## [总览] 技术总览

图像生成是使用深度学习模型从随机噪声或条件输入合成新图像的技术。主流方法包括 GAN（生成对抗网络）、VAE（变分自编码器）、Diffusion Model（扩散模型）。图像生成广泛应用于艺术创作、数据增强、图像编辑等领域。

本教程采用三层漏斗学习法：**核心层**聚焦生成模型原理、GAN 架构、训练技巧三大基石；**重点层**深入 Diffusion 模型和条件生成；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 生成模型原理

#### [概念] 概念解释

生成模型学习数据分布 P(X)，并能从学习到的分布中采样生成新样本。与判别模型不同，生成模型关注"数据是什么样的"而非"数据属于哪类"。

#### [语法] 核心语法 / 命令 / API

| 模型类型 | 原理 | 代表 |
|----------|------|------|
| GAN | 对抗训练 | StyleGAN, BigGAN |
| VAE | 变分推断 | VQ-VAE, NVAE |
| Diffusion | 逐步去噪 | DDPM, Stable Diffusion |
| Flow | 可逆变换 | Glow, RealNVP |

#### [代码] 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple

class Generator(nn.Module):
    """基础生成器"""
    
    def __init__(self, latent_dim: int, img_channels: int = 3, img_size: int = 64):
        super().__init__()
        self.init_size = img_size // 16
        
        self.fc = nn.Sequential(
            nn.Linear(latent_dim, 512 * self.init_size ** 2),
            nn.BatchNorm1d(512 * self.init_size ** 2),
            nn.LeakyReLU(0.2)
        )
        
        self.conv_blocks = nn.Sequential(
            nn.Upsample(scale_factor=2),
            nn.Conv2d(512, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2),
            
            nn.Upsample(scale_factor=2),
            nn.Conv2d(256, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),
            
            nn.Upsample(scale_factor=2),
            nn.Conv2d(128, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2),
            
            nn.Upsample(scale_factor=2),
            nn.Conv2d(64, img_channels, 3, padding=1),
            nn.Tanh()
        )
    
    def forward(self, z: torch.Tensor) -> torch.Tensor:
        out = self.fc(z)
        out = out.view(out.size(0), 512, self.init_size, self.init_size)
        img = self.conv_blocks(out)
        return img

class Discriminator(nn.Module):
    """基础判别器"""
    
    def __init__(self, img_channels: int = 3, img_size: int = 64):
        super().__init__()
        
        def discriminator_block(in_features, out_features, bn=True):
            layers = [nn.Conv2d(in_features, out_features, 3, 2, 1)]
            if bn:
                layers.append(nn.BatchNorm2d(out_features))
            layers.append(nn.LeakyReLU(0.2))
            return layers
        
        self.model = nn.Sequential(
            *discriminator_block(img_channels, 64, bn=False),
            *discriminator_block(64, 128),
            *discriminator_block(128, 256),
            *discriminator_block(256, 512),
        )
        
        ds_size = img_size // 16
        self.fc = nn.Sequential(
            nn.Linear(512 * ds_size ** 2, 1),
            nn.Sigmoid()
        )
    
    def forward(self, img: torch.Tensor) -> torch.Tensor:
        out = self.model(img)
        out = out.view(out.size(0), -1)
        validity = self.fc(out)
        return validity

# 使用示例
latent_dim = 100
generator = Generator(latent_dim)
discriminator = Discriminator()

z = torch.randn(16, latent_dim)
fake_images = generator(z)
validity = discriminator(fake_images)

print(f"Generated images shape: {fake_images.shape}")
print(f"Discriminator output shape: {validity.shape}")
```

#### [场景] 典型应用场景

- 图像合成
- 数据增强
- 艺术创作

### 2. GAN 架构

#### [概念] 概念解释

GAN 由生成器 G 和判别器 D 组成，通过对抗训练相互博弈。G 学习生成逼真图像欺骗 D，D 学习区分真假图像。训练目标是达到纳什均衡。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision.utils import save_image

class GAN:
    """GAN 训练器"""
    
    def __init__(self, generator: nn.Module, discriminator: nn.Module, 
                 latent_dim: int, device: str = 'cuda'):
        self.generator = generator.to(device)
        self.discriminator = discriminator.to(device)
        self.latent_dim = latent_dim
        self.device = device
        
        # 损失函数
        self.adversarial_loss = nn.BCELoss()
        
        # 优化器
        self.optimizer_G = optim.Adam(generator.parameters(), lr=0.0002, betas=(0.5, 0.999))
        self.optimizer_D = optim.Adam(discriminator.parameters(), lr=0.0002, betas=(0.5, 0.999))
    
    def train_step(self, real_images: torch.Tensor) -> dict:
        batch_size = real_images.size(0)
        
        # 真假标签
        real_labels = torch.ones(batch_size, 1, device=self.device)
        fake_labels = torch.zeros(batch_size, 1, device=self.device)
        
        # ---------------------
        #  训练判别器
        # ---------------------
        self.optimizer_D.zero_grad()
        
        # 真实图像损失
        real_validity = self.discriminator(real_images)
        d_real_loss = self.adversarial_loss(real_validity, real_labels)
        
        # 生成图像损失
        z = torch.randn(batch_size, self.latent_dim, device=self.device)
        fake_images = self.generator(z)
        fake_validity = self.discriminator(fake_images.detach())
        d_fake_loss = self.adversarial_loss(fake_validity, fake_labels)
        
        d_loss = (d_real_loss + d_fake_loss) / 2
        d_loss.backward()
        self.optimizer_D.step()
        
        # ---------------------
        #  训练生成器
        # ---------------------
        self.optimizer_G.zero_grad()
        
        z = torch.randn(batch_size, self.latent_dim, device=self.device)
        fake_images = self.generator(z)
        fake_validity = self.discriminator(fake_images)
        g_loss = self.adversarial_loss(fake_validity, real_labels)
        
        g_loss.backward()
        self.optimizer_G.step()
        
        return {
            'd_loss': d_loss.item(),
            'g_loss': g_loss.item()
        }
    
    def generate(self, num_samples: int) -> torch.Tensor:
        """生成样本"""
        self.generator.eval()
        with torch.no_grad():
            z = torch.randn(num_samples, self.latent_dim, device=self.device)
            images = self.generator(z)
        return images

# DCGAN 架构
class DCGANGenerator(nn.Module):
    """DCGAN 生成器"""
    
    def __init__(self, latent_dim: int, ngf: int = 64, nc: int = 3):
        super().__init__()
        self.main = nn.Sequential(
            # 输入: (latent_dim, 1, 1)
            nn.ConvTranspose2d(latent_dim, ngf * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 8),
            nn.ReLU(True),
            # (ngf*8, 4, 4)
            
            nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            # (ngf*4, 8, 8)
            
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            # (ngf*2, 16, 16)
            
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            # (ngf, 32, 32)
            
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh()
            # (nc, 64, 64)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.main(x.unsqueeze(-1).unsqueeze(-1))

# 训练示例
def train_gan():
    # 初始化
    latent_dim = 100
    generator = DCGANGenerator(latent_dim)
    discriminator = DCGANDiscriminator()
    
    gan = GAN(generator, discriminator, latent_dim)
    
    # 训练循环
    for epoch in range(num_epochs):
        for batch_idx, (real_images, _) in enumerate(dataloader):
            real_images = real_images.to(device)
            
            losses = gan.train_step(real_images)
            
            if batch_idx % 100 == 0:
                print(f"Epoch [{epoch}/{num_epochs}] "
                      f"D_loss: {losses['d_loss']:.4f} "
                      f"G_loss: {losses['g_loss']:.4f}")
        
        # 保存生成样本
        if epoch % 10 == 0:
            samples = gan.generate(16)
            save_image(samples, f"samples/epoch_{epoch}.png", normalize=True)
```

#### [场景] 典型应用场景

- 人脸生成
- 图像超分辨率
- 图像修复

### 3. 训练技巧

#### [概念] 概念与解决的问题

GAN 训练不稳定，容易出现模式崩溃、梯度消失等问题。常用技巧包括谱归一化、梯度惩罚、特征匹配等。

#### [语法] 核心语法 / 命令 / API

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 谱归一化
class SpectralNorm(nn.Module):
    """谱归一化"""
    
    def __init__(self, module: nn.Module, name: str = 'weight', power_iterations: int = 1):
        super().__init__()
        self.module = module
        self.name = name
        self.power_iterations = power_iterations
    
    def forward(self, x):
        return self.module(x)

# 使用 PyTorch 内置谱归一化
def apply_spectral_norm(module: nn.Module):
    """应用谱归一化"""
    return nn.utils.spectral_norm(module)

# 梯度惩罚 (WGAN-GP)
def gradient_penalty(discriminator, real_data, fake_data, device):
    """计算梯度惩罚"""
    batch_size = real_data.size(0)
    
    # 随机插值
    alpha = torch.rand(batch_size, 1, 1, 1, device=device)
    interpolates = alpha * real_data + (1 - alpha) * fake_data
    interpolates.requires_grad_(True)
    
    # 计算判别器输出
    disc_interpolates = discriminator(interpolates)
    
    # 计算梯度
    gradients = torch.autograd.grad(
        outputs=disc_interpolates,
        inputs=interpolates,
        grad_outputs=torch.ones_like(disc_interpolates),
        create_graph=True,
        retain_graph=True
    )[0]
    
    # 梯度惩罚
    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)
    penalty = ((gradient_norm - 1) ** 2).mean()
    
    return penalty

# 特征匹配损失
class FeatureMatchingLoss(nn.Module):
    """特征匹配损失"""
    
    def __init__(self, discriminator, layers: list = None):
        super().__init__()
        self.discriminator = discriminator
        self.layers = layers or [0, 1, 2]
    
    def forward(self, real, fake):
        loss = 0
        
        # 提取中间层特征
        real_features = self.get_features(real)
        fake_features = self.get_features(fake)
        
        for i in self.layers:
            loss += F.l1_loss(real_features[i], fake_features[i])
        
        return loss
    
    def get_features(self, x):
        features = []
        for module in self.discriminator.model:
            x = module(x)
            features.append(x)
        return features

# 自注意力机制
class SelfAttention(nn.Module):
    """自注意力模块"""
    
    def __init__(self, in_channels: int):
        super().__init__()
        self.query = nn.Conv2d(in_channels, in_channels // 8, 1)
        self.key = nn.Conv2d(in_channels, in_channels // 8, 1)
        self.value = nn.Conv2d(in_channels, in_channels, 1)
        self.gamma = nn.Parameter(torch.zeros(1))
    
    def forward(self, x):
        B, C, H, W = x.size()
        
        # 计算注意力
        query = self.query(x).view(B, -1, H * W).permute(0, 2, 1)
        key = self.key(x).view(B, -1, H * W)
        attention = torch.softmax(torch.bmm(query, key), dim=-1)
        
        value = self.value(x).view(B, -1, H * W)
        out = torch.bmm(value, attention.permute(0, 2, 1))
        out = out.view(B, C, H, W)
        
        return self.gamma * out + x
```

#### [场景] 典型应用场景

- 稳定 GAN 训练
- 提高生成质量
- 防止模式崩溃

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Diffusion 模型

#### [概念] 概念与解决的问题

Diffusion 模型通过逐步加噪和去噪过程生成图像。相比 GAN，Diffusion 模型训练更稳定，生成质量更高，是当前主流的图像生成方法。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
import math

class SinusoidalPositionEmbeddings(nn.Module):
    """正弦位置编码"""
    
    def __init__(self, dim):
        super().__init__()
        self.dim = dim
    
    def forward(self, t):
        device = t.device
        half_dim = self.dim // 2
        embeddings = math.log(10000) / (half_dim - 1)
        embeddings = torch.exp(torch.arange(half_dim, device=device) * -embeddings)
        embeddings = t[:, None] * embeddings[None, :]
        embeddings = torch.cat((embeddings.sin(), embeddings.cos()), dim=-1)
        return embeddings

class UNetBlock(nn.Module):
    """UNet 块"""
    
    def __init__(self, in_channels, out_channels, time_emb_dim, up=False):
        super().__init__()
        self.time_mlp = nn.Linear(time_emb_dim, out_channels)
        
        if up:
            self.conv1 = nn.Conv2d(2 * in_channels, out_channels, 3, padding=1)
            self.transform = nn.ConvTranspose2d(out_channels, out_channels, 4, 2, 1)
        else:
            self.conv1 = nn.Conv2d(in_channels, out_channels, 3, padding=1)
            self.transform = nn.Conv2d(out_channels, out_channels, 4, 2, 1)
        
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        self.bnorm1 = nn.BatchNorm2d(out_channels)
        self.bnorm2 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU()
    
    def forward(self, x, t):
        # 时间嵌入
        t_emb = self.relu(self.time_mlp(t))
        t_emb = t_emb[:, :, None, None]
        
        # 第一个卷积
        h = self.bnorm1(self.relu(self.conv1(x)))
        h = h + t_emb
        
        # 第二个卷积
        h = self.bnorm2(self.relu(self.conv2(h)))
        
        return self.transform(h)

class SimpleUNet(nn.Module):
    """简化 UNet"""
    
    def __init__(self, in_channels=3, out_channels=3, time_emb_dim=32):
        super().__init__()
        
        # 时间嵌入
        self.time_mlp = nn.Sequential(
            SinusoidalPositionEmbeddings(time_emb_dim),
            nn.Linear(time_emb_dim, time_emb_dim),
            nn.ReLU()
        )
        
        # 编码器
        self.conv0 = nn.Conv2d(in_channels, 32, 3, padding=1)
        self.down1 = UNetBlock(32, 64, time_emb_dim)
        self.down2 = UNetBlock(64, 128, time_emb_dim)
        
        # 瓶颈层
        self.bottleneck = UNetBlock(128, 256, time_emb_dim)
        
        # 解码器
        self.up1 = UNetBlock(256, 128, time_emb_dim, up=True)
        self.up2 = UNetBlock(128, 64, time_emb_dim, up=True)
        self.up3 = UNetBlock(64, 32, time_emb_dim, up=True)
        
        self.output = nn.Conv2d(32, out_channels, 1)
    
    def forward(self, x, t):
        t_emb = self.time_mlp(t)
        
        x0 = self.conv0(x)
        x1 = self.down1(x0, t_emb)
        x2 = self.down2(x1, t_emb)
        x3 = self.bottleneck(x2, t_emb)
        
        x = self.up1(x3, t_emb)
        x = torch.cat([x, x2], dim=1)
        x = self.up2(x, t_emb)
        x = torch.cat([x, x1], dim=1)
        x = self.up3(x, t_emb)
        x = torch.cat([x, x0], dim=1)
        
        return self.output(x)

class Diffusion:
    """Diffusion 模型"""
    
    def __init__(self, timesteps=1000, beta_start=1e-4, beta_end=0.02):
        self.timesteps = timesteps
        
        # 线性 beta 调度
        self.betas = torch.linspace(beta_start, beta_end, timesteps)
        self.alphas = 1 - self.betas
        self.alphas_cumprod = torch.cumprod(self.alphas, dim=0)
        
        # 前向扩散参数
        self.sqrt_alphas_cumprod = torch.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = torch.sqrt(1 - self.alphas_cumprod)
    
    def q_sample(self, x_0, t, noise=None):
        """前向扩散：添加噪声"""
        if noise is None:
            noise = torch.randn_like(x_0)
        
        sqrt_alpha = self.sqrt_alphas_cumprod[t]
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t]
        
        return sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
    
    def p_losses(self, model, x_0, t, noise=None):
        """计算去噪损失"""
        if noise is None:
            noise = torch.randn_like(x_0)
        
        x_noisy = self.q_sample(x_0, t, noise)
        predicted_noise = model(x_noisy, t)
        
        return F.mse_loss(noise, predicted_noise)
    
    @torch.no_grad()
    def p_sample(self, model, x, t):
        """单步去噪"""
        betas_t = self.betas[t]
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t]
        sqrt_recip_alpha = 1 / torch.sqrt(self.alphas[t])
        
        # 预测噪声
        predicted_noise = model(x, t)
        
        # 去噪
        model_mean = sqrt_recip_alpha * (x - betas_t * predicted_noise / sqrt_one_minus_alpha)
        
        if t > 0:
            noise = torch.randn_like(x)
            posterior_variance = self.betas[t]
            return model_mean + torch.sqrt(posterior_variance) * noise
        else:
            return model_mean
    
    @torch.no_grad()
    def sample(self, model, shape):
        """生成样本"""
        device = next(model.parameters()).device
        b = shape[0]
        
        # 从纯噪声开始
        img = torch.randn(shape, device=device)
        
        # 逐步去噪
        for t in reversed(range(self.timesteps)):
            t_batch = torch.full((b,), t, device=device, dtype=torch.long)
            img = self.p_sample(model, img, t_batch)
        
        return img
```

#### [关联] 与核心层的关联

Diffusion 模型是生成模型的新范式，相比 GAN 训练更稳定。

### 2. 条件生成

#### [概念] 概念与解决的问题

条件生成根据给定的条件（如文本、类别、图像）生成符合要求的图像。包括条件 GAN、文本到图像生成等。

#### [语法] 核心用法

```python
# 条件 GAN
class ConditionalGenerator(nn.Module):
    """条件生成器"""
    
    def __init__(self, latent_dim: int, num_classes: int, img_channels: int = 3):
        super().__init__()
        self.label_embedding = nn.Embedding(num_classes, num_classes)
        
        self.model = nn.Sequential(
            nn.Linear(latent_dim + num_classes, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 512),
            nn.BatchNorm1d(512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, 1024),
            nn.BatchNorm1d(1024),
            nn.LeakyReLU(0.2),
            nn.Linear(1024, img_channels * 64 * 64),
            nn.Tanh()
        )
    
    def forward(self, z, labels):
        # 嵌入标签
        label_emb = self.label_embedding(labels)
        # 拼接噪声和标签
        x = torch.cat([z, label_emb], dim=1)
        # 生成图像
        img = self.model(x)
        return img.view(img.size(0), 3, 64, 64)

# 文本条件生成
class TextEncoder(nn.Module):
    """文本编码器"""
    
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
    
    def forward(self, text):
        embedded = self.embedding(text)
        _, (hidden, _) = self.lstm(embedded)
        return hidden[-1]

# CLIP 条件生成
def clip_guided_generation():
    """CLIP 引导的图像生成"""
    import clip
    
    # 加载 CLIP 模型
    model, preprocess = clip.load("ViT-B/32", device="cuda")
    
    # 文本提示
    text = clip.tokenize(["a beautiful sunset over the ocean"]).cuda()
    
    # 计算文本特征
    with torch.no_grad():
        text_features = model.encode_text(text)
    
    # 在生成过程中使用 CLIP 引导
    # ...
```

#### [关联] 与核心层的关联

条件生成扩展了基础生成模型，支持更精确的控制。

### 3. 图像评估

#### [概念] 概念与解决的问题

图像生成质量评估包括主观评估和客观指标。常用指标有 FID（Fréchet Inception Distance）、IS（Inception Score）、LPIPS 等。

#### [语法] 核心用法

```python
import torch
import torch.nn as nn
from torchvision import models

class FIDCalculator:
    """FID 计算器"""
    
    def __init__(self, device='cuda'):
        self.device = device
        self.inception = models.inception_v3(pretrained=True, transform_input=False)
        self.inception.fc = nn.Identity()
        self.inception.eval()
        self.inception.to(device)
    
    @torch.no_grad()
    def get_features(self, images):
        """提取 Inception 特征"""
        images = F.interpolate(images, size=(299, 299), mode='bilinear')
        features = self.inception(images)
        return features.cpu().numpy()
    
    def calculate_fid(self, real_features, fake_features):
        """计算 FID"""
        from scipy import linalg
        
        # 计算均值和协方差
        mu1, sigma1 = real_features.mean(axis=0), np.cov(real_features, rowvar=False)
        mu2, sigma2 = fake_features.mean(axis=0), np.cov(fake_features, rowvar=False)
        
        # 计算 Fréchet 距离
        diff = mu1 - mu2
        covmean = linalg.sqrtm(sigma1.dot(sigma2))
        
        if np.iscomplexobj(covmean):
            covmean = covmean.real
        
        fid = diff.dot(diff) + np.trace(sigma1 + sigma2 - 2 * covmean)
        return fid

class ISCalculator:
    """Inception Score 计算器"""
    
    def __init__(self, device='cuda'):
        self.device = device
        self.inception = models.inception_v3(pretrained=True, transform_input=False)
        self.inception.eval()
        self.inception.to(device)
    
    @torch.no_grad()
    def calculate_is(self, images, splits=10):
        """计算 Inception Score"""
        images = F.interpolate(images, size=(299, 299), mode='bilinear')
        logits = self.inception(images)
        probs = F.softmax(logits, dim=1)
        
        # 计算 IS
        scores = []
        for i in range(splits):
            part = probs[i * (len(probs) // splits): (i + 1) * (len(probs) // splits)]
            kl = part * (torch.log(part) - torch.log(part.mean(dim=0)))
            kl = kl.sum(dim=1).mean().exp()
            scores.append(kl.item())
        
        return np.mean(scores), np.std(scores)
```

#### [关联] 与核心层的关联

评估指标用于衡量生成模型的质量，指导模型优化。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| StyleGAN | 风格生成 |
| BigGAN | 大规模 GAN |
| VQ-VAE | 向量量化 VAE |
| DDPM | 去噪扩散 |
| Stable Diffusion | 潜空间扩散 |
| DALL-E | 文本到图像 |
| Midjourney | 艺术生成 |
| ControlNet | 可控生成 |
| LoRA | 低秩适配 |
| DreamBooth | 个性化生成 |

---

## [实战] 核心实战清单

### 实战任务 1：训练图像生成模型

使用 Diffusion 模型生成图像：

```python
def train_diffusion():
    # 初始化模型
    model = SimpleUNet()
    diffusion = Diffusion(timesteps=1000)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    
    # 训练循环
    for epoch in range(num_epochs):
        for batch_idx, (images, _) in enumerate(dataloader):
            images = images.to(device)
            batch_size = images.size(0)
            
            # 随机采样时间步
            t = torch.randint(0, diffusion.timesteps, (batch_size,), device=device)
            
            # 计算损失
            loss = diffusion.p_losses(model, images, t)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        print(f"Epoch {epoch}: Loss {loss.item():.4f}")
        
        # 生成样本
        if epoch % 10 == 0:
            samples = diffusion.sample(model, (16, 3, 64, 64))
            save_image(samples, f"samples/epoch_{epoch}.png", normalize=True)
```
