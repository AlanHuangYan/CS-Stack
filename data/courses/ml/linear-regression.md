# 线性回归 三层深度学习教程

## [总览] 技术总览

线性回归是机器学习中最基础的监督学习算法，用于预测连续数值。它通过拟合一条直线（或超平面）来建立输入特征与输出目标之间的线性关系，是理解机器学习原理的最佳起点。

本教程采用三层漏斗学习法：**核心层**聚焦一元线性回归、损失函数、梯度下降三大基石；**重点层**深入多元线性回归和模型评估；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成线性回归 **50% 以上** 的常见任务。

### 1. 一元线性回归

#### [概念] 概念解释

一元线性回归是最简单的回归模型，假设目标变量 y 与单个特征 x 之间存在线性关系：y = wx + b。目标是找到最优的参数 w（斜率）和 b（截距），使预测值与真实值之间的误差最小。

#### [语法] 核心语法 / 命令 / API

**模型公式：**

```
y = wx + b
```

**参数说明：**

| 参数 | 说明 |
|------|------|
| w | 权重（斜率） |
| b | 偏置（截距） |
| x | 输入特征 |
| y | 预测输出 |

#### [代码] 代码示例

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

n_samples = 100
true_w = 2.5
true_b = 1.0

X = np.random.randn(n_samples) * 2
noise = np.random.randn(n_samples) * 0.5
y = true_w * X + true_b + noise

print(f"真实参数: w={true_w}, b={true_b}")
print(f"数据形状: X={X.shape}, y={y.shape}")

def simple_linear_regression(X, y):
    """
    使用最小二乘法求解一元线性回归
    """
    n = len(X)
    
    sum_x = np.sum(X)
    sum_y = np.sum(y)
    sum_xy = np.sum(X * y)
    sum_x2 = np.sum(X ** 2)
    
    w = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
    b = (sum_y - w * sum_x) / n
    
    return w, b

w_closed, b_closed = simple_linear_regression(X, y)
print(f"\n闭式解: w={w_closed:.4f}, b={b_closed:.4f}")

def predict(X, w, b):
    return w * X + b

y_pred = predict(X, w_closed, b_closed)

plt.figure(figsize=(10, 6))
plt.scatter(X, y, alpha=0.6, label='数据点')
plt.plot(X, y_pred, 'r-', linewidth=2, label=f'拟合直线: y={w_closed:.2f}x+{b_closed:.2f}')
plt.xlabel('X')
plt.ylabel('y')
plt.title('一元线性回归')
plt.legend()
plt.grid(True, alpha=0.3)
plt.savefig('linear_regression.png')
plt.close()

print("\n图表已保存为 linear_regression.png")

def compute_r2(y_true, y_pred):
    """
    计算 R² 决定系数
    """
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = 1 - ss_res / ss_tot
    return r2

r2 = compute_r2(y, y_pred)
print(f"R² 决定系数: {r2:.4f}")

from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X.reshape(-1, 1), y)

print(f"\nsklearn 结果:")
print(f"w = {model.coef_[0]:.4f}")
print(f"b = {model.intercept_:.4f}")
print(f"R² = {model.score(X.reshape(-1, 1), y):.4f}")

def predict_new(x_new, w, b):
    """
    预测新数据
    """
    return w * x_new + b

new_x = np.array([0, 1, 2, 3])
new_y = predict_new(new_x, w_closed, b_closed)
print(f"\n新数据预测:")
for x_val, y_val in zip(new_x, new_y):
    print(f"  x={x_val} -> y={y_val:.4f}")
