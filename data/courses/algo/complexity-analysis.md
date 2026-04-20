# 复杂度分析 三层深度学习教程

## [总览] 技术总览

复杂度分析是评估算法效率的核心工具，包括时间复杂度和空间复杂度。它帮助我们在编码前预测算法性能，选择最优解决方案，是程序员必备的基础能力。

本教程采用三层漏斗学习法：**核心层**聚焦大 O 表示法、常见复杂度量级、复杂度计算方法三大基石；**重点层**深入递归复杂度和均摊分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 大 O 表示法

#### [概念] 概念解释

大 O 表示法描述算法运行时间随输入规模增长的上界。它忽略常数因子和低阶项，关注增长趋势。常见复杂度从优到劣：O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!)。

#### [代码] 代码示例

```python
# 大 O 表示法示例
import time
import matplotlib.pyplot as plt
from typing import List, Callable
import math

def measure_time(func: Callable, *args) -> float:
    """测量函数执行时间"""
    start = time.perf_counter()
    func(*args)
    return time.perf_counter() - start

class ComplexityDemo:
    """复杂度演示"""
    
    @staticmethod
    def constant_time(n: int) -> int:
        """O(1) - 常数时间"""
        return n * 2
    
    @staticmethod
    def logarithmic_time(n: int) -> int:
        """O(log n) - 对数时间"""
        count = 0
        while n > 1:
            n = n // 2
            count += 1
        return count
    
    @staticmethod
    def linear_time(arr: List[int]) -> int:
        """O(n) - 线性时间"""
        total = 0
        for num in arr:
            total += num
        return total
    
    @staticmethod
    def linearithmic_time(arr: List[int]) -> List[int]:
        """O(n log n) - 线性对数时间"""
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = ComplexityDemo.linearithmic_time(arr[:mid])
        right = ComplexityDemo.linearithmic_time(arr[mid:])
        return ComplexityDemo._merge(left, right)
    
    @staticmethod
    def _merge(left: List[int], right: List[int]) -> List[int]:
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    
    @staticmethod
    def quadratic_time(arr: List[int]) -> List[tuple]:
        """O(n^2) - 平方时间"""
        pairs = []
        for i in range(len(arr)):
            for j in range(len(arr)):
                pairs.append((arr[i], arr[j]))
        return pairs
    
    @staticmethod
    def exponential_time(n: int) -> int:
        """O(2^n) - 指数时间"""
        if n <= 1:
            return n
        return (ComplexityDemo.exponential_time(n - 1) + 
                ComplexityDemo.exponential_time(n - 2))

def visualize_complexity():
    """可视化复杂度对比"""
    sizes = [10, 100, 1000, 10000]
    
    constant_times = []
    log_times = []
    linear_times = []
    
    for n in sizes:
        constant_times.append(1)
        log_times.append(math.log2(n))
        linear_times.append(n)
    
    plt.figure(figsize=(10, 6))
    plt.plot(sizes, constant_times, label='O(1)', marker='o')
    plt.plot(sizes, log_times, label='O(log n)', marker='s')
    plt.plot(sizes, linear_times, label='O(n)', marker='^')
    plt.xlabel('Input Size (n)')
    plt.ylabel('Operations')
    plt.title('Complexity Comparison')
    plt.legend()
    plt.grid(True)
    plt.xscale('log')
    plt.yscale('log')
    plt.show()

class TestComplexity:
    """复杂度测试"""
    
    def test_constant_time(self):
        assert ComplexityDemo.constant_time(1000000) == 2000000
    
    def test_logarithmic_time(self):
        assert ComplexityDemo.logarithmic_time(1024) == 10
    
    def test_linear_time(self):
        assert ComplexityDemo.linear_time([1, 2, 3, 4, 5]) == 15
```

### 2. 常见复杂度量级

#### [概念] 概念解释

