# 字符串算法 三层深度学习教程

## [总览] 技术总览

字符串算法处理文本数据，是信息检索、文本编辑、生物信息学的基础。核心问题包括模式匹配、字符串搜索、编辑距离等。掌握高效字符串算法能显著提升文本处理能力。

本教程采用三层漏斗学习法：**核心层**聚焦 KMP 算法、字符串哈希、编辑距离三大基石；**重点层**深入后缀数组和 AC 自动机；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. KMP 字符串匹配

#### [概念] 概念解释

KMP 算法通过预处理模式串构建 next 数组，避免主串指针回溯，将匹配复杂度从 O(mn) 优化到 O(m+n)。核心思想是利用已匹配信息跳过不可能匹配的位置。

#### [代码] 代码示例

```python
# KMP 字符串匹配算法
from typing import List, Optional

class KMP:
    """KMP 字符串匹配算法"""
    
    @staticmethod
    def build_next(pattern: str) -> List[int]:
        """
        构建 next 数组（部分匹配表）
        next[i] 表示 pattern[0..i] 的最长相等前后缀长度
        """
        n = len(pattern)
        next_arr = [0] * n
        
        j = 0
        for i in range(1, n):
            while j > 0 and pattern[i] != pattern[j]:
                j = next_arr[j - 1]
            
            if pattern[i] == pattern[j]:
                j += 1
                next_arr[i] = j
        
        return next_arr
    
    @staticmethod
    def search(text: str, pattern: str) -> List[int]:
        """
        KMP 搜索，返回所有匹配起始位置
        时间复杂度: O(n + m)
        """
        if not pattern:
            return list(range(len(text) + 1))
        
        next_arr = KMP.build_next(pattern)
        positions = []
        
        j = 0
        for i in range(len(text)):
            while j > 0 and text[i] != pattern[j]:
                j = next_arr[j - 1]
            
            if text[i] == pattern[j]:
                j += 1
            
            if j == len(pattern):
                positions.append(i - j + 1)
                j = next_arr[j - 1]
        
        return positions
    
    @staticmethod
    def search_first(text: str, pattern: str) -> Optional[int]:
        """搜索第一个匹配位置"""
        positions = KMP.search(text, pattern)
        return positions[0] if positions else None
    
    @staticmethod
    def count_occurrences(text: str, pattern: str) -> int:
        """统计模式出现次数"""
        return len(KMP.search(text, pattern))

class StringMatching:
    """其他字符串匹配算法"""
    
    @staticmethod
    def brute_force(text: str, pattern: str) -> List[int]:
        """暴力匹配 O(n*m)"""
        positions = []
        n, m = len(text), len(pattern)
        
        for i in range(n - m + 1):
            match = True
            for j in range(m):
                if text[i + j] != pattern[j]:
                    match = False
                    break
            if match:
                positions.append(i)
        
        return positions
    
    @staticmethod
    def rabin_karp(text: str, pattern: str) -> List[int]:
        """Rabin-Karp 哈希匹配"""
        n, m = len(text), len(pattern)
        if m > n:
            return []
        
        base = 256
        mod = 101
        
        pattern_hash = 0
        text_hash = 0
        h = 1
        
        for i in range(m - 1):
            h = (h * base) % mod
        
        for i in range(m):
            pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
            text_hash = (text_hash * base + ord(text[i])) % mod
        
        positions = []
        
        for i in range(n - m + 1):
            if pattern_hash == text_hash:
                if text[i:i + m] == pattern:
                    positions.append(i)
            
            if i < n - m:
                text_hash = (text_hash - ord(text[i]) * h) % mod
                text_hash = (text_hash * base + ord(text[i + m])) % mod
                text_hash = (text_hash + mod) % mod
        
        return positions

class TestKMP:
    
    def test_build_next(self):
        pattern = "ABABCABAB"
        next_arr = KMP.build_next(pattern)
        assert next_arr == [0, 0, 1, 2, 0, 1, 2, 3, 4]
    
    def test_search(self):
        text = "ABABDABACDABABCABAB"
        pattern = "ABABCABAB"
        positions = KMP.search(text, pattern)
        assert positions == [10]
    
    def test_search_multiple(self):
        text = "AAAAA"
        pattern = "AA"
        positions = KMP.search(text, pattern)
        assert positions == [0, 1, 2, 3]
    
    def test_count(self):
        text = "ABABABAB"
        pattern = "ABA"
        assert KMP.count_occurrences(text, pattern) == 3
```

