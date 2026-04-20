# JavaScript 基础 三层深度学习教程

## [总览] 技术总览

JavaScript 是一门动态类型的脚本语言，是 Web 开发的核心语言。它可以在浏览器中运行，也可以通过 Node.js 在服务器端运行。JavaScript 支持事件驱动、函数式和面向对象编程范式。

本教程采用三层漏斗学习法：**核心层**聚焦变量与作用域、函数、数组操作三大基石；**重点层**深入 Promise 异步编程和 DOM 操作；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 JavaScript 编程 **50% 以上** 的常见任务。

### 1. 变量与作用域

#### [概念] 概念解释

变量是存储数据的容器。JavaScript 有三种声明变量的方式：var、let 和 const。作用域决定了变量的可访问范围，理解作用域是避免 bug 的关键。

#### [语法] 核心语法 / 命令 / API

**变量声明：**

| 关键字 | 作用域 | 重新赋值 | 变量提升 |
|--------|--------|----------|----------|
| var | 函数作用域 | 可以 | 可以 |
| let | 块级作用域 | 可以 | 不可以 |
| const | 块级作用域 | 不可以 | 不可以 |

**数据类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| Number | 数字 | 42, 3.14 |
| String | 字符串 | "hello" |
| Boolean | 布尔值 | true, false |
| Null | 空值 | null |
| Undefined | 未定义 | undefined |
| Object | 对象 | {name: "Alice"} |
| Array | 数组 | [1, 2, 3] |
| Symbol | 符号 | Symbol("id") |

#### [代码] 代码示例

```javascript
// 变量声明
var oldStyle = "function scoped";
let modern = "block scoped";
const constant = "cannot be reassigned";

// 作用域示例
function scopeDemo() {
    if (true) {
        var varVariable = "I'm function scoped";
        let letVariable = "I'm block scoped";
        const constVariable = "I'm also block scoped";
    }
    
    console.log(varVariable);
    // console.log(letVariable);
    // console.log(constVariable);
}

// 块级作用域
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log("let:", i), 100);
}

for (var j = 0; j < 3; j++) {
    setTimeout(() => console.log("var:", j), 100);
}

// 数据类型
const num = 42;
const float = 3.14;
const string = "Hello, World!";
const bool = true;
const empty = null;
let notDefined;
const obj = { name: "Alice", age: 25 };
const arr = [1, 2, 3, 4, 5];

// 类型检查
console.log(typeof num);
console.log(typeof string);
console.log(typeof bool);
console.log(typeof obj);
console.log(typeof arr);
console.log(typeof null);
console.log(typeof notDefined);

// 类型转换
const strNum = "42";
console.log(Number(strNum));
console.log(parseInt(strNum));
console.log(parseFloat("3.14"));
console.log(String(42));
console.log(Boolean(1));
console.log(Boolean(0));
console.log(Boolean(""));
console.log(Boolean("text"));

// 模板字符串
const name = "Alice";
const age = 25;
const greeting = `Hello, ${name}! You are ${age} years old.`;
console.log(greeting);

const multiline = `
This is a
multiline
string.
`;
console.log(multiline);

// 解构赋值
const person = { name: "Bob", age: 30, city: "NYC" };
const { name: personName, age: personAge } = person;
console.log(personName, personAge);

const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log(first, second, rest);

// 默认参数
function greet(name = "Guest", greeting = "Hello") {
    return `${greeting}, ${name}!`;
}
console.log(greet());
console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));

// 展开运算符
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined);

const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };
console.log(merged);

// 实际应用：配置合并
const defaultConfig = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};

const userConfig = {
    timeout: 10000,
    debug: true
};

const config = { ...defaultConfig, ...userConfig };
console.log(config);
```

#### [场景] 典型应用场景

1. 存储用户输入：使用变量保存表单数据
2. 配置管理：使用 const 定义不变的配置
3. 数据处理：使用解构和展开运算符处理复杂数据

### 2. 函数

#### [概念] 概念解释

函数是可重复使用的代码块。JavaScript 函数是一等公民，可以作为参数传递、作为返回值、赋值给变量。箭头函数提供了更简洁的语法。

#### [语法] 核心语法 / 命令 / API

**函数定义方式：**

| 方式 | 语法 | 特点 |
|------|------|------|
| 函数声明 | function name() {} | 提升 |
| 函数表达式 | const fn = function() {} | 不提升 |
| 箭头函数 | const fn = () => {} | 无 this |

