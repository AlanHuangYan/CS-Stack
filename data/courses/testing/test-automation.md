# 测试自动化 三层深度学习教程

## [总览] 技术总览

测试自动化将重复性测试任务自动化执行，提高测试效率和覆盖率。它涵盖测试脚本编写、测试框架选择、CI/CD 集成、测试报告生成等环节，是现代软件开发的必备能力。

本教程采用三层漏斗学习法：**核心层**聚焦自动化测试框架、测试脚本设计、测试数据管理三大基石；**重点层**深入 CI/CD 集成和并行测试；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 自动化测试框架

#### [概念] 概念解释

自动化测试框架提供测试执行的基础设施，包括测试发现、执行、报告等功能。选择框架需考虑语言支持、学习曲线、社区活跃度、扩展性等因素。

#### [代码] 代码示例

```python
# 自动化测试框架示例
import pytest
import unittest
from typing import List, Dict, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod
import time
import json

@dataclass
class TestResult:
    name: str
    status: str
    duration: float
    error: str = None
    screenshot: str = None

class BaseTestFramework(ABC):
    """测试框架基类"""
    
    def __init__(self):
        self.results: List[TestResult] = []
        self.setup_hooks = []
        self.teardown_hooks = []
    
    def register_setup(self, hook):
        self.setup_hooks.append(hook)
    
    def register_teardown(self, hook):
        self.teardown_hooks.append(hook)
    
    def run_setup(self):
        for hook in self.setup_hooks:
            hook()
    
    def run_teardown(self):
        for hook in reversed(self.teardown_hooks):
            hook()
    
    @abstractmethod
    def run_test(self, test_func):
        pass
    
    def get_report(self) -> Dict:
        passed = len([r for r in self.results if r.status == "passed"])
        failed = len([r for r in self.results if r.status == "failed"])
        
        return {
            "total": len(self.results),
            "passed": passed,
            "failed": failed,
            "pass_rate": passed / len(self.results) * 100 if self.results else 0,
            "results": [r.__dict__ for r in self.results]
        }

class SimpleTestFramework(BaseTestFramework):
    """简单测试框架实现"""
    
    def run_test(self, test_func):
        self.run_setup()
        
        start_time = time.time()
        try:
            test_func()
            result = TestResult(
                name=test_func.__name__,
                status="passed",
                duration=time.time() - start_time
            )
        except Exception as e:
            result = TestResult(
                name=test_func.__name__,
                status="failed",
                duration=time.time() - start_time,
                error=str(e)
            )
        
        self.results.append(result)
        self.run_teardown()
        
        return result

class TestSuite:
    """测试套件"""
    
    def __init__(self, name: str):
        self.name = name
        self.tests: List[callable] = []
        self.framework = SimpleTestFramework()
    
    def add_test(self, test_func: callable):
        self.tests.append(test_func)
        return test_func
    
    def run_all(self) -> Dict:
        for test in self.tests:
            self.framework.run_test(test)
        
        return self.framework.get_report()

# 使用示例
suite = TestSuite("User API Tests")

@suite.add_test
def test_create_user():
    import requests
    response = requests.post(
        "https://api.example.com/users",
        json={"name": "Test User"}
    )
    assert response.status_code == 201

@suite.add_test
def test_get_user():
    import requests
    response = requests.get("https://api.example.com/users/1")
    assert response.status_code == 200

# pytest 高级用法
class TestAPIAutomation:
    """pytest 自动化测试"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        from requests import Session
        session = Session()
        session.base_url = "https://api.example.com"
        yield session
        session.close()
    
    @pytest.fixture
    def test_user(self, api_client):
        response = api_client.post(
            f"{api_client.base_url}/users",
            json={"name": "Test User", "email": "test@example.com"}
        )
        yield response.json()
        api_client.delete(f"{api_client.base_url}/users/{response.json()['id']}")
    
    @pytest.mark.parametrize("user_data", [
        {"name": "User 1", "email": "user1@example.com"},
        {"name": "User 2", "email": "user2@example.com"},
        {"name": "User 3", "email": "user3@example.com"},
    ])
    def test_create_users(self, api_client, user_data):
        response = api_client.post(
            f"{api_client.base_url}/users",
            json=user_data
        )
        assert response.status_code == 201
        assert response.json()["name"] == user_data["name"]
    
    def test_get_user(self, api_client, test_user):
        response = api_client.get(
            f"{api_client.base_url}/users/{test_user['id']}"
        )
        assert response.status_code == 200
        assert response.json()["id"] == test_user["id"]
```

