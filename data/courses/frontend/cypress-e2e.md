# Cypress 端到端测试 三层深度学习教程

## [总览] 技术总览

Cypress 是现代前端端到端（E2E）测试框架，运行在浏览器中，可以真实模拟用户操作。相比 Selenium，Cypress 更快、更易用、调试体验更好，是前端 E2E 测试的首选工具。

本教程采用三层漏斗学习法：**核心层**聚焦测试基础、选择器操作、断言验证三大基石，掌握后即可完成 50% 以上的 E2E 测试任务；**重点层**深入网络请求拦截和自定义命令，提升测试能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 测试基础

#### [概念] 概念解释

端到端测试模拟真实用户操作流程，验证整个应用的功能。Cypress 测试运行在浏览器中，可以访问真实的 DOM 和网络请求。

为什么归为核心层？E2E 测试是验证应用整体功能的最后一道防线，不理解测试基础就无法保证产品质量。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 示例 |
|------|------|------|
| `describe` | 测试套件 | `describe('Login', () => {})` |
| `it` | 测试用例 | `it('should login', () => {})` |
| `cy.visit` | 访问页面 | `cy.visit('/login')` |
| `beforeEach` | 每个测试前执行 | 登录、准备数据 |

#### [代码] 代码示例

```javascript
// cypress/e2e/login.cy.js - 登录测试
describe('Login Page', () => {
  
  // 每个测试前访问登录页
  beforeEach(() => {
    cy.visit('/login')
  })
  
  it('displays login form', () => {
    // 验证表单元素存在
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })
  
  it('shows error for invalid credentials', () => {
    // 输入无效凭据
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // 验证错误提示
    cy.get('.error-message')
      .should('be.visible')
      .and('contain', 'Invalid credentials')
  })
  
  it('logs in successfully with valid credentials', () => {
    // 输入有效凭据
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('correctpassword')
    cy.get('button[type="submit"]').click()
    
    // 验证跳转到首页
    cy.url().should('include', '/dashboard')
    cy.get('.welcome-message').should('contain', 'Welcome')
  })
  
  it('validates required fields', () => {
    // 直接点击提交
    cy.get('button[type="submit"]').click()
    
    // 验证验证提示
    cy.get('input[name="email"]:invalid').should('exist')
    cy.get('input[name="password"]:invalid').should('exist')
  })
})
```

```javascript
// cypress.config.js - Cypress 配置
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // 基础 URL
    baseUrl: 'http://localhost:3000',
    
    // 视口大小
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 视频录制
    video: true,
    videoCompression: 32,
    
    // 截图
    screenshotOnRunFailure: true,
    
    // 默认命令超时
    defaultCommandTimeout: 10000,
    
    // 设置
    setupNodeEvents(on, config) {
      // 事件监听
    }
  }
})
```

```json
// package.json - 测试脚本
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:chrome": "cypress run --browser chrome",
    "cy:run:headless": "cypress run --headless"
  }
}
```

#### [场景] 典型应用场景

1. **登录流程** — 验证登录成功/失败场景
2. **表单提交** — 验证表单验证和提交
3. **页面导航** — 验证路由跳转

---

### 2. 选择器操作

#### [概念] 概念解释

Cypress 使用 jQuery 选择器获取 DOM 元素，提供 `cy.get`、`cy.contains`、`cy.find` 等方法。选择器是 E2E 测试的基础操作。

为什么归为核心层？不操作元素就无法模拟用户行为，选择器是测试的第一步。

#### [语法] 核心语法 / 命令 / API

| 命令 | 用途 | 示例 |
|------|------|------|
| `cy.get` | 选择元素 | `cy.get('.btn')` |
| `cy.contains` | 按文本选择 | `cy.contains('Submit')` |
| `.type` | 输入文本 | `cy.get('input').type('hello')` |
| `.click` | 点击元素 | `cy.get('button').click()` |
| `.select` | 选择下拉选项 | `cy.get('select').select('option1')` |

#### [代码] 代码示例

