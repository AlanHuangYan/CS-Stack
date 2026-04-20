# Angular 基础 三层深度学习教程

## [总览] 技术总览

Angular 是 Google 开发的前端框架，采用 TypeScript 编写，提供了完整的开发解决方案。它内置了依赖注入、路由、表单验证、HTTP 客户端等功能，适合构建大型企业级应用。

本教程采用三层漏斗学习法：**核心层**聚焦组件与模板、数据绑定、服务与依赖注入三大基石，掌握后即可完成 50% 以上的日常 Angular 开发任务；**重点层**深入 RxJS 基础和路由，提升异步处理和导航能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 组件与模板

#### [概念] 概念解释

Angular 组件是应用的基本构建单元，由 `@Component` 装饰器定义。每个组件包含模板（HTML）、样式（CSS）和逻辑（TypeScript）。模板定义了组件的视图结构，使用特定的语法绑定数据和事件。

为什么归为核心层？因为组件是 Angular 应用的核心概念，不理解组件和模板就无法构建任何 Angular 应用。

#### [语法] 核心语法 / 命令 / API

| 语法 | 用途 | 示例 |
|------|------|------|
| `{{ }}` | 插值表达式 | `{{ title }}` |
| `[property]` | 属性绑定 | `[src]="imageUrl"` |
| `(event)` | 事件绑定 | `(click)="onClick()"` |
| `[(ngModel)]` | 双向绑定 | `[(ngModel)]="name"` |
| `*ngIf` | 条件渲染 | `*ngIf="isVisible"` |
| `*ngFor` | 列表渲染 | `*ngFor="let item of items"` |

#### [代码] 代码示例

```typescript
// todo.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-todo',
  template: `
    <div class="todo-app">
      <h1>{{ title }}</h1>
      
      <!-- 输入框：双向绑定 -->
      <div class="input-section">
        <input 
          [(ngModel)]="newTodo" 
          (keyup.enter)="addTodo()"
          placeholder="输入待办事项"
        />
        <button (click)="addTodo()">添加</button>
      </div>
      
      <!-- 列表渲染 -->
      <ul class="todo-list">
        <li *ngFor="let todo of todos; let i = index">
          <span [class.completed]="todo.done" (click)="toggleTodo(i)">
            {{ todo.text }}
          </span>
          <button (click)="removeTodo(i)">删除</button>
        </li>
      </ul>
      
      <!-- 条件渲染 -->
      <p *ngIf="todos.length === 0" class="empty-tip">暂无待办事项</p>
      <p *ngIf="todos.length > 0" class="count-tip">共 {{ todos.length }} 项待办</p>
    </div>
  `,
  styles: [`
    .todo-app {
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .input-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 8px 16px;
      background: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .todo-list {
      list-style: none;
      padding: 0;
    }
    .todo-list li {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .completed {
      text-decoration: line-through;
      color: #999;
    }
  `]
})
export class TodoComponent {
  title = '我的待办清单';
  newTodo = '';
  todos = [
    { text: '学习 Angular 基础', done: false },
    { text: '完成组件练习', done: true }
  ];

  addTodo() {
    const text = this.newTodo.trim();
    if (text) {
      this.todos.push({ text, done: false });
      this.newTodo = '';
    }
  }

  removeTodo(index: number) {
    this.todos.splice(index, 1);
  }

  toggleTodo(index: number) {
    this.todos[index].done = !this.todos[index].done;
  }
}
```

```typescript
// app.module.ts (需要导入 FormsModule 支持双向绑定)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TodoComponent } from './todo.component';

@NgModule({
  declarations: [AppComponent, TodoComponent],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### [场景] 典型应用场景

1. **企业级应用** — 大型后台管理系统
2. **单页应用** — 复杂的前端应用
3. **跨平台应用** — 使用 Angular 构建移动端和桌面应用

---

### 2. 数据绑定

#### [概念] 概念解释

数据绑定是 Angular 的核心特性，实现了组件类与模板之间的数据同步。包括插值、属性绑定、事件绑定和双向绑定四种方式。

为什么归为核心层？数据绑定是 Angular 响应式编程的基础，不理解绑定机制就无法正确处理用户交互和数据展示。

#### [语法] 核心语法 / 命令 / API

| 绑定类型 | 语法 | 方向 | 用途 |
|------|------|------|------|
| 插值 | `{{ value }}` | 组件 -> 模板 | 显示数据 |
| 属性绑定 | `[property]="value"` | 组件 -> 模板 | 设置属性 |
| 事件绑定 | `(event)="handler()"` | 模板 -> 组件 | 响应事件 |
| 双向绑定 | `[(ngModel)]="value"` | 双向 | 表单输入 |

#### [代码] 代码示例

```typescript
// binding-demo.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-demo',
  template: `
    <div class="demo">
      <h2>数据绑定示例</h2>
      
      <!-- 插值绑定 -->
      <section class="section">
        <h3>插值绑定</h3>
        <p>欢迎，{{ userName }}！</p>
        <p>今天是 {{ currentDate | date:'yyyy-MM-dd' }}</p>
      </section>
      
      <!-- 属性绑定 -->
      <section class="section">
        <h3>属性绑定</h3>
        <img [src]="imageUrl" [alt]="imageAlt" [width]="imageWidth">
        <button [disabled]="isButtonDisabled">禁用按钮</button>
        <div [class.active]="isActive" [style.color]="textColor">
          动态样式
        </div>
      </section>
      
      <!-- 事件绑定 -->
      <section class="section">
        <h3>事件绑定</h3>
        <button (click)="onButtonClick()">点击计数: {{ clickCount }}</button>
        <input (keyup)="onKeyUp($event)" placeholder="按键触发事件">
        <p>最后按键: {{ lastKey }}</p>
      </section>
      
      <!-- 双向绑定 -->
      <section class="section">
        <h3>双向绑定</h3>
        <input [(ngModel)]="inputValue" placeholder="输入内容">
        <p>输入值: {{ inputValue }}</p>
        
        <label>
          <input type="checkbox" [(ngModel)]="isChecked">
          复选框状态: {{ isChecked ? '选中' : '未选中' }}
        </label>
      </section>
    </div>
  `,
  styles: [`
    .demo {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    button {
      padding: 10px 20px;
      background: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 5px;
    }
    img {
      border-radius: 8px;
    }
    .active {
      background: #dd0031;
      color: white;
      padding: 10px;
      border-radius: 4px;
    }
  `]
})
export class BindingDemoComponent {
  // 插值数据
  userName = 'Angular 开发者';
  currentDate = new Date();
  