### 2. 字符串哈希

#### [概念] 概念解释

字符串哈希将字符串映射为数值，支持 O(1) 时间获取任意子串的哈希值。应用场景包括：快速比较子串、检测重复子串、滚动哈希。

#### [代码] 代码示例

```python
# 字符串哈希
from typing import List, Tuple, Set

class StringHash:
    """字符串哈希"""
    
    def __init__(self, s: str, base: int = 131, mod: int = 10**9 + 7):
        self.s = s
        self.base = base
        self.mod = mod
        self.n = len(s)
        
        self._precompute()
    
    def _precompute(self):
        """预计算前缀哈希和幂次"""
        self.prefix = [0] * (self.n + 1)
        self.power = [1] * (self.n + 1)
        
        for i in range(self.n):
            self.prefix[i + 1] = (self.prefix[i] * self.base + ord(self.s[i])) % self.mod
            self.power[i + 1] = (self.power[i] * self.base) % self.mod
    
    def get_hash(self, l: int, r: int) -> int:
        """获取子串 s[l:r] 的哈希值"""
        return (self.prefix[r] - self.prefix[l] * self.power[r - l] % self.mod + self.mod) % self.mod
    
    def get_full_hash(self) -> int:
        """获取整个字符串的哈希值"""
        return self.prefix[self.n]

class DoubleHash:
    """双哈希减少碰撞"""
    
    def __init__(self, s: str):
        self.h1 = StringHash(s, 131, 10**9 + 7)
        self.h2 = StringHash(s, 137, 10**9 + 9)
    
    def get_hash(self, l: int, r: int) -> Tuple[int, int]:
        """获取双哈希值"""
        return (self.h1.get_hash(l, r), self.h2.get_hash(l, r))

class RollingHash:
    """滚动哈希应用"""
    
    @staticmethod
    def find_longest_duplicate(s: str) -> str:
        """查找最长重复子串"""
        n = len(s)
        if n == 0:
            return ""
        
        sh = StringHash(s)
        
        def has_duplicate(length: int) -> int:
            seen = set()
            for i in range(n - length + 1):
                h = sh.get_hash(i, i + length)
                if h in seen:
                    return i
                seen.add(h)
            return -1
        
        left, right = 1, n
        start, max_len = -1, 0
        
        while left <= right:
            mid = (left + right) // 2
            pos = has_duplicate(mid)
            if pos != -1:
                start = pos
                max_len = mid
                left = mid + 1
            else:
                right = mid - 1
        
        return s[start:start + max_len] if start != -1 else ""
    
    @staticmethod
    def count_distinct_substrings(s: str) -> int:
        """统计不同子串数量"""
        n = len(s)
        sh = StringHash(s)
        
        distinct = set()
        
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                distinct.add(sh.get_hash(i, i + length))
        
        return len(distinct)
    
    @staticmethod
    def find_pattern_occurrences(text: str, pattern: str) -> List[int]:
        """使用哈希查找模式出现位置"""
        if len(pattern) > len(text):
            return []
        
        th = StringHash(text)
        ph = StringHash(pattern)
        pattern_hash = ph.get_full_hash()
        
        m = len(pattern)
        positions = []
        
        for i in range(len(text) - m + 1):
            if th.get_hash(i, i + m) == pattern_hash:
                if text[i:i + m] == pattern:
                    positions.append(i)
        
        return positions

class PalindromeHash:
    """回文检测"""
    
    def __init__(self, s: str):
        self.forward = StringHash(s)
        self.backward = StringHash(s[::-1])
        self.n = len(s)
    
    def is_palindrome(self, l: int, r: int) -> bool:
        """判断 s[l:r] 是否为回文"""
        forward_hash = self.forward.get_hash(l, r)
        backward_l = self.n - r
        backward_r = self.n - l
        backward_hash = self.backward.get_hash(backward_l, backward_r)
        return forward_hash == backward_hash
    
    def find_longest_palindrome(self) -> Tuple[int, int]:
        """查找最长回文子串"""
        max_len = 0
        start = 0
        
        for i in range(self.n):
            for j in range(i + 1, self.n + 1):
                if self.is_palindrome(i, j) and j - i > max_len:
                    max_len = j - i
                    start = i
        
        return start, start + max_len

class TestStringHash:
    
    def test_get_hash(self):
        sh = StringHash("hello")
        h1 = sh.get_hash(0, 2)
        h2 = sh.get_hash(0, 2)
        assert h1 == h2
    
    def test_find_duplicate(self):
        s = "banana"
        result = RollingHash.find_longest_duplicate(s)
        assert result == "ana"
    
    def test_palindrome(self):
        ph = PalindromeHash("racecar")
        assert ph.is_palindrome(0, 7) is True
        assert ph.is_palindrome(1, 5) is True
```

