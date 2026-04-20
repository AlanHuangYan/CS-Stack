# Flutter 基础 三层深度学习教程

## [总览] 技术总览

Flutter 是 Google 开发的 UI 工具包，用于构建跨平台应用。使用 Dart 语言，采用声明式 UI 开发模式，一套代码可运行在 iOS、Android、Web 和桌面平台。Flutter 的热重载特性大幅提升开发效率。

本教程采用三层漏斗学习法：**核心层**聚焦 Widget 开发、布局系统、导航管理三大基石；**重点层**深入状态管理、网络请求、数据持久化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Flutter 开发 **50% 以上** 的常见任务。

### 1. Widget 开发

#### [概念] 概念解释

Widget 是 Flutter 的核心概念，所有 UI 元素都是 Widget。分为 StatelessWidget（无状态）和 StatefulWidget（有状态）两种类型。

#### [语法] 核心语法 / 命令 / API

**核心 Widget：**

| Widget | 说明 |
|--------|------|
| Text | 文本显示 |
| Image | 图片显示 |
| Container | 容器 |
| Row/Column | 行列布局 |
| ListView | 列表 |
| GestureDetector | 手势检测 |

#### [代码] 代码示例

```dart
// main.dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final List<String> _tasks = [];
  final TextEditingController _controller = TextEditingController();

  void _addTask() {
    if (_controller.text.isNotEmpty) {
      setState(() {
        _tasks.add(_controller.text);
        _controller.clear();
      });
    }
  }

  void _deleteTask(int index) {
    setState(() {
      _tasks.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('待办事项'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: '添加新任务',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: _addTask,
                  child: const Text('添加'),
                ),
              ],
            ),
          ),
          Expanded(
            child: _tasks.isEmpty
                ? const Center(child: Text('暂无任务'))
                : ListView.builder(
                    itemCount: _tasks.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(_tasks[index]),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () => _deleteTask(index),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
```

#### [场景] 典型应用场景

1. 构建表单界面
2. 显示列表数据
3. 处理用户交互

### 2. 布局系统

#### [概念] 概念解释

Flutter 使用声明式布局系统，通过组合 Widget 构建复杂界面。常用布局包括 Row、Column、Stack、Flex 等。

#### [语法] 核心语法 / 命令 / API

**布局 Widget：**

| Widget | 说明 |
|--------|------|
| Row | 水平布局 |
| Column | 垂直布局 |
| Stack | 层叠布局 |
| Expanded | 弹性填充 |
| Container | 容器 |
| Card | 卡片 |

#### [代码] 代码示例

```dart
// 布局示例
import 'package:flutter/material.dart';

class LayoutExample extends StatelessWidget {
  const LayoutExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('布局示例')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 水平布局
              const Text('水平布局:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildColorBox(Colors.red),
                  _buildColorBox(Colors.green),
                  _buildColorBox(Colors.blue),
                ],
              ),
              const SizedBox(height: 24),
              
              // 弹性布局
              const Text('弹性布局:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(flex: 1, child: _buildColorBox(Colors.red)),
                  Expanded(flex: 2, child: _buildColorBox(Colors.green)),
                  Expanded(flex: 1, child: _buildColorBox(Colors.blue)),
                ],
              ),
              const SizedBox(height: 24),
              
              // 卡片布局
              const Text('卡片布局:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('卡片标题', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      const Text('卡片内容描述，可以包含多行文本。'),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(onPressed: () {}, child: const Text('取消')),
                          ElevatedButton(onPressed: () {}, child: const Text('确认')),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // 层叠布局
              const Text('层叠布局:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              SizedBox(
                height: 200,
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '层叠内容',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColorBox(Color color) {
    return Container(
      height: 80,
      width: 80,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
```

#### [场景] 典型应用场景

1. 创建响应式布局
2. 设计卡片样式
3. 构建复杂界面

### 3. 导航管理

#### [概念] 概念解释

Flutter 提供声明式导航 API，Navigator 2.0 支持更灵活的路由管理。GoRouter 等第三方库简化了导航配置。

