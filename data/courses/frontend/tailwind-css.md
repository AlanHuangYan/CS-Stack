# Tailwind CSS 三层深度学习教程

## [总览] 技术总览

Tailwind CSS 是一个功能类优先的 CSS 框架，通过组合预定义的工具类快速构建用户界面。不同于 Bootstrap 等组件框架，Tailwind 不提供预设组件，而是提供底层的 CSS 构建块，让开发者可以完全自定义设计。

本教程采用三层漏斗学习法：**核心层**聚焦工具类基础、响应式前缀、状态变体三大基石，掌握后即可完成 50% 以上的日常样式开发；**重点层**深入自定义配置和 @apply 指令，提升开发效率和代码可维护性；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 工具类基础

#### [概念] 概念解释

Tailwind 的核心是工具类（Utility Classes）——每个类只做一件事。比如 `flex` 设置 `display: flex`，`p-4` 设置 `padding: 1rem`。通过组合这些类，可以快速构建任何设计。

为什么归为核心层？工具类是 Tailwind 的基础，不理解工具类的命名规则和使用方式就无法使用 Tailwind。

#### [语法] 核心语法 / 命令 / API

| 类别 | 示例 | 说明 |
|------|------|------|
| 布局 | `flex`, `grid`, `block`, `hidden` | display 属性 |
| 间距 | `p-4`, `m-2`, `px-6`, `my-4` | padding/margin |
| 尺寸 | `w-full`, `h-screen`, `max-w-md` | width/height |
| 颜色 | `bg-blue-500`, `text-white`, `border-gray-200` | 背景/文字/边框颜色 |
| 排版 | `text-xl`, `font-bold`, `text-center` | 字体大小/粗细/对齐 |
| 边框 | `border`, `rounded-lg`, `border-2` | 边框和圆角 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS 工具类示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">

  <!-- 卡片组件 -->
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- 图片 -->
    <img 
      class="w-full h-48 object-cover" 
      src="https://picsum.photos/400/200" 
      alt="示例图片"
    >
    
    <!-- 内容区 -->
    <div class="p-6">
      <!-- 标签 -->
      <div class="flex items-center gap-2 mb-3">
        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          前端开发
        </span>
        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
          新手入门
        </span>
      </div>
      
      <!-- 标题 -->
      <h2 class="text-xl font-bold text-gray-900 mb-2">
        Tailwind CSS 入门教程
      </h2>
      
      <!-- 描述 -->
      <p class="text-gray-600 text-sm leading-relaxed mb-4">
        学习如何使用 Tailwind CSS 快速构建现代化的用户界面，
        掌握工具类优先的 CSS 开发方式。
      </p>
      
      <!-- 作者信息 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
            A
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">作者名称</p>
            <p class="text-xs text-gray-500">2024年1月15日</p>
          </div>
        </div>
        
        <!-- 按钮 -->
        <button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          阅读更多
        </button>
      </div>
    </div>
  </div>

  <!-- 表单示例 -->
  <div class="max-w-md mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-900 mb-4">登录表单</h3>
    
    <form class="space-y-4">
      <!-- 邮箱输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
        <input 
          type="email" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="请输入邮箱"
        >
      </div>
      
      <!-- 密码输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input 
          type="password" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="请输入密码"
        >
      </div>
      
      <!-- 记住我 -->
      <div class="flex items-center">
        <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded">
        <label class="ml-2 text-sm text-gray-600">记住我</label>
      </div>
      
      <!-- 提交按钮 -->
      <button 
        type="submit"
        class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        登录
      </button>
    </form>
  </div>