不同复杂度量级代表不同的增长速度：O(1) 哈希表查找、O(log n) 二分查找、O(n) 线性扫描、O(n log n) 高效排序、O(n^2) 嵌套循环、O(2^n) 暴力递归、O(n!) 全排列。理解这些量级有助于选择合适算法。

#### [代码] 代码示例

```python
# 常见复杂度量级示例
from typing import List, Dict, Set
import heapq

class AlgorithmExamples:
    """各复杂度算法示例"""
    
    @staticmethod
    def hash_lookup(hash_table: Dict, key: str) -> any:
        """O(1) - 哈希表查找"""
        return hash_table.get(key)
    
    @staticmethod
    def binary_search(sorted_arr: List[int], target: int) -> int:
        """O(log n) - 二分查找"""
        left, right = 0, len(sorted_arr) - 1
        
        while left <= right:
            mid = (left + right) // 2
            if sorted_arr[mid] == target:
                return mid
            elif sorted_arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return -1
    
    @staticmethod
    def find_max(arr: List[int]) -> int:
        """O(n) - 找最大值"""
        if not arr:
            return None
        max_val = arr[0]
        for num in arr[1:]:
            if num > max_val:
                max_val = num
        return max_val
    
    @staticmethod
    def heap_sort(arr: List[int]) -> List[int]:
        """O(n log n) - 堆排序"""
        heapq.heapify(arr)
        return [heapq.heappop(arr) for _ in range(len(arr))]
    
    @staticmethod
    def bubble_sort(arr: List[int]) -> List[int]:
        """O(n^2) - 冒泡排序"""
        arr = arr.copy()
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr
    
    @staticmethod
    def fibonacci_recursive(n: int) -> int:
        """O(2^n) - 递归斐波那契"""
        if n <= 1:
            return n
        return (AlgorithmExamples.fibonacci_recursive(n - 1) + 
                AlgorithmExamples.fibonacci_recursive(n - 2))
    
    @staticmethod
    def fibonacci_memoized(n: int, memo: Dict = None) -> int:
        """O(n) - 记忆化斐波那契"""
        if memo is None:
            memo = {}
        if n in memo:
            return memo[n]
        if n <= 1:
            return n
        memo[n] = (AlgorithmExamples.fibonacci_memoized(n - 1, memo) + 
                   AlgorithmExamples.fibonacci_memoized(n - 2, memo))
        return memo[n]
    
    @staticmethod
    def generate_permutations(arr: List[int]) -> List[List[int]]:
        """O(n!) - 生成全排列"""
        if len(arr) <= 1:
            return [arr]
        
        result = []
        for i, num in enumerate(arr):
            rest = arr[:i] + arr[i + 1:]
            for perm in AlgorithmExamples.generate_permutations(rest):
                result.append([num] + perm)
        
        return result

class ComplexityComparison:
    """复杂度对比分析"""
    
    @staticmethod
    def compare_search_algorithms(arr: List[int], target: int):
        """对比搜索算法"""
        import time
        
        sorted_arr = sorted(arr)
        
        start = time.perf_counter()
        linear_result = arr.index(target) if target in arr else -1
        linear_time = time.perf_counter() - start
        
        start = time.perf_counter()
        binary_result = AlgorithmExamples.binary_search(sorted_arr, target)
        binary_time = time.perf_counter() - start
        
        return {
            "linear_search": {"time": linear_time, "result": linear_result},
            "binary_search": {"time": binary_time, "result": binary_result}
        }
    
    @staticmethod
    def compare_sorting_algorithms(arr: List[int]):
        """对比排序算法"""
        import time
        
        results = {}
        
        for name, func in [
            ("heap_sort", AlgorithmExamples.heap_sort),
            ("bubble_sort", AlgorithmExamples.bubble_sort),
            ("python_sorted", sorted)
        ]:
            arr_copy = arr.copy()
            start = time.perf_counter()
            func(arr_copy) if name != "python_sorted" else func(arr_copy)
            results[name] = time.perf_counter() - start
        
        return results

class TestAlgorithmExamples:
    
    def test_binary_search(self):
        arr = [1, 3, 5, 7, 9, 11, 13]
        assert AlgorithmExamples.binary_search(arr, 7) == 3
        assert AlgorithmExamples.binary_search(arr, 4) == -1
    
    def test_fibonacci(self):
        assert AlgorithmExamples.fibonacci_memoized(10) == 55
    
    def test_permutations(self):
        perms = AlgorithmExamples.generate_permutations([1, 2, 3])
        assert len(perms) == 6
```

