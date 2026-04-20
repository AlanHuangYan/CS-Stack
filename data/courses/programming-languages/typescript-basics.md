# TypeScript 基础 三层深度学习教程

## [总览] 技术总览

TypeScript 是 JavaScript 的超集，添加了静态类型系统。它编译为纯 JavaScript，可以在任何浏览器和 Node.js 环境运行。TypeScript 的类型系统帮助开发者在编译时发现错误，提高代码质量和开发效率。

本教程采用三层漏斗学习法：**核心层**聚焦类型系统、接口、泛型三大基石；**重点层**深入类型推断和高级类型；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 TypeScript 开发 **50% 以上** 的常见任务。

### 1. 类型系统基础

#### [概念] 概念解释

TypeScript 的类型系统是静态的，在编译时检查类型错误。基本类型包括 number、string、boolean、null、undefined、void、any、unknown、never 等。

#### [语法] 核心语法 / 命令 / API

**基本类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| number | 数字 | let age: number = 25 |
| string | 字符串 | let name: string = "Alice" |
| boolean | 布尔值 | let active: boolean = true |
| null | 空值 | let empty: null = null |
| undefined | 未定义 | let notSet: undefined = undefined |
| void | 无返回值 | function log(): void |
| any | 任意类型 | let data: any = {} |
| unknown | 未知类型 | let value: unknown |
| never | 永不返回 | function error(): never |

#### [代码] 代码示例

```typescript
// 基本类型声明
let age: number = 25;
let name: string = "Alice";
let isActive: boolean = true;
let empty: null = null;
let notDefined: undefined = undefined;

// 数组类型
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// 元组类型
let person: [string, number] = ["Alice", 25];

// 对象类型
let user: { name: string; age: number } = {
    name: "Alice",
    age: 25
};

// 函数类型
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// 箭头函数
const add = (a: number, b: number): number => a + b;

// 可选参数
function greetUser(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

// 默认参数
function greetWithDefault(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}

// 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

// void 类型
function log(message: string): void {
    console.log(message);
}

// any 类型（避免使用）
let data: any = "hello";
data = 123;
data = { key: "value" };

// unknown 类型（推荐替代 any）
let value: unknown = "hello";
if (typeof value === "string") {
    console.log(value.toUpperCase());
}

// never 类型
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {}
}

// 类型断言
let someValue: unknown = "hello";
let length1: number = (someValue as string).length;
let length2: number = (<string>someValue).length;

// 非空断言
let element = document.getElementById("app")!;
element.textContent = "Hello";

// 联合类型
let id: string | number;
id = "abc123";
id = 123;

// 类型守卫
function processId(id: string | number): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toFixed(2);
}

// 字面量类型
let direction: "up" | "down" | "left" | "right";
direction = "up";

type Status = "pending" | "approved" | "rejected";
let status: Status = "pending";
```

#### [场景] 典型应用场景

1. 函数参数验证：确保传入正确的参数类型
2. API 响应处理：定义响应数据结构
3. 配置管理：类型安全的配置对象

### 2. 接口

#### [概念] 概念解释

接口定义了对象的形状，描述对象应该有哪些属性和方法。接口可以继承、合并，是 TypeScript 实现多态的核心机制。

#### [语法] 核心语法 / 命令 / API

**接口特性：**

| 特性 | 说明 |
|------|------|
| 可选属性 | 使用 ? 标记 |
| 只读属性 | 使用 readonly 修饰 |
| 索引签名 | 支持动态属性名 |
| 函数类型 | 定义函数签名 |
| 继承 | 使用 extends |

#### [代码] 代码示例

