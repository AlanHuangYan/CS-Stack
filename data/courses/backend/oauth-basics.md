# OAuth 2.0 基础 三层深度学习教程

## [总览] 技术总览

OAuth 2.0 是授权框架，允许第三方应用在用户授权下访问其资源，而无需共享密码。广泛用于社交登录、API 授权等场景。

本教程采用三层漏斗学习法：**核心层**聚焦授权流程、授权类型、Token 使用三大基石；**重点层**深入安全实践和常见实现；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 授权流程

#### [概念] 概念解释

OAuth 2.0 涉及四个角色：资源所有者（用户）、客户端（应用）、授权服务器、资源服务器。

#### [代码] 代码示例

```python
# OAuth 2.0 授权码流程示例
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import httpx

app = FastAPI()

CLIENT_ID = "your-client-id"
CLIENT_SECRET = "your-client-secret"
REDIRECT_URI = "http://localhost:8000/callback"
AUTH_URL = "https://provider.com/oauth/authorize"
TOKEN_URL = "https://provider.com/oauth/token"

# 步骤1：重定向到授权服务器
@app.get("/login")
def login():
    auth_url = f"{AUTH_URL}?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=read"
    return RedirectResponse(auth_url)

# 步骤2：处理回调，获取授权码
@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    
    # 步骤3：用授权码换取 Token
    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        })
    
    tokens = response.json()
    return tokens
```

### 2. 授权类型

#### [概念] 概念解释

OAuth 2.0 定义了四种授权类型：授权码、隐式、密码、客户端凭证。

| 类型 | 用途 | 安全性 |
|------|------|--------|
| 授权码 | 服务端应用 | 高 |
| 隐式 | 单页应用（已废弃） | 低 |
| 密码 | 受信任应用 | 中 |
| 客户端凭证 | 服务间通信 | 高 |

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. PKCE 安全增强

#### [概念] 概念与解决的问题

PKCE（Proof Key for Code Exchange）为授权码流程增加安全层，防止授权码被截获。

#### [代码] 代码示例

```python
import secrets
import hashlib
import base64

def generate_pkce():
    # 生成 code_verifier
    code_verifier = secrets.token_urlsafe(64)
    
    # 生成 code_challenge
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).decode().rstrip('=')
    
    return code_verifier, code_challenge

# 使用 PKCE 的授权请求
@app.get("/login-pkce")
def login_pkce():
    code_verifier, code_challenge = generate_pkce()
    # 存储 code_verifier 用于后续验证
    
    auth_url = f"{AUTH_URL}?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&code_challenge={code_challenge}&code_challenge_method=S256"
    return RedirectResponse(auth_url)
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| OpenID Connect | 需要身份认证时使用 |
| PKCE | 需要移动端安全时使用 |
| Scope | 需要权限控制时使用 |
| Refresh Token | 需要长期访问时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：第三方登录集成

**任务描述：** 集成 GitHub OAuth 登录。

**要求：**
1. 实现 GitHub OAuth 授权流程
2. 获取用户信息
3. 实现登录状态保持
