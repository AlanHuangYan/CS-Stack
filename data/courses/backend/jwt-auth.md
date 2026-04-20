# JWT 认证 三层深度学习教程

## [总览] 技术总览

JWT（JSON Web Token）是一种开放标准，用于在各方之间安全传输信息。广泛用于身份认证和信息交换，是现代 Web 应用的主流认证方案。

本教程采用三层漏斗学习法：**核心层**聚焦 Token 结构、签名验证、认证流程三大基石；**重点层**深入刷新机制和安全最佳实践；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Token 结构

#### [概念] 概念解释

JWT 由三部分组成：Header（头部）、Payload（载荷）、Signature（签名），用点号连接。格式为 `xxxxx.yyyyy.zzzzz`。

#### [代码] 代码示例

```python
# Python JWT 示例
import jwt
import datetime

SECRET_KEY = "your-secret-key"

# 创建 Token
def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        "iat": datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

# 验证 Token
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token 已过期")
    except jwt.InvalidTokenError:
        raise ValueError("无效的 Token")

# 使用示例
token = create_token(user_id=123)
print(f"Token: {token}")

payload = verify_token(token)
print(f"Payload: {payload}")
```

### 2. 认证流程

#### [概念] 概念解释

JWT 认证流程：用户登录 -> 服务器验证 -> 生成 Token -> 客户端存储 -> 请求携带 Token -> 服务器验证。

#### [代码] 代码示例

```python
# FastAPI JWT 认证示例
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel

app = FastAPI()
security = HTTPBearer()
SECRET_KEY = "your-secret-key"

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    # 验证用户名密码
    if request.username != "admin" or request.password != "password":
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 生成 Token
    token = jwt.encode(
        {"sub": request.username},
        SECRET_KEY,
        algorithm="HS256"
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/protected")
def protected(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return {"message": f"Hello, {payload['sub']}"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的 Token")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 刷新机制

#### [概念] 概念与解决的问题

使用 Refresh Token 延长会话，避免频繁登录。

#### [代码] 代码示例

```python
# 刷新 Token 示例
REFRESH_SECRET = "refresh-secret-key"

def create_tokens(user_id: int) -> dict:
    access_token = jwt.encode(
        {"sub": user_id, "type": "access", "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)},
        SECRET_KEY,
        algorithm="HS256"
    )
    refresh_token = jwt.encode(
        {"sub": user_id, "type": "refresh", "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        REFRESH_SECRET,
        algorithm="HS256"
    )
    return {"access_token": access_token, "refresh_token": refresh_token}

@app.post("/refresh")
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="无效的刷新 Token")
        return create_tokens(payload["sub"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的刷新 Token")
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| RS256 | 需要非对称加密时使用 |
| JWKS | 需要公钥分发时使用 |
| Blacklist | 需要撤销 Token 时使用 |
| Cookie | 需要安全存储时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：用户认证系统

**任务描述：** 实现完整的 JWT 用户认证系统。

**要求：**
1. 实现登录、注册接口
2. 实现 Token 刷新机制
3. 实现登出功能（Token 黑名单）
