# TDD/BDD 测试驱动开发 三层深度学习教程

## [总览] 技术总览

测试驱动开发（TDD）和行为驱动开发（BDD）是敏捷开发的核心实践。TDD 强调先写测试再写代码，BDD 强调用自然语言描述行为。两者都能提高代码质量、减少缺陷、改善设计。

本教程采用三层漏斗学习法：**核心层**聚焦 TDD 红绿重构循环、单元测试设计、BDD 场景描述三大基石；**重点层**深入 pytest 和 behave 实践；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. TDD 红绿重构循环

#### [概念] 概念解释

TDD 的核心是红绿重构循环：红灯（写失败的测试）→ 绿灯（写最少代码使测试通过）→ 重构（优化代码结构）。这个循环确保代码有测试覆盖，设计简洁。

#### [代码] 代码示例

```python
# TDD 示例：开发一个计算器类
import pytest

# 第一步：红灯 - 写失败的测试
class TestCalculator:
    
    def test_add_two_numbers(self):
        """测试加法"""
        calc = Calculator()
        result = calc.add(2, 3)
        assert result == 5
    
    def test_add_negative_numbers(self):
        """测试负数加法"""
        calc = Calculator()
        result = calc.add(-1, -1)
        assert result == -2
    
    def test_subtract_two_numbers(self):
        """测试减法"""
        calc = Calculator()
        result = calc.subtract(5, 3)
        assert result == 2
    
    def test_multiply_two_numbers(self):
        """测试乘法"""
        calc = Calculator()
        result = calc.multiply(4, 3)
        assert result == 12
    
    def test_divide_two_numbers(self):
        """测试除法"""
        calc = Calculator()
        result = calc.divide(10, 2)
        assert result == 5
    
    def test_divide_by_zero_raises_error(self):
        """测试除零异常"""
        calc = Calculator()
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calc.divide(10, 0)

# 第二步：绿灯 - 写最少代码使测试通过
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b
    
    def subtract(self, a: int, b: int) -> int:
        return a - b
    
    def multiply(self, a: int, b: int) -> int:
        return a * b
    
    def divide(self, a: int, b: int) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

# 第三步：重构 - 优化代码（可选）
# 可以添加类型注解、文档字符串、输入验证等

# TDD 开发栈的完整示例
class TestStack:
    """栈数据结构的 TDD 开发"""
    
    def test_new_stack_is_empty(self):
        stack = Stack()
        assert stack.is_empty()
    
    def test_push_makes_stack_not_empty(self):
        stack = Stack()
        stack.push(1)
        assert not stack.is_empty()
    
    def test_pop_returns_pushed_item(self):
        stack = Stack()
        stack.push(1)
        assert stack.pop() == 1
    
    def test_pop_from_empty_raises_error(self):
        stack = Stack()
        with pytest.raises(IndexError, match="Stack is empty"):
            stack.pop()
    
    def test_peek_returns_top_without_removing(self):
        stack = Stack()
        stack.push(1)
        stack.push(2)
        assert stack.peek() == 2
        assert not stack.is_empty()
    
    def test_lifo_order(self):
        stack = Stack()
        stack.push(1)
        stack.push(2)
        stack.push(3)
        assert stack.pop() == 3
        assert stack.pop() == 2
        assert stack.pop() == 1

class Stack:
    """栈实现"""
    def __init__(self):
        self._items = []
    
    def is_empty(self) -> bool:
        return len(self._items) == 0
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items.pop()
    
    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items[-1]
```

### 2. 单元测试设计原则

#### [概念] 概念解释

好的单元测试遵循 FIRST 原则：Fast（快速）、Independent（独立）、Repeatable（可重复）、Self-validating（自验证）、Timely（及时）。测试应聚焦单一行为，使用 AAA 模式（Arrange-Act-Assert）。

#### [代码] 代码示例