</body>
</html>
```

#### [场景] 典型应用场景

1. **快速原型开发** — 组合工具类快速构建 UI
2. **响应式布局** — 配合响应式前缀适配多端
3. **组件库开发** — 构建可复用的 UI 组件

---

### 2. 响应式前缀

#### [概念] 概念解释

Tailwind 内置了 5 个响应式断点：`sm`（640px）、`md`（768px）、`lg`（1024px）、`xl`（1280px）、`2xl`（1536px）。通过在工具类前添加断点前缀，可以实现响应式设计。

为什么归为核心层？响应式设计是现代 Web 开发的必备技能，不理解响应式前缀就无法构建适配多端的页面。

#### [语法] 核心语法 / 命令 / API

| 前缀 | 最小宽度 | 说明 |
|------|----------|------|
| `sm:` | 640px | 手机横屏 |
| `md:` | 768px | 平板 |
| `lg:` | 1024px | 小屏桌面 |
| `xl:` | 1280px | 大屏桌面 |
| `2xl:` | 1536px | 超大屏 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS 响应式示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">

  <!-- 响应式导航栏 -->
  <nav class="bg-white shadow-md rounded-lg p-4 mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Logo -->
      <div class="flex items-center justify-between">
        <span class="text-xl font-bold text-blue-600">Logo</span>
        <!-- 移动端菜单按钮 -->
        <button class="sm:hidden p-2 text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
      
      <!-- 导航链接 -->
      <div class="hidden sm:flex items-center gap-6">
        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">首页</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">产品</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">关于</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">联系</a>
      </div>
      
      <!-- 移动端导航 -->
      <div class="flex flex-col gap-2 sm:hidden">
        <a href="#" class="text-gray-600 hover:text-blue-600 py-2 border-b">首页</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 py-2 border-b">产品</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 py-2 border-b">关于</a>
        <a href="#" class="text-gray-600 hover:text-blue-600 py-2">联系</a>
      </div>
      
      <!-- 按钮 -->
      <button class="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        登录
      </button>
    </div>
  </nav>

  <!-- 响应式网格 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    <!-- 卡片 1 -->
    <div class="bg-white rounded-xl shadow p-4 sm:p-6">
      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <span class="text-blue-600 text-xl">1</span>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">卡片标题</h3>
      <p class="text-sm text-gray-600">卡片描述内容，展示响应式布局效果。</p>
    </div>
    
    <!-- 卡片 2 -->
    <div class="bg-white rounded-xl shadow p-4 sm:p-6">
      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
        <span class="text-green-600 text-xl">2</span>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">卡片标题</h3>
      <p class="text-sm text-gray-600">卡片描述内容，展示响应式布局效果。</p>
    </div>
    
    <!-- 卡片 3 -->
    <div class="bg-white rounded-xl shadow p-4 sm:p-6">
      <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
        <span class="text-yellow-600 text-xl">3</span>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">卡片标题</h3>
      <p class="text-sm text-gray-600">卡片描述内容，展示响应式布局效果。</p>
    </div>
    
    <!-- 卡片 4 -->
    <div class="bg-white rounded-xl shadow p-4 sm:p-6">
      <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <span class="text-red-600 text-xl">4</span>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">卡片标题</h3>
      <p class="text-sm text-gray-600">卡片描述内容，展示响应式布局效果。</p>
    </div>
  </div>

  <!-- 响应式文字 -->
  <div class="mt-8 text-center">
    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
      响应式标题
    </h2>
    <p class="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
      这段文字会根据屏幕尺寸自动调整大小。
      在手机上显示较小，在桌面上显示较大。
    </p>
  </div>

</body>
</html>
```

#### [场景] 典型应用场景

1. **响应式导航** — 移动端折叠，桌面端展开
2. **网格布局** — 不同断点显示不同列数
3. **字体大小** — 根据屏幕调整文字大小

---

### 3. 状态变体

#### [概念] 概念解释

状态变体用于在特定交互状态下应用样式，如 `hover:`（悬停）、`focus:`（聚焦）、`active:`（激活）、`disabled:`（禁用）等。

为什么归为核心层？交互反馈是用户体验的重要组成部分，不理解状态变体就无法创建有交互感的界面。

#### [语法] 核心语法 / 命令 / API

