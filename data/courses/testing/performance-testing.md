# 性能测试 三层深度学习教程

## [总览] 技术总览

性能测试验证系统在特定负载下的响应速度、吞吐量和稳定性。它帮助发现性能瓶颈、验证系统容量、确保用户体验。主要类型包括负载测试、压力测试、并发测试和基准测试。

本教程采用三层漏斗学习法：**核心层**聚焦性能指标、Locust 负载测试、性能分析三大基石；**重点层**深入测试策略和结果分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 性能测试指标

#### [概念] 概念解释

关键性能指标包括：响应时间（用户请求到响应的时间）、吞吐量（单位时间处理的请求数）、并发数（同时在线用户数）、错误率（失败请求占比）、资源利用率（CPU、内存、网络使用率）。

#### [代码] 代码示例

```python
# 性能指标收集与分析
import time
import statistics
from dataclasses import dataclass
from typing import List
import psutil
import threading

@dataclass
class PerformanceMetrics:
    response_times: List[float]
    throughput: float
    error_rate: float
    avg_cpu: float
    avg_memory: float
    
    @property
    def avg_response_time(self) -> float:
        return statistics.mean(self.response_times)
    
    @property
    def p50(self) -> float:
        return statistics.median(self.response_times)
    
    @property
    def p95(self) -> float:
        sorted_times = sorted(self.response_times)
        index = int(len(sorted_times) * 0.95)
        return sorted_times[index]
    
    @property
    def p99(self) -> float:
        sorted_times = sorted(self.response_times)
        index = int(len(sorted_times) * 0.99)
        return sorted_times[index]

class PerformanceMonitor:
    def __init__(self):
        self.cpu_samples = []
        self.memory_samples = []
        self._monitoring = False
    
    def start_monitoring(self, interval: float = 0.1):
        self._monitoring = True
        self._thread = threading.Thread(target=self._monitor)
        self._thread.start()
    
    def stop_monitoring(self):
        self._monitoring = False
        self._thread.join()
    
    def _monitor(self):
        while self._monitoring:
            self.cpu_samples.append(psutil.cpu_percent())
            self.memory_samples.append(psutil.virtual_memory().percent)
            time.sleep(0.1)
    
    def get_metrics(self) -> dict:
        return {
            "avg_cpu": statistics.mean(self.cpu_samples) if self.cpu_samples else 0,
            "max_cpu": max(self.cpu_samples) if self.cpu_samples else 0,
            "avg_memory": statistics.mean(self.memory_samples) if self.memory_samples else 0,
            "max_memory": max(self.memory_samples) if self.memory_samples else 0
        }

def measure_response_time(func, *args, **kwargs) -> tuple:
    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()
    return result, (end_time - start_time) * 1000

class TestPerformanceMetrics:
    
    def test_api_performance(self):
        import requests
        
        response_times = []
        errors = 0
        total_requests = 100
        
        for _ in range(total_requests):
            try:
                start = time.perf_counter()
                response = requests.get("https://httpbin.org/get")
                end = time.perf_counter()
                
                if response.status_code == 200:
                    response_times.append((end - start) * 1000)
                else:
                    errors += 1
            except Exception:
                errors += 1
        
        metrics = PerformanceMetrics(
            response_times=response_times,
            throughput=len(response_times) / 10,
            error_rate=errors / total_requests * 100,
            avg_cpu=0,
            avg_memory=0
        )
        
        print(f"Average Response Time: {metrics.avg_response_time:.2f}ms")
        print(f"P50: {metrics.p50:.2f}ms")
        print(f"P95: {metrics.p95:.2f}ms")
        print(f"P99: {metrics.p99:.2f}ms")
        print(f"Throughput: {metrics.throughput:.2f} req/s")
        print(f"Error Rate: {metrics.error_rate:.2f}%")
        
        assert metrics.avg_response_time < 1000
        assert metrics.error_rate < 5
```

### 2. Locust 负载测试

#### [概念] 概念解释

Locust 是 Python 编写的开源负载测试工具，支持编写用户行为脚本，模拟大量并发用户。它提供 Web UI 实时监控，支持分布式测试，易于扩展。

#### [代码] 代码示例

