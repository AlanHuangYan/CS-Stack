# 应用安全 三层深度学习教程

## [总览] 技术总览

应用安全关注软件应用的安全防护，包括输入验证、身份认证、访问控制、会话管理等。常见漏洞包括 SQL 注入、XSS、CSRF、认证绕过等。掌握应用安全是开发安全软件的基础。

本教程采用三层漏斗学习法：**核心层**聚焦输入验证、认证授权、会话管理三大基石；**重点层**深入常见漏洞防护；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 输入验证

#### [概念] 概念解释

输入验证是应用安全的第一道防线，确保用户输入符合预期格式。包括白名单验证、类型检查、长度限制、特殊字符过滤等。

#### [语法] 核心语法 / 命令 / API

```python
import re
from typing import Any, Optional
from dataclasses import dataclass

@dataclass
class ValidationResult:
    is_valid: bool
    value: Any
    error: Optional[str] = None

class InputValidator:
    """输入验证器"""
    
    @staticmethod
    def validate_email(email: str) -> ValidationResult:
        """验证邮箱格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(pattern, email):
            return ValidationResult(True, email.lower())
        return ValidationResult(False, None, "Invalid email format")
    
    @staticmethod
    def validate_username(username: str) -> ValidationResult:
        """验证用户名"""
        # 长度检查
        if len(username) < 3 or len(username) > 20:
            return ValidationResult(False, None, "Username must be 3-20 characters")
        
        # 格式检查：只允许字母、数字、下划线
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return ValidationResult(False, None, "Username can only contain letters, numbers, and underscores")
        
        return ValidationResult(True, username)
    
    @staticmethod
    def validate_password(password: str) -> ValidationResult:
        """验证密码强度"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain uppercase letter")
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain lowercase letter")
        if not re.search(r'[0-9]', password):
            errors.append("Password must contain digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain special character")
        
        if errors:
            return ValidationResult(False, None, "; ".join(errors))
        return ValidationResult(True, password)
    
    @staticmethod
    def validate_integer(value: str, min_val: int = None, max_val: int = None) -> ValidationResult:
        """验证整数"""
        try:
            num = int(value)
            if min_val is not None and num < min_val:
                return ValidationResult(False, None, f"Value must be >= {min_val}")
            if max_val is not None and num > max_val:
                return ValidationResult(False, None, f"Value must be <= {max_val}")
            return ValidationResult(True, num)
        except ValueError:
            return ValidationResult(False, None, "Invalid integer")
    
    @staticmethod
    def sanitize_html(text: str) -> str:
        """清理 HTML 内容"""
        import html
        # 转义 HTML 特殊字符
        return html.escape(text)
    
    @staticmethod
    def validate_sql_identifier(identifier: str) -> ValidationResult:
        """验证 SQL 标识符"""
        # 只允许字母、数字、下划线
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', identifier):
            return ValidationResult(False, None, "Invalid SQL identifier")
        return ValidationResult(True, identifier)

# SQL 注入防护
def safe_query(connection, query: str, params: tuple) -> list:
    """安全的 SQL 查询（使用参数化查询）"""
    cursor = connection.cursor()
    cursor.execute(query, params)
    return cursor.fetchall()

# 不安全的示例（不要这样做）
def unsafe_query(connection, user_input: str) -> list:
    """不安全的查询（示例，不要使用）"""
    query = f"SELECT * FROM users WHERE name = '{user_input}'"  # 危险！
    cursor = connection.cursor()
    cursor.execute(query)
    return cursor.fetchall()

# 安全的参数化查询
def safe_user_search(connection, username: str) -> list:
    """安全的用户搜索"""
    query = "SELECT id, username, email FROM users WHERE username = %s"
    return safe_query(connection, query, (username,))

# 使用示例
if __name__ == "__main__":
    validator = InputValidator()
    
    # 验证邮箱
    result = validator.validate_email("user@example.com")
    print(f"Email valid: {result.is_valid}")
    
    # 验证密码
    result = validator.validate_password("WeakPass")
    print(f"Password valid: {result.is_valid}, Error: {result.error}")
    
    # 清理 HTML
    safe_text = validator.sanitize_html("<script>alert('xss')</script>")
    print(f"Sanitized: {safe_text}")
```

