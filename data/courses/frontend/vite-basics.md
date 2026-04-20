# Vite 基础 三层深度学习教程

## [总览] 技术总览

Vite 是新一代前端构建工具，由 Vue 作者尤雨溪开发。它利用浏览器原生 ES 模块支持，实现极速的开发服务器启动和热更新。Vite 使用 Rollup 进行生产构建，输出优化的静态资源。

本教程采用三层漏斗学习法：**核心层**聚焦项目创建、开发服务器、构建配置三大基石，掌握后即可完成 50% 以上的日常开发任务；**重点层**深入插件系统和环境变量，提升项目配置能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 项目创建

#### [概念] 概念解释

Vite 提供了 `npm create vite` 命令快速创建项目，支持多种框架模板（Vue、React、Svelte、Vanilla 等）。创建的项目结构简洁，开箱即用。

为什么归为核心层？项目创建是使用 Vite 的第一步，不理解项目创建就无法开始使用 Vite。

#### [语法] 核心语法 / 命令 / API

| 命令 | 用途 | 示例 |
|------|------|------|
| `npm create vite@latest` | 创建项目 | 交互式选择模板 |
| `npm create vite@latest my-app -- --template react` | 指定模板 | 创建 React 项目 |
| `npm run dev` | 启动开发服务器 | 默认端口 5173 |
| `npm run build` | 构建生产版本 | 输出到 dist 目录 |
| `npm run preview` | 预览生产构建 | 本地预览 dist |

#### [代码] 代码示例

```bash
# 创建 Vue 项目
npm create vite@latest my-vue-app -- --template vue

# 创建 React 项目
npm create vite@latest my-react-app -- --template react

# 创建 React + TypeScript 项目
npm create vite@latest my-react-ts-app -- --template react-ts

# 创建 Svelte 项目
npm create vite@latest my-svelte-app -- --template svelte

# 创建纯 JavaScript 项目
npm create vite@latest my-vanilla-app -- --template vanilla
```

```
# 项目结构示例（React + TypeScript）
my-react-ts-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

```json
// package.json
{
  "name": "my-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

```html
<!-- index.html - 入口 HTML 文件 -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
// src/main.tsx - 入口文件
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### [场景] 典型应用场景

1. **新项目启动** — 快速创建项目脚手架
2. **原型开发** — 快速搭建可运行的原型
3. **学习项目** — 创建简洁的学习环境

---

### 2. 开发服务器

#### [概念] 概念解释

Vite 开发服务器利用浏览器原生 ES 模块，无需打包即可启动。修改代码后，Vite 只重新加载修改的模块，实现毫秒级热更新（HMR）。

为什么归为核心层？开发服务器是 Vite 的核心优势，理解它才能发挥 Vite 的速度优势。

#### [语法] 核心语法 / 命令 / API

| 配置 | 用途 | 示例 |
|------|------|------|
| `server.port` | 端口号 | `port: 3000` |
| `server.host` | 监听地址 | `host: '0.0.0.0'` |
| `server.open` | 自动打开浏览器 | `open: true` |
| `server.proxy` | 代理配置 | 代理 API 请求 |

#### [代码] 代码示例

```typescript
// vite.config.ts - 开发服务器配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,           // 端口号
    host: '0.0.0.0',      // 允许局域网访问
    open: true,           // 自动打开浏览器
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    
    // CORS 配置
    cors: true,
    
    // HMR 配置
    hmr: {
      overlay: true  // 在浏览器中显示错误覆盖层
    }
  }
})
```

```typescript
// src/App.tsx - HMR 示例
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // 修改这个函数，保存后会立即看到更新，页面状态不会丢失
  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p className="read-the-docs">
        点击按钮后修改代码，状态会保留
      </p>
    </div>
  )
}

export default App

// HMR 热更新边界
// Vite 会自动处理 React 组件的 HMR
// 如果需要手动控制，可以使用：
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 自定义 HMR 逻辑
  })
}
```

```typescript
// vite.config.ts - 高级开发服务器配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    
    // 多代理配置
    proxy: {
      // 主 API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      },
      
      // 认证服务
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      
      // WebSocket
      '/ws': {
        target: 'ws://localhost:8082',
        ws: true
      }
    },
    
    // 监听文件变化
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  
  // 预构建依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['your-linked-package']
  }
})
```

#### [场景] 典型应用场景

1. **本地开发** — 快速启动开发环境
2. **API 代理** — 解决跨域问题
3. **局域网调试** — 手机/平板访问开发环境

---

### 3. 构建配置

#### [概念] 概念解释

`vite.config.js/ts` 是 Vite 的配置文件，用于自定义构建行为。常用配置包括路径别名、环境变量、构建优化等。

为什么归为核心层？构建配置是项目定制化的基础，不理解配置就无法适配项目需求。

#### [语法] 核心语法 / 命令 / API

| 配置 | 用途 | 示例 |
|------|------|------|
| `resolve.alias` | 路径别名 | `@: '/src'` |
| `base` | 公共基础路径 | `base: '/app/'` |
| `build.outDir` | 输出目录 | `outDir: 'dist'` |
| `build.sourcemap` | 生成 sourcemap | `sourcemap: true` |

#### [代码] 代码示例

```typescript
// vite.config.ts - 完整配置示例
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // 基础路径
  base: '/',
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  
  // CSS 配置
  css: {
    // CSS 模块
    modules: {
      localsConvention: 'camelCase'
    },
    // 预处理器
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // 分包策略
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
    },
    
    // 块大小警告限制
    chunkSizeWarningLimit: 1000
  },
  
  // 开发服务器
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