```javascript
// selectors.cy.js - 选择器操作示例
describe('Selector Operations', () => {
  
  beforeEach(() => {
    cy.visit('/form')
  })
  
  it('types into input fields', () => {
    // 文本输入
    cy.get('#name').type('John Doe')
    cy.get('#name').should('have.value', 'John Doe')
    
    // 清空后输入
    cy.get('#name').clear().type('Jane Doe')
    
    // 特殊按键
    cy.get('#search').type('query{enter}')
  })
  
  it('clicks elements', () => {
    // 普通点击
    cy.get('.btn-primary').click()
    
    // 强制点击（忽略可见性）
    cy.get('.hidden-btn').click({ force: true })
    
    // 右键点击
    cy.get('.context-menu-trigger').rightclick()
    
    // 双击
    cy.get('.editable').dblclick()
  })
  
  it('selects from dropdown', () => {
    // 单选
    cy.get('#country').select('China')
    
    // 按值选择
    cy.get('#country').select('CN')
    
    // 多选
    cy.get('#skills').select(['JavaScript', 'Python'])
  })
  
  it('checks checkboxes and radios', () => {
    // 勾选复选框
    cy.get('#agree').check()
    cy.get('#agree').should('be.checked')
    
    // 取消勾选
    cy.get('#agree').uncheck()
    
    // 选择单选按钮
    cy.get('[name="gender"]').check('male')
  })
  
  it('finds elements by text', () => {
    // 包含文本
    cy.contains('Submit').click()
    
    // 正则匹配
    cy.contains(/submit/i).click()
    
    // 在特定范围内查找
    cy.get('.form').contains('Submit').click()
  })
  
  it('traverses DOM', () => {
    // 父元素
    cy.get('.item').parent()
    
    // 子元素
    cy.get('.list').children()
    
    // 兄弟元素
    cy.get('.item').next()
    cy.get('.item').prev()
    
    // 查找后代
    cy.get('.container').find('.item')
  })
})
```

#### [场景] 典型应用场景

1. **表单填写** — 输入文本、选择选项
2. **按钮点击** — 触发表单提交、导航
3. **列表操作** — 选择列表项、分页

---

### 3. 断言验证

#### [概念] 概念解释

断言验证元素状态、文本内容、URL 等是否符合预期。Cypress 使用 Chai 断言库，提供丰富的断言方法。

为什么归为核心层？没有断言的测试没有意义，断言是验证测试结果的唯一方式。

#### [语法] 核心语法 / 命令 / API

| 断言 | 用途 | 示例 |
|------|------|------|
| `should('exist')` | 元素存在 | `cy.get('.btn').should('exist')` |
| `should('be.visible')` | 元素可见 | `cy.get('.modal').should('be.visible')` |
| `should('have.text')` | 文本内容 | `cy.get('h1').should('have.text', 'Hello')` |
| `should('have.value')` | 输入值 | `cy.get('input').should('have.value', 'test')` |

#### [代码] 代码示例

```javascript
// assertions.cy.js - 断言示例
describe('Assertions', () => {
  
  beforeEach(() => {
    cy.visit('/dashboard')
  })
  
  it('asserts element existence', () => {
    // 存在
    cy.get('.header').should('exist')
    
    // 不存在
    cy.get('.loading').should('not.exist')
  })
  
  it('asserts visibility', () => {
    // 可见
    cy.get('.content').should('be.visible')
    
    // 隐藏
    cy.get('.hidden-panel').should('not.be.visible')
  })
  
  it('asserts text content', () => {
    // 精确匹配
    cy.get('.title').should('have.text', 'Dashboard')
    
    // 包含文本
    cy.get('.title').should('contain', 'Dash')
    
    // 正则匹配
    cy.get('.title').should('match', /Dashboard/i)
  })
  
  it('asserts attributes and classes', () => {
    // 属性
    cy.get('a').should('have.attr', 'href', '/home')
    cy.get('input').should('have.attr', 'placeholder')
    
    // CSS 类
    cy.get('.btn').should('have.class', 'active')
    cy.get('.btn').should('not.have.class', 'disabled')
    
    // CSS 样式
    cy.get('.highlight').should('have.css', 'color', 'rgb(255, 0, 0)')
  })
  
  it('asserts form state', () => {
    // 值
    cy.get('#email').should('have.value', 'test@example.com')
    
    // 选中状态
    cy.get('#agree').should('be.checked')
    
    // 禁用状态
    cy.get('#submit').should('be.disabled')
  })
  
  it('asserts URL and title', () => {
    // URL
    cy.url().should('include', '/dashboard')
    cy.url().should('eq', 'http://localhost:3000/dashboard')
    
    // 标题
    cy.title().should('include', 'Dashboard')
  })
  
  it('asserts count and length', () => {
    // 数量
    cy.get('.list-item').should('have.length', 5)
    
    // 大于/小于
    cy.get('.list-item').its('length').should('be.greaterThan', 3)
  })
  
  it('chains multiple assertions', () => {
    cy.get('.card')
      .should('exist')
      .and('be.visible')
      .and('have.class', 'featured')
      .within(() => {
        cy.get('.title').should('contain', 'Featured')
      })
  })
})
```

#### [场景] 典型应用场景

1. **页面状态** — 验证元素显示/隐藏
2. **表单验证** — 验证输入值、错误提示
3. **导航结果** — 验证 URL、页面标题

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 网络请求拦截

#### [概念] 概念与解决的问题

Cypress 可以拦截和模拟网络请求，用于测试 API 交互、模拟服务器响应、验证请求参数。