### 3. 编辑距离

#### [概念] 概念解释

编辑距离（Levenshtein Distance）衡量两个字符串的相似度，定义为将一个字符串转换为另一个所需的最少操作次数。操作包括插入、删除、替换。动态规划解法复杂度 O(mn)。

#### [代码] 代码示例

```python
# 编辑距离算法
from typing import List, Tuple
from functools import lru_cache

class EditDistance:
    """编辑距离"""
    
    @staticmethod
    def levenshtein(s1: str, s2: str) -> int:
        """
        Levenshtein 编辑距离
        操作: 插入、删除、替换
        时间复杂度: O(mn)
        空间复杂度: O(mn)
        """
        m, n = len(s1), len(s2)
        
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],
                        dp[i][j - 1],
                        dp[i - 1][j - 1]
                    )
        
        return dp[m][n]
    
    @staticmethod
    def levenshtein_optimized(s1: str, s2: str) -> int:
        """空间优化版本 O(min(m,n))"""
        if len(s1) < len(s2):
            s1, s2 = s2, s1
        
        m, n = len(s1), len(s2)
        
        prev = list(range(n + 1))
        curr = [0] * (n + 1)
        
        for i in range(1, m + 1):
            curr[0] = i
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    curr[j] = prev[j - 1]
                else:
                    curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
            prev, curr = curr, prev
        
        return prev[n]
    
    @staticmethod
    def edit_sequence(s1: str, s2: str) -> List[str]:
        """返回编辑操作序列"""
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        
        operations = []
        i, j = m, n
        
        while i > 0 or j > 0:
            if i > 0 and j > 0 and s1[i - 1] == s2[j - 1]:
                i -= 1
                j -= 1
            elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
                operations.append(f"Delete '{s1[i - 1]}' at position {i - 1}")
                i -= 1
            elif j > 0 and dp[i][j] == dp[i][j - 1] + 1:
                operations.append(f"Insert '{s2[j - 1]}' at position {i}")
                j -= 1
            else:
                operations.append(f"Replace '{s1[i - 1]}' with '{s2[j - 1]}' at position {i - 1}")
                i -= 1
                j -= 1
        
        return operations[::-1]

class AdvancedEditDistance:
    """高级编辑距离"""
    
    @staticmethod
    def damerau_levenshtein(s1: str, s2: str) -> int:
        """
        Damerau-Levenshtein 距离
        增加相邻字符交换操作
        """
        m, n = len(s1), len(s2)
        
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                cost = 0 if s1[i - 1] == s2[j - 1] else 1
                
                dp[i][j] = min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                )
                
                if (i > 1 and j > 1 and 
                    s1[i - 1] == s2[j - 2] and 
                    s1[i - 2] == s2[j - 1]):
                    dp[i][j] = min(dp[i][j], dp[i - 2][j - 2] + 1)
        
        return dp[m][n]
    
    @staticmethod
    def weighted_edit_distance(s1: str, s2: str, 
                               insert_cost: int = 1,
                               delete_cost: int = 1,
                               replace_cost: int = 1) -> int:
        """带权重的编辑距离"""
        m, n = len(s1), len(s2)
        
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            dp[i][0] = dp[i - 1][0] + delete_cost
        for j in range(1, n + 1):
            dp[0][j] = dp[0][j - 1] + insert_cost
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = min(
                        dp[i - 1][j] + delete_cost,
                        dp[i][j - 1] + insert_cost,
                        dp[i - 1][j - 1] + replace_cost
                    )
        
        return dp[m][n]
    
    @staticmethod
    def longest_common_subsequence(s1: str, s2: str) -> int:
        """最长公共子序列长度"""
        m, n = len(s1), len(s2)
        
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        
        return dp[m][n]

class TestEditDistance:
    
    def test_levenshtein(self):
        assert EditDistance.levenshtein("kitten", "sitting") == 3
        assert EditDistance.levenshtein("", "abc") == 3
        assert EditDistance.levenshtein("abc", "abc") == 0
    
    def test_edit_sequence(self):
        ops = EditDistance.edit_sequence("cat", "bat")
        assert len(ops) == 1
        assert "Replace" in ops[0]
    
    def test_lcs(self):
        assert AdvancedEditDistance.longest_common_subsequence("ABCBDAB", "BDCABA") == 4
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 后缀数组

#### [概念] 概念解释

后缀数组是将字符串所有后缀按字典序排序后的数组，支持高效解决多种字符串问题：最长公共前缀、最长重复子串、子串计数等。构建复杂度可达 O(n log n)。

#### [代码] 代码示例

```python
# 后缀数组
from typing import List, Tuple