```typescript
// tsconfig.json - 配合路径别名
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    // 路径映射，与 vite.config.ts 保持一致
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@assets/*": ["src/assets/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```tsx
// 使用路径别名
import Button from '@components/Button'
import { formatDate } from '@utils/date'
import logo from '@assets/logo.png'
import '@styles/global.css'

function App() {
  return (
    <div>
      <img src={logo} alt="Logo" />
      <Button>点击</Button>
      <p>{formatDate(new Date())}</p>
    </div>
  )
}
```

#### [场景] 典型应用场景

1. **路径别名** — 简化导入路径
2. **代理配置** — 解决开发环境跨域
3. **构建优化** — 代码分割、压缩

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 插件系统

#### [概念] 概念与解决的问题

Vite 插件基于 Rollup 插件接口扩展，可以在构建过程的不同阶段介入处理。常用插件包括框架支持、SVG 导入、压缩等。

解决的核心痛点：**功能扩展**。Vite 核心只提供基础功能，插件系统让 Vite 可以处理各种场景。

#### [语法] 核心用法

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import pluginA from 'vite-plugin-a'

export default defineConfig({
  plugins: [pluginA()]
})
```

#### [代码] 代码示例

```typescript
// vite.config.ts - 常用插件配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import compression from 'vite-plugin-compression'
import visualizer from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // React 支持
    react(),
    
    // SVG 转 React 组件
    svgr({
      include: '**/*.svg?react'
    }),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    // 打包分析
    visualizer({
      open: true,
      gzipSize: true
    })
  ]
})
```

```typescript
// 自定义插件示例
import { Plugin } from 'vite'

function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    // 在服务器启动时调用
    buildStart() {
      console.log('Build started')
    },
    
    // 转换模块
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null
        }
      }
    },
    
    // 构建结束时调用
    buildEnd() {
      console.log('Build ended')
    }
  }
}
```

#### [关联] 与核心层的关联

插件系统扩展了核心层的构建配置能力，让 Vite 可以处理更多类型的文件和场景。

---

### 2. 环境变量

#### [概念] 概念与解决的问题

Vite 使用 `.env` 文件管理环境变量，通过 `import.meta.env` 访问。支持 `.env.local`、`.env.development`、`.env.production` 等多环境配置。

解决的核心痛点：**多环境配置**。开发、测试、生产环境通常需要不同的配置，环境变量让切换更简单。

#### [语法] 核心用法

```bash
# .env 文件
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=My App
```

```typescript
// 使用环境变量
const apiUrl = import.meta.env.VITE_API_URL
```

#### [代码] 代码示例

```bash
# .env - 所有环境共享
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_URL=http://localhost:8080
VITE_ENABLE_MOCK=true

# .env.production - 生产环境
VITE_API_URL=https://api.example.com
VITE_ENABLE_MOCK=false

# .env.local - 本地覆盖（不提交到 Git）
VITE_API_URL=http://192.168.1.100:8080
```

```typescript
// src/config/index.ts - 环境变量封装
export const config = {
  // API 地址
  apiUrl: import.meta.env.VITE_API_URL,
  
  // 应用标题
  appTitle: import.meta.env.VITE_APP_TITLE,
  
  // 是否启用 Mock
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  
  // 运行模式
  mode: import.meta.env.MODE,
  
  // 是否开发环境
  isDev: import.meta.env.DEV,
  
  // 是否生产环境
  isProd: import.meta.env.PROD,
  
  // 基础路径
  baseUrl: import.meta.env.BASE_URL
}

// 类型定义
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

```typescript
// vite.config.ts - 动态环境变量
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    define: {
      // 注入全局常量
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true
        }
      }
    }
  }
})
```

#### [关联] 与核心层的关联

环境变量与构建配置配合使用，让不同环境可以使用不同的配置值。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| SSR | 需要服务端渲染时使用 vite-plugin-ssr |
| Library Mode | 需要打包为库时使用 build.lib 配置 |
| Module Federation | 需要微前端时使用 @originjs/vite-plugin-federation |
| PWA | 需要渐进式应用时使用 vite-plugin-pwa |
| Legacy | 需要兼容旧浏览器时使用 @vitejs/plugin-legacy |
| Image Optimization | 需要图片优化时使用 vite-plugin-imagemin |
| Markdown | 需要导入 Markdown 时使用 vite-plugin-md |
| Vue JSX | 需要在 Vue 中使用 JSX 时使用 @vitejs/plugin-vue-jsx |

---

## [实战] 核心实战清单

### 实战任务 1：React 项目脚手架

**任务描述：** 使用 Vite 创建一个完整的 React + TypeScript 项目脚手架。

**要求：**
1. 配置路径别名 `@`
2. 配置 API 代理
3. 配置环境变量（开发/生产）
4. 配置代码分割策略
5. 添加 Gzip 压缩插件

**输出：** 一个完整的 Vite React 项目，包含配置文件和示例代码。
