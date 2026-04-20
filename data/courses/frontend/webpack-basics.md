# Webpack 基础 三层深度学习教程

## [总览] 技术总览

Webpack 是功能强大的前端模块打包工具，将各种资源（JavaScript、CSS、图片等）视为模块，通过 Loader 和 Plugin 进行处理，最终输出优化后的静态资源。虽然 Vite 等新工具日益流行，Webpack 仍是企业级项目的主流选择。

本教程采用三层漏斗学习法：**核心层**聚焦入口与出口、Loader、Plugin 三大基石，掌握后即可完成 50% 以上的构建任务；**重点层**深入开发服务器和代码分割，提升开发体验和构建优化能力；**扩展层**仅作关键词索引，供后续按需查阅。

学习策略：先精通核心层（必须动手敲代码），再理解重点层原理，扩展层建立索引即可。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成该技术 **50% 以上** 的常见任务。

### 1. 入口与出口

#### [概念] 概念解释

入口（Entry）是 Webpack 构建的起点，Webpack 从入口文件开始分析依赖关系。出口（Output）定义打包文件的输出位置和命名规则。

为什么归为核心层？入口和出口是 Webpack 配置的基础，不理解它们就无法定义构建的输入输出。

#### [语法] 核心语法 / 命令 / API

| 配置 | 用途 | 示例 |
|------|------|------|
| `entry` | 入口配置 | `entry: './src/index.js'` |
| `output.path` | 输出目录 | `path: path.resolve(__dirname, 'dist')` |
| `output.filename` | 输出文件名 | `filename: 'bundle.js'` |
| `output.clean` | 清理输出目录 | `clean: true` |

#### [代码] 代码示例

```javascript
// webpack.config.js - 单入口配置
const path = require('path')

module.exports = {
  // 单入口
  entry: './src/index.js',
  
  output: {
    // 输出目录（必须是绝对路径）
    path: path.resolve(__dirname, 'dist'),
    
    // 输出文件名
    filename: 'bundle.js',
    
    // 静态资源公共路径
    publicPath: '/',
    
    // 构建前清理输出目录
    clean: true
  }
}
```

```javascript
// webpack.config.js - 多入口配置
const path = require('path')

module.exports = {
  // 多入口
  entry: {
    main: './src/index.js',
    admin: './src/admin.js',
    vendor: ['react', 'react-dom']
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    
    // 使用 [name] 占位符
    filename: 'js/[name].[contenthash:8].js',
    
    // 静态资源文件名
    assetModuleFilename: 'assets/[hash][ext][query]',
    
    clean: true
  }
}
```

```javascript
// webpack.config.js - 完整基础配置
const path = require('path')

module.exports = {
  mode: 'development',  // development | production | none
  
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true
  },
  
  // 解析配置
  resolve: {
    // 扩展名省略
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    
    // 路径别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
}
```

#### [场景] 典型应用场景

1. **单页应用** — 单入口配置
2. **多页应用** — 多入口配置，输出多个 bundle
3. **库开发** — 配置 library 输出格式

---

### 2. Loader

#### [概念] 概念解释

Loader 让 Webpack 能够处理非 JavaScript 文件（CSS、图片、TypeScript 等）。每个 Loader 负责将特定类型的文件转换为 Webpack 能理解的模块。

为什么归为核心层？Loader 是 Webpack 处理各种资源的核心机制，不理解 Loader 就无法处理 CSS、图片等常见资源。

#### [语法] 核心语法 / 命令 / API

| Loader | 用途 | 示例 |
|------|------|------|
| `babel-loader` | 转译 JavaScript | 处理 ES6+ 语法 |
| `css-loader` | 处理 CSS | 解析 CSS 中的 @import |
| `style-loader` | 注入 CSS | 将 CSS 注入到 DOM |
| `sass-loader` | 处理 Sass | 编译 SCSS 文件 |
| `ts-loader` | 处理 TypeScript | 编译 TS 文件 |

#### [代码] 代码示例

```javascript
// webpack.config.js - Loader 配置
const path = require('path')

module.exports = {
  module: {
    rules: [
      // JavaScript/JSX 处理
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      
      // TypeScript 处理
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      
      // CSS 处理（从后往前执行）
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      
      // Sass/SCSS 处理
      {
        test: /\.scss$/,
        use: [
          'style-loader',    // 将 CSS 注入 DOM
          'css-loader',      // 解析 CSS
          'sass-loader'      // 编译 Sass
        ]
      },
      
      // CSS Modules
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      },
      
      // 图片处理（Webpack 5 内置）
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转 base64
          }
        },
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      
      // 字体处理
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  }
}
```

```javascript
// babel.config.js - Babel 配置
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        useBuiltIns: 'usage',
        corejs: 3
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ]
}
```

```javascript
// 使用示例
import React from 'react'
import './styles.css'                    // 全局 CSS
import styles from './Button.module.css' // CSS Modules
import logo from './logo.png'            // 图片

function Button() {
  return (
    <button className={styles.button}>
      <img src={logo} alt="Logo" />
      Click me
    </button>
  )
}
```

#### [场景] 典型应用场景

1. **CSS 处理** — style-loader + css-loader + sass-loader
2. **图片处理** — asset/resource 或 asset/inline
3. **TypeScript** — ts-loader 或 babel-loader