```

#### [场景] 典型应用场景

1. 房价预测：根据面积预测房价
2. 销售预测：根据广告投入预测销售额
3. 气温预测：根据日期预测气温趋势

### 2. 损失函数

#### [概念] 概念解释

损失函数衡量模型预测值与真实值之间的差距。线性回归最常用的是均方误差（MSE），它计算所有样本预测误差平方的平均值。

#### [语法] 核心语法 / 命令 / API

**MSE 公式：**

```
MSE = (1/n) * Σ(y_pred - y_true)²
```

**常用损失函数：**

| 损失函数 | 公式 | 特点 |
|----------|------|------|
| MSE | 均方误差 | 对异常值敏感 |
| MAE | 平均绝对误差 | 对异常值鲁棒 |
| RMSE | 均方根误差 | 与原数据同量纲 |

#### [代码] 代码示例

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
X = np.array([1, 2, 3, 4, 5])
y_true = np.array([2, 4, 5, 4, 5])

def mse_loss(y_true, y_pred):
    """
    均方误差 (Mean Squared Error)
    """
    return np.mean((y_true - y_pred) ** 2)

def mae_loss(y_true, y_pred):
    """
    平均绝对误差 (Mean Absolute Error)
    """
    return np.mean(np.abs(y_true - y_pred))

def rmse_loss(y_true, y_pred):
    """
    均方根误差 (Root Mean Squared Error)
    """
    return np.sqrt(mse_loss(y_true, y_pred))

def huber_loss(y_true, y_pred, delta=1.0):
    """
    Huber 损失 - 对异常值更鲁棒
    """
    error = y_true - y_pred
    is_small_error = np.abs(error) <= delta
    squared_loss = 0.5 * error ** 2
    linear_loss = delta * (np.abs(error) - 0.5 * delta)
    return np.mean(np.where(is_small_error, squared_loss, linear_loss))

w_values = np.linspace(0, 2, 100)
mse_values = []
mae_values = []

for w in w_values:
    y_pred = w * X
    mse_values.append(mse_loss(y_true, y_pred))
    mae_values.append(mae_loss(y_true, y_pred))

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(w_values, mse_values, 'b-', linewidth=2, label='MSE')
plt.xlabel('权重 w')
plt.ylabel('损失值')
plt.title('MSE 损失函数')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(w_values, mae_values, 'r-', linewidth=2, label='MAE')
plt.xlabel('权重 w')
plt.ylabel('损失值')
plt.title('MAE 损失函数')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('loss_functions.png')
plt.close()

print("损失函数对比图已保存")

def visualize_loss_landscape():
    """
    可视化损失函数曲面
    """
    w_range = np.linspace(-1, 3, 100)
    b_range = np.linspace(-2, 4, 100)
    W, B = np.meshgrid(w_range, b_range)
    
    X_data = np.array([1, 2, 3, 4, 5])
    y_data = np.array([2, 4, 5, 4, 5])
    
    MSE = np.zeros_like(W)
    for i in range(len(w_range)):
        for j in range(len(b_range)):
            y_pred = W[j, i] * X_data + B[j, i]
            MSE[j, i] = mse_loss(y_data, y_pred)
    
    plt.figure(figsize=(10, 8))
    contour = plt.contour(W, B, MSE, levels=20, cmap='viridis')
    plt.colorbar(contour, label='MSE')
    plt.xlabel('权重 w')
    plt.ylabel('偏置 b')
    plt.title('MSE 损失函数等高线图')
    plt.savefig('loss_landscape.png')
    plt.close()
    
    print("损失函数曲面图已保存")

visualize_loss_landscape()

def compute_gradient(X, y, w, b):
    """
    计算损失函数对参数的梯度
    """
    n = len(X)
    y_pred = w * X + b
    
    dw = -2/n * np.sum(X * (y - y_pred))
    db = -2/n * np.sum(y - y_pred)
    
    return dw, db

X = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([2, 4, 5, 4, 5], dtype=float)

w, b = 0.0, 0.0
dw, db = compute_gradient(X, y, w, b)
print(f"\n初始梯度: dw={dw:.4f}, db={db:.4f}")

print("\n损失函数特点:")
print("1. MSE 对异常值敏感，因为误差被平方")
print("2. MAE 对异常值更鲁棒，误差线性增长")
print("3. Huber 损失结合了两者的优点")
print("4. 损失函数必须是凸函数，才能保证找到全局最优解")
```

#### [场景] 典型应用场景

1. 模型训练：通过最小化损失函数优化参数
2. 模型比较：使用损失值比较不同模型
3. 异常检测：通过损失值识别异常样本

### 3. 梯度下降

#### [概念] 概念解释

梯度下降是一种迭代优化算法，通过沿着损失函数梯度的反方向更新参数，逐步找到损失函数的最小值。学习率控制每次更新的步长。

#### [语法] 核心语法 / 命令 / API

