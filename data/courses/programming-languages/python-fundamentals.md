# Python 基础 三层深度学习教程

## [总览] 技术总览

Python 是一门简洁、易读、功能强大的编程语言，广泛应用于 Web 开发、数据分析、人工智能、自动化脚本等领域。其简洁的语法和丰富的生态系统使其成为初学者和专业开发者的首选语言。

本教程采用三层漏斗学习法：**核心层**聚焦变量与数据类型、控制流、函数定义三大基石；**重点层**深入列表推导式、文件操作、异常处理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Python 编程 **50% 以上** 的常见任务。

### 1. 变量与数据类型

#### [概念] 概念解释

变量是存储数据的容器，数据类型定义了数据的种类和可执行的操作。Python 是动态类型语言，变量不需要声明类型，解释器会自动推断。

#### [语法] 核心语法 / 命令 / API

**基本数据类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| int | 整数 | 42, -10, 0 |
| float | 浮点数 | 3.14, -0.5 |
| str | 字符串 | "hello", 'world' |
| bool | 布尔值 | True, False |
| list | 列表 | [1, 2, 3] |
| dict | 字典 | {"key": "value"} |
| tuple | 元组 | (1, 2, 3) |
| set | 集合 | {1, 2, 3} |
| None | 空值 | None |

#### [代码] 代码示例

```python
# 整数和浮点数
age = 25
price = 99.99
temperature = -5

print(f"年龄: {age}, 类型: {type(age)}")
print(f"价格: {price}, 类型: {type(price)}")

# 数学运算
a = 10
b = 3
print(f"加法: {a + b}")
print(f"减法: {a - b}")
print(f"乘法: {a * b}")
print(f"除法: {a / b}")
print(f"整除: {a // b}")
print(f"取余: {a % b}")
print(f"幂运算: {a ** b}")

# 字符串
name = "Python"
greeting = 'Hello, World!'
multiline = """
这是一个
多行字符串
"""

print(f"字符串长度: {len(name)}")
print(f"字符串拼接: {name + ' Programming'}")
print(f"字符串重复: {name * 3}")
print(f"字符串切片: {name[0:3]}")
print(f"字符串方法: {name.upper()}, {name.lower()}")

# 布尔值
is_active = True
is_deleted = False
print(f"与运算: {is_active and not is_deleted}")
print(f"或运算: {is_active or is_deleted}")

# 列表
fruits = ["apple", "banana", "cherry"]
print(f"列表: {fruits}")
print(f"第一个元素: {fruits[0]}")
print(f"最后一个元素: {fruits[-1]}")
print(f"切片: {fruits[1:3]}")

fruits.append("orange")
fruits.insert(0, "grape")
fruits.remove("banana")
print(f"修改后的列表: {fruits}")

# 字典
person = {
    "name": "Alice",
    "age": 30,
    "city": "Beijing"
}
print(f"字典: {person}")
print(f"姓名: {person['name']}")
print(f"所有键: {list(person.keys())}")
print(f"所有值: {list(person.values())}")

person["email"] = "alice@example.com"
person["age"] = 31
print(f"修改后的字典: {person}")

# 元组（不可变）
coordinates = (10, 20)
print(f"元组: {coordinates}")
print(f"x坐标: {coordinates[0]}")

# 集合（无序、不重复）
unique_numbers = {1, 2, 3, 3, 2, 1}
print(f"集合（自动去重）: {unique_numbers}")
unique_numbers.add(4)
unique_numbers.discard(1)
print(f"修改后的集合: {unique_numbers}")

# None
result = None
print(f"空值: {result}, 类型: {type(result)}")

# 类型转换
num_str = "123"
num_int = int(num_str)
num_float = float(num_str)
print(f"字符串转整数: {num_int}, 类型: {type(num_int)}")
print(f"字符串转浮点数: {num_float}, 类型: {type(num_float)}")
```

#### [场景] 典型应用场景

1. 数据存储：使用变量存储用户输入、计算结果等
2. 配置管理：使用字典存储配置信息
3. 数据处理：使用列表存储批量数据