### 2. 测试脚本设计

#### [概念] 概念解释

好的测试脚本遵循 DRY 原则（Don't Repeat Yourself），使用 Page Object 模式封装 UI 操作，使用数据驱动分离测试数据，使用模块化组织测试代码。

#### [代码] 代码示例

```python
# 测试脚本设计模式
from dataclasses import dataclass
from typing import List, Dict, Optional
from abc import ABC, abstractmethod
import json
import csv

# Page Object 模式
class PageObject(ABC):
    """页面对象基类"""
    
    def __init__(self, driver):
        self.driver = driver
    
    @abstractmethod
    def is_loaded(self) -> bool:
        pass

class LoginPage(PageObject):
    """登录页面对象"""
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = "/login"
    
    def is_loaded(self) -> bool:
        return "login" in self.driver.current_url
    
    def navigate(self):
        self.driver.get(self.url)
    
    def enter_username(self, username: str):
        self.driver.find_element("id", "username").send_keys(username)
    
    def enter_password(self, password: str):
        self.driver.find_element("id", "password").send_keys(password)
    
    def click_login(self):
        self.driver.find_element("id", "login-btn").click()
    
    def login(self, username: str, password: str) -> "DashboardPage":
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()
        return DashboardPage(self.driver)
    
    def get_error_message(self) -> str:
        return self.driver.find_element("class", "error").text

class DashboardPage(PageObject):
    """仪表盘页面对象"""
    
    def is_loaded(self) -> bool:
        return "dashboard" in self.driver.current_url
    
    def get_welcome_message(self) -> str:
        return self.driver.find_element("id", "welcome").text
    
    def logout(self) -> LoginPage:
        self.driver.find_element("id", "logout-btn").click()
        return LoginPage(self.driver)

# 数据驱动测试
@dataclass
class TestData:
    username: str
    password: str
    expected_result: str
    expected_message: str

class DataProvider:
    """测试数据提供者"""
    
    @staticmethod
    def from_csv(filepath: str) -> List[TestData]:
        data = []
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(TestData(
                    username=row['username'],
                    password=row['password'],
                    expected_result=row['expected_result'],
                    expected_message=row['expected_message']
                ))
        return data
    
    @staticmethod
    def from_json(filepath: str) -> List[TestData]:
        with open(filepath, 'r') as f:
            raw_data = json.load(f)
        return [TestData(**item) for item in raw_data]
    
    @staticmethod
    def generate_users(count: int) -> List[Dict]:
        import random
        import string
        
        users = []
        for i in range(count):
            username = f"testuser_{i}"
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            users.append({
                "username": username,
                "password": password,
                "email": f"{username}@test.com"
            })
        return users

class TestLoginWithData:
    """数据驱动登录测试"""
    
    @pytest.fixture
    def login_page(self, driver):
        page = LoginPage(driver)
        page.navigate()
        return page
    
    @pytest.mark.parametrize("test_data", [
        TestData("admin", "admin123", "success", "Welcome"),
        TestData("invalid", "wrong", "failure", "Invalid credentials"),
        TestData("", "password", "failure", "Username required"),
        TestData("admin", "", "failure", "Password required"),
    ])
    def test_login_scenarios(self, login_page, test_data):
        if test_data.expected_result == "success":
            dashboard = login_page.login(test_data.username, test_data.password)
            assert dashboard.is_loaded()
            assert test_data.expected_message in dashboard.get_welcome_message()
        else:
            login_page.enter_username(test_data.username)
            login_page.enter_password(test_data.password)
            login_page.click_login()
            error = login_page.get_error_message()
            assert test_data.expected_message in error

# 工厂模式创建测试对象
class PageFactory:
    """页面工厂"""
    
    _pages = {
        "login": LoginPage,
        "dashboard": DashboardPage,
    }
    
    @classmethod
    def create(cls, page_name: str, driver) -> PageObject:
        page_class = cls._pages.get(page_name)
        if not page_class:
            raise ValueError(f"Unknown page: {page_name}")
        return page_class(driver)

class TestWithFactory:
    
    def test_navigate_to_dashboard(self, driver):
        login = PageFactory.create("login", driver)
        login.navigate()
        
        dashboard = login.login("admin", "admin123")
        assert dashboard.is_loaded()
```