class SuffixArray:
    """后缀数组"""
    
    @staticmethod
    def build_naive(s: str) -> List[int]:
        """朴素构建 O(n^2 log n)"""
        suffixes = [(s[i:], i) for i in range(len(s))]
        suffixes.sort()
        return [idx for _, idx in suffixes]
    
    @staticmethod
    def build_dc3(s: str) -> List[int]:
        """DC3 算法构建 O(n)"""
        pass
    
    @staticmethod
    def build_doubling(s: str) -> List[int]:
        """倍增算法构建 O(n log n)"""
        n = len(s)
        k = 1
        
        sa = list(range(n))
        rank = [ord(c) for c in s]
        tmp = [0] * n
        
        while k < n:
            sa.sort(key=lambda x: (rank[x], rank[x + k] if x + k < n else -1))
            
            tmp[sa[0]] = 0
            for i in range(1, n):
                prev, curr = sa[i - 1], sa[i]
                tmp[curr] = tmp[prev]
                if (rank[prev], rank[prev + k] if prev + k < n else -1) != \
                   (rank[curr], rank[curr + k] if curr + k < n else -1):
                    tmp[curr] += 1
            
            rank = tmp[:]
            k *= 2
        
        return sa

class LCPArray:
    """最长公共前缀数组"""
    
    @staticmethod
    def build(s: str, sa: List[int]) -> List[int]:
        """
        构建 LCP 数组
        Kasai 算法 O(n)
        """
        n = len(s)
        rank = [0] * n
        
        for i, idx in enumerate(sa):
            rank[idx] = i
        
        lcp = [0] * n
        k = 0
        
        for i in range(n):
            if rank[i] == n - 1:
                k = 0
                continue
            
            j = sa[rank[i] + 1]
            
            while i + k < n and j + k < n and s[i + k] == s[j + k]:
                k += 1
            
            lcp[rank[i]] = k
            
            if k > 0:
                k -= 1
        
        return lcp

class SuffixArrayApplications:
    """后缀数组应用"""
    
    @staticmethod
    def longest_repeated_substring(s: str) -> str:
        """最长重复子串"""
        sa = SuffixArray.build_doubling(s)
        lcp = LCPArray.build(s, sa)
        
        max_lcp = max(lcp) if lcp else 0
        if max_lcp == 0:
            return ""
        
        idx = lcp.index(max_lcp)
        return s[sa[idx]:sa[idx] + max_lcp]
    
    @staticmethod
    def count_distinct_substrings(s: str) -> int:
        """统计不同子串数量"""
        n = len(s)
        sa = SuffixArray.build_doubling(s)
        lcp = LCPArray.build(s, sa)
        
        total = n * (n + 1) // 2
        
        return total - sum(lcp)
    
    @staticmethod
    def longest_common_substring(s1: str, s2: str) -> str:
        """最长公共子串"""
        combined = s1 + "#" + s2
        n1 = len(s1)
        
        sa = SuffixArray.build_doubling(combined)
        lcp = LCPArray.build(combined, sa)
        
        max_len = 0
        max_idx = 0
        
        for i in range(len(sa) - 1):
            idx1, idx2 = sa[i], sa[i + 1]
            
            if (idx1 < n1 and idx2 > n1) or (idx1 > n1 and idx2 < n1):
                if lcp[i] > max_len:
                    max_len = lcp[i]
                    max_idx = idx1 if idx1 < n1 else idx2
        
        return combined[max_idx:max_idx + max_len]