### 2. 控制流

#### [概念] 概念解释

控制流决定了程序的执行顺序，包括条件判断和循环。条件判断根据条件选择执行路径，循环重复执行特定代码块。

#### [语法] 核心语法 / 命令 / API

**条件判断：**

```python
if condition:
    pass
elif condition:
    pass
else:
    pass
```

**循环：**

```python
for item in iterable:
    pass

while condition:
    pass
```

**循环控制：**
- `break`：跳出循环
- `continue`：跳过当前迭代
- `else`：循环正常结束时执行

#### [代码] 代码示例

```python
# if-elif-else 条件判断
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"分数 {score} 对应等级: {grade}")

# 嵌套条件
age = 25
has_license = True

if age >= 18:
    if has_license:
        print("可以驾驶")
    else:
        print("需要先考取驾照")
else:
    print("年龄不足，不能驾驶")

# 三元表达式
status = "成年" if age >= 18 else "未成年"
print(f"状态: {status}")

# for 循环遍历列表
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"水果: {fruit}")

# for 循环遍历字典
person = {"name": "Alice", "age": 30, "city": "Beijing"}
for key, value in person.items():
    print(f"{key}: {value}")

# range() 函数
print("range(5):", list(range(5)))
print("range(1, 6):", list(range(1, 6)))
print("range(0, 10, 2):", list(range(0, 10, 2)))

for i in range(5):
    print(f"计数: {i}")

# enumerate() 同时获取索引和值
for index, fruit in enumerate(fruits):
    print(f"索引 {index}: {fruit}")

# zip() 同时遍历多个列表
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
for name, age in zip(names, ages):
    print(f"{name} 今年 {age} 岁")

# while 循环
count = 0
while count < 5:
    print(f"计数: {count}")
    count += 1

# break 跳出循环
for i in range(10):
    if i == 5:
        print("找到目标，跳出循环")
        break
    print(f"当前值: {i}")

# continue 跳过当前迭代
for i in range(10):
    if i % 2 == 0:
        continue
    print(f"奇数: {i}")

# 循环 else 子句
for i in range(5):
    print(f"值: {i}")
else:
    print("循环正常结束")

# 实际应用：查找元素
numbers = [1, 3, 5, 7, 9]
target = 5
found = False

for num in numbers:
    if num == target:
        found = True
        print(f"找到目标: {target}")
        break

if not found:
    print(f"未找到目标: {target}")

# 实际应用：计算阶乘
n = 5
factorial = 1
for i in range(1, n + 1):
    factorial *= i
print(f"{n}! = {factorial}")

# 实际应用：斐波那契数列
n = 10
fib = [0, 1]
for i in range(2, n):
    fib.append(fib[i-1] + fib[i-2])
print(f"斐波那契数列前 {n} 项: {fib}")
```

#### [场景] 典型应用场景

1. 数据验证：检查输入数据是否符合要求
2. 批量处理：遍历列表处理每个元素
3. 游戏逻辑：根据条件执行不同操作

### 3. 函数定义

#### [概念] 概念解释

函数是组织好的、可重复使用的代码块，用于执行特定任务。函数可以提高代码的模块化和可重用性。

#### [语法] 核心语法 / 命令 / API

**函数定义：**

```python
def function_name(parameters):
    """文档字符串"""
    return value
```

**参数类型：**

| 类型 | 语法 | 说明 |
|------|------|------|
| 位置参数 | `def func(a, b)` | 按位置传递 |
| 默认参数 | `def func(a=1)` | 有默认值 |
| 关键字参数 | `func(a=1, b=2)` | 按名称传递 |
| 可变参数 | `def func(*args)` | 接收任意数量位置参数 |
| 关键字可变参数 | `def func(**kwargs)` | 接收任意数量关键字参数 |

#### [代码] 代码示例

