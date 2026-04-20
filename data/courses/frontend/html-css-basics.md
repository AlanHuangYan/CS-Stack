# HTML & CSS 基础 三层深度学习教程

## [总览] 技术总览

HTML（超文本标记语言）定义网页的"骨架"——内容结构与语义；CSS（层叠样式表）负责"皮肉"——视觉呈现与布局。两者是 Web 前端的基石，任何网页都离不开它们。

本教程采用三层漏斗学习法：**核心层**聚焦 HTML 语义化标签、CSS 盒模型、Flexbox 布局三大基石，掌握后即可完成 50% 以上的日常页面开发；**重点层**深入 Grid 布局、响应式设计、选择器优先级，提升代码质量与开发效率；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. HTML 语义化标签

#### [概念] 概念解释

HTML 语义化是指用正确的标签表达内容的含义，而非全部用 `<div>` 包裹。比如 `<header>` 表示页眉、`<nav>` 表示导航、`<article>` 表示独立文章。语义化不仅让代码更易读，还能提升 SEO（搜索引擎优化）和无障碍访问体验。

为什么归为核心层？因为不掌握语义化，你写的页面结构混乱，搜索引擎无法理解内容层级，屏幕阅读器也无法正确朗读，后续 CSS 和 JS 都难以正确挂钩。

#### [语法] 核心语法 / 命令 / API

| 标签 | 用途 | 说明 |
|------|------|------|
| `<header>` | 页眉/区块头部 | 网站顶部导航区、文章标题区 |
| `<nav>` | 导航链接 | 主导航、侧边栏导航 |
| `<main>` | 主内容区 | 页面核心内容，每页仅一个 |
| `<article>` | 独立内容块 | 可独立分发的内容（文章、帖子） |
| `<section>` | 内容分区 | 有主题的内容分组 |
| `<aside>` | 附属内容 | 侧边栏、广告、相关链接 |
| `<footer>` | 页脚/区块底部 | 版权信息、联系方式 |
| `<h1>-<h6>` | 标题层级 | h1 最重要，每页仅一个 h1 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语义化标签示例</title>
</head>
<body>
  <!-- 页眉：网站品牌和主导航 -->
  <header>
    <h1>我的技术博客</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/articles">文章</a>
      <a href="/about">关于</a>
    </nav>
  </header>

  <!-- 主内容区 -->
  <main>
    <!-- 独立文章 -->
    <article>
      <header>
        <h2>HTML 语义化的重要性</h2>
        <time datetime="2024-01-15">2024年1月15日</time>
      </header>

      <section>
        <h3>什么是语义化</h3>
        <p>语义化就是用正确的标签表达内容的含义...</p>
      </section>

      <section>
        <h3>为什么要语义化</h3>
        <p>提升 SEO、无障碍访问、代码可维护性...</p>
      </section>
    </article>

    <!-- 附属内容：侧边栏 -->
    <aside>
      <h3>相关文章</h3>
      <ul>
        <li><a href="#">CSS 盒模型详解</a></li>
        <li><a href="#">Flexbox 布局入门</a></li>
      </ul>
    </aside>
  </main>

  <!-- 页脚 -->
  <footer>
    <p>&copy; 2024 我的技术博客. 保留所有权利.</p>
  </footer>
