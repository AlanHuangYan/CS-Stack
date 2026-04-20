# iOS 开发基础 三层深度学习教程

## [总览] 技术总览

iOS 是苹果公司的移动操作系统，iOS 开发使用 Swift 语言和 SwiftUI/UIKit 框架。现代 iOS 开发推荐使用 Swift + SwiftUI 组合，实现声明式 UI 开发，配合 Xcode 提供的强大工具链。

本教程采用三层漏斗学习法：**核心层**聚焦视图与布局、数据绑定、导航管理三大基石；**重点层**深入网络请求、数据持久化、MVVM 架构；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 iOS 开发 **50% 以上** 的常见任务。

### 1. 视图与布局

#### [概念] 概念解释

SwiftUI 使用声明式语法构建 UI，通过组合视图和修饰符创建复杂的界面。视图是 SwiftUI 的核心概念，所有 UI 元素都是视图。

#### [语法] 核心语法 / 命令 / API

**常用视图：**

| 视图 | 说明 |
|------|------|
| Text | 文本显示 |
| Image | 图片显示 |
| Button | 按钮 |
| TextField | 文本输入 |
| List | 列表 |
| VStack/HStack/ZStack | 布局容器 |

#### [代码] 代码示例

```swift
// ContentView.swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            // 标题
            Text("Hello iOS!")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            // 图片
            Image(systemName: "globe")
                .resizable()
                .frame(width: 100, height: 100)
                .foregroundColor(.accentColor)
            
            // 输入框
            TextField("请输入内容", text: .constant(""))
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)
            
            // 按钮
            Button(action: {
                print("按钮被点击")
            }) {
                Text("点击我")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(10)
            }
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
```

```swift
// 列表视图示例
struct UserListView: View {
    let users = [
        User(id: 1, name: "张三", email: "zhangsan@example.com"),
        User(id: 2, name: "李四", email: "lisi@example.com"),
        User(id: 3, name: "王五", email: "wangwu@example.com")
    ]
    
    var body: some View {
        NavigationView {
            List(users) { user in
                VStack(alignment: .leading) {
                    Text(user.name)
                        .font(.headline)
                    Text(user.email)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
            .navigationTitle("用户列表")
        }
    }
}

struct User: Identifiable {
    let id: Int
    let name: String
    let email: String
}
```

#### [场景] 典型应用场景

1. 构建登录界面
2. 显示列表数据
3. 创建表单输入

### 2. 数据绑定

#### [概念] 概念解释

SwiftUI 使用 @State、@Binding、@ObservedObject 等属性包装器实现数据绑定，当数据变化时自动更新视图。

#### [语法] 核心语法 / 命令 / API

**属性包装器：**

| 包装器 | 说明 |
|--------|------|
| @State | 视图内部状态 |
| @Binding | 双向绑定 |
| @ObservedObject | 观察对象 |
| @StateObject | 持有对象 |
| @EnvironmentObject | 环境对象 |

#### [代码] 代码示例

```swift
// @State 状态管理
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("计数: \(count)")
                .font(.largeTitle)
            
            HStack(spacing: 20) {
                Button("-") {
                    count -= 1
                }
                .font(.title)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
                
                Button("+") {
                    count += 1
                }
                .font(.title)
                .padding()
                .background(Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
    }
}
```

```swift
// @ObservedObject 和 ObservableObject
import Combine

class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadUsers() {
        isLoading = true
        errorMessage = nil
        
        // 模拟网络请求
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.users = [
                User(id: 1, name: "张三", email: "zhangsan@example.com"),
                User(id: 2, name: "李四", email: "lisi@example.com")
            ]
            self.isLoading = false
        }
    }
    
    func addUser(name: String, email: String) {
        let newUser = User(id: users.count + 1, name: name, email: email)
        users.append(newUser)
    }
}

struct UserView: View {
    @StateObject private var viewModel = UserViewModel()
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("加载中...")
                } else if let error = viewModel.errorMessage {
                    Text("错误: \(error)")
                } else {
                    List(viewModel.users) { user in
                        VStack(alignment: .leading) {
                            Text(user.name)
                            Text(user.email)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
            .navigationTitle("用户列表")
            .onAppear {
                viewModel.loadUsers()
            }
        }
    }
}
```

