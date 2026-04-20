# NPM 包管理 三层深度学习教程

## [总览] 技术总览

NPM（Node Package Manager）是 JavaScript 生态中最流行的包管理工具，也是 Node.js 的默认包管理器。它提供了包安装、版本管理、脚本执行、发布包等功能，是前端和 Node.js 开发的必备工具。

本教程采用三层漏斗学习法：**核心层**聚焦 npm install、package.json、npm scripts 三大基石；**重点层**深入版本管理、私有包、发布流程；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 NPM 包管理 **50% 以上** 的常见任务。

### 1. npm install

#### [概念] 概念解释

npm install 是最常用的命令，用于安装项目依赖。它可以安装 package.json 中声明的所有依赖，也可以安装单个包。理解安装模式和参数对于管理项目依赖至关重要。

#### [语法] 核心语法 / 命令 / API

**常用安装命令：**

| 命令 | 说明 |
|------|------|
| npm install | 安装所有依赖 |
| npm install <package> | 安装指定包 |
| npm install <package> --save | 安装并添加到 dependencies |
| npm install <package> --save-dev | 安装并添加到 devDependencies |
| npm install -g <package> | 全局安装 |
| npm install <package>@version | 安装指定版本 |

#### [代码] 代码示例

```bash
# 安装所有依赖
npm install

# 安装生产依赖
npm install express

# 安装开发依赖
npm install --save-dev typescript
npm install -D jest

# 全局安装
npm install -g nodemon
npm install -g @vue/cli

# 安装指定版本
npm install lodash@4.17.21
npm install react@^18.0.0

# 安装特定标签版本
npm install beta@next

# 清理缓存后安装
npm cache clean --force
npm install

# 使用不同镜像源
npm install --registry=https://registry.npmmirror.com

# 安装可选依赖
npm install --save-optional eslint-plugin-prettier

# 精确版本安装
npm install --save-exact react@18.2.0

# 强制重新安装
npm install --force
```

#### [场景] 典型应用场景

1. 初始化项目时安装所有依赖
2. 添加新的第三方库到项目
3. 安装全局命令行工具

### 2. package.json

#### [概念] 概念解释

package.json 是项目的配置文件，定义了项目名称、版本、依赖、脚本等元信息。它是 npm 项目的核心配置文件，所有 npm 操作都围绕它进行。

#### [语法] 核心语法 / 命令 / API

**package.json 主要字段：**

| 字段 | 说明 |
|------|------|
| name | 项目名称 |
| version | 版本号 |
| description | 项目描述 |
| main | 入口文件 |
| scripts | 脚本命令 |
| dependencies | 生产依赖 |
| devDependencies | 开发依赖 |
| peerDependencies | 同级依赖 |

#### [代码] 代码示例

```json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "一个示例项目",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.js\""
  },
  "keywords": ["node", "javascript", "example"],
  "author": "Developer",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "eslint": "^8.42.0",
    "prettier": "^2.8.8",
    "nodemon": "^2.0.22",
    "webpack": "^5.88.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/user/my-awesome-project.git"
  },
  "bugs": {
    "url": "https://github.com/user/my-awesome-project/issues"
  },
  "homepage": "https://github.com/user/my-awesome-project#readme"
}
```

```bash
# 初始化 package.json
npm init
npm init -y  # 使用默认值

# 查看项目信息
npm list
npm list --depth=0
npm list -g --depth=0

# 查看过期依赖
npm outdated

# 更新依赖
npm update
npm update <package>

# 卸载依赖
npm uninstall <package>
npm uninstall -D <package>
```

#### [场景] 典型应用场景

1. 创建新项目时初始化配置
2. 管理项目依赖版本
3. 定义项目构建和测试脚本

### 3. npm scripts

#### [概念] 概念解释

npm scripts 是 package.json 中定义的脚本命令，可以简化复杂的命令行操作。通过 npm run 命令执行，支持生命周期钩子和跨平台执行。

#### [语法] 核心语法 / 命令 / API

**脚本执行命令：**

| 命令 | 说明 |
|------|------|
| npm run <script> | 执行自定义脚本 |
| npm start | 执行 start 脚本 |
| npm test | 执行 test 脚本 |
| npm run build | 执行 build 脚本 |
| npm run dev | 执行 dev 脚本 |

#### [代码] 代码示例

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "webpack --mode production",
    "test": "jest --coverage",
    "lint": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "clean": "rm -rf dist/",
    "prebuild": "npm run clean",
    "postbuild": "echo 'Build completed!'",
    "deploy": "npm run build && npm run publish",
    "watch": "webpack --watch",
    "dev:server": "node server.js",
    "dev:client": "webpack serve",
    "dev:all": "npm run dev:server & npm run dev:client"
  }
}
```

```bash
# 执行脚本
npm start
npm test
npm run build
npm run dev

# 传递参数
npm run test -- --watch
npm run build -- --mode development

# 并行执行
npm run dev:all