### 3. 测试数据管理

#### [概念] 概念解释

测试数据管理确保测试有可靠的数据源。策略包括：数据工厂模式、Fixtures、数据库事务回滚、测试数据隔离、环境变量配置。

#### [代码] 代码示例

```python
# 测试数据管理
import pytest
from typing import Generator, Dict, Any
from contextlib import contextmanager
from dataclasses import dataclass, field
import uuid
import json
from datetime import datetime

@dataclass
class User:
    id: int = None
    username: str = ""
    email: str = ""
    role: str = "user"
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class Product:
    id: int = None
    name: str = ""
    price: float = 0.0
    stock: int = 0

class DataFactory:
    """数据工厂"""
    
    @staticmethod
    def create_user(**kwargs) -> User:
        defaults = {
            "username": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "role": "user"
        }
        defaults.update(kwargs)
        return User(**defaults)
    
    @staticmethod
    def create_product(**kwargs) -> Product:
        defaults = {
            "name": f"Product_{uuid.uuid4().hex[:8]}",
            "price": 99.99,
            "stock": 100
        }
        defaults.update(kwargs)
        return Product(**defaults)
    
    @staticmethod
    def create_users(count: int, **kwargs) -> list:
        return [DataFactory.create_user(**kwargs) for _ in range(count)]

class DatabaseFixture:
    """数据库 Fixtures"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._connection = None
    
    @contextmanager
    def transaction(self):
        """事务上下文管理器"""
        import sqlite3
        conn = sqlite3.connect(self.connection_string)
        conn.execute("BEGIN")
        try:
            yield conn
        finally:
            conn.rollback()
            conn.close()
    
    def seed_data(self, data: Dict[str, list]):
        """种子数据"""
        with sqlite3.connect(self.connection_string) as conn:
            for table, records in data.items():
                for record in records:
                    columns = ", ".join(record.keys())
                    placeholders = ", ".join(["?" for _ in record])
                    conn.execute(
                        f"INSERT INTO {table} ({columns}) VALUES ({placeholders})",
                        list(record.values())
                    )

# pytest Fixtures
@pytest.fixture(scope="session")
def db_connection():
    """会话级数据库连接"""
    import sqlite3
    conn = sqlite3.connect(":memory:")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT,
            role TEXT
        )
    """)
    yield conn
    conn.close()

@pytest.fixture
def clean_db(db_connection):
    """每个测试前清理数据库"""
    db_connection.execute("DELETE FROM users")
    db_connection.commit()
    yield db_connection

@pytest.fixture
def sample_user(clean_db):
    """创建测试用户"""
    user = DataFactory.create_user(username="testuser", email="test@example.com")
    cursor = clean_db.execute(
        "INSERT INTO users (username, email, role) VALUES (?, ?, ?)",
        (user.username, user.email, user.role)
    )
    user.id = cursor.lastrowid
    clean_db.commit()
    yield user

@pytest.fixture
def admin_user(clean_db):
    """创建管理员用户"""
    user = DataFactory.create_user(
        username="admin",
        email="admin@example.com",
        role="admin"
    )
    cursor = clean_db.execute(
        "INSERT INTO users (username, email, role) VALUES (?, ?, ?)",
        (user.username, user.email, user.role)
    )
    user.id = cursor.lastrowid
    clean_db.commit()
    yield user

class TestWithDataFixtures:
    
    def test_get_user(self, clean_db, sample_user):
        cursor = clean_db.execute(
            "SELECT * FROM users WHERE id = ?",
            (sample_user.id,)
        )
        row = cursor.fetchone()
        assert row is not None
        assert row[1] == sample_user.username
    
    def test_admin_access(self, clean_db, admin_user):
        cursor = clean_db.execute(
            "SELECT role FROM users WHERE id = ?",
            (admin_user.id,)
        )
        role = cursor.fetchone()[0]
        assert role == "admin"

# 环境配置
class TestConfig:
    """测试配置"""
    
    def __init__(self):
        self.base_url = self._get_env("TEST_BASE_URL", "http://localhost:8000")
        self.db_url = self._get_env("TEST_DB_URL", "sqlite:///:memory:")
        self.timeout = int(self._get_env("TEST_TIMEOUT", "30"))
        self.headless = self._get_env("HEADLESS", "true").lower() == "true"
    
    def _get_env(self, key: str, default: str) -> str:
        import os
        return os.environ.get(key, default)
    
    @classmethod
    def load_from_file(cls, filepath: str) -> "TestConfig":
        with open(filepath) as f:
            config_data = json.load(f)
        
        config = cls()
        for key, value in config_data.items():
            setattr(config, key, value)
        
        return config

@pytest.fixture(scope="session")
def test_config():
    return TestConfig()
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. CI/CD 集成

#### [概念] 概念解释

将测试自动化集成到 CI/CD 流水线，实现代码提交自动触发测试、测试失败阻止部署、测试结果自动报告。常用工具包括 Jenkins、GitHub Actions、GitLab CI 等。

#### [代码] 代码示例

```python
# CI/CD 集成配置
# .github/workflows/test.yml
"""
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run unit tests
        run: pytest tests/unit -v --cov=src --cov-report=xml
      
      - name: Run integration tests
        run: pytest tests/integration -v
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
"""

