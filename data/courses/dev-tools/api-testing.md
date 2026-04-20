# API 测试 三层深度学习教程

## [总览] 技术总览

API 测试是验证应用程序接口功能、性能和安全性的过程。通过模拟客户端请求，验证 API 的响应是否符合预期。API 测试是现代软件开发中质量保障的关键环节，支持自动化测试和持续集成。

本教程采用三层漏斗学习法：**核心层**聚焦 HTTP 请求方法、状态码验证、请求响应格式三大基石；**重点层**深入认证测试、性能测试、自动化测试；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 API 测试 **50% 以上** 的常见任务。

### 1. HTTP 请求方法

#### [概念] 概念解释

HTTP 请求方法定义了对资源的操作类型。RESTful API 常用的方法包括 GET、POST、PUT、PATCH、DELETE。理解每种方法的语义是 API 测试的基础。

#### [语法] 核心语法 / 命令 / API

**HTTP 方法对照：**

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新资源（全量） | 是 | 否 |
| PATCH | 更新资源（部分） | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

#### [代码] 代码示例

```python
# Python requests 测试示例
import requests
import pytest

BASE_URL = "https://api.example.com"

class TestUserAPI:
    """用户 API 测试"""
    
    def test_get_users(self):
        """测试获取用户列表"""
        response = requests.get(f"{BASE_URL}/users")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0
    
    def test_get_user_by_id(self):
        """测试获取单个用户"""
        user_id = 1
        response = requests.get(f"{BASE_URL}/users/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data['id'] == user_id
        assert 'name' in data
        assert 'email' in data
    
    def test_create_user(self):
        """测试创建用户"""
        new_user = {
            "name": "Test User",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/users",
            json=new_user
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data['name'] == new_user['name']
        assert data['email'] == new_user['email']
        assert 'id' in data
    
    def test_update_user(self):
        """测试更新用户"""
        user_id = 1
        updated_data = {
            "name": "Updated Name",
            "email": "updated@example.com"
        }
        
        response = requests.put(
            f"{BASE_URL}/users/{user_id}",
            json=updated_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['name'] == updated_data['name']
    
    def test_delete_user(self):
        """测试删除用户"""
        user_id = 1
        
        response = requests.delete(f"{BASE_URL}/users/{user_id}")
        
        assert response.status_code == 204
        
        # 验证删除后无法获取
        get_response = requests.get(f"{BASE_URL}/users/{user_id}")
        assert get_response.status_code == 404
```

```javascript
// JavaScript fetch 测试示例
const BASE_URL = 'https://api.example.com';

describe('User API Tests', () => {
    test('GET /users - 获取用户列表', async () => {
        const response = await fetch(`${BASE_URL}/users`);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });
    
    test('POST /users - 创建用户', async () => {
        const newUser = {
            name: 'Test User',
            email: 'test@example.com'
        };
        
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });
        
        const data = await response.json();
        
        expect(response.status).toBe(201);
        expect(data.name).toBe(newUser.name);
        expect(data.email).toBe(newUser.email);
    });
    
    test('PUT /users/:id - 更新用户', async () => {
        const userId = 1;
        const updatedData = {
            name: 'Updated Name',
            email: 'updated@example.com'
        };
        
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.name).toBe(updatedData.name);
    });
    
    test('DELETE /users/:id - 删除用户', async () => {
        const userId = 1;
        
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        expect(response.status).toBe(204);
    });
});
```

#### [场景] 典型应用场景

1. 验证 CRUD 操作的正确性
2. 测试 API 端点的可达性
3. 验证请求参数的处理

### 2. 状态码验证

#### [概念] 概念解释

HTTP 状态码表示请求的处理结果。正确验证状态码是 API 测试的基本要求，可以快速判断 API 是否正常工作。

#### [语法] 核心语法 / 命令 / API

**常见状态码分类：**

| 状态码 | 类别 | 说明 |
|--------|------|------|
| 2xx | 成功 | 请求成功处理 |
| 3xx | 重定向 | 需要进一步操作 |
| 4xx | 客户端错误 | 请求有问题 |
| 5xx | 服务器错误 | 服务器处理失败 |

**常用状态码：**

| 状态码 | 说明 |
|--------|------|
| 200 | OK - 成功 |
| 201 | Created - 创建成功 |
| 204 | No Content - 删除成功 |
| 400 | Bad Request - 请求格式错误 |
| 401 | Unauthorized - 未认证 |
| 403 | Forbidden - 无权限 |
| 404 | Not Found - 资源不存在 |
| 500 | Internal Server Error - 服务器错误 |

