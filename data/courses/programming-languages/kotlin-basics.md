# Kotlin 基础 三层深度学习教程

## [总览] 技术总览

Kotlin 是 JetBrains 开发的现代编程语言，运行在 JVM 上，是 Android 官方推荐语言。语法简洁、空安全、支持函数式编程。可与 Java 完全互操作，适合服务端开发、Android 应用和多平台项目。

本教程采用三层漏斗学习法：**核心层**聚焦基础语法、空安全、面向对象三大基石；**重点层**深入协程和高阶函数；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 基础语法与数据类型

#### [概念] 概念解释

Kotlin 使用 `val` 声明只读变量，`var` 声明可变变量。支持类型推断，也支持显式类型注解。基本类型与 Java 类似，但统一了基本类型和包装类型。

#### [代码] 代码示例

```kotlin
// 常量与变量
val pi = 3.14159  // 只读
var counter = 0   // 可变
counter += 1

// 显式类型注解
val name: String = "Kotlin"
val age: Int = 10
val isActive: Boolean = true

// 字符串模板
val greeting = "Hello, $name!"
val expression = "Age in 10 years: ${age + 10}"

// 多行字符串
val text = """
    |This is a
    |multiline string.
""".trimMargin()

// 数组
val numbers = arrayOf(1, 2, 3, 4, 5)
val first = numbers[0]
numbers[0] = 10

// 列表
val list = listOf("a", "b", "c")  // 不可变
val mutableList = mutableListOf("a", "b", "c")  // 可变
mutableList.add("d")

// Map
val map = mapOf("a" to 1, "b" to 2)
val mutableMap = mutableMapOf("a" to 1)
mutableMap["c"] = 3

// Range
for (i in 1..10) print("$i ")  // 1 到 10
for (i in 1 until 10) print("$i ")  // 1 到 9
for (i in 10 downTo 1) print("$i ")  // 10 到 1
for (i in 1..10 step 2) print("$i ")  // 1, 3, 5, 7, 9

// when 表达式
val score = 85
val grade = when {
    score >= 90 -> "A"
    score >= 80 -> "B"
    score >= 70 -> "C"
    else -> "F"
}
```

### 2. 空安全

#### [概念] 概念解释

Kotlin 的空安全是其核心特性。类型默认不可空，使用 `?` 标记可空类型。通过安全调用 `?.`、Elvis 运算符 `?:`、非空断言 `!!` 处理空值。

#### [代码] 代码示例

```kotlin
// 可空类型
var name: String? = null
name = "Kotlin"

// 安全调用
val length = name?.length  // 如果 name 为 null，返回 null

// Elvis 运算符
val displayName = name ?: "Unknown"  // 如果 name 为 null，使用默认值

// 非空断言（谨慎使用）
val forcedLength = name!!.length  // 如果 name 为 null，抛出 NPE

// 安全转换
val number: Int? = "123" as? Int  // 转换失败返回 null

// let 函数处理可空值
name?.let {
    println("Name is $it")
}

// also 函数
name?.also {
    println("Processing $it")
}

// takeIf 和 takeUnless
val validLength = name?.takeIf { it.length > 3 }?.length

// 示例：安全解析
fun parseAge(input: String?): Int {
    return input?.toIntOrNull() ?: 0
}

// 示例：链式安全调用
data class User(val profile: Profile?)
data class Profile(val address: Address?)
data class Address(val city: String)

fun getCity(user: User?): String {
    return user?.profile?.address?.city ?: "Unknown"
}
```

### 3. 面向对象编程

#### [概念] 概念解释

Kotlin 使用 `class` 定义类，`interface` 定义接口。支持主构造函数、数据类、密封类。属性自动生成 getter/setter，简化了 Java 的样板代码。

#### [代码] 代码示例