class TestSuffixArray:
    
    def test_build(self):
        s = "banana"
        sa = SuffixArray.build_doubling(s)
        assert len(sa) == len(s)
    
    def test_lcp(self):
        s = "banana"
        sa = SuffixArray.build_doubling(s)
        lcp = LCPArray.build(s, sa)
        assert len(lcp) == len(s)
    
    def test_longest_repeated(self):
        s = "banana"
        result = SuffixArrayApplications.longest_repeated_substring(s)
        assert result == "ana"
```

### 2. AC 自动机

#### [概念] 概念解释

AC 自动机结合 Trie 树和 KMP 思想，支持多模式串匹配。构建后能在 O(n + m + z) 时间内完成匹配，其中 n 是文本长度，m 是模式串总长度，z 是匹配数量。

#### [代码] 代码示例

```python
# AC 自动机
from typing import List, Dict, Set
from collections import deque

class AhoCorasickNode:
    """AC 自动机节点"""
    
    def __init__(self):
        self.children: Dict[str, 'AhoCorasickNode'] = {}
        self.fail: 'AhoCorasickNode' = None
        self.output: Set[str] = set()

class AhoCorasick:
    """AC 自动机"""
    
    def __init__(self):
        self.root = AhoCorasickNode()
    
    def add_pattern(self, pattern: str):
        """添加模式串"""
        node = self.root
        
        for char in pattern:
            if char not in node.children:
                node.children[char] = AhoCorasickNode()
            node = node.children[char]
        
        node.output.add(pattern)
    
    def build(self):
        """构建失败指针"""
        queue = deque()
        
        for child in self.root.children.values():
            child.fail = self.root
            queue.append(child)
        
        while queue:
            current = queue.popleft()
            
            for char, child in current.children.items():
                fail = current.fail
                
                while fail and char not in fail.children:
                    fail = fail.fail
                
                child.fail = fail.children[char] if fail and char in fail.children else self.root
                child.output.update(child.fail.output)
                
                queue.append(child)
    
    def search(self, text: str) -> Dict[str, List[int]]:
        """搜索所有模式串"""
        result: Dict[str, List[int]] = {}
        node = self.root
        
        for i, char in enumerate(text):
            while node and char not in node.children:
                node = node.fail
            
            if not node:
                node = self.root
                continue
            
            node = node.children[char]
            
            for pattern in node.output:
                if pattern not in result:
                    result[pattern] = []
                result[pattern].append(i - len(pattern) + 1)
        
        return result

class Trie:
    """Trie 树"""
    
    def __init__(self):
        self.root = {}
        self.end_symbol = "*"
    
    def insert(self, word: str):
        """插入单词"""
        node = self.root
        for char in word:
            if char not in node:
                node[char] = {}
            node = node[char]
        node[self.end_symbol] = True
    
    def search(self, word: str) -> bool:
        """搜索单词"""
        node = self.root
        for char in word:
            if char not in node:
                return False
            node = node[char]
        return self.end_symbol in node
    
    def starts_with(self, prefix: str) -> bool:
        """检查前缀"""
        node = self.root
        for char in prefix:
            if char not in node:
                return False
            node = node[char]
        return True
    
    def get_words_with_prefix(self, prefix: str) -> List[str]:
        """获取所有以 prefix 开头的单词"""
        node = self.root
        for char in prefix:
            if char not in node:
                return []
            node = node[char]
        
        words = []
        self._collect_words(node, prefix, words)
        return words
    
    def _collect_words(self, node: dict, prefix: str, words: List[str]):
        if self.end_symbol in node:
            words.append(prefix)
        
        for char, child in node.items():
            if char != self.end_symbol:
                self._collect_words(child, prefix + char, words)

class TestAhoCorasick:
    
    def test_search(self):
        ac = AhoCorasick()
        patterns = ["he", "she", "his", "hers"]
        
        for pattern in patterns:
            ac.add_pattern(pattern)
        
        ac.build()
        
        text = "ushers"
        result = ac.search(text)
        
        assert "she" in result
        assert "he" in result
        assert "hers" in result

class TestTrie:
    
    def test_insert_search(self):
        trie = Trie()
        trie.insert("apple")
        
        assert trie.search("apple") is True
        assert trie.search("app") is False
        assert trie.starts_with("app") is True
    
    def test_prefix_words(self):
        trie = Trie()
        trie.insert("apple")
        trie.insert("app")
        trie.insert("application")
        
        words = trie.get_words_with_prefix("app")
        assert len(words) == 3
