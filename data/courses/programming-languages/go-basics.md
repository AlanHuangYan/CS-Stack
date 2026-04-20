# Go 基础 三层深度学习教程

## [总览] 技术总览

Go（Golang）是 Google 开发的静态类型、编译型编程语言，专为构建简单、高效、可靠的软件而设计。Go 以其简洁的语法、内置并发支持和快速编译著称，广泛应用于云原生应用、微服务和网络编程领域。

本教程采用三层漏斗学习法：**核心层**聚焦基础语法、并发模型、错误处理三大基石；**重点层**深入接口与类型系统；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 基础语法与数据类型

#### [概念] 概念解释

Go 的语法简洁，变量声明使用 `var` 或短声明 `:=`。基本数据类型包括 int、float、string、bool，以及复合类型 array、slice、map。

#### [代码] 代码示例

```go
package main

import "fmt"

func main() {
    // 变量声明
    var name string = "Go"
    age := 10  // 短声明
    
    // 基本类型
    var (
        isActive bool   = true
        count    int    = 100
        price    float64 = 99.9
    )
    
    // 复合类型
    numbers := []int{1, 2, 3, 4, 5}  // slice
    scores := map[string]int{        // map
        "alice": 90,
        "bob":   85,
    }
    
    fmt.Printf("Name: %s, Age: %d\n", name, age)
    fmt.Printf("Numbers: %v\n", numbers)
    fmt.Printf("Scores: %v\n", scores)
}
```

### 2. 并发模型

#### [概念] 概念解释

Go 的并发基于 goroutine（轻量级线程）和 channel（通信管道）。通过 `go` 关键字启动 goroutine，使用 channel 进行 goroutine 间通信，遵循"不要通过共享内存来通信，而要通过通信来共享内存"的原则。

#### [代码] 代码示例

```go
package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Second)
        results <- j * 2
    }
}

func main() {
    const numJobs = 5
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    // 启动 3 个 worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送任务
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)

    // 收集结果
    for r := 1; r <= numJobs; r++ {
        <-results
    }
}
```

### 3. 错误处理

#### [概念] 概念解释

Go 使用显式错误处理，函数返回 error 类型表示错误。惯用法是先检查错误，再处理正常逻辑。可通过 `errors.New()` 创建错误，或实现 `Error()` 方法自定义错误类型。

#### [代码] 代码示例

```go
package main

import (
    "errors"
    "fmt"
)

type DivisionError struct {
    Dividend int
    Divisor  int
}

func (e *DivisionError) Error() string {
    return fmt.Sprintf("cannot divide %d by zero", e.Dividend)
}

func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, &DivisionError{Dividend: a, Divisor: b}
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 0)
    if err != nil {
        var divErr *DivisionError
        if errors.As(err, &divErr) {
            fmt.Printf("Custom error: %v\n", divErr)
        } else {
            fmt.Printf("Error: %v\n", err)
        }
        return
    }
    fmt.Printf("Result: %d\n", result)
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 接口与类型系统

#### [概念] 概念解释

Go 的接口是隐式实现的——只要类型实现了接口的所有方法，就自动满足该接口。这种鸭子类型设计使得代码更加灵活。

#### [代码] 代码示例

```go
package main

import "fmt"

type Writer interface {
    Write([]byte) (int, error)
}

type ConsoleWriter struct{}

func (cw ConsoleWriter) Write(data []byte) (int, error) {
    n := len(data)
    fmt.Print(string(data))
    return n, nil
}

func main() {
    var w Writer = ConsoleWriter{}
    w.Write([]byte("Hello, Interface!\n"))
}
```

### 2. 结构体与方法

#### [概念] 概念解释

Go 使用结构体组合数据，方法可以绑定到任意命名类型。方法接收者可以是值类型或指针类型，指针接收者可修改原数据。

#### [代码] 代码示例

```go
package main

import "fmt"

type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

func main() {
    rect := Rectangle{Width: 10, Height: 5}
    fmt.Printf("Area: %.2f\n", rect.Area())
    
    rect.Scale(2)
    fmt.Printf("Scaled Area: %.2f\n", rect.Area())
}
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| defer | 延迟执行，常用于资源清理 |
| panic/recover | 异常处理机制 |
| goroutine | 轻量级并发单元 |
| channel | goroutine 通信管道 |
| select | 多 channel 监听 |
| context | 请求超时与取消 |
| sync包 | WaitGroup, Mutex 等同步原语 |
| reflect | 运行时类型反射 |
| generics | Go 1.18+ 泛型支持 |
| embedding | 结构体嵌入实现组合 |

---

## [实战] 核心实战清单

1. 实现一个并发安全的计数器，使用 sync.Mutex 保护共享数据
2. 使用 channel 实现生产者-消费者模式处理任务队列
3. 编写一个简单的 HTTP 服务器，处理 JSON 请求并返回响应

## [避坑] 三层避坑提醒

- **核心层误区**：goroutine 泄漏是最常见问题，确保所有 goroutine 都能正常退出
- **重点层误区**：接口 nil 检查陷阱，只有类型和值都为 nil 时接口才等于 nil
- **扩展层建议**：优先使用 channel 通信而非共享内存，遵循 Go 的并发哲学
