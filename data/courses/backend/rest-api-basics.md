# RESTful API 基础 三层深度学习教程

## [总览] 技术总览

RESTful API 是一种基于 HTTP 协议的 Web 服务架构风格，通过统一的接口设计实现系统间的通信。它以资源为中心，使用 HTTP 方法（GET、POST、PUT、DELETE）对资源进行操作，是现代 Web 开发中最常用的 API 设计模式。

本教程采用三层漏斗学习法：**核心层**聚焦 HTTP 方法与状态码、资源建模、请求响应设计三大基石；**重点层**深入分页查询、错误处理和认证授权；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 RESTful API 设计 **50% 以上** 的常见任务。

### 1. HTTP 方法与状态码

#### [概念] 概念解释

HTTP 方法定义了对资源的操作类型，状态码表示操作的结果。这是 RESTful API 的基础通信协议，理解它们是设计 API 的第一步。

#### [语法] 核心语法 / 命令 / API

**HTTP 方法：**

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新资源（完整替换） | 是 | 否 |
| PATCH | 更新资源（部分更新） | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

**常用状态码：**

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功响应 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 成功但无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器错误 |

#### [代码] 代码示例

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str

users_db = {}
next_id = 1

@app.get("/users", response_model=List[User], status_code=status.HTTP_200_OK)
async def get_users():
    return list(users_db.values())

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    return users_db[user_id]

@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    global next_id
    user.id = next_id
    users_db[next_id] = user
    next_id += 1
    return user

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: User):
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    user.id = user_id
    users_db[user_id] = user
    return user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    del users_db[user_id]
    return None
```

#### [场景] 典型应用场景

1. 用户管理系统：用户的增删改查操作
2. 商品管理：商品的列表、详情、创建、更新、删除
3. 订单系统：订单状态的查询和更新

### 2. 资源建模

#### [概念] 概念解释

资源建模是 RESTful API 设计的核心。资源是 API 操作的对象，通过 URL 路径表示。好的资源建模应该清晰、一致、符合业务语义。

#### [语法] 核心语法 / 命令 / API

**资源命名规则：**

| 规则 | 说明 | 示例 |
|------|------|------|
| 使用名词 | 资源用名词表示 | /users, /products |
| 使用复数 | 集合资源用复数 | /users 而非 /user |
| 层级关系 | 用路径表示嵌套 | /users/{id}/orders |
| 避免动词 | 操作由 HTTP 方法表达 | /users 而非 /getUsers |

#### [代码] 代码示例

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class Order(BaseModel):
    id: Optional[int] = None
    product_name: str
    quantity: int
    price: float

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    orders: List[Order] = []

users_db = {}
orders_db = {}
next_user_id = 1
next_order_id = 1

@app.get("/users")
async def list_users():
    return list(users_db.values())

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return users_db.get(user_id)

@app.get("/users/{user_id}/orders")
async def list_user_orders(user_id: int):
    user = users_db.get(user_id)
    if not user:
        return {"error": "User not found"}
    return user.orders

@app.post("/users/{user_id}/orders")
async def create_user_order(user_id: int, order: Order):
    global next_order_id
    order.id = next_order_id
    next_order_id += 1
    users_db[user_id].orders.append(order)
    return order

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    return orders_db.get(order_id)

@app.get("/products")
async def list_products():
    return [
        {"id": 1, "name": "Laptop", "price": 999.99},
        {"id": 2, "name": "Phone", "price": 699.99}
    ]

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    products = {
        1: {"id": 1, "name": "Laptop", "price": 999.99},
        2: {"id": 2, "name": "Phone", "price": 699.99}
    }
    return products.get(product_id)
```

#### [场景] 典型应用场景

1. 电商系统：商品、订单、用户、购物车等资源
2. 博客系统：文章、评论、标签、分类等资源
3. 社交平台：用户、帖子、关注、消息等资源

### 3. 请求与响应设计

#### [概念] 概念解释

请求和响应是 API 通信的基本单元。良好的设计包括清晰的请求参数、一致的响应格式和适当的 HTTP 头部。

#### [语法] 核心语法 / 命令 / API

**请求参数类型：**

