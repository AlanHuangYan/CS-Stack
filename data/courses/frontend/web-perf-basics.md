# Web 性能优化 三层深度学习教程

## [总览] 技术总览

Web 性能优化是提升网页加载速度和交互响应能力的技术实践。良好的性能不仅提升用户体验，还影响搜索引擎排名和转化率。优化涉及网络传输、资源加载、渲染渲染等多个环节。

本教程采用三层漏斗学习法：**核心层**聚焦加载优化、渲染优化、资源优化三大基石，掌握后即可完成 50% 以上的性能优化任务；**重点层**深入缓存策略和监控分析，提升持续优化能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手实践），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 加载优化

#### [概念] 概念解释

加载优化关注如何让页面资源更快到达浏览器。核心指标包括 FCP（首次内容绘制）、LCP（最大内容绘制）。优化手段包括减少请求、压缩资源、并行加载等。

为什么归为核心层？加载速度是用户的第一印象，加载慢会导致用户流失，不理解加载优化就无法构建高性能网站。

#### [语法] 核心语法 / 命令 / API

| 技术 | 用途 | 效果 |
|------|------|------|
| 代码分割 | 按需加载 JS | 减少首屏体积 |
| 懒加载 | 延迟加载非关键资源 | 加快首屏渲染 |
| 预加载 | 提前加载关键资源 | 减少等待时间 |
| 压缩 | 减小文件体积 | 加快传输速度 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>加载优化示例</title>
  
  <!-- 预连接：提前建立连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://cdn.example.com">
  
  <!-- 预加载：提前加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/css/critical.css" as="style">
  
  <!-- 预取：空闲时加载未来可能需要的资源 -->
  <link rel="prefetch" href="/js/next-page.js" as="script">
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">
  
  <!-- 内联关键 CSS -->
  <style>
    /* 首屏关键样式内联 */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .header { height: 60px; background: #fff; border-bottom: 1px solid #eee; }
    .hero { min-height: 400px; display: flex; align-items: center; justify-content: center; }
  </style>
  
  <!-- 异步加载非关键 CSS -->
  <link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'">
</head>
<body>
  <header class="header">导航栏</header>
  <main class="hero">主要内容</main>
  
  <!-- 图片懒加载 -->
  <img 
    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
    data-src="/images/hero.jpg" 
    alt="主图"
    loading="lazy"
    class="lazy-image"
  >
  
  <!-- 延迟加载非关键 JS -->
  <script src="/js/critical.js"></script>
  <script src="/js/analytics.js" defer></script>
  <script src="/js/ads.js" async></script>
  
  <script>
    // 图片懒加载实现
    document.addEventListener('DOMContentLoaded', function() {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        }, { rootMargin: '50px 0px' });
        
        lazyImages.forEach(function(img) {
          imageObserver.observe(img);
        });
      } else {
        // 降级处理
        lazyImages.forEach(function(img) {
          img.src = img.dataset.src;
        });
      }
    });
  </script>
</body>
</html>
```

```javascript
// 路由懒加载（React）
import { lazy, Suspense } from 'react'

// 懒加载组件
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}

