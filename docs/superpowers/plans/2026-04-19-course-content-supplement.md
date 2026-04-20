# 课程内容补充计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 遍历所有学习方向，按子学习方向补充完整所有缺失的课程内容

**Architecture:** 使用 course-designer skill 为每个缺失的课程生成三层漏斗学习教程，保存到 `data/courses/{direction_id}/{course_id}.md`

**Tech Stack:** Markdown, course-designer skill

---

## 当前状态分析

**已有课程（12个）：**
- html-css-basics, javascript-fundamentals, python-fundamentals
- git-fundamentals, docker-fundamentals, kubernetes-basics
- react-basics, sql-fundamentals, rest-api-basics
- transformer-arch, prompt-engineering-advanced, linear-regression

**需要补充的课程数量：约 80+ 门**

---

## Task 1: 前端开发 - 框架生态补充

**Files:**
- Create: `data/courses/frontend/vue-basics.md`
- Create: `data/courses/frontend/angular-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

### 1.1 Vue 基础

- [ ] **Step 1: 更新 subdirections.json 添加课程 ID**

在 `frontend-frameworks` 的 courses 数组中添加 `vue-basics`：
```json
{ "id": "frontend-frameworks", "name": "框架生态", "directions": ["frontend"], "courses": ["react-basics", "vue-basics", "angular-basics"] }
```

- [ ] **Step 2: 更新 courses/index.json 添加课程元数据**

```json
{
  "id": "vue-basics",
  "title": "Vue 基础",
  "difficulty": "beginner",
  "prerequisites": ["javascript-fundamentals"],
  "knowledge_points": {
    "core": [
      { "name": "组件与模板", "description": "单文件组件、模板语法", "exercise": "创建一个 TodoList 组件" },
      { "name": "响应式数据", "description": "ref、reactive", "exercise": "实现计数器组件" },
      { "name": "Props 与 Emit", "description": "父子组件通信", "exercise": "实现可复用组件" }
    ],
    "important": [
      { "name": "Composition API", "description": "组合式函数", "exercise": "封装可复用逻辑" },
      { "name": "生命周期", "description": "onMounted、onUnmounted", "exercise": "在生命周期中调用 API" }
    ],
    "extended": [
      { "name": "Pinia", "description": "状态管理" },
      { "name": "Vue Router", "description": "路由管理" }
    ]
  },
  "resources": []
}
```

- [ ] **Step 3: 使用 course-designer skill 生成课程内容**

调用 skill 生成 `data/courses/frontend/vue-basics.md`

### 1.2 Angular 基础

- [ ] **Step 4: 更新 courses/index.json 添加 Angular 课程元数据**

```json
{
  "id": "angular-basics",
  "title": "Angular 基础",
  "difficulty": "intermediate",
  "prerequisites": ["javascript-fundamentals", "typescript-basics"],
  "knowledge_points": {
    "core": [
      { "name": "组件与模板", "description": "@Component 装饰器、模板语法", "exercise": "创建一个组件" },
      { "name": "数据绑定", "description": "插值、属性绑定、事件绑定", "exercise": "实现双向数据绑定" },
      { "name": "服务与依赖注入", "description": "@Injectable、DI 系统", "exercise": "创建一个服务" }
    ],
    "important": [
      { "name": "RxJS 基础", "description": "Observable、Subject", "exercise": "处理异步数据流" },
      { "name": "路由", "description": "Router 模块", "exercise": "配置应用路由" }
    ],
    "extended": [
      { "name": "NgRx", "description": "状态管理" },
      { "name": "Angular Material", "description": "UI 组件库" }
    ]
  },
  "resources": []
}
```

- [ ] **Step 5: 生成 Angular 课程内容**

---

## Task 2: 前端开发 - CSS 工程化补充

**Files:**
- Create: `data/courses/frontend/tailwind-css.md`
- Create: `data/courses/frontend/sass-basics.md`
- Create: `data/courses/frontend/css-in-js.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "frontend-css", "name": "CSS 工程化", "directions": ["frontend"], "courses": ["tailwind-css", "sass-basics", "css-in-js"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 3: 前端开发 - 构建工具补充

**Files:**
- Create: `data/courses/frontend/vite-basics.md`
- Create: `data/courses/frontend/webpack-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "frontend-build", "name": "构建工具", "directions": ["frontend", "dev-tools"], "courses": ["vite-basics", "webpack-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 4: 前端开发 - 性能优化补充

**Files:**
- Create: `data/courses/frontend/web-perf-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "frontend-perf", "name": "性能优化", "directions": ["frontend"], "courses": ["web-perf-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 5: 前端开发 - 测试补充

**Files:**
- Create: `data/courses/frontend/jest-testing.md`
- Create: `data/courses/frontend/cypress-e2e.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "frontend-test", "name": "前端测试", "directions": ["frontend", "testing"], "courses": ["jest-testing", "cypress-e2e"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 6: 前端开发 - 无障碍补充

**Files:**
- Create: `data/courses/frontend/web-a11y.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "frontend-a11y", "name": "无障碍与 SEO", "directions": ["frontend"], "courses": ["web-a11y"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 7: 后端开发 - 认证授权补充

**Files:**
- Create: `data/courses/backend/jwt-auth.md`
- Create: `data/courses/backend/oauth-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "backend-auth", "name": "认证与授权", "directions": ["backend", "security"], "courses": ["jwt-auth", "oauth-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 8: 后端开发 - 微服务补充

**Files:**
- Create: `data/courses/backend/microservices-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "backend-microservices", "name": "微服务架构", "directions": ["backend", "infra"], "courses": ["microservices-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 9: 后端开发 - 消息队列补充

**Files:**
- Create: `data/courses/backend/kafka-basics.md`
- Create: `data/courses/backend/rabbitmq-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "backend-mq", "name": "消息队列", "directions": ["backend", "infra"], "courses": ["kafka-basics", "rabbitmq-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 10: 后端开发 - 性能优化补充

**Files:**
- Create: `data/courses/backend/backend-perf.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "backend-perf", "name": "性能优化", "directions": ["backend"], "courses": ["backend-perf"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 11: 后端开发 - Serverless 补充

**Files:**
- Create: `data/courses/backend/serverless-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "backend-serverless", "name": "Serverless", "directions": ["backend", "infra"], "courses": ["serverless-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 12: 编程语言 - TypeScript 补充

**Files:**
- Create: `data/courses/programming-languages/typescript-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-js-ts", "name": "JavaScript/TypeScript", "directions": ["programming-languages", "frontend"], "courses": ["javascript-fundamentals", "typescript-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 13: 编程语言 - Java 补充

**Files:**
- Create: `data/courses/programming-languages/java-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-java", "name": "Java", "directions": ["programming-languages"], "courses": ["java-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 14: 编程语言 - Go 补充

**Files:**
- Create: `data/courses/programming-languages/go-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-go", "name": "Go", "directions": ["programming-languages"], "courses": ["go-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 15: 编程语言 - Rust 补充

**Files:**
- Create: `data/courses/programming-languages/rust-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-rust", "name": "Rust", "directions": ["programming-languages"], "courses": ["rust-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 16: 编程语言 - C/C++ 补充

**Files:**
- Create: `data/courses/programming-languages/cpp-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-c-cpp", "name": "C/C++", "directions": ["programming-languages"], "courses": ["cpp-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 17: 编程语言 - C# 补充

**Files:**
- Create: `data/courses/programming-languages/csharp-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-csharp", "name": "C#", "directions": ["programming-languages"], "courses": ["csharp-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 18: 编程语言 - Swift 补充

**Files:**
- Create: `data/courses/programming-languages/swift-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-swift", "name": "Swift", "directions": ["programming-languages", "mobile"], "courses": ["swift-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 19: 编程语言 - Kotlin 补充

**Files:**
- Create: `data/courses/programming-languages/kotlin-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-kotlin", "name": "Kotlin", "directions": ["programming-languages", "mobile"], "courses": ["kotlin-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 20: 编程语言 - SQL/Shell 补充

**Files:**
- Create: `data/courses/programming-languages/shell-scripting.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "lang-sql-shell", "name": "SQL/Shell", "directions": ["programming-languages", "ops"], "courses": ["shell-scripting"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 21: 开发工具 - IDE 补充

**Files:**
- Create: `data/courses/dev-tools/vscode-mastery.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-ide", "name": "IDE 与编辑器", "directions": ["dev-tools"], "courses": ["vscode-mastery"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 22: 开发工具 - 调试补充

**Files:**
- Create: `data/courses/dev-tools/debugging-techniques.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-debug", "name": "调试与性能分析", "directions": ["dev-tools"], "courses": ["debugging-techniques"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 23: 开发工具 - 包管理补充

**Files:**
- Create: `data/courses/dev-tools/npm-package.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-package", "name": "包管理与构建", "directions": ["dev-tools"], "courses": ["npm-package"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 24: 开发工具 - API 测试补充

**Files:**
- Create: `data/courses/dev-tools/api-testing.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-api-test", "name": "API 测试", "directions": ["dev-tools", "testing"], "courses": ["api-testing"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 25: 开发工具 - 数据库管理补充

**Files:**
- Create: `data/courses/dev-tools/db-management.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-db-mgmt", "name": "数据库管理", "directions": ["dev-tools"], "courses": ["db-management"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 26: 开发工具 - 协作补充

**Files:**
- Create: `data/courses/dev-tools/dev-collaboration.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "tools-collab", "name": "协作与文档", "directions": ["dev-tools"], "courses": ["dev-collaboration"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 27: 移动端 - Android 补充

**Files:**
- Create: `data/courses/mobile/android-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mobile-android", "name": "Android", "directions": ["mobile"], "courses": ["android-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 28: 移动端 - iOS 补充

**Files:**
- Create: `data/courses/mobile/ios-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mobile-ios", "name": "iOS", "directions": ["mobile"], "courses": ["ios-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 29: 移动端 - 跨平台补充

**Files:**
- Create: `data/courses/mobile/react-native-basics.md`
- Create: `data/courses/mobile/flutter-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mobile-cross", "name": "跨平台", "directions": ["mobile", "frontend"], "courses": ["react-native-basics", "flutter-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 30: 移动端 - 架构补充

**Files:**
- Create: `data/courses/mobile/mobile-architecture.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mobile-arch", "name": "移动端架构", "directions": ["mobile"], "courses": ["mobile-architecture"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 31: AI Agent - 架构补充

**Files:**
- Create: `data/courses/ai-agent/agent-architecture.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-arch", "name": "Agent 架构", "directions": ["ai-agent"], "courses": ["agent-architecture"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 32: AI Agent - 工具调用补充

**Files:**
- Create: `data/courses/ai-agent/tool-calling.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-tool", "name": "工具调用", "directions": ["ai-agent"], "courses": ["tool-calling"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 33: AI Agent - 记忆系统补充

**Files:**
- Create: `data/courses/ai-agent/agent-memory.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-memory", "name": "记忆系统", "directions": ["ai-agent", "llm"], "courses": ["agent-memory"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 34: AI Agent - 框架补充

**Files:**
- Create: `data/courses/ai-agent/langchain-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-framework", "name": "Agent 平台与框架", "directions": ["ai-agent"], "courses": ["langchain-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 35: AI Agent - MCP 补充

**Files:**
- Create: `data/courses/ai-agent/mcp-protocol.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-mcp", "name": "MCP 协议与集成", "directions": ["ai-agent", "dev-tools"], "courses": ["mcp-protocol"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 36: AI Agent - 规划推理补充

**Files:**
- Create: `data/courses/ai-agent/agent-planning.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-plan", "name": "规划与推理", "directions": ["ai-agent"], "courses": ["agent-planning"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 37: AI Agent - 多智能体补充

**Files:**
- Create: `data/courses/ai-agent/multi-agent.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "agent-multi", "name": "多智能体协作", "directions": ["ai-agent"], "courses": ["multi-agent"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 38: LLM - RAG 补充

**Files:**
- Create: `data/courses/llm/rag-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "llm-rag", "name": "RAG 检索增强", "directions": ["llm"], "courses": ["rag-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 39: LLM - 微调补充

**Files:**
- Create: `data/courses/llm/llm-finetuning.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "llm-finetune", "name": "模型微调", "directions": ["llm", "ml"], "courses": ["llm-finetuning"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 40: LLM - 部署补充

**Files:**
- Create: `data/courses/llm/llm-deployment.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "llm-deploy", "name": "模型部署与推理优化", "directions": ["llm", "infra"], "courses": ["llm-deployment"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 41: LLM - 评测补充

**Files:**
- Create: `data/courses/llm/llm-evaluation.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "llm-eval", "name": "评测系统", "directions": ["llm"], "courses": ["llm-evaluation"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 42: ML - 无监督学习补充

**Files:**
- Create: `data/courses/ml/clustering-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "ml-unsupervised", "name": "无监督学习", "directions": ["ml"], "courses": ["clustering-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 43: ML - 深度学习补充

**Files:**
- Create: `data/courses/ml/deep-learning-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "ml-deep", "name": "深度学习基础", "directions": ["ml"], "courses": ["deep-learning-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 44: ML - MLOps 补充

**Files:**
- Create: `data/courses/ml/mlops-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "ml-mlops", "name": "MLOps", "directions": ["ml", "ops"], "courses": ["mlops-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 45: 基础架构 - 云平台补充

**Files:**
- Create: `data/courses/infra/cloud-platforms.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "infra-cloud", "name": "云平台", "directions": ["infra"], "courses": ["cloud-platforms"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 46: 基础架构 - IaC 补充

**Files:**
- Create: `data/courses/infra/terraform-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "infra-iac", "name": "基础设施即代码", "directions": ["infra"], "courses": ["terraform-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 47: 基础架构 - 可观测性补充

**Files:**
- Create: `data/courses/infra/observability-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "infra-observability", "name": "可观测性", "directions": ["infra", "ops"], "courses": ["observability-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 48: 大数据 - Spark 补充

**Files:**
- Create: `data/courses/bigdata/spark-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "bigdata-spark", "name": "Spark 生态", "directions": ["bigdata"], "courses": ["spark-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 49: 大数据 - 流处理补充

**Files:**
- Create: `data/courses/bigdata/stream-processing.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "bigdata-stream", "name": "流处理", "directions": ["bigdata"], "courses": ["stream-processing"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 50: 计算机视觉 - 深度学习 CV 补充

**Files:**
- Create: `data/courses/cv/cnn-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "cv-deep", "name": "深度学习 CV", "directions": ["cv", "ml"], "courses": ["cnn-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 51: 运维 - CI/CD 补充

**Files:**
- Create: `data/courses/ops/cicd-basics.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "ops-cicd", "name": "CI/CD", "directions": ["ops", "testing", "infra"], "courses": ["cicd-basics"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 52: 运维 - Linux 补充

**Files:**
- Create: `data/courses/ops/linux-admin.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "ops-linux", "name": "Linux 运维", "directions": ["ops"], "courses": ["linux-admin"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 53: 算法 - 数据结构补充

**Files:**
- Create: `data/courses/algo/data-structures.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "algo-ds", "name": "数据结构", "directions": ["algo"], "courses": ["data-structures"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 54: 算法 - 排序搜索补充

**Files:**
- Create: `data/courses/algo/sorting-searching.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "algo-sort", "name": "排序与搜索", "directions": ["algo"], "courses": ["sorting-searching"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 55: 测试 - 单元测试补充

**Files:**
- Create: `data/courses/testing/unit-testing.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "test-unit", "name": "单元测试", "directions": ["testing"], "courses": ["unit-testing"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 56: 安全 - 应用安全补充

**Files:**
- Create: `data/courses/security/app-security.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "sec-app", "name": "应用安全", "directions": ["security"], "courses": ["app-security"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 57: NLP - 传统 NLP 补充

**Files:**
- Create: `data/courses/nlp/nlp-traditional.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "nlp-traditional", "name": "传统 NLP", "directions": ["nlp"], "courses": ["nlp-traditional"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 58: 数据挖掘 - 推荐系统补充

**Files:**
- Create: `data/courses/data-mining/recommender-systems.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mining-recommendation", "name": "推荐系统", "directions": ["data-mining", "ml", "backend"], "courses": ["recommender-systems"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 59: 数据挖掘 - 特征工程补充

**Files:**
- Create: `data/courses/data-mining/feature-engineering.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mining-feature", "name": "特征工程", "directions": ["data-mining", "ml"], "courses": ["feature-engineering"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## Task 60: 多媒体 - 视频处理补充

**Files:**
- Create: `data/courses/multimedia/video-processing.md`

- [ ] **Step 1: 更新 subdirections.json**

```json
{ "id": "mm-video", "name": "视频处理", "directions": ["multimedia"], "courses": ["video-processing"] }
```

- [ ] **Step 2: 添加课程元数据并生成内容**

---

## 执行优先级

**高优先级（核心课程，影响面大）：**
1. Task 1: 前端框架（Vue, Angular）
2. Task 12: TypeScript
3. Task 38: RAG
4. Task 31-37: AI Agent 系列
5. Task 7: 认证授权

**中优先级（常用技术）：**
6. Task 3-4: 构建工具、性能优化
7. Task 13-19: 其他编程语言
8. Task 27-30: 移动端开发
9. Task 42-44: ML 进阶
10. Task 51-52: 运维基础

**低优先级（专业领域）：**
11. Task 48-50: 大数据、CV
12. Task 53-56: 算法、测试、安全
13. Task 57-60: NLP、数据挖掘、多媒体