**更新规则：**

```
w = w - α * ∂L/∂w
b = b - α * ∂L/∂b
```

**参数说明：**

| 参数 | 说明 |
|------|------|
| α | 学习率 |
| ∂L/∂w | 损失对 w 的梯度 |
| ∂L/∂b | 损失对 b 的梯度 |

#### [代码] 代码示例

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
n_samples = 100
X = 2 * np.random.randn(n_samples)
y = 4 + 3 * X + np.random.randn(n_samples) * 0.5

def gradient_descent(X, y, learning_rate=0.01, n_iterations=1000):
    """
    批量梯度下降
    """
    w = np.random.randn()
    b = np.random.randn()
    
    n = len(X)
    history = {'w': [], 'b': [], 'loss': []}
    
    for i in range(n_iterations):
        y_pred = w * X + b
        
        loss = np.mean((y - y_pred) ** 2)
        
        dw = -2/n * np.sum(X * (y - y_pred))
        db = -2/n * np.sum(y - y_pred)
        
        w = w - learning_rate * dw
        b = b - learning_rate * db
        
        history['w'].append(w)
        history['b'].append(b)
        history['loss'].append(loss)
    
    return w, b, history

w_gd, b_gd, history_gd = gradient_descent(X, y, learning_rate=0.01, n_iterations=100)
print(f"梯度下降结果: w={w_gd:.4f}, b={b_gd:.4f}")

def stochastic_gradient_descent(X, y, learning_rate=0.01, n_epochs=50):
    """
    随机梯度下降
    """
    w = np.random.randn()
    b = np.random.randn()
    
    n = len(X)
    history = {'w': [], 'b': [], 'loss': []}
    
    for epoch in range(n_epochs):
        indices = np.random.permutation(n)
        X_shuffled = X[indices]
        y_shuffled = y[indices]
        
        for i in range(n):
            y_pred = w * X_shuffled[i] + b
            
            dw = -2 * X_shuffled[i] * (y_shuffled[i] - y_pred)
            db = -2 * (y_shuffled[i] - y_pred)
            
            w = w - learning_rate * dw
            b = b - learning_rate * db
        
        y_pred_all = w * X + b
        loss = np.mean((y - y_pred_all) ** 2)
        history['w'].append(w)
        history['b'].append(b)
        history['loss'].append(loss)
    
    return w, b, history

w_sgd, b_sgd, history_sgd = stochastic_gradient_descent(X, y, learning_rate=0.01, n_epochs=50)
print(f"随机梯度下降结果: w={w_sgd:.4f}, b={b_sgd:.4f}")

def mini_batch_gradient_descent(X, y, learning_rate=0.01, n_epochs=50, batch_size=32):
    """
    小批量梯度下降
    """
    w = np.random.randn()
    b = np.random.randn()
    
    n = len(X)
    history = {'w': [], 'b': [], 'loss': []}
    
    for epoch in range(n_epochs):
        indices = np.random.permutation(n)
        X_shuffled = X[indices]
        y_shuffled = y[indices]
        
        for i in range(0, n, batch_size):
            X_batch = X_shuffled[i:i+batch_size]
            y_batch = y_shuffled[i:i+batch_size]
            
            y_pred = w * X_batch + b
            batch_n = len(X_batch)
            
            dw = -2/batch_n * np.sum(X_batch * (y_batch - y_pred))
            db = -2/batch_n * np.sum(y_batch - y_pred)
            
            w = w - learning_rate * dw
            b = b - learning_rate * db
        
        y_pred_all = w * X + b
        loss = np.mean((y - y_pred_all) ** 2)
        history['w'].append(w)
        history['b'].append(b)
        history['loss'].append(loss)
    
    return w, b, history

w_mbgd, b_mbgd, history_mbgd = mini_batch_gradient_descent(X, y, learning_rate=0.01, n_epochs=50, batch_size=32)
print(f"小批量梯度下降结果: w={w_mbgd:.4f}, b={b_mbgd:.4f}")

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(history_gd['loss'], 'b-', label='批量梯度下降', linewidth=2)
plt.plot(history_sgd['loss'], 'r-', label='随机梯度下降', linewidth=2)
plt.plot(history_mbgd['loss'], 'g-', label='小批量梯度下降', linewidth=2)
plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('不同梯度下降方法的损失曲线')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
learning_rates = [0.001, 0.01, 0.1, 0.5]
for lr in learning_rates:
    _, _, hist = gradient_descent(X, y, learning_rate=lr, n_iterations=100)
    plt.plot(hist['loss'], label=f'lr={lr}', linewidth=2)

plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('不同学习率的损失曲线')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('gradient_descent.png')
plt.close()

print("\n梯度下降对比图已保存")

class LinearRegressionGD:
    """
    使用梯度下降的线性回归类
    """
    def __init__(self, learning_rate=0.01, n_iterations=1000):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.w = None
        self.b = None
        self.loss_history = []
    
    def fit(self, X, y):
        n = len(X)
        self.w = np.random.randn()
        self.b = np.random.randn()
        
        for _ in range(self.n_iterations):
            y_pred = self.w * X + self.b
            loss = np.mean((y - y_pred) ** 2)
            self.loss_history.append(loss)
            
            dw = -2/n * np.sum(X * (y - y_pred))
            db = -2/n * np.sum(y - y_pred)
            
            self.w -= self.learning_rate * dw
            self.b -= self.learning_rate * db
    
    def predict(self, X):
        return self.w * X + self.b
    
    def score(self, X, y):
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        return 1 - ss_res / ss_tot

model = LinearRegressionGD(learning_rate=0.01, n_iterations=500)
model.fit(X, y)

print(f"\n自定义线性回归模型:")
print(f"w = {model.w:.4f}")
print(f"b = {model.b:.4f}")
print(f"R² = {model.score(X, y):.4f}")
```

#### [场景] 典型应用场景

1. 模型训练：迭代优化模型参数
2. 深度学习：神经网络的核心优化方法
3. 在线学习：实时更新模型

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你将能够处理多特征回归问题并评估模型性能。

### 1. 多元线性回归

#### [概念] 概念与解决的问题

当有多个输入特征时，线性回归扩展为多元形式：y = w₁x₁ + w₂x₂ + ... + wₙxₙ + b。多元线性回归可以同时考虑多个因素对目标变量的影响。

#### [语法] 核心用法

**多元线性回归公式：**

```
y = X @ w + b
```

**矩阵形式：**

```
Y = XW
```

#### [代码] 代码示例

```python
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

np.random.seed(42)
n_samples = 200
n_features = 3

X = np.random.randn(n_samples, n_features)
true_w = np.array([1.5, -2.0, 0.5])
true_b = 3.0
y = X @ true_w + true_b + np.random.randn(n_samples) * 0.5

