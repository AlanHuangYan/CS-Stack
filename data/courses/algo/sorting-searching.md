# 排序与搜索算法 三层深度学习教程

## [总览] 技术总览

排序和搜索是计算机科学中最基础和最重要的算法。排序将无序数据变为有序，搜索在数据中查找目标。掌握这些算法是程序员的基本功。

本教程采用三层漏斗学习法：**核心层**聚焦快速排序、二分搜索、归并排序三大基石；**重点层**深入堆排序、拓扑排序、搜索优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 快速排序

#### [概念] 概念解释

快速排序是一种分治算法，选择基准元素将数组分为两部分，递归排序。平均时间复杂度 O(n log n)，是最常用的排序算法。

#### [代码] 代码示例

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# 原地快排
def quick_sort_inplace(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort_inplace(arr, low, pivot_index - 1)
        quick_sort_inplace(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# 测试
arr = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(arr))  # [1, 1, 2, 3, 6, 8, 10]
```

### 2. 二分搜索

#### [概念] 概念解释

二分搜索在有序数组中查找目标，每次将搜索范围缩小一半。时间复杂度 O(log n)，是最高效的搜索算法之一。

#### [代码] 代码示例

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# 查找左边界
def lower_bound(arr, target):
    left, right = 0, len(arr)
    
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid
    
    return left

# 查找右边界
def upper_bound(arr, target):
    left, right = 0, len(arr)
    
    while left < right:
        mid = (left + right) // 2
        if arr[mid] <= target:
            left = mid + 1
        else:
            right = mid
    
    return left - 1

# 测试
arr = [1, 2, 3, 4, 5, 5, 5, 6, 7]
print(binary_search(arr, 5))  # 4
print(lower_bound(arr, 5))    # 4
print(upper_bound(arr, 5))    # 6
```

### 3. 归并排序

#### [概念] 概念解释

归并排序是稳定的分治排序算法，将数组分成两半分别排序后合并。时间复杂度 O(n log n)，空间复杂度 O(n)。

#### [代码] 代码示例

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
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

# 逆序对计数
def count_inversions(arr):
    if len(arr) <= 1:
        return arr, 0
    
    mid = len(arr) // 2
    left, inv_left = count_inversions(arr[:mid])
    right, inv_right = count_inversions(arr[mid:])
    merged, inv_merge = merge_count(left, right)
    
    return merged, inv_left + inv_right + inv_merge

def merge_count(left, right):
    result = []
    i = j = 0
    inversions = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            inversions += len(left) - i
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result, inversions

# 测试
arr = [5, 3, 8, 4, 2]
print(merge_sort(arr))  # [2, 3, 4, 5, 8]

_, inversions = count_inversions([5, 3, 8, 4, 2])
print(f"Inversions: {inversions}")  # 7
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 堆排序

#### [代码] 代码示例

```python
def heap_sort(arr):
    n = len(arr)
    
    # 建堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # 排序
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

# 测试
arr = [12, 11, 13, 5, 6, 7]
print(heap_sort(arr))  # [5, 6, 7, 11, 12, 13]
```

### 2. 拓扑排序

#### [代码] 代码示例

```python
from collections import deque, defaultdict

def topological_sort(n, edges):
    graph = defaultdict(list)
    in_degree = [0] * n
    
    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1
    
    queue = deque([i for i in range(n) if in_degree[i] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return result if len(result) == n else []

# 测试
n = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]
print(topological_sort(n, edges))  # [5, 4, 2, 3, 0, 1] 或其他合法顺序
```

### 3. 搜索优化

#### [代码] 代码示例

```python
# 三分搜索 - 查找凸函数极值
def ternary_search(f, left, right, eps=1e-9):
    while right - left > eps:
        mid1 = left + (right - left) / 3
        mid2 = right - (right - left) / 3
        
        if f(mid1) < f(mid2):
            left = mid1
        else:
            right = mid2
    
    return (left + right) / 2

# 指数搜索
def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    
    n = len(arr)
    i = 1
    while i < n and arr[i] <= target:
        i *= 2
    
    return binary_search_range(arr, target, i // 2, min(i, n - 1))

def binary_search_range(arr, target, left, right):
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Counting Sort | 需要计数排序时 |
| Radix Sort | 需要基数排序时 |
| Bucket Sort | 需要桶排序时 |
| Shell Sort | 需要希尔排序时 |
| Insertion Sort | 需要插入排序时 |
| Selection Sort | 需要选择排序时 |
| Interpolation Search | 需要插值搜索时 |
| Fibonacci Search | 需要斐波那契搜索时 |
| Jump Search | 需要跳跃搜索时 |
| External Sort | 需要外部排序时 |

---

## [实战] 核心实战清单

### 实战任务 1：实现完整的排序工具类

```python
class Sorter:
    @staticmethod
    def quick_sort(arr):
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return Sorter.quick_sort(left) + middle + Sorter.quick_sort(right)
    
    @staticmethod
    def merge_sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = Sorter.merge_sort(arr[:mid])
        right = Sorter.merge_sort(arr[mid:])
        return Sorter._merge(left, right)
    
    @staticmethod
    def _merge(left, right):
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
```
