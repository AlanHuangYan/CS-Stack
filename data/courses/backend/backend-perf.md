# 后端性能优化 三层深度学习教程

## [总览] 技术总览

后端性能优化提升服务响应速度和吞吐量，涉及数据库、缓存、并发、架构等多个层面。优化目标是降低延迟、提高吞吐、减少资源消耗。

本教程采用三层漏斗学习法：**核心层**聚焦数据库优化、缓存策略、并发处理三大基石；**重点层**深入 API 性能和监控分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数据库优化

#### [概念] 概念解释

数据库优化包括索引优化、查询优化、连接池配置。是后端性能优化的基础。

#### [代码] 代码示例

```python
# 索引优化
# 错误：无索引全表扫描
SELECT * FROM users WHERE email = 'user@example.com';

# 正确：创建索引
CREATE INDEX idx_users_email ON users(email);

# 查询优化
# 错误：SELECT *
SELECT * FROM orders WHERE user_id = 123;

# 正确：只查询需要的字段
SELECT id, product, quantity FROM orders WHERE user_id = 123;

# 连接池配置 (SQLAlchemy)
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "postgresql://user:pass@localhost/db",
    poolclass=QueuePool,
    pool_size=10,        # 连接池大小
    max_overflow=20,     # 最大溢出连接
    pool_timeout=30,     # 获取连接超时
    pool_recycle=1800    # 连接回收时间
)
```

### 2. 缓存策略

#### [概念] 概念解释

缓存减少数据库访问，常用 Redis 作为缓存层。策略包括：缓存穿透、缓存击穿、缓存雪崩防护。

#### [代码] 代码示例

```python
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 缓存装饰器
def cache_result(key_prefix: str, expire: int = 300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{args[0] if args else ''}"
            
            # 尝试从缓存获取
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # 执行函数
            result = func(*args, **kwargs)
            
            # 写入缓存
            redis_client.setex(cache_key, expire, json.dumps(result))
            return result
        return wrapper
    return decorator

# 使用示例
@cache_result("user", expire=600)
def get_user(user_id: int):
    # 数据库查询
    return db.query(User).get(user_id)

# 缓存穿透防护：缓存空值
def get_user_safe(user_id: int):
    cache_key = f"user:{user_id}"
    cached = redis_client.get(cache_key)
    
    if cached == "NULL":  # 空值标记
        return None
    if cached:
        return json.loads(cached)
    
    user = db.query(User).get(user_id)
    
    if user:
        redis_client.setex(cache_key, 600, json.dumps(user))
    else:
        redis_client.setex(cache_key, 60, "NULL")  # 缓存空值
    
    return user
```

### 3. 并发处理

#### [概念] 概念解释

Python 使用异步 IO 或多进程提升并发能力。FastAPI 原生支持异步。

#### [代码] 代码示例

```python
# 异步数据库查询
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

app = FastAPI()

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
async_session = sessionmaker(engine, class_=AsyncSession)

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one()

# 异步 HTTP 请求
import httpx

async def fetch_multiple_urls(urls: list):
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return responses
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. API 性能优化

#### [概念] 概念与解决的问题

API 性能优化包括：分页、字段过滤、批量接口、响应压缩。

#### [代码] 代码示例

```python
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import gzip

app = FastAPI()

# 分页
@app.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, le=100)
):
    offset = (page - 1) * page_size
    users = await db.execute(
        select(User).offset(offset).limit(page_size)
    )
    return {"users": users, "page": page, "page_size": page_size}

# 响应压缩
@app.middleware("http")
async def gzip_middleware(request, call_next):
    response = await call_next(request)
    if "gzip" in request.headers.get("accept-encoding", ""):
        response.body = gzip.compress(response.body)
        response.headers["content-encoding"] = "gzip"
    return response
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| 连接池 | 需要复用连接时使用 |
| 慢查询日志 | 需要定位慢查询时使用 |
| APM | 需要性能监控时使用 |
| 负载均衡 | 需要水平扩展时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：高并发 API 优化

**任务描述：** 优化一个高并发 API 接口。

**要求：**
1. 添加数据库索引
2. 实现 Redis 缓存
3. 实现异步处理
4. 压测验证优化效果