// 预加载组件（鼠标悬停时）
function NavLink({ to, children }) {
  const handleMouseEnter = () => {
    // 预加载目标页面
    import('./pages/' + to.slice(1))
  }
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  )
}
```

#### [场景] 典型应用场景

1. **首屏优化** — 内联关键 CSS、懒加载非关键资源
2. **图片优化** — 懒加载、响应式图片、WebP 格式
3. **代码分割** — 路由懒加载、动态 import

---

### 2. 渲染优化

#### [概念] 概念解释

渲染优化关注浏览器如何将 HTML/CSS/JS 转换为像素。核心概念包括重排（Reflow）、重绘（Repaint）、合成（Composite）。优化目标是减少主线程阻塞。

为什么归为核心层？渲染性能直接影响交互响应，卡顿的页面会严重影响用户体验。

#### [语法] 核心语法 / 命令 / API

| 技术 | 用途 | 效果 |
|------|------|------|
| CSS transform | 变换动画 | 避免重排 |
| will-change | 提示浏览器优化 | 加速合成 |
| requestAnimationFrame | 动画帧同步 | 流畅动画 |
| Web Worker | 后台计算 | 不阻塞主线程 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>渲染优化示例</title>
  <style>
    /* 使用 transform 替代 top/left 做动画 */
    .box-bad {
      position: absolute;
      left: 0;
      top: 0;
      /* 每帧触发重排 */
      animation: move-bad 2s infinite;
    }
    
    .box-good {
      /* 使用 transform，只触发合成 */
      transform: translate(0, 0);
      will-change: transform;
      animation: move-good 2s infinite;
    }
    
    @keyframes move-bad {
      to { left: 100px; top: 100px; }
    }
    
    @keyframes move-good {
      to { transform: translate(100px, 100px); }
    }
    
    /* 使用 CSS containment 限制重排范围 */
    .card {
      contain: layout style;
    }
    
    /* 批量更新：使用 opacity 替代 visibility */
    .fade-bad {
      transition: visibility 0.3s;
    }
    
    .fade-good {
      transition: opacity 0.3s;
    }
    
    /* 避免强制同步布局 */
    .list-item {
      height: 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box-good">优化后的动画</div>
  </div>
  
  <script>
    // 避免强制同步布局（错误示例）
    function badResize() {
      const items = document.querySelectorAll('.list-item')
      items.forEach(item => {
        // 读取 offsetHeight 触发重排
        const height = item.offsetHeight
        // 写入样式又触发重排
        item.style.height = height + 10 + 'px'
      })
    }
    
    // 正确做法：批量读取，批量写入
    function goodResize() {
      const items = document.querySelectorAll('.list-item')
      
      // 批量读取
      const heights = Array.from(items).map(item => item.offsetHeight)
      
      // 批量写入
      items.forEach((item, i) => {
        item.style.height = heights[i] + 10 + 'px'
      })
    }
    
    // 使用 requestAnimationFrame 做动画
    function animate(element, duration) {
      const start = performance.now()
      
      function frame(time) {
        const progress = (time - start) / duration
        
        if (progress < 1) {
          element.style.transform = `translateX(${progress * 100}px)`
          requestAnimationFrame(frame)
        }
      }
      
      requestAnimationFrame(frame)
    }
    
    // 使用 Web Worker 处理复杂计算
    const worker = new Worker('worker.js')
    
    worker.onmessage = function(e) {
      console.log('计算结果:', e.data)
    }
    
    // 发送计算任务
    worker.postMessage({ type: 'calculate', data: largeArray })
  </script>
</body>
</html>
```

```javascript
// worker.js - Web Worker 示例
self.onmessage = function(e) {
  if (e.data.type === 'calculate') {
    // 复杂计算不阻塞主线程
    const result = e.data.data.reduce((sum, val) => sum + val * 2, 0)
    self.postMessage({ type: 'result', data: result })
  }
}
```

#### [场景] 典型应用场景

1. **动画优化** — 使用 transform 和 opacity
2. **列表渲染** — 虚拟列表、分批渲染
3. **复杂计算** — Web Worker 后台处理

---

### 3. 资源优化

#### [概念] 概念解释

资源优化关注如何减小资源体积和优化资源格式。包括图片压缩、代码压缩、资源合并等。体积越小，加载越快。

为什么归为核心层？资源体积直接影响传输时间，是性能优化的基础工作。

#### [语法] 核心语法 / 命令 / API

| 技术 | 用途 | 效果 |
|------|------|------|
| 图片压缩 | 减小图片体积 | 50-80% 体积减少 |
| WebP/AVIF | 新图片格式 | 比 JPEG 小 30% |
| Gzip/Brotli | 传输压缩 | 60-80% 体积减少 |
| Tree Shaking | 移除未使用代码 | 减小 JS 体积 |

#### [代码] 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>资源优化示例</title>
</head>
<body>
  <!-- 响应式图片 -->
  <picture>
    <!-- AVIF 格式（最新、最小） -->
    <source 
      type="image/avif" 
      srcset="/images/hero.avif"
    >
    <!-- WebP 格式（兼容性好） -->
    <source 
      type="image/webp" 
      srcset="/images/hero.webp"
    >
    <!-- 降级到 JPEG -->
    <img 
      src="/images/hero.jpg" 
      alt="响应式图片"
      width="800"
      height="450"
      loading="lazy"
      decoding="async"
    >
  </picture>
  
  <!-- 响应式图片：不同尺寸 -->
  <img
    srcset="/images/small.jpg 400w,
            /images/medium.jpg 800w,
            /images/large.jpg 1200w"
    sizes="(max-width: 600px) 400px,
           (max-width: 1000px) 800px,
           1200px"
    src="/images/medium.jpg"
    alt="响应式尺寸图片"
  >
  
  <!-- 使用 SVG 图标 -->
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  </svg>
  
  <!-- 使用内联 SVG（小图标） -->
  <span class="icon">
    <svg>...</svg>
  </span>
