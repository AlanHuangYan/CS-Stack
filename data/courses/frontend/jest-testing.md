# Jest 单元测试 三层深度学习教程

## [总览] 技术总览

Jest 是 Facebook 开发的 JavaScript 测试框架，专注于简洁和性能。它内置断言库、Mock 功能、代码覆盖率报告，开箱即用，是 React 项目的默认测试工具。

本教程采用三层漏斗学习法：**核心层**聚焦测试基础、断言匹配器、Mock 函数三大基石，掌握后即可完成 50% 以上的单元测试任务；**重点层**深入异步测试和快照测试，提升测试覆盖能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 测试基础

#### [概念] 概念解释

单元测试是对最小可测试单元（函数、组件）进行验证。Jest 使用 `test` 或 `it` 定义测试用例，`describe` 组织测试套件，`expect` 进行断言。

为什么归为核心层？测试是代码质量的保障，不理解测试基础就无法编写可靠的代码。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 示例 |
|------|------|------|
| `describe` | 测试套件 | `describe('Math', () => {})` |
| `test/it` | 测试用例 | `test('adds 1 + 1', () => {})` |
| `expect` | 断言 | `expect(1 + 1).toBe(2)` |
| `beforeEach` | 每个测试前执行 | 初始化数据 |

#### [代码] 代码示例

```javascript
// math.js - 被测试的模块
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

export function multiply(a, b) {
  return a * b
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero')
  }
  return a / b
}

export function isEven(n) {
  return n % 2 === 0
}

export function factorial(n) {
  if (n < 0) return undefined
  if (n === 0) return 1
  return n * factorial(n - 1)
}
```

```javascript
// math.test.js - 测试文件
import { add, subtract, multiply, divide, isEven, factorial } from './math'

describe('Math functions', () => {
  
  describe('add', () => {
    test('adds two positive numbers', () => {
      expect(add(1, 2)).toBe(3)
    })
    
    test('adds negative numbers', () => {
      expect(add(-1, -2)).toBe(-3)
    })
    
    test('adds zero', () => {
      expect(add(5, 0)).toBe(5)
    })
  })
  
  describe('subtract', () => {
    test('subtracts two numbers', () => {
      expect(subtract(5, 3)).toBe(2)
    })
    
    test('handles negative result', () => {
      expect(subtract(3, 5)).toBe(-2)
    })
  })
  
  describe('multiply', () => {
    test('multiplies two numbers', () => {
      expect(multiply(3, 4)).toBe(12)
    })
    
    test('handles zero', () => {
      expect(multiply(5, 0)).toBe(0)
    })
  })
  
  describe('divide', () => {
    test('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5)
    })
    
    test('throws error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
    })
  })
  
  describe('isEven', () => {
    test('returns true for even numbers', () => {
      expect(isEven(2)).toBe(true)
      expect(isEven(0)).toBe(true)
      expect(isEven(-4)).toBe(true)
    })
    
    test('returns false for odd numbers', () => {
      expect(isEven(1)).toBe(false)
      expect(isEven(3)).toBe(false)
      expect(isEven(-1)).toBe(false)
    })
  })
  
  describe('factorial', () => {
    test('calculates factorial of positive numbers', () => {
      expect(factorial(0)).toBe(1)
      expect(factorial(1)).toBe(1)
      expect(factorial(5)).toBe(120)
    })
    
    test('returns undefined for negative numbers', () => {
      expect(factorial(-1)).toBeUndefined()
    })
  })
})
```