```typescript
// 基本接口
interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

// 可选属性
interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
}

const product: Product = {
    id: 1,
    name: "Laptop",
    price: 999.99
};

// 只读属性
interface Config {
    readonly apiUrl: string;
    readonly timeout: number;
}

const config: Config = {
    apiUrl: "https://api.example.com",
    timeout: 5000
};

// 索引签名
interface StringMap {
    [key: string]: string;
}

const headers: StringMap = {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
};

interface NumberMap {
    [key: string]: number;
}

const scores: NumberMap = {
    alice: 95,
    bob: 87
};

// 函数类型接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

const contains: SearchFunc = (source, subString) => {
    return source.includes(subString);
};

// 可索引类型
interface StringArray {
    [index: number]: string;
}

const names: StringArray = ["Alice", "Bob", "Charlie"];

// 类类型接口
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date): void;
}

class Clock implements ClockInterface {
    currentTime: Date = new Date();
    
    setTime(d: Date): void {
        this.currentTime = d;
    }
    
    constructor(h: number, m: number) {}
}

// 接口继承
interface Animal {
    name: string;
    move(): void;
}

interface Dog extends Animal {
    breed: string;
    bark(): void;
}

const dog: Dog = {
    name: "Buddy",
    breed: "Golden Retriever",
    move() {
        console.log("Moving...");
    },
    bark() {
        console.log("Woof!");
    }
};

// 多接口继承
interface CanFly {
    fly(): void;
}

interface CanSwim {
    swim(): void;
}

interface Duck extends CanFly, CanSwim {
    quack(): void;
}

// 接口合并
interface Box {
    height: number;
    width: number;
}

interface Box {
    depth: number;
}

const box: Box = {
    height: 10,
    width: 20,
    depth: 30
};

// 实际应用：API 响应
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

interface User {
    id: number;
    name: string;
}

const response: ApiResponse<User> = {
    data: { id: 1, name: "Alice" },
    status: 200,
    message: "Success"
};

// 实际应用：表单数据
interface FormData {
    username: string;
    password: string;
    rememberMe?: boolean;
}

function submitForm(data: FormData): Promise<void> {
    return fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(() => {});
}
```

#### [场景] 典型应用场景

1. API 数据结构：定义请求和响应格式
2. 组件 Props：定义 React 组件属性
3. 服务接口：定义服务层的契约

### 3. 泛型

#### [概念] 概念解释

泛型允许创建可重用的组件，可以处理多种类型而不是单一类型。通过类型变量，在函数、接口、类中实现类型参数化。

#### [语法] 核心语法 / 命令 / API

**泛型用法：**

| 用法 | 语法 |
|------|------|
| 泛型函数 | function fn<T>(arg: T): T |
| 泛型接口 | interface I<T> { value: T } |
| 泛型类 | class C<T> { value: T } |
| 泛型约束 | <T extends SomeType> |

#### [代码] 代码示例

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

const num = identity<number>(123);
const str = identity<string>("hello");
const inferred = identity("inferred");

// 泛型数组
function getFirst<T>(arr: T[]): T | undefined {
    return arr[0];
}

const firstNumber = getFirst([1, 2, 3]);
const firstString = getFirst(["a", "b", "c"]);

// 多个类型参数
function pair<K, V>(key: K, value: V): [K, V] {
    return [key, value];
}

const keyValue = pair("name", "Alice");

// 泛型接口
interface Container<T> {
    value: T;
    getValue(): T;
}

const numberContainer: Container<number> = {
    value: 42,
    getValue() {
        return this.value;
    }
};

// 泛型类
class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        this.items.push(item);
    }
    
    pop(): T | undefined {
        return this.items.pop();
    }
    
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    size(): number {
        return this.items.length;
    }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop());

// 泛型约束
interface Lengthwise {
    length: number;
}

function logLength<T extends Lengthwise>(arg: T): number {
    console.log(arg.length);
    return arg.length;
}

logLength("hello");
logLength([1, 2, 3]);
logLength({ length: 10 });

// 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const obj = { name: "Alice", age: 25 };
const name = getProperty(obj, "name");
const age = getProperty(obj, "age");

