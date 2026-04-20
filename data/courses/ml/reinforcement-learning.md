# 强化学习基础 三层深度学习教程

## [总览] 技术总览

强化学习通过智能体与环境的交互学习最优策略。核心概念：状态、动作、奖励、策略。常用算法：Q-Learning、DQN、Policy Gradient、Actor-Critic。广泛应用于游戏 AI、机器人控制、推荐系统。

本教程采用三层漏斗学习法：**核心层**聚焦 Q-Learning、策略评估、探索与利用三大基石；**重点层**深入 DQN 和策略梯度；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Q-Learning

#### [概念] 概念解释

Q-Learning 是值函数方法，学习状态-动作值函数 Q(s,a)。通过贝尔曼方程迭代更新 Q 值，最终选择 Q 值最大的动作。核心公式：Q(s,a) = r + γ * max Q(s',a')。

#### [代码] 代码示例

```python
import numpy as np
from typing import Tuple, List, Dict

class QLearning:
    """Q-Learning 算法实现"""
    
    def __init__(
        self,
        n_states: int,
        n_actions: int,
        learning_rate: float = 0.1,
        discount_factor: float = 0.99,
        epsilon: float = 0.1
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        
        # 初始化 Q 表
        self.q_table = np.zeros((n_states, n_actions))
    
    def get_action(self, state: int, training: bool = True) -> int:
        """选择动作（epsilon-greedy 策略）"""
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.q_table[state])
    
    def update(
        self,
        state: int,
        action: int,
        reward: float,
        next_state: int,
        done: bool
    ) -> None:
        """更新 Q 值"""
        # 计算目标 Q 值
        if done:
            target = reward
        else:
            target = reward + self.gamma * np.max(self.q_table[next_state])
        
        # 更新 Q 值
        self.q_table[state, action] += self.lr * (target - self.q_table[state, action])
    
    def train(
        self,
        env,
        n_episodes: int = 1000,
        max_steps: int = 100,
        verbose: bool = True
    ) -> List[float]:
        """训练"""
        rewards_history = []
        
        for episode in range(n_episodes):
            state = env.reset()
            total_reward = 0
            
            for step in range(max_steps):
                # 选择动作
                action = self.get_action(state, training=True)
                
                # 执行动作
                next_state, reward, done = env.step(action)
                
                # 更新 Q 值
                self.update(state, action, reward, next_state, done)
                
                total_reward += reward
                state = next_state
                
                if done:
                    break
            
            rewards_history.append(total_reward)
            
            if verbose and (episode + 1) % 100 == 0:
                avg_reward = np.mean(rewards_history[-100:])
                print(f"Episode {episode+1}, Avg Reward: {avg_reward:.2f}")
        
        return rewards_history

# 简单环境示例
class GridWorld:
    """网格世界环境"""
    
    def __init__(self, size: int = 4):
        self.size = size
        self.n_states = size * size
        self.n_actions = 4  # 上下左右
        self.goal = (size - 1, size - 1)
        self.state = None
    
    def reset(self) -> int:
        self.state = (0, 0)
        return self._state_to_idx(self.state)
    
    def step(self, action: int) -> Tuple[int, float, bool]:
        # 动作：0=上, 1=下, 2=左, 3=右
        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        new_row = max(0, min(self.size - 1, self.state[0] + moves[action][0]))
        new_col = max(0, min(self.size - 1, self.state[1] + moves[action][1]))
        self.state = (new_row, new_col)
        
        # 到达目标
        if self.state == self.goal:
            return self._state_to_idx(self.state), 1.0, True
        
        return self._state_to_idx(self.state), -0.01, False
    
    def _state_to_idx(self, state: Tuple[int, int]) -> int:
        return state[0] * self.size + state[1]

# 使用示例
if __name__ == "__main__":
    env = GridWorld(size=4)
    agent = QLearning(
        n_states=env.n_states,
        n_actions=env.n_actions,
        learning_rate=0.1,
        discount_factor=0.99,
        epsilon=0.1
    )
    
    rewards = agent.train(env, n_episodes=500, verbose=True)
    
    # 测试
    state = env.reset()
    done = False
    steps = 0
    while not done and steps < 20:
        action = agent.get_action(state, training=False)
        state, reward, done = env.step(action)
        steps += 1
    
    print(f"测试完成，步数: {steps}")
```

### 2. 策略评估

#### [概念] 概念解释

策略评估计算给定策略的价值函数。通过迭代应用贝尔曼期望方程，直到收敛。价值函数 V(s) 表示从状态 s 开始的期望累积奖励。

#### [代码] 代码示例

