# 算法数学基础 三层深度学习教程

## [总览] 技术总览

算法数学基础是理解高效算法的关键，涵盖数论、组合数学、概率论、离散数学等领域。掌握这些数学工具能帮助设计更优算法、分析复杂度、解决复杂问题。

本教程采用三层漏斗学习法：**核心层**聚焦数论基础、组合计数、概率基础三大基石；**重点层**深入数学证明和算法应用；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数论基础

#### [概念] 概念解释

数论研究整数性质，在算法中应用广泛：最大公约数、素数判定、模运算、快速幂。这些是密码学、哈希算法、数论算法的基础。

#### [代码] 代码示例

```python
# 数论基础算法
from typing import List, Tuple
import math

class NumberTheory:
    """数论基础"""
    
    @staticmethod
    def gcd(a: int, b: int) -> int:
        """最大公约数 - 欧几里得算法"""
        while b:
            a, b = b, a % b
        return a
    
    @staticmethod
    def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
        """扩展欧几里得算法 - 返回 (gcd, x, y) 使得 ax + by = gcd"""
        if b == 0:
            return a, 1, 0
        
        gcd, x1, y1 = NumberTheory.extended_gcd(b, a % b)
        x = y1
        y = x1 - (a // b) * y1
        
        return gcd, x, y
    
    @staticmethod
    def lcm(a: int, b: int) -> int:
        """最小公倍数"""
        return abs(a * b) // NumberTheory.gcd(a, b)
    
    @staticmethod
    def is_prime(n: int) -> bool:
        """素数判定 - 试除法"""
        if n < 2:
            return False
        if n == 2:
            return True
        if n % 2 == 0:
            return False
        
        for i in range(3, int(math.sqrt(n)) + 1, 2):
            if n % i == 0:
                return False
        return True
    
    @staticmethod
    def sieve_of_eratosthenes(n: int) -> List[int]:
        """埃拉托斯特尼筛法 - 找出所有小于 n 的素数"""
        if n < 2:
            return []
        
        is_prime = [True] * n
        is_prime[0] = is_prime[1] = False
        
        for i in range(2, int(math.sqrt(n)) + 1):
            if is_prime[i]:
                for j in range(i * i, n, i):
                    is_prime[j] = False
        
        return [i for i in range(n) if is_prime[i]]
    
    @staticmethod
    def prime_factors(n: int) -> List[Tuple[int, int]]:
        """质因数分解 - 返回 [(质数, 指数), ...]"""
        factors = []
        d = 2
        
        while d * d <= n:
            if n % d == 0:
                count = 0
                while n % d == 0:
                    n //= d
                    count += 1
                factors.append((d, count))
            d += 1
        
        if n > 1:
            factors.append((n, 1))
        
        return factors
    
    @staticmethod
    def mod_pow(base: int, exp: int, mod: int) -> int:
        """快速幂取模 - O(log exp)"""
        result = 1
        base = base % mod
        
        while exp > 0:
            if exp % 2 == 1:
                result = (result * base) % mod
            exp = exp >> 1
            base = (base * base) % mod
        
        return result
    
    @staticmethod
    def mod_inverse(a: int, m: int) -> int:
        """模逆元 - 找 x 使得 ax ≡ 1 (mod m)"""
        gcd, x, _ = NumberTheory.extended_gcd(a, m)
        if gcd != 1:
            raise ValueError("Modular inverse does not exist")
        return (x % m + m) % m

class ModularArithmetic:
    """模运算"""
    
    @staticmethod
    def add(a: int, b: int, mod: int) -> int:
        return (a + b) % mod
    
    @staticmethod
    def subtract(a: int, b: int, mod: int) -> int:
        return (a - b + mod) % mod
    
    @staticmethod
    def multiply(a: int, b: int, mod: int) -> int:
        return (a * b) % mod
    
    @staticmethod
    def divide(a: int, b: int, mod: int) -> int:
        return (a * NumberTheory.mod_inverse(b, mod)) % mod

class TestNumberTheory:
    
    def test_gcd(self):
        assert NumberTheory.gcd(48, 18) == 6
        assert NumberTheory.gcd(17, 13) == 1
    
    def test_extended_gcd(self):
        gcd, x, y = NumberTheory.extended_gcd(35, 15)
        assert gcd == 5
        assert 35 * x + 15 * y == 5
    
    def test_is_prime(self):
        assert NumberTheory.is_prime(17) is True
        assert NumberTheory.is_prime(18) is False
    
    def test_mod_pow(self):
        assert NumberTheory.mod_pow(2, 10, 1000) == 24
        assert NumberTheory.mod_pow(3, 7, 13) == 3
    
    def test_prime_factors(self):
        assert NumberTheory.prime_factors(60) == [(2, 2), (3, 1), (5, 1)]
```