```python
# 单元测试设计原则示例
import pytest
from datetime import datetime, timedelta
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class Task:
    id: int
    title: str
    completed: bool = False
    due_date: Optional[datetime] = None

class TaskManager:
    def __init__(self):
        self._tasks: List[Task] = []
        self._next_id = 1
    
    def add_task(self, title: str, due_date: Optional[datetime] = None) -> Task:
        task = Task(
            id=self._next_id,
            title=title,
            due_date=due_date
        )
        self._tasks.append(task)
        self._next_id += 1
        return task
    
    def complete_task(self, task_id: int) -> Task:
        for task in self._tasks:
            if task.id == task_id:
                task.completed = True
                return task
        raise ValueError(f"Task {task_id} not found")
    
    def get_overdue_tasks(self) -> List[Task]:
        now = datetime.now()
        return [
            task for task in self._tasks
            if task.due_date and task.due_date < now and not task.completed
        ]

class TestTaskManager:
    """遵循 FIRST 原则的测试"""
    
    @pytest.fixture
    def task_manager(self):
        """每个测试独立的 TaskManager 实例"""
        return TaskManager()
    
    def test_add_task_returns_task_with_id(self, task_manager):
        # Arrange
        title = "Learn TDD"
        
        # Act
        task = task_manager.add_task(title)
        
        # Assert
        assert task.id == 1
        assert task.title == title
        assert task.completed is False
    
    def test_complete_task_marks_as_completed(self, task_manager):
        # Arrange
        task = task_manager.add_task("Test task")
        
        # Act
        completed = task_manager.complete_task(task.id)
        
        # Assert
        assert completed.completed is True
    
    def test_complete_nonexistent_task_raises_error(self, task_manager):
        # Act & Assert
        with pytest.raises(ValueError, match="not found"):
            task_manager.complete_task(999)
    
    def test_get_overdue_tasks_returns_only_overdue(self, task_manager):
        # Arrange
        yesterday = datetime.now() - timedelta(days=1)
        tomorrow = datetime.now() + timedelta(days=1)
        
        task_manager.add_task("Overdue task", due_date=yesterday)
        task_manager.add_task("Future task", due_date=tomorrow)
        
        # Act
        overdue = task_manager.get_overdue_tasks()
        
        # Assert
        assert len(overdue) == 1
        assert overdue[0].title == "Overdue task"
    
    def test_completed_overdue_tasks_not_in_overdue_list(self, task_manager):
        # Arrange
        yesterday = datetime.now() - timedelta(days=1)
        task = task_manager.add_task("Completed overdue", due_date=yesterday)
        task_manager.complete_task(task.id)
        
        # Act
        overdue = task_manager.get_overdue_tasks()
        
        # Assert
        assert len(overdue) == 0

# 参数化测试
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add_parameterized(a, b, expected):
    calc = Calculator()
    assert calc.add(a, b) == expected

# 测试异常
class TestExceptions:
    
    def test_divide_by_zero(self):
        calc = Calculator()
        with pytest.raises(ValueError) as exc_info:
            calc.divide(1, 0)
        assert "Cannot divide by zero" in str(exc_info.value)
```

### 3. BDD 场景描述

#### [概念] 概念解释

BDD 使用 Gherkin 语法描述行为：Given（前置条件）、When（操作）、Then（预期结果）。这种自然语言描述使业务人员和技术人员能共同理解系统行为。

#### [代码] 代码示例

