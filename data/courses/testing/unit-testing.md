# 单元测试 三层深度学习教程

## [总览] 技术总览

单元测试是软件开发中验证代码正确性的基础实践。通过编写测试用例，确保每个代码单元按预期工作。掌握单元测试是编写高质量代码的关键技能。

本教程采用三层漏斗学习法：**核心层**聚焦测试框架、断言方法、测试组织三大基石；**重点层**深入 Mock 技术、参数化测试、测试覆盖率；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 测试框架

#### [概念] 概念解释

Python 使用 pytest 作为主流测试框架，JavaScript 使用 Jest。测试框架提供测试发现、执行和报告功能。

#### [代码] 代码示例

```python
# pytest 基础
import pytest

# 简单测试
def test_addition():
    assert 1 + 1 == 2

def test_string_concat():
    assert "hello" + " world" == "hello world"

# 测试类
class TestCalculator:
    def test_add(self):
        assert 2 + 3 == 5
    
    def test_subtract(self):
        assert 5 - 3 == 2
    
    def test_multiply(self):
        assert 2 * 3 == 6
    
    def test_divide(self):
        assert 6 / 2 == 3

# 测试异常
def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        1 / 0

# 运行测试
# pytest test_example.py -v
```

```javascript
// Jest 基础
describe('Calculator', () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(1 + 2).toBe(3);
    });
    
    test('subtracts 5 - 3 to equal 2', () => {
        expect(5 - 3).toBe(2);
    });
    
    test('multiplies 2 * 3 to equal 6', () => {
        expect(2 * 3).toBe(6);
    });
    
    test('divides 6 / 2 to equal 3', () => {
        expect(6 / 2).toBe(3);
    });
    
    test('throws on divide by zero', () => {
        expect(() => {
            throw new Error('Division by zero');
        }).toThrow('Division by zero');
    });
});

// 运行测试
// jest test_example.test.js
```

### 2. 断言方法

#### [概念] 概念解释

断言是测试的核心，用于验证实际结果是否符合预期。不同框架提供丰富的断言方法。

#### [代码] 代码示例

```python
# pytest 断言
import pytest

def test_equality():
    assert 1 == 1
    assert "hello" == "hello"
    assert [1, 2, 3] == [1, 2, 3]

def test_comparison():
    assert 5 > 3
    assert 2 < 4
    assert 3 <= 3
    assert 4 >= 4

def test_membership():
    assert 1 in [1, 2, 3]
    assert "a" in "abc"
    assert "key" in {"key": "value"}

def test_type():
    assert isinstance(1, int)
    assert isinstance("hello", str)
    assert isinstance([1, 2], list)

def test_approximate():
    assert 0.1 + 0.2 == pytest.approx(0.3)
    assert 3.14159 == pytest.approx(3.14, rel=0.01)

def test_exception():
    with pytest.raises(ValueError) as excinfo:
        raise ValueError("error message")
    assert str(excinfo.value) == "error message"
```

```javascript
// Jest 断言
describe('Assertions', () => {
    test('equality', () => {
        expect(1).toBe(1);
        expect({ a: 1 }).toEqual({ a: 1 });
        expect([1, 2, 3]).toStrictEqual([1, 2, 3]);
    });
    
    test('truthiness', () => {
        expect(true).toBeTruthy();
        expect(false).toBeFalsy();
        expect(null).toBeNull();
        expect(undefined).toBeUndefined();
    });
    
    test('numbers', () => {
        expect(5).toBeGreaterThan(3);
        expect(2).toBeLessThan(4);
        expect(0.1 + 0.2).toBeCloseTo(0.3);
    });
    
    test('strings', () => {
        expect('hello world').toMatch(/hello/);
        expect('hello world').toContain('world');
    });
    
    test('arrays', () => {
        expect([1, 2, 3]).toContain(2);
        expect([1, 2, 3]).toHaveLength(3);
    });
    
    test('exceptions', () => {
        expect(() => {
            throw new Error('error');
        }).toThrow('error');
    });
});
```

### 3. 测试组织

#### [概念] 概念解释

良好的测试组织包括测试文件命名、测试函数命名、测试夹具（fixtures）等。合理的组织提高测试可维护性。

#### [代码] 代码示例