| 变体 | 触发条件 | 示例 |
|------|----------|------|
| `hover:` | 鼠标悬停 | `hover:bg-blue-700` |
| `focus:` | 元素聚焦 | `focus:ring-2` |
| `active:` | 鼠标按下 | `active:scale-95` |
| `disabled:` | 禁用状态 | `disabled:opacity-50` |
| `first:` | 第一个子元素 | `first:ml-0` |
| `last:` | 最后一个子元素 | `last:border-0` |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS 状态变体示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">

  <div class="max-w-2xl mx-auto space-y-8">
    
    <!-- 按钮状态 -->
    <section class="bg-white rounded-xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-4">按钮状态</h3>
      
      <div class="flex flex-wrap gap-4">
        <!-- 普通按钮 -->
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors">
          悬停/激活效果
        </button>
        
        <!-- 缩放效果 -->
        <button class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all">
          按下缩放
        </button>
        
        <!-- 禁用按钮 -->
        <button class="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed disabled:opacity-50" disabled>
          禁用状态
        </button>
        
        <!-- 边框按钮 -->
        <button class="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
          边框按钮
        </button>
      </div>
    </section>

    <!-- 输入框状态 -->
    <section class="bg-white rounded-xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-4">输入框状态</h3>
      
      <div class="space-y-4">
        <!-- 普通输入框 -->
        <input 
          type="text" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          placeholder="聚焦时显示蓝色边框"
        >
        
        <!-- 错误状态 -->
        <input 
          type="text" 
          class="w-full px-4 py-2 border-2 border-red-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
          placeholder="错误状态"
          value="输入有误"
        >
        
        <!-- 成功状态 -->
        <input 
          type="text" 
          class="w-full px-4 py-2 border-2 border-green-500 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          placeholder="成功状态"
          value="验证通过"
        >
      </div>
    </section>

    <!-- 列表状态 -->
    <section class="bg-white rounded-xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-4">列表状态</h3>
      
      <ul class="divide-y divide-gray-200">
        <li class="px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer">
          第一个项目 - first:rounded-t-lg
        </li>
        <li class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
          第二个项目
        </li>
        <li class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
          第三个项目
        </li>
        <li class="px-4 py-3 hover:bg-gray-50 last:rounded-b-lg transition-colors cursor-pointer">
          最后一个项目 - last:rounded-b-lg
        </li>
      </ul>
    </section>

    <!-- 组合状态 -->
    <section class="bg-white rounded-xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-4">组合状态（响应式 + 状态）</h3>
      
      <button class="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 sm:hover:bg-purple-800 active:scale-95 sm:active:scale-100 transition-all">
        移动端悬停变深，桌面端悬停更深
      </button>
    </section>

  </div>

</body>
</html>
```

#### [场景] 典型应用场景

1. **按钮交互** — 悬停变色、按下缩放
2. **表单验证** — 聚焦、错误、成功状态
3. **列表高亮** — 悬停背景、首尾特殊样式

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 自定义配置

#### [概念] 概念与解决的问题

`tailwind.config.js` 是 Tailwind 的配置文件，可以自定义颜色、字体、间距、断点等。通过配置，可以让 Tailwind 适配项目的设计规范。

解决的核心痛点：**设计规范统一**。项目通常有特定的品牌色、字体等，通过配置可以确保整个项目使用一致的设计语言。

#### [语法] 核心用法

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#3fbaeb',
          DEFAULT: '#0fa9e6',
          dark: '#0c87b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      }
    }
  },
  plugins: []
}
```

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS 自定义配置示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              light: '#a5f3fc',
              DEFAULT: '#22d3ee',
              dark: '#0891b2',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            '4xl': '2rem',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-100 min-h-screen p-8 font-sans">

  <div class="max-w-2xl mx-auto space-y-6">
    
    <!-- 自定义颜色 -->
    <div class="bg-white rounded-xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-4">自定义品牌色</h3>
      
      <div class="flex gap-4">
        <div class="flex-1 text-center">
          <div class="h-20 bg-brand-light rounded-lg mb-2"></div>
          <span class="text-sm text-gray-600">brand-light</span>
        </div>
        <div class="flex-1 text-center">
          <div class="h-20 bg-brand rounded-lg mb-2"></div>
          <span class="text-sm text-gray-600">brand</span>
        </div>
        <div class="flex-1 text-center">
          <div class="h-20 bg-brand-dark rounded-lg mb-2"></div>
          <span class="text-sm text-gray-600">brand-dark</span>
        </div>
      </div>
      
      <button class="mt-4 w-full py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
        使用品牌色的按钮
      </button>
    </div>

    <!-- 自定义圆角 -->
    <div class="bg-white rounded-4xl p-6 shadow">
      <h3 class="text-lg font-bold text-gray-900 mb-2">自定义圆角 4xl</h3>
      <p class="text-gray-600">这个卡片使用了自定义的 rounded-4xl 圆角。</p>
    </div>

  </div>