```swift
// @Binding 双向绑定
struct InputField: View {
    @Binding var text: String
    
    var body: some View {
        TextField("请输入", text: $text)
            .textFieldStyle(RoundedBorderTextFieldStyle())
            .padding()
    }
}

struct ParentView: View {
    @State private var inputText = ""
    
    var body: some View {
        VStack {
            InputField(text: $inputText)
            Text("你输入了: \(inputText)")
        }
    }
}
```

#### [场景] 典型应用场景

1. 表单输入和验证
2. 列表数据管理
3. 状态同步更新

### 3. 导航管理

#### [概念] 概念解释

SwiftUI 提供声明式的导航 API，支持 NavigationStack、sheet、fullScreenCover 等导航方式。

#### [语法] 核心语法 / 命令 / API

**导航方式：**

| 方式 | 说明 |
|------|------|
| NavigationStack | 栈式导航 |
| sheet | 模态弹出 |
| fullScreenCover | 全屏弹出 |
| NavigationLink | 导航链接 |

#### [代码] 代码示例

```swift
// NavigationStack 导航
struct MainView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("用户列表", value: Route.users)
                NavigationLink("设置", value: Route.settings)
            }
            .navigationDestination(for: Route.self) { route in
                switch route {
                case .users:
                    UserListView()
                case .settings:
                    SettingsView()
                }
            }
            .navigationTitle("首页")
        }
    }
}

enum Route: Hashable {
    case users
    case settings
}
```

```swift
// sheet 模态弹出
struct ContentView: View {
    @State private var showDetail = false
    @State private var selectedItem: Item?
    
    var body: some View {
        VStack {
            Button("显示详情") {
                showDetail = true
            }
        }
        .sheet(isPresented: $showDetail) {
            DetailView()
        }
        .sheet(item: $selectedItem) { item in
            ItemDetailView(item: item)
        }
    }
}

struct DetailView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack {
            Text("详情页面")
            Button("关闭") {
                dismiss()
            }
        }
    }
}
```

#### [场景] 典型应用场景

1. 页面跳转
2. 模态弹窗
3. 深层链接

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 iOS 开发能力和应用质量将显著提升。

### 1. 网络请求

#### [概念] 概念与解决的问题

iOS 应用通常需要与后端 API 交互，使用 URLSession 或第三方库如 Alamofire 进行网络请求。

#### [语法] 核心用法

**网络请求流程：**

1. 创建 URL 请求
2. 发起网络请求
3. 解析响应数据
4. 处理错误

#### [代码] 代码示例

```swift
// URLSession 网络请求
import Foundation

struct APIService {
    let baseURL = "https://api.example.com"
    
    func fetchUsers() async throws -> [User] {
        let url = URL(string: "\(baseURL)/users")!
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let users = try JSONDecoder().decode([User].self, from: data)
        return users
    }
    
    func createUser(name: String, email: String) async throws -> User {
        let url = URL(string: "\(baseURL)/users")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["name": name, "email": email]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(User.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case decodingError
}
```

```swift
// 在 ViewModel 中使用
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    func loadUsers() async {
        isLoading = true
        errorMessage = nil
        
        do {
            users = try await apiService.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}
```

#### [关联] 与核心层的关联

网络请求是数据绑定的数据来源，通过异步获取数据更新视图状态。

### 2. 数据持久化

#### [概念] 概念与解决的问题

iOS 提供多种数据持久化方式，包括 UserDefaults、FileManager、Core Data 和 SwiftData。

#### [语法] 核心用法

**持久化方式对比：**

| 方式 | 适用场景 |
|------|----------|
| UserDefaults | 简单配置 |
| FileManager | 文件存储 |
| Core Data | 关系数据库 |
| SwiftData | 现代 ORM |

#### [代码] 代码示例

```swift
// UserDefaults
class SettingsManager {
    static let shared = SettingsManager()
    private let defaults = UserDefaults.standard
    
    private init() {}
    
    var username: String {
        get { defaults.string(forKey: "username") ?? "" }
        set { defaults.set(newValue, forKey: "username") }
    }
    
    var isDarkMode: Bool {
        get { defaults.bool(forKey: "isDarkMode") }
        set { defaults.set(newValue, forKey: "isDarkMode") }
    }
}
```