</body>
</html>
```

#### [场景] 典型应用场景

1. **博客/新闻网站** — 文章用 `<article>`，侧边栏用 `<aside>`
2. **企业官网** — 导航用 `<nav>`，产品介绍用 `<section>`
3. **单页应用** — 主内容区用 `<main>`，各区块用 `<section>`

---

### 2. CSS 盒模型

#### [概念] 概念解释

CSS 盒模型是网页布局的基础：每个 HTML 元素都被视为一个"盒子"，由内到外依次是：**content（内容）-> padding（内边距）-> border（边框）-> margin（外边距）**。

理解盒模型是精准控制元素间距和尺寸的前提。比如想让两个盒子之间有 20px 间距，是设置 margin 还是 padding？不理解盒模型就会频繁踩坑。

#### [语法] 核心语法 / 命令 / API

| 属性 | 作用 | 示例 |
|------|------|------|
| `width/height` | 内容区宽高 | `width: 200px;` |
| `padding` | 内边距（内容与边框之间） | `padding: 10px 20px;` |
| `border` | 边框 | `border: 1px solid #ccc;` |
| `margin` | 外边距（元素外部空间） | `margin: 10px auto;` |
| `box-sizing` | 盒模型计算方式 | `box-sizing: border-box;` |

**关键概念：`box-sizing`**
- `content-box`（默认）：width/height 仅指内容区，实际宽度 = width + padding + border
- `border-box`（推荐）：width/height 包含 padding 和 border，更直观

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>CSS 盒模型示例</title>
  <style>
    /* 重置：所有元素使用 border-box */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }

    /* 对比两种盒模型 */
    .box-content {
      box-sizing: content-box;  /* 默认值 */
      width: 200px;
      padding: 20px;
      border: 5px solid #e74c3c;
      background: #ffeaea;
      margin-bottom: 20px;
    }

    .box-border {
      box-sizing: border-box;   /* 推荐值 */
      width: 200px;
      padding: 20px;
      border: 5px solid #27ae60;
      background: #eafff0;
    }

    /* 实际应用：卡片组件 */
    .card {
      width: 300px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      margin: 20px auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card-title {
      margin-bottom: 10px;  /* 标题与内容间距 */
    }

    .card-content {
      color: #666;
      line-height: 1.6;
    }

    .card-footer {
      margin-top: 15px;     /* 底部与内容间距 */
      padding-top: 15px;    /* 内部分隔 */
      border-top: 1px solid #eee;
      text-align: right;
    }
  </style>
</head>
<body>
  <h2>盒模型对比</h2>

  <div class="box-content">
    content-box：width=200px，实际宽度 = 200 + 40 + 10 = <strong>250px</strong>
  </div>

  <div class="box-border">
    border-box：width=200px，实际宽度 = <strong>200px</strong>（推荐）
  </div>

  <h2>实际应用：卡片组件</h2>

  <div class="card">
    <h3 class="card-title">卡片标题</h3>
    <p class="card-content">
      这是一个使用盒模型的卡片组件。padding 控制内边距，margin 控制元素间距，border 控制边框。
    </p>
    <div class="card-footer">
      <button>查看详情</button>
    </div>
  </div>
</body>
</html>
```

#### [场景] 典型应用场景

1. **卡片组件** — padding 控制内容与边框间距，margin 控制卡片之间间距
2. **表单布局** — label 与 input 之间的间距用 margin
3. **按钮样式** — padding 撑开按钮大小，border 定义边框

---

### 3. CSS Flexbox 布局

#### [概念] 概念解释

Flexbox（弹性盒子布局）是一维布局神器：在一条直线上（水平或垂直）排列子元素，轻松实现居中、等分、自适应等常见布局需求。

为什么归为核心层？因为 80% 的页面布局场景都能用 Flexbox 解决：导航栏、卡片列表、表单对齐、垂直居中...不掌握 Flexbox，你只能用 float、position 等老方法，代码复杂且易出错。

#### [语法] 核心语法 / 命令 / API

**容器属性（设置在父元素上）：**

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `display: flex` | 启用 Flexbox | — |
| `flex-direction` | 主轴方向 | `row`（水平）/ `column`（垂直） |
| `justify-content` | 主轴对齐 | `center` / `space-between` / `space-around` |
| `align-items` | 交叉轴对齐 | `center` / `flex-start` / `flex-end` |
| `flex-wrap` | 是否换行 | `nowrap` / `wrap` |
| `gap` | 子元素间距 | `10px` / `10px 20px` |

**子项属性（设置在子元素上）：**

| 属性 | 作用 | 常用值 |
|------|------|--------|
| `flex: 1` | 占据剩余空间 | 数值，表示比例 |
| `flex-shrink: 0` | 不缩小 | 防止被压缩 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Flexbox 布局示例</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }

    section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }

    h2 {
      margin-bottom: 15px;
      color: #333;
    }

    /* 场景1：水平垂直居中 */
    .center-box {
      display: flex;
      justify-content: center;  /* 水平居中 */
      align-items: center;      /* 垂直居中 */
      height: 150px;
      background: #e8f4fd;
      border-radius: 8px;
    }

    .center-box .box {
      width: 100px;
      height: 60px;
      background: #3498db;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
    }

    /* 场景2：导航栏 */
    .navbar {
      display: flex;
      justify-content: space-between;  /* 两端对齐 */
      align-items: center;
      padding: 15px 20px;
      background: #2c3e50;
      color: white;
    }

    .navbar .logo {
      font-size: 20px;
      font-weight: bold;
    }

    .navbar .nav-links {
      display: flex;
      gap: 20px;  /* 链接间距 */
    }

    .navbar .nav-links a {
      color: white;
      text-decoration: none;
    }

    .navbar .nav-links a:hover {
      color: #3498db;
    }

    /* 场景3：卡片网格（自适应换行） */
    .card-grid {
      display: flex;
      flex-wrap: wrap;  /* 允许换行 */
      gap: 20px;
    }

    .card-grid .card {
      flex: 1 1 250px;  /* 最小250px，自动等分 */
      padding: 20px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    /* 场景4：表单布局 */
    .form-group {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .form-group label {
      width: 80px;
      flex-shrink: 0;  /* 标签宽度固定 */
    }

    .form-group input {
      flex: 1;  /* 输入框占据剩余空间 */
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
</head>
<body>

  <section>
    <h2>场景1：水平垂直居中（最常用）</h2>
    <div class="center-box">
      <div class="box">居中</div>
    </div>
  </section>

  <section>
    <h2>场景2：导航栏</h2>
    <nav class="navbar">
      <div class="logo">Logo</div>
      <div class="nav-links">
        <a href="#">首页</a>
        <a href="#">产品</a>
        <a href="#">关于</a>
        <a href="#">联系</a>
      </div>
    </nav>
  </section>

  <section>
    <h2>场景3：自适应卡片网格</h2>
    <div class="card-grid">
      <div class="card">
        <h3>卡片 1</h3>
        <p>自动等分，最小宽度250px</p>
      </div>
      <div class="card">
        <h3>卡片 2</h3>
        <p>自动等分，最小宽度250px</p>
      </div>
      <div class="card">
        <h3>卡片 3</h3>
        <p>自动等分，最小宽度250px</p>
      </div>
    </div>
  </section>

  <section>
    <h2>场景4：表单对齐</h2>
    <div class="form-group">
      <label>用户名</label>
      <input type="text" placeholder="请输入用户名">
    </div>
    <div class="form-group">
      <label>密码</label>
      <input type="password" placeholder="请输入密码">
    </div>
  </section>

</body>
</html>
```

#### [场景] 典型应用场景

1. **垂直居中** — `justify-content: center; align-items: center;`
2. **导航栏** — `justify-content: space-between` 实现 Logo 左对齐、菜单右对齐
3. **卡片列表** — `flex-wrap: wrap; gap: 20px;` 自动换行

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. CSS Grid 布局

#### [概念] 概念与解决的问题

Grid 是二维布局系统，可以同时控制行和列。Flexbox 是一维的（只能控制一行或一列），而 Grid 可以创建复杂的网格结构。

解决的核心痛点：**复杂页面整体布局**。比如三栏布局（左侧边栏 + 中间内容 + 右侧广告）、仪表板网格、图片画廊等，用 Flexbox 需要嵌套多层，用 Grid 一行代码搞定。

#### [语法] 核心用法

| 属性 | 作用 | 示例 |
|------|------|------|
| `display: grid` | 启用 Grid | — |
| `grid-template-columns` | 定义列 | `200px 1fr 200px`（三栏） |
| `grid-template-rows` | 定义行 | `auto 1fr auto`（上中下） |
| `gap` | 网格间距 | `20px` |
| `grid-area` | 指定区域 | 配合 `grid-template-areas` |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Grid 布局示例</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      min-height: 100vh;
    }

    /* 经典三栏布局 */
    .layout {
      display: grid;
      grid-template-columns: 200px 1fr 250px;
      grid-template-rows: 60px 1fr 50px;
      grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
      min-height: 100vh;
      gap: 1px;
      background: #ddd;
    }

    .header {
      grid-area: header;
      background: #2c3e50;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 20px;
    }

    .sidebar {
      grid-area: sidebar;
      background: #ecf0f1;
      padding: 20px;
    }

    .main {
      grid-area: main;
      background: white;
      padding: 20px;
    }

    .aside {
      grid-area: aside;
      background: #f9f9f9;
      padding: 20px;
    }

    .footer {
      grid-area: footer;
      background: #34495e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* 响应式：移动端单列 */
    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        grid-template-areas:
          "header"
          "main"
          "sidebar"
          "aside"
          "footer";
      }
    }
  </style>