### 2. 组合计数

#### [概念] 概念解释

组合计数研究计数问题：排列、组合、鸽巢原理、容斥原理。在算法分析、概率计算、动态规划中有广泛应用。

#### [代码] 代码示例

```python
# 组合计数算法
from typing import List
from functools import lru_cache

class Combinatorics:
    """组合数学"""
    
    @staticmethod
    def factorial(n: int, mod: int = None) -> int:
        """阶乘"""
        result = 1
        for i in range(2, n + 1):
            result = result * i if mod is None else (result * i) % mod
        return result
    
    @staticmethod
    def permutation(n: int, r: int, mod: int = None) -> int:
        """排列数 P(n, r) = n! / (n-r)!"""
        if r > n:
            return 0
        result = 1
        for i in range(n, n - r, -1):
            result = result * i if mod is None else (result * i) % mod
        return result
    
    @staticmethod
    def combination(n: int, r: int, mod: int = None) -> int:
        """组合数 C(n, r) = n! / (r! * (n-r)!)"""
        if r > n or r < 0:
            return 0
        if r == 0 or r == n:
            return 1
        
        r = min(r, n - r)
        result = 1
        for i in range(r):
            result = result * (n - i) // (i + 1)
        
        return result if mod is None else result % mod
    
    @staticmethod
    @lru_cache(maxsize=None)
    def combination_recursive(n: int, r: int) -> int:
        """递归计算组合数 - 帕斯卡三角形"""
        if r == 0 or r == n:
            return 1
        return (Combinatorics.combination_recursive(n - 1, r - 1) + 
                Combinatorics.combination_recursive(n - 1, r))
    
    @staticmethod
    def precompute_factorials(n: int, mod: int) -> tuple:
        """预计算阶乘和逆元"""
        fact = [1] * (n + 1)
        inv_fact = [1] * (n + 1)
        
        for i in range(1, n + 1):
            fact[i] = fact[i - 1] * i % mod
        
        inv_fact[n] = pow(fact[n], mod - 2, mod)
        for i in range(n - 1, -1, -1):
            inv_fact[i] = inv_fact[i + 1] * (i + 1) % mod
        
        return fact, inv_fact
    
    @staticmethod
    def combination_precomputed(n: int, r: int, fact: List[int], inv_fact: List[int], mod: int) -> int:
        """使用预计算快速求组合数"""
        if r > n or r < 0:
            return 0
        return fact[n] * inv_fact[r] % mod * inv_fact[n - r] % mod

class Pigeonhole:
    """鸽巢原理应用"""
    
    @staticmethod
    def find_duplicate(nums: List[int]) -> int:
        """鸽巢原理找重复数 - n+1 个数放在 n 个位置"""
        slow = fast = nums[0]
        
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        
        return slow
    
    @staticmethod
    def find_subarray_with_sum(arr: List[int], target: int) -> tuple:
        """找和为 target 的子数组 - 前缀和 + 鸽巢"""
        prefix_sum = 0
        seen = {0: -1}
        
        for i, num in enumerate(arr):
            prefix_sum += num
            
            if prefix_sum - target in seen:
                return (seen[prefix_sum - target] + 1, i)
            
            seen[prefix_sum] = i
        
        return None

class InclusionExclusion:
    """容斥原理"""
    
    @staticmethod
    def count_divisible(n: int, divisors: List[int]) -> int:
        """计算 1 到 n 中能被 divisors 中任一数整除的数的个数"""
        from itertools import combinations
        
        m = len(divisors)
        result = 0
        
        for r in range(1, m + 1):
            for combo in combinations(divisors, r):
                from math import prod
                lcm = 1
                for d in combo:
                    lcm = lcm * d // math.gcd(lcm, d)
                
                count = n // lcm
                if r % 2 == 1:
                    result += count
                else:
                    result -= count
        
        return result

class TestCombinatorics:
    
    def test_factorial(self):
        assert Combinatorics.factorial(5) == 120
    
    def test_combination(self):
        assert Combinatorics.combination(5, 2) == 10
        assert Combinatorics.combination(10, 3) == 120
    
    def test_pigeonhole(self):
        nums = [1, 3, 4, 2, 2]
        assert Pigeonhole.find_duplicate(nums) == 2
```