#### [代码] 代码示例

```javascript
// 函数声明
function add(a, b) {
    return a + b;
}

// 函数表达式
const subtract = function(a, b) {
    return a - b;
};

// 箭头函数
const multiply = (a, b) => a * b;

const divide = (a, b) => {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
};

// 单参数箭头函数
const square = x => x * x;

// 无参数箭头函数
const getRandom = () => Math.random();

// 高阶函数
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log(double(5));
console.log(triple(5));

// 函数作为参数
const numbers = [1, 2, 3, 4, 5];

function processArray(arr, processor) {
    const result = [];
    for (const item of arr) {
        result.push(processor(item));
    }
    return result;
}

const squared = processArray(numbers, x => x * x);
console.log(squared);

// 回调函数
function fetchData(url, onSuccess, onError) {
    setTimeout(() => {
        if (url) {
            onSuccess({ data: "Success" });
        } else {
            onError(new Error("Invalid URL"));
        }
    }, 1000);
}

fetchData(
    "https://api.example.com",
    data => console.log("Success:", data),
    error => console.error("Error:", error)
);

// 立即执行函数表达式 (IIFE)
(function() {
    const privateVar = "I'm private";
    console.log(privateVar);
})();

const result = ((a, b) => a + b)(3, 4);
console.log(result);

// 闭包
function createCounter() {
    let count = 0;
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.getCount());

// this 绑定
const obj = {
    name: "Alice",
    greet: function() {
        console.log(`Hello, ${this.name}`);
    },
    greetArrow: () => {
        console.log(`Hello, ${this.name}`);
    }
};

obj.greet();
obj.greetArrow();

// call, apply, bind
function introduce(greeting, punctuation) {
    console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person1 = { name: "Alice" };
const person2 = { name: "Bob" };

introduce.call(person1, "Hi", "!");
introduce.apply(person2, ["Hello", "?"]);

const boundIntroduce = introduce.bind(person1);
boundIntroduce("Hey", ".");

// rest 参数
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}
console.log(sum(1, 2, 3, 4, 5));

// 实际应用：防抖函数
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedSearch = debounce(query => {
    console.log("Searching for:", query);
}, 300);

debouncedSearch("a");
debouncedSearch("ab");
debouncedSearch("abc");
```

#### [场景] 典型应用场景

1. 事件处理：响应用户交互
2. 数据转换：封装数据处理逻辑
3. API 调用：封装网络请求

### 3. 数组操作

#### [概念] 概念解释

数组是有序的数据集合。JavaScript 提供了丰富的数组方法，掌握这些方法可以高效地处理数据。

#### [语法] 核心语法 / 命令 / API

**常用数组方法：**

| 方法 | 说明 | 返回值 |
|------|------|--------|
| map | 映射 | 新数组 |
| filter | 过滤 | 新数组 |
| reduce | 归约 | 单个值 |
| find | 查找 | 元素 |
| some | 存在检查 | 布尔值 |
| every | 全部检查 | 布尔值 |
| forEach | 遍历 | undefined |

#### [代码] 代码示例