### 3. 复杂度计算方法

#### [概念] 概念解释

计算复杂度的步骤：1) 找出基本操作（循环、递归调用）；2) 计算基本操作执行次数；3) 用大 O 表示结果。关键技巧：循环次数相乘、顺序执行相加、嵌套取最大。

#### [代码] 代码示例

```python
# 复杂度计算方法示例
from typing import List

class ComplexityAnalysis:
    """复杂度分析工具"""
    
    @staticmethod
    def analyze_loop_complexity(n: int):
        """分析循环复杂度"""
        count = 0
        
        for i in range(n):
            count += 1
        
        print(f"单层循环: O(n), 实际次数: {count}")
        
        count = 0
        for i in range(n):
            for j in range(n):
                count += 1
        
        print(f"双层嵌套循环: O(n^2), 实际次数: {count}")
        
        count = 0
        for i in range(n):
            for j in range(i, n):
                count += 1
        
        print(f"三角循环: O(n^2), 实际次数: {count}")
    
    @staticmethod
    def analyze_while_loop(n: int):
        """分析 while 循环复杂度"""
        count = 0
        i = 1
        while i < n:
            i *= 2
            count += 1
        
        print(f"倍增循环: O(log n), 实际次数: {count}")
    
    @staticmethod
    def analyze_recursion(n: int, depth: int = 0):
        """分析递归复杂度"""
        def count_calls(n: int, memo: dict = None) -> int:
            if memo is None:
                memo = {}
            if n in memo:
                return memo[n]
            if n <= 1:
                return 1
            memo[n] = 1 + count_calls(n - 1, memo) + count_calls(n - 2, memo)
            return memo[n]
        
        total_calls = count_calls(n)
        print(f"斐波那契递归 n={n}: O(2^n), 调用次数: {total_calls}")

def analyze_function_complexity(func, *args):
    """自动分析函数复杂度"""
    import time
    import numpy as np
    
    times = []
    sizes = [100, 500, 1000, 2000, 5000]
    
    for size in sizes:
        test_args = [list(range(size)) if isinstance(arg, list) else arg for arg in args]
        if not test_args:
            test_args = [size]
        
        start = time.perf_counter()
        func(*test_args)
        elapsed = time.perf_counter() - start
        times.append(elapsed)
    
    times = np.array(times)
    sizes = np.array(sizes)
    
    log_times = np.log(times)
    log_sizes = np.log(sizes)
    
    slope = np.polyfit(log_sizes, log_times, 1)[0]
    
    print(f"估计复杂度: O(n^{slope:.2f})")
    
    return slope

class CodeComplexityChecker:
    """代码复杂度检查器"""
    
    @staticmethod
    def count_operations(code: str) -> dict:
        """统计代码中的操作"""
        lines = code.strip().split('\n')
        
        loop_count = 0
        nested_depth = 0
        max_depth = 0
        
        for line in lines:
            stripped = line.strip()
            
            if 'for ' in stripped or 'while ' in stripped:
                loop_count += 1
                indent = len(line) - len(line.lstrip())
                depth = indent // 4 + 1
                max_depth = max(max_depth, depth)
        
        return {
            "loop_count": loop_count,
            "max_nesting_depth": max_depth,
            "estimated_complexity": f"O(n^{max_depth})" if max_depth > 0 else "O(1)"
        }

class TestComplexityAnalysis:
    
    def test_loop_analysis(self):
        ComplexityAnalysis.analyze_loop_complexity(10)
    
    def test_while_analysis(self):
        ComplexityAnalysis.analyze_while_loop(1000)
    
    def test_code_checker(self):
        code = """
for i in range(n):
    for j in range(n):
        print(i, j)
"""
        result = CodeComplexityChecker.count_operations(code)
        assert result["max_nesting_depth"] == 2
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 递归复杂度分析

#### [概念] 概念解释

递归复杂度使用主定理分析：T(n) = aT(n/b) + f(n)。其中 a 是递归分支数，b 是问题缩小倍数，f(n) 是分解合并代价。根据 f(n) 与 n^(log_b a) 的关系确定复杂度。

#### [代码] 代码示例

```python
# 递归复杂度分析
import math
from typing import Callable

