# 数据结构 三层深度学习教程

## [总览] 技术总览

数据结构是计算机存储和组织数据的方式，是算法的基础。掌握数据结构对于编写高效程序至关重要，是程序员的核心技能之一。

本教程采用三层漏斗学习法：**核心层**聚焦数组与链表、栈与队列、哈希表三大基石；**重点层**深入树与图、堆与优先队列、并查集；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数组与链表

#### [概念] 概念解释

数组是连续内存空间存储相同类型元素的数据结构，支持随机访问。链表是通过指针链接的节点序列，支持高效插入删除。

#### [代码] 代码示例

```python
# 数组操作
class DynamicArray:
    def __init__(self):
        self.data = []
        self.size = 0
    
    def append(self, value):
        self.data.append(value)
        self.size += 1
    
    def get(self, index):
        if 0 <= index < self.size:
            return self.data[index]
        raise IndexError("Index out of range")
    
    def set(self, index, value):
        if 0 <= index < self.size:
            self.data[index] = value
        else:
            raise IndexError("Index out of range")
    
    def remove(self, index):
        if 0 <= index < self.size:
            self.data.pop(index)
            self.size -= 1

# 链表实现
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0
    
    def append(self, val):
        new_node = ListNode(val)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        self.size += 1
    
    def prepend(self, val):
        new_node = ListNode(val)
        new_node.next = self.head
        self.head = new_node
        self.size += 1
    
    def delete(self, val):
        if not self.head:
            return
        
        if self.head.val == val:
            self.head = self.head.next
            self.size -= 1
            return
        
        current = self.head
        while current.next:
            if current.next.val == val:
                current.next = current.next.next
                self.size -= 1
                return
            current = current.next
    
    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.val)
            current = current.next
        return result

# 使用示例
arr = DynamicArray()
arr.append(1)
arr.append(2)
print(arr.get(0))  # 1

ll = LinkedList()
ll.append(1)
ll.append(2)
ll.prepend(0)
print(ll.to_list())  # [0, 1, 2]
```

### 2. 栈与队列

#### [概念] 概念解释

栈是后进先出（LIFO）的数据结构，队列是先进先出（FIFO）的数据结构。它们是最基础的线性数据结构。

#### [代码] 代码示例

```python
# 栈实现
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

# 队列实现
class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.pop(0)
    
    def front(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items[0]
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

# 使用 deque 优化队列
from collections import deque

class OptimizedQueue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.popleft()
    
    def is_empty(self):
        return len(self.items) == 0

# 括号匹配 - 栈的应用
def is_valid_parentheses(s: str) -> bool:
    stack = Stack()
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping.values():
            stack.push(char)
        elif char in mapping:
            if stack.is_empty() or stack.pop() != mapping[char]:
                return False
    
    return stack.is_empty()

print(is_valid_parentheses("()[]{}"))  # True
print(is_valid_parentheses("([)]"))    # False
```

### 3. 哈希表

#### [概念] 概念解释

哈希表通过哈希函数将键映射到数组索引，实现 O(1) 平均时间复杂度的查找、插入和删除操作。

#### [代码] 代码示例

```python
# 哈希表实现
class HashMap:
    def __init__(self, capacity=16):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]
    
    def _hash(self, key):
        return hash(key) % self.capacity
    
    def put(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        
        bucket.append((key, value))
        self.size += 1
    
    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for k, v in bucket:
            if k == key:
                return v
        
        raise KeyError(key)
    
    def remove(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                del bucket[i]
                self.size -= 1
                return
        
        raise KeyError(key)
    
    def __contains__(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        return any(k == key for k, v in bucket)

# 两数之和 - 哈希表应用
def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 树与二叉树

#### [代码] 代码示例

```python
# 二叉树节点
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# 二叉搜索树
class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
        else:
            self._insert(self.root, val)
    
    def _insert(self, node, val):
        if val < node.val:
            if node.left:
                self._insert(node.left, val)
            else:
                node.left = TreeNode(val)
        else:
            if node.right:
                self._insert(node.right, val)
            else:
                node.right = TreeNode(val)
    
    def search(self, val):
        return self._search(self.root, val)
    
    def _search(self, node, val):
        if not node:
            return False
        if val == node.val:
            return True
        elif val < node.val:
            return self._search(node.left, val)
        else:
            return self._search(node.right, val)
    
    def inorder(self):
        result = []
        self._inorder(self.root, result)
        return result
    
    def _inorder(self, node, result):
        if node:
            self._inorder(node.left, result)
            result.append(node.val)
            self._inorder(node.right, result)

# 层序遍历
from collections import deque

def level_order(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    
    return result
```

### 2. 堆与优先队列

#### [代码] 代码示例

```python
import heapq

# 最小堆
class MinHeap:
    def __init__(self):
        self.heap = []
    
    def push(self, val):
        heapq.heappush(self.heap, val)
    
    def pop(self):
        return heapq.heappop(self.heap)
    
    def peek(self):
        return self.heap[0] if self.heap else None
    
    def size(self):
        return len(self.heap)

# 最大堆（取负数）
class MaxHeap:
    def __init__(self):
        self.heap = []
    
    def push(self, val):
        heapq.heappush(self.heap, -val)
    
    def pop(self):
        return -heapq.heappop(self.heap)
    
    def peek(self):
        return -self.heap[0] if self.heap else None

# Top K 问题
def top_k_frequent(nums, k):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    
    heap = []
    for num, freq in count.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)
    
    return [num for freq, num in heap]

print(top_k_frequent([1,1,1,2,2,3], 2))  # [1, 2]
```

### 3. 并查集

#### [代码] 代码示例

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True
    
    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Trie | 需要前缀匹配时 |
| Segment Tree | 需要区间查询时 |
| Fenwick Tree | 需要高效区间更新时 |
| AVL Tree | 需要平衡二叉树时 |
| Red-Black Tree | 需要自平衡树时 |
| B-Tree | 需要磁盘存储时 |
| Skip List | 需要快速查找时 |
| Bloom Filter | 需要快速判断存在时 |
| LRU Cache | 需要缓存淘汰时 |
| Monotonic Stack | 需要单调栈时 |

---

## [实战] 核心实战清单

### 实战任务 1：实现 LRU 缓存

```python
class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = ListNode()
        self.tail = ListNode()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
    
    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)
        return node.val
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self._remove(node)
            self._add_to_head(node)
        else:
            node = ListNode(key, value)
            self.cache[key] = node
            self._add_to_head(node)
            if len(self.cache) > self.capacity:
                lru = self.tail.prev
                self._remove(lru)
                del self.cache[lru.key]
```