```python
# Locust 负载测试脚本
from locust import HttpUser, task, between, events
import json

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_homepage(self):
        self.client.get("/", name="Homepage")
    
    @task(2)
    def view_products(self):
        self.client.get("/products", name="Products List")
        
        with self.client.get("/products/1", name="Product Detail", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("price", 0) > 0:
                    response.success()
                else:
                    response.failure("Invalid product price")
            else:
                response.failure(f"HTTP {response.status_code}")
    
    @task(1)
    def search_products(self):
        self.client.get("/search?q=laptop", name="Search")
    
    @task(1)
    def add_to_cart(self):
        self.client.post("/cart/add", json={
            "product_id": 1,
            "quantity": 1
        }, name="Add to Cart")
    
    def on_start(self):
        response = self.client.post("/login", json={
            "username": "testuser",
            "password": "password123"
        })
        if response.status_code == 200:
            self.token = response.json().get("token")

class APIUser(HttpUser):
    wait_time = between(0.5, 2)
    
    def on_start(self):
        self.headers = {"Authorization": "Bearer test-token"}
    
    @task
    def get_users(self):
        self.client.get("/api/users", headers=self.headers, name="API: Get Users")
    
    @task
    def create_user(self):
        self.client.post("/api/users", json={
            "name": "Test User",
            "email": "test@example.com"
        }, headers=self.headers, name="API: Create User")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Performance test starting...")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Performance test completed.")
    stats = environment.stats
    print(f"Total requests: {stats.total.num_requests}")
    print(f"Total failures: {stats.total.num_failures}")
    print(f"Average response time: {stats.total.avg_response_time:.2f}ms")
```

### 3. 性能分析与瓶颈定位

#### [概念] 概念解释

性能分析识别系统瓶颈，包括 CPU 密集型操作、I/O 阻塞、内存泄漏、数据库慢查询等。使用 profiling 工具和监控数据分析性能问题根源。

#### [代码] 代码示例

```python
# 性能分析示例
import cProfile
import pstats
import io
import time
from functools import wraps
import sqlite3
import asyncio

def profile_function(output_file=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            profiler = cProfile.Profile()
            profiler.enable()
            
            result = func(*args, **kwargs)
            
            profiler.disable()
            
            s = io.StringIO()
            ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
            ps.print_stats(20)
            
            print(s.getvalue())
            
            if output_file:
                profiler.dump_stats(output_file)
            
            return result
        return wrapper
    return decorator

class DatabasePerformanceAnalyzer:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.conn.execute("PRAGMA journal_mode=WAL")
    
    def analyze_query(self, query: str, params: tuple = ()):
        cursor = self.conn.cursor()
        
        cursor.execute("EXPLAIN QUERY PLAN " + query, params)
        plan = cursor.fetchall()
        print("Query Plan:", plan)
        
        start = time.perf_counter()
        cursor.execute(query, params)
        results = cursor.fetchall()
        end = time.perf_counter()
        
        print(f"Query time: {(end - start) * 1000:.2f}ms")
        print(f"Rows returned: {len(results)}")
        
        return results
    
    def find_slow_queries(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM sqlite_master 
            WHERE type='table'
        """)
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[1]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"Table {table_name}: {count} rows")

@profile_function()
def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

class AsyncPerformanceTest:
    async def fetch_url(self, session, url: str):
        import aiohttp
        start = time.perf_counter()
        async with session.get(url) as response:
            await response.text()
        return time.perf_counter() - start
    
    async def concurrent_requests(self, urls: list, concurrency: int = 10):
        import aiohttp
        from asyncio import Semaphore
        
        semaphore = Semaphore(concurrency)
        
        async def bounded_fetch(session, url):
            async with semaphore:
                return await self.fetch_url(session, url)
        
        async with aiohttp.ClientSession() as session:
            tasks = [bounded_fetch(session, url) for url in urls]
            times = await asyncio.gather(*tasks)
        
        return {
            "total_time": sum(times),
            "avg_time": sum(times) / len(times),
            "min_time": min(times),
            "max_time": max(times)
        }

if __name__ == "__main__":
    slow_function()
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 测试策略设计

#### [概念] 概念解释

性能测试策略根据业务需求设计测试场景：基准测试确定系统基线、负载测试验证正常负载表现、压力测试发现系统极限、浸泡测试验证长时间稳定性。

#### [代码] 代码示例

```python
# 测试策略实现
from dataclasses import dataclass
from enum import Enum
from typing import Callable, List
import time

class TestType(Enum):
    BASELINE = "baseline"
    LOAD = "load"
    STRESS = "stress"
    SOAK = "soak"
    SPIKE = "spike"

@dataclass
class TestScenario:
    name: str
    test_type: TestType
    duration_seconds: int
    users: int
    ramp_up_seconds: int = 0

