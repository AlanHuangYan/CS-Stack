# 图算法 三层深度学习教程

## [总览] 技术总览

图是表示对象之间关系的数据结构，由顶点和边组成。图算法解决最短路径、连通性、匹配等问题，是算法竞赛和实际应用的重要内容。

本教程采用三层漏斗学习法：**核心层**聚焦图的表示、BFS/DFS、最短路径三大基石；**重点层**深入最小生成树、拓扑排序、网络流；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 图的表示

#### [概念] 概念解释

图可以用邻接矩阵或邻接表表示。邻接矩阵适合稠密图，邻接表适合稀疏图。

#### [代码] 代码示例

```python
# 邻接矩阵
class GraphMatrix:
    def __init__(self, n):
        self.n = n
        self.matrix = [[0] * n for _ in range(n)]
    
    def add_edge(self, u, v, weight=1):
        self.matrix[u][v] = weight
        self.matrix[v][u] = weight  # 无向图
    
    def get_neighbors(self, u):
        return [(v, self.matrix[u][v]) for v in range(self.n) if self.matrix[u][v]]

# 邻接表
from collections import defaultdict

class GraphList:
    def __init__(self):
        self.graph = defaultdict(list)
    
    def add_edge(self, u, v, weight=1):
        self.graph[u].append((v, weight))
        self.graph[v].append((u, weight))  # 无向图
    
    def get_neighbors(self, u):
        return self.graph[u]

# 使用示例
g = GraphList()
g.add_edge(0, 1)
g.add_edge(0, 2)
g.add_edge(1, 2)
print(g.graph)  # {0: [(1, 1), (2, 1)], 1: [(0, 1), (2, 1)], 2: [(0, 1), (1, 1)]})
```

### 2. BFS 和 DFS

#### [概念] 概念解释

BFS（广度优先搜索）逐层遍历图，DFS（深度优先搜索）深入探索后回溯。它们是图算法的基础。

#### [代码] 代码示例

```python
from collections import deque

# BFS
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        
        visited.add(node)
        result.append(node)
        
        for neighbor, _ in graph.get_neighbors(node):
            if neighbor not in visited:
                queue.append(neighbor)
    
    return result

# DFS
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    result = [start]
    
    for neighbor, _ in graph.get_neighbors(start):
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    
    return result

# 最短路径（无权图）
def shortest_path_unweighted(graph, start, end):
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        node, path = queue.popleft()
        
        if node == end:
            return path
        
        for neighbor, _ in graph.get_neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None
```

### 3. 最短路径

#### [概念] 概念解释

Dijkstra 算法求解单源最短路径，Floyd 算法求解所有点对最短路径。

#### [代码] 代码示例

```python
import heapq

# Dijkstra
def dijkstra(graph, start):
    distances = {start: 0}
    heap = [(0, start)]
    
    while heap:
        dist, node = heapq.heappop(heap)
        
        if dist > distances.get(node, float('inf')):
            continue
        
        for neighbor, weight in graph.get_neighbors(node):
            new_dist = dist + weight
            if new_dist < distances.get(neighbor, float('inf')):
                distances[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))
    
    return distances

# Floyd-Warshall
def floyd_warshall(graph_matrix):
    n = len(graph_matrix)
    dist = [[float('inf')] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i == j:
                dist[i][j] = 0
            elif graph_matrix[i][j]:
                dist[i][j] = graph_matrix[i][j]
    
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    
    return dist
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 最小生成树

#### [代码] 代码示例

```python
# Kruskal
def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    parent = list(range(n))
    rank = [0] * n
    
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
    
    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]:
            rank[px] += 1
        return True
    
    mst = []
    for u, v, w in edges:
        if union(u, v):
            mst.append((u, v, w))
            if len(mst) == n - 1:
                break
    
    return mst

# Prim
def prim(graph, start):
    mst = []
    visited = {start}
    edges = [(w, start, v) for v, w in graph.get_neighbors(start)]
    heapq.heapify(edges)
    
    while edges:
        w, u, v = heapq.heappop(edges)
        if v not in visited:
            visited.add(v)
            mst.append((u, v, w))
            for neighbor, weight in graph.get_neighbors(v):
                if neighbor not in visited:
                    heapq.heappush(edges, (weight, v, neighbor))
    
    return mst
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
```

### 3. 网络流

#### [代码] 代码示例

```python
# 最大流 - Ford-Fulkerson
def max_flow(graph, source, sink):
    def bfs_path():
        visited = {source}
        queue = deque([(source, [])])
        
        while queue:
            node, path = queue.popleft()
            
            for neighbor, capacity in graph.get(node, {}).items():
                if neighbor not in visited and capacity > 0:
                    new_path = path + [(node, neighbor)]
                    if neighbor == sink:
                        return new_path
                    visited.add(neighbor)
                    queue.append((neighbor, new_path))
        
        return None
    
    flow = 0
    
    while True:
        path = bfs_path()
        if not path:
            break
        
        min_capacity = min(graph[u][v] for u, v in path)
        flow += min_capacity
        
        for u, v in path:
            graph[u][v] -= min_capacity
            graph[v][u] = graph.get(v, {}).get(u, 0) + min_capacity
    
    return flow
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Bellman-Ford | 需要处理负权边时 |
| SPFA | 需要优化的最短路径时 |
| A* Search | 需要启发式搜索时 |
| Bipartite Matching | 需要二分图匹配时 |
| Euler Path | 需要欧拉路径时 |
| Hamilton Path | 需要哈密顿路径时 |
| Strongly Connected | 需要强连通分量时 |
| Articulation Point | 需要割点时 |
| Bridge | 需要桥时 |
| Union Find | 需要并查集时 |

---

## [实战] 核心实战清单

### 实战任务 1：实现完整的图算法工具类

```python
class GraphAlgorithms:
    @staticmethod
    def dijkstra(graph, start):
        import heapq
        distances = {start: 0}
        heap = [(0, start)]
        
        while heap:
            dist, node = heapq.heappop(heap)
            if dist > distances.get(node, float('inf')):
                continue
            for neighbor, weight in graph.get(node, []):
                new_dist = dist + weight
                if new_dist < distances.get(neighbor, float('inf')):
                    distances[neighbor] = new_dist
                    heapq.heappush(heap, (new_dist, neighbor))
        
        return distances
```