```python
# BDD 场景描述示例
from behave import given, when, then
from typing import List

class ShoppingCart:
    def __init__(self):
        self.items: List[dict] = []
    
    def add_item(self, product: str, price: float, quantity: int = 1):
        self.items.append({
            "product": product,
            "price": price,
            "quantity": quantity
        })
    
    def remove_item(self, product: str):
        self.items = [i for i in self.items if i["product"] != product]
    
    def get_total(self) -> float:
        return sum(item["price"] * item["quantity"] for item in self.items)
    
    def get_item_count(self) -> int:
        return sum(item["quantity"] for item in self.items)

# features/shopping_cart.feature
"""
Feature: Shopping Cart
  As a customer
  I want to manage items in my shopping cart
  So that I can purchase multiple products at once

  Scenario: Adding an item to the cart
    Given I have an empty shopping cart
    When I add a "Laptop" priced at $999.99
    Then the cart should contain 1 item
    And the total should be $999.99

  Scenario: Adding multiple items
    Given I have an empty shopping cart
    When I add a "Laptop" priced at $999.99
    And I add a "Mouse" priced at $29.99
    Then the cart should contain 2 items
    And the total should be $1029.98

  Scenario: Removing an item
    Given I have a shopping cart with a "Laptop"
    When I remove the "Laptop"
    Then the cart should be empty

  Scenario Outline: Calculating total with quantity
    Given I have an empty shopping cart
    When I add a "Book" priced at $<price> with quantity <quantity>
    Then the total should be $<total>
    
    Examples:
      | price | quantity | total  |
      | 10.00 | 1        | 10.00  |
      | 10.00 | 3        | 30.00  |
      | 25.50 | 2        | 51.00  |
"""

# steps/shopping_cart_steps.py
@given('I have an empty shopping cart')
def step_empty_cart(context):
    context.cart = ShoppingCart()

@given('I have a shopping cart with a "{product}"')
def step_cart_with_item(context, product):
    context.cart = ShoppingCart()
    context.cart.add_item(product, 100.00)

@when('I add a "{product}" priced at ${price}')
def step_add_item(context, product, price):
    context.cart.add_item(product, float(price))

@when('I add a "{product}" priced at ${price} with quantity {quantity:d}')
def step_add_item_with_quantity(context, product, price, quantity):
    context.cart.add_item(product, float(price), quantity)

@when('I remove the "{product}"')
def step_remove_item(context, product):
    context.cart.remove_item(product)

@then('the cart should contain {count:d} item(s)')
def step_check_item_count(context, count):
    assert context.cart.get_item_count() == count

@then('the cart should be empty')
def step_check_cart_empty(context):
    assert context.cart.get_item_count() == 0

@then('the total should be ${total}')
def step_check_total(context, total):
    assert abs(context.cart.get_total() - float(total)) < 0.01
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. pytest 高级特性

#### [概念] 概念解释

pytest 提供丰富的测试功能：Fixtures 管理测试依赖、Marks 标记测试、Parametrize 参数化、Hooks 扩展行为。熟练使用这些特性提高测试效率。

#### [代码] 代码示例

```python
# pytest 高级特性
import pytest
from typing import Generator
from contextlib import contextmanager

# Fixture 作用域
@pytest.fixture(scope="session")
def database_session():
    """会话级别的数据库连接"""
    print("Setting up database connection")
    db = {"connection": "active"}
    yield db
    print("Tearing down database connection")

@pytest.fixture(scope="function")
def clean_database(database_session):
    """每个测试前清理数据库"""
    yield database_session
    print("Cleaning database after test")

# Fixture 工厂模式
@pytest.fixture
def make_user():
    """创建用户的工厂"""
    created_users = []
    
    def _make_user(name: str, email: str):
        user = {"id": len(created_users) + 1, "name": name, "email": email}
        created_users.append(user)
        return user
    
    yield _make_user
    
    print(f"Cleaned up {len(created_users)} users")

# 自动使用的 Fixture
@pytest.fixture(autouse=True)
def setup_test_environment(tmp_path):
    """自动设置测试环境"""
    import os
    os.chdir(tmp_path)
    yield

# 组合 Fixtures
@pytest.fixture
def authenticated_client(client, make_user):
    """已认证的客户端"""
    user = make_user("testuser", "test@example.com")
    client.login(user)
    yield client

# 参数化测试
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("WORLD", "WORLD"),
    ("MixEd", "MIXED"),
    ("", ""),
])
def test_uppercase(input, expected):
    assert input.upper() == expected