  // 属性绑定
  imageUrl = 'https://angular.io/assets/images/logos/angular/logo-nav@2x.png';
  imageAlt = 'Angular Logo';
  imageWidth = 100;
  isButtonDisabled = false;
  isActive = true;
  textColor = 'blue';
  
  // 事件绑定
  clickCount = 0;
  lastKey = '';
  
  onButtonClick() {
    this.clickCount++;
  }
  
  onKeyUp(event: KeyboardEvent) {
    this.lastKey = (event.target as HTMLInputElement).value;
  }
  
  // 双向绑定
  inputValue = '';
  isChecked = false;
}
```

#### [场景] 典型应用场景

1. **表单处理** — 双向绑定实现表单数据同步
2. **动态样式** — 根据状态切换 CSS 类
3. **列表渲染** — 结合 *ngFor 展示动态数据

---

### 3. 服务与依赖注入

#### [概念] 概念解释

服务是 Angular 中封装业务逻辑和数据的类，通过依赖注入（DI）机制在组件间共享。DI 让服务的创建和管理自动化，组件只需声明依赖即可使用。

为什么归为核心层？服务是 Angular 架构的核心，不理解服务和 DI 就无法构建可维护的大型应用。

#### [语法] 核心语法 / 命令 / API

| 概念 | 用途 | 示例 |
|------|------|------|
| `@Injectable()` | 定义服务 | `@Injectable({ providedIn: 'root' })` |
| 构造函数注入 | 注入依赖 | `constructor(private service: MyService) {}` |
| `providedIn` | 服务作用域 | `'root'` 全局，`'any'` 每个模块 |

#### [代码] 代码示例

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'  // 全局单例
})
export class UserService {
  private users: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ];

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUser(id: number): Observable<User | undefined> {
    return of(this.users.find(u => u.id === id));
  }

  addUser(user: User): void {
    user.id = this.users.length + 1;
    this.users.push(user);
  }

  updateUser(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}
```

