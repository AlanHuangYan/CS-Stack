# Sass 基础 三层深度学习教程

## [总览] 技术总览

Sass（Syntactically Awesome Style Sheets）是 CSS 预处理器，扩展了 CSS 的功能，添加了变量、嵌套、混入、模块化等特性。Sass 让 CSS 更易维护、更易复用，是大型项目样式管理的首选方案。

本教程采用三层漏斗学习法：**核心层**聚焦变量、嵌套、混入三大基石，掌握后即可完成 50% 以上的样式开发任务；**重点层**深入模块化和函数，提升代码组织和复用能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 变量

#### [概念] 概念解释

Sass 变量以 `$` 符号开头，用于存储可复用的值，如颜色、字体、间距等。变量让样式更易维护，修改一处即可全局生效。

为什么归为核心层？变量是样式统一管理的基础，不使用变量会导致颜色、间距等值散落各处，难以维护。

#### [语法] 核心语法 / 命令 / API

| 语法 | 用途 | 示例 |
|------|------|------|
| `$name: value` | 定义变量 | `$primary: #3498db` |
| `$name` | 使用变量 | `color: $primary` |
| `!default` | 默认值 | `$color: #ccc !default` |

#### [代码] 代码示例

```scss
// _variables.scss - 变量定义文件

// 颜色系统
$primary: #3498db;
$secondary: #2ecc71;
$danger: #e74c3c;
$warning: #f39c12;
$info: #9b59b6;

// 灰度色阶
$gray-100: #f8f9fa;
$gray-200: #e9ecef;
$gray-300: #dee2e6;
$gray-400: #ced4da;
$gray-500: #adb5bd;
$gray-600: #6c757d;
$gray-700: #495057;
$gray-800: #343a40;
$gray-900: #212529;

// 字体
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

// 字体大小
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
$font-size-2xl: 1.5rem;

// 间距
$spacing: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  5: 1.5rem,
  6: 2rem,
  8: 3rem,
);

// 边框圆角
$border-radius-sm: 0.25rem;
$border-radius: 0.375rem;
$border-radius-lg: 0.5rem;
$border-radius-xl: 1rem;
$border-radius-full: 9999px;

// 阴影
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

// 断点
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
);
```

```scss
// main.scss - 使用变量
@use 'variables' as *;

// 基础样式
body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  color: $gray-800;
  background-color: $gray-100;
  line-height: 1.6;
}

// 按钮组件
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: map-get($spacing, 2) map-get($spacing, 4);
  font-size: $font-size-base;
  font-weight: 500;
  border-radius: $border-radius;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &-primary {
    background-color: $primary;
    color: white;
    
    &:hover {
      background-color: darken($primary, 10%);
    }
  }
  
  &-secondary {
    background-color: $secondary;
    color: white;
    
    &:hover {
      background-color: darken($secondary, 10%);
    }
  }
  
  &-outline {
    background-color: transparent;
    border: 2px solid $primary;
    color: $primary;
    
    &:hover {
      background-color: $primary;
      color: white;
    }
  }
}

// 卡片组件
.card {
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow;
  padding: map-get($spacing, 5);
  
  &-header {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $gray-900;
    margin-bottom: map-get($spacing, 3);
  }
  
  &-body {
    color: $gray-600;
  }
}
```

#### [场景] 典型应用场景

1. **主题系统** — 定义颜色变量，实现主题切换
2. **响应式断点** — 统一管理断点值
3. **间距系统** — 定义一致的间距变量

---

### 2. 嵌套

#### [概念] 概念解释

Sass 允许选择器嵌套，让 CSS 结构与 HTML 结构对应，代码更清晰易读。嵌套避免了重复书写父选择器。

为什么归为核心层？嵌套是 Sass 最常用的特性，让样式代码组织更清晰，减少重复。

#### [语法] 核心语法 / 命令 / API

| 语法 | 用途 | 示例 |
|------|------|------|
| `&` | 父选择器 | `&:hover` |
| `&__element` | BEM 命名 | `&__title` |
| `&--modifier` | BEM 修饰符 | `&--active` |

#### [代码] 代码示例