print(f"数据形状: X={X.shape}, y={y.shape}")
print(f"真实参数: w={true_w}, b={true_b}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

def multiple_linear_regression(X, y):
    """
    使用正规方程求解多元线性回归
    """
    X_b = np.c_[np.ones((X.shape[0], 1)), X]
    w = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
    return w[0], w[1:]

b_normal, w_normal = multiple_linear_regression(X_train, y_train)
print(f"\n正规方程解:")
print(f"w = {w_normal}")
print(f"b = {b_normal:.4f}")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LinearRegression()
model.fit(X_train_scaled, y_train)

print(f"\nsklearn 结果:")
print(f"w = {model.coef_}")
print(f"b = {model.intercept_:.4f}")
print(f"训练 R² = {model.score(X_train_scaled, y_train):.4f}")
print(f"测试 R² = {model.score(X_test_scaled, y_test):.4f}")

class MultipleLinearRegressionGD:
    """
    使用梯度下降的多元线性回归
    """
    def __init__(self, learning_rate=0.01, n_iterations=1000):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.w = None
        self.b = None
        self.loss_history = []
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.w = np.zeros(n_features)
        self.b = 0
        
        for _ in range(self.n_iterations):
            y_pred = X @ self.w + self.b
            loss = np.mean((y - y_pred) ** 2)
            self.loss_history.append(loss)
            
            dw = -2/n_samples * X.T @ (y - y_pred)
            db = -2/n_samples * np.sum(y - y_pred)
            
            self.w -= self.learning_rate * dw
            self.b -= self.learning_rate * db
    
    def predict(self, X):
        return X @ self.w + self.b
    
    def score(self, X, y):
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        return 1 - ss_res / ss_tot

model_gd = MultipleLinearRegressionGD(learning_rate=0.1, n_iterations=1000)
model_gd.fit(X_train_scaled, y_train)

print(f"\n梯度下降多元线性回归:")
print(f"w = {model_gd.w}")
print(f"b = {model_gd.b:.4f}")
print(f"训练 R² = {model_gd.score(X_train_scaled, y_train):.4f}")
print(f"测试 R² = {model_gd.score(X_test_scaled, y_test):.4f}")

def feature_importance(w, feature_names):
    """
    分析特征重要性
    """
    importance = np.abs(w)
    importance_pct = importance / np.sum(importance) * 100
    
    for name, imp, pct in zip(feature_names, importance, importance_pct):
        print(f"  {name}: {imp:.4f} ({pct:.1f}%)")

print("\n特征重要性:")
feature_importance(model.coef_, ['特征1', '特征2', '特征3'])
```

#### [关联] 与核心层的关联

多元线性回归是一元线性回归的自然扩展，使用相同的损失函数和优化方法。

### 2. 模型评估

#### [概念] 概念与解决的问题

模型评估用于衡量回归模型的预测能力。常用指标包括 R²、MAE、MSE、RMSE 等，从不同角度评估模型性能。

#### [语法] 核心用法

**评估指标：**

| 指标 | 公式 | 说明 |
|------|------|------|
| R² | 1 - SS_res/SS_tot | 解释方差比例 |
| MAE | 平均绝对误差 | 平均偏差 |
| MSE | 均方误差 | 平方偏差 |
| RMSE | 均方根误差 | 与原数据同量纲 |

#### [代码] 代码示例

```python
import numpy as np
from sklearn.metrics import (
    mean_squared_error, 
    mean_absolute_error, 
    r2_score,
    mean_absolute_percentage_error
)
from sklearn.model_selection import cross_val_score, KFold

y_true = np.array([3, 5, 7, 9, 11])
y_pred = np.array([2.8, 5.2, 6.8, 9.1, 10.9])

def evaluate_regression(y_true, y_pred):
    """
    计算所有回归评估指标
    """
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred)
    
    return {
        'MSE': mse,
        'RMSE': rmse,
        'MAE': mae,
        'R²': r2,
        'MAPE': mape
    }

metrics = evaluate_regression(y_true, y_pred)
print("回归评估指标:")
for name, value in metrics.items():
    print(f"  {name}: {value:.4f}")

np.random.seed(42)
X = np.random.randn(200, 3)
y = X @ np.array([1.5, -2.0, 0.5]) + 3.0 + np.random.randn(200) * 0.5

model = LinearRegression()

kf = KFold(n_splits=5, shuffle=True, random_state=42)

cv_scores = cross_val_score(model, X, y, cv=kf, scoring='r2')
print(f"\n5折交叉验证 R² 分数:")
print(f"  各折分数: {cv_scores}")
print(f"  平均分数: {cv_scores.mean():.4f}")
print(f"  标准差: {cv_scores.std():.4f}")

def residual_analysis(y_true, y_pred):
    """
    残差分析
    """
    residuals = y_true - y_pred
    
    print("\n残差分析:")
    print(f"  残差均值: {np.mean(residuals):.4f} (应接近0)")
    print(f"  残差标准差: {np.std(residuals):.4f}")
    print(f"  残差最小值: {np.min(residuals):.4f}")
    print(f"  残差最大值: {np.max(residuals):.4f}")
    
    return residuals

model.fit(X, y)
y_pred = model.predict(X)
residuals = residual_analysis(y, y_pred)

import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].scatter(y_pred, residuals, alpha=0.6)
axes[0, 0].axhline(y=0, color='r', linestyle='--')
axes[0, 0].set_xlabel('预测值')
axes[0, 0].set_ylabel('残差')
axes[0, 0].set_title('残差 vs 预测值')

axes[0, 1].hist(residuals, bins=30, edgecolor='black', alpha=0.7)
axes[0, 1].set_xlabel('残差')
axes[0, 1].set_ylabel('频数')
axes[0, 1].set_title('残差分布')

