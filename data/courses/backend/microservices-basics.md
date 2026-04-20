# 微服务架构基础 三层深度学习教程

## [总览] 技术总览

微服务架构将应用拆分为多个小型、独立的服务，每个服务专注单一业务功能。相比单体架构，微服务提供更好的可扩展性、独立部署和技术多样性。

本教程采用三层漏斗学习法：**核心层**聚焦服务拆分、服务通信、服务发现三大基石；**重点层**深入 API 网关和配置中心；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 服务拆分

#### [概念] 概念解释

服务拆分遵循单一职责原则，按业务能力或领域划分服务边界。每个服务独立开发、部署、扩展。

#### [代码] 代码示例

```python
# 用户服务 (user_service/main.py)
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="User Service")

class User(BaseModel):
    id: int
    name: str
    email: str

users_db = {}

@app.post("/users")
def create_user(user: User):
    users_db[user.id] = user
    return user

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return users_db.get(user_id)

# 订单服务 (order_service/main.py)
from fastapi import FastAPI
from pydantic import BaseModel
import httpx

app = FastAPI(title="Order Service")

class Order(BaseModel):
    id: int
    user_id: int
    product: str
    quantity: int

orders_db = {}
USER_SERVICE_URL = "http://user-service:8001"

@app.post("/orders")
async def create_order(order: Order):
    # 调用用户服务验证用户
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{USER_SERVICE_URL}/users/{order.user_id}")
        if response.status_code != 200:
            return {"error": "User not found"}
    
    orders_db[order.id] = order
    return order
```

### 2. 服务通信

#### [概念] 概念解释

微服务间通信方式：同步（REST/gRPC）和异步（消息队列）。

#### [代码] 代码示例

```python
# 同步通信 - REST
import httpx

async def call_user_service(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://user-service:8001/users/{user_id}")
        return response.json()

# 同步通信 - gRPC
# proto/user.proto
"""
syntax = "proto3";

service UserService {
    rpc GetUser(GetUserRequest) returns (User);
}

message GetUserRequest {
    int32 id = 1;
}

message User {
    int32 id = 1;
    string name = 2;
    string email = 3;
}
"""
```

### 3. 服务发现

#### [概念] 概念解释

服务发现让服务动态找到彼此，常用方案：Consul、Eureka、Kubernetes Service。

#### [代码] 代码示例

```yaml
# docker-compose.yml - 服务注册
version: '3.8'
services:
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
  
  user-service:
    build: ./user_service
    ports:
      - "8001:8001"
    environment:
      - CONSUL_HOST=consul
    depends_on:
      - consul
  
  order-service:
    build: ./order_service
    ports:
      - "8002:8002"
    environment:
      - CONSUL_HOST=consul
    depends_on:
      - consul
      - user-service
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. API 网关

#### [概念] 概念与解决的问题

API 网关统一入口，处理认证、限流、路由、负载均衡。

#### [代码] 代码示例

```yaml
# Kong/Nginx 配置示例
upstream user_service {
    server user-service:8001;
}

upstream order_service {
    server order-service:8002;
}

server {
    listen 80;
    
    location /api/users {
        proxy_pass http://user_service;
    }
    
    location /api/orders {
        proxy_pass http://order_service;
    }
}
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Docker | 需要容器化部署时使用 |
| Kubernetes | 需要容器编排时使用 |
| Istio | 需要服务网格时使用 |
| Circuit Breaker | 需要容错处理时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：电商微服务系统

**任务描述：** 设计并实现电商微服务架构。

**要求：**
1. 拆分用户、商品、订单服务
2. 实现服务间 REST 通信
3. 使用 Docker Compose 编排