#### [场景] 典型应用场景

- 用户注册表单验证
- API 输入参数校验
- 文件上传验证

### 2. 认证授权

#### [概念] 概念解释

认证验证用户身份，授权确定用户权限。常见认证方式包括密码认证、多因素认证、OAuth、SSO。授权模型包括 RBAC、ABAC 等。

#### [语法] 核心语法 / 命令 / API

```python
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

@dataclass
class User:
    id: int
    username: str
    password_hash: str
    salt: str
    role: UserRole
    is_active: bool = True

class AuthService:
    """认证服务"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.users = {}  # 实际应用中应该使用数据库
        self.sessions = {}
    
    def register_user(self, username: str, password: str, role: UserRole = UserRole.USER) -> User:
        """注册用户"""
        # 生成盐值
        salt = secrets.token_hex(16)
        
        # 哈希密码
        password_hash = self._hash_password(password, salt)
        
        user = User(
            id=len(self.users) + 1,
            username=username,
            password_hash=password_hash,
            salt=salt,
            role=role
        )
        
        self.users[username] = user
        return user
    
    def authenticate(self, username: str, password: str) -> Optional[str]:
        """认证用户"""
        user = self.users.get(username)
        
        if not user or not user.is_active:
            return None
        
        # 验证密码
        password_hash = self._hash_password(password, user.salt)
        
        if not secrets.compare_digest(password_hash, user.password_hash):
            return None
        
        # 生成 JWT
        token = self._generate_token(user)
        return token
    
    def _hash_password(self, password: str, salt: str) -> str:
        """密码哈希"""
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
    
    def _generate_token(self, user: User) -> str:
        """生成 JWT Token"""
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.value,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token: str) -> Optional[dict]:
        """验证 Token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

class AuthorizationService:
    """授权服务"""
    
    def __init__(self):
        # RBAC 权限定义
        self.permissions = {
            UserRole.ADMIN: ['read', 'write', 'delete', 'manage_users'],
            UserRole.USER: ['read', 'write'],
            UserRole.GUEST: ['read']
        }
    
    def has_permission(self, role: UserRole, permission: str) -> bool:
        """检查权限"""
        return permission in self.permissions.get(role, [])
    
    def check_access(self, user: User, resource: str, action: str) -> bool:
        """检查资源访问权限"""
        # 简化的资源访问控制
        resource_permissions = {
            'users': {'read', 'write', 'delete', 'manage_users'},
            'posts': {'read', 'write', 'delete'},
            'settings': {'read', 'write'}
        }
        
        required_permission = action
        return self.has_permission(user.role, required_permission)

# 装饰器实现权限检查
def require_permission(permission: str):
    """权限检查装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 从请求中获取用户信息
            user = kwargs.get('current_user')
            if not user:
                raise PermissionError("Authentication required")
            
            auth_service = AuthorizationService()
            if not auth_service.has_permission(user.role, permission):
                raise PermissionError(f"Permission '{permission}' required")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 使用示例
if __name__ == "__main__":
    auth = AuthService("secret_key_123")
    
    # 注册用户
    user = auth.register_user("admin", "SecurePass123!", UserRole.ADMIN)
    
    # 认证
    token = auth.authenticate("admin", "SecurePass123!")
    print(f"Token: {token[:50]}...")
    
    # 验证 Token
    payload = auth.verify_token(token)
    print(f"Payload: {payload}")
```

#### [场景] 典型应用场景

- 用户登录系统
- API 认证
- 权限管理

### 3. 会话管理

#### [概念] 概念解释

会话管理维护用户与应用之间的状态。包括会话创建、存储、验证、销毁。安全的会话管理防止会话劫持和固定攻击。