```python
import numpy as np
from typing import List, Dict

class PolicyEvaluation:
    """策略评估"""
    
    def __init__(
        self,
        n_states: int,
        n_actions: int,
        transition_prob: Dict,
        rewards: Dict,
        discount_factor: float = 0.99
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.P = transition_prob  # P[s][a] = [(prob, next_state, reward, done), ...]
        self.rewards = rewards
        self.gamma = discount_factor
    
    def evaluate_policy(
        self,
        policy: np.ndarray,
        theta: float = 1e-6,
        max_iterations: int = 1000
    ) -> np.ndarray:
        """评估策略的价值函数"""
        V = np.zeros(self.n_states)
        
        for i in range(max_iterations):
            delta = 0
            
            for s in range(self.n_states):
                v = 0
                
                for a in range(self.n_actions):
                    action_prob = policy[s, a]
                    
                    for prob, next_state, reward, done in self.P[s][a]:
                        v += action_prob * prob * (reward + self.gamma * V[next_state] * (1 - done))
                
                delta = max(delta, abs(v - V[s]))
                V[s] = v
            
            if delta < theta:
                print(f"策略评估收敛，迭代次数: {i+1}")
                break
        
        return V
    
    def policy_improvement(self, V: np.ndarray) -> np.ndarray:
        """策略改进"""
        new_policy = np.zeros((self.n_states, self.n_actions))
        
        for s in range(self.n_states):
            q_values = np.zeros(self.n_actions)
            
            for a in range(self.n_actions):
                for prob, next_state, reward, done in self.P[s][a]:
                    q_values[a] += prob * (reward + self.gamma * V[next_state] * (1 - done))
            
            best_action = np.argmax(q_values)
            new_policy[s, best_action] = 1.0
        
        return new_policy
    
    def policy_iteration(
        self,
        max_iterations: int = 100,
        theta: float = 1e-6
    ) -> Tuple[np.ndarray, np.ndarray]:
        """策略迭代"""
        policy = np.ones((self.n_states, self.n_actions)) / self.n_actions
        
        for i in range(max_iterations):
            # 策略评估
            V = self.evaluate_policy(policy, theta)
            
            # 策略改进
            new_policy = self.policy_improvement(V)
            
            # 检查收敛
            if np.array_equal(policy, new_policy):
                print(f"策略迭代收敛，迭代次数: {i+1}")
                break
            
            policy = new_policy
        
        return policy, V

# 使用示例
if __name__ == "__main__":
    # 简化的转移概率
    n_states = 4
    n_actions = 2
    
    P = {
        0: {0: [(1.0, 1, 0, False)], 1: [(1.0, 2, 0, False)]},
        1: {0: [(1.0, 3, 1, True)], 1: [(1.0, 0, 0, False)]},
        2: {0: [(1.0, 0, 0, False)], 1: [(1.0, 3, 1, True)]},
        3: {0: [(1.0, 3, 0, True)], 1: [(1.0, 3, 0, True)]}
    }
    
    pe = PolicyEvaluation(n_states, n_actions, P, {}, 0.99)
    policy, V = pe.policy_iteration()
    
    print(f"价值函数: {V}")
    print(f"最优策略: {np.argmax(policy, axis=1)}")
```

### 3. 探索与利用

#### [概念] 概念解释

探索与利用是强化学习的核心权衡。探索尝试新动作发现更优策略，利用选择当前最优动作。常用策略：epsilon-greedy、UCB、Thompson Sampling。

#### [代码] 代码示例

```python
import numpy as np
from typing import List

class ExplorationStrategies:
    """探索策略"""
    
    @staticmethod
    def epsilon_greedy(q_values: np.ndarray, epsilon: float) -> int:
        """Epsilon-Greedy 策略"""
        if np.random.random() < epsilon:
            return np.random.randint(len(q_values))
        return np.argmax(q_values)
    
    @staticmethod
    def ucb(q_values: np.ndarray, counts: np.ndarray, total_count: int, c: float = 1.0) -> int:
        """UCB（Upper Confidence Bound）策略"""
        # 避免除零
        counts = np.maximum(counts, 1)
        
        # 计算 UCB 值
        ucb_values = q_values + c * np.sqrt(np.log(total_count + 1) / counts)
        
        return np.argmax(ucb_values)
    
    @staticmethod
    def softmax(q_values: np.ndarray, temperature: float = 1.0) -> int:
        """Softmax 策略"""
        exp_q = np.exp(q_values / temperature)
        probs = exp_q / np.sum(exp_q)
        return np.random.choice(len(q_values), p=probs)

class MultiArmedBandit:
    """多臂老虎机"""
    
    def __init__(self, n_arms: int, true_rewards: np.ndarray = None):
        self.n_arms = n_arms
        if true_rewards is None:
            self.true_rewards = np.random.uniform(0, 1, n_arms)
        else:
            self.true_rewards = true_rewards
    
    def pull(self, arm: int) -> float:
        """拉动拉杆"""
        return np.random.binomial(1, self.true_rewards[arm])
    
    def run_experiment(
        self,
        n_rounds: int,
        strategy: str = 'epsilon_greedy',
        epsilon: float = 0.1
    ) -> List[float]:
        """运行实验"""
        q_values = np.zeros(self.n_arms)
        counts = np.zeros(self.n_arms)
        rewards = []
        
        for round_num in range(n_rounds):
            # 选择动作
            if strategy == 'epsilon_greedy':
                arm = ExplorationStrategies.epsilon_greedy(q_values, epsilon)
            elif strategy == 'ucb':
                arm = ExplorationStrategies.ucb(q_values, counts, round_num + 1)
            else:
                arm = ExplorationStrategies.softmax(q_values)
            
            # 拉动拉杆
            reward = self.pull(arm)
            rewards.append(reward)
            
            # 更新估计
            counts[arm] += 1
            q_values[arm] += (reward - q_values[arm]) / counts[arm]
        
        return rewards

# 使用示例
if __name__ == "__main__":
    np.random.seed(42)
    
    bandit = MultiArmedBandit(n_arms=5)
    print(f"真实奖励概率: {bandit.true_rewards}")
    
    # 比较不同策略
    for strategy in ['epsilon_greedy', 'ucb', 'softmax']:
        rewards = bandit.run_experiment(n_rounds=1000, strategy=strategy)
        avg_reward = np.mean(rewards)
        optimal_reward = np.max(bandit.true_rewards)
        regret = optimal_reward - avg_reward
        
        print(f"{strategy}: 平均奖励={avg_reward:.3f}, 遗憾={regret:.3f}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. DQN（Deep Q-Network）

#### [概念] 概念解释

DQN 使用神经网络近似 Q 函数，处理高维状态空间。关键技术：经验回放（打破数据相关性）、目标网络（稳定训练）、双 Q 学习（减少过估计）。

#### [代码] 代码示例

```python
import numpy as np
from collections import deque
import random

