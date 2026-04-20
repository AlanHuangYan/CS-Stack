# Swift 基础 三层深度学习教程

## [总览] 技术总览

Swift 是 Apple 开发的现代编程语言，用于 iOS、macOS、watchOS 和 tvOS 应用开发。语法简洁、类型安全，支持函数式编程范式。Swift 的可选类型系统有效防止空指针异常，ARC 自动管理内存。

本教程采用三层漏斗学习法：**核心层**聚焦基础语法、可选类型、面向对象三大基石；**重点层**深入协议编程和闭包；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 基础语法与数据类型

#### [概念] 概念解释

Swift 使用 `let` 声明常量，`var` 声明变量。支持类型推断，也支持显式类型注解。基本类型包括 Int、Double、String、Bool，以及集合类型 Array、Dictionary、Set。

#### [代码] 代码示例

```swift
import Foundation

// 常量与变量
let pi = 3.14159  // 常量
var counter = 0   // 变量
counter += 1

// 显式类型注解
let name: String = "Swift"
let age: Int = 10
let isActive: Bool = true

// 字符串
let greeting = "Hello, \(name)!"  // 字符串插值
let multiline = """
    This is a
    multiline string.
    """

// 数组
var numbers = [1, 2, 3, 4, 5]
numbers.append(6)
let first = numbers[0]

// 字典
var scores = ["Alice": 90, "Bob": 85]
scores["Charlie"] = 95
let aliceScore = scores["Alice"] ?? 0

// 集合
var uniqueNumbers: Set = [1, 2, 3, 2, 1]  // {1, 2, 3}

// 控制流
for number in numbers {
    print(number)
}

if age >= 18 {
    print("Adult")
} else {
    print("Minor")
}

// switch 支持 pattern matching
let score = 85
switch score {
case 90...100:
    print("Excellent")
case 70..<90:
    print("Good")
case 60..<70:
    print("Pass")
default:
    print("Fail")
}
```

### 2. 可选类型

#### [概念] 概念解释

可选类型（Optional）是 Swift 的核心特性，用于处理可能为空的值。可选值要么是 `Some(value)`，要么是 `nil`。通过可选绑定、可选链和空合并运算符安全处理可选值。

#### [代码] 代码示例

```swift
import Foundation

// 可选类型声明
var middleName: String? = nil
middleName = "James"

// 可选绑定
if let name = middleName {
    print("Middle name: \(name)")
} else {
    print("No middle name")
}

// guard 语句
func greet(name: String?) {
    guard let name = name else {
        print("No name provided")
        return
    }
    print("Hello, \(name)!")
}

// 可选链
struct Person {
    var name: String
    var address: Address?
}

struct Address {
    var city: String
    var street: String
}

let person = Person(name: "Alice", address: Address(city: "Beijing", street: "Main St"))
let city = person.address?.city  // 可选链，返回 String?

// 空合并运算符
let displayName = middleName ?? "Unknown"

// 强制解包（谨慎使用）
let forcedName = middleName!  // 如果为 nil 会崩溃

// 隐式解包可选
var assumedName: String! = "Bob"
print(assumedName)  // 自动解包

// 可选映射
let length = middleName?.count ?? 0

// 示例：安全解析 JSON
func parseAge(_ json: [String: Any]) -> Int? {
    guard let ageValue = json["age"],
          let age = ageValue as? Int else {
        return nil
    }
    return age
}
```

### 3. 面向对象编程

#### [概念] 概念解释

Swift 使用 `class` 定义引用类型，`struct` 定义值类型。支持继承（仅类）、协议、扩展。属性分为存储属性和计算属性，支持属性观察器。

#### [代码] 代码示例

```swift
import Foundation

// 结构体（值类型）
struct Point {
    var x: Double
    var y: Double
    
    // 计算属性
    var distance: Double {
        return sqrt(x * x + y * y)
    }
    
    // 方法
    func moved(by dx: Double, dy: Double) -> Point {
        return Point(x: x + dx, y: y + dy)
    }
}

// 类（引用类型）
class Vehicle {
    var brand: String
    var speed: Double = 0
    
    init(brand: String) {
        self.brand = brand
    }
    
    func accelerate(by amount: Double) {
        speed += amount
    }
    
    func description() -> String {
        return "\(brand) traveling at \(speed) km/h"
    }
}

// 继承
class Car: Vehicle {
    var numberOfDoors: Int
    
    init(brand: String, doors: Int) {
        self.numberOfDoors = doors
        super.init(brand: brand)
    }
    
    // 重写
    override func description() -> String {
        return "\(brand) car with \(numberOfDoors) doors at \(speed) km/h"
    }
}

// 属性观察器
class Temperature {
    var celsius: Double = 0 {
        willSet {
            print("Temperature will change from \(celsius) to \(newValue)")
        }
        didSet {
            print("Temperature changed from \(oldValue) to \(celsius)")
        }
    }
}

// 使用示例
var point = Point(x: 3, y: 4)
print("Distance: \(point.distance)")

let car = Car(brand: "Toyota", doors: 4)
car.accelerate(by: 50)
print(car.description())

let temp = Temperature()
temp.celsius = 25
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 协议与扩展

#### [概念] 概念解释

协议定义方法、属性的蓝图，类似其他语言的接口。Swift 支持协议扩展，可为协议提供默认实现。协议是 Swift 面向协议编程的核心。

#### [代码] 代码示例

```swift
import Foundation