// 泛型工厂
function createArray<T>(length: number, value: T): T[] {
    return Array(length).fill(value);
}

const stringArray = createArray(3, "x");
const numberArray = createArray(3, 0);

// 泛型工具类型
interface User {
    id: number;
    name: string;
    email: string;
}

// Partial - 所有属性可选
type PartialUser = Partial<User>;
const partialUser: PartialUser = { name: "Alice" };

// Required - 所有属性必需
type RequiredUser = Required<User>;

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick - 选择部分属性
type UserName = Pick<User, "id" | "name">;

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, "email">;

// Record - 记录类型
type UserMap = Record<string, User>;
const users: UserMap = {
    alice: { id: 1, name: "Alice", email: "alice@example.com" }
};

// 实际应用：API 客户端
class ApiClient {
    async get<T>(url: string): Promise<T> {
        const response = await fetch(url);
        return response.json();
    }
    
    async post<T, D>(url: string, data: D): Promise<T> {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}

const client = new ApiClient();
const userData = await client.get<User>("/api/users/1");
await client.post<User, Partial<User>>("/api/users", { name: "Bob" });
```

#### [场景] 典型应用场景

1. 数据结构：实现通用的栈、队列、链表
2. API 客户端：类型安全的请求和响应
3. 工具函数：通用的数组、对象操作

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 TypeScript 开发能力将显著提升。

### 1. 类型推断

#### [概念] 概念与解决的问题

TypeScript 可以自动推断变量的类型，减少显式类型注解的需要。理解类型推断规则有助于编写更简洁的代码。

#### [语法] 核心用法

**推断规则：**

| 场景 | 推断结果 |
|------|----------|
| 变量初始化 | 初始值类型 |
| 函数返回值 | return 语句推断 |
| 对象字面量 | 属性类型 |
| 数组 | 元素类型的联合 |

#### [代码] 代码示例

```typescript
// 变量类型推断
let x = 10;
let y = "hello";
let z = [1, 2, 3];
let obj = { name: "Alice", age: 25 };

// 函数返回值推断
function add(a: number, b: number) {
    return a + b;
}

// 上下文类型推断
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(n => {
    console.log(n.toFixed(2));
});

// 最佳通用类型
let mixed = [1, "hello", true];
// 类型: (string | number | boolean)[]

// 类型推断与泛型
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
}

const doubled = map([1, 2, 3], n => n * 2);
const strings = map([1, 2, 3], n => n.toString());

// as const 断言
const config = {
    endpoint: "https://api.example.com",
    timeout: 5000
} as const;

// 类型变为 readonly 的字面量类型
type Config = typeof config;
```

#### [关联] 与核心层的关联

类型推断减少了显式类型注解，让代码更简洁，同时保持类型安全。

### 2. 高级类型

#### [概念] 概念与解决的问题

高级类型包括条件类型、映射类型、模板字面量类型等，用于创建复杂的类型转换和约束。

#### [语法] 核心用法

**高级类型：**

| 类型 | 语法 | 说明 |
|------|------|------|
| 条件类型 | T extends U ? X : Y | 类型条件判断 |
| 映射类型 | { [K in keyof T]: T[K] } | 类型转换 |
| 模板字面量 | `${string}` | 字符串模式 |

#### [代码] 代码示例

```typescript
// 条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;
type B = IsString<number>;

// 分布式条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type C = NonNullable<string | null | undefined>;

// infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string {
    return "Hello";
}

type GreetReturn = ReturnType<typeof greet>;

type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type GreetParams = Parameters<typeof greet>;

// 映射类型
type Readonly<T> = {
    readonly [K in keyof T]: T[K];
};

type Partial<T> = {
    [K in keyof T]?: T[K];
};

type Required<T> = {
    [K in keyof T]-?: T[K];
};

