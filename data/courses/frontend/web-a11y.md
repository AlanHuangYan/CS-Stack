# Web 无障碍与 SEO 三层深度学习教程

## [总览] 技术总览

Web 无障碍（Accessibility/A11y）确保网站对所有用户可用，包括残障人士。SEO（搜索引擎优化）提升网站在搜索引擎中的排名。两者都关注网页的可访问性和语义化结构。

本教程采用三层漏斗学习法：**核心层**聚焦语义化 HTML、ARIA 属性、可访问性测试三大基石；**重点层**深入 SEO 优化和性能关联；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 语义化 HTML

#### [概念] 概念解释

语义化 HTML 使用正确的标签表达内容含义，不仅帮助搜索引擎理解页面结构，还能让屏幕阅读器正确朗读内容。

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语义化 HTML 示例</title>
</head>
<body>
  <!-- 页眉 -->
  <header role="banner">
    <nav aria-label="主导航">
      <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <!-- 主内容 -->
  <main role="main">
    <article>
      <header>
        <h1>文章标题</h1>
        <time datetime="2024-01-15">2024年1月15日</time>
      </header>
      
      <section aria-labelledby="intro-heading">
        <h2 id="intro-heading">简介</h2>
        <p>这是文章的简介部分...</p>
      </section>
      
      <section aria-labelledby="details-heading">
        <h2 id="details-heading">详细内容</h2>
        <p>这是文章的详细内容...</p>
      </section>
    </article>
    
    <!-- 侧边栏 -->
    <aside aria-label="相关文章">
      <h2>相关文章</h2>
      <ul>
        <li><a href="#">文章链接 1</a></li>
        <li><a href="#">文章链接 2</a></li>
      </ul>
    </aside>
  </main>

  <!-- 页脚 -->
  <footer role="contentinfo">
    <p>&copy; 2024 示例网站</p>
  </footer>
</body>
</html>
```

### 2. ARIA 属性

#### [概念] 概念解释

ARIA（Accessible Rich Internet Applications）属性为复杂组件提供额外的无障碍信息，如角色、状态、属性。

#### [代码] 代码示例

```html
<!-- 按钮角色 -->
<div role="button" tabindex="0" aria-pressed="false">
  切换按钮
</div>

<!-- 模态框 -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">确认操作</h2>
  <p>确定要执行此操作吗？</p>
  <button>确认</button>
  <button>取消</button>
</div>

<!-- 标签页 -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">标签 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel2">标签 2</button>
</div>
<div role="tabpanel" id="panel1" aria-labelledby="tab1">内容 1</div>
<div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>内容 2</div>

<!-- 表单 -->
<form>
  <div>
    <label for="email">邮箱</label>
    <input type="email" id="email" aria-required="true" aria-describedby="email-hint">
    <span id="email-hint">请输入有效的邮箱地址</span>
  </div>
  
  <fieldset>
    <legend>选择颜色</legend>
    <label>
      <input type="radio" name="color" value="red"> 红色
    </label>
    <label>
      <input type="radio" name="color" value="blue"> 蓝色
    </label>
  </fieldset>
</form>
```

### 3. 可访问性测试

#### [概念] 概念解释

可访问性测试验证网站是否符合 WCAG 标准。工具包括 Lighthouse、axe、WAVE 等。

#### [代码] 代码示例

```javascript
// 使用 axe-core 进行自动化测试
import { configureAxe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. SEO 优化

#### [概念] 概念与解决的问题

SEO 优化提升网站在搜索引擎中的可见性，包括元标签、结构化数据、站点地图等。

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 基础 SEO -->
  <title>页面标题 - 网站名称</title>
  <meta name="description" content="页面描述，不超过160字符">
  <meta name="keywords" content="关键词1, 关键词2">
  <link rel="canonical" href="https://example.com/page">
  
  <!-- Open Graph -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="article">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="页面标题">
  <meta name="twitter:description" content="页面描述">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "文章标题",
    "author": {
      "@type": "Person",
      "name": "作者名"
    },
    "datePublished": "2024-01-15",
    "image": "https://example.com/image.jpg"
  }
  </script>
</head>
<body>
  <!-- 语义化内容 -->
</body>
</html>
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| WCAG | 需要了解无障碍标准时使用 |
| Lighthouse | 需要全面审计时使用 |
| axe DevTools | 需要浏览器插件测试时使用 |
| 结构化数据 | 需要 SEO 增强时使用 |
| 站点地图 | 需要搜索引擎收录时使用 |
| robots.txt | 需要控制爬虫时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：无障碍博客页面

**任务描述：** 创建一个符合 WCAG 2.1 AA 标准的博客页面。

**要求：**
1. 使用语义化 HTML 结构
2. 添加必要的 ARIA 属性
3. 确保键盘导航可用
4. 通过 Lighthouse 无障碍审计