```javascript
const numbers = [1, 2, 3, 4, 5];
const users = [
    { id: 1, name: "Alice", age: 25, city: "Beijing" },
    { id: 2, name: "Bob", age: 30, city: "Shanghai" },
    { id: 3, name: "Charlie", age: 35, city: "Beijing" },
    { id: 4, name: "Diana", age: 28, city: "Guangzhou" }
];

// map - 映射
const doubled = numbers.map(n => n * 2);
console.log(doubled);

const names = users.map(user => user.name);
console.log(names);

const userSummaries = users.map(user => ({
    ...user,
    isAdult: user.age >= 18,
    nameLength: user.name.length
}));
console.log(userSummaries);

// filter - 过滤
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);

const beijingUsers = users.filter(user => user.city === "Beijing");
console.log(beijingUsers);

const adults = users.filter(user => user.age >= 30);
console.log(adults);

// reduce - 归约
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum);

const product = numbers.reduce((acc, n) => acc * n, 1);
console.log(product);

const totalAge = users.reduce((acc, user) => acc + user.age, 0);
console.log(totalAge);

const usersByCity = users.reduce((acc, user) => {
    if (!acc[user.city]) {
        acc[user.city] = [];
    }
    acc[user.city].push(user);
    return acc;
}, {});
console.log(usersByCity);

// find - 查找
const found = users.find(user => user.id === 2);
console.log(found);

const firstBeijing = users.find(user => user.city === "Beijing");
console.log(firstBeijing);

// findIndex - 查找索引
const index = users.findIndex(user => user.name === "Bob");
console.log(index);

// some - 存在检查
const hasBeijing = users.some(user => user.city === "Beijing");
console.log(hasBeijing);

const hasMinor = users.some(user => user.age < 18);
console.log(hasMinor);

// every - 全部检查
const allAdults = users.every(user => user.age >= 18);
console.log(allAdults);

const allHaveNames = users.every(user => user.name.length > 0);
console.log(allHaveNames);

// forEach - 遍历
users.forEach(user => {
    console.log(`${user.name} is ${user.age} years old`);
});

// includes - 包含检查
console.log(numbers.includes(3));
console.log(numbers.includes(6));

// indexOf / lastIndexOf
console.log(numbers.indexOf(3));
console.log(numbers.lastIndexOf(3));

// sort - 排序
const sorted = [...numbers].sort((a, b) => b - a);
console.log(sorted);

const sortedUsers = [...users].sort((a, b) => a.age - b.age);
console.log(sortedUsers);

// reverse - 反转
const reversed = [...numbers].reverse();
console.log(reversed);

// slice - 切片
console.log(numbers.slice(1, 3));
console.log(numbers.slice(-2));

// splice - 删除/插入
const arr = [1, 2, 3, 4, 5];
arr.splice(2, 1);
console.log(arr);

arr.splice(2, 0, 3);
console.log(arr);

// flat - 扁平化
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat());
console.log(nested.flat(2));

// 实际应用：数据处理管道
const processedUsers = users
    .filter(user => user.age >= 25)
    .map(user => ({ ...user, ageGroup: user.age >= 30 ? "senior" : "junior" }))
    .sort((a, b) => a.name.localeCompare(b.name));

console.log(processedUsers);

// 实际应用：统计
const stats = {
    count: users.length,
    avgAge: users.reduce((sum, u) => sum + u.age, 0) / users.length,
    cities: [...new Set(users.map(u => u.city))],
    ageGroups: users.reduce((acc, u) => {
        const group = u.age >= 30 ? "senior" : "junior";
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {})
};

console.log(stats);
```

#### [场景] 典型应用场景

1. 数据转换：将 API 数据转换为 UI 需要的格式
2. 数据过滤：根据条件筛选数据
3. 数据统计：计算总数、平均值等

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的异步编程能力和 DOM 操作能力将显著提升。

### 1. Promise 异步编程

#### [概念] 概念与解决的问题

JavaScript 是单线程的，异步编程允许在不阻塞主线程的情况下执行耗时操作。Promise 提供了一种优雅的方式来处理异步操作的结果。

#### [语法] 核心用法

**Promise 状态：**

| 状态 | 说明 |
|------|------|
| pending | 进行中 |
| fulfilled | 已完成 |
| rejected | 已拒绝 |

#### [代码] 代码示例

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve("Operation succeeded");
        } else {
            reject(new Error("Operation failed"));
        }
    }, 1000);
});

promise
    .then(result => {
        console.log("Success:", result);
        return result.toUpperCase();
    })
    .then(upperResult => {
        console.log("Uppercase:", upperResult);
    })
    .catch(error => {
        console.error("Error:", error.message);
    })
    .finally(() => {
        console.log("Cleanup");
    });

// Promise 静态方法
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 1000));

Promise.all([p1, p2, p3])
    .then(results => console.log("All:", results));

Promise.race([p1, p2, p3])
    .then(result => console.log("Race:", result));

Promise.allSettled([p1, Promise.reject("error"), p3])
    .then(results => console.log("Settled:", results));

// async/await
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

async function fetchUsers() {
    const ids = [1, 2, 3];
    const users = await Promise.all(ids.map(id => fetchUser(id)));
    return users;
}

// 并行执行
async function parallel() {
    const [users, posts, comments] = await Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/posts").then(r => r.json()),
        fetch("/api/comments").then(r => r.json())
    ]);
    return { users, posts, comments };
}

// 顺序执行
async function sequential() {
    const user = await fetchUser(1);
    const posts = await fetch(`/api/users/${user.id}/posts`).then(r => r.json());
    const comments = await fetch(`/api/posts/${posts[0].id}/comments`).then(r => r.json());
    return { user, posts, comments };
}