# Jenkins Pipeline
"""
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install pytest pytest-html'
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh 'pytest tests/unit -v --html=reports/unit.html'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports',
                        reportFiles: 'unit.html',
                        reportName: 'Unit Test Report'
                    ])
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'pytest tests/integration -v --html=reports/integration.html'
            }
        }
        
        stage('E2E Tests') {
            when {
                branch 'main'
            }
            steps {
                sh 'pytest tests/e2e -v'
            }
        }
    }
    
    post {
        failure {
            mail to: 'team@example.com',
                 subject: "Tests Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Check the build: ${env.BUILD_URL}"
        }
    }
}
"""

# 测试报告生成
import pytest
from datetime import datetime
from typing import Dict, List
import json

class TestReporter:
    """测试报告器"""
    
    def __init__(self):
        self.results: List[Dict] = []
        self.start_time = None
    
    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            self.results.append({
                "name": report.nodeid,
                "outcome": report.outcome,
                "duration": report.duration,
                "timestamp": datetime.now().isoformat()
            })
    
    def pytest_sessionstart(self):
        self.start_time = datetime.now()
    
    def pytest_sessionfinish(self, session):
        end_time = datetime.now()
        
        report = {
            "summary": {
                "total": len(self.results),
                "passed": len([r for r in self.results if r["outcome"] == "passed"]),
                "failed": len([r for r in self.results if r["outcome"] == "failed"]),
                "skipped": len([r for r in self.results if r["outcome"] == "skipped"]),
                "duration": str(end_time - self.start_time)
            },
            "tests": self.results
        }
        
        with open("test-report.json", "w") as f:
            json.dump(report, f, indent=2)

# pytest 插件注册
# conftest.py
"""
def pytest_configure(config):
    config.pluginmanager.register(TestReporter())
"""
```

### 2. 并行测试执行

#### [概念] 概念解释

并行测试将测试分配到多个进程或机器同时执行，大幅缩短测试时间。需要确保测试间独立、无共享状态、资源竞争可控。pytest-xdist 是常用的并行测试插件。

#### [代码] 代码示例

```python
# 并行测试配置
import pytest
from multiprocessing import Lock
from typing import Dict
import os

