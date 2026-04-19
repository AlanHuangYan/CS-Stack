# CS-Stack 设计文档 — 计算机科学学习路径平台

## 1. 项目概述

CS-Stack 是一个面向学生和技术自学者的计算机科学学习路径平台。平台提供课程库、技能树/路线图、学习方向选择器、进度追踪、激励机制和 AI 管理后台，帮助学生系统化地学习计算机科学。

**目标用户**：计算机科学学生、技术自学者、希望转型或提升技能的开发者

**核心价值主张**：
- 基于 ACM/IEEE CS2023 标准的完整课程体系
- 80/20 学习法则 — 优先掌握核心知识点，快速建立系统认知
- 可视化技能树和路线图 — 展示课程依赖关系
- 方向选择器 — 根据目标自动生成学习路径
- AI 管理后台 — Admin 可通过 AI API 持续发现并添加新课程

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选择 |
|------|---------|
| 前端 | React (Vite) + TypeScript + TailwindCSS |
| 后端 | Python FastAPI |
| 数据存储 | JSON 文件 |
| 部署 | 前后端分离开发，FastAPI 静态文件托管生产构建 |
| 移动端适配 | 响应式设计 + CSS Media Queries |
| AI 集成 | OpenAI API / Claude API |

### 2.2 架构模式：前后端分离

```
┌─────────────────────────────────────────────────┐
│                   React Frontend                 │
│  (Vite 开发模式 / 静态构建生产模式)                │
│  - 响应式设计                                    │
│  - 技能树可视化                                   │
│  - 用户交互界面                                   │
└───────────────────┬─────────────────────────────┘
                    │ REST API (JSON)
                    ▼
┌─────────────────────────────────────────────────┐
│                  FastAPI Backend                 │
│  - 课程 API                                      │
│  - 用户 API                                      │
│  - 进度 API                                      │
│  - Admin AI API                                 │
│  - JSON 文件 I/O                                │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              JSON File Storage                   │
│  - courses/                                     │
│  - users/                                       │
│  - progress/                                    │
│  - directions/                                  │
│  - admin/                                       │
└─────────────────────────────────────────────────┘
```

---

## 3. 课程体系

### 3.1 课程层级结构

```
15 个专业方向（一级分类）
  └── N 个子方向（二级分类，可跨 1-3 个大类）
        └── M 门课程（三级）
              └── 知识点（四级，按 80/20 法则分类）
                    └── 练习题/实践（可选）
```

### 3.2 18 个专业方向及子方向（122 个子方向）
> 按市场需求/使用概率降序排列

#### 1️⃣ 前端开发（7个子方向）
- 核心技能、框架生态、性能优化、CSS 工程化、构建工具、前端测试、无障碍与 SEO

#### 2️⃣ 后端开发（7个子方向）
- API 设计与开发、微服务架构、数据库集成、性能优化、认证与授权、消息队列、Serverless

#### 3️⃣ 编程语言（10个子方向）
- Python（数据科学/AI/Web）、JavaScript/TypeScript（全栈）、Java（企业级/Android）、C/C++（系统/嵌入式）、Go（云原生/微服务）、Rust（系统/WebAssembly）、C#（.NET/Unity）、Swift（iOS/macOS）、Kotlin（Android）、SQL/Shell（数据库与运维）

#### 4️⃣ 开发工具（9个子方向）
- IDE 与编辑器（VS Code/IntelliJ/Vim/Neovim）、版本控制（Git/GitHub/GitLab）、调试与性能分析、包管理与构建（npm/pip/Maven/Gradle）、API 测试（Postman/cURL/Insomnia）、数据库管理（DBeaver/pgAdmin/RedisInsight）、协作与文档（Jira/Notion/Swagger/Markdown）、容器化开发（Docker/Docker Compose）、AI 编程助手（Trae/Cursor/Claude Code/Copilot/Windsurf、Prompt 工程、Agent 配置）

#### 5️⃣ 客户端/移动端（6个子方向）
- Android、iOS、跨平台、移动端架构、离线与缓存、发布与运营

#### 6️⃣ 数据挖掘（6个子方向）
- 关联规则、聚类分析、异常检测、推荐系统、特征工程、文本挖掘

#### 7️⃣ AI Agent（10个子方向）
- Agent 架构、工具调用、记忆系统、规划与推理、多智能体协作、Agent 平台与框架、MCP 协议与集成、AI Skills 开发、Agent 评估与安全、Agent 应用开发

#### 8️⃣ 大模型（LLM）（9个子方向）
- 模型架构与原理、Prompt/Context 工程、RAG 检索增强、模型微调（LoRA/RLHF）、模型部署与推理优化、评测系统、数据处理、记忆系统、安全与合规

