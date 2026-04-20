# Rust 基础 三层深度学习教程

## [总览] 技术总览

Rust 是一门系统编程语言，专注于安全、并发和性能。通过所有权系统在编译时保证内存安全，无需垃圾回收。Rust 适合构建操作系统、WebAssembly、网络服务和命令行工具。

本教程采用三层漏斗学习法：**核心层**聚焦所有权、借用、生命周期三大基石；**重点层**深入 trait 系统和错误处理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 所有权系统

#### [概念] 概念解释

所有权是 Rust 最核心的概念。每个值都有一个所有者，同一时刻只能有一个所有者。当所有者离开作用域时，值会被自动释放。这消除了悬垂指针和内存泄漏问题。

#### [代码] 代码示例

```rust
fn main() {
    // 所有权转移（move）
    let s1 = String::from("hello");
    let s2 = s1;  // s1 的所有权转移给 s2
    // println!("{}", s1);  // 编译错误！s1 已失效
    
    // 克隆（深拷贝）
    let s3 = s2.clone();
    println!("s2: {}, s3: {}", s2, s3);  // 两者都有效
    
    // 栈上数据（Copy trait）自动复制
    let x = 5;
    let y = x;
    println!("x: {}, y: {}", x, y);  // 两者都有效
}

// 函数所有权转移
fn take_ownership(s: String) {
    println!("{}", s);
}  // s 在此处被释放

fn make_copy(i: i32) {
    println!("{}", i);
}  // i 是 Copy 类型，不会释放原变量

fn main() {
    let s = String::from("hello");
    take_ownership(s);
    // println!("{}", s);  // 错误！s 已被移动
    
    let x = 5;
    make_copy(x);
    println!("{}", x);  // 正常！x 仍然有效
}
```

### 2. 借用与引用

#### [概念] 概念解释

借用允许在不获取所有权的情况下使用值。引用分为不可变引用（`&T`）和可变引用（`&mut T`）。规则：任意时刻，要么有一个可变引用，要么有任意数量的不可变引用，两者不能同时存在。

#### [代码] 代码示例

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 不可变借用
    let len = calculate_length(&s);
    println!("Length of '{}' is {}", s, len);
    
    // 可变借用
    change(&mut s);
    println!("Changed: {}", s);
    
    // 切片引用
    let hello = &s[0..5];
    println!("Slice: {}", hello);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 离开作用域，但不释放数据（没有所有权）

fn change(s: &mut String) {
    s.push_str(", world!");
}

// 悬垂引用检查
fn dangle() -> &String {
    let s = String::from("hello");
    &s  // 编译错误！返回了局部变量的引用
}  // s 在此处被释放

fn no_dangle() -> String {
    let s = String::from("hello");
    s  // 所有权转移，安全返回
}
```

### 3. 生命周期

#### [概念] 概念解释

生命周期确保引用始终有效。编译器通过生命周期标注追踪引用的有效范围。大多数情况下生命周期可以自动推导，但在函数签名和结构体中可能需要显式标注。

#### [代码] 代码示例

```rust
// 显式生命周期标注
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string");
    
    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("Longest: {}", result);
    }
}

// 结构体中的生命周期
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
    
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Announcement: {}", announcement);
        self.part
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let excerpt = ImportantExcerpt {
        part: first_sentence,
    };
    println!("Excerpt: {}", excerpt.part);
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Trait 系统

#### [概念] 概念解释

Trait 定义共享行为，类似于其他语言的接口。可以为任何类型实现 trait（包括内置类型）。Trait bound 用于泛型约束，确保类型具有特定行为。

#### [代码] 代码示例

```rust
// 定义 trait
trait Summary {
    fn summarize(&self) -> String;
    
    // 默认实现
    fn author(&self) -> String {
        String::from("Unknown")
    }
}

struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, self.content)
    }
}

// Trait bound
fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}

// 多重 trait bound
fn notify_all<T: Summary + Clone>(item: &T) {
    let item_clone = item.clone();
    println!("Original: {}", item.summarize());
    println!("Clone: {}", item_clone.summarize());
}

// where 子句
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Summary + Clone,
    U: Clone,
{
    0
}

fn main() {
    let article = Article {
        title: String::from("Rust 1.70 Released"),
        content: String::from("New features include..."),
    };
    println!("{}", article.summarize());
    notify(&article);
}
```

### 2. 错误处理

#### [概念] 概念解释

Rust 使用 `Result<T, E>` 和 `Option<T>` 处理可恢复错误，`panic!` 处理不可恢复错误。`?` 运算符简化错误传播。

#### [代码] 代码示例

```rust
use std::fs::File;
use std::io::{self, Read};

// 自定义错误类型
#[derive(Debug)]
enum MyError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
}

impl From<io::Error> for MyError {
    fn from(err: io::Error) -> Self {
        MyError::Io(err)
    }
}

impl From<std::num::ParseIntError> for MyError {
    fn from(err: std::num::ParseIntError) -> Self {
        MyError::Parse(err)
    }
}

fn read_number_from_file(filename: &str) -> Result<i32, MyError> {
    let mut file = File::open(filename)?;  // ? 自动转换错误类型
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let number: i32 = contents.trim().parse()?;
    Ok(number)
}

fn main() {
    match read_number_from_file("number.txt") {
        Ok(n) => println!("Number: {}", n),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| Option | 可空值处理，Some/None |
| Result | 错误处理，Ok/Err |
| Vec | 动态数组 |
| HashMap | 哈希映射 |
| Box | 堆分配智能指针 |
| Rc | 引用计数智能指针 |
| Arc | 原子引用计数，线程安全 |
| Cell/RefCell | 内部可变性 |
| async/await | 异步编程 |
| macro | 宏定义 |

---

## [实战] 核心实战清单

1. 实现一个简单的文本分析器，统计文件中单词频率
2. 使用 trait 实现一个简单的插件系统
3. 编写一个命令行工具，支持多线程文件搜索

## [避坑] 三层避坑提醒

- **核心层误区**：混淆 move 和 copy 语义，导致编译错误
- **重点层误区**：生命周期标注过于复杂，考虑重构数据结构
- **扩展层建议**：优先使用标准库提供的智能指针，避免手动管理内存