# 共享资源锁
file_lock = Lock()

class ParallelTestConfig:
    """并行测试配置"""
    
    def __init__(self):
        self.worker_id = os.environ.get("PYTEST_XDIST_WORKER", "master")
        self.worker_count = int(os.environ.get("PYTEST_XDIST_WORKER_COUNT", 1))
    
    def get_worker_specific_data(self) -> Dict:
        """获取 worker 特定数据"""
        return {
            "worker_id": self.worker_id,
            "test_db": f"test_db_{self.worker_id}.sqlite",
            "test_port": 8000 + hash(self.worker_id) % 1000
        }

@pytest.fixture(scope="session")
def parallel_config():
    return ParallelTestConfig()

@pytest.fixture(scope="session")
def isolated_database(parallel_config):
    """隔离的测试数据库"""
    import sqlite3
    
    db_path = parallel_config.get_worker_specific_data()["test_db"]
    conn = sqlite3.connect(db_path)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS test_data (
            id INTEGER PRIMARY KEY,
            value TEXT
        )
    """)
    conn.commit()
    
    yield conn
    
    conn.close()
    if os.path.exists(db_path):
        os.remove(db_path)

class TestParallel:
    """并行测试示例"""
    
    def test_parallel_safe_1(self, isolated_database):
        isolated_database.execute(
            "INSERT INTO test_data (value) VALUES (?)",
            ("test1",)
        )
        isolated_database.commit()
        
        cursor = isolated_database.execute("SELECT COUNT(*) FROM test_data")
        count = cursor.fetchone()[0]
        assert count >= 1
    
    def test_parallel_safe_2(self, isolated_database):
        isolated_database.execute(
            "INSERT INTO test_data (value) VALUES (?)",
            ("test2",)
        )
        isolated_database.commit()
        
        cursor = isolated_database.execute("SELECT COUNT(*) FROM test_data")
        count = cursor.fetchone()[0]
        assert count >= 1

# 并行测试运行命令
# pytest -n auto tests/  # 自动检测 CPU 核心数
# pytest -n 4 tests/     # 使用 4 个进程

# 分布式测试配置
class DistributedTestRunner:
    """分布式测试运行器"""
    
    def __init__(self, workers: list):
        self.workers = workers
        self.test_queue = []
        self.results = {}
    
    def distribute_tests(self, tests: list):
        """分发测试到各个 worker"""
        chunk_size = len(tests) // len(self.workers)
        
        for i, worker in enumerate(self.workers):
            start = i * chunk_size
            end = start + chunk_size if i < len(self.workers) - 1 else len(tests)
            worker_tests = tests[start:end]
            
            self._send_to_worker(worker, worker_tests)
    
    def _send_to_worker(self, worker: str, tests: list):
        """发送测试到 worker"""
        import requests
        
        response = requests.post(
            f"{worker}/run-tests",
            json={"tests": tests}
        )
        
        self.results[worker] = response.json()
    
    def collect_results(self) -> Dict:
        """收集所有结果"""
        total_passed = sum(
            r.get("passed", 0) for r in self.results.values()
        )
        total_failed = sum(
            r.get("failed", 0) for r in self.results.values()
        )
        
        return {
            "total_passed": total_passed,
            "total_failed": total_failed,
            "workers": self.results
        }
```

### 3. 测试维护与重构

#### [概念] 概念解释

测试代码需要持续维护：定期清理过时测试、重构重复代码、更新测试数据、优化执行速度。良好的测试代码质量确保测试套件长期有效。

#### [代码] 代码示例

```python
# 测试维护与重构
import pytest
from typing import List, Dict, Callable
from functools import wraps
import inspect

# 测试装饰器
def slow_test(func):
    """标记慢速测试"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    wrapper.slow = True
    return wrapper