class MasterTheorem:
    """主定理应用"""
    
    @staticmethod
    def analyze(a: int, b: int, f_n: Callable[[int], float]) -> str:
        """
        主定理分析
        T(n) = aT(n/b) + f(n)
        """
        log_b_a = math.log(a, b)
        
        n_log_b_a = lambda n: n ** log_b_a
        
        test_n = 1000
        f_value = f_n(test_n)
        n_log_value = n_log_b_a(test_n)
        
        if f_value < n_log_value * 0.5:
            return f"O(n^{log_b_a:.2f}) - Case 1: f(n) < n^(log_b a)"
        elif abs(f_value - n_log_value) < n_log_value * 0.1:
            return f"O(n^{log_b_a:.2f} log n) - Case 2: f(n) = n^(log_b a)"
        else:
            return f"O(f(n)) - Case 3: f(n) > n^(log_b a)"

class RecursiveComplexity:
    """递归复杂度示例"""
    
    @staticmethod
    def merge_sort(arr: List[int]) -> List[int]:
        """
        归并排序: T(n) = 2T(n/2) + O(n)
        a=2, b=2, f(n)=n
        log_b_a = 1, n^1 = n
        Case 2: T(n) = O(n log n)
        """
        if len(arr) <= 1:
            return arr
        
        mid = len(arr) // 2
        left = RecursiveComplexity.merge_sort(arr[:mid])
        right = RecursiveComplexity.merge_sort(arr[mid:])
        
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        
        return result
    
    @staticmethod
    def binary_search_recursive(arr: List[int], target: int, left: int = 0, right: int = None) -> int:
        """
        二分查找: T(n) = T(n/2) + O(1)
        a=1, b=2, f(n)=1
        log_b_a = 0, n^0 = 1
        Case 2: T(n) = O(log n)
        """
        if right is None:
            right = len(arr) - 1
        
        if left > right:
            return -1
        
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            return RecursiveComplexity.binary_search_recursive(arr, target, mid + 1, right)
        else:
            return RecursiveComplexity.binary_search_recursive(arr, target, left, mid - 1)
    
    @staticmethod
    def karatsuba(x: int, y: int) -> int:
        """
        Karatsuba 乘法: T(n) = 3T(n/2) + O(n)
        a=3, b=2, f(n)=n
        log_b_a = log_2(3) ≈ 1.585
        Case 1: T(n) = O(n^1.585)
        """
        if x < 10 or y < 10:
            return x * y
        
        n = max(len(str(x)), len(str(y)))
        half = n // 2
        
        high1, low1 = divmod(x, 10 ** half)
        high2, low2 = divmod(y, 10 ** half)
        
        z0 = RecursiveComplexity.karatsuba(low1, low2)
        z1 = RecursiveComplexity.karatsuba((high1 + low1), (high2 + low2))
        z2 = RecursiveComplexity.karatsuba(high1, high2)
        
        return (z2 * 10 ** (2 * half) + 
                (z1 - z2 - z0) * 10 ** half + 
                z0)