@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_multiply_combinations(x, y):
    """组合参数化：3 x 2 = 6 个测试"""
    assert x * y == x * y

# Marks 标记
@pytest.mark.slow
def test_slow_operation():
    import time
    time.sleep(1)
    assert True

@pytest.mark.skip(reason="Feature not implemented")
def test_future_feature():
    pass

@pytest.mark.skipif(
    sys.version_info < (3, 10),
    reason="Requires Python 3.10+"
)
def test_python_310_feature():
    pass

# 自定义 Mark
@pytest.mark.api
@pytest.mark.integration
def test_api_integration():
    pass

# conftest.py 中的共享 Fixtures
# tests/conftest.py
"""
import pytest

@pytest.fixture(scope="session")
def api_base_url():
    return "https://api.example.com"

@pytest.fixture
def mock_external_api(requests_mock, api_base_url):
    requests_mock.get(f"{api_base_url}/users", json=[{"id": 1}])
    yield requests_mock
"""

# Hooks 示例
# conftest.py
"""
def pytest_runtest_setup(item):
    if "slow" in item.keywords and not item.config.getoption("--run-slow"):
        pytest.skip("need --run-slow option to run")

def pytest_addoption(parser):
    parser.addoption("--run-slow", action="store_true", help="run slow tests")
"""
```

### 2. behave 实践

#### [概念] 概念解释

behave 是 Python 的 BDD 框架，支持 Gherkin 语法。通过 features 目录组织场景，steps 目录实现步骤，支持标签、钩子、上下文等高级功能。

#### [代码] 代码示例

```python
# behave 高级实践
from behave import given, when, then, step
from behave.runner import Context
from typing import Dict, Any
import json

class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.headers = {}
        self.last_response = None
    
    def set_header(self, key: str, value: str):
        self.headers[key] = value
    
    def get(self, endpoint: str):
        import requests
        response = requests.get(f"{self.base_url}{endpoint}", headers=self.headers)
        self.last_response = response
        return response
    
    def post(self, endpoint: str, data: dict):
        import requests
        response = requests.post(
            f"{self.base_url}{endpoint}",
            json=data,
            headers=self.headers
        )
        self.last_response = response
        return response

# environment.py - 钩子配置
def before_all(context: Context):
    context.api_client = APIClient("https://api.example.com")
    context.test_data = {}

def before_scenario(context: Context, scenario):
    """每个场景前重置状态"""
    context.test_data = {}

def after_scenario(context: Context, scenario):
    """场景后清理"""
    pass

def before_tag(context: Context, tag):
    """特定标签的前置处理"""
    if tag == "authenticated":
        context.api_client.set_header("Authorization", "Bearer test-token")

# features/api.feature
"""
@api
Feature: User API
  Test user management API endpoints

  @authenticated
  Scenario: Get user list
    Given the API is available
    When I request GET "/users"
    Then the response status should be 200
    And the response should contain a list of users

  @authenticated
  Scenario: Create a new user
    Given I have user data:
      | name  | email              |
      | John  | john@example.com   |
    When I request POST "/users" with the data
    Then the response status should be 201
    And the response should contain the user id
"""

# steps/api_steps.py
@given('the API is available')
def step_api_available(context):
    response = context.api_client.get("/health")
    assert response.status_code == 200

@given('I have user data:')
def step_user_data_table(context):
    row = context.table[0]
    context.test_data["user"] = {
        "name": row["name"],
        "email": row["email"]
    }

@when('I request GET "{endpoint}"')
def step_get_request(context, endpoint):
    context.response = context.api_client.get(endpoint)

@when('I request POST "{endpoint}" with the data')
def step_post_request(context, endpoint):
    context.response = context.api_client.post(
        endpoint,
        context.test_data.get("user", {})
    )

@then('the response status should be {status:d}')
def step_check_status(context, status):
    assert context.response.status_code == status

@then('the response should contain a list of users')
def step_check_user_list(context):
    data = context.response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "id" in data[0]
        assert "name" in data[0]