```python
# 基本函数定义
def greet(name):
    """问候函数"""
    return f"Hello, {name}!"

message = greet("Alice")
print(message)

# 带默认参数的函数
def power(base, exponent=2):
    """计算幂"""
    return base ** exponent

print(f"2^2 = {power(2)}")
print(f"2^3 = {power(2, 3)}")
print(f"2^3 = {power(base=2, exponent=3)}")

# 多返回值
def get_min_max(numbers):
    """返回最小值和最大值"""
    return min(numbers), max(numbers)

minimum, maximum = get_min_max([1, 5, 3, 9, 2])
print(f"最小值: {minimum}, 最大值: {maximum}")

# 可变参数 *args
def sum_all(*args):
    """计算所有参数的和"""
    total = 0
    for num in args:
        total += num
    return total

print(f"求和: {sum_all(1, 2, 3, 4, 5)}")

# 关键字可变参数 **kwargs
def print_info(**kwargs):
    """打印所有关键字参数"""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="Beijing")

# 混合参数
def create_profile(name, age, *hobbies, **details):
    """创建用户档案"""
    profile = {
        "name": name,
        "age": age,
        "hobbies": hobbies,
        "details": details
    }
    return profile

profile = create_profile(
    "Alice", 30,
    "reading", "coding", "gaming",
    city="Beijing", job="Engineer"
)
print(f"档案: {profile}")

# 递归函数
def factorial(n):
    """计算阶乘（递归）"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"5! = {factorial(5)}")

# 斐波那契数列（递归）
def fibonacci(n):
    """计算斐波那契数列第 n 项"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"斐波那契第 10 项: {fibonacci(10)}")

# 高阶函数：函数作为参数
def apply_operation(x, y, operation):
    """应用操作"""
    return operation(x, y)

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

print(f"加法: {apply_operation(5, 3, add)}")
print(f"乘法: {apply_operation(5, 3, multiply)}")

# Lambda 表达式
square = lambda x: x ** 2
print(f"平方: {square(5)}")

add_lambda = lambda a, b: a + b
print(f"Lambda 加法: {add_lambda(3, 4)}")

# Lambda 与内置函数配合
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
print(f"映射平方: {squared}")

evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"过滤偶数: {evens}")

# 闭包
def counter():
    """计数器闭包"""
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

my_counter = counter()
print(f"计数: {my_counter()}")
print(f"计数: {my_counter()}")
print(f"计数: {my_counter()}")

# 装饰器基础
def log_function(func):
    """日志装饰器"""
    def wrapper(*args, **kwargs):
        print(f"调用函数: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"函数返回: {result}")
        return result
    return wrapper

@log_function
def add_numbers(a, b):
    return a + b

add_numbers(3, 5)
```

#### [场景] 典型应用场景

1. 工具函数：封装常用操作，如字符串处理、数学计算
2. 业务逻辑：将复杂业务拆分为多个函数
3. 回调机制：将函数作为参数传递，实现灵活的控制

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 列表推导式

#### [概念] 概念与解决的问题

列表推导式提供了一种简洁的方式来创建列表。相比传统的 for 循环，代码更简洁、可读性更好、性能更高。

#### [语法] 核心用法

**基本语法：**

```python
[expression for item in iterable]
[expression for item in iterable if condition]
[expression for item in iterable if condition1 if condition2]
```

#### [代码] 代码示例