```typescript
// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <h2>用户列表</h2>
      
      <!-- 添加用户表单 -->
      <div class="add-form">
        <input [(ngModel)]="newUser.name" placeholder="姓名">
        <input [(ngModel)]="newUser.email" placeholder="邮箱">
        <button (click)="addUser()">添加</button>
      </div>
      
      <!-- 用户列表 -->
      <ul>
        <li *ngFor="let user of users">
          <span>{{ user.name }} - {{ user.email }}</span>
          <button (click)="deleteUser(user.id)">删除</button>
        </li>
      </ul>
      
      <p *ngIf="users.length === 0">暂无用户数据</p>
    </div>
  `,
  styles: [`
    .user-list {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
    }
    .add-form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 8px 16px;
      background: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = {};

  // 依赖注入：在构造函数中声明依赖
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  addUser() {
    if (this.newUser.name && this.newUser.email) {
      this.userService.addUser({
        id: 0,
        name: this.newUser.name,
        email: this.newUser.email
      });
      this.newUser = {};
      this.loadUsers();
    }
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id);
    this.loadUsers();
  }
}
```

#### [场景] 典型应用场景

1. **API 请求封装** — 服务统一管理 HTTP 请求
2. **状态管理** — 服务存储和共享应用状态
3. **工具函数** — 服务封装通用工具方法

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. RxJS 基础

#### [概念] 概念与解决的问题

RxJS 是响应式编程库，使用 Observable 处理异步数据流。Angular 大量使用 RxJS 处理 HTTP 请求、用户输入、路由事件等异步操作。

解决的核心痛点：**异步数据流管理**。传统回调、Promise 难以处理复杂异步场景，RxJS 提供了强大的操作符来转换、组合、过滤数据流。

#### [语法] 核心用法

| 概念 | 用途 | 示例 |
|------|------|------|
| `Observable` | 可观察的数据流 | `of(1, 2, 3)` |
| `Observer` | 观察者 | `subscribe({ next, error, complete })` |
| `Subject` | 多播 Observable | `new Subject<string>()` |
| 操作符 | 转换数据流 | `map`, `filter`, `switchMap` |

#### [代码] 代码示例

```typescript
// rxjs-demo.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription, of, from, interval } from 'rxjs';
import { map, filter, debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rxjs-demo',
  template: `
    <div class="demo">
      <h2>RxJS 示例</h2>
      
      <!-- 搜索示例 -->
      <section class="section">
        <h3>实时搜索（防抖）</h3>
        <input 
          #searchInput 
          placeholder="输入搜索关键词..."
          (input)="onSearch(searchInput.value)"
        >
        <ul>
          <li *ngFor="let result of searchResults">{{ result }}</li>
        </ul>
      </section>
      
      <!-- 计时器示例 -->
      <section class="section">
        <h3>计时器</h3>
        <p>已运行: {{ timerCount }} 秒</p>
        <button (click)="startTimer()">开始</button>
        <button (click)="stopTimer()">停止</button>
      </section>
      
      <!-- 数据转换示例 -->
      <section class="section">
        <h3>数据转换</h3>
        <p>原始数据: {{ originalData | json }}</p>
        <p>过滤后 (>5): {{ filteredData | json }}</p>
        <p>平方后: {{ mappedData | json }}</p>
      </section>
    </div>
  `,
  styles: [`
    .demo {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 200px;
    }
    button {
      padding: 8px 16px;
      background: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      padding: 5px 0;
    }
  `]
})
export class RxjsDemoComponent implements OnInit, OnDestroy {
  // 搜索相关
  private searchSubject = new Subject<string>();
  searchResults: string[] = [];

  // 计时器相关
  timerCount = 0;
  private timerSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  // 数据转换
  originalData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  filteredData: number[] = [];
  mappedData: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // 设置搜索防抖
    this.searchSubject.pipe(
      debounceTime(300),  // 300ms 防抖
      switchMap(query => this.search(query))
    ).subscribe(results => {
      this.searchResults = results;
    });

    // 数据转换示例
    of(this.originalData).pipe(
      map(data => data.filter(n => n > 5))
    ).subscribe(filtered => {
      this.filteredData = filtered;
    });

    of(this.originalData).pipe(
      map(data => data.map(n => n * n))
    ).subscribe(mapped => {
      this.mappedData = mapped;
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  private search(query: string): Observable<string[]> {
    if (!query.trim()) {
      return of([]);
    }
    // 模拟搜索结果
    return of(['Angular', 'React', 'Vue', 'Svelte', 'Solid'])
      .pipe(
        map(items => items.filter(item => 
          item.toLowerCase().includes(query.toLowerCase())
        ))
      );
  }

  startTimer() {
    this.stopTimer();
    this.timerCount = 0;
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.timerCount++;
      });
  }

  stopTimer() {
    this.timerSubscription?.unsubscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerSubscription?.unsubscribe();
  }
}
```

#### [关联] 与核心层的关联

RxJS 与服务紧密配合：服务返回 Observable，组件订阅并处理数据流。HTTP 请求、表单验证、路由守卫都依赖 RxJS。

---

### 2. 路由

#### [概念] 概念与解决的问题

Angular Router 是内置的路由库，用于管理应用导航。支持路由配置、路由参数、路由守卫、懒加载等功能。

解决的核心痛点：**单页应用导航**。在不刷新页面的情况下切换视图，管理浏览器历史记录。

#### [语法] 核心用法

| 概念 | 用途 | 示例 |
|------|------|------|
| `RouterModule.forRoot()` | 配置路由 | 定义路由表 |
| `routerLink` | 导航链接 | `<a routerLink="/home">` |
| `router-outlet` | 路由出口 | 渲染匹配的组件 |
| `ActivatedRoute` | 当前路由信息 | 获取参数、查询参数 |

#### [代码] 代码示例

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { UserListComponent } from './user-list.component';
import { UserDetailComponent } from './user-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'users', component: UserListComponent },
  { 
    path: 'users/:id', 
    component: UserDetailComponent,
    data: { title: '用户详情' }  // 静态数据
  },
  { 
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '/home' }  // 通配符路由
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar">
      <a routerLink="/home" routerLinkActive="active">首页</a>
      <a routerLink="/users" routerLinkActive="active">用户列表</a>
    </nav>
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      display: flex;
      gap: 20px;
      padding: 15px;
      background: #dd0031;
    }
    .navbar a {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
    }
    .navbar a.active {
      background: rgba(255,255,255,0.2);
    }
    main {
      padding: 20px;
    }
  `]
})
export class AppComponent {}
```