---

### 3. Plugin

#### [概念] 概念解释

Plugin 用于扩展 Webpack 功能，在构建流程的特定时机执行操作。常用功能包括生成 HTML 文件、复制静态资源、压缩代码等。

为什么归为核心层？Plugin 是 Webpack 功能扩展的核心机制，不理解 Plugin 就无法实现 HTML 生成、代码压缩等关键功能。

#### [语法] 核心语法 / 命令 / API

| Plugin | 用途 | 示例 |
|------|------|------|
| `HtmlWebpackPlugin` | 生成 HTML | 自动注入 bundle |
| `CopyPlugin` | 复制文件 | 复制静态资源 |
| `DefinePlugin` | 定义常量 | 注入环境变量 |
| `MiniCssExtractPlugin` | 提取 CSS | 分离 CSS 文件 |

#### [代码] 代码示例

```javascript
// webpack.config.js - Plugin 配置
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { DefinePlugin } = require('webpack')

module.exports = {
  plugins: [
    // 生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'My App',
      favicon: './public/favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    
    // 多页面应用：生成多个 HTML
    new HtmlWebpackPlugin({
      template: './public/admin.html',
      filename: 'admin.html',
      chunks: ['admin']  // 只包含 admin 入口
    }),
    
    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),
    
    // 复制静态资源
    new CopyPlugin({
      patterns: [
        { from: 'public', to: 'public', globOptions: { ignore: ['**/index.html'] } }
      ]
    }),
    
    // 定义环境变量
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify(process.env.API_URL)
    })
  ]
}
```

```javascript
// webpack.config.js - 生产环境 Plugin
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  mode: 'production',
  
  optimization: {
    minimizer: [
      // JavaScript 压缩
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }),
      
      // CSS 压缩
      new CssMinimizerPlugin()
    ]
  },
  
  plugins: [
    // 打包分析
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
}
```

#### [场景] 典型应用场景

1. **HTML 生成** — HtmlWebpackPlugin 自动注入资源
2. **CSS 提取** — MiniCssExtractPlugin 分离 CSS
3. **代码压缩** — TerserPlugin 压缩 JavaScript

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的代码质量、排错能力和开发效率将显著提升。

### 1. 开发服务器

#### [概念] 概念与解决的问题

webpack-dev-server 提供开发环境服务器，支持热更新（HMR）、代理、静态文件服务等功能。配置得当可以大幅提升开发体验。

解决的核心痛点：**开发效率**。无需每次修改都重新构建，热更新让修改立即生效。

#### [语法] 核心用法

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    port: 3000,
    hot: true,
    proxy: { '/api': 'http://localhost:8080' }
  }
}
```

#### [代码] 代码示例

```javascript
// webpack.config.js - 完整开发服务器配置
const path = require('path')

module.exports = {
  devServer: {
    // 端口
    port: 3000,
    
    // 自动打开浏览器
    open: true,
    
    // 启用热更新
    hot: true,
    
    // 启用 gzip 压缩
    compress: true,
    
    // 静态文件服务
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/public'
    },
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },
    
    // history 路由回退
    historyApiFallback: true,
    
    // 控制台输出
    client: {
      logging: 'warn',
      overlay: {
        errors: true,
        warnings: false
      }
    }
  }
}
```

#### [关联] 与核心层的关联

开发服务器配合入口出口和 Loader，实现开发环境的快速迭代。

---

### 2. 代码分割

#### [概念] 概念与解决的问题

代码分割将代码拆分为多个 chunk，实现按需加载和缓存优化。Webpack 提供 SplitChunksPlugin 自动分割公共代码。

解决的核心痛点：**性能优化**。减少首屏加载体积，提高缓存利用率。

#### [语法] 核心用法

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
```

#### [代码] 代码示例

```javascript
// webpack.config.js - 代码分割配置
module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      
      // 最小尺寸
      minSize: 20000,
      
      // 分割缓存组
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // 公共模块
        commons: {
          minChunks: 2,
          name: 'commons',
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // 运行时代码
    runtimeChunk: {
      name: 'runtime'
    }
  }
}
```

```javascript
// 动态导入（懒加载）
// import() 语法实现按需加载
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

// React 路由懒加载
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

#### [关联] 与核心层的关联

代码分割优化了入口输出的 bundle，配合 Plugin 实现更细粒度的控制。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Tree Shaking | 需要移除未使用代码时使用 |
| Module Federation | 需要微前端架构时使用 |
| DllPlugin | 需要预编译第三方库时使用 |
| externals | 需要排除某些依赖时使用 |
| cache | 需要持久化缓存时使用 |
| thread-loader | 需要多线程构建时使用 |
| source-map | 需要调试源码时使用 |
| performance | 需要性能提示时使用 |
| stats | 需要分析构建结果时使用 |
| devtool | 需要配置 sourcemap 类型时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：React 项目构建配置

**任务描述：** 使用 Webpack 创建一个完整的 React + TypeScript 项目构建配置。

**要求：**
1. 配置入口和出口
2. 配置 Babel 和 TypeScript Loader
3. 配置 CSS 和图片处理
4. 配置 HtmlWebpackPlugin
5. 配置开发服务器和代理

**输出：** 一个完整的 webpack.config.js 配置文件，包含开发和生产环境配置。