```python
# 基本列表推导式
numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers]
print(f"平方: {squares}")

# 带条件的列表推导式
evens = [x for x in numbers if x % 2 == 0]
print(f"偶数: {evens}")

# 带多个条件
filtered = [x for x in range(20) if x % 2 == 0 if x % 3 == 0]
print(f"偶数且能被3整除: {filtered}")

# 带表达式
prices = [100, 200, 300, 400]
discounted = [price * 0.9 for price in prices]
print(f"打折后: {discounted}")

# 嵌套列表推导式
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print(f"扁平化: {flattened}")

# 字典推导式
words = ["apple", "banana", "cherry"]
word_lengths = {word: len(word) for word in words}
print(f"单词长度: {word_lengths}")

# 集合推导式
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_squares = {x ** 2 for x in numbers}
print(f"唯一平方: {unique_squares}")

# 生成器表达式（惰性求值）
numbers = range(10)
squares_gen = (x ** 2 for x in numbers)
print(f"生成器: {squares_gen}")
print(f"转列表: {list(squares_gen)}")

# 实际应用：数据转换
students = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78}
]

names = [s["name"] for s in students]
high_scores = [s for s in students if s["score"] >= 80]
score_map = {s["name"]: s["score"] for s in students}

print(f"姓名列表: {names}")
print(f"高分学生: {high_scores}")
print(f"成绩映射: {score_map}")

# 实际应用：字符串处理
sentences = ["Hello World", "Python Programming", "Data Science"]
words = [word for sentence in sentences for word in sentence.split()]
print(f"所有单词: {words}")

# 实际应用：条件转换
scores = [85, 92, 78, 95, 60]
grades = ["A" if s >= 90 else "B" if s >= 80 else "C" for s in scores]
print(f"等级: {grades}")
```

#### [关联] 与核心层的关联

列表推导式是 for 循环的语法糖，结合了循环和条件判断，用于高效地创建和转换数据结构。

### 2. 文件操作

#### [概念] 概念与解决的问题

文件操作是程序与外部存储交互的基础。Python 提供了简单易用的文件操作接口，支持读写文本文件和二进制文件。

#### [语法] 核心用法

**文件操作模式：**

| 模式 | 说明 |
|------|------|
| r | 只读（默认） |
| w | 写入（覆盖） |
| a | 追加 |
| x | 创建（文件存在则报错） |
| b | 二进制模式 |
| + | 读写模式 |

#### [代码] 代码示例

```python
import json
import csv
import os

# 写入文本文件
with open("example.txt", "w", encoding="utf-8") as f:
    f.write("Hello, Python!\n")
    f.write("文件操作示例\n")
    f.writelines(["第一行\n", "第二行\n", "第三行\n"])

# 读取文本文件
with open("example.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print("全部内容:")
    print(content)

# 逐行读取
with open("example.txt", "r", encoding="utf-8") as f:
    print("逐行读取:")
    for line_num, line in enumerate(f, 1):
        print(f"第 {line_num} 行: {line.strip()}")

# 读取所有行到列表
with open("example.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(f"所有行: {lines}")

# 追加内容
with open("example.txt", "a", encoding="utf-8") as f:
    f.write("追加的内容\n")

# JSON 文件操作
data = {
    "name": "Alice",
    "age": 30,
    "hobbies": ["reading", "coding", "gaming"]
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", "r", encoding="utf-8") as f:
    loaded_data = json.load(f)
    print(f"加载的 JSON: {loaded_data}")

# CSV 文件操作
students = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78}
]

with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(students)

with open("students.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"学生: {row['name']}, 成绩: {row['score']}")

# 文件和目录操作
print(f"文件是否存在: {os.path.exists('example.txt')}")
print(f"是否为文件: {os.path.isfile('example.txt')}")
print(f"文件大小: {os.path.getsize('example.txt')} 字节")

# 创建目录
os.makedirs("output", exist_ok=True)

# 列出目录内容
print(f"当前目录文件: {os.listdir('.')}")

# 文件路径操作
path = "data/subdir/file.txt"
print(f"目录名: {os.path.dirname(path)}")
print(f"文件名: {os.path.basename(path)}")
print(f"扩展名: {os.path.splitext(path)[1]}")

# 二进制文件操作
with open("binary.bin", "wb") as f:
    f.write(b"\x00\x01\x02\x03\x04\x05")

with open("binary.bin", "rb") as f:
    binary_data = f.read()
    print(f"二进制数据: {binary_data}")

# 清理临时文件
import glob
for file in glob.glob("*.txt") + glob.glob("*.json") + glob.glob("*.csv") + glob.glob("*.bin"):
    os.remove(file)
    print(f"删除文件: {file}")
```

#### [关联] 与核心层的关联

