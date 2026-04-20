# C# 基础 三层深度学习教程

## [总览] 技术总览

C# 是微软开发的面向对象编程语言，运行在 .NET 平台上。语法简洁、类型安全，支持泛型、LINQ、异步编程等现代特性。广泛应用于 Windows 桌面应用、Web 后端、游戏开发（Unity）和云服务。

本教程采用三层漏斗学习法：**核心层**聚焦基础语法、面向对象、集合与 LINQ 三大基石；**重点层**深入异步编程和依赖注入；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 基础语法与类型系统

#### [概念] 概念解释

C# 是强类型语言，支持值类型（int、double、bool、struct）和引用类型（class、string、array）。`var` 关键字支持类型推断，`nullable` 类型处理空值。

#### [代码] 代码示例

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        // 值类型
        int age = 25;
        double price = 99.99;
        bool isActive = true;
        
        // 引用类型
        string name = "Alice";
        int[] numbers = { 1, 2, 3, 4, 5 };
        
        // 类型推断
        var score = 100;  // int
        var message = "Hello";  // string
        
        // Nullable 类型
        int? nullableInt = null;
        nullableInt = 42;
        Console.WriteLine($"Value: {nullableInt ?? 0}");
        
        // 字符串插值
        Console.WriteLine($"Name: {name}, Age: {age}");
        
        // 字符串操作
        string upper = name.ToUpper();
        bool contains = name.Contains("Ali");
        string[] parts = "a,b,c".Split(',');
    }
}
```

### 2. 面向对象编程

#### [概念] 概念解释

C# 支持封装、继承和多态。使用 `class` 定义类，`interface` 定义接口，`abstract` 定义抽象类。属性（Property）简化了 getter/setter 模式。

#### [代码] 代码示例

```csharp
using System;
using System.Collections.Generic;

// 接口定义
public interface IDrawable
{
    void Draw();
}

// 抽象基类
public abstract class Shape
{
    public string Name { get; protected set; }
    
    public abstract double Area();
    
    public virtual void Display()
    {
        Console.WriteLine($"{Name}: Area = {Area()}");
    }
}

// 派生类
public class Circle : Shape, IDrawable
{
    public double Radius { get; set; }
    
    public Circle(double radius)
    {
        Radius = radius;
        Name = "Circle";
    }
    
    public override double Area() => Math.PI * Radius * Radius;
    
    public void Draw() => Console.WriteLine($"Drawing circle with radius {Radius}");
}

public class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    
    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
        Name = "Rectangle";
    }
    
    public override double Area() => Width * Height;
}

// 使用示例
class Program
{
    static void Main()
    {
        var shapes = new List<Shape>
        {
            new Circle(5),
            new Rectangle(4, 3)
        };
        
        foreach (var shape in shapes)
        {
            shape.Display();
            
            if (shape is IDrawable drawable)
            {
                drawable.Draw();
            }
        }
    }
}
```

### 3. 集合与 LINQ

#### [概念] 概念解释

LINQ（Language Integrated Query）提供了统一的查询语法，可以查询各种数据源。常用集合包括 `List<T>`、`Dictionary<TKey, TValue>`、`HashSet<T>`。

#### [代码] 代码示例

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Age { get; set; }
    public string Department { get; set; }
    public List<int> Scores { get; set; }
}

class Program
{
    static void Main()
    {
        var students = new List<Student>
        {
            new Student { Id = 1, Name = "Alice", Age = 20, Department = "CS", Scores = new List<int> { 90, 85, 88 } },
            new Student { Id = 2, Name = "Bob", Age = 22, Department = "Math", Scores = new List<int> { 75, 80, 82 } },
            new Student { Id = 3, Name = "Charlie", Age = 21, Department = "CS", Scores = new List<int> { 95, 92, 90 } },
            new Student { Id = 4, Name = "Diana", Age = 20, Department = "Physics", Scores = new List<int> { 88, 90, 85 } }
        };
        
        // LINQ 查询语法
        var csStudents = from s in students
                         where s.Department == "CS"
                         orderby s.Name
                         select s;
        
        // LINQ 方法语法
        var topStudents = students
            .Where(s => s.Scores.Average() > 85)
            .OrderByDescending(s => s.Scores.Average())
            .Select(s => new { s.Name, Average = s.Scores.Average() });
        
        // 分组
        var byDepartment = students.GroupBy(s => s.Department);
        
        // 聚合
        var avgAge = students.Average(s => s.Age);
        var totalScores = students.SelectMany(s => s.Scores).Sum();
        
        // 输出结果
        Console.WriteLine("CS Students:");
        foreach (var s in csStudents)
        {
            Console.WriteLine($"  {s.Name}");
        }
        
        Console.WriteLine("\nTop Students:");
        foreach (var s in topStudents)
        {
            Console.WriteLine($"  {s.Name}: {s.Average:F2}");
        }
        
        Console.WriteLine($"\nAverage Age: {avgAge:F1}");
    }
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 异步编程

#### [概念] 概念解释

C# 使用 `async`/`await` 关键字简化异步编程。`Task` 表示异步操作，`Task<T>` 表示返回值的异步操作。异步方法避免阻塞线程，提高应用响应性。

#### [代码] 代码示例

```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;