#### [语法] 核心语法 / 命令 / API

```python
import secrets
import time
from typing import Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class Session:
    session_id: str
    user_id: int
    created_at: datetime
    expires_at: datetime
    ip_address: str
    user_agent: str
    data: dict

class SessionManager:
    """会话管理器"""
    
    def __init__(self, session_timeout: int = 1800):  # 30 分钟
        self.sessions = {}  # 实际应用应使用 Redis
        self.session_timeout = session_timeout
    
    def create_session(self, user_id: int, ip_address: str, 
                       user_agent: str) -> Session:
        """创建会话"""
        session_id = secrets.token_urlsafe(32)
        
        session = Session(
            session_id=session_id,
            user_id=user_id,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(seconds=self.session_timeout),
            ip_address=ip_address,
            user_agent=user_agent,
            data={}
        )
        
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """获取会话"""
        session = self.sessions.get(session_id)
        
        if not session:
            return None
        
        # 检查是否过期
        if session.expires_at < datetime.now():
            self.destroy_session(session_id)
            return None
        
        # 刷新过期时间
        session.expires_at = datetime.now() + timedelta(seconds=self.session_timeout)
        
        return session
    
    def destroy_session(self, session_id: str):
        """销毁会话"""
        self.sessions.pop(session_id, None)
    
    def destroy_user_sessions(self, user_id: int):
        """销毁用户所有会话"""
        sessions_to_remove = [
            sid for sid, session in self.sessions.items()
            if session.user_id == user_id
        ]
        for sid in sessions_to_remove:
            self.destroy_session(sid)
    
    def validate_session(self, session_id: str, ip_address: str, 
                         user_agent: str) -> bool:
        """验证会话完整性"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        # 检查 IP 和 User-Agent
        if session.ip_address != ip_address or session.user_agent != user_agent:
            self.destroy_session(session_id)
            return False
        
        return True

# CSRF 防护
class CSRFProtection:
    """CSRF 防护"""
    
    @staticmethod
    def generate_token() -> str:
        """生成 CSRF Token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_token(token: str, expected_token: str) -> bool:
        """验证 CSRF Token"""
        return secrets.compare_digest(token, expected_token)

# 安全 Cookie 设置
def set_secure_cookie(response, name: str, value: str, 
                      secure: bool = True, httponly: bool = True,
                      samesite: str = 'Strict'):
    """设置安全 Cookie"""
    response.set_cookie(
        name,
        value,
        secure=secure,      # 仅 HTTPS
        httponly=httponly,  # 防止 JavaScript 访问
        samesite=samesite   # 防止 CSRF
    )

# 使用示例
if __name__ == "__main__":
    session_mgr = SessionManager()
    
    # 创建会话
    session = session_mgr.create_session(
        user_id=1,
        ip_address="192.168.1.1",
        user_agent="Mozilla/5.0"
    )
    print(f"Session ID: {session.session_id}")
    
    # 验证会话
    is_valid = session_mgr.validate_session(
        session.session_id,
        "192.168.1.1",
        "Mozilla/5.0"
    )
    print(f"Session valid: {is_valid}")
```

#### [场景] 典型应用场景

- 用户登录状态管理
- 购物车状态
- 多设备登录控制

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. XSS 防护

#### [概念] 概念与解决的问题

XSS（跨站脚本攻击）通过注入恶意脚本窃取用户信息。防护方法包括输入过滤、输出编码、CSP 策略等。

#### [语法] 核心用法