文件操作结合了变量、数据类型和控制流，用于持久化存储程序数据，是实现数据持久化的基础。

### 3. 异常处理

#### [概念] 概念与解决的问题

异常处理用于捕获和处理程序运行时的错误，防止程序崩溃。良好的异常处理可以提高程序的健壮性和用户体验。

#### [语法] 核心用法

**异常处理结构：**

```python
try:
    pass
except ExceptionType as e:
    pass
except (ExceptionType1, ExceptionType2) as e:
    pass
else:
    pass
finally:
    pass
```

#### [代码] 代码示例

```python
# 基本异常处理
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"捕获异常: {e}")

# 多个异常类型
try:
    numbers = [1, 2, 3]
    print(numbers[10])
except IndexError as e:
    print(f"索引错误: {e}")
except KeyError as e:
    print(f"键错误: {e}")

# 捕获多个异常
try:
    value = int("abc")
except (ValueError, TypeError) as e:
    print(f"类型或值错误: {e}")

# else 和 finally
try:
    result = 10 / 2
except ZeroDivisionError as e:
    print(f"除零错误: {e}")
else:
    print(f"计算成功: {result}")
finally:
    print("清理资源")

# 自定义异常
class InsufficientBalanceError(Exception):
    """余额不足异常"""
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"余额不足: 当前余额 {balance}, 需要 {amount}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientBalanceError(balance, amount)
    return balance - amount

try:
    new_balance = withdraw(100, 150)
except InsufficientBalanceError as e:
    print(f"取款失败: {e}")

# 异常链
class DatabaseError(Exception):
    pass

class ConnectionError(DatabaseError):
    pass

try:
    try:
        raise ConnectionError("无法连接数据库")
    except ConnectionError as e:
        raise DatabaseError("数据库操作失败") from e
except DatabaseError as e:
    print(f"捕获异常: {e}")
    print(f"原始异常: {e.__cause__}")

# 上下文管理器
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        if exc_type:
            print(f"发生异常: {exc_val}")
        return False

with FileManager("test.txt", "w") as f:
    f.write("测试内容")

# 断言
def calculate_average(numbers):
    assert len(numbers) > 0, "列表不能为空"
    return sum(numbers) / len(numbers)

try:
    avg = calculate_average([])
except AssertionError as e:
    print(f"断言失败: {e}")

# 实际应用：安全的类型转换
def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

print(f"安全转换: {safe_int('123')}")
print(f"安全转换: {safe_int('abc', -1)}")

# 实际应用：重试机制
import time

def retry(func, max_attempts=3, delay=1):
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            print(f"第 {attempt + 1} 次尝试失败: {e}, {delay}秒后重试")
            time.sleep(delay)

def unreliable_operation():
    import random
    if random.random() < 0.7:
        raise ValueError("操作失败")
    return "成功"

try:
    result = retry(unreliable_operation)
    print(f"最终结果: {result}")
except Exception as e:
    print(f"所有尝试失败: {e}")
```

#### [关联] 与核心层的关联

异常处理是对程序执行流程的补充控制，在函数调用和文件操作中尤为重要，确保程序在出错时能够优雅地处理。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 装饰器 | 需要在不修改函数代码的情况下增强函数功能 |
| 生成器 | 需要处理大量数据或无限序列，节省内存 |
| 上下文管理器 | 需要管理资源（文件、连接）的生命周期 |
| 类与对象 | 需要面向对象编程，封装数据和行为 |
| 继承与多态 | 需要代码复用和接口统一 |
| 魔术方法 | 需要自定义类的行为（如 `__str__`, `__len__`） |
| 模块与包 | 需要组织大型项目代码 |
| 多线程 | 需要并发执行 I/O 密集型任务 |
| 多进程 | 需要并行执行 CPU 密集型任务 |
| 异步编程 | 需要高并发的网络请求处理 |
| 正则表达式 | 需要复杂的字符串匹配和提取 |
| 日期时间 | 需要处理日期时间计算和格式化 |
| 类型提示 | 需要静态类型检查，提高代码可维护性 |
| 单元测试 | 需要自动化测试代码正确性 |
| 虚拟环境 | 需要隔离项目依赖 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个简单的通讯录管理程序