#### 9️⃣ 机器学习（6个子方向）
- 监督学习、无监督学习、深度学习基础、强化学习、MLOps、ML 伦理与公平性

#### 🔟 基础架构（6个子方向）
- 云平台、容器编排、基础设施即代码、网络架构、可观测性、SRE 工程

#### 1️⃣1️⃣ 大数据（6个子方向）
- Hadoop 生态、Spark 生态、流处理、数据仓库、ETL 工程、云大数据

#### 1️⃣2️⃣ 计算机视觉（6个子方向）
- 传统 CV、深度学习 CV、目标检测、图像生成、视频理解、3D 视觉

#### 1️⃣3️⃣ 运维工程（6个子方向）
- 系统监控、日志管理、CI/CD、配置管理、灾备与恢复、Linux 运维

#### 1️⃣4️⃣ 算法（7个子方向）
- 数据结构、排序与搜索、动态规划、图算法、复杂度分析、数学基础、字符串算法

#### 1️⃣5️⃣ 测试工程（7个子方向）
- 单元测试、集成测试、E2E 测试、性能测试、TDD/BDD、安全测试、测试自动化

#### 1️⃣6️⃣ 自然语言处理（6个子方向）
- 传统 NLP、Transformer 架构、大语言模型、NLP 应用、多模态、评估与对齐

#### 1️⃣7️⃣ 安全（6个子方向）
- 网络安全、密码学、应用安全、云安全、合规与治理、数字取证

#### 1️⃣8️⃣ 多媒体（6个子方向）
- 音频处理、视频处理、流媒体、图像处理、计算机图形学、AR/VR

### 3.3 跨方向设计

子方向可以属于 1-3 个大类。例如：
- "数据库集成" 属于：后端开发、大数据、运维工程
- "安全测试" 属于：测试工程、安全
- "CI/CD" 属于：测试工程、运维工程、基础架构
- "推荐系统" 属于：数据挖掘、机器学习、后端开发

系统内部维护一份子方向数据，多个方向通过引用共享。

### 3.4 课程知识点组织（80/20 法则）

每个课程的知识点分为三个层级：

```
课程: "Redis 实战"
├── 🟢 核心知识点 (20%) — 必须掌握，快速入门
│   ├── Redis 数据类型（String, Hash, List, Set）
│   ├── 基本命令操作
│   ├── 缓存模式应用
│   └── [动手例题] 实现一个简单的缓存系统
├── 🟡 重点知识点 (20%) — 进阶技能
│   ├── 持久化机制（RDB/AOF）
│   ├── 发布/订阅模式
│   ├── 事务支持
│   └── [动手例题] 实现消息队列
└── ⚪ 扩展知识点 (60%) — 深入理解
    ├── 集群与高可用
    ├── Lua 脚本
    ├── 性能调优
    └── [实践] 搭建 Redis 集群
```

---

## 4. 核心功能模块

### 4.1 课程库
- 按方向分类浏览课程
- 搜索/筛选（难度、方向、知识点）
- 课程详情页（知识点列表、学习资源、练习）

### 4.2 技能树/路线图
- 可视化展示课程前置依赖关系
- 不同方向的完整学习路径
- 交互式节点探索

### 4.3 方向选择器
- 用户选择目标方向
- 自动生成必修 + 选修课程列表
- 预计学习时间估算

### 4.4 学习进度追踪
- 课程完成状态（未开始/学习中/已完成）
- 知识点掌握情况标记
- 学习时长统计

### 4.5 激励机制
- 经验值系统（完成课程/知识点获得经验）
- 成就徽章（连续学习、完成特定方向等）
- 学习里程碑
- 连续打卡天数

### 4.6 AI 管理后台
- Admin 登录认证
- AI API 配置（OpenAI/Claude）
- 自动发现新课程建议
- 添加/编辑/删除课程和知识点
- 审核 AI 生成的内容

---

## 5. 数据模型（JSON 存储）

### 5.1 目录结构

```
data/
├── directions.json          # 15个专业方向定义
├── subdirections.json       # 95+子方向定义（支持跨方向引用）
├── courses/                 # 按子方向组织的课程
│   ├── backend/
│   │   ├── api-design.json
│   │   ├── microservices.json
│   │   └── ...
│   ├── frontend/
│   └── ...
├── users/
│   └── {user_id}.json       # 用户配置和进度
└── admin/
    └── settings.json        # AI API 配置、管理设置
```

### 5.2 JSON Schema 示例

**方向定义 (directions.json):**
```json
{
  "directions": [
    {
      "id": "backend",
      "name": "后端开发",
      "name_en": "Backend Development",
      "icon": "server",
      "description": "学习服务器端开发技术...",
      "subdirections": ["backend-api", "backend-microservices", ...]
    }
  ]
}
```