// 实际应用：带重试的请求
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 实际应用：请求取消
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
            throw new Error("Request timeout");
        }
        throw error;
    }
}
```

#### [关联] 与核心层的关联

Promise 与函数紧密相关，用于处理异步函数的结果，是现代 JavaScript 异步编程的基础。

### 2. DOM 操作

#### [概念] 概念与解决的问题

DOM（Document Object Model）是网页的编程接口。通过 DOM 操作，JavaScript 可以动态地修改网页内容、结构和样式。

#### [语法] 核心用法

**常用 DOM 方法：**

| 方法 | 说明 |
|------|------|
| querySelector | 选择单个元素 |
| querySelectorAll | 选择多个元素 |
| getElementById | 通过 ID 选择 |
| createElement | 创建元素 |
| appendChild | 添加子元素 |
| removeChild | 删除子元素 |

#### [代码] 代码示例

```javascript
// 选择元素
const title = document.querySelector("h1");
const items = document.querySelectorAll(".item");
const form = document.getElementById("myForm");
const buttons = document.getElementsByClassName("btn");

// 修改内容
title.textContent = "New Title";
title.innerHTML = "<strong>Bold Title</strong>";

// 修改属性
const link = document.querySelector("a");
link.setAttribute("href", "https://example.com");
link.getAttribute("href");
link.removeAttribute("target");

// 修改样式
title.style.color = "blue";
title.style.fontSize = "24px";
title.classList.add("highlight");
title.classList.remove("highlight");
title.classList.toggle("active");
title.classList.contains("active");

// 创建元素
const newDiv = document.createElement("div");
newDiv.className = "card";
newDiv.textContent = "New Card";
newDiv.innerHTML = `
    <h3>Card Title</h3>
    <p>Card content</p>
`;

// 插入元素
const container = document.querySelector(".container");
container.appendChild(newDiv);
container.insertBefore(newDiv, container.firstChild);

const fragment = document.createDocumentFragment();
for (let i = 0; i < 5; i++) {
    const li = document.createElement("li");
    li.textContent = `Item ${i + 1}`;
    fragment.appendChild(li);
}
container.appendChild(fragment);

// 删除元素
const oldElement = document.querySelector(".old");
oldElement.remove();
container.removeChild(oldElement);

// 事件处理
const button = document.querySelector("button");

button.addEventListener("click", function(e) {
    console.log("Button clicked");
    console.log("Event:", e);
    console.log("Target:", e.target);
});

button.addEventListener("click", e => {
    console.log("Arrow function handler");
});

// 事件委托
const list = document.querySelector("ul");
list.addEventListener("click", e => {
    if (e.target.tagName === "LI") {
        console.log("Clicked:", e.target.textContent);
    }
});

// 移除事件监听
function handleClick(e) {
    console.log("Clicked");
}

button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);

// 表单处理
form.addEventListener("submit", e => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log("Form data:", data);
    
    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;
    
    console.log({ name, email });
});

// 输入验证
const emailInput = document.querySelector('input[type="email"]');
emailInput.addEventListener("input", e => {
    const value = e.target.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    if (isValid) {
        e.target.classList.remove("invalid");
        e.target.classList.add("valid");
    } else {
        e.target.classList.remove("valid");
        e.target.classList.add("invalid");
    }
});

// 动态列表
function renderList(items) {
    const list = document.querySelector("#item-list");
    list.innerHTML = items.map(item => `
        <li data-id="${item.id}">
            <span class="name">${item.name}</span>
            <button class="delete">Delete</button>
        </li>
    `).join("");
}

list.addEventListener("click", e => {
    if (e.target.classList.contains("delete")) {
        const li = e.target.closest("li");
        const id = li.dataset.id;
        deleteItem(id);
        li.remove();
    }
});

// 实际应用：Todo 列表
class TodoApp {
    constructor() {
        this.todos = [];
        this.form = document.querySelector("#todo-form");
        this.input = document.querySelector("#todo-input");
        this.list = document.querySelector("#todo-list");
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.form.addEventListener("submit", e => {
            e.preventDefault();
            this.addTodo(this.input.value);
            this.input.value = "";
        });
        
        this.list.addEventListener("click", e => {
            const li = e.target.closest("li");
            const id = parseInt(li.dataset.id);
            
            if (e.target.classList.contains("toggle")) {
                this.toggleTodo(id);
            } else if (e.target.classList.contains("delete")) {
                this.deleteTodo(id);
            }
        });
    }
    