### 3. 概率基础

#### [概念] 概念解释

概率论在算法中用于分析随机算法、估算复杂度、设计近似算法。核心概念包括：期望、方差、条件概率、贝叶斯定理。

#### [代码] 代码示例

```python
# 概率基础算法
import random
from typing import List, Callable
import math

class ProbabilityBasics:
    """概率基础"""
    
    @staticmethod
    def expected_value(values: List[float], probabilities: List[float]) -> float:
        """计算期望 E[X] = sum(x_i * p_i)"""
        return sum(v * p for v, p in zip(values, probabilities))
    
    @staticmethod
    def variance(values: List[float], probabilities: List[float]) -> float:
        """计算方差 Var(X) = E[X^2] - E[X]^2"""
        mean = ProbabilityBasics.expected_value(values, probabilities)
        squared_values = [v ** 2 for v in values]
        mean_squared = ProbabilityBasics.expected_value(squared_values, probabilities)
        return mean_squared - mean ** 2
    
    @staticmethod
    def conditional_probability(p_a_and_b: float, p_b: float) -> float:
        """条件概率 P(A|B) = P(A and B) / P(B)"""
        if p_b == 0:
            return 0
        return p_a_and_b / p_b
    
    @staticmethod
    def bayes_theorem(p_b_given_a: float, p_a: float, p_b: float) -> float:
        """贝叶斯定理 P(A|B) = P(B|A) * P(A) / P(B)"""
        if p_b == 0:
            return 0
        return p_b_given_a * p_a / p_b

class RandomizedAlgorithms:
    """随机化算法"""
    
    @staticmethod
    def quickselect(arr: List[int], k: int) -> int:
        """随机快速选择 - 期望 O(n)"""
        if len(arr) == 1:
            return arr[0]
        
        pivot = random.choice(arr)
        left = [x for x in arr if x < pivot]
        right = [x for x in arr if x > pivot]
        equal = [x for x in arr if x == pivot]
        
        if k < len(left):
            return RandomizedAlgorithms.quickselect(left, k)
        elif k < len(left) + len(equal):
            return pivot
        else:
            return RandomizedAlgorithms.quickselect(right, k - len(left) - len(equal))
    
    @staticmethod
    def reservoir_sampling(stream: List[int], k: int) -> List[int]:
        """蓄水池采样 - 从数据流中随机选取 k 个元素"""
        reservoir = stream[:k]
        
        for i in range(k, len(stream)):
            j = random.randint(0, i)
            if j < k:
                reservoir[j] = stream[i]
        
        return reservoir
    
    @staticmethod
    def monte_carlo_pi(n: int) -> float:
        """蒙特卡洛方法估算 Pi"""
        inside = 0
        
        for _ in range(n):
            x = random.random()
            y = random.random()
            
            if x * x + y * y <= 1:
                inside += 1
        
        return 4 * inside / n
    
    @staticmethod
    def las_vegas_search(arr: List[int], target: int) -> int:
        """拉斯维加斯算法 - 总是正确，运行时间随机"""
        checked = set()
        
        while len(checked) < len(arr):
            i = random.randint(0, len(arr) - 1)
            
            if i in checked:
                continue
            
            checked.add(i)
            
            if arr[i] == target:
                return i
        
        return -1

class ProbabilityAnalysis:
    """概率分析"""
    
    @staticmethod
    def birthday_paradox(n: int) -> float:
        """生日悖论 - n 人中至少两人同生日的概率"""
        if n > 365:
            return 1.0
        
        prob_different = 1.0
        for i in range(n):
            prob_different *= (365 - i) / 365
        
        return 1 - prob_different
    
    @staticmethod
    def coupon_collector(n: int) -> float:
        """集卡问题期望 - 收集 n 种卡片需要的期望次数"""
        result = 0
        for i in range(1, n + 1):
            result += n / i
        return result
    
    @staticmethod
    def bloom_filter_false_positive(n: int, m: int, k: int) -> float:
        """布隆过滤器假阳性率
        n: 元素数量
        m: 位数组大小
        k: 哈希函数数量
        """
        return (1 - math.exp(-k * n / m)) ** k

class TestProbability:
    
    def test_expected_value(self):
        values = [1, 2, 3, 4, 5, 6]
        probs = [1/6] * 6
        expected = ProbabilityBasics.expected_value(values, probs)
        assert abs(expected - 3.5) < 0.01
    
    def test_quickselect(self):
        arr = [3, 1, 4, 1, 5, 9, 2, 6]
        assert RandomizedAlgorithms.quickselect(arr, 3) == 3
    
    def test_birthday_paradox(self):
        prob = ProbabilityAnalysis.birthday_paradox(23)
        assert prob > 0.5
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 数学证明技术

#### [概念] 概念解释

算法正确性证明常用技术：数学归纳法、反证法、构造性证明、循环不变式。掌握这些技术能严谨地验证算法正确性。

#### [代码] 代码示例

```python
# 数学证明技术示例
from typing import List, Tuple