```javascript
// jest.config.js - Jest 配置
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 测试文件匹配
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.js',
    '!src/index.js'
  ],
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

#### [场景] 典型应用场景

1. **工具函数测试** — 纯函数的输入输出验证
2. **组件测试** — React/Vue 组件渲染测试
3. **API 测试** — 接口请求响应测试

---

### 2. 断言匹配器

#### [概念] 概念解释

匹配器（Matchers）用于验证值是否符合预期。Jest 提供了丰富的匹配器，如 `toBe`、`toEqual`、`toContain`、`toThrow` 等。

为什么归为核心层？断言是测试的核心，不理解匹配器就无法正确表达预期结果。

#### [语法] 核心语法 / 命令 / API

| 匹配器 | 用途 | 示例 |
|------|------|------|
| `toBe` | 严格相等 | `expect(1).toBe(1)` |
| `toEqual` | 深度相等 | `expect({a: 1}).toEqual({a: 1})` |
| `toContain` | 包含元素 | `expect([1, 2]).toContain(1)` |
| `toThrow` | 抛出错误 | `expect(fn).toThrow()` |
| `resolves/rejects` | Promise 结果 | `expect(p).resolves.toBe(1)` |

#### [代码] 代码示例

```javascript
// matchers.test.js - 匹配器示例
describe('Jest Matchers', () => {
  
  // 相等性
  test('toBe for primitives', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect(true).toBe(true)
  })
  
  test('toEqual for objects/arrays', () => {
    expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 })
    expect([1, 2, 3]).toEqual([1, 2, 3])
  })
  
  // 真值判断
  test('truthiness', () => {
    expect(true).toBeTruthy()
    expect(false).toBeFalsy()
    expect(null).toBeNull()
    expect(undefined).toBeUndefined()
    expect(1).toBeDefined()
  })
  
  // 数字比较
  test('numbers', () => {
    expect(10).toBeGreaterThan(5)
    expect(5).toBeLessThan(10)
    expect(0.1 + 0.2).toBeCloseTo(0.3)  // 浮点数
  })
  
  // 字符串匹配
  test('strings', () => {
    expect('Hello World').toMatch(/Hello/)
    expect('Hello World').toContain('World')
  })
  
  // 数组/集合
  test('arrays', () => {
    expect([1, 2, 3]).toContain(2)
    expect([1, 2, 3]).toHaveLength(3)
    expect(new Set([1, 2])).toContain(1)
  })
  
  // 对象属性
  test('objects', () => {
    expect({ name: 'John', age: 30 }).toHaveProperty('name')
    expect({ name: 'John', age: 30 }).toHaveProperty('age', 30)
  })
  
  // 异常
  test('exceptions', () => {
    const throwError = () => { throw new Error('Oops') }
    expect(throwError).toThrow()
    expect(throwError).toThrow('Oops')
    expect(throwError).toThrow(Error)
  })
  
  // 取反
  test('not', () => {
    expect(1).not.toBe(2)
    expect([1, 2, 3]).not.toContain(4)
  })
})
```

```javascript
// user.test.js - 实际应用示例
class User {
  constructor(name, email) {
    this.name = name
    this.email = email
    this.posts = []
  }
  
  addPost(post) {
    if (!post.title || !post.content) {
      throw new Error('Post must have title and content')
    }
    this.posts.push(post)
  }
  
  getPostCount() {
    return this.posts.length
  }
  
  isAdmin() {
    return this.email.endsWith('@admin.com')
  }
}

describe('User class', () => {
  let user
  
  beforeEach(() => {
    user = new User('John', 'john@example.com')
  })
  
  test('creates user with correct properties', () => {
    expect(user).toEqual({
      name: 'John',
      email: 'john@example.com',
      posts: []
    })
  })
  
  test('adds valid post', () => {
    user.addPost({ title: 'Hello', content: 'World' })
    expect(user.posts).toHaveLength(1)
    expect(user.posts[0]).toEqual({ title: 'Hello', content: 'World' })
  })
  
  test('throws error for invalid post', () => {
    expect(() => user.addPost({ title: 'Hello' })).toThrow()
    expect(() => user.addPost({})).toThrow('Post must have title and content')
  })
  
  test('returns correct post count', () => {
    expect(user.getPostCount()).toBe(0)
    user.addPost({ title: 'A', content: 'B' })
    expect(user.getPostCount()).toBe(1)
  })
  
  test('checks admin status', () => {
    expect(user.isAdmin()).toBe(false)
    
    const admin = new User('Admin', 'admin@admin.com')
    expect(admin.isAdmin()).toBe(true)
  })
})
```

#### [场景] 典型应用场景

1. **值验证** — 验证函数返回值
2. **状态验证** — 验证对象状态变化
3. **异常验证** — 验证错误抛出

---

### 3. Mock 函数

#### [概念] 概念解释

Mock 函数是测试中替代真实函数的模拟实现。用于隔离测试单元、模拟外部依赖、验证函数调用。Jest 提供 `jest.fn()` 创建 Mock 函数。

为什么归为核心层？现代应用依赖外部 API、数据库等，不使用 Mock 无法进行单元测试。

#### [语法] 核心语法 / 命令 / API

| API | 用途 | 示例 |
|------|------|------|
| `jest.fn()` | 创建 Mock 函数 | `const mock = jest.fn()` |
| `mockReturnValue` | 设置返回值 | `mock.mockReturnValue(1)` |
| `mockImplementation` | 设置实现 | `mock.mockImplementation(x => x * 2)` |
| `toHaveBeenCalledWith` | 验证调用 | `expect(mock).toHaveBeenCalledWith(1)` |

#### [代码] 代码示例

```javascript
// mock.test.js - Mock 函数示例

