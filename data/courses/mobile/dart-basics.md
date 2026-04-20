# Dart 基础 三层深度学习教程

## [总览] 技术总览

Dart 是 Google 开发的客户端优化编程语言，专为多平台应用开发设计。它是 Flutter 的官方语言，具有 AOT 编译、空安全、异步编程支持等特性。

本教程采用三层漏斗学习法：**核心层**聚焦变量与类型、函数与类、异步编程三大基石；**重点层**深入泛型与集合、空安全、并发编程；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 变量与类型

#### [概念] 概念解释

Dart 是强类型语言，支持类型推断。基本类型包括 num、String、bool、List、Map 等。

#### [代码] 代码示例

```dart
// 变量声明
void main() {
  // 基本类型
  int count = 10;
  double price = 99.9;
  String name = 'Dart';
  bool isActive = true;
  
  // 类型推断
  var message = 'Hello';  // String
  var numbers = [1, 2, 3];  // List<int>
  
  // 动态类型
  dynamic value = 'hello';
  value = 123;  // OK
  
  // 常量
  const pi = 3.14159;  // 编译时常量
  final now = DateTime.now();  // 运行时常量
  
  // 集合
  List<int> list = [1, 2, 3];
  Set<String> set = {'a', 'b', 'c'};
  Map<String, int> map = {'one': 1, 'two': 2};
  
  // 级联操作
  var builder = StringBuffer()
    ..write('Hello')
    ..write(' ')
    ..write('World');
  print(builder);  // Hello World
}
```

### 2. 函数与类

#### [概念] 概念解释

Dart 支持面向对象编程，类是对象的模板。函数是一等公民，支持闭包和高阶函数。

#### [代码] 代码示例

```dart
// 函数定义
int add(int a, int b) => a + b;

// 可选参数
void greet(String name, {String? title, int age = 0}) {
  print('$title $name, age: $age');
}

// 类定义
class Person {
  final String name;
  int _age;  // 私有属性
  
  Person(this.name, this._age);
  
  // Getter
  int get age => _age;
  
  // Setter
  set age(int value) {
    if (value > 0) _age = value;
  }
  
  // 方法
  void sayHello() => print('Hello, I am $name');
  
  // 静态方法
  static Person adult(String name) => Person(name, 18);
}

// 继承
class Student extends Person {
  final String school;
  
  Student(String name, int age, this.school) : super(name, age);
  
  @override
  void sayHello() {
    super.sayHello();
    print('I study at $school');
  }
}

// Mixin
mixin Flying {
  void fly() => print('Flying...');
}

class Bird with Flying {}

// 使用
void main() {
  var student = Student('Tom', 20, 'MIT');
  student.sayHello();
  
  var bird = Bird();
  bird.fly();
}
```

### 3. 异步编程

#### [概念] 概念解释

Dart 使用 Future 和 Stream 处理异步操作。async/await 语法简化了异步代码编写。

#### [代码] 代码示例

```dart
// Future
Future<String> fetchUser() async {
  await Future.delayed(Duration(seconds: 1));
  return 'John';
}

// 使用 async/await
void main() async {
  try {
    var user = await fetchUser();
    print('User: $user');
  } catch (e) {
    print('Error: $e');
  }
}

// Stream
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

void main() async {
  await for (var value in countStream(5)) {
    print(value);
  }
}

// StreamController
import 'dart:async';

class Counter {
  final _controller = StreamController<int>();
  int _count = 0;
  
  Stream<int> get stream => _controller.stream;
  
  void increment() {
    _count++;
    _controller.add(_count);
  }
  
  void dispose() => _controller.close();
}
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 泛型与集合

#### [代码] 代码示例

```dart
// 泛型类
class Box<T> {
  final T value;
  Box(this.value);
  
  R map<R>(R Function(T) f) => f(value);
}

// 泛型方法
T first<T>(List<T> list) => list.first;

// 集合操作
void main() {
  var numbers = [1, 2, 3, 4, 5];
  
  // map
  var doubled = numbers.map((n) => n * 2).toList();
  
  // where
  var evens = numbers.where((n) => n.isEven).toList();
  
  // reduce
  var sum = numbers.reduce((a, b) => a + b);
  
  // fold
  var product = numbers.fold(1, (a, b) => a * b);
  
  // 展开
  var nested = [[1, 2], [3, 4]];
  var flat = nested.expand((e) => e).toList();
}
```

### 2. 空安全

#### [代码] 代码示例

```dart
void main() {
  // 可空类型
  String? name;
  name = 'Dart';
  
  // 空检查
  print(name?.length);  // 安全访问
  print(name!.length);  // 强制解包
  
  // 空合并
  String displayName = name ?? 'Unknown';
  
  // 空赋值
  name ??= 'Default';
}

// 空安全类
class User {
  final String name;
  final int? age;
  
  User({required this.name, this.age});
  
  String get info => '$name (${age ?? "未知"})';
}
```

### 3. 并发编程

#### [代码] 代码示例

```dart
import 'dart:async';
import 'dart:isolate';

// Isolate 并发
Future<void> main() async {
  final receivePort = ReceivePort();
  
  await Isolate.spawn(_heavyComputation, receivePort.sendPort);
  
  receivePort.listen((message) {
    print('Result: $message');
    receivePort.close();
  });
}

void _heavyComputation(SendPort sendPort) {
  var result = 0;
  for (var i = 0; i < 1000000000; i++) {
    result += i;
  }
  sendPort.send(result);
}

// Compute 函数 (Flutter)
Future<int> computeTask() async {
  return await compute(_heavyTask, 1000000000);
}

int _heavyTask(int n) {
  var result = 0;
  for (var i = 0; i < n; i++) {
    result += i;
  }
  return result;
}
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Extension | 需要扩展类型功能时 |
| Callable | 需要可调用对象时 |
| Typedef | 需要类型别名时 |
| Metadata | 需要注解时 |
| Factory | 需要工厂构造函数时 |
| Const Constructor | 需要编译时常量对象时 |
| Enum | 需要枚举类型时 |
| Pattern Matching | 需要模式匹配时 |
| Records | 需要记录类型时 |
| Sealed Class | 需要密封类时 |

---

## [实战] 核心实战清单

### 实战任务 1：实现一个简单的 HTTP 客户端

```dart
import 'dart:convert';
import 'dart:async';
import 'dart:io';

class HttpClient {
  final String baseUrl;
  final Duration timeout;
  
  HttpClient({
    required this.baseUrl,
    this.timeout = const Duration(seconds: 30),
  });
  
  Future<T> get<T>(String path, T Function(Map<String, dynamic>) fromJson) async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse('$baseUrl$path'));
      final response = await request.close().timeout(timeout);
      
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        return fromJson(json.decode(body));
      } else {
        throw HttpException('Request failed: ${response.statusCode}');
      }
    } finally {
      client.close();
    }
  }
}
```
