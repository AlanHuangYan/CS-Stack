# 动态规划 三层深度学习教程

## [总览] 技术总览

动态规划是一种通过将问题分解为子问题来求解的算法思想。适用于具有最优子结构和重叠子问题性质的问题。掌握动态规划可以高效解决许多看似复杂的问题。

本教程采用三层漏斗学习法：**核心层**聚焦状态定义、状态转移、基础问题三大基石；**重点层**深入背包问题、区间 DP、状态压缩；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 状态定义与转移

#### [概念] 概念解释

动态规划的核心是定义状态和状态转移方程。状态表示问题的某个阶段，转移方程描述状态之间的关系。

#### [代码] 代码示例

```python
# 斐波那契数列 - 最基础的 DP
def fib(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

# 空间优化
def fib_optimized(n):
    if n <= 1:
        return n
    
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    
    return curr

# 爬楼梯
def climb_stairs(n):
    if n <= 2:
        return n
    
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

print(fib(10))        # 55
print(climb_stairs(5))  # 8
```

### 2. 最长递增子序列

#### [概念] 概念解释

最长递增子序列（LIS）是动态规划的经典问题。给定序列，找到最长的严格递增子序列。

#### [代码] 代码示例

```python
# O(n^2) 解法
def length_of_lis(nums):
    if not nums:
        return 0
    
    n = len(nums)
    dp = [1] * n
    
    for i in range(1, n):
        for j in range(i):
            if nums[i] > nums[j]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)

# O(n log n) 解法 - 二分优化
def length_of_lis_optimized(nums):
    tails = []
    
    for num in nums:
        left, right = 0, len(tails)
        
        while left < right:
            mid = (left + right) // 2
            if tails[mid] < num:
                left = mid + 1
            else:
                right = mid
        
        if left == len(tails):
            tails.append(num)
        else:
            tails[left] = num
    
    return len(tails)

print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
```

### 3. 最长公共子序列

#### [概念] 概念解释

最长公共子序列（LCS）是两个序列的最长公共子序列。是经典的二维 DP 问题。

#### [代码] 代码示例

```python
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]

# 空间优化
def lcs_optimized(text1, text2):
    if len(text1) < len(text2):
        text1, text2 = text2, text1
    
    prev = [0] * (len(text2) + 1)
    
    for c1 in text1:
        curr = [0] * (len(text2) + 1)
        for j, c2 in enumerate(text2, 1):
            if c1 == c2:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev = curr
    
    return prev[-1]

print(longest_common_subsequence("abcde", "ace"))  # 3
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 背包问题

#### [代码] 代码示例

```python
# 0-1 背包
def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

# 完全背包
def knapsack_complete(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        for w in range(weights[i], capacity + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

# 零钱兑换
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

print(knapsack_01([2, 3, 4, 5], [3, 4, 5, 6], 5))  # 7
print(coin_change([1, 2, 5], 11))  # 3
```

### 2. 区间 DP

#### [代码] 代码示例

```python
# 矩阵链乘法
def matrix_chain_order(p):
    n = len(p) - 1
    dp = [[0] * n for _ in range(n)]
    
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1]
                dp[i][j] = min(dp[i][j], cost)
    
    return dp[0][n - 1]

# 最长回文子序列
def longest_palindrome_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    
    for i in range(n):
        dp[i][i] = 1
    
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    
    return dp[0][n - 1]

print(matrix_chain_order([10, 30, 5, 60]))  # 4500
print(longest_palindrome_subseq("bbbab"))  # 4
```

### 3. 状态压缩 DP

#### [代码] 代码示例

```python
# 旅行商问题
def traveling_salesman(graph):
    n = len(graph)
    dp = [[float('inf')] * n for _ in range(1 << n)]
    dp[1][0] = 0
    
    for mask in range(1, 1 << n):
        for u in range(n):
            if mask & (1 << u):
                for v in range(n):
                    if not (mask & (1 << v)):
                        new_mask = mask | (1 << v)
                        dp[new_mask][v] = min(dp[new_mask][v], dp[mask][u] + graph[u][v])
    
    final_mask = (1 << n) - 1
    return min(dp[final_mask][i] + graph[i][0] for i in range(1, n))
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Edit Distance | 需要编辑距离时 |
| Regular Expression | 需要正则匹配时 |
| Wildcard Matching | 需要通配符匹配时 |
| Stock Trading | 需要股票交易问题时 |
| House Robber | 需要打家劫舍问题时 |
| Decode Ways | 需要解码方法时 |
| Unique Paths | 需要路径计数时 |
| Minimum Path | 需要最小路径时 |
| Palindrome Partition | 需要回文分割时 |
| Word Break | 需要单词拆分时 |

---

## [实战] 核心实战清单

### 实战任务 1：实现股票交易问题

```python
def max_profit_k_transactions(prices, k):
    n = len(prices)
    if n <= 1 or k == 0:
        return 0
    
    if k >= n // 2:
        return sum(max(0, prices[i + 1] - prices[i]) for i in range(n - 1))
    
    dp = [[0] * n for _ in range(k + 1)]
    
    for t in range(1, k + 1):
        max_diff = -prices[0]
        for d in range(1, n):
            dp[t][d] = max(dp[t][d - 1], prices[d] + max_diff)
            max_diff = max(max_diff, dp[t - 1][d] - prices[d])
    
    return dp[k][n - 1]

print(max_profit_k_transactions([3, 2, 6, 5, 0, 3], 2))  # 7
```