**子方向定义 (subdirections.json):**
```json
{
  "subdirections": [
    {
      "id": "backend-api",
      "name": "API 设计与开发",
      "directions": ["backend"],
      "courses": ["rest-api", "graphql", "grpc", "websocket"]
    }
  ]
}
```

**课程定义:**
```json
{
  "id": "redis-fundamentals",
  "title": "Redis 实战",
  "difficulty": "intermediate",
  "estimated_hours": 20,
  "prerequisites": ["database-basics"],
  "knowledge_points": {
    "core": [
      {"name": "Redis 数据类型", "description": "...", "exercise": "..."},
      {"name": "基本命令操作", "description": "...", "exercise": "..."}
    ],
    "important": [
      {"name": "持久化机制", "description": "...", "exercise": "..."}
    ],
    "extended": [
      {"name": "集群与高可用", "description": "...", "practice": "..."}
    ]
  },
  "resources": [
    {"type": "article", "url": "...", "title": "..."},
    {"type": "video", "url": "...", "title": "..."}
  ]
}
```

**用户数据:**
```json
{
  "user_id": "xxx",
  "username": "xxx",
  "created_at": "...",
  "selected_directions": ["backend", "frontend"],
  "progress": {
    "redis-fundamentals": {
      "status": "in_progress",
      "completed_knowledge": ["Redis 数据类型", "基本命令操作"],
      "started_at": "...",
      "hours_spent": 5
    }
  },
  "stats": {
    "total_xp": 1500,
    "streak_days": 7,
    "badges": ["first_course", "week_warrior"],
    "milestones": ["completed_backend_basics"]
  }
}
```

---

## 6. API 端点设计

```
GET    /api/directions                    # 获取所有方向
GET    /api/directions/{id}               # 获取方向详情
GET    /api/subdirections                 # 获取所有子方向
GET    /api/courses                       # 获取课程列表（可筛选）
GET    /api/courses/{id}                  # 获取课程详情
POST   /api/users/register                # 用户注册
POST   /api/users/login                   # 用户登录
GET    /api/users/{id}/progress           # 获取用户进度
PUT    /api/users/{id}/progress           # 更新学习进度
GET    /api/users/{id}/stats              # 获取用户统计
POST   /api/admin/discover                # AI 发现新课程（需要 admin 权限）
PUT    /api/admin/courses                 # 添加/编辑课程（需要 admin 权限）
POST   /api/admin/settings                # 更新 AI API 配置（需要 admin 权限）
```

---

## 7. 前端设计

### 7.1 响应式布局
- 移动端优先设计
- 三断点：mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- 可复用组件库

### 7.2 主要页面
- 首页：方向选择入口、推荐学习路径
- 课程库：分类浏览、搜索
- 课程详情：知识点、进度、练习
- 技能树：可视化依赖图
- 用户仪表板：进度、统计、成就
- Admin 后台：课程管理、AI 集成

---

## 8. 学习论方法论

采用 **80/20 法则**：
- **核心知识点 (20%)**：快速入门必须掌握的基础，每个知识点配动手例题
- **重点知识点 (20%)**：进阶技能，理解系统工作原理
- **扩展知识点 (60%)**：深入理解，可选学习

学生优先完成核心知识点，建立系统认知后，再根据需要深入学习。

---

## 9. AI 集成设计

### 9.1 Admin AI 功能
- **课程发现**：调用 AI API 分析技术趋势，推荐新课程
- **知识点生成**：AI 自动生成课程知识点和练习题
- **学习路径推荐**：根据学生进度和目标推荐下一步
- **内容审核**：AI 生成的内容需要 Admin 审核后才能发布

### 9.2 支持的 AI API
- OpenAI API (GPT-4)
- Claude API (Anthropic)
- 可配置，支持多 API 切换

---

## 10. 项目阶段规划

### Phase 1: 基础设施
- [ ] 项目脚手架搭建（React + FastAPI）
- [ ] JSON 数据存储层
- [ ] 用户认证系统（简单单用户）
- [ ] 方向/子方向/课程基础 API

### Phase 2: 课程系统
- [ ] 课程库前端展示
- [ ] 课程详情页
- [ ] 知识点 80/20 分类展示
- [ ] 学习进度追踪

### Phase 3: 方向选择与技能树
- [ ] 方向选择器
- [ ] 必修/选修课程生成
- [ ] 技能树可视化

### Phase 4: 激励机制
- [ ] 经验值系统
- [ ] 成就徽章
- [ ] 连续打卡
- [ ] 用户仪表板

### Phase 5: AI 管理后台
- [ ] Admin 登录
- [ ] AI API 配置
- [ ] 课程发现与添加
- [ ] 内容审核工作流

### Phase 6: 优化与完善
- [ ] 移动端适配优化
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 国际化支持（中文/英文）