axes[1, 0].scatter(y, y_pred, alpha=0.6)
axes[1, 0].plot([y.min(), y.max()], [y.min(), y.max()], 'r--')
axes[1, 0].set_xlabel('真实值')
axes[1, 0].set_ylabel('预测值')
axes[1, 0].set_title('预测值 vs 真实值')

from scipy import stats
stats.probplot(residuals, dist="norm", plot=axes[1, 1])
axes[1, 1].set_title('Q-Q 图')

plt.tight_layout()
plt.savefig('regression_diagnostics.png')
plt.close()

print("\n诊断图已保存为 regression_diagnostics.png")

print("\n模型评估最佳实践:")
print("1. 使用交叉验证评估模型泛化能力")
print("2. 检查残差是否满足正态分布假设")
print("3. 检查残差是否与预测值无关（同方差性）")
print("4. 比较训练集和测试集性能，检测过拟合")
```

#### [关联] 与核心层的关联

模型评估使用损失函数作为基础指标，R² 则从方差解释角度评估模型。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 正则化 | 需要防止过拟合 |
| Ridge 回归 | 需要 L2 正则化 |
| Lasso 回归 | 需要 L1 正则化和特征选择 |
| Elastic Net | 需要同时使用 L1 和 L2 正则化 |
| 多项式回归 | 需要拟合非线性关系 |
| 岭回归 | 需要处理多重共线性 |
| 贝叶斯线性回归 | 需要不确定性估计 |
| 加权最小二乘 | 需要处理异方差 |
| 稳健回归 | 需要抵抗异常值影响 |
| 分位数回归 | 需要预测分位数而非均值 |
| 广义线性模型 | 需要非正态分布响应变量 |
| 逐步回归 | 需要自动特征选择 |
| 偏最小二乘 | 需要处理高维数据 |
| 主成分回归 | 需要降维后回归 |
| 局部加权回归 | 需要非线性局部拟合 |

---

## [实战] 核心实战清单

### 实战任务 1：预测波士顿房价

**任务描述：**

使用线性回归预测房价，包括：
1. 数据探索和预处理
2. 特征选择
3. 模型训练和评估
4. 结果解释

**要求：**
- 使用多元线性回归
- 进行特征标准化
- 使用交叉验证评估

**参考实现：**

```python
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

data = fetch_california_housing()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

print("数据集信息:")
print(f"样本数: {X.shape[0]}")
print(f"特征数: {X.shape[1]}")
print(f"\n特征列表: {list(X.feature_names)}")
print(f"\n目标变量描述: {data.DESCR[:200]}...")

print("\n数据统计:")
print(X.describe())

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LinearRegression()
model.fit(X_train_scaled, y_train)

y_train_pred = model.predict(X_train_scaled)
y_test_pred = model.predict(X_test_scaled)

print("\n模型性能:")
print(f"训练集 R²: {r2_score(y_train, y_train_pred):.4f}")
print(f"测试集 R²: {r2_score(y_test, y_test_pred):.4f}")
print(f"测试集 RMSE: {np.sqrt(mean_squared_error(y_test, y_test_pred)):.4f}")

cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
print(f"\n交叉验证 R²: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

print("\n特征系数:")
for name, coef in zip(X.columns, model.coef_):
    print(f"  {name}: {coef:.4f}")

feature_importance = pd.DataFrame({
    'feature': X.columns,
    'coefficient': model.coef_
}).sort_values('coefficient', key=abs, ascending=False)

plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['coefficient'])
plt.xlabel('系数值')
plt.ylabel('特征')
plt.title('特征重要性（系数绝对值）')
plt.tight_layout()
plt.savefig('feature_importance.png')
plt.close()

print("\n特征重要性图已保存")

ridge = Ridge(alpha=1.0)
ridge.fit(X_train_scaled, y_train)
print(f"\nRidge 回归测试 R²: {ridge.score(X_test_scaled, y_test):.4f}")

lasso = Lasso(alpha=0.01)
lasso.fit(X_train_scaled, y_train)
print(f"Lasso 回归测试 R²: {lasso.score(X_test_scaled, y_test):.4f}")
print(f"Lasso 非零系数数量: {np.sum(lasso.coef_ != 0)}")

print("\n房价预测模型完成!")
```
