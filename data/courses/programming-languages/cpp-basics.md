# C++ 基础 三层深度学习教程

## [总览] 技术总览

C++ 是一门高性能、多范式编程语言，支持面向过程、面向对象和泛型编程。广泛应用于系统软件、游戏引擎、嵌入式系统和高性能计算领域。C++11/14/17/20 标准引入了现代特性，大幅提升了开发效率。

本教程采用三层漏斗学习法：**核心层**聚焦内存管理、面向对象、STL 容器三大基石；**重点层**深入模板编程和智能指针；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 内存管理

#### [概念] 概念解释

C++ 允许直接操作内存，通过 `new`/`delete` 进行动态内存分配。现代 C++ 推荐使用智能指针（`std::unique_ptr`、`std::shared_ptr`）自动管理内存，避免内存泄漏。

#### [代码] 代码示例

```cpp
#include <iostream>
#include <memory>
#include <vector>

class Resource {
public:
    Resource(int id) : id_(id) {
        std::cout << "Resource " << id_ << " created\n";
    }
    ~Resource() {
        std::cout << "Resource " << id_ << " destroyed\n";
    }
    int getId() const { return id_; }
private:
    int id_;
};

int main() {
    // 传统方式（不推荐）
    int* ptr = new int(42);
    std::cout << "Value: " << *ptr << "\n";
    delete ptr;  // 必须手动释放
    
    // 智能指针（推荐）
    // unique_ptr - 独占所有权
    std::unique_ptr<Resource> res1 = std::make_unique<Resource>(1);
    std::cout << "Resource ID: " << res1->getId() << "\n";
    
    // shared_ptr - 共享所有权
    std::shared_ptr<Resource> res2 = std::make_shared<Resource>(2);
    std::shared_ptr<Resource> res3 = res2;  // 引用计数增加
    std::cout << "Use count: " << res2.use_count() << "\n";
    
    // weak_ptr - 不增加引用计数
    std::weak_ptr<Resource> weak = res2;
    if (auto locked = weak.lock()) {
        std::cout << "Weak ptr locked: " << locked->getId() << "\n";
    }
    
    return 0;
}  // 自动释放所有资源
```

### 2. 面向对象编程

#### [概念] 概念解释

C++ 支持封装、继承和多态。通过 `class` 定义类，`virtual` 实现多态，`override` 确保正确重写。RAII（资源获取即初始化）是 C++ 资源管理的核心模式。

#### [代码] 代码示例

```cpp
#include <iostream>
#include <string>
#include <memory>
#include <vector>

// 抽象基类
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
    virtual std::string name() const = 0;
};

// 派生类
class Circle : public Shape {
public:
    Circle(double radius) : radius_(radius) {}
    
    double area() const override {
        return 3.14159 * radius_ * radius_;
    }
    
    std::string name() const override {
        return "Circle";
    }
    
private:
    double radius_;
};

class Rectangle : public Shape {
public:
    Rectangle(double width, double height) 
        : width_(width), height_(height) {}
    
    double area() const override {
        return width_ * height_;
    }
    
    std::string name() const override {
        return "Rectangle";
    }
    
private:
    double width_;
    double height_;
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(5.0));
    shapes.push_back(std::make_unique<Rectangle>(4.0, 3.0));
    
    for (const auto& shape : shapes) {
        std::cout << shape->name() << " area: " << shape->area() << "\n";
    }
    
    return 0;
}
```

### 3. STL 容器

#### [概念] 概念解释

STL（标准模板库）提供常用容器：`vector`（动态数组）、`map`（有序映射）、`unordered_map`（哈希映射）、`string`（字符串）。配合迭代器和算法使用。

#### [代码] 代码示例

```cpp
#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <string>
#include <algorithm>

int main() {
    // vector - 动态数组
    std::vector<int> nums = {3, 1, 4, 1, 5, 9};
    nums.push_back(2);
    
    // 遍历
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\n";
    
    // 排序
    std::sort(nums.begin(), nums.end());
    
    // 查找
    auto it = std::find(nums.begin(), nums.end(), 5);
    if (it != nums.end()) {
        std::cout << "Found 5 at index: " << std::distance(nums.begin(), it) << "\n";
    }
    
    // map - 有序映射
    std::map<std::string, int> scores;
    scores["alice"] = 90;
    scores["bob"] = 85;
    scores["charlie"] = 95;
    
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << "\n";
    }
    
    // unordered_map - 哈希映射（更快查找）
    std::unordered_map<std::string, int> fast_scores;
    fast_scores["alice"] = 90;
    fast_scores["bob"] = 85;
    
    // 查找 O(1)
    if (fast_scores.count("alice")) {
        std::cout << "Alice's score: " << fast_scores["alice"] << "\n";
    }
    
    return 0;
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 模板编程

#### [概念] 概念解释

模板是 C++ 泛型编程的核心，支持类型参数化。函数模板和类模板可以处理任意类型。模板元编程可在编译期进行计算。

#### [代码] 代码示例

```cpp
#include <iostream>
#include <string>
#include <type_traits>