// 协议定义
protocol Drawable {
    var area: Double { get }
    func draw()
}

// 协议扩展（默认实现）
extension Drawable {
    func draw() {
        print("Drawing shape with area \(area)")
    }
}

// 遵循协议
struct Circle: Drawable {
    var radius: Double
    var area: Double { pi * radius * radius }
    
    private let pi = 3.14159
}

struct Rectangle: Drawable {
    var width: Double
    var height: Double
    var area: Double { width * height }
}

// 协议组合
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

func wishHappyBirthday(to celebrator: Named & Aged) {
    print("Happy birthday, \(celebrator.name), you're \(celebrator.age)!")
}

struct Person: Named, Aged {
    var name: String
    var age: Int
}

// 扩展现有类型
extension String {
    var isNotEmpty: Bool {
        return !self.isEmpty
    }
    
    func reversed() -> String {
        return String(self.reversed())
    }
}

// 使用示例
let shapes: [Drawable] = [
    Circle(radius: 5),
    Rectangle(width: 4, height: 3)
]

for shape in shapes {
    shape.draw()
}

let person = Person(name: "Alice", age: 25)
wishHappyBirthday(to: person)

let text = "Hello"
print(text.reversed())  // "olleH"
```

### 2. 闭包与高阶函数

#### [概念] 概念解释

闭包是自包含的功能代码块，可以捕获和存储上下文中的常量和变量。Swift 的数组提供了丰富的高阶函数如 `map`、`filter`、`reduce`。

#### [代码] 代码示例

```swift
import Foundation

// 闭包语法
let add: (Int, Int) -> Int = { (a, b) in
    return a + b
}

// 简化写法
let multiply: (Int, Int) -> Int = { $0 * $1 }

print(add(3, 4))       // 7
print(multiply(3, 4))  // 12

// 捕获值
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
print(counter())  // 1
print(counter())  // 2
print(counter())  // 3

// 高阶函数
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// map - 转换
let doubled = numbers.map { $0 * 2 }
print(doubled)  // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter - 过滤
let evens = numbers.filter { $0 % 2 == 0 }
print(evens)  // [2, 4, 6, 8, 10]

// reduce - 聚合
let sum = numbers.reduce(0, +)
print(sum)  // 55

// compactMap - 去除 nil
let strings = ["1", "2", "three", "4"]
let validNumbers = strings.compactMap { Int($0) }
print(validNumbers)  // [1, 2, 4]

// flatMap - 扁平化
let nested = [[1, 2], [3, 4], [5]]
let flattened = nested.flatMap { $0 }
print(flattened)  // [1, 2, 3, 4, 5]

// 链式调用
let result = numbers
    .filter { $0 % 2 == 0 }
    .map { $0 * $0 }
    .reduce(0, +)
print(result)  // 2^2 + 4^2 + 6^2 + 8^2 + 10^2 = 220
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| enum | 枚举，支持关联值 |
| guard | 提前退出模式 |
| defer | 延迟执行 |
| throws | 错误处理 |
| async/await | 并发编程 |
| actor | 并发安全模型 |
| generics | 泛型编程 |
| associatedtype | 协议关联类型 |
| SwiftUI | 声明式 UI 框架 |
| Combine | 响应式编程框架 |

---

## [实战] 核心实战清单

1. 实现一个简单的 TODO 列表应用，使用 struct 和 protocol
2. 使用高阶函数处理 JSON 数据，实现过滤和转换
3. 编写一个闭包回调的网络请求封装

## [避坑] 三层避坑提醒

- **核心层误区**：强制解包 nil 导致运行时崩溃，优先使用可选绑定
- **重点层误区**：闭包中的循环引用，使用 `[weak self]` 避免内存泄漏
- **扩展层建议**：优先使用 struct 和 enum，仅在需要引用语义时使用 class