```scss
// 嵌套示例 - 导航组件
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  // 嵌套：Logo
  &__logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      color: #2980b9;
    }
  }
  
  // 嵌套：导航菜单
  &__menu {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  // 嵌套：导航链接
  &__link {
    color: #666;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    &:hover {
      color: #3498db;
    }
    
    &--active {
      color: #3498db;
      border-bottom: 2px solid #3498db;
    }
  }
  
  // 嵌套：移动端菜单按钮
  &__toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    
    @media (max-width: 768px) {
      display: block;
    }
    
    &-icon {
      width: 24px;
      height: 24px;
    }
  }
}

// 嵌套示例 - 卡片组件（BEM 命名）
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  // 元素
  &__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  &__content {
    padding: 1.5rem;
  }
  
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  &__description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  // 修饰符
  &--featured {
    border: 2px solid #3498db;
    
    .card__title {
      color: #3498db;
    }
  }
  
  &--compact {
    .card__content {
      padding: 1rem;
    }
    
    .card__title {
      font-size: 1rem;
    }
  }
}
```

#### [场景] 典型应用场景

1. **组件样式** — 使用 BEM 命名规范组织样式
2. **状态样式** — 嵌套 `:hover`、`:focus` 等伪类
3. **响应式样式** — 嵌套媒体查询

---

### 3. 混入 (Mixin)

#### [概念] 概念解释

Mixin 是可复用的样式块，可以接收参数。使用 `@mixin` 定义，`@include` 调用。Mixin 让复杂的样式逻辑可以封装复用。

为什么归为核心层？Mixin 是 Sass 最强大的特性之一，用于封装跨浏览器兼容性、响应式断点等通用样式。

#### [语法] 核心语法 / 命令 / API

| 语法 | 用途 | 示例 |
|------|------|------|
| `@mixin name($args)` | 定义混入 | `@mixin flex-center { ... }` |
| `@include name($args)` | 调用混入 | `@include flex-center` |
| `@content` | 内容块 | 传递样式块到混入 |

#### [代码] 代码示例

```scss
// _mixins.scss - 混入定义文件

// Flexbox 居中
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Flexbox 两端对齐
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 响应式断点
@mixin respond-to($breakpoint) {
  $breakpoints: (
    sm: 640px,
    md: 768px,
    lg: 1024px,
    xl: 1280px,
  );
  
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Breakpoint `#{$breakpoint}` not found in $breakpoints.";
  }
}

// 文本截断
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行截断
@mixin text-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 绝对定位居中
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 按钮基础样式
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 按钮变体
@mixin button-variant($bg-color, $text-color: white) {
  background-color: $bg-color;
  color: $text-color;
  
  &:hover:not(:disabled) {
    background-color: darken($bg-color, 10%);
  }
  
  &:active:not(:disabled) {
    background-color: darken($bg-color, 15%);
  }
}

// 卡片阴影
@mixin card-shadow($level: 1) {
  @if $level == 1 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  } @else if $level == 2 {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  } @else if $level == 3 {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  }
}
```

```scss
// main.scss - 使用混入
@use 'mixins' as *;

// 使用 flex-center
.hero {
  @include flex-center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  &__content {
    text-align: center;
    color: white;
  }
}