| 类型 | 位置 | 用途 | 示例 |
|------|------|------|------|
| Path Parameters | URL 路径 | 标识资源 | /users/123 |
| Query Parameters | URL 查询串 | 过滤、排序、分页 | /users?page=1&size=10 |
| Request Body | 请求体 | 创建/更新数据 | JSON 数据 |
| Headers | 请求头 | 认证、内容类型 | Authorization, Content-Type |

**响应格式：**

```json
{
  "data": {},
  "message": "Success",
  "code": 200
}
```

#### [代码] 代码示例

```python
from fastapi import FastAPI, Query, Path, Header, Body
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

app = FastAPI()

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="用户名")
    email: str = Field(..., description="邮箱地址")
    age: Optional[int] = Field(None, ge=0, le=150, description="年龄")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int]
    created_at: datetime

class ApiResponse(BaseModel):
    data: Optional[dict] = None
    message: str = "Success"
    code: int = 200

users_db = {}
next_id = 1

@app.post("/users", response_model=ApiResponse, status_code=201)
async def create_user(
    user: UserCreate,
    content_type: str = Header(..., alias="Content-Type"),
    authorization: Optional[str] = Header(None)
):
    global next_id
    user_data = user.dict()
    user_data["id"] = next_id
    user_data["created_at"] = datetime.now()
    users_db[next_id] = user_data
    next_id += 1
    
    return ApiResponse(
        data=user_data,
        message="User created successfully",
        code=201
    )

@app.get("/users/{user_id}", response_model=ApiResponse)
async def get_user(
    user_id: int = Path(..., ge=1, description="用户ID"),
    fields: Optional[str] = Query(None, description="返回字段")
):
    user = users_db.get(user_id)
    if not user:
        return ApiResponse(
            data=None,
            message="User not found",
            code=404
        )
    
    if fields:
        field_list = fields.split(",")
        user = {k: v for k, v in user.items() if k in field_list}
    
    return ApiResponse(data=user)

@app.get("/users")
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="用户名过滤"),
    sort: str = Query("created_at", description="排序字段"),
    order: str = Query("desc", regex="^(asc|desc)$", description="排序方向")
):
    users = list(users_db.values())
    
    if name:
        users = [u for u in users if name.lower() in u["name"].lower()]
    
    reverse = order == "desc"
    users.sort(key=lambda x: x.get(sort, ""), reverse=reverse)
    
    start = (page - 1) * size
    end = start + size
    paginated_users = users[start:end]
    
    return {
        "data": paginated_users,
        "pagination": {
            "page": page,
            "size": size,
            "total": len(users),
            "pages": (len(users) + size - 1) // size
        }
    }
```

#### [场景] 典型应用场景

1. 分页列表：支持页码、每页数量、排序的列表接口
2. 条件过滤：根据多个条件筛选资源的接口
3. 字段选择：客户端指定返回字段的接口

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 API 设计质量、错误处理能力和开发效率将显著提升。

### 1. 分页与过滤

#### [概念] 概念与解决的问题

当资源数量庞大时，一次性返回所有数据会导致性能问题和网络开销。分页和过滤机制解决了大数据量查询的性能问题。

#### [语法] 核心用法

**分页方式：**

| 方式 | 参数 | 特点 |
|------|------|------|
| Offset 分页 | page, size | 简单，适合静态数据 |
| Cursor 分页 | cursor, limit | 高效，适合实时数据 |
| Keyset 分页 | last_id, limit | 性能最优，适合有序数据 |

#### [代码] 代码示例

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Optional, Any
import math

app = FastAPI()

class PaginatedResponse(BaseModel):
    data: List[Any]
    page: int
    size: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool

class CursorResponse(BaseModel):
    data: List[Any]
    cursor: Optional[str]
    has_more: bool

items_db = [{"id": i, "name": f"Item {i}", "category": f"cat{i % 5}"} for i in range(1, 101)]

@app.get("/items", response_model=PaginatedResponse)
async def list_items_offset(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    filtered = items_db
    
    if category:
        filtered = [i for i in filtered if i["category"] == category]
    
    if search:
        filtered = [i for i in filtered if search.lower() in i["name"].lower()]
    
    total = len(filtered)
    pages = math.ceil(total / size)
    start = (page - 1) * size
    end = start + size
    
    return PaginatedResponse(
        data=filtered[start:end],
        page=page,
        size=size,
        total=total,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )

@app.get("/items/cursor", response_model=CursorResponse)
async def list_items_cursor(
    cursor: Optional[int] = Query(None, description="上一次请求返回的 cursor"),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None)
):
    filtered = items_db
    
    if category:
        filtered = [i for i in filtered if i["category"] == category]
    
    if cursor:
        filtered = [i for i in filtered if i["id"] > cursor]
    
    result = filtered[:limit]
    has_more = len(filtered) > limit
    next_cursor = result[-1]["id"] if result and has_more else None
    
    return CursorResponse(
        data=result,
        cursor=str(next_cursor) if next_cursor else None,
        has_more=has_more
    )