```typescript
// user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-detail',
  template: `
    <div class="detail">
      <h2>用户详情</h2>
      
      <div *ngIf="user">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>姓名:</strong> {{ user.name }}</p>
        <p><strong>邮箱:</strong> {{ user.email }}</p>
      </div>
      
      <button (click)="goBack()">返回列表</button>
      <button (click)="goToNext()">下一个用户</button>
    </div>
  `,
  styles: [`
    .detail {
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    button {
      padding: 10px 20px;
      background: #dd0031;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user?: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // 从路由参数获取用户 ID
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => 
        this.userService.getUser(Number(params.get('id')))
      )
    ).subscribe(user => {
      this.user = user;
    });

    // 访问路由静态数据
    console.log(this.route.snapshot.data['title']);
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  goToNext() {
    const nextId = (this.user?.id || 0) + 1;
    this.router.navigate(['/users', nextId]);
  }
}
```

#### [关联] 与核心层的关联

路由与组件紧密配合：路由配置决定加载哪个组件，组件通过服务获取数据，路由参数传递给服务进行查询。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| NgRx | 需要复杂状态管理时使用 |
| Angular Material | 需要 UI 组件库时使用 |
| Reactive Forms | 需要复杂表单验证时使用 |
| Route Guards | 需要路由权限控制时使用 |
| Interceptors | 需要统一处理 HTTP 请求/响应时使用 |
| Lazy Loading | 需要按需加载模块时使用 |
| Change Detection | 需要优化性能时使用 |
| Pipes | 需要数据格式化时使用 |
| Directives | 需要自定义 DOM 行为时使用 |
| Testing | 需要单元测试/集成测试时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：用户管理模块

**任务描述：** 创建一个完整的用户管理模块，包含列表、详情、新增、编辑功能。

**要求：**
1. 使用服务封装用户数据操作
2. 使用路由实现列表和详情页切换
3. 使用 RxJS 处理数据流
4. 使用响应式表单处理用户输入
5. 实现基本的表单验证

**输出：** 一个完整的用户管理模块，包含路由配置、服务、组件。