interface User {
    id: number;
    name: string;
    email?: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;

// 映射修饰符
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

type Optional<T> = {
    [K in keyof T]?: T[K];
};

// 模板字面量类型
type EventName = `on${Capitalize<string>}`;

type Events = {
    onClick: () => void;
    onMouseOver: () => void;
    onKeyDown: () => void;
};

type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface State {
    name: string;
    age: number;
}

type StateGetters = Getters<State>;

// 递归类型
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object
        ? DeepReadonly<T[K]>
        : T[K];
};

interface NestedConfig {
    api: {
        endpoint: string;
        timeout: number;
    };
    features: {
        darkMode: boolean;
    };
}

type ReadonlyConfig = DeepReadonly<NestedConfig>;

// 实际应用：类型安全的事件系统
type EventHandler<T extends string, P> = {
    type: T;
    payload: P;
};

type EventMap = {
    login: { userId: string };
    logout: {};
    purchase: { orderId: string; amount: number };
};

type Events2 = {
    [K in keyof EventMap]: EventHandler<K, EventMap[K]>;
}[keyof EventMap];

function emit<K extends keyof EventMap>(
    type: K,
    payload: EventMap[K]
): void {
    console.log(type, payload);
}

emit("login", { userId: "123" });
emit("purchase", { orderId: "ord-1", amount: 99.99 });
```

#### [关联] 与核心层的关联

高级类型是泛型和接口的扩展，用于创建更复杂的类型约束。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 装饰器 | 需要类和方法元编程 |
| 命名空间 | 需要组织大型项目代码 |
| 模块解析 | 需要配置模块导入路径 |
| 声明文件 | 需要为 JS 库添加类型 |
| 类型体操 | 需要复杂类型转换 |
| 类型守卫 | 需要运行时类型检查 |
| 可辨识联合 | 需要类型安全的状态机 |
| 索引类型 | 需要动态属性访问 |
| 条件类型 | 需要类型级别逻辑 |
| 映射类型 | 需要类型转换 |
| 模板字面量 | 需要字符串模式匹配 |
| 递归类型 | 需要深层类型定义 |
| 协变逆变 | 需要理解类型兼容性 |
| 类型收窄 | 需要精确类型判断 |
| satisfies 运算符 | 需要类型检查但保留推断 |

---

## [实战] 核心实战清单

### 实战任务 1：实现类型安全的存储系统

**任务描述：**

创建一个类型安全的本地存储系统，支持：
1. 泛型存储和读取
2. 类型安全的键名
3. 默认值处理

**要求：**
- 使用泛型实现类型安全
- 使用接口定义存储结构
- 处理存储异常

**参考实现：**

```typescript
// 定义存储键类型
type StorageKey = "user" | "token" | "theme" | "settings";

// 定义存储值类型映射
interface StorageMap {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
    theme: "light" | "dark";
    settings: {
        notifications: boolean;
        language: string;
    };
}

// 类型安全的存储类
class TypedStorage {
    private storage: Storage;
    
    constructor(storage: Storage = localStorage) {
        this.storage = storage;
    }
    
    get<K extends StorageKey>(key: K): StorageMap[K] | null {
        try {
            const value = this.storage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }
    
    getOrDefault<K extends StorageKey>(
        key: K,
        defaultValue: StorageMap[K]
    ): StorageMap[K] {
        return this.get(key) ?? defaultValue;
    }
    
    set<K extends StorageKey>(key: K, value: StorageMap[K]): void {
        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
        }
    }
    
    remove(key: StorageKey): void {
        this.storage.removeItem(key);
    }
    
    clear(): void {
        this.storage.clear();
    }
}

// 使用示例
const storage = new TypedStorage();

// 类型安全的存储
storage.set("user", {
    id: "123",
    name: "Alice",
    email: "alice@example.com"
});

storage.set("theme", "dark");

// 类型安全的读取
const user = storage.get("user");
const theme = storage.getOrDefault("theme", "light");

console.log(user?.name);
console.log(theme);
```