</head>
<body>
  <div class="layout">
    <header class="header">Header 导航栏</header>
    <aside class="sidebar">Sidebar 侧边栏</aside>
    <main class="main">Main 主内容区</main>
    <aside class="aside">Aside 附属内容</aside>
    <footer class="footer">Footer 页脚</footer>
  </div>
</body>
</html>
```

#### [关联] 与核心层的关联

Grid 负责页面整体框架（二维），Flexbox 负责组件内部排列（一维）。**最佳实践：先用 Grid 搭骨架，再用 Flexbox 排细节。**

---

### 2. 响应式设计

#### [概念] 概念与解决的问题

响应式设计让同一套代码适配不同屏幕尺寸（手机、平板、桌面）。核心是 **Media Query（媒体查询）**：根据屏幕宽度应用不同样式。

解决的痛点：不用为手机和桌面写两套代码，一套代码多端适配。

#### [语法] 核心用法

```css
/* 移动优先：默认样式是手机端 */

/* 平板：768px 以上 */
@media (min-width: 768px) {
  .container { max-width: 720px; }
}

/* 桌面：1024px 以上 */
@media (min-width: 1024px) {
  .container { max-width: 960px; }
}

/* 大屏：1280px 以上 */
@media (min-width: 1280px) {
  .container { max-width: 1200px; }
}
```

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>响应式设计示例</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: sans-serif;
      background: #f5f5f5;
    }

    /* 容器：响应式宽度 */
    .container {
      width: 100%;
      padding: 0 15px;
      margin: 0 auto;
    }

    /* 卡片网格：移动端单列 */
    .card-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
      padding: 20px 0;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* 平板：2列 */
    @media (min-width: 768px) {
      .container {
        max-width: 720px;
      }
      .card-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* 桌面：3列 */
    @media (min-width: 1024px) {
      .container {
        max-width: 960px;
      }
      .card-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
    }

    /* 大屏：4列 */
    @media (min-width: 1280px) {
      .container {
        max-width: 1200px;
      }
      .card-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card-grid">
      <div class="card"><h3>卡片 1</h3><p>响应式布局</p></div>
      <div class="card"><h3>卡片 2</h3><p>响应式布局</p></div>
      <div class="card"><h3>卡片 3</h3><p>响应式布局</p></div>
      <div class="card"><h3>卡片 4</h3><p>响应式布局</p></div>
    </div>
  </div>
</body>
</html>
```