class ProofTechniques:
    """证明技术"""
    
    @staticmethod
    def prove_sum_formula(n: int) -> Tuple[int, int]:
        """
        数学归纳法证明: 1 + 2 + ... + n = n(n+1)/2
        
        基础情况: n=1 时, 1 = 1*2/2 = 1 ✓
        归纳假设: 假设对 k 成立
        归纳步骤: 对 k+1
            1 + 2 + ... + k + (k+1)
            = k(k+1)/2 + (k+1)
            = (k+1)(k+2)/2 ✓
        """
        actual_sum = sum(range(1, n + 1))
        formula_result = n * (n + 1) // 2
        return actual_sum, formula_result
    
    @staticmethod
    def prove_binary_search_correctness(arr: List[int], target: int) -> Tuple[bool, int]:
        """
        循环不变式证明二分查找正确性
        
        不变式: target 如果存在，必在 [left, right] 范围内
        
        初始化: left=0, right=len(arr)-1, target 在整个数组中
        保持: 每次迭代缩小范围，不变式保持
        终止: left > right 时，范围空，返回 -1；或找到返回索引
        """
        left, right = 0, len(arr) - 1
        
        while left <= right:
            mid = (left + right) // 2
            
            if arr[mid] == target:
                return True, mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return False, -1
    
    @staticmethod
    def prove_by_contradiction(n: int) -> bool:
        """
        反证法证明: sqrt(2) 是无理数
        
        假设 sqrt(2) = p/q (p, q 互质)
        则 2 = p^2/q^2
        p^2 = 2q^2
        所以 p 是偶数，设 p = 2r
        4r^2 = 2q^2
        q^2 = 2r^2
        所以 q 也是偶数
        与 p, q 互质矛盾
        """
        import math
        root = math.sqrt(n)
        return not root.is_integer()