// 被测试的模块
const userService = {
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn()
}

// 使用 Mock 的函数
function greetUser(userId) {
  const user = userService.getUser(userId)
  if (!user) {
    return 'User not found'
  }
  return `Hello, ${user.name}!`
}

describe('Mock functions', () => {
  
  beforeEach(() => {
    // 清除所有 Mock
    jest.clearAllMocks()
  })
  
  test('mock return value', () => {
    const mock = jest.fn()
    mock.mockReturnValue(42)
    
    expect(mock()).toBe(42)
  })
  
  test('mock implementation', () => {
    const mock = jest.fn(x => x * 2)
    
    expect(mock(5)).toBe(10)
    expect(mock).toHaveBeenCalledWith(5)
  })
  
  test('mock resolved value (async)', async () => {
    const mock = jest.fn()
    mock.mockResolvedValue({ name: 'John' })
    
    const result = await mock()
    expect(result).toEqual({ name: 'John' })
  })
  
  test('track calls', () => {
    const mock = jest.fn()
    
    mock('first')
    mock('second')
    
    expect(mock).toHaveBeenCalledTimes(2)
    expect(mock).toHaveBeenNthCalledWith(1, 'first')
    expect(mock).toHaveBeenNthCalledWith(2, 'second')
  })
  
  test('mock module method', () => {
    userService.getUser.mockReturnValue({ id: 1, name: 'John' })
    
    const result = greetUser(1)
    
    expect(result).toBe('Hello, John!')
    expect(userService.getUser).toHaveBeenCalledWith(1)
  })
  
  test('mock module with no return', () => {
    userService.getUser.mockReturnValue(null)
    
    const result = greetUser(1)
    
    expect(result).toBe('User not found')
  })
})
```

```javascript
// api.test.js - Mock fetch 示例
global.fetch = jest.fn()

describe('API calls', () => {
  
  beforeEach(() => {
    fetch.mockClear()
  })
  
  test('fetches user data', async () => {
    const mockUser = { id: 1, name: 'John' }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })
    
    const response = await fetch('/api/users/1')
    const user = await response.json()
    
    expect(user).toEqual(mockUser)
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })
  
  test('handles fetch error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    })
    
    const response = await fetch('/api/users/999')
    
    expect(response.ok).toBe(false)
    expect(response.status).toBe(404)
  })
})
```

#### [场景] 典型应用场景

1. **API Mock** — 模拟网络请求
2. **数据库 Mock** — 模拟数据库操作
3. **回调验证** — 验证回调函数调用

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 异步测试

#### [概念] 概念与解决的问题

异步代码测试需要等待 Promise 完成或定时器触发。Jest 提供多种方式处理异步测试：async/await、resolves/rejects、done 回调。

解决的核心痛点：**异步时机**。测试在异步操作完成前结束会导致错误结果。

#### [语法] 核心用法

```javascript
// async/await
test('async', async () => {
  const data = await fetchData()
  expect(data).toBe('result')
})

// resolves/rejects
test('promise', () => {
  return expect(fetchData()).resolves.toBe('result')
})
```

#### [代码] 代码示例

```javascript
// async.test.js - 异步测试示例

// 模拟异步函数
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: `User ${id}` })
      } else {
        reject(new Error('Invalid ID'))
      }
    }, 100)
  })
}

