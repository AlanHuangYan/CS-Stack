# 端到端测试 三层深度学习教程

## [总览] 技术总览

端到端测试（E2E Testing）从用户视角验证完整应用流程，模拟真实用户操作，确保系统各组件协同工作正常。它是测试金字塔的顶层，覆盖范围最广但执行成本最高。

本教程采用三层漏斗学习法：**核心层**聚焦测试框架选择、页面交互、断言验证三大基石；**重点层**深入测试组织和最佳实践；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. Playwright 测试框架

#### [概念] 概念解释

Playwright 是微软开发的现代 E2E 测试框架，支持多浏览器、多语言，提供自动等待、网络拦截、截图录屏等功能。相比 Selenium，它更快、更稳定、API 更现代。

#### [代码] 代码示例

```python
# Playwright E2E 测试示例
from playwright.sync_api import sync_playwright, Page, expect
import pytest

class TestUserLogin:
    
    @pytest.fixture(scope="class")
    def browser_context(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            yield context
            context.close()
            browser.close()
    
    def test_login_success(self, browser_context):
        page = browser_context.new_page()
        
        page.goto("https://example.com/login")
        
        page.fill('input[name="username"]', "testuser")
        page.fill('input[name="password"]', "password123")
        
        page.click('button[type="submit"]')
        
        page.wait_for_url("**/dashboard")
        
        expect(page).to_have_url("https://example.com/dashboard")
        expect(page.locator(".welcome-message")).to_contain_text("Welcome")
    
    def test_login_invalid_credentials(self, browser_context):
        page = browser_context.new_page()
        
        page.goto("https://example.com/login")
        
        page.fill('input[name="username"]', "wronguser")
        page.fill('input[name="password"]', "wrongpass")
        page.click('button[type="submit"]')
        
        error_message = page.locator(".error-message")
        expect(error_message).to_be_visible()
        expect(error_message).to_contain_text("Invalid credentials")

class TestShoppingCart:
    
    def test_add_to_cart(self, browser_context):
        page = browser_context.new_page()
        
        page.goto("https://example.com/products")
        
        page.click('.product-card:first-child .add-to-cart')
        
        cart_badge = page.locator(".cart-badge")
        expect(cart_badge).to_have_text("1")
        
        page.click('.cart-icon')
        
        cart_items = page.locator(".cart-item")
        expect(cart_items).to_have_count(1)
    
    def test_checkout_flow(self, browser_context):
        page = browser_context.new_page()
        
        page.goto("https://example.com/cart")
        
        page.click("#checkout-button")
        
        page.fill('input[name="name"]', "John Doe")
        page.fill('input[name="address"]', "123 Main St")
        page.fill('input[name="card"]', "4111111111111111")
        
        page.click("#place-order")
        
        expect(page.locator(".order-confirmation")).to_be_visible()
        expect(page.locator(".order-number")).to_be_visible()
```

### 2. 页面交互与定位

#### [概念] 概念解释

页面交互是 E2E 测试的核心，包括元素定位、表单填写、点击操作、键盘输入等。Playwright 提供多种定位策略：CSS 选择器、文本内容、角色属性、测试 ID 等。

#### [代码] 代码示例

```python
# 页面交互示例
from playwright.sync_api import sync_playwright, expect

def test_form_interactions():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        page.goto("https://example.com/form")
        
        page.get_by_label("Username").fill("testuser")
        
        page.get_by_placeholder("Enter email").fill("test@example.com")
        
        page.get_by_role("button", name="Submit").click()
        
        page.get_by_test_id("submit-button").click()
        
        page.select_option('select[name="country"]', "US")
        
        page.check('input[value="newsletter"]')
        
        page.set_input_files('input[type="file"]', "test_file.pdf")
        
        page.get_by_role("textbox", name="Bio").fill("Multi\nline\ntext")
        
        page.keyboard.press("Control+a")
        page.keyboard.type("New text")
        
        page.mouse.click(100, 200)
        page.mouse.dblclick(100, 200)
        
        browser.close()

def test_dynamic_content():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        page.goto("https://example.com/dynamic")
        
        loading = page.locator(".loading-spinner")
        expect(loading).to_be_hidden(timeout=10000)
        
        content = page.locator(".dynamic-content")
        expect(content).to_be_visible()
        
        with page.expect_response("**/api/data") as response_info:
            page.click("#refresh-button")
        response = response_info.value
        assert response.status == 200
        
        browser.close()
```

### 3. 断言与验证

#### [概念] 概念解释

断言验证测试结果是否符合预期。Playwright 提供丰富的断言方法：元素可见性、文本内容、属性值、URL、截图对比等。自动等待机制使断言更稳定。

#### [代码] 代码示例

```python
# 断言示例
from playwright.sync_api import sync_playwright, expect
import pytest

class TestAssertions:
    
    def test_element_assertions(self):
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("https://example.com")
            
            element = page.locator(".status-badge")
            
            expect(element).to_be_visible()
            
            expect(element).to_be_enabled()
            
            expect(element).to_have_text("Active")
            
            expect(element).to_contain_text("Active")
            
            expect(element).to_have_class("badge badge-success")
            
            expect(element).to_have_attribute("data-status", "active")
            
            expect(page.locator(".item")).to_have_count(5)
            
            expect(page).to_have_title("Example Domain")
            
            expect(page).to_have_url("https://example.com/")
            
            expect(page.locator(".hidden")).not_to_be_visible()
            
            browser.close()
    
    def test_screenshot_comparison(self):
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("https://example.com")
            
            expect(page).to_have_screenshot("homepage.png")
            
            expect(page.locator(".header")).to_have_screenshot(
                "header.png",
                max_diff_pixels=100
            )
            
            browser.close()
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Page Object 模式

#### [概念] 概念解释

Page Object 模式将页面封装为对象，提高测试代码的可维护性和可读性。每个页面类包含该页面的元素定位器和操作方法，测试代码通过调用方法完成操作。

#### [代码] 代码示例

```python
# Page Object 模式实现
from playwright.sync_api import Page, expect