#### [代码] 代码示例

```python
# 状态码验证测试
import requests
import pytest

BASE_URL = "https://api.example.com"

class TestStatusCodes:
    """状态码验证测试"""
    
    def test_success_status_codes(self):
        """测试成功状态码"""
        # 200 OK
        response = requests.get(f"{BASE_URL}/users")
        assert response.status_code == 200
        
        # 201 Created
        response = requests.post(
            f"{BASE_URL}/users",
            json={"name": "Test", "email": "test@test.com"}
        )
        assert response.status_code == 201
        
        # 204 No Content
        response = requests.delete(f"{BASE_URL}/users/1")
        assert response.status_code == 204
    
    def test_client_error_status_codes(self):
        """测试客户端错误状态码"""
        # 400 Bad Request
        response = requests.post(
            f"{BASE_URL}/users",
            json={}  # 缺少必需字段
        )
        assert response.status_code == 400
        
        # 401 Unauthorized
        response = requests.get(
            f"{BASE_URL}/protected",
            headers={}  # 缺少认证头
        )
        assert response.status_code == 401
        
        # 404 Not Found
        response = requests.get(f"{BASE_URL}/users/99999")
        assert response.status_code == 404
    
    def test_server_error_status_codes(self):
        """测试服务器错误状态码"""
        # 模拟触发服务器错误
        response = requests.get(
            f"{BASE_URL}/error",
            params={"trigger": "error"}
        )
        assert response.status_code == 500
    
    def test_status_code_with_message(self):
        """测试状态码和错误消息"""
        response = requests.get(f"{BASE_URL}/users/99999")
        
        assert response.status_code == 404
        data = response.json()
        assert 'error' in data
        assert data['error'] == 'User not found'
```

#### [场景] 典型应用场景

1. 验证正常流程的响应状态
2. 验证错误处理的正确性
3. 验证权限控制的响应

### 3. 请求响应格式

#### [概念] 概念解释

API 请求和响应通常使用 JSON 格式。验证请求参数和响应结构是确保 API 契约正确的重要环节。

#### [语法] 核心语法 / 命令 / API

**常用请求头：**

| Header | 说明 |
|--------|------|
| Content-Type | 请求体格式 |
| Accept | 期望响应格式 |
| Authorization | 认证信息 |
| User-Agent | 客户端标识 |

#### [代码] 代码示例

```python
# 请求响应格式测试
import requests
import pytest
import jsonschema

BASE_URL = "https://api.example.com"

# JSON Schema 定义
USER_SCHEMA = {
    "type": "object",
    "required": ["id", "name", "email"],
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "created_at": {"type": "string", "format": "date-time"}
    }
}

class TestRequestResponseFormat:
    """请求响应格式测试"""
    
    def test_request_headers(self):
        """测试请求头"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "API-Test/1.0"
        }
        
        response = requests.get(
            f"{BASE_URL}/users",
            headers=headers
        )
        
        assert response.status_code == 200
        assert response.headers['Content-Type'] == 'application/json'
    
    def test_response_json_format(self):
        """测试响应 JSON 格式"""
        response = requests.get(f"{BASE_URL}/users/1")
        
        assert response.status_code == 200
        
        # 验证 Content-Type
        assert 'application/json' in response.headers['Content-Type']
        
        # 验证 JSON 结构
        data = response.json()
        jsonschema.validate(data, USER_SCHEMA)
    
    def test_request_body_format(self):
        """测试请求体格式"""
        user_data = {
            "name": "Test User",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 201
        
        # 验证响应包含请求数据
        data = response.json()
        assert data['name'] == user_data['name']
        assert data['email'] == user_data['email']
    
    def test_query_parameters(self):
        """测试查询参数"""
        params = {
            "page": 1,
            "limit": 10,
            "sort": "name"
        }
        
        response = requests.get(
            f"{BASE_URL}/users",
            params=params
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= params['limit']
    
    def test_error_response_format(self):
        """测试错误响应格式"""
        response = requests.get(f"{BASE_URL}/users/99999")
        
        assert response.status_code == 404
        
        # 验证错误响应结构
        data = response.json()
        assert 'error' in data or 'message' in data
```

#### [场景] 典型应用场景

1. 验证 API 契约一致性
2. 测试数据格式转换
3. 验证错误响应结构

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 API 测试能力和测试覆盖率将显著提升。