// 使用响应式断点
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  
  @include respond-to(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to(md) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to(lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// 使用按钮混入
.btn {
  @include button-base;
  
  &-primary {
    @include button-variant(#3498db);
  }
  
  &-success {
    @include button-variant(#2ecc71);
  }
  
  &-danger {
    @include button-variant(#e74c3c);
  }
}

// 使用文本截断
.title {
  @include text-truncate;
  max-width: 200px;
}

.description {
  @include text-clamp(3);
}

// 使用卡片阴影
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  @include card-shadow(2);
  
  &:hover {
    @include card-shadow(3);
  }
}
```

#### [场景] 典型应用场景

1. **响应式断点** — 封装媒体查询逻辑
2. **浏览器兼容** — 封装前缀和兼容性代码
3. **组件基础样式** — 封装按钮、卡片等基础样式

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 模块化

#### [概念] 概念与解决的问题

Sass 模块化使用 `@use` 和 `@forward` 组织样式文件。`@use` 导入模块，`@forward` 转发模块。相比旧的 `@import`，模块化避免了全局命名空间污染。

解决的核心痛点：**样式文件组织**。大型项目样式复杂，需要拆分为多个文件，模块化让文件依赖关系清晰，避免命名冲突。

#### [语法] 核心用法

| 语法 | 用途 | 示例 |
|------|------|------|
| `@use 'file'` | 导入模块 | `@use 'variables'` |
| `@use 'file' as *` | 导入到全局命名空间 | `@use 'variables' as *` |
| `@forward 'file'` | 转发模块 | `@forward 'variables'` |

#### [代码] 代码示例

```scss
// styles/
//   ├── abstracts/
//   │   ├── _variables.scss
//   │   ├── _mixins.scss
//   │   ├── _functions.scss
//   │   └── _index.scss
//   ├── base/
//   │   ├── _reset.scss
//   │   ├── _typography.scss
//   │   └── _index.scss
//   ├── components/
//   │   ├── _buttons.scss
//   │   ├── _cards.scss
//   │   └── _index.scss
//   └── main.scss

// abstracts/_variables.scss
$primary: #3498db;
$secondary: #2ecc71;
$spacing: 1rem;

// abstracts/_mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// abstracts/_index.scss - 转发所有抽象层
@forward 'variables';
@forward 'mixins';
@forward 'functions';

// base/_reset.scss
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// base/_typography.scss
@use '../abstracts' as *;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

// components/_buttons.scss
@use '../abstracts' as *;

.btn {
  @include flex-center;
  padding: $spacing * 0.5 $spacing;
  border-radius: 0.375rem;
  
  &-primary {
    background-color: $primary;
    color: white;
  }
}

// main.scss - 主入口文件
@use 'abstracts';
@use 'base';
@use 'components';
```

#### [关联] 与核心层的关联

模块化组织核心层的变量、嵌套、混入，让样式文件结构清晰，便于维护和复用。

---

### 2. 函数

#### [概念] 概念与解决的问题

Sass 函数使用 `@function` 定义，可以计算并返回值。函数与混入的区别是：函数返回值，混入返回样式块。

解决的核心痛点：**动态计算**。需要根据输入计算颜色、尺寸等值时，函数比混入更合适。

#### [语法] 核心用法

```scss
@function name($args) {
  @return value;
}
```

#### [代码] 代码示例

```scss
// _functions.scss

// 颜色亮度判断
@function is-light($color) {
  @return (red($color) * 0.299 + green($color) * 0.587 + blue($color) * 0.114) > 150;
}

// 根据背景色返回合适的文字颜色
@function text-contrast($bg-color) {
  @if is-light($bg-color) {
    @return #333;
  } @else {
    @return #fff;
  }
}

// 间距计算
@function spacing($multiplier: 1) {
  @return 0.5rem * $multiplier;
}

// px 转 rem
@function rem($px) {
  @return calc($px / 16px) * 1rem;
}

// 生成颜色变体
@function color-variant($color, $amount: 10%) {
  @return (
    'base': $color,
    'light': lighten($color, $amount),
    'dark': darken($color, $amount),
  );
}
```

```scss
// 使用函数
@use 'functions' as *;

.button {
  $btn-color: #3498db;
  
  background-color: $btn-color;
  color: text-contrast($btn-color);
  padding: spacing(2) spacing(4);
  font-size: rem(14px);
}

.card {
  padding: spacing(3);
  margin-bottom: spacing(4);
}
```

#### [关联] 与核心层的关联

函数扩展了变量的能力，可以动态计算颜色、尺寸等值，与混入配合使用实现更灵活的样式逻辑。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| @if/@else | 需要条件判断时使用 |
| @for | 需要循环生成样式时使用 |
| @each | 需要遍历列表或 Map 时使用 |
| @while | 需要条件循环时使用 |
| %placeholder | 需要占位符选择器时使用 |
| @extend | 需要继承样式时使用（慎用） |
| @at-root | 需要跳出嵌套时使用 |
| @error | 需要抛出错误时使用 |
| @warn | 需要警告时使用 |
| Map 函数 | 需要操作 Map 数据时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：按钮组件库

**任务描述：** 使用 Sass 创建一个完整的按钮组件库。

**要求：**
1. 定义颜色变量系统
2. 使用混入封装按钮基础样式
3. 使用函数计算合适的文字颜色
4. 实现多种按钮变体（primary、secondary、outline、ghost）
5. 实现多种尺寸（sm、md、lg）

**输出：** 完整的 Sass 文件结构，包含变量、混入、函数和按钮组件样式。