class LoginPage:
    def __init__(self, page: Page):
        self.page = page
        self.username_input = page.get_by_label("Username")
        self.password_input = page.get_by_label("Password")
        self.submit_button = page.get_by_role("button", name="Sign In")
        self.error_message = page.locator(".error-message")
    
    def navigate(self):
        self.page.goto("https://example.com/login")
    
    def login(self, username: str, password: str):
        self.username_input.fill(username)
        self.password_input.fill(password)
        self.submit_button.click()
    
    def get_error_message(self) -> str:
        return self.error_message.text_content()

class DashboardPage:
    def __init__(self, page: Page):
        self.page = page
        self.welcome_message = page.locator(".welcome-message")
        self.user_menu = page.locator(".user-menu")
        self.logout_button = page.get_by_role("button", name="Logout")
    
    def is_displayed(self) -> bool:
        return self.welcome_message.is_visible()
    
    def logout(self):
        self.user_menu.click()
        self.logout_button.click()

class TestLoginWithPageObject:
    
    def test_successful_login(self, page: Page):
        login_page = LoginPage(page)
        login_page.navigate()
        login_page.login("testuser", "password123")
        
        dashboard = DashboardPage(page)
        assert dashboard.is_displayed()
    
    def test_failed_login(self, page: Page):
        login_page = LoginPage(page)
        login_page.navigate()
        login_page.login("wrong", "wrong")
        
        expect(login_page.error_message).to_be_visible()
```

### 2. 测试数据管理

#### [概念] 概念解释

测试数据管理确保测试有可靠的数据源。策略包括：数据工厂、Fixtures、环境变量、API 预设数据。良好的数据管理使测试独立、可重复。

#### [代码] 代码示例

```python
# 测试数据管理
import pytest
from dataclasses import dataclass
from typing import Optional
import json

@dataclass
class User:
    username: str
    email: str
    password: str
    role: str = "user"

class UserFactory:
    @staticmethod
    def create_user(
        username: str = "testuser",
        email: str = "test@example.com",
        password: str = "Password123!",
        role: str = "user"
    ) -> User:
        return User(
            username=username,
            email=email,
            password=password,
            role=role
        )
    
    @staticmethod
    def create_admin() -> User:
        return UserFactory.create_user(
            username="admin",
            email="admin@example.com",
            role="admin"
        )

@pytest.fixture
def test_user():
    return UserFactory.create_user()

@pytest.fixture
def admin_user():
    return UserFactory.create_admin()

@pytest.fixture
def authenticated_page(page, test_user):
    page.goto("https://example.com/login")
    page.fill('input[name="username"]', test_user.username)
    page.fill('input[name="password"]', test_user.password)
    page.click('button[type="submit"]')
    page.wait_for_url("**/dashboard")
    yield page

class TestWithDataFixtures:
    
    def test_user_profile(self, authenticated_page, test_user):
        authenticated_page.click(".profile-link")
        
        expect(authenticated_page.locator(".username")).to_have_text(
            test_user.username
        )
        expect(authenticated_page.locator(".email")).to_have_text(
            test_user.email
        )
    
    def test_admin_dashboard(self, page, admin_user):
        page.goto("https://example.com/login")
        page.fill('input[name="username"]', admin_user.username)
        page.fill('input[name="password"]', admin_user.password)
        page.click('button[type="submit"]')
        
        expect(page.locator(".admin-panel")).to_be_visible()
```

### 3. 网络拦截与模拟

#### [概念] 概念解释

网络拦截允许测试控制 API 响应，模拟各种场景：成功、失败、超时、慢速网络。这使得测试不依赖后端服务，更稳定可控。

#### [代码] 代码示例

```python
# 网络拦截示例
from playwright.sync_api import sync_playwright, expect
import json

def test_api_mocking():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        page.route("**/api/users", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": 1, "name": "User 1"},
                {"id": 2, "name": "User 2"}
            ])
        ))
        
        page.route("**/api/users/1", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"id": 1, "name": "User 1", "email": "user1@example.com"})
        ))
        
        page.goto("https://example.com/users")
        
        users = page.locator(".user-item")
        expect(users).to_have_count(2)
        
        browser.close()

def test_api_error_handling():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        page.route("**/api/users", lambda route: route.fulfill(
            status=500,
            content_type="application/json",
            body=json.dumps({"error": "Internal Server Error"})
        ))
        
        page.goto("https://example.com/users")
        
        expect(page.locator(".error-message")).to_contain_text("Error loading users")
        
        browser.close()

def test_slow_network():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        def slow_response(route):
            import time
            time.sleep(3)
            route.continue_()
        
        page.route("**/api/**", slow_response)
        
        page.goto("https://example.com")
        
        expect(page.locator(".loading-spinner")).to_be_visible()
        
        browser.close()
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Visual Regression | 视觉回归测试，截图对比验证 UI 变化 |
| Accessibility Testing | 无障碍测试，验证 WCAG 合规性 |
| Cross-browser Testing | 跨浏览器测试，Chrome/Firefox/Safari |
| Mobile Testing | 移动端测试，响应式布局验证 |
| Parallel Execution | 并行执行，加速测试套件运行 |
| Test Reporting | 测试报告，HTML/Allure 报告生成 |
| Retry Mechanism | 重试机制，处理不稳定测试 |
| Trace Viewer | 追踪查看器，调试测试失败 |
| Code Generation | 代码生成，录制用户操作 |
| Browser Contexts | 浏览器上下文，测试隔离 |