public class DataService
{
    private static readonly HttpClient client = new HttpClient();
    
    // 异步方法
    public async Task<string> FetchDataAsync(string url)
    {
        try
        {
            // await 等待异步操作完成
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return null;
        }
    }
    
    // 并行执行多个异步任务
    public async Task<Dictionary<string, string>> FetchMultipleAsync(List<string> urls)
    {
        var tasks = urls.Select(url => FetchDataAsync(url));
        var results = await Task.WhenAll(tasks);
        
        return urls.Zip(results, (url, data) => new { url, data })
                   .ToDictionary(x => x.url, x => x.data);
    }
    
    // 带超时的异步操作
    public async Task<string> FetchWithTimeoutAsync(string url, int timeoutMs)
    {
        using var cts = new System.Threading.CancellationTokenSource(timeoutMs);
        try
        {
            var response = await client.GetAsync(url, cts.Token);
            return await response.Content.ReadAsStringAsync();
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Request timed out");
            return null;
        }
    }
}

class Program
{
    static async Task Main()
    {
        var service = new DataService();
        
        // 单个请求
        var data = await service.FetchDataAsync("https://api.github.com");
        Console.WriteLine($"Data length: {data?.Length ?? 0}");
        
        // 并行请求
        var urls = new List<string>
        {
            "https://api.github.com/users/1",
            "https://api.github.com/users/2"
        };
        var results = await service.FetchMultipleAsync(urls);
        foreach (var kvp in results)
        {
            Console.WriteLine($"{kvp.Key}: {kvp.Value?.Length ?? 0} chars");
        }
    }
}
```

### 2. 泛型与依赖注入

#### [概念] 概念解释

泛型允许创建类型安全的可重用代码。依赖注入（DI）是解耦组件的常用模式，.NET Core 内置了 DI 容器。

#### [代码] 代码示例

```csharp
using System;
using Microsoft.Extensions.DependencyInjection;

// 泛型接口
public interface IRepository<T> where T : class
{
    T GetById(int id);
    void Add(T entity);
    void Delete(T entity);
}

// 泛型实现
public class InMemoryRepository<T> : IRepository<T> where T : class
{
    private readonly Dictionary<int, T> _storage = new();
    private int _nextId = 1;
    
    public T GetById(int id) => _storage.TryGetValue(id, out var entity) ? entity : null;
    
    public void Add(T entity)
    {
        _storage[_nextId++] = entity;
        Console.WriteLine($"Added {typeof(T).Name}");
    }
    
    public void Delete(T entity)
    {
        var key = _storage.FirstOrDefault(x => x.Value == entity).Key;
        if (_storage.Remove(key))
        {
            Console.WriteLine($"Deleted {typeof(T).Name}");
        }
    }
}

// 服务类
public class UserService
{
    private readonly IRepository<User> _repository;
    
    public UserService(IRepository<User> repository)
    {
        _repository = repository;
    }
    
    public void CreateUser(string name)
    {
        _repository.Add(new User { Name = name });
    }
}

public class User
{
    public string Name { get; set; }
}

class Program
{
    static void Main()
    {
        // 配置依赖注入
        var services = new ServiceCollection();
        
        services.AddScoped(typeof(IRepository<>), typeof(InMemoryRepository<>));
        services.AddScoped<UserService>();
        
        var provider = services.BuildServiceProvider();
        
        // 使用服务
        using var scope = provider.CreateScope();
        var userService = scope.ServiceProvider.GetRequiredService<UserService>();
        userService.CreateUser("Alice");
    }
}
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| delegate | 委托类型 |
| event | 事件机制 |
| lambda | Lambda 表达式 |
| extension methods | 扩展方法 |
| attributes | 特性/注解 |
| reflection | 反射 |
| generics constraints | 泛型约束 |
| record | C# 9 记录类型 |
| pattern matching | 模式匹配 |
| span | 高性能内存操作 |

---

## [实战] 核心实战清单

1. 实现一个泛型仓储模式，支持 CRUD 操作
2. 使用 async/await 编写一个并发下载器
3. 创建一个简单的依赖注入容器

## [避坑] 三层避坑提醒

- **核心层误区**：混淆值类型和引用类型的赋值行为
- **重点层误区**：在异步方法中使用 `.Result` 导致死锁
- **扩展层建议**：优先使用现代 C# 特性如 record、pattern matching 提高代码简洁性