// 函数模板
template<typename T>
T maximum(T a, T b) {
    return (a > b) ? a : b;
}

// 类模板
template<typename T>
class Container {
public:
    Container(T value) : value_(value) {}
    
    T get() const { return value_; }
    void set(T value) { value_ = value; }
    
    // 成员函数模板
    template<typename U>
    void convertAndSet(U value) {
        value_ = static_cast<T>(value);
    }
    
private:
    T value_;
};

// 模板特化
template<>
class Container<std::string> {
public:
    Container(std::string value) : value_(value) {}
    std::string get() const { return "[" + value_ + "]"; }
    void set(std::string value) { value_ = value; }
private:
    std::string value_;
};

// 可变参数模板
template<typename... Args>
void printAll(Args... args) {
    (std::cout << ... << args) << "\n";
}

int main() {
    std::cout << "Max: " << maximum(3, 5) << "\n";
    std::cout << "Max: " << maximum(3.14, 2.71) << "\n";
    
    Container<int> intContainer(42);
    std::cout << "Int: " << intContainer.get() << "\n";
    
    Container<std::string> strContainer("hello");
    std::cout << "String: " << strContainer.get() << "\n";
    
    printAll(1, " + ", 2, " = ", 3);
    
    return 0;
}
```

### 2. 现代 C++ 特性

#### [概念] 概念解释

C++11/14/17/20 引入了许多现代特性：auto 类型推导、lambda 表达式、范围 for 循环、结构化绑定、std::optional 等。

#### [代码] 代码示例

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <optional>
#include <string>

// std::optional
std::optional<int> findValue(const std::vector<int>& v, int target) {
    auto it = std::find(v.begin(), v.end(), target);
    if (it != v.end()) {
        return std::distance(v.begin(), it);
    }
    return std::nullopt;
}

int main() {
    // auto 类型推导
    auto x = 42;           // int
    auto pi = 3.14;        // double
    auto name = "hello";   // const char*
    
    // lambda 表达式
    auto add = [](int a, int b) { return a + b; };
    std::cout << "Sum: " << add(3, 4) << "\n";
    
    // 捕获外部变量
    int factor = 10;
    auto multiply = [factor](int n) { return n * factor; };
    std::cout << "Multiplied: " << multiply(5) << "\n";
    
    // 范围 for 循环
    std::vector<int> nums = {1, 2, 3, 4, 5};
    for (const auto& n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\n";
    
    // 结构化绑定 (C++17)
    std::pair<std::string, int> person{"Alice", 30};
    auto [name, age] = person;
    std::cout << name << " is " << age << " years old\n";
    
    // std::optional
    std::vector<int> data = {10, 20, 30, 40, 50};
    if (auto idx = findValue(data, 30)) {
        std::cout << "Found at index: " << *idx << "\n";
    }
    
    return 0;
}
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| constexpr | 编译期计算 |
| noexcept | 异常规范 |
| move semantics | 移动语义优化 |
| perfect forwarding | 完美转发 |
| RAII | 资源管理惯用法 |
| CRTP | 奇异递归模板模式 |
| SFINAE | 模板替换失败非错误 |
| concepts | C++20 概念约束 |
| ranges | C++20 范围库 |
| coroutines | C++20 协程 |

---

## [实战] 核心实战清单

1. 实现一个简单的字符串类，支持 RAII 和移动语义
2. 使用模板实现一个通用的链表容器
3. 编写一个多线程任务队列，使用智能指针管理资源

## [避坑] 三层避坑提醒

- **核心层误区**：忘记释放动态分配的内存导致泄漏，优先使用智能指针
- **重点层误区**：模板代码膨胀，合理使用显式实例化
- **扩展层建议**：遵循现代 C++ 最佳实践，避免使用裸指针和手动内存管理