```kotlin
// 类定义
class Person(val name: String, var age: Int) {
    // 次构造函数
    constructor(name: String) : this(name, 0)
    
    // 属性
    val isAdult: Boolean
        get() = age >= 18
    
    // 方法
    fun greet() = "Hello, I'm $name"
    
    // init 块
    init {
        require(age >= 0) { "Age cannot be negative" }
    }
}

// 数据类（自动生成 equals, hashCode, toString, copy）
data class User(val id: Int, val name: String, val email: String)

// 密封类（受限继承）
sealed class Result {
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
    object Loading : Result()
}

fun handleResult(result: Result) = when (result) {
    is Result.Success -> "Data: ${result.data}"
    is Result.Error -> "Error: ${result.message}"
    Result.Loading -> "Loading..."
}

// 接口
interface Drawable {
    fun draw()
    val area: Double
}

// 实现
class Circle(val radius: Double) : Drawable {
    override fun draw() = println("Drawing circle")
    override val area: Double = Math.PI * radius * radius
}

// 继承
open class Animal(val name: String) {
    open fun speak() = "$name makes a sound"
}

class Dog(name: String) : Animal(name) {
    override fun speak() = "$name barks"
}

// 使用示例
fun main() {
    val person = Person("Alice", 25)
    println(person.greet())
    println("Is adult: ${person.isAdult}")
    
    val user = User(1, "Bob", "bob@example.com")
    val updatedUser = user.copy(name = "Robert")
    
    val result: Result = Result.Success("Hello")
    println(handleResult(result))
    
    val dog = Dog("Max")
    println(dog.speak())
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 协程

#### [概念] 概念解释

协程是 Kotlin 的轻量级并发解决方案。使用 `suspend` 标记挂起函数，`launch`/`async` 启动协程。协程比线程更轻量，可以高效处理大量并发任务。

#### [代码] 代码示例

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 挂起函数
suspend fun fetchData(): String {
    delay(1000)  // 非阻塞延迟
    return "Data loaded"
}

// 协程作用域
fun main() = runBlocking {
    // launch - 启动协程（不返回结果）
    val job = launch {
        delay(500)
        println("Task completed")
    }
    job.join()  // 等待完成
    
    // async - 启动协程（返回结果）
    val deferred = async {
        delay(500)
        "Async result"
    }
    val result = deferred.await()
    println(result)
    
    // 并发执行
    val results = coroutineScope {
        val a = async { fetchData() }
        val b = async { fetchData() }
        listOf(a.await(), b.await())
    }
    println(results)
    
    // Flow - 异步数据流
    fun numbers(): Flow<Int> = flow {
        for (i in 1..5) {
            delay(100)
            emit(i)
        }
    }
    
    numbers()
        .map { it * it }
        .filter { it > 5 }
        .collect { println(it) }
    
    // 异常处理
    val handler = CoroutineExceptionHandler { _, e ->
        println("Caught: $e")
    }
    
    launch(handler) {
        throw RuntimeException("Error")
    }
}
```

### 2. 高阶函数与扩展函数

#### [概念] 概念解释

Kotlin 支持高阶函数（函数作为参数或返回值）、扩展函数（为现有类添加方法）、Lambda 表达式。集合提供了丰富的函数式操作。

#### [代码] 代码示例

```kotlin
// 高阶函数
fun <T> List<T>.customFilter(predicate: (T) -> Boolean): List<T> {
    val result = mutableListOf<T>()
    for (item in this) {
        if (predicate(item)) {
            result.add(item)
        }
    }
    return result
}

// 扩展函数
fun String.isEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

// 扩展属性
val String.words: List<String>
    get() = this.split(" ")

// 内联函数
inline fun <T> measureTime(block: () -> T): Pair<T, Long> {
    val start = System.currentTimeMillis()
    val result = block()
    val time = System.currentTimeMillis() - start
    return result to time
}

// 集合操作
val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

// map - 转换
val doubled = numbers.map { it * 2 }

// filter - 过滤
val evens = numbers.filter { it % 2 == 0 }

// reduce - 聚合
val sum = numbers.reduce { acc, n -> acc + n }

// fold - 带初始值的聚合
val product = numbers.fold(1) { acc, n -> acc * n }

// groupBy - 分组
val grouped = numbers.groupBy { if (it % 2 == 0) "even" else "odd" }

// partition - 分区
val (even, odd) = numbers.partition { it % 2 == 0 }

// associate - 转换为 Map
val nameLengths = listOf("Alice", "Bob").associate { it to it.length }

// 链式调用
val result = numbers
    .filter { it > 3 }
    .map { it * it }
    .sortedDescending()
    .take(3)

fun main() {
    val emails = listOf("test@example.com", "invalid")
    println(emails.filter { it.isEmail() })
    
    "Hello World".words.forEach { println(it) }
    
    val (value, time) = measureTime {
        Thread.sleep(100)
        "Result"
    }
    println("Value: $value, Time: ${time}ms")
}
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| companion object | 静态成员 |
| object | 单例对象 |
| inline class | 内联类（值类） |
| reified | 具体化类型参数 |
| by | 委托模式 |
| typealias | 类型别名 |
| infix | 中缀函数 |
| operator | 运算符重载 |
| Destructuring | 解构声明 |
| KMP | Kotlin 多平台 |

---

## [实战] 核心实战清单

1. 使用协程实现一个简单的并发网络请求
2. 为 List 实现自定义扩展函数，实现分组统计
3. 使用密封类实现一个状态机

## [避坑] 三层避坑提醒

- **核心层误区**：滥用 `!!` 非空断言导致 NPE，优先使用安全调用
- **重点层误区**：协程泄漏，确保在合适的 Scope 中启动协程
- **扩展层建议**：优先使用数据类和密封类，减少样板代码