class AlgorithmCorrectness:
    """算法正确性验证"""
    
    @staticmethod
    def verify_sort_correctness(sort_func: callable, arr: List[int]) -> bool:
        """验证排序算法正确性"""
        sorted_arr = sort_func(arr.copy())
        
        if len(sorted_arr) != len(arr):
            return False
        
        for i in range(len(sorted_arr) - 1):
            if sorted_arr[i] > sorted_arr[i + 1]:
                return False
        
        from collections import Counter
        if Counter(sorted_arr) != Counter(arr):
            return False
        
        return True
    
    @staticmethod
    def verify_search_correctness(search_func: callable, arr: List[int], target: int) -> bool:
        """验证搜索算法正确性"""
        result = search_func(arr, target)
        
        if target in arr:
            if result == -1 or arr[result] != target:
                return False
        else:
            if result != -1:
                return False
        
        return True

class LoopInvariant:
    """循环不变式示例"""
    
    @staticmethod
    def insertion_sort_with_invariant(arr: List[int]) -> List[int]:
        """
        插入排序循环不变式:
        
        外循环不变式: arr[0..i-1] 已排序
        
        初始化: i=1, arr[0] 单元素已排序
        保持: 将 arr[i] 插入正确位置，arr[0..i] 已排序
        终止: i=n, arr[0..n-1] 已排序
        """
        arr = arr.copy()
        
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            
            while j >= 0 and arr[j] > key:
                arr[j + 1] = arr[j]
                j -= 1
            
            arr[j + 1] = key
        
        return arr

class TestProofTechniques:
    
    def test_sum_formula(self):
        actual, formula = ProofTechniques.prove_sum_formula(100)
        assert actual == formula
    
    def test_binary_search_correctness(self):
        arr = [1, 3, 5, 7, 9]
        found, idx = ProofTechniques.prove_binary_search_correctness(arr, 5)
        assert found and idx == 2
    
    def test_insertion_sort(self):
        arr = [5, 2, 4, 6, 1, 3]
        sorted_arr = LoopInvariant.insertion_sort_with_invariant(arr)
        assert sorted_arr == [1, 2, 3, 4, 5, 6]
```

### 2. 矩阵与线性代数

#### [概念] 概念解释

线性代数在算法中的应用：矩阵乘法、线性方程组求解、图论算法（邻接矩阵）、机器学习算法。Strassen 算法将矩阵乘法优化到 O(n^2.807)。

#### [代码] 代码示例

```python
# 矩阵与线性代数
from typing import List
import copy

class Matrix:
    """矩阵运算"""
    
    @staticmethod
    def multiply(A: List[List[int]], B: List[List[int]]) -> List[List[int]]:
        """标准矩阵乘法 O(n^3)"""
        n = len(A)
        m = len(B[0])
        p = len(B)
        
        result = [[0] * m for _ in range(n)]
        
        for i in range(n):
            for j in range(m):
                for k in range(p):
                    result[i][j] += A[i][k] * B[k][j]
        
        return result
    
    @staticmethod
    def strassen_multiply(A: List[List[int]], B: List[List[int]]) -> List[List[int]]:
        """Strassen 矩阵乘法 O(n^2.807)"""
        n = len(A)
        
        if n <= 64:
            return Matrix.multiply(A, B)
        
        def add_matrix(X, Y):
            return [[X[i][j] + Y[i][j] for j in range(len(X[0]))] 
                    for i in range(len(X))]
        
        def subtract_matrix(X, Y):
            return [[X[i][j] - Y[i][j] for j in range(len(X[0]))] 
                    for i in range(len(X))]
        
        def split(M):
            n = len(M)
            mid = n // 2
            return (
                [row[:mid] for row in M[:mid]],
                [row[mid:] for row in M[:mid]],
                [row[:mid] for row in M[mid:]],
                [row[mid:] for row in M[mid:]]
            )
        
        def merge(C11, C12, C21, C22):
            n = len(C11)
            return [[C11[i][j] if j < n else C12[i][j-n] 
                     for j in range(2*n)] 
                    for i in range(2*n)]
        
        A11, A12, A21, A22 = split(A)
        B11, B12, B21, B22 = split(B)
        
        M1 = Matrix.strassen_multiply(
            add_matrix(A11, A22), add_matrix(B11, B22)
        )
        M2 = Matrix.strassen_multiply(
            add_matrix(A21, A22), B11
        )
        M3 = Matrix.strassen_multiply(
            A11, subtract_matrix(B12, B22)
        )
        M4 = Matrix.strassen_multiply(
            A22, subtract_matrix(B21, B11)
        )
        M5 = Matrix.strassen_multiply(
            add_matrix(A11, A12), B22
        )
        M6 = Matrix.strassen_multiply(
            subtract_matrix(A21, A11), add_matrix(B11, B12)
        )
        M7 = Matrix.strassen_multiply(
            subtract_matrix(A12, A22), add_matrix(B21, B22)
        )
        
        C11 = add_matrix(subtract_matrix(add_matrix(M1, M4), M5), M7)
        C12 = add_matrix(M3, M5)
        C21 = add_matrix(M2, M4)
        C22 = subtract_matrix(add_matrix(add_matrix(M1, M3), M6), M2)
        
        return merge(C11, C12, C21, C22)
    
    @staticmethod
    def power(A: List[List[int]], n: int) -> List[List[int]]:
        """矩阵快速幂 - 用于斐波那契等"""
        size = len(A)
        result = [[1 if i == j else 0 for j in range(size)] for i in range(size)]
        
        while n > 0:
            if n % 2 == 1:
                result = Matrix.multiply(result, A)
            A = Matrix.multiply(A, A)
            n //= 2
        
        return result
    
    @staticmethod
    def fibonacci_matrix(n: int) -> int:
        """矩阵快速幂求斐波那契 O(log n)"""
        if n <= 1:
            return n
        
        F = [[1, 1], [1, 0]]
        result = Matrix.power(F, n - 1)
        
        return result[0][0]