#### [语法] 核心语法 / 命令 / API

**导航方式：**

| 方式 | 说明 |
|------|------|
| Navigator.push | 跳转页面 |
| Navigator.pop | 返回页面 |
| named routes | 命名路由 |
| GoRouter | 声明式路由 |

#### [代码] 代码示例

```dart
// 导航示例
import 'package:flutter/material.dart';

void main() {
  runApp(const NavigationApp());
}

class NavigationApp extends StatelessWidget {
  const NavigationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '导航示例',
      initialRoute: '/',
      routes: {
        '/': (context) => const FirstScreen(),
        '/second': (context) => const SecondScreen(),
      },
      onGenerateRoute: (settings) {
        // 处理动态路由
        if (settings.name == '/detail') {
          final args = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (context) => DetailScreen(
              id: args['id'],
              title: args['title'],
            ),
          );
        }
        return null;
      },
    );
  }
}

class FirstScreen extends StatelessWidget {
  const FirstScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('第一页')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/second');
              },
              child: const Text('跳转到第二页'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(
                  context,
                  '/detail',
                  arguments: {'id': 123, 'title': '示例标题'},
                );
              },
              child: const Text('跳转到详情页'),
            ),
          ],
        ),
      ),
    );
  }
}

class SecondScreen extends StatelessWidget {
  const SecondScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('第二页')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('返回'),
        ),
      ),
    );
  }
}

class DetailScreen extends StatelessWidget {
  final int id;
  final String title;

  const DetailScreen({super.key, required this.id, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('ID: $id'),
            Text('Title: $title'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('返回'),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### [场景] 典型应用场景

1. 多页面应用导航
2. 页面间参数传递
3. 深层链接

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Flutter 应用质量和开发效率将显著提升。

### 1. 状态管理

#### [概念] 概念与解决的问题

Flutter 状态管理方案包括 Provider、Riverpod、Bloc 等。合理的状态管理可以简化数据流，提高代码可维护性。

#### [语法] 核心用法

**状态管理方案：**

| 方案 | 特点 |
|------|------|
| Provider | 简单易用 |
| Riverpod | 安全灵活 |
| Bloc | 事件驱动 |

#### [代码] 代码示例

```dart
// 使用 Riverpod 状态管理
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 定义状态
class Task {
  final String id;
  final String title;
  final bool completed;

  Task({required this.id, required this.title, this.completed = false});

  Task copyWith({String? id, String? title, bool? completed}) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      completed: completed ?? this.completed,
    );
  }
}

// 定义 Notifier
class TaskNotifier extends StateNotifier<List<Task>> {
  TaskNotifier() : super([]);

  void addTask(String title) {
    state = [...state, Task(id: DateTime.now().toString(), title: title)];
  }

  void toggleTask(String id) {
    state = state.map((task) {
      if (task.id == id) {
        return task.copyWith(completed: !task.completed);
      }
      return task;
    }).toList();
  }

  void deleteTask(String id) {
    state = state.where((task) => task.id != id).toList();
  }
}

// 定义 Provider
final taskProvider = StateNotifierProvider<TaskNotifier, List<Task>>((ref) {
  return TaskNotifier();
});

// 使用 Provider
class TaskListScreen extends ConsumerWidget {
  const TaskListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(taskProvider);
    final taskNotifier = ref.read(taskProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('任务列表')),
      body: ListView.builder(
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final task = tasks[index];
          return ListTile(
            leading: Checkbox(
              value: task.completed,
              onChanged: (_) => taskNotifier.toggleTask(task.id),
            ),
            title: Text(
              task.title,
              style: TextStyle(
                decoration: task.completed ? TextDecoration.lineThrough : null,
              ),
            ),
            trailing: IconButton(
              icon: const Icon(Icons.delete),
              onPressed: () => taskNotifier.deleteTask(task.id),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, taskNotifier),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context, TaskNotifier notifier) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('添加任务'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: '任务标题'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                notifier.addTask(controller.text);
                Navigator.pop(context);
              }
            },
            child: const Text('添加'),
          ),
        ],
      ),
    );
  }
}
```

#### [关联] 与核心层的关联

状态管理是 StatefulWidget 的扩展，提供全局状态管理能力。

### 2. 网络请求

#### [概念] 概念与解决的问题

Flutter 应用通常需要与后端 API 交互，使用 http 或 dio 库进行网络请求。

#### [语法] 核心用法

**网络请求流程：**

1. 创建 HTTP 客户端
2. 发起请求
3. 解析响应
4. 处理错误

#### [代码] 代码示例

```dart
// 网络请求示例
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class User {
  final int id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}