#### [关联] 与核心层的关联

响应式设计需要配合 Flexbox 的 `flex-wrap` 或 Grid 的 `grid-template-columns` 实现自适应布局。

---

### 3. CSS 选择器与优先级

#### [概念] 概念与解决的问题

CSS 选择器决定样式应用到哪些元素。优先级决定当多个选择器冲突时，哪个生效。不理解优先级，就会出现"样式不生效"的困惑，最后滥用 `!important`。

#### [语法] 核心用法

**优先级计算（从高到低）：**
1. `!important` — 最高，慎用
2. 行内样式 — `<div style="...">`
3. ID 选择器 — `#id`
4. 类选择器 — `.class`、属性选择器、伪类
5. 元素选择器 — `div`、伪元素

**计算公式：** (ID数量, 类数量, 元素数量)

```css
#header .nav li a { }  /* (1, 1, 2) = 优先级较高 */
.nav li a { }          /* (0, 1, 2) = 优先级较低 */
```

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>CSS 选择器示例</title>
  <style>
    /* 元素选择器：优先级最低 */
    a {
      color: #333;
    }

    /* 类选择器：优先级中等 */
    .nav-link {
      color: #3498db;
    }

    /* ID 选择器：优先级较高 */
    #special-link {
      color: #e74c3c;
    }

    /* 组合选择器：计算优先级 */
    .nav .nav-link {
      font-weight: bold;  /* (0, 2, 0) */
    }

    /* 伪类选择器 */
    .nav-link:hover {
      color: #2980b9;
      text-decoration: underline;
    }

    /* 子代选择器（直接子元素） */
    .nav > li {
      list-style: none;
      display: inline-block;
      margin-right: 15px;
    }

    /* 属性选择器 */
    a[href^="https"] {
      padding-right: 15px;
      background: url('data:image/svg+xml,...') no-repeat right center;
    }
  </style>