class PerformanceTestSuite:
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.scenarios: List[TestScenario] = []
    
    def add_scenario(self, scenario: TestScenario):
        self.scenarios.append(scenario)
    
    def run_baseline_test(self):
        scenario = TestScenario(
            name="Baseline",
            test_type=TestType.BASELINE,
            duration_seconds=60,
            users=1
        )
        return self._execute_scenario(scenario)
    
    def run_load_test(self, users: int = 100, duration: int = 300):
        scenario = TestScenario(
            name="Load Test",
            test_type=TestType.LOAD,
            duration_seconds=duration,
            users=users,
            ramp_up_seconds=60
        )
        return self._execute_scenario(scenario)
    
    def run_stress_test(self, max_users: int = 500):
        results = []
        for users in [100, 200, 300, 400, max_users]:
            scenario = TestScenario(
                name=f"Stress Test - {users} users",
                test_type=TestType.STRESS,
                duration_seconds=120,
                users=users,
                ramp_up_seconds=30
            )
            result = self._execute_scenario(scenario)
            results.append(result)
            
            if result["error_rate"] > 10:
                print(f"Breaking point reached at {users} users")
                break
        return results
    
    def run_soak_test(self, duration_hours: int = 4):
        scenario = TestScenario(
            name="Soak Test",
            test_type=TestType.SOAK,
            duration_seconds=duration_hours * 3600,
            users=50,
            ramp_up_seconds=300
        )
        return self._execute_scenario(scenario)
    
    def _execute_scenario(self, scenario: TestScenario) -> dict:
        print(f"Executing: {scenario.name}")
        print(f"  Users: {scenario.users}")
        print(f"  Duration: {scenario.duration_seconds}s")
        
        return {
            "scenario": scenario.name,
            "users": scenario.users,
            "duration": scenario.duration_seconds,
            "avg_response_time": 150,
            "throughput": 1000,
            "error_rate": 0.5
        }

suite = PerformanceTestSuite("https://example.com")
suite.run_baseline_test()
suite.run_load_test(users=100)
suite.run_stress_test(max_users=500)
```

### 2. 结果分析与报告

#### [概念] 概念解释

性能测试结果需要系统分析：识别性能瓶颈、对比基线数据、评估是否达标。报告应包含关键指标、趋势图表、问题分析和优化建议。

#### [代码] 代码示例

```python
# 结果分析与报告生成
import json
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict
import statistics

@dataclass
class TestResult:
    timestamp: str
    scenario: str
    total_requests: int
    total_errors: int
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    p50: float
    p95: float
    p99: float
    throughput: float
    error_rate: float
    
    def to_dict(self) -> dict:
        return asdict(self)