### 1. 认证测试

#### [概念] 概念与解决的问题

认证测试验证 API 的身份验证机制是否正常工作，包括 JWT、OAuth、API Key 等认证方式。

#### [语法] 核心用法

**认证方式：**

| 方式 | Header 格式 |
|------|-------------|
| Bearer Token | Authorization: Bearer <token> |
| API Key | X-API-Key: <key> |
| Basic Auth | Authorization: Basic <credentials> |

#### [代码] 代码示例

```python
# 认证测试示例
import requests
import pytest
import time
import jwt

BASE_URL = "https://api.example.com"

class TestAuthentication:
    """认证测试"""
    
    def test_bearer_token_auth(self):
        """测试 Bearer Token 认证"""
        # 获取 token
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "user", "password": "pass"}
        )
        token = login_response.json()['token']
        
        # 使用 token 访问受保护资源
        response = requests.get(
            f"{BASE_URL}/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
    
    def test_invalid_token(self):
        """测试无效 token"""
        response = requests.get(
            f"{BASE_URL}/protected",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
    
    def test_expired_token(self):
        """测试过期 token"""
        # 创建过期 token
        expired_token = jwt.encode(
            {"exp": time.time() - 3600},
            "secret",
            algorithm="HS256"
        )
        
        response = requests.get(
            f"{BASE_URL}/protected",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
    
    def test_api_key_auth(self):
        """测试 API Key 认证"""
        response = requests.get(
            f"{BASE_URL}/api/data",
            headers={"X-API-Key": "your-api-key"}
        )
        
        assert response.status_code == 200
    
    def test_missing_auth_header(self):
        """测试缺少认证头"""
        response = requests.get(f"{BASE_URL}/protected")
        
        assert response.status_code == 401
```

#### [关联] 与核心层的关联

认证测试是状态码验证的延伸，专门验证 401/403 状态码的触发条件。

### 2. 性能测试

#### [概念] 概念与解决的问题

性能测试验证 API 的响应时间、吞吐量和并发处理能力，确保 API 在高负载下仍能正常工作。

#### [语法] 核心用法

**性能指标：**

| 指标 | 说明 |
|------|------|
| 响应时间 | 请求到响应的时间 |
| 吞吐量 | 单位时间处理请求数 |
| 并发数 | 同时处理的请求数 |
| 错误率 | 失败请求占比 |

#### [代码] 代码示例

```python
# 性能测试示例
import requests
import pytest
import time
import concurrent.futures
import statistics

BASE_URL = "https://api.example.com"

class TestPerformance:
    """性能测试"""
    
    def test_response_time(self):
        """测试响应时间"""
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/users")
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # 毫秒
        
        assert response.status_code == 200
        assert response_time < 1000  # 响应时间小于 1 秒
    
    def test_concurrent_requests(self):
        """测试并发请求"""
        def make_request(_):
            return requests.get(f"{BASE_URL}/users")
        
        concurrent_requests = 10
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
            futures = [executor.submit(make_request, i) for i in range(concurrent_requests)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # 验证所有请求成功
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count == concurrent_requests
    
    def test_throughput(self):
        """测试吞吐量"""
        request_count = 100
        start_time = time.time()
        
        for _ in range(request_count):
            requests.get(f"{BASE_URL}/users")
        
        end_time = time.time()
        duration = end_time - start_time
        throughput = request_count / duration
        
        print(f"吞吐量: {throughput:.2f} requests/second")
        assert throughput > 10  # 至少 10 请求/秒
    
    def test_response_time_percentile(self):
        """测试响应时间百分位"""
        response_times = []
        
        for _ in range(100):
            start = time.time()
            requests.get(f"{BASE_URL}/users")
            end = time.time()
            response_times.append((end - start) * 1000)
        
        p50 = statistics.median(response_times)
        p95 = sorted(response_times)[int(len(response_times) * 0.95)]
        p99 = sorted(response_times)[int(len(response_times) * 0.99)]
        
        print(f"P50: {p50:.2f}ms, P95: {p95:.2f}ms, P99: {p99:.2f}ms")
        
        assert p95 < 2000  # 95% 请求在 2 秒内完成
```

#### [场景] 典型应用场景

1. 验证 API 响应时间
2. 测试并发处理能力
3. 压力测试和负载测试

### 3. 自动化测试

#### [概念] 概念与解决的问题