```

#### [关联] 与核心层的关联

分页与过滤是 GET 方法的进阶应用，需要在资源建模的基础上实现高效的数据查询。

### 2. 错误处理

#### [概念] 概念与解决的问题

统一的错误处理机制让客户端能够清晰地理解错误原因并采取相应措施。良好的错误响应应包含错误码、消息和详细信息。

#### [语法] 核心用法

**错误响应格式：**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {"field": "email", "message": "邮箱格式不正确"}
    ]
  }
}
```

#### [代码] 代码示例

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from typing import List, Optional
import traceback

app = FastAPI()

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str

class ErrorResponse(BaseModel):
    error: dict

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: List[ErrorDetail] = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": [d.dict() for d in exc.details]
            }
        }
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    details = [
        ErrorDetail(field=".".join(str(loc) for loc in e["loc"]), message=e["msg"])
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "请求参数验证失败",
                "details": [d.dict() for d in details]
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务器内部错误",
                "details": [{"message": str(exc)}]
            }
        }
    )

class UserCreate(BaseModel):
    name: str
    email: str
    age: int

@app.post("/users")
async def create_user(user: UserCreate):
    if user.age < 0:
        raise AppException(
            code="INVALID_AGE",
            message="年龄不能为负数",
            status_code=400,
            details=[ErrorDetail(field="age", message="年龄必须大于等于0")]
        )
    
    if "@" not in user.email:
        raise AppException(
            code="INVALID_EMAIL",
            message="邮箱格式不正确",
            status_code=400,
            details=[ErrorDetail(field="email", message="请输入有效的邮箱地址")]
        )
    
    return {"id": 1, **user.dict()}
```

#### [关联] 与核心层的关联

错误处理是对 HTTP 状态码的补充，提供更详细的错误信息，帮助客户端更好地处理异常情况。

### 3. 认证与授权

#### [概念] 概念与解决的问题

认证确认用户身份，授权确认用户权限。这是 API 安全的基础，保护资源不被未授权访问。

#### [语法] 核心用法

**认证方式：**

| 方式 | 特点 | 使用场景 |
|------|------|----------|
| API Key | 简单，适合服务间调用 | 内部服务、公开 API |
| Bearer Token | 标准，适合用户认证 | 用户登录态 |
| OAuth 2.0 | 安全，适合第三方授权 | 第三方登录 |

#### [代码] 代码示例

```python
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import hashlib

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = "your-secret-key"
API_KEYS = {"client-app": "sk_live_abc123xyz"}

class TokenData(BaseModel):
    user_id: int
    username: str
    role: str

def create_access_token(user_id: int, username: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return TokenData(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def require_role(roles: list):
    def role_checker(token_data: TokenData = Depends(verify_token)):
        if token_data.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )
        return token_data
    return role_checker

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key not in API_KEYS.values():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return x_api_key

@app.post("/auth/login")
async def login(username: str, password: str):
    if username == "admin" and password == "password":
        token = create_access_token(user_id=1, username=username, role="admin")
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@app.get("/users/me")
async def get_current_user(token_data: TokenData = Depends(verify_token)):
    return {"user_id": token_data.user_id, "username": token_data.username, "role": token_data.role}

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    token_data: TokenData = Depends(require_role(["admin"]))
):
    return {"message": f"User {user_id} deleted by {token_data.username}"}

@app.get("/internal/stats")
async def get_internal_stats(api_key: str = Depends(verify_api_key)):
    return {"total_users": 1000, "active_users": 500}