```python
import html
import re
from typing import Dict, List

class XSSProtection:
    """XSS 防护"""
    
    @staticmethod
    def escape_html(text: str) -> str:
        """HTML 转义"""
        return html.escape(text, quote=True)
    
    @staticmethod
    def escape_js(text: str) -> str:
        """JavaScript 转义"""
        replacements = {
            '\\': '\\\\',
            '"': '\\"',
            "'": "\\'",
            '\n': '\\n',
            '\r': '\\r',
            '<': '\\x3c',
            '>': '\\x3e',
            '&': '\\x26',
        }
        for char, escape in replacements.items():
            text = text.replace(char, escape)
        return text
    
    @staticmethod
    def sanitize_html(html_content: str, allowed_tags: List[str] = None) -> str:
        """清理 HTML（保留安全标签）"""
        if allowed_tags is None:
            allowed_tags = ['p', 'br', 'b', 'i', 'u', 'a', 'img']
        
        # 移除所有标签，只保留允许的
        pattern = r'<(?!/?(' + '|'.join(allowed_tags) + r')\b)[^>]*>'
        cleaned = re.sub(pattern, '', html_content)
        
        # 移除危险属性
        cleaned = re.sub(r'on\w+\s*=', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'javascript:', '', cleaned, flags=re.IGNORECASE)
        
        return cleaned

# CSP 头设置
def set_csp_header(response):
    """设置内容安全策略头"""
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' https://trusted.cdn.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://api.example.com; "
        "frame-ancestors 'none';"
    )
    response.headers['Content-Security-Policy'] = csp_policy
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
```

#### [关联] 与核心层的关联

XSS 防护是输入验证和输出编码的综合应用。

### 2. CSRF 防护

#### [概念] 概念与解决的问题

CSRF（跨站请求伪造）诱导用户在已登录状态下执行非预期操作。防护方法包括 CSRF Token、SameSite Cookie、验证 Referer 等。

#### [语法] 核心用法

```python
from flask import Flask, request, session
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

def generate_csrf_token():
    """生成 CSRF Token"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']

def validate_csrf_token(token: str) -> bool:
    """验证 CSRF Token"""
    return secrets.compare_digest(token, session.get('csrf_token', ''))

@app.route('/form', methods=['GET'])
def show_form():
    csrf_token = generate_csrf_token()
    return f'''
        <form method="POST" action="/submit">
            <input type="hidden" name="csrf_token" value="{csrf_token}">
            <input type="text" name="data">
            <button type="submit">Submit</button>
        </form>
    '''

@app.route('/submit', methods=['POST'])
def submit_form():
    csrf_token = request.form.get('csrf_token')
    
    if not validate_csrf_token(csrf_token):
        return "CSRF validation failed", 403
    
    # 处理表单
    return "Success"

# Double Submit Cookie 模式
@app.route('/api/submit', methods=['POST'])
def api_submit():
    # 从 Cookie 和 Header 获取 Token
    cookie_token = request.cookies.get('csrf_token')
    header_token = request.headers.get('X-CSRF-Token')
    
    if not cookie_token or not header_token:
        return "Missing CSRF token", 403
    
    if not secrets.compare_digest(cookie_token, header_token):
        return "CSRF validation failed", 403
    
    return "Success"
```

#### [关联] 与核心层的关联

CSRF 防护是会话管理的重要组成部分。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| OWASP Top 10 | 十大安全风险 |
| SQL Injection | SQL 注入防护 |
| IDOR | 不安全的直接对象引用 |
| SSRF | 服务端请求伪造 |
| XXE | XML 外部实体注入 |
| RCE | 远程代码执行 |
| Deserialization | 反序列化漏洞 |
| Rate Limiting | 速率限制 |
| WAF | Web 应用防火墙 |
| Security Headers | 安全响应头 |

---

## [实战] 核心实战清单

### 实战任务 1：实现安全 API

实现一个包含完整安全防护的 REST API：

```python
from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)

# 认证装饰器
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'Token required'}), 401
        
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated

# 权限装饰器
def require_role(role):
    def decorator(f):
        @wraps(f)
        @auth_required
        def decorated(*args, **kwargs):
            if request.current_user.get('role') != role:
                return jsonify({'error': 'Permission denied'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

@app.route('/api/users', methods=['GET'])
@require_role('admin')
def get_users():
    # 安全的用户列表 API
    return jsonify({'users': []})
```