</body>
</html>
```

```javascript
// vite.config.js - 资源优化配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import imagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    react(),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    // Brotli 压缩（更好的压缩率）
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    
    // 图片压缩
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false }
        ]
      }
    })
  ],
  
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

#### [场景] 典型应用场景

1. **图片优化** — WebP/AVIF 格式、响应式图片
2. **代码优化** — Tree Shaking、代码压缩
3. **传输优化** — Gzip/Brotli 压缩

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 缓存策略

#### [概念] 概念与解决的问题

缓存策略决定资源如何被浏览器和 CDN 缓存。合理的缓存策略可以大幅减少重复请求，提升二次访问速度。

解决的核心痛点：**重复加载**。用户再次访问时，利用缓存可以秒开页面。

#### [语法] 核心用法

| 头部 | 用途 | 示例 |
|------|------|------|
| `Cache-Control` | 缓存控制 | `max-age=31536000` |
| `ETag` | 资源版本 | 哈希值 |
| `Last-Modified` | 最后修改时间 | 时间戳 |

#### [代码] 代码示例

```nginx
# nginx.conf - 缓存配置
server {
    # 静态资源：长期缓存 + 内容哈希
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # HTML：不缓存或短期缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # API：不缓存
    location /api/ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_pass http://backend;
    }
}
```

```javascript
// Service Worker 缓存
const CACHE_NAME = 'v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js'
]

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

// 请求时优先使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

#### [关联] 与核心层的关联

缓存策略配合资源优化，让优化后的资源可以长期缓存，最大化利用浏览器缓存能力。

---

### 2. 监控分析

#### [概念] 概念与解决的问题

性能监控帮助发现性能瓶颈。工具包括 Lighthouse、WebPageTest、Chrome DevTools 等。关键指标包括 Core Web Vitals。

解决的核心痛点：**发现问题**。无法衡量的东西就无法优化，监控是优化的前提。

#### [语法] 核心用法

```javascript
// Performance API 获取性能指标
const timing = performance.timing
const paint = performance.getEntriesByType('paint')
```

#### [代码] 代码示例

```javascript
// 性能指标收集
function collectMetrics() {
  // 导航计时
  const navigation = performance.getEntriesByType('navigation')[0]
  
  // FCP（首次内容绘制）
  const fcp = performance.getEntriesByType('paint')
    .find(entry => entry.name === 'first-contentful-paint')
  
  // LCP（最大内容绘制）
  const lcp = performance.getEntriesByType('largest-contentful-paint')
  
  // CLS（累积布局偏移）
  let cls = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    }
  }).observe({ type: 'layout-shift', buffered: true })
  
  // FID（首次输入延迟）
  new PerformanceObserver((list) => {
    const fid = list.getEntries()[0]
    console.log('FID:', fid.processingStart - fid.startTime)
  }).observe({ type: 'first-input', buffered: true })
  
  return {
    // 页面加载时间
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
    // DOM 解析时间
    domParse: navigation.domInteractive - navigation.fetchStart,
    // FCP
    fcp: fcp?.startTime,
    // LCP
    lcp: lcp[lcp.length - 1]?.startTime,
    // CLS
    cls
  }
}

// 上报性能数据
function reportMetrics(metrics) {
  navigator.sendBeacon('/api/metrics', JSON.stringify(metrics))
}

// 页面加载完成后收集
window.addEventListener('load', () => {
  setTimeout(collectMetrics, 0)
})
```

#### [关联] 与核心层的关联

监控分析验证加载优化和渲染优化的效果，发现新的优化机会。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Core Web Vitals | 需要了解 Google 核心指标时使用 |
| Lighthouse | 需要全面性能审计时使用 |
| WebPageTest | 需要详细网络分析时使用 |
| Service Worker | 需要离线缓存时使用 |
| HTTP/2 | 需要多路复用传输时使用 |
| HTTP/3 | 需要更快连接建立时使用 |
| CDN | 需要全球加速时使用 |
| Critical CSS | 需要内联关键 CSS 时使用 |
| Preload/Prefetch | 需要资源预加载时使用 |
| Virtual List | 需要长列表优化时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：首页性能优化

**任务描述：** 对一个现有网站首页进行性能优化。

**要求：**
1. 使用 Lighthouse 分析当前性能
2. 实现图片懒加载
3. 配置资源缓存策略
4. 优化关键渲染路径
5. 对比优化前后的性能指标

**输出：** 优化报告，包含优化前后的 Lighthouse 分数对比和具体优化措施。