class PerformanceReport:
    def __init__(self):
        self.results: List[TestResult] = []
        self.baseline: TestResult = None
    
    def add_result(self, result: TestResult):
        self.results.append(result)
    
    def set_baseline(self, result: TestResult):
        self.baseline = result
    
    def compare_with_baseline(self, result: TestResult) -> dict:
        if not self.baseline:
            return {}
        
        return {
            "response_time_change": (
                (result.avg_response_time - self.baseline.avg_response_time) 
                / self.baseline.avg_response_time * 100
            ),
            "throughput_change": (
                (result.throughput - self.baseline.throughput) 
                / self.baseline.throughput * 100
            ),
            "error_rate_change": result.error_rate - self.baseline.error_rate
        }
    
    def identify_bottlenecks(self, result: TestResult) -> List[str]:
        bottlenecks = []
        
        if result.p99 > result.avg_response_time * 3:
            bottlenecks.append("High tail latency - investigate slow outliers")
        
        if result.error_rate > 1:
            bottlenecks.append(f"Error rate {result.error_rate}% exceeds threshold")
        
        if result.p95 > 1000:
            bottlenecks.append("P95 response time exceeds 1 second")
        
        throughput_diff = result.throughput - (self.baseline.throughput if self.baseline else 0)
        if throughput_diff < 0:
            bottlenecks.append("Throughput degradation detected")
        
        return bottlenecks
    
    def generate_summary(self) -> dict:
        if not self.results:
            return {}
        
        return {
            "total_scenarios": len(self.results),
            "best_performance": min(self.results, key=lambda r: r.avg_response_time).scenario,
            "worst_performance": max(self.results, key=lambda r: r.avg_response_time).scenario,
            "highest_throughput": max(self.results, key=lambda r: r.throughput).scenario,
            "avg_error_rate": statistics.mean([r.error_rate for r in self.results])
        }
    
    def export_json(self, filepath: str):
        data = {
            "generated_at": datetime.now().isoformat(),
            "baseline": self.baseline.to_dict() if self.baseline else None,
            "results": [r.to_dict() for r in self.results],
            "summary": self.generate_summary()
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def generate_html_report(self, filepath: str):
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Performance Test Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #4CAF50; color: white; }}
                .warning {{ color: orange; }}
                .error {{ color: red; }}
                .success {{ color: green; }}
            </style>
        </head>
        <body>
            <h1>Performance Test Report</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h2>Summary</h2>
            <p>Total Scenarios: {len(self.results)}</p>
            
            <h2>Results</h2>
            <table>
                <tr>
                    <th>Scenario</th>
                    <th>Requests</th>
                    <th>Avg RT (ms)</th>
                    <th>P95 (ms)</th>
                    <th>Throughput</th>
                    <th>Error Rate</th>
                </tr>
                {''.join([f'''
                <tr>
                    <td>{r.scenario}</td>
                    <td>{r.total_requests}</td>
                    <td class="{'error' if r.avg_response_time > 1000 else 'success'}">{r.avg_response_time:.2f}</td>
                    <td>{r.p95:.2f}</td>
                    <td>{r.throughput:.2f}</td>
                    <td class="{'error' if r.error_rate > 1 else 'success'}">{r.error_rate:.2f}%</td>
                </tr>
                ''' for r in self.results])}
            </table>
        </body>
        </html>
        """
        
        with open(filepath, 'w') as f:
            f.write(html)
```

### 3. 持续性能监控

#### [概念] 概念解释

持续性能监控将性能测试集成到 CI/CD 流程，每次代码变更自动运行性能测试，对比历史数据，及时发现性能退化。

#### [代码] 代码示例

```python
# CI/CD 性能测试集成
import subprocess
import json
import sys
from pathlib import Path

class CIPerformanceGate:
    def __init__(self, config_path: str = "perf_config.json"):
        with open(config_path) as f:
            self.config = json.load(f)
        
        self.thresholds = self.config.get("thresholds", {
            "max_avg_response_time": 500,
            "max_p95_response_time": 1000,
            "max_error_rate": 1.0,
            "min_throughput": 100
        })
    
    def run_tests(self) -> dict:
        result = subprocess.run(
            ["locust", "-f", "locustfile.py", "--headless", 
             "-u", "100", "-r", "10", "-t", "60s", "--json"],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            return {"success": False, "error": result.stderr}
        
        return json.loads(result.stdout)
    
    def evaluate_results(self, results: dict) -> dict:
        violations = []
        
        if results["avg_response_time"] > self.thresholds["max_avg_response_time"]:
            violations.append({
                "metric": "avg_response_time",
                "value": results["avg_response_time"],
                "threshold": self.thresholds["max_avg_response_time"]
            })
        
        if results["p95_response_time"] > self.thresholds["max_p95_response_time"]:
            violations.append({
                "metric": "p95_response_time",
                "value": results["p95_response_time"],
                "threshold": self.thresholds["max_p95_response_time"]
            })
        
        if results["error_rate"] > self.thresholds["max_error_rate"]:
            violations.append({
                "metric": "error_rate",
                "value": results["error_rate"],
                "threshold": self.thresholds["max_error_rate"]
            })
        
        if results["throughput"] < self.thresholds["min_throughput"]:
            violations.append({
                "metric": "throughput",
                "value": results["throughput"],
                "threshold": self.thresholds["min_throughput"]
            })
        
        return {
            "passed": len(violations) == 0,
            "violations": violations
        }
    
    def run_gate(self):
        print("Running performance tests...")
        results = self.run_tests()
        
        if "error" in results:
            print(f"Test execution failed: {results['error']}")
            sys.exit(1)
        
        print("Evaluating results against thresholds...")
        evaluation = self.evaluate_results(results)
        
        if evaluation["passed"]:
            print("Performance gate PASSED")
            sys.exit(0)
        else:
            print("Performance gate FAILED")
            for v in evaluation["violations"]:
                print(f"  {v['metric']}: {v['value']} (threshold: {v['threshold']})")
            sys.exit(1)

if __name__ == "__main__":
    gate = CIPerformanceGate()
    gate.run_gate()
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| JMeter | Java 性能测试工具，企业级应用 |
| Gatling | Scala 性能测试工具，高性能 |
| k6 | Go 编写的现代负载测试工具 |
| APM | 应用性能监控，实时追踪 |
| Flame Graphs | 火焰图，可视化 CPU 分析 |
| Memory Profiling | 内存分析，检测泄漏 |
| Database Benchmarking | 数据库基准测试，sysbench |
| Network Latency | 网络延迟测试，TCP/HTTP |
| Container Performance | 容器性能，资源限制测试 |
| Cloud Load Testing | 云负载测试，分布式压测 |