class ReplayBuffer:
    """经验回放缓冲区"""
    
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            np.array(states),
            np.array(actions),
            np.array(rewards),
            np.array(next_states),
            np.array(dones)
        )
    
    def __len__(self):
        return len(self.buffer)

class DQN:
    """简化版 DQN"""
    
    def __init__(
        self,
        state_dim: int,
        n_actions: int,
        learning_rate: float = 0.001,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.01,
        epsilon_decay: float = 0.995
    ):
        self.state_dim = state_dim
        self.n_actions = n_actions
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        
        # Q 网络和目标网络（简化：使用线性权重）
        self.q_weights = np.random.randn(state_dim, n_actions) * 0.01
        self.target_weights = self.q_weights.copy()
        
        self.lr = learning_rate
        self.buffer = ReplayBuffer()
        self.update_count = 0
    
    def get_action(self, state: np.ndarray, training: bool = True) -> int:
        """选择动作"""
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        
        q_values = state @ self.q_weights
        return np.argmax(q_values)
    
    def update(self, batch_size: int = 32):
        """更新网络"""
        if len(self.buffer) < batch_size:
            return
        
        # 采样
        states, actions, rewards, next_states, dones = self.buffer.sample(batch_size)
        
        # 计算 Q 值
        current_q = (states @ self.q_weights)[np.arange(batch_size), actions]
        
        # 计算目标 Q 值
        next_q = next_states @ self.target_weights
        max_next_q = np.max(next_q, axis=1)
        target_q = rewards + self.gamma * max_next_q * (1 - dones)
        
        # 计算梯度并更新
        td_error = target_q - current_q
        grad = np.zeros_like(self.q_weights)
        
        for i in range(batch_size):
            grad[:, actions[i]] += -td_error[i] * states[i]
        
        grad /= batch_size
        self.q_weights -= self.lr * grad
        
        # 更新目标网络
        self.update_count += 1
        if self.update_count % 100 == 0:
            self.target_weights = self.q_weights.copy()
        
        # 衰减 epsilon
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)
    
    def train(self, env, n_episodes: int = 100, max_steps: int = 200):
        """训练"""
        rewards_history = []
        
        for episode in range(n_episodes):
            state = env.reset()
            total_reward = 0
            
            for step in range(max_steps):
                action = self.get_action(state)
                next_state, reward, done = env.step(action)
                
                self.buffer.push(state, action, reward, next_state, done)
                self.update()
                
                total_reward += reward
                state = next_state
                
                if done:
                    break
            
            rewards_history.append(total_reward)
            
            if (episode + 1) % 10 == 0:
                avg_reward = np.mean(rewards_history[-10:])
                print(f"Episode {episode+1}, Avg Reward: {avg_reward:.2f}, Epsilon: {self.epsilon:.3f}")
        
        return rewards_history
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| DQN | Deep Q-Network |
| Double DQN | 双 Q 学习 |
| Dueling DQN | 对决网络 |
| REINFORCE | 策略梯度 |
| Actor-Critic | 演员-评论家 |
| A3C | 异步优势评论家 |
| PPO | 近端策略优化 |
| SAC | Soft Actor-Critic |
| DDPG | 深度确定性策略梯度 |
| TD3 | Twin Delayed DDPG |

---

## [实战] 核心实战清单

1. 实现 Q-Learning 解决网格世界问题
2. 使用 DQN 解决 CartPole 环境
3. 比较不同探索策略在多臂老虎机上的表现

## [避坑] 三层避坑提醒

- **核心层误区**：探索率衰减过快，导致陷入局部最优
- **重点层误区**：DQN 训练不稳定，需要合理设置超参数
- **扩展层建议**：使用 Stable Baselines3 等成熟库，简化开发