</body>
</html>
```

#### [关联] 与核心层的关联

自定义配置扩展了核心层的工具类，让项目可以使用自定义的颜色、间距等，同时保持 Tailwind 的开发体验。

---

### 2. @apply 指令

#### [概念] 概念与解决的问题

`@apply` 指令可以在 CSS 中内联 Tailwind 工具类，用于提取重复的样式组合成可复用的 CSS 类。

解决的核心痛点：**代码复用**。当多个元素使用相同的样式组合时，使用 `@apply` 可以避免重复编写相同的类名。

#### [语法] 核心用法

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}
```

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS @apply 示例</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style type="text/tailwindcss">
    @layer components {
      .card {
        @apply bg-white rounded-xl shadow-lg p-6;
      }
      .btn {
        @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
      }
      .btn-primary {
        @apply btn bg-blue-600 text-white hover:bg-blue-700 active:scale-95;
      }
      .btn-outline {
        @apply btn border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white;
      }
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen p-8">

  <div class="max-w-2xl mx-auto space-y-6">
    
    <!-- 使用 @apply 定义的 card 类 -->
    <div class="card">
      <h3 class="text-lg font-bold text-gray-900 mb-2">卡片组件</h3>
      <p class="text-gray-600 mb-4">
        这个卡片使用了 @apply 定义的 .card 类，
        包含 bg-white、rounded-xl、shadow-lg、p-4 这些样式。
      </p>
      
      <!-- 使用 @apply 定义的按钮类 -->
      <div class="flex gap-3">
        <button class="btn-primary">主要按钮</button>
        <button class="btn-outline">边框按钮</button>
      </div>
    </div>

    <!-- 另一个卡片 -->
    <div class="card">
      <h3 class="text-lg font-bold text-gray-900 mb-2">另一个卡片</h3>
      <p class="text-gray-600">
        复用 .card 类，保持样式一致性。
      </p>
    </div>

  </div>

</body>
</html>
```

#### [关联] 与核心层的关联

`@apply` 是核心层工具类的组织方式，将常用的工具类组合提取为可复用的组件类，提高代码可维护性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Dark Mode | 需要暗色模式支持时使用 `dark:` 前缀 |
| JIT 模式 | 需要即时编译任意值时使用 |
| 任意值 | 需要使用非预设值时用 `w-[123px]` 语法 |
| 插件开发 | 需要扩展 Tailwind 功能时使用 |
| PurgeCSS | 需要移除未使用的样式时配置 |
| @layer | 需要定义自定义样式层级时使用 |
| group/peer | 需要根据父元素或兄弟元素状态设置样式时使用 |
| Aspect Ratio | 需要固定宽高比时使用 |
| Container | 需要响应式容器时使用 |
| Typography | 需要排版插件时使用 @tailwindcss/typography |

---

## [实战] 核心实战清单

### 实战任务 1：响应式个人博客首页

**任务描述：** 使用 Tailwind CSS 创建一个响应式的个人博客首页。

**要求：**
1. 使用工具类构建导航栏、文章卡片、侧边栏
2. 响应式布局：移动端单列，桌面端三栏
3. 实现按钮、输入框的状态变体效果
4. 使用自定义配置定义品牌色

**输出：** 一个完整的 HTML 文件，包含内联 Tailwind 配置，可直接在浏览器打开查看效果。