class TestRecursiveComplexity:
    
    def test_merge_sort(self):
        arr = [5, 2, 8, 1, 9, 3]
        sorted_arr = RecursiveComplexity.merge_sort(arr)
        assert sorted_arr == [1, 2, 3, 5, 8, 9]
    
    def test_binary_search_recursive(self):
        arr = [1, 3, 5, 7, 9]
        assert RecursiveComplexity.binary_search_recursive(arr, 5) == 2
    
    def test_karatsuba(self):
        assert RecursiveComplexity.karatsuba(1234, 5678) == 1234 * 5678
```

### 2. 均摊分析

#### [概念] 概念解释

均摊分析评估一系列操作的平均代价。某些操作代价高但很少发生，均摊后整体效率高。常见方法：聚合分析、记账法、势能法。典型应用：动态数组扩容、Splay 树。

#### [代码] 代码示例

```python
# 均摊分析示例
from typing import List, Any

class DynamicArray:
    """动态数组 - 均摊 O(1) 插入"""
    
    def __init__(self):
        self._data: List[Any] = [None] * 1
        self._size = 0
        self._capacity = 1
        self._resize_count = 0
    
    def append(self, value: Any):
        """均摊 O(1) 追加"""
        if self._size == self._capacity:
            self._resize(2 * self._capacity)
        
        self._data[self._size] = value
        self._size += 1
    
    def _resize(self, new_capacity: int):
        self._resize_count += 1
        new_data = [None] * new_capacity
        for i in range(self._size):
            new_data[i] = self._data[i]
        self._data = new_data
        self._capacity = new_capacity
    
    def __getitem__(self, index: int) -> Any:
        return self._data[index]
    
    def __len__(self) -> int:
        return self._size

class AmortizedAnalysis:
    """均摊分析演示"""
    
    @staticmethod
    def analyze_dynamic_array(n: int):
        """分析动态数组 n 次插入的总代价"""
        total_cost = 0
        capacity = 1
        size = 0
        
        for i in range(n):
            if size == capacity:
                total_cost += capacity
                capacity *= 2
            total_cost += 1
            size += 1
        
        print(f"总代价: {total_cost}")
        print(f"均摊代价: {total_cost / n:.2f}")
        print(f"理论均摊: O(1)")
        
        return total_cost
    
    @staticmethod
    def accounting_method(n: int):
        """记账法分析"""
        bank = 0
        operations = []
        
        for i in range(n):
            actual_cost = 1
            amortized_cost = 3
            
            bank += amortized_cost - actual_cost
            
            if (i + 1) & (i) == 0 and i > 0:
                resize_cost = i
                if bank >= resize_cost:
                    bank -= resize_cost
                    operations.append(f"Resize at {i+1}, bank: {bank}")
        
        print(f"最终银行余额: {bank}")
        return operations

class StackWithQueue:
    """用队列实现栈 - 均摊分析"""
    
    def __init__(self):
        self.q1: List[int] = []
        self.q2: List[int] = []
    
    def push(self, x: int):
        """O(1)"""
        self.q1.append(x)
    
    def pop(self) -> int:
        """均摊 O(1)"""
        while len(self.q1) > 1:
            self.q2.append(self.q1.pop(0))
        
        result = self.q1.pop(0)
        self.q1, self.q2 = self.q2, self.q1
        
        return result
    
    def top(self) -> int:
        """O(1)"""
        return self.q1[-1] if self.q1 else None

class TestAmortizedAnalysis:
    
    def test_dynamic_array(self):
        arr = DynamicArray()
        for i in range(100):
            arr.append(i)
        
        assert len(arr) == 100
        assert arr[50] == 50
    
    def test_amortized_cost(self):
        total = AmortizedAnalysis.analyze_dynamic_array(1000)
        assert total < 3000
    
    def test_stack_with_queue(self):
        stack = StackWithQueue()
        stack.push(1)
        stack.push(2)
        stack.push(3)
        
        assert stack.pop() == 3
        assert stack.pop() == 2
```

### 3. 空间复杂度分析

#### [概念] 概念解释

空间复杂度衡量算法运行时占用的额外空间。包括：输入空间、辅助空间、递归栈空间。优化策略：原地算法、空间换时间、数据压缩。

#### [代码] 代码示例

```python
# 空间复杂度分析
from typing import List, Optional