```

### 3. Manacher 算法

#### [概念] 概念解释

Manacher 算法在 O(n) 时间内找出所有回文子串，利用回文的对称性质避免重复计算。相比暴力 O(n^2) 和动态规划 O(n^2)，效率更高。

#### [代码] 代码示例

```python
# Manacher 算法
from typing import List, Tuple

class Manacher:
    """Manacher 回文算法"""
    
    @staticmethod
    def preprocess(s: str) -> str:
        """预处理，插入特殊字符"""
        return "#" + "#".join(s) + "#"
    
    @staticmethod
    def longest_palindrome(s: str) -> str:
        """最长回文子串"""
        if not s:
            return ""
        
        t = Manacher.preprocess(s)
        n = len(t)
        
        p = [0] * n
        center = 0
        right = 0
        
        for i in range(n):
            mirror = 2 * center - i
            
            if i < right:
                p[i] = min(right - i, p[mirror])
            
            left_bound = i - (p[i] + 1)
            right_bound = i + (p[i] + 1)
            
            while left_bound >= 0 and right_bound < n and t[left_bound] == t[right_bound]:
                p[i] += 1
                left_bound -= 1
                right_bound += 1
            
            if i + p[i] > right:
                center = i
                right = i + p[i]
        
        max_len = max(p)
        center_idx = p.index(max_len)
        
        start = (center_idx - max_len) // 2
        
        return s[start:start + max_len]
    
    @staticmethod
    def all_palindromes(s: str) -> List[str]:
        """找出所有回文子串"""
        if not s:
            return []
        
        t = Manacher.preprocess(s)
        n = len(t)
        
        p = [0] * n
        center = 0
        right = 0
        
        for i in range(n):
            mirror = 2 * center - i
            
            if i < right:
                p[i] = min(right - i, p[mirror])
            
            left_bound = i - (p[i] + 1)
            right_bound = i + (p[i] + 1)
            
            while left_bound >= 0 and right_bound < n and t[left_bound] == t[right_bound]:
                p[i] += 1
                left_bound -= 1
                right_bound += 1
            
            if i + p[i] > right:
                center = i
                right = i + p[i]
        
        palindromes = set()
        
        for i in range(n):
            if p[i] > 0:
                start = (i - p[i]) // 2
                length = p[i]
                palindromes.add(s[start:start + length])
        
        return list(palindromes)
    
    @staticmethod
    def count_palindromes(s: str) -> int:
        """统计回文子串数量"""
        if not s:
            return 0
        
        t = Manacher.preprocess(s)
        n = len(t)
        
        p = [0] * n
        center = 0
        right = 0
        count = 0
        
        for i in range(n):
            mirror = 2 * center - i
            
            if i < right:
                p[i] = min(right - i, p[mirror])
            
            left_bound = i - (p[i] + 1)
            right_bound = i + (p[i] + 1)
            
            while left_bound >= 0 and right_bound < n and t[left_bound] == t[right_bound]:
                p[i] += 1
                left_bound -= 1
                right_bound += 1
            
            if i + p[i] > right:
                center = i
                right = i + p[i]
            
            count += (p[i] + 1) // 2
        
        return count

class TestManacher:
    
    def test_longest_palindrome(self):
        assert Manacher.longest_palindrome("babad") == "bab"
        assert Manacher.longest_palindrome("cbbd") == "bb"
        assert Manacher.longest_palindrome("racecar") == "racecar"
    
    def test_count_palindromes(self):
        assert Manacher.count_palindromes("aaa") == 6
        assert Manacher.count_palindromes("abc") == 3
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Z-Algorithm | Z 函数，线性时间模式匹配 |
| Boyer-Moore | 从右向左匹配，坏字符规则 |
| Sunday Algorithm | 坏字符跳跃，简单高效 |
| Suffix Tree | 后缀树，线性空间存储所有后缀 |
| Suffix Automaton | 后缀自动机，在线构建 |
| Palindromic Tree | 回文树，处理所有回文子串 |
| String Alignment | 字符串对齐，生物信息学 |
| Regular Expression | 正则表达式匹配 |
| Run-Length Encoding | 游程编码，压缩算法 |
| Burrows-Wheeler | BWT 变换，压缩和索引 |