```

#### [关联] 与核心层的关联

认证与授权是对资源访问的保护机制，在资源建模的基础上增加安全层，确保只有授权用户才能访问特定资源。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| HATEOAS | 需要在响应中包含相关链接，实现超媒体驱动 |
| API 版本控制 | 需要管理多版本 API，支持平滑升级 |
| Rate Limiting | 需要限制客户端请求频率，防止滥用 |
| Caching | 需要缓存响应数据，提升性能 |
| Content Negotiation | 需要支持多种响应格式（JSON/XML） |
| CORS | 需要支持跨域请求 |
| Webhooks | 需要实现事件通知机制 |
| GraphQL | 需要灵活查询，减少请求次数 |
| gRPC | 需要高性能服务间通信 |
| OpenAPI/Swagger | 需要自动生成 API 文档 |

---

## [实战] 核心实战清单

### 实战任务 1：设计一个博客系统 API

**任务描述：**

设计并实现一个博客系统的 RESTful API，包含以下功能：

1. 文章管理：创建、读取、更新、删除文章
2. 评论管理：对文章发表评论、删除评论
3. 用户认证：登录获取 Token，验证用户身份
4. 分页查询：文章列表支持分页和按分类过滤

**要求：**
- 使用 FastAPI 框架
- 实现统一的错误处理
- 使用 JWT 进行用户认证
- 返回适当的 HTTP 状态码

**参考实现：**

```python
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import jwt

app = FastAPI(title="Blog API")
security = HTTPBearer()

SECRET_KEY = "blog-secret-key"

class User(BaseModel):
    id: int
    username: str
    role: str = "user"

class Post(BaseModel):
    id: int
    title: str
    content: str
    category: str
    author_id: int
    created_at: datetime
    updated_at: datetime

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str

class Comment(BaseModel):
    id: int
    post_id: int
    content: str
    author_id: int
    created_at: datetime

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

posts_db = {}
comments_db = {}
users_db = {1: User(id=1, username="admin", role="admin")}
next_post_id = 1
next_comment_id = 1

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        return users_db.get(user_id)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/login")
async def login(username: str, password: str):
    if username == "admin" and password == "password":
        token = jwt.encode({"user_id": 1, "username": username}, SECRET_KEY)
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/posts", response_model=Post, status_code=201)
async def create_post(post: PostCreate, user: User = Depends(get_current_user)):
    global next_post_id
    now = datetime.now()
    new_post = Post(
        id=next_post_id,
        title=post.title,
        content=post.content,
        category=post.category,
        author_id=user.id,
        created_at=now,
        updated_at=now
    )
    posts_db[next_post_id] = new_post
    next_post_id += 1
    return new_post

@app.get("/posts")
async def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    category: Optional[str] = None
):
    posts = list(posts_db.values())
    if category:
        posts = [p for p in posts if p.category == category]
    
    total = len(posts)
    start = (page - 1) * size
    end = start + size
    
    return {
        "data": posts[start:end],
        "pagination": {"page": page, "size": size, "total": total}
    }

@app.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: int):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    return posts_db[post_id]

@app.put("/posts/{post_id}", response_model=Post)
async def update_post(post_id: int, post: PostCreate, user: User = Depends(get_current_user)):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing = posts_db[post_id]
    if existing.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")
    
    updated = Post(
        id=post_id,
        title=post.title,
        content=post.content,
        category=post.category,
        author_id=existing.author_id,
        created_at=existing.created_at,
        updated_at=datetime.now()
    )
    posts_db[post_id] = updated
    return updated

@app.delete("/posts/{post_id}", status_code=204)
async def delete_post(post_id: int, user: User = Depends(get_current_user)):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing = posts_db[post_id]
    if existing.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")
    
    del posts_db[post_id]
    return None

@app.post("/posts/{post_id}/comments", response_model=Comment, status_code=201)
async def create_comment(post_id: int, comment: CommentCreate, user: User = Depends(get_current_user)):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    
    global next_comment_id
    new_comment = Comment(
        id=next_comment_id,
        post_id=post_id,
        content=comment.content,
        author_id=user.id,
        created_at=datetime.now()
    )
    comments_db[next_comment_id] = new_comment
    next_comment_id += 1
    return new_comment

@app.get("/posts/{post_id}/comments")
async def list_comments(post_id: int):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = [c for c in comments_db.values() if c.post_id == post_id]
    return {"data": comments}

@app.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(comment_id: int, user: User = Depends(get_current_user)):
    if comment_id not in comments_db:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments_db[comment_id]
    if comment.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")
    
    del comments_db[comment_id]
    return None
```