```python
# conftest.py - 共享 fixtures
import pytest

@pytest.fixture
def sample_data():
    return {"name": "test", "value": 123}

@pytest.fixture
def database_connection():
    conn = create_connection()
    yield conn
    conn.close()

# test_user.py
import pytest

class TestUser:
    @pytest.fixture
    def user(self):
        return User(name="test", email="test@example.com")
    
    def test_user_name(self, user):
        assert user.name == "test"
    
    def test_user_email(self, user):
        assert user.email == "test@example.com"
    
    @pytest.mark.parametrize("name,expected", [
        ("Alice", "Alice"),
        ("Bob", "Bob"),
        ("", ""),
    ])
    def test_user_name_various(self, name, expected):
        user = User(name=name)
        assert user.name == expected

# 标记测试
@pytest.mark.slow
def test_slow_operation():
    import time
    time.sleep(1)
    assert True

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

# 运行特定标记
# pytest -m slow
# pytest -m "not slow"
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Mock 技术

#### [代码] 代码示例

```python
from unittest.mock import Mock, patch, MagicMock

# 创建 Mock
def test_mock_basic():
    mock = Mock()
    mock.method.return_value = 42
    assert mock.method() == 42
    mock.method.assert_called_once()

# patch 装饰器
@patch('module.external_api')
def test_with_patch(mock_api):
    mock_api.return_value = {"status": "ok"}
    result = call_external_api()
    assert result["status"] == "ok"

# Mock 类
class TestUserService:
    @patch('services.Database')
    def test_get_user(self, MockDatabase):
        mock_db = MockDatabase.return_value
        mock_db.find_user.return_value = {"id": 1, "name": "test"}
        
        service = UserService(mock_db)
        user = service.get_user(1)
        
        assert user["name"] == "test"
        mock_db.find_user.assert_called_with(1)
```

### 2. 参数化测试

#### [代码] 代码示例

```python
import pytest

@pytest.mark.parametrize("input,expected", [
    (1, 1),
    (2, 4),
    (3, 9),
    (4, 16),
])
def test_square(input, expected):
    assert input ** 2 == expected

@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert a + b == expected

# 多参数组合
@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_multiply(x, y):
    assert x * y == x * y
```

### 3. 测试覆盖率

#### [代码] 代码示例

```bash
# 安装 coverage
pip install pytest-cov

# 运行测试并生成覆盖率报告
pytest --cov=src tests/

# 生成 HTML 报告
pytest --cov=src --cov-report=html tests/

# 配置 pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing"
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Test Doubles | 需要测试替身时 |
| Fakes | 需要伪造实现时 |
| Stubs | 需要桩对象时 |
| Spies | 需要间谍对象时 |
| Dummies | 需要占位对象时 |
| Property Testing | 需要属性测试时 |
| Mutation Testing | 需要变异测试时 |
| Snapshot Testing | 需要快照测试时 |
| Contract Testing | 需要契约测试时 |
| Golden Master | 需要黄金主测试时 |

---

## [实战] 核心实战清单

### 实战任务 1：为用户服务编写完整测试

```python
import pytest
from unittest.mock import Mock, patch

class UserService:
    def __init__(self, db):
        self.db = db
    
    def get_user(self, user_id):
        user = self.db.find_user(user_id)
        if not user:
            raise ValueError("User not found")
        return user
    
    def create_user(self, name, email):
        if not name or not email:
            raise ValueError("Name and email required")
        return self.db.insert_user({"name": name, "email": email})

class TestUserService:
    @pytest.fixture
    def mock_db(self):
        return Mock()
    
    @pytest.fixture
    def service(self, mock_db):
        return UserService(mock_db)
    
    def test_get_user_success(self, service, mock_db):
        mock_db.find_user.return_value = {"id": 1, "name": "test"}
        user = service.get_user(1)
        assert user["name"] == "test"
    
    def test_get_user_not_found(self, service, mock_db):
        mock_db.find_user.return_value = None
        with pytest.raises(ValueError, match="User not found"):
            service.get_user(999)
    
    @pytest.mark.parametrize("name,email", [
        ("Alice", "alice@example.com"),
        ("Bob", "bob@example.com"),
    ])
    def test_create_user_success(self, service, mock_db, name, email):
        mock_db.insert_user.return_value = {"id": 1, "name": name}
        user = service.create_user(name, email)
        assert user["name"] == name
    
    def test_create_user_missing_fields(self, service):
        with pytest.raises(ValueError, match="Name and email required"):
            service.create_user("", "test@example.com")
```