class LinearEquations:
    """线性方程组"""
    
    @staticmethod
    def gaussian_elimination(A: List[List[float]], b: List[float]) -> List[float]:
        """高斯消元法求解线性方程组"""
        n = len(A)
        augmented = [A[i] + [b[i]] for i in range(n)]
        
        for col in range(n):
            max_row = col
            for row in range(col + 1, n):
                if abs(augmented[row][col]) > abs(augmented[max_row][col]):
                    max_row = row
            augmented[col], augmented[max_row] = augmented[max_row], augmented[col]
            
            if abs(augmented[col][col]) < 1e-10:
                continue
            
            for row in range(col + 1, n):
                factor = augmented[row][col] / augmented[col][col]
                for j in range(col, n + 1):
                    augmented[row][j] -= factor * augmented[col][j]
        
        x = [0] * n
        for i in range(n - 1, -1, -1):
            x[i] = augmented[i][n]
            for j in range(i + 1, n):
                x[i] -= augmented[i][j] * x[j]
            if abs(augmented[i][i]) > 1e-10:
                x[i] /= augmented[i][i]
        
        return x

class TestMatrix:
    
    def test_matrix_multiply(self):
        A = [[1, 2], [3, 4]]
        B = [[5, 6], [7, 8]]
        result = Matrix.multiply(A, B)
        assert result == [[19, 22], [43, 50]]
    
    def test_fibonacci_matrix(self):
        assert Matrix.fibonacci_matrix(10) == 55
    
    def test_gaussian_elimination(self):
        A = [[2, 1], [1, 3]]
        b = [5, 10]
        x = LinearEquations.gaussian_elimination(A, b)
        assert abs(x[0] - 1) < 0.01
        assert abs(x[1] - 3) < 0.01
```

### 3. 生成函数

#### [概念] 概念解释

生成函数将序列编码为多项式，用于解决递推关系、计数问题。普通生成函数用于组合计数，指数生成函数用于排列计数。

#### [代码] 代码示例

```python
# 生成函数应用
from typing import List, Tuple
from collections import defaultdict