```swift
// SwiftData 示例
import SwiftData

@Model
class User {
    var id: UUID
    var name: String
    var email: String
    var createdAt: Date
    
    init(name: String, email: String) {
        self.id = UUID()
        self.name = name
        self.email = email
        self.createdAt = Date()
    }
}

// 配置容器
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: User.self)
    }
}

// 使用 SwiftData
struct UserListView: View {
    @Query(sort: \User.createdAt, order: .reverse) var users: [User]
    @Environment(\.modelContext) private var context
    
    var body: some View {
        List(users) { user in
            VStack(alignment: .leading) {
                Text(user.name)
                Text(user.email)
                    .font(.caption)
            }
        }
        .toolbar {
            Button("添加") {
                let user = User(name: "新用户", email: "new@example.com")
                context.insert(user)
            }
        }
    }
}
```

#### [场景] 典型应用场景

1. 保存用户设置
2. 缓存应用数据
3. 离线数据存储

### 3. MVVM 架构

#### [概念] 概念与解决的问题

MVVM 是 iOS 推荐的架构模式，分离视图和业务逻辑，提高代码可测试性和可维护性。

#### [语法] 核心用法

**MVVM 分层：**

| 层 | 职责 |
|------|------|
| Model | 数据模型 |
| View | UI 视图 |
| ViewModel | 业务逻辑 |

#### [代码] 代码示例

```swift
// Model
struct User: Codable, Identifiable {
    let id: Int
    let name: String
    let email: String
}

// ViewModel
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            users = try await apiService.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func addUser(name: String, email: String) async {
        do {
            let user = try await apiService.createUser(name: name, email: email)
            users.append(user)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View
struct UserView: View {
    @StateObject private var viewModel = UserViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else {
                    List(viewModel.users) { user in
                        UserRowView(user: user)
                    }
                }
            }
            .navigationTitle("用户")
            .task {
                await viewModel.loadUsers()
            }
        }
    }
}
```

#### [场景] 典型应用场景

1. 构建可维护的应用架构
2. 实现单元测试
3. 处理复杂业务逻辑

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| SwiftUI Animation | 需要动画效果时 |
| Core Location | 需要定位功能时 |
| MapKit | 需要地图功能时 |
| AVFoundation | 需要音视频功能时 |
| Push Notification | 需要推送通知时 |
| Widget | 需要小组件时 |
| App Clips | 需要轻应用时 |
| CloudKit | 需要云同步时 |
| In-App Purchase | 需要内购时 |
| Sign in with Apple | 需要苹果登录时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建一个完整的用户管理应用

**任务描述：**
使用 MVVM 架构构建一个用户管理应用，支持用户列表展示、添加用户、编辑用户和删除用户功能。

**要求：**
- 使用 SwiftUI 构建 UI
- 使用 SwiftData 进行本地数据存储
- 使用 ViewModel 管理状态
- 实现完整的 CRUD 操作

**参考实现：**

```swift
// App 入口
@main
struct UserApp: App {
    var body: some Scene {
        WindowGroup {
            UserListView()
        }
        .modelContainer(for: User.self)
    }
}

// 用户列表视图
struct UserListView: View {
    @Query(sort: \User.createdAt, order: .reverse) var users: [User]
    @Environment(\.modelContext) private var context
    @State private var showAddSheet = false
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(users) { user in
                    NavigationLink(value: user) {
                        UserRowView(user: user)
                    }
                }
                .onDelete(perform: deleteUser)
            }
            .navigationTitle("用户列表")
            .navigationDestination(for: User.self) { user in
                UserDetailView(user: user)
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("添加") {
                        showAddSheet = true
                    }
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddUserView { name, email in
                    let user = User(name: name, email: email)
                    context.insert(user)
                }
            }
        }
    }
    
    private func deleteUser(at offsets: IndexSet) {
        for index in offsets {
            context.delete(users[index])
        }
    }
}
```