class ApiService {
  static const String baseUrl = 'https://api.example.com';

  Future<List<User>> getUsers() async {
    final response = await http.get(Uri.parse('$baseUrl/users'));
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load users');
    }
  }

  Future<User> createUser(String name, String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'name': name, 'email': email}),
    );
    
    if (response.statusCode == 201) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create user');
    }
  }
}

// 使用 FutureBuilder
class UserListScreen extends StatelessWidget {
  final ApiService _apiService = ApiService();

  UserListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('用户列表')),
      body: FutureBuilder<List<User>>(
        future: _apiService.getUsers(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('错误: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('暂无数据'));
          }
          
          final users = snapshot.data!;
          return ListView.builder(
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              return ListTile(
                title: Text(user.name),
                subtitle: Text(user.email),
              );
            },
          );
        },
      ),
    );
  }
}
```

#### [场景] 典型应用场景

1. 获取服务器数据
2. 提交表单数据
3. 文件上传下载

### 3. 数据持久化

#### [概念] 概念与解决的问题

Flutter 提供多种数据持久化方案，包括 SharedPreferences、Hive、SQLite 等。

#### [语法] 核心用法

**持久化方案：**

| 方案 | 适用场景 |
|------|----------|
| SharedPreferences | 简单键值对 |
| Hive | 轻量级数据库 |
| SQLite | 关系型数据库 |

#### [代码] 代码示例

```dart
// 使用 SharedPreferences
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsService {
  static const String _themeKey = 'theme_mode';
  static const String _languageKey = 'language';

  Future<ThemeMode> getThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final themeName = prefs.getString(_themeKey) ?? 'system';
    
    switch (themeName) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, mode.name);
  }

  Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_languageKey) ?? 'zh';
  }

  Future<void> setLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, language);
  }
}

// 使用 Hive
import 'package:hive_flutter/hive_flutter.dart';

class TaskService {
  static const String _boxName = 'tasks';
  late Box<Map> _box;

  Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox<Map>(_boxName);
  }

  Future<void> addTask(Task task) async {
    await _box.put(task.id, task.toJson());
  }

  List<Task> getAllTasks() {
    return _box.values.map((json) => Task.fromJson(Map<String, dynamic>.from(json))).toList();
  }

  Future<void> deleteTask(String id) async {
    await _box.delete(id);
  }
}
```

#### [场景] 典型应用场景

1. 保存用户设置
2. 缓存应用数据
3. 离线数据存储

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Hot Reload | 需要快速开发调试时 |
| Widget Inspector | 需要调试 UI 时 |
| Animation | 需要动画效果时 |
| Custom Painter | 需要自定义绘制时 |
| Platform Channels | 需要原生功能时 |
| Firebase | 需要后端服务时 |
| Flutter Web | 需要 Web 应用时 |
| Flutter Desktop | 需要桌面应用时 |
| Testing | 需要测试应用时 |
| CI/CD | 需要自动化构建时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建一个完整的待办事项应用

**任务描述：**
使用 Flutter 构建一个待办事项应用，支持添加、删除、标记完成功能，使用状态管理和本地存储。

**要求：**
- 使用 Riverpod 管理状态
- 使用 Hive 进行本地存储
- 实现完整的 CRUD 操作
- 添加主题切换功能

**参考实现：**

```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: '待办事项',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
```