解决的核心痛点：**依赖隔离**。不依赖真实后端，可以测试各种响应场景（成功、失败、超时）。

#### [语法] 核心用法

```javascript
// 拦截请求
cy.intercept('GET', '/api/users', { fixture: 'users.json' })

// 等待请求
cy.wait('@getUsers')
```

#### [代码] 代码示例

```javascript
// network.cy.js - 网络请求拦截
describe('Network Interception', () => {
  
  it('mocks API response', () => {
    // 拦截并返回模拟数据
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]
    }).as('getUsers')
    
    cy.visit('/users')
    
    // 等待请求完成
    cy.wait('@getUsers')
    
    // 验证数据显示
    cy.get('.user-item').should('have.length', 2)
  })
  
  it('mocks error response', () => {
    // 模拟错误
    cy.intercept('GET', '/api/users', {
      statusCode: 500,
      body: { error: 'Server error' }
    })
    
    cy.visit('/users')
    
    // 验证错误处理
    cy.get('.error-message').should('contain', 'Server error')
  })
  
  it('verifies request parameters', () => {
    cy.intercept('POST', '/api/users').as('createUser')
    
    cy.visit('/users/new')
    cy.get('#name').type('New User')
    cy.get('button[type="submit"]').click()
    
    // 验证请求体
    cy.wait('@createUser').its('request.body').should('deep.equal', {
      name: 'New User'
    })
  })
  
  it('delays response', () => {
    // 模拟延迟
    cy.intercept('GET', '/api/users', {
      delay: 2000,
      body: []
    })
    
    cy.visit('/users')
    
    // 验证加载状态
    cy.get('.loading').should('be.visible')
    cy.get('.loading').should('not.exist', { timeout: 3000 })
  })
  
  it('uses fixture files', () => {
    // 使用 fixture 文件
    cy.intercept('GET', '/api/users', { fixture: 'users.json' })
    
    cy.visit('/users')
    
    cy.get('.user-item').should('have.length', 3)
  })
})
```

#### [关联] 与核心层的关联

网络拦截让测试不依赖真实后端，配合选择器和断言实现完整的 E2E 测试。

---

### 2. 自定义命令

#### [概念] 概念与解决的问题

自定义命令封装常用操作，提高测试代码复用性。比如登录、填表、导航等重复操作可以封装为命令。

解决的核心痛点：**代码复用**。避免在每个测试中重复相同的操作代码。

#### [语法] 核心用法

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
})
```

#### [代码] 代码示例

```javascript
// cypress/support/commands.js - 自定义命令
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password') => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.get('.logout-btn').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('addToCart', (productName) => {
  cy.contains('.product', productName).within(() => {
    cy.get('.add-to-cart').click()
  })
  cy.get('.notification').should('contain', 'Added to cart')
})

Cypress.Commands.add('fillCheckoutForm', (data) => {
  cy.get('#name').type(data.name)
  cy.get('#email').type(data.email)
  cy.get('#address').type(data.address)
  cy.get('#city').type(data.city)
  cy.get('#zip').type(data.zip)
})
```

```javascript
// cypress/support/e2e.js - 引入命令
import './commands'
```

```javascript
// checkout.cy.js - 使用自定义命令
describe('Checkout Flow', () => {
  
  beforeEach(() => {
    cy.login()
  })
  
  it('completes checkout', () => {
    cy.visit('/products')
    
    // 使用自定义命令
    cy.addToCart('Product A')
    cy.addToCart('Product B')
    
    cy.visit('/cart')
    cy.get('.cart-item').should('have.length', 2)
    
    cy.get('.checkout-btn').click()
    
    cy.fillCheckoutForm({
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
      city: 'New York',
      zip: '10001'
    })
    
    cy.get('.place-order').click()
    cy.get('.success-message').should('be.visible')
  })
})
```

#### [关联] 与核心层的关联

自定义命令封装核心层的操作，提高测试代码的可读性和可维护性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| cy.session | 需要缓存登录状态时使用 |
| cy.task | 需要在 Node 中执行代码时使用 |
| cy.exec | 需要执行系统命令时使用 |
| cy.fixture | 需要加载测试数据时使用 |
| cy.viewport | 需要测试响应式布局时使用 |
| cy.screenshot | 需要截图时使用 |
| cy.wait | 需要等待时间时使用 |
| retry | 需要重试断言时使用 |
| plugins | 需要扩展 Cypress 功能时使用 |
| CI | 需要在 CI 中运行时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：电商购物流程测试

**任务描述：** 为电商网站编写完整的购物流程 E2E 测试。

**要求：**
1. 测试用户登录流程
2. 测试商品搜索和筛选
3. 测试添加购物车
4. 测试结账流程
5. 测试订单确认

**输出：** 完整的测试文件，覆盖主要购物流程，包含自定义命令封装。