describe('Async tests', () => {
  
  // 方式1：async/await（推荐）
  test('fetches user with async/await', async () => {
    const user = await fetchUser(1)
    expect(user).toEqual({ id: 1, name: 'User 1' })
  })
  
  // 方式2：resolves/rejects
  test('fetches user with resolves', () => {
    return expect(fetchUser(1)).resolves.toEqual({ id: 1, name: 'User 1' })
  })
  
  test('rejects invalid ID', () => {
    return expect(fetchUser(-1)).rejects.toThrow('Invalid ID')
  })
  
  // 方式3：结合 async/await 和 resolves
  test('combines async and resolves', async () => {
    await expect(fetchUser(1)).resolves.toMatchObject({ id: 1 })
  })
  
  // 测试多个异步操作
  test('multiple async operations', async () => {
    const [user1, user2] = await Promise.all([
      fetchUser(1),
      fetchUser(2)
    ])
    
    expect(user1.id).toBe(1)
    expect(user2.id).toBe(2)
  })
})

// 定时器测试
describe('Timer tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  test('calls callback after delay', () => {
    const callback = jest.fn()
    
    setTimeout(callback, 1000)
    
    // 快进时间
    jest.advanceTimersByTime(1000)
    
    expect(callback).toHaveBeenCalled()
  })
  
  test('calls callback at intervals', () => {
    const callback = jest.fn()
    
    setInterval(callback, 100)
    
    jest.advanceTimersByTime(350)
    
    expect(callback).toHaveBeenCalledTimes(3)
  })
})
```

#### [关联] 与核心层的关联

异步测试扩展了 Mock 函数的能力，可以测试 Promise、定时器等异步场景。

---

### 2. 快照测试

#### [概念] 概念与解决的问题

快照测试将组件渲染结果保存为快照文件，后续测试对比当前渲染与快照是否一致。适合 UI 组件测试，确保 UI 不会意外变化。

解决的核心痛点：**UI 回归测试**。手动检查 UI 变化耗时且容易遗漏，快照测试自动检测变化。

#### [语法] 核心用法

```javascript
test('renders correctly', () => {
  const { container } = render(<Button />)
  expect(container).toMatchSnapshot()
})
```

#### [代码] 代码示例

```javascript
// Button.test.js - React 组件快照测试
import { render } from '@testing-library/react'
import Button from './Button'

describe('Button component', () => {
  
  test('renders primary button', () => {
    const { container } = render(<Button variant="primary">Click me</Button>)
    expect(container).toMatchSnapshot()
  })
  
  test('renders disabled button', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    expect(container).toMatchSnapshot()
  })
  
  test('renders button with icon', () => {
    const { container } = render(
      <Button>
        <span className="icon">+</span>
        Add
      </Button>
    )
    expect(container).toMatchSnapshot()
  })
})

// 行内快照（使用 prettier 格式化）
test('inline snapshot', () => {
  const data = { name: 'John', age: 30 }
  expect(data).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "John"
    }
  `)
})
```

```javascript
// __snapshots__/Button.test.js.snap - 自动生成的快照文件
exports[`Button component renders primary button 1`] = `
<div>
  <button
    class="btn btn-primary"
  >
    Click me
  </button>
</div>
`;

exports[`Button component renders disabled button 1`] = `
<div>
  <button
    class="btn"
    disabled=""
  >
    Disabled
  </button>
</div>
`;
```

#### [关联] 与核心层的关联

快照测试是测试基础的扩展，专门用于 UI 组件的回归测试。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| jest.mock | 需要模拟整个模块时使用 |
| jest.spyOn | 需要监听函数调用时使用 |
| jest.fn | 需要创建 Mock 函数时使用 |
| Coverage | 需要代码覆盖率报告时使用 |
| Snapshot | 需要 UI 快照测试时使用 |
| React Testing Library | 需要 React 组件测试时使用 |
| Vue Test Utils | 需要 Vue 组件测试时使用 |
| jest-dom | 需要 DOM 相关匹配器时使用 |
| setupFiles | 需要全局设置时使用 |
| testEnvironment | 需要切换测试环境时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：工具函数库测试

**任务描述：** 为一个工具函数库编写完整的单元测试。

**要求：**
1. 创建 5 个工具函数（如日期格式化、数组去重、深拷贝等）
2. 为每个函数编写至少 3 个测试用例
3. 使用 describe 组织测试套件
4. 覆盖正常、边界、异常情况
5. 运行测试并生成覆盖率报告

**输出：** 完整的测试文件，覆盖率报告达到 90% 以上。
