# 深度学习基础 三层深度学习教程

## [总览] 技术总览

深度学习使用多层神经网络学习数据的层次化表示。核心组件：神经网络、反向传播、优化算法。广泛应用于计算机视觉、自然语言处理、语音识别等领域。

本教程采用三层漏斗学习法：**核心层**聚焦神经网络、反向传播、优化算法三大基石；**重点层**深入正则化和卷积网络；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 神经网络基础

#### [概念] 概念解释

神经网络由神经元（感知机）组成，每个神经元接收输入、加权求和、通过激活函数输出。多层感知机（MLP）包含输入层、隐藏层、输出层。激活函数引入非线性，常用 ReLU、Sigmoid、Tanh。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple, Callable

class NeuralNetwork:
    """简单神经网络实现"""
    
    def __init__(
        self, 
        layer_sizes: List[int],
        activation: str = 'relu',
        random_state: int = 42
    ):
        self.layer_sizes = layer_sizes
        self.random_state = random_state
        self.weights = []
        self.biases = []
        
        # 选择激活函数
        if activation == 'relu':
            self.activation = self._relu
            self.activation_derivative = self._relu_derivative
        elif activation == 'sigmoid':
            self.activation = self._sigmoid
            self.activation_derivative = self._sigmoid_derivative
        else:
            self.activation = self._tanh
            self.activation_derivative = self._tanh_derivative
        
        # 初始化权重
        np.random.seed(random_state)
        for i in range(len(layer_sizes) - 1):
            # Xavier 初始化
            scale = np.sqrt(2.0 / (layer_sizes[i] + layer_sizes[i+1]))
            self.weights.append(np.random.randn(layer_sizes[i], layer_sizes[i+1]) * scale)
            self.biases.append(np.zeros((1, layer_sizes[i+1])))
    
    def forward(self, X: np.ndarray) -> Tuple[List[np.ndarray], List[np.ndarray]]:
        """前向传播"""
        activations = [X]
        z_values = []
        
        current = X
        for i, (W, b) in enumerate(zip(self.weights, self.biases)):
            z = current @ W + b
            z_values.append(z)
            
            # 最后一层用 softmax（分类）或线性（回归）
            if i == len(self.weights) - 1:
                current = self._softmax(z)
            else:
                current = self.activation(z)
            
            activations.append(current)
        
        return activations, z_values
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测"""
        activations, _ = self.forward(X)
        return activations[-1]
    
    def predict_class(self, X: np.ndarray) -> np.ndarray:
        """预测类别"""
        probs = self.predict(X)
        return np.argmax(probs, axis=1)
    
    # 激活函数
    def _relu(self, x: np.ndarray) -> np.ndarray:
        return np.maximum(0, x)
    
    def _relu_derivative(self, x: np.ndarray) -> np.ndarray:
        return (x > 0).astype(float)
    
    def _sigmoid(self, x: np.ndarray) -> np.ndarray:
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def _sigmoid_derivative(self, x: np.ndarray) -> np.ndarray:
        s = self._sigmoid(x)
        return s * (1 - s)
    
    def _tanh(self, x: np.ndarray) -> np.ndarray:
        return np.tanh(x)
    
    def _tanh_derivative(self, x: np.ndarray) -> np.ndarray:
        return 1 - np.tanh(x) ** 2
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)

# 使用示例
if __name__ == "__main__":
    # 创建网络
    nn = NeuralNetwork(layer_sizes=[4, 16, 8, 3], activation='relu')
    
    # 模拟输入
    X = np.random.randn(10, 4)
    
    # 前向传播
    output = nn.predict(X)
    print(f"输出形状: {output.shape}")
    print(f"输出概率和: {output.sum(axis=1)}")  # 应该接近 1
```

### 2. 反向传播

#### [概念] 概念解释

反向传播通过链式法则计算损失函数对每个参数的梯度。从输出层开始，逐层向前传播误差，更新权重。核心公式：delta = 激活导数 * 误差，梯度 = 前层激活 * delta。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Tuple

class NeuralNetworkWithBP(NeuralNetwork):
    """带反向传播的神经网络"""
    
    def __init__(self, layer_sizes: List[int], activation: str = 'relu', random_state: int = 42):
        super().__init__(layer_sizes, activation, random_state)
    
    def compute_loss(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """计算交叉熵损失"""
        epsilon = 1e-15
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        return -np.mean(np.sum(y_true * np.log(y_pred), axis=1))
    
    def backward(
        self, 
        X: np.ndarray, 
        y: np.ndarray,
        activations: List[np.ndarray],
        z_values: List[np.ndarray]
    ) -> Tuple[List[np.ndarray], List[np.ndarray]]:
        """反向传播"""
        m = X.shape[0]
        weight_gradients = [None] * len(self.weights)
        bias_gradients = [None] * len(self.biases)
        
        # 输出层误差
        delta = activations[-1] - y  # softmax + cross-entropy 的梯度
        
        # 逐层反向传播
        for i in range(len(self.weights) - 1, -1, -1):
            weight_gradients[i] = activations[i].T @ delta / m
            bias_gradients[i] = np.mean(delta, axis=0, keepdims=True)
            
            if i > 0:
                delta = (delta @ self.weights[i].T) * self.activation_derivative(z_values[i-1])
        
        return weight_gradients, bias_gradients
    
    def update_weights(
        self,
        weight_gradients: List[np.ndarray],
        bias_gradients: List[np.ndarray],
        learning_rate: float
    ) -> None:
        """更新权重"""
        for i in range(len(self.weights)):
            self.weights[i] -= learning_rate * weight_gradients[i]
            self.biases[i] -= learning_rate * bias_gradients[i]
    
    def fit(
        self, 
        X: np.ndarray, 
        y: np.ndarray,
        epochs: int = 100,
        learning_rate: float = 0.01,
        batch_size: int = 32,
        verbose: bool = True
    ) -> List[float]:
        """训练模型"""
        n_samples = X.shape[0]
        losses = []
        
        # One-hot 编码
        if len(y.shape) == 1:
            y_onehot = np.zeros((n_samples, self.layer_sizes[-1]))
            y_onehot[np.arange(n_samples), y] = 1
            y = y_onehot
        
        for epoch in range(epochs):
            # 随机打乱
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]
            
            epoch_loss = 0
            n_batches = 0
            
            # 小批量训练
            for i in range(0, n_samples, batch_size):
                X_batch = X_shuffled[i:i+batch_size]
                y_batch = y_shuffled[i:i+batch_size]
                
                # 前向传播
                activations, z_values = self.forward(X_batch)
                
                # 计算损失
                loss = self.compute_loss(y_batch, activations[-1])
                epoch_loss += loss
                n_batches += 1
                
                # 反向传播
                weight_grads, bias_grads = self.backward(X_batch, y_batch, activations, z_values)
                
                # 更新权重
                self.update_weights(weight_grads, bias_grads, learning_rate)
            
            avg_loss = epoch_loss / n_batches
            losses.append(avg_loss)
            
            if verbose and (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")
        
        return losses

# 使用示例
if __name__ == "__main__":
    from sklearn.datasets import load_iris
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler, OneHotEncoder
    
    # 加载数据
    iris = load_iris()
    X, y = iris.data, iris.target
    
    # 标准化
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # 划分数据集
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 训练模型
    nn = NeuralNetworkWithBP([4, 16, 8, 3], activation='relu')
    losses = nn.fit(X_train, y_train, epochs=100, learning_rate=0.1)
    
    # 评估
    predictions = nn.predict_class(X_test)
    accuracy = np.mean(predictions == y_test)
    print(f"测试集准确率: {accuracy:.2%}")
```

### 3. 优化算法

#### [概念] 概念解释

优化算法更新模型参数以最小化损失函数。SGD（随机梯度下降）是最基础的优化器。进阶优化器：Momentum、RMSprop、Adam。Adam 结合了 Momentum 和 RMSprop 的优点，是最常用的优化器。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict

class Optimizer:
    """优化器基类"""
    
    def __init__(self, learning_rate: float = 0.01):
        self.learning_rate = learning_rate
    
    def update(self, params: np.ndarray, grads: np.ndarray) -> np.ndarray:
        raise NotImplementedError

class SGD(Optimizer):
    """随机梯度下降"""
    
    def __init__(self, learning_rate: float = 0.01):
        super().__init__(learning_rate)
    
    def update(self, params: np.ndarray, grads: np.ndarray) -> np.ndarray:
        return params - self.learning_rate * grads

class Momentum(Optimizer):
    """动量优化器"""
    
    def __init__(self, learning_rate: float = 0.01, momentum: float = 0.9):
        super().__init__(learning_rate)
        self.momentum = momentum
        self.velocity = None
    
    def update(self, params: np.ndarray, grads: np.ndarray) -> np.ndarray:
        if self.velocity is None:
            self.velocity = np.zeros_like(params)
        
        self.velocity = self.momentum * self.velocity - self.learning_rate * grads
        return params + self.velocity

class Adam(Optimizer):
    """Adam 优化器"""
    
    def __init__(
        self, 
        learning_rate: float = 0.001,
        beta1: float = 0.9,
        beta2: float = 0.999,
        epsilon: float = 1e-8
    ):
        super().__init__(learning_rate)
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon
        self.m = None  # 一阶矩
        self.v = None  # 二阶矩
        self.t = 0     # 时间步
    
    def update(self, params: np.ndarray, grads: np.ndarray) -> np.ndarray:
        if self.m is None:
            self.m = np.zeros_like(params)
            self.v = np.zeros_like(params)
        
        self.t += 1
        
        # 更新一阶矩和二阶矩
        self.m = self.beta1 * self.m + (1 - self.beta1) * grads
        self.v = self.beta2 * self.v + (1 - self.beta2) * (grads ** 2)
        
        # 偏差修正
        m_hat = self.m / (1 - self.beta1 ** self.t)
        v_hat = self.v / (1 - self.beta2 ** self.t)
        
        # 更新参数
        return params - self.learning_rate * m_hat / (np.sqrt(v_hat) + self.epsilon)

class NeuralNetworkWithOptimizers:
    """带多种优化器的神经网络"""
    
    def __init__(
        self, 
        layer_sizes: List[int],
        optimizer: str = 'adam',
        learning_rate: float = 0.001
    ):
        self.layer_sizes = layer_sizes
        self.learning_rate = learning_rate
        
        # 初始化权重
        self.weights = []
        self.biases = []
        np.random.seed(42)
        for i in range(len(layer_sizes) - 1):
            scale = np.sqrt(2.0 / layer_sizes[i])
            self.weights.append(np.random.randn(layer_sizes[i], layer_sizes[i+1]) * scale)
            self.biases.append(np.zeros((1, layer_sizes[i+1])))
        
        # 初始化优化器
        self.optimizers_w = []
        self.optimizers_b = []
        for _ in range(len(self.weights)):
            if optimizer == 'sgd':
                self.optimizers_w.append(SGD(learning_rate))
                self.optimizers_b.append(SGD(learning_rate))
            elif optimizer == 'momentum':
                self.optimizers_w.append(Momentum(learning_rate))
                self.optimizers_b.append(Momentum(learning_rate))
            else:  # adam
                self.optimizers_w.append(Adam(learning_rate))
                self.optimizers_b.append(Adam(learning_rate))
    
    def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 100) -> List[float]:
        """训练（简化版）"""
        losses = []
        
        for epoch in range(epochs):
            # 前向传播（简化）
            output = self._forward(X)
            
            # 计算损失
            epsilon = 1e-15
            output = np.clip(output, epsilon, 1 - epsilon)
            loss = -np.mean(np.sum(y * np.log(output), axis=1))
            losses.append(loss)
            
            # 反向传播（简化）
            delta = output - y
            
            for i in range(len(self.weights) - 1, -1, -1):
                grad_w = np.dot(self._get_activation(i).T, delta) / X.shape[0]
                grad_b = np.mean(delta, axis=0, keepdims=True)
                
                self.weights[i] = self.optimizers_w[i].update(self.weights[i], grad_w)
                self.biases[i] = self.optimizers_b[i].update(self.biases[i], grad_b)
                
                if i > 0:
                    delta = np.dot(delta, self.weights[i].T)
        
        return losses
    
    def _forward(self, X: np.ndarray) -> np.ndarray:
        """前向传播"""
        current = X
        for i, (W, b) in enumerate(zip(self.weights, self.biases)):
            current = np.maximum(0, current @ W + b)  # ReLU
        return self._softmax(current)
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)
    
    def _get_activation(self, layer_idx: int) -> np.ndarray:
        """获取激活值（简化）"""
        return np.random.randn(100, self.layer_sizes[layer_idx])

# 使用示例
if __name__ == "__main__":
    # 比较不同优化器
    X = np.random.randn(100, 10)
    y = np.zeros((100, 3))
    y[np.arange(100), np.random.randint(0, 3, 100)] = 1
    
    for opt_name in ['sgd', 'momentum', 'adam']:
        nn = NeuralNetworkWithOptimizers([10, 32, 3], optimizer=opt_name, learning_rate=0.01)
        losses = nn.fit(X, y, epochs=50)
        print(f"{opt_name}: 最终损失 = {losses[-1]:.4f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 正则化技术

#### [概念] 概念解释

正则化防止过拟合。L1/L2 正则化在损失函数中添加权重惩罚。Dropout 在训练时随机丢弃神经元。Batch Normalization 规范化每层输入，加速训练。

#### [代码] 代码示例

```python
import numpy as np

class Dropout:
    """Dropout 层"""
    
    def __init__(self, drop_rate: float = 0.5):
        self.drop_rate = drop_rate
        self.mask = None
    
    def forward(self, X: np.ndarray, training: bool = True) -> np.ndarray:
        if training:
            self.mask = (np.random.rand(*X.shape) > self.drop_rate) / (1 - self.drop_rate)
            return X * self.mask
        return X
    
    def backward(self, grad: np.ndarray) -> np.ndarray:
        return grad * self.mask

class BatchNormalization:
    """批归一化层"""
    
    def __init__(self, num_features: int, momentum: float = 0.9, epsilon: float = 1e-5):
        self.gamma = np.ones((1, num_features))
        self.beta = np.zeros((1, num_features))
        self.momentum = momentum
        self.epsilon = epsilon
        
        self.running_mean = np.zeros((1, num_features))
        self.running_var = np.ones((1, num_features))
    
    def forward(self, X: np.ndarray, training: bool = True) -> np.ndarray:
        if training:
            mean = np.mean(X, axis=0, keepdims=True)
            var = np.var(X, axis=0, keepdims=True)
            
            # 更新运行统计量
            self.running_mean = self.momentum * self.running_mean + (1 - self.momentum) * mean
            self.running_var = self.momentum * self.running_var + (1 - self.momentum) * var
        else:
            mean = self.running_mean
            var = self.running_var
        
        # 归一化
        X_norm = (X - mean) / np.sqrt(var + self.epsilon)
        
        # 缩放和平移
        return self.gamma * X_norm + self.beta

class L2Regularization:
    """L2 正则化"""
    
    def __init__(self, lambda_reg: float = 0.01):
        self.lambda_reg = lambda_reg
    
    def compute_loss(self, weights: List[np.ndarray]) -> float:
        """计算正则化损失"""
        reg_loss = 0
        for W in weights:
            reg_loss += np.sum(W ** 2)
        return 0.5 * self.lambda_reg * reg_loss
    
    def compute_gradient(self, W: np.ndarray) -> np.ndarray:
        """计算正则化梯度"""
        return self.lambda_reg * W
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| CNN | 卷积神经网络 |
| RNN | 循环神经网络 |
| LSTM | 长短期记忆网络 |
| Attention | 注意力机制 |
| ResNet | 残差网络 |
| Batch Norm | 批归一化 |
| Layer Norm | 层归一化 |
| Dropout | 随机丢弃 |
| Data Augmentation | 数据增强 |
| Transfer Learning | 迁移学习 |

---

## [实战] 核心实战清单

1. 从零实现一个多层感知机，在 MNIST 数据集上训练
2. 实现带 Dropout 和 Batch Normalization 的神经网络
3. 比较 SGD、Momentum、Adam 三种优化器的收敛速度

## [避坑] 三层避坑提醒

- **核心层误区**：激活函数选择不当，导致梯度消失或爆炸
- **重点层误区**：Dropout 在测试时不关闭，导致预测不准确
- **扩展层建议**：使用 PyTorch 或 TensorFlow 等成熟框架，简化开发