自动化测试将 API 测试集成到 CI/CD 流程中，实现持续验证。通过测试框架和工具实现测试自动化。

#### [语法] 核心用法

**自动化测试结构：**

- 测试配置管理
- 测试数据准备
- 测试报告生成
- CI/CD 集成

#### [代码] 代码示例

```python
# pytest 配置文件 conftest.py
import pytest
import requests

@pytest.fixture(scope="session")
def base_url():
    return "https://api.example.com"

@pytest.fixture(scope="session")
def auth_token(base_url):
    response = requests.post(
        f"{base_url}/auth/login",
        json={"username": "test", "password": "test"}
    )
    return response.json()['token']

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}

# 测试文件 test_api.py
import pytest

class TestAPIAutomation:
    """自动化测试示例"""
    
    def test_health_check(self, base_url):
        """健康检查测试"""
        response = requests.get(f"{base_url}/health")
        assert response.status_code == 200
    
    def test_authenticated_request(self, base_url, auth_headers):
        """认证请求测试"""
        response = requests.get(
            f"{base_url}/protected",
            headers=auth_headers
        )
        assert response.status_code == 200
```

```yaml
# GitHub Actions CI 配置
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-html
      
      - name: Run API tests
        run: pytest tests/ --html=report.html
      
      - name: Upload test report
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: report.html
```

#### [场景] 典型应用场景

1. CI/CD 流水线集成
2. 定时回归测试
3. 测试报告自动生成

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Postman | 需要图形化 API 测试工具时 |
| Swagger/OpenAPI | 需要 API 文档和测试时 |
| Mock Server | 需要模拟后端服务时 |
| Contract Testing | 需要验证 API 契约时 |
| Load Testing | 需要压力测试时 |
| Fuzz Testing | 需要安全模糊测试时 |
| API Monitoring | 需要 API 监控告警时 |
| GraphQL Testing | 需要测试 GraphQL API 时 |
| WebSocket Testing | 需要测试 WebSocket 时 |
| gRPC Testing | 需要测试 gRPC 服务时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建完整的 API 测试套件

**任务描述：**
为一个 RESTful API 构建完整的测试套件，包括 CRUD 操作、认证测试和性能测试。

**要求：**
- 实现所有 HTTP 方法的测试
- 添加认证和权限测试
- 包含性能基准测试
- 生成测试报告

**参考实现：**

```python
# tests/test_users_api.py
import pytest
import requests
import time

BASE_URL = "http://localhost:8000/api"

class TestUsersAPI:
    """用户 API 完整测试套件"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """每个测试前的设置"""
        self.created_user_ids = []
        yield
        # 清理创建的测试数据
        for user_id in self.created_user_ids:
            requests.delete(f"{BASE_URL}/users/{user_id}")
    
    def test_create_user(self):
        """测试创建用户"""
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data
        )
        
        assert response.status_code == 201
        data = response.json()
        self.created_user_ids.append(data['id'])
        
    def test_get_all_users(self):
        """测试获取所有用户"""
        response = requests.get(f"{BASE_URL}/users")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_update_user(self):
        """测试更新用户"""
        # 先创建用户
        create_response = requests.post(
            f"{BASE_URL}/users",
            json={"name": "Original", "email": "original@test.com"}
        )
        user_id = create_response.json()['id']
        self.created_user_ids.append(user_id)
        
        # 更新用户
        update_data = {"name": "Updated"}
        response = requests.patch(
            f"{BASE_URL}/users/{user_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        assert response.json()['name'] == "Updated"
    
    def test_delete_user(self):
        """测试删除用户"""
        # 先创建用户
        create_response = requests.post(
            f"{BASE_URL}/users",
            json={"name": "To Delete", "email": "delete@test.com"}
        )
        user_id = create_response.json()['id']
        
        # 删除用户
        response = requests.delete(f"{BASE_URL}/users/{user_id}")
        
        assert response.status_code == 204
        
        # 验证已删除
        get_response = requests.get(f"{BASE_URL}/users/{user_id}")
        assert get_response.status_code == 404
    
    def test_performance(self):
        """性能基准测试"""
        start_time = time.time()
        
        for _ in range(10):
            requests.get(f"{BASE_URL}/users")
        
        duration = time.time() - start_time
        avg_time = duration / 10
        
        assert avg_time < 0.5  # 平均响应时间小于 500ms
```

```bash
# 运行测试
pytest tests/ -v --html=report.html
```