def skip_if(condition: bool, reason: str):
    """条件跳过"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if condition:
                pytest.skip(reason)
            return func(*args, **kwargs)
        return wrapper
    return decorator

def retry(max_attempts: int = 3, delay: float = 1.0):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            import time
            last_error = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
            
            raise last_error
        return wrapper
    return decorator

class TestMaintenance:
    """测试维护示例"""
    
    @slow_test
    def test_slow_operation(self):
        import time
        time.sleep(2)
        assert True
    
    @skip_if(True, "Feature not ready")
    def test_future_feature(self):
        assert False
    
    @retry(max_attempts=3)
    def test_flaky_api(self):
        import random
        if random.random() < 0.5:
            raise Exception("Random failure")
        assert True

# 测试代码质量检查
class TestCodeAnalyzer:
    """测试代码分析器"""
    
    def __init__(self):
        self.issues: List[Dict] = []
    
    def analyze_test_function(self, func: Callable) -> List[Dict]:
        """分析测试函数"""
        issues = []
        source = inspect.getsource(func)
        
        if "assert True" in source:
            issues.append({
                "type": "weak_assertion",
                "message": "Useless assertion: assert True",
                "severity": "warning"
            })
        
        if "print(" in source:
            issues.append({
                "type": "debug_code",
                "message": "Debug print statement found",
                "severity": "info"
            })
        
        if len(source.split('\n')) > 50:
            issues.append({
                "type": "long_test",
                "message": "Test function too long",
                "severity": "warning"
            })
        
        return issues
    
    def analyze_test_file(self, filepath: str) -> Dict:
        """分析测试文件"""
        with open(filepath) as f:
            content = f.read()
        
        return {
            "filepath": filepath,
            "line_count": len(content.split('\n')),
            "test_count": content.count("def test_"),
            "fixture_count": content.count("@pytest.fixture"),
            "issues": self._find_issues(content)
        }
    
    def _find_issues(self, content: str) -> List[Dict]:
        issues = []
        
        patterns = [
            ("TODO", "todo", "info"),
            ("FIXME", "fixme", "warning"),
            ("HACK", "hack", "warning"),
            ("XXX", "xxx", "warning"),
        ]
        
        for pattern, issue_type, severity in patterns:
            if pattern in content:
                issues.append({
                    "type": issue_type,
                    "message": f"{pattern} comment found",
                    "severity": severity
                })
        
        return issues

# 测试清理工具
class TestCleanup:
    """测试清理工具"""
    
    def __init__(self):
        self.resources: List[Dict] = []
    
    def register(self, resource_type: str, resource_id: str, cleanup_func: Callable):
        """注册需要清理的资源"""
        self.resources.append({
            "type": resource_type,
            "id": resource_id,
            "cleanup": cleanup_func
        })
    
    def cleanup_all(self):
        """清理所有资源"""
        for resource in reversed(self.resources):
            try:
                resource["cleanup"]()
            except Exception as e:
                print(f"Cleanup failed for {resource['type']}:{resource['id']}: {e}")
        
        self.resources.clear()

@pytest.fixture
def test_cleanup():
    cleanup = TestCleanup()
    yield cleanup
    cleanup.cleanup_all()

class TestWithCleanup:
    
    def test_create_and_cleanup(self, test_cleanup):
        import requests
        
        response = requests.post(
            "https://api.example.com/users",
            json={"name": "Test User"}
        )
        user_id = response.json()["id"]
        
        test_cleanup.register(
            "user",
            user_id,
            lambda: requests.delete(f"https://api.example.com/users/{user_id}")
        )
        
        assert response.status_code == 201
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Selenium Grid | 分布式浏览器测试 |
| Docker Testing | 容器化测试环境 |
| Test Containers | 测试用 Docker 容器 |
| Allure Report | 高级测试报告 |
| Test Rail | 测试用例管理 |
| Robot Framework | 关键字驱动测试框架 |
| Gauge | 规格驱动测试框架 |
| Cypress Cloud | Cypress 云端执行 |
| Percy | 视觉回归测试 |
| Load Testing | 负载测试自动化 |