</head>
<body>
  <nav class="nav">
    <li><a href="/" class="nav-link">首页</a></li>
    <li><a href="/about" class="nav-link">关于</a></li>
    <li><a href="https://example.com" id="special-link" class="nav-link">外链</a></li>
  </nav>
</body>
</html>
```

#### [关联] 与核心层的关联

选择器用于定位 HTML 元素，理解优先级才能正确覆盖样式，避免 `!important` 滥用。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| CSS 变量 | 需要统一管理颜色、间距等主题值时使用 |
| Transition/Animation | 需要添加过渡动画或关键帧动画时使用 |
| Pseudo-elements (::before/::after) | 需要在元素前后插入装饰性内容时使用 |
| CSS 预处理器 | 项目复杂、需要变量、嵌套、混入时使用 |
| BEM 命名规范 | 团队协作、需要统一 CSS 类命名风格时使用 |
| Tailwind CSS | 想要快速开发、减少自定义 CSS 时使用 |
| CSS-in-JS | 使用 React 等框架、需要组件级样式隔离时使用 |
| Shadow DOM | 需要封装 Web 组件、样式不被外部影响时使用 |
| :has() 选择器 | 需要根据子元素状态选择父元素时使用 |
| Container Queries | 需要根据容器宽度而非视口宽度响应式时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：响应式个人名片页

**任务描述：** 使用 HTML 语义化标签 + CSS Flexbox/Grid + 响应式设计，创建一个个人名片页面。

**要求：**
1. 使用 `<header>`、`<main>`、`<section>`、`<footer>` 等语义化标签
2. 头部区域：头像（左）+ 姓名/职位（右），使用 Flexbox 水平居中
3. 技能区域：使用 Grid 布局展示技能卡片，桌面端 3 列、平板 2 列、手机 1 列
4. 联系方式区域：使用 Flexbox 实现图标+文字对齐
5. 响应式：移动端隐藏头像，调整布局为单列

**输出：** 一个完整的 `index.html` 文件，包含内联 CSS，可直接在浏览器打开查看效果。