class GeneratingFunctions:
    """生成函数"""
    
    @staticmethod
    def ordinary_gf(sequence: List[int], max_power: int) -> List[int]:
        """
        普通生成函数 G(x) = a_0 + a_1*x + a_2*x^2 + ...
        返回多项式系数
        """
        return sequence[:max_power + 1]
    
    @staticmethod
    def polynomial_multiply(p: List[int], q: List[int]) -> List[int]:
        """多项式乘法"""
        result = [0] * (len(p) + len(q) - 1)
        
        for i, a in enumerate(p):
            for j, b in enumerate(q):
                result[i + j] += a * b
        
        return result
    
    @staticmethod
    def coin_change_gf(coins: List[int], amount: int) -> int:
        """
        生成函数解决硬币问题
        
        (1 + x + x^2 + ...)(1 + x^5 + x^10 + ...)...
        每个括号代表一种面额的贡献
        """
        dp = [0] * (amount + 1)
        dp[0] = 1
        
        for coin in coins:
            for i in range(coin, amount + 1):
                dp[i] += dp[i - coin]
        
        return dp[amount]
    
    @staticmethod
    def partition_gf(n: int) -> int:
        """
        整数划分的生成函数解法
        
        P(x) = (1-x^(-1))(1-x^(-2))...
        """
        dp = [0] * (n + 1)
        dp[0] = 1
        
        for i in range(1, n + 1):
            for j in range(i, n + 1):
                dp[j] += dp[j - i]
        
        return dp[n]
    
    @staticmethod
    def fibonacci_gf(n: int) -> int:
        """
        斐波那契的生成函数解法
        
        F(x) = x / (1 - x - x^2)
        通过部分分式展开可得通项公式
        """
        if n <= 1:
            return n
        
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        
        return b

class RecurrenceSolver:
    """递推关系求解"""
    
    @staticmethod
    def solve_linear_recurrence(a: List[int], initial: List[int], n: int) -> int:
        """
        求解线性递推关系
        a[0]*f(n) + a[1]*f(n-1) + ... = 0
        
        例如斐波那契: f(n) - f(n-1) - f(n-2) = 0
        a = [1, -1, -1]
        """
        k = len(a) - 1
        
        if n < k:
            return initial[n]
        
        dp = initial.copy()
        
        for i in range(k, n + 1):
            val = 0
            for j in range(1, k + 1):
                val -= a[j] * dp[i - j]
            val //= a[0]
            dp.append(val)
        
        return dp[n]
    
    @staticmethod
    def characteristic_equation_method(n: int) -> int:
        """
        特征方程法求斐波那契通项
        
        特征方程: r^2 - r - 1 = 0
        解: r1 = (1 + sqrt(5))/2, r2 = (1 - sqrt(5))/2
        
        f(n) = c1 * r1^n + c2 * r2^n
        """
        import math
        
        sqrt5 = math.sqrt(5)
        r1 = (1 + sqrt5) / 2
        r2 = (1 - sqrt5) / 2
        
        c1 = 1 / sqrt5
        c2 = -1 / sqrt5
        
        return int(c1 * (r1 ** n) + c2 * (r2 ** n))

class TestGeneratingFunctions:
    
    def test_coin_change(self):
        assert GeneratingFunctions.coin_change_gf([1, 2, 5], 11) == 11
    
    def test_partition(self):
        assert GeneratingFunctions.partition_gf(5) == 7
    
    def test_fibonacci_gf(self):
        assert GeneratingFunctions.fibonacci_gf(10) == 55
    
    def test_characteristic_equation(self):
        assert RecurrenceSolver.characteristic_equation_method(10) == 55
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Fermat's Little Theorem | 费马小定理，模运算 |
| Chinese Remainder Theorem | 中国剩余定理，同余方程 |
| Euler's Totient Function | 欧拉函数，RSA 加密 |
| Miller-Rabin Test | 米勒-拉宾素性测试 |
| Polya Counting | 波利亚计数定理 |
| Generating Function | 生成函数，递推求解 |
| Burnside's Lemma | 伯恩赛德引理，群论计数 |
| FFT | 快速傅里叶变换，多项式乘法 |
| Game Theory | 博弈论，纳什均衡 |
| Graph Theory Math | 图论数学，拉普拉斯矩阵 |