class SpaceComplexity:
    """空间复杂度示例"""
    
    @staticmethod
    def constant_space(n: int) -> int:
        """O(1) 空间 - 只用常量变量"""
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a
    
    @staticmethod
    def linear_space(n: int) -> List[int]:
        """O(n) 空间 - 使用数组"""
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]
    
    @staticmethod
    def recursive_space(n: int) -> int:
        """O(n) 空间 - 递归栈"""
        if n <= 1:
            return n
        return (SpaceComplexity.recursive_space(n - 1) + 
                SpaceComplexity.recursive_space(n - 2))
    
    @staticmethod
    def quadratic_space(n: int) -> List[List[int]]:
        """O(n^2) 空间 - 二维数组"""
        return [[0] * n for _ in range(n)]

class InPlaceAlgorithms:
    """原地算法"""
    
    @staticmethod
    def reverse_array(arr: List[int]) -> None:
        """原地反转 - O(1) 额外空间"""
        left, right = 0, len(arr) - 1
        while left < right:
            arr[left], arr[right] = arr[right], arr[left]
            left += 1
            right -= 1
    
    @staticmethod
    def remove_duplicates(arr: List[int]) -> int:
        """原地去重 - O(1) 额外空间"""
        if not arr:
            return 0
        
        write_index = 1
        for i in range(1, len(arr)):
            if arr[i] != arr[i - 1]:
                arr[write_index] = arr[i]
                write_index += 1
        
        return write_index
    
    @staticmethod
    def rotate_array(arr: List[int], k: int) -> None:
        """原地旋转 - O(1) 额外空间"""
        n = len(arr)
        k = k % n
        
        def reverse(start, end):
            while start < end:
                arr[start], arr[end] = arr[end], arr[start]
                start += 1
                end -= 1
        
        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)

class SpaceTimeTradeoff:
    """空间换时间"""
    
    def __init__(self):
        self._cache = {}
    
    def fibonacci_cached(self, n: int) -> int:
        """O(n) 空间换 O(n) 时间"""
        if n in self._cache:
            return self._cache[n]
        if n <= 1:
            return n
        
        result = self.fibonacci_cached(n - 1) + self.fibonacci_cached(n - 2)
        self._cache[n] = result
        return result
    
    @staticmethod
    def two_sum_hash(nums: List[int], target: int) -> Optional[tuple]:
        """O(n) 空间换 O(n) 时间"""
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return (seen[complement], i)
            seen[num] = i
        return None

class TestSpaceComplexity:
    
    def test_constant_space(self):
        assert SpaceComplexity.constant_space(10) == 55
    
    def test_in_place_reverse(self):
        arr = [1, 2, 3, 4, 5]
        InPlaceAlgorithms.reverse_array(arr)
        assert arr == [5, 4, 3, 2, 1]
    
    def test_remove_duplicates(self):
        arr = [1, 1, 2, 2, 3, 4, 4]
        length = InPlaceAlgorithms.remove_duplicates(arr)
        assert length == 4
        assert arr[:length] == [1, 2, 3, 4]
    
    def test_two_sum(self):
        result = SpaceTimeTradeoff.two_sum_hash([2, 7, 11, 15], 9)
        assert result == (0, 1)
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Omega Notation | 下界复杂度，最好情况 |
| Theta Notation | 紧确界，精确复杂度 |
| Little-o Notation | 严格上界，非紧确 |
| Recursion Tree | 递归树方法，可视化分析 |
| Substitution Method | 代入法，数学归纳证明 |
| Akra-Bazzi | 主定理推广，非均匀分治 |
| Competitive Analysis | 竞争分析，在线算法 |
| Probabilistic Analysis | 概率分析，随机算法 |
| Parallel Complexity | 并行复杂度，PRAM 模型 |
| Cache Complexity | 缓存复杂度，内存层次 |