# 生命周期钩子
# prebuild 在 build 之前执行
# postbuild 在 build 之后执行
npm run build
```

#### [场景] 典型应用场景

1. 启动开发服务器
2. 构建生产版本
3. 运行测试和代码检查

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的包管理能力和项目维护能力将显著提升。

### 1. 版本管理

#### [概念] 概念与解决的问题

语义化版本（SemVer）是 npm 的版本管理规范，格式为 MAJOR.MINOR.PATCH。理解版本范围和锁定文件对于保证项目稳定性至关重要。

#### [语法] 核心用法

**版本范围符号：**

| 符号 | 说明 | 示例 |
|------|------|------|
| ^ | 兼容版本 | ^1.2.3 >=1.2.3 <2.0.0 |
| ~ | 近似版本 | ~1.2.3 >=1.2.3 <1.3.0 |
| >, >=, <, <= | 比较版本 | >1.2.3 |
| - | 范围 | 1.2.3 - 1.5.0 |
| || | 或 | ^1.0.0 || ^2.0.0 |

#### [代码] 代码示例

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "~4.17.21",
    "axios": "1.4.0",
    "react": ">=16.8.0 <19.0.0"
  }
}
```

```bash
# 查看包版本
npm view react versions
npm view react version

# 安装特定版本
npm install react@18.2.0

# 更新到最新版本
npm update react

# 更新主版本
npm install react@latest

# 版本管理命令
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 查看过期包
npm outdated

# 审计安全漏洞
npm audit
npm audit fix
```

#### [关联] 与核心层的关联

版本管理是 package.json 配置的延伸，通过合理的版本约束保证依赖稳定性。

### 2. 私有包

#### [概念] 概念与解决的问题

私有包允许组织内部共享代码而不公开发布。npm 支持私有包仓库和企业级私有仓库解决方案。

#### [语法] 核心用法

**私有包配置：**

| 配置 | 说明 |
|------|------|
| .npmrc | npm 配置文件 |
| scope | 包作用域 @org/package |
| registry | 私有仓库地址 |

#### [代码] 代码示例

```bash
# .npmrc 配置私有仓库
@mycompany:registry=https://npm.mycompany.com
registry=https://registry.npmjs.org/

# 认证配置
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

```json
// package.json 使用私有包
{
  "name": "@mycompany/my-private-package",
  "version": "1.0.0",
  "private": true,
  "publishConfig": {
    "registry": "https://npm.mycompany.com"
  }
}
```

```bash
# 登录私有仓库
npm login --registry=https://npm.mycompany.com

# 发布私有包
npm publish

# 安装私有包
npm install @mycompany/my-private-package
```

#### [场景] 典型应用场景

1. 组织内部共享组件库
2. 发布私有工具包
3. 管理企业级依赖

### 3. 发布流程

#### [概念] 概念与解决的问题

发布流程是将本地包发布到 npm 仓库的过程。理解发布流程和最佳实践可以避免常见错误。

#### [语法] 核心用法

**发布命令：**

| 命令 | 说明 |
|------|------|
| npm publish | 发布包 |
| npm unpublish | 撤销发布 |
| npm deprecate | 弃用包 |
| npm link | 本地链接 |

#### [代码] 代码示例

```json
// package.json 发布配置
{
  "name": "my-awesome-lib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "scripts": {
    "prepublishOnly": "npm run build && npm test",
    "postpublish": "echo 'Published successfully!'"
  }
}
```

```bash
# 发布前检查
npm pack  # 预览将要发布的文件

# 登录 npm
npm login

# 发布公开包
npm publish --access public

# 发布私有包
npm publish

# 发布 beta 版本
npm publish --tag beta

# 撤销发布（24小时内）
npm unpublish my-awesome-lib@1.0.0

# 弃用包
npm deprecate my-awesome-lib@1.0.0 "This version has bugs"

# 本地链接测试
npm link
npm link my-awesome-lib
```

#### [场景] 典型应用场景

1. 发布开源库到 npm
2. 发布内部工具包
3. 管理包版本和标签

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| package-lock.json | 需要锁定依赖版本时 |
| .npmrc | 需要配置 npm 行为时 |
| npx | 需要执行一次性命令时 |
| workspaces | 需要管理 monorepo 时 |
| npm ci | 需要 CI/CD 环境安装时 |
| npm config | 需要查看/设置配置时 |
| npm shrinkwrap | 需要锁定所有依赖时 |
| npm rebuild | 需要重新编译原生模块时 |
| npm doctor | 需要诊断 npm 问题时 |
| npm star/unstar | 需要收藏包时 |

---

## [实战] 核心实战清单

### 实战任务 1：创建并发布一个 npm 包

**任务描述：**
创建一个工具函数库，配置完整的 package.json，并发布到 npm。

**要求：**
- 创建工具函数库
- 配置 package.json 元信息
- 设置构建和测试脚本
- 发布到 npm

**参考实现：**

```javascript
// src/index.js
/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn
 * @param {number} interval
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
```

```json
// package.json
{
  "name": "my-utils-lib",
  "version": "1.0.0",
  "description": "常用工具函数库",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["utils", "javascript", "tools"],
  "author": "Developer",
  "license": "MIT",
  "devDependencies": {
    "jest": "^29.5.0",
    "rollup": "^3.26.0",
    "eslint": "^8.42.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

```bash
# 发布流程
npm login
npm run build
npm test
npm publish --access public
```