**任务描述：**

创建一个通讯录管理程序，支持以下功能：
1. 添加联系人（姓名、电话、邮箱）
2. 删除联系人
3. 查找联系人
4. 列出所有联系人
5. 保存到文件
6. 从文件加载

**要求：**
- 使用字典存储联系人数据
- 使用函数封装各个功能
- 使用异常处理保证程序健壮性
- 使用 JSON 格式持久化数据

**参考实现：**

```python
import json
import os

class ContactManager:
    def __init__(self, filename="contacts.json"):
        self.filename = filename
        self.contacts = {}
        self.load_contacts()
    
    def add_contact(self, name, phone, email):
        if name in self.contacts:
            raise ValueError(f"联系人 '{name}' 已存在")
        self.contacts[name] = {
            "phone": phone,
            "email": email
        }
        self.save_contacts()
        return f"已添加联系人: {name}"
    
    def delete_contact(self, name):
        if name not in self.contacts:
            raise KeyError(f"联系人 '{name}' 不存在")
        del self.contacts[name]
        self.save_contacts()
        return f"已删除联系人: {name}"
    
    def find_contact(self, name):
        if name not in self.contacts:
            raise KeyError(f"联系人 '{name}' 不存在")
        return self.contacts[name]
    
    def list_contacts(self):
        if not self.contacts:
            return "通讯录为空"
        result = "通讯录:\n"
        for name, info in self.contacts.items():
            result += f"  {name}: 电话={info['phone']}, 邮箱={info['email']}\n"
        return result
    
    def search_contacts(self, keyword):
        results = {
            name: info for name, info in self.contacts.items()
            if keyword.lower() in name.lower()
            or keyword in info["phone"]
            or keyword.lower() in info["email"].lower()
        }
        if not results:
            return f"未找到包含 '{keyword}' 的联系人"
        result = f"搜索结果:\n"
        for name, info in results.items():
            result += f"  {name}: 电话={info['phone']}, 邮箱={info['email']}\n"
        return result
    
    def save_contacts(self):
        with open(self.filename, "w", encoding="utf-8") as f:
            json.dump(self.contacts, f, ensure_ascii=False, indent=2)
    
    def load_contacts(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, "r", encoding="utf-8") as f:
                    self.contacts = json.load(f)
            except json.JSONDecodeError:
                self.contacts = {}

def main():
    manager = ContactManager()
    
    while True:
        print("\n=== 通讯录管理 ===")
        print("1. 添加联系人")
        print("2. 删除联系人")
        print("3. 查找联系人")
        print("4. 列出所有联系人")
        print("5. 搜索联系人")
        print("0. 退出")
        
        choice = input("请选择操作: ").strip()
        
        if choice == "1":
            try:
                name = input("姓名: ").strip()
                phone = input("电话: ").strip()
                email = input("邮箱: ").strip()
                print(manager.add_contact(name, phone, email))
            except ValueError as e:
                print(f"错误: {e}")
        
        elif choice == "2":
            try:
                name = input("姓名: ").strip()
                print(manager.delete_contact(name))
            except KeyError as e:
                print(f"错误: {e}")
        
        elif choice == "3":
            try:
                name = input("姓名: ").strip()
                info = manager.find_contact(name)
                print(f"联系人: {name}")
                print(f"  电话: {info['phone']}")
                print(f"  邮箱: {info['email']}")
            except KeyError as e:
                print(f"错误: {e}")
        
        elif choice == "4":
            print(manager.list_contacts())
        
        elif choice == "5":
            keyword = input("搜索关键词: ").strip()
            print(manager.search_contacts(keyword))
        
        elif choice == "0":
            print("再见!")
            break
        
        else:
            print("无效选择，请重试")

if __name__ == "__main__":
    main()
```