@then('the response should contain the user id')
def step_check_user_id(context):
    data = context.response.json()
    assert "id" in data
    context.test_data["created_user_id"] = data["id"]
```

### 3. 测试金字塔实践

#### [概念] 概念解释

测试金字塔指导测试策略：底层是大量快速的单元测试，中层是适量的集成测试，顶层是少量的端到端测试。遵循金字塔原则能获得最佳的投资回报。

#### [代码] 代码示例

```python
# 测试金字塔实践
import pytest
from unittest.mock import Mock, patch
from typing import List

# 单元测试 - 金字塔底层
class UserService:
    def __init__(self, user_repository, email_service):
        self.user_repository = user_repository
        self.email_service = email_service
    
    def create_user(self, name: str, email: str) -> dict:
        if self.user_repository.find_by_email(email):
            raise ValueError("Email already exists")
        
        user = self.user_repository.save({"name": name, "email": email})
        self.email_service.send_welcome(email, name)
        return user

class TestUserServiceUnit:
    """单元测试 - 快速、隔离"""
    
    @pytest.fixture
    def mock_repo(self):
        return Mock()
    
    @pytest.fixture
    def mock_email(self):
        return Mock()
    
    def test_create_user_success(self, mock_repo, mock_email):
        mock_repo.find_by_email.return_value = None
        mock_repo.save.return_value = {"id": 1, "name": "John", "email": "john@test.com"}
        
        service = UserService(mock_repo, mock_email)
        user = service.create_user("John", "john@test.com")
        
        assert user["id"] == 1
        mock_email.send_welcome.assert_called_once()
    
    def test_create_user_duplicate_email(self, mock_repo, mock_email):
        mock_repo.find_by_email.return_value = {"id": 1}
        
        service = UserService(mock_repo, mock_email)
        
        with pytest.raises(ValueError, match="already exists"):
            service.create_user("John", "john@test.com")

# 集成测试 - 金字塔中层
@pytest.mark.integration
class TestUserServiceIntegration:
    """集成测试 - 真实依赖"""
    
    @pytest.fixture
    def real_database(self):
        from sqlalchemy import create_engine
        engine = create_engine("sqlite:///:memory:")
        yield engine
    
    def test_create_user_with_real_database(self, real_database):
        from user_repository import UserRepository
        from email_service import EmailService
        
        repo = UserRepository(real_database)
        email_service = EmailService()  # 可能是测试邮件服务
        
        service = UserService(repo, email_service)
        user = service.create_user("John", "john@test.com")
        
        saved_user = repo.find_by_id(user["id"])
        assert saved_user is not None

# 端到端测试 - 金字塔顶层
@pytest.mark.e2e
class TestUserFlowE2E:
    """端到端测试 - 完整流程"""
    
    def test_user_registration_flow(self):
        import requests
        
        response = requests.post(
            "https://api.example.com/users",
            json={"name": "John", "email": "john@test.com"}
        )
        
        assert response.status_code == 201
        user_id = response.json()["id"]
        
        response = requests.get(f"https://api.example.com/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "John"

# 测试配置
# pytest.ini
"""
[pytest]
markers =
    unit: Unit tests (fast, isolated)
    integration: Integration tests (real dependencies)
    e2e: End-to-end tests (full stack)
    slow: Slow running tests

testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
"""
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Cucumber | Java/Ruby BDD 框架，企业级应用 |
| SpecFlow | .NET BDD 框架 |
| pytest-bdd | pytest 的 BDD 插件 |
| Mutation Testing | 变异测试，验证测试质量 |
| Code Coverage | 代码覆盖率，衡量测试完整性 |
| Test Doubles | 测试替身，Mock/Stub/Fake/Spy |
| Approval Testing | 批准测试，快照测试 |
| Property-based Testing | 属性测试，QuickCheck/hypothesis |
| Contract Testing | 契约测试，Pact 框架 |
| Test Fixtures | 测试夹具，数据准备策略 |