    addTodo(text) {
        const todo = {
            id: Date.now(),
            text,
            completed: false
        };
        this.todos.push(todo);
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.render();
    }
    
    render() {
        this.list.innerHTML = this.todos.map(todo => `
            <li data-id="${todo.id}" class="${todo.completed ? "completed" : ""}">
                <input type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}>
                <span>${todo.text}</span>
                <button class="delete">Delete</button>
            </li>
        `).join("");
    }
}

const app = new TodoApp();
```

#### [关联] 与核心层的关联

DOM 操作是 JavaScript 在浏览器中的核心应用，结合事件处理实现用户交互。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 原型链 | 需要理解 JavaScript 继承机制 |
| 闭包 | 需要创建私有变量或函数工厂 |
| Event Loop | 需要理解异步执行顺序 |
| 模块化 | 需要组织大型项目代码 |
| ES6+ 特性 | 需要使用现代 JavaScript 语法 |
| 正则表达式 | 需要复杂的字符串匹配 |
| 错误处理 | 需要优雅地处理异常 |
| 内存管理 | 需要优化内存使用 |
| 性能优化 | 需要提高代码执行效率 |
| 单元测试 | 需要测试代码正确性 |
| TypeScript | 需要静态类型检查 |
| Node.js | 需要在服务端运行 JavaScript |
| npm/yarn | 需要管理项目依赖 |
| Babel | 需要转译新语法兼容旧浏览器 |
| Webpack | 需要打包前端资源 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个动态表单验证器

**任务描述：**

创建一个表单验证器，支持：
1. 实时验证用户输入
2. 显示错误提示
3. 表单提交验证
4. 自定义验证规则

**要求：**
- 使用 DOM 操作
- 使用事件委托
- 使用 Promise 处理异步验证

**参考实现：**

```javascript
class FormValidator {
    constructor(form, rules) {
        this.form = form;
        this.rules = rules;
        this.errors = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener("submit", e => this.handleSubmit(e));
        
        Object.keys(this.rules).forEach(fieldName => {
            const input = this.form.querySelector(`[name="${fieldName}"]`);
            if (input) {
                input.addEventListener("blur", () => this.validateField(fieldName));
                input.addEventListener("input", () => this.clearError(fieldName));
            }
        });
    }
    
    async validateField(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        const value = input.value.trim();
        const rules = this.rules[fieldName];
        
        for (const rule of rules) {
            const result = await rule.validate(value);
            if (!result.valid) {
                this.showError(fieldName, result.message);
                return false;
            }
        }
        
        this.clearError(fieldName);
        return true;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        let isValid = true;
        for (const fieldName of Object.keys(this.rules)) {
            const fieldValid = await this.validateField(fieldName);
            if (!fieldValid) {
                isValid = false;
            }
        }
        
        if (isValid) {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            console.log("Form submitted:", data);
            this.form.dispatchEvent(new CustomEvent("validSubmit", { detail: data }));
        }
    }
    
    showError(fieldName, message) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        input.classList.add("error");
        
        let errorEl = input.parentNode.querySelector(".error-message");
        if (!errorEl) {
            errorEl = document.createElement("span");
            errorEl.className = "error-message";
            input.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
    
    clearError(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        input.classList.remove("error");
        
        const errorEl = input.parentNode.querySelector(".error-message");
        if (errorEl) {
            errorEl.remove();
        }
    }
}

const validationRules = {
    username: [
        { validate: v => ({ valid: v.length >= 3, message: "用户名至少3个字符" }) },
        { validate: v => ({ valid: /^[a-zA-Z0-9_]+$/.test(v), message: "只能包含字母、数字和下划线" }) }
    ],
    email: [
        { validate: v => ({ valid: v.length > 0, message: "邮箱不能为空" }) },
        { validate: v => ({ valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "邮箱格式不正确" }) }
    ],
    password: [
        { validate: v => ({ valid: v.length >= 8, message: "密码至少8个字符" }) },
        { validate: v => ({ valid: /[A-Z]/.test(v), message: "密码需要包含大写字母" }) },
        { validate: v => ({ valid: /[0-9]/.test(v), message: "密码需要包含数字" }) }
    ]
};

const form = document.querySelector("#register-form");
const validator = new FormValidator(form, validationRules);

form.addEventListener("validSubmit", e => {
    console.log("Submitting:", e.detail);
});
```
