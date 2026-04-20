# 学习方向课程补齐计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为每个学习方向补齐核心课程，确保每个子方向至少有 1 门课程

**Architecture:** 按优先级分批补充课程，优先补充核心方向的入门课程，再补充进阶课程

**Tech Stack:** Python, JavaScript, Markdown, JSON

---

## 课程现状分析

### 已有课程统计

| 方向 | 子方向数 | 已有课程数 | 覆盖率 |
|------|----------|------------|--------|
| frontend | 7 | 14 | 100% |
| backend | 7 | 8 | 85% |
| programming-languages | 10 | 2 | 20% |
| dev-tools | 9 | 4 | 44% |
| mobile | 6 | 0 | 0% |
| data-mining | 6 | 0 | 0% |
| ai-agent | 10 | 0 | 0% |
| llm | 9 | 2 | 22% |
| ml | 6 | 1 | 17% |
| infra | 6 | 2 | 33% |
| bigdata | 6 | 0 | 0% |
| cv | 6 | 0 | 0% |
| ops | 6 | 0 | 0% |
| algo | 7 | 0 | 0% |
| testing | 7 | 2 | 29% |
| nlp | 6 | 0 | 0% |
| security | 6 | 0 | 0% |
| multimedia | 6 | 0 | 0% |

### 需要补充的课程清单

#### 第一优先级：核心编程语言 (programming-languages)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| typescript-basics | TypeScript 基础 | lang-js-ts | beginner |
| java-basics | Java 基础 | lang-java | beginner |
| go-basics | Go 基础 | lang-go | beginner |
| rust-basics | Rust 基础 | lang-rust | intermediate |
| csharp-basics | C# 基础 | lang-csharp | beginner |
| shell-basics | Shell 脚本基础 | lang-sql-shell | beginner |

#### 第二优先级：AI/LLM 方向 (llm, ai-agent)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| rag-basics | RAG 检索增强基础 | llm-rag | intermediate |
| llm-finetuning | LLM 微调基础 | llm-finetune | advanced |
| llm-deployment | LLM 部署与推理 | llm-deploy | intermediate |
| agent-architecture | Agent 架构设计 | agent-arch | intermediate |
| langchain-basics | LangChain 基础 | agent-framework | intermediate |
| tool-calling | 工具调用基础 | agent-tool | intermediate |

#### 第三优先级：机器学习 (ml, data-mining)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| logistic-regression | 逻辑回归 | ml-supervised | beginner |
| decision-tree | 决策树 | ml-supervised | beginner |
| clustering-basics | 聚类算法基础 | ml-unsupervised | beginner |
| neural-networks | 神经网络基础 | ml-deep | intermediate |
| feature-engineering | 特征工程 | mining-feature | intermediate |
| recommendation-systems | 推荐系统基础 | mining-recommendation | intermediate |

#### 第四优先级：基础设施与运维 (infra, ops)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| terraform-basics | Terraform 基础 | infra-iac | beginner |
| cicd-basics | CI/CD 基础 | ops-cicd | beginner |
| linux-basics | Linux 运维基础 | ops-linux | beginner |
| monitoring-basics | 监控系统基础 | ops-monitor | beginner |
| serverless-basics | Serverless 基础 | backend-serverless | beginner |

#### 第五优先级：大数据 (bigdata)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| spark-basics | Spark 基础 | bigdata-spark | intermediate |
| data-warehouse | 数据仓库基础 | bigdata-warehouse | intermediate |
| etl-basics | ETL 工程基础 | bigdata-etl | beginner |

#### 第六优先级：算法 (algo)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| data-structures | 数据结构基础 | algo-ds | beginner |
| sorting-algorithms | 排序算法 | algo-sort | beginner |
| dynamic-programming | 动态规划 | algo-dp | intermediate |
| graph-algorithms | 图算法基础 | algo-graph | intermediate |

#### 第七优先级：安全 (security)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| web-security | Web 安全基础 | sec-app | beginner |
| cryptography | 密码学基础 | sec-crypto | intermediate |
| network-security | 网络安全基础 | sec-network | intermediate |

#### 第八优先级：移动开发 (mobile)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| flutter-basics | Flutter 基础 | mobile-cross | beginner |
| react-native-basics | React Native 基础 | mobile-cross | beginner |

#### 第九优先级：计算机视觉 (cv)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| opencv-basics | OpenCV 基础 | cv-traditional | beginner |
| object-detection | 目标检测基础 | cv-detection | intermediate |

#### 第十优先级：NLP (nlp)

| 课程 ID | 课程名称 | 子方向 | 难度 |
|---------|----------|--------|------|
| nlp-basics | NLP 基础 | nlp-traditional | beginner |
| text-classification | 文本分类 | nlp-app | intermediate |

---

## 文件结构

```
data/
├── courses/
│   ├── index.json          # 课程元数据
│   ├── programming-languages/
│   │   ├── typescript-basics.md
│   │   ├── java-basics.md
│   │   ├── go-basics.md
│   │   ├── rust-basics.md
│   │   ├── csharp-basics.md
│   │   └── shell-basics.md
│   ├── llm/
│   │   ├── rag-basics.md
│   │   ├── llm-finetuning.md
│   │   └── llm-deployment.md
│   ├── ai-agent/
│   │   ├── agent-architecture.md
│   │   ├── langchain-basics.md
│   │   └── tool-calling.md
│   ├── ml/
│   │   ├── logistic-regression.md
│   │   ├── decision-tree.md
│   │   ├── clustering-basics.md
│   │   └── neural-networks.md
│   ├── data-mining/
│   │   ├── feature-engineering.md
│   │   └── recommendation-systems.md
│   ├── infra/
│   │   └── terraform-basics.md
│   ├── ops/
│   │   ├── cicd-basics.md
│   │   ├── linux-basics.md
│   │   └── monitoring-basics.md
│   ├── backend/
│   │   └── serverless-basics.md
│   ├── bigdata/
│   │   ├── spark-basics.md
│   │   ├── data-warehouse.md
│   │   └── etl-basics.md
│   ├── algo/
│   │   ├── data-structures.md
│   │   ├── sorting-algorithms.md
│   │   ├── dynamic-programming.md
│   │   └── graph-algorithms.md
│   ├── security/
│   │   ├── web-security.md
│   │   ├── cryptography.md
│   │   └── network-security.md
│   ├── mobile/
│   │   ├── flutter-basics.md
│   │   └── react-native-basics.md
│   ├── cv/
│   │   ├── opencv-basics.md
│   │   └── object-detection.md
│   └── nlp/
│       ├── nlp-basics.md
│       └── text-classification.md
└── subdirections.json      # 更新子方向课程映射
```

---

## 任务分解

### Task 1: 补充编程语言课程

**Files:**
- Create: `data/courses/programming-languages/typescript-basics.md`
- Create: `data/courses/programming-languages/java-basics.md`
- Create: `data/courses/programming-languages/go-basics.md`
- Create: `data/courses/programming-languages/rust-basics.md`
- Create: `data/courses/programming-languages/csharp-basics.md`
- Create: `data/courses/programming-languages/shell-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加编程语言课程元数据**

在 `data/courses/index.json` 的 `courses` 数组中添加：

```json
{
  "id": "typescript-basics",
  "title": "TypeScript 基础",
  "difficulty": "beginner",
  "prerequisites": ["javascript-fundamentals"],
  "resources": []
},
{
  "id": "java-basics",
  "title": "Java 基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "go-basics",
  "title": "Go 基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "rust-basics",
  "title": "Rust 基础",
  "difficulty": "intermediate",
  "prerequisites": [],
  "resources": []
},
{
  "id": "csharp-basics",
  "title": "C# 基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "shell-basics",
  "title": "Shell 脚本基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

更新 `data/subdirections.json` 中的相关子方向：

```json
{ "id": "lang-js-ts", "name": "JavaScript/TypeScript", "directions": ["programming-languages", "frontend"], "courses": ["javascript-fundamentals", "typescript-basics"] },
{ "id": "lang-java", "name": "Java", "directions": ["programming-languages"], "courses": ["java-basics"] },
{ "id": "lang-go", "name": "Go", "directions": ["programming-languages"], "courses": ["go-basics"] },
{ "id": "lang-rust", "name": "Rust", "directions": ["programming-languages"], "courses": ["rust-basics"] },
{ "id": "lang-csharp", "name": "C#", "directions": ["programming-languages"], "courses": ["csharp-basics"] },
{ "id": "lang-sql-shell", "name": "SQL/Shell", "directions": ["programming-languages", "ops"], "courses": ["shell-basics"] }
```

- [ ] **Step 3: 生成 TypeScript 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/typescript-basics.md`

- [ ] **Step 4: 生成 Java 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/java-basics.md`

- [ ] **Step 5: 生成 Go 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/go-basics.md`

- [ ] **Step 6: 生成 Rust 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/rust-basics.md`

- [ ] **Step 7: 生成 C# 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/csharp-basics.md`

- [ ] **Step 8: 生成 Shell 脚本基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/programming-languages/shell-basics.md`

---

### Task 2: 补充 LLM 方向课程

**Files:**
- Create: `data/courses/llm/rag-basics.md`
- Create: `data/courses/llm/llm-finetuning.md`
- Create: `data/courses/llm/llm-deployment.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加 LLM 课程元数据**

```json
{
  "id": "rag-basics",
  "title": "RAG 检索增强基础",
  "difficulty": "intermediate",
  "prerequisites": ["python-fundamentals", "transformer-arch"],
  "resources": []
},
{
  "id": "llm-finetuning",
  "title": "LLM 微调基础",
  "difficulty": "advanced",
  "prerequisites": ["transformer-arch", "python-fundamentals"],
  "resources": []
},
{
  "id": "llm-deployment",
  "title": "LLM 部署与推理",
  "difficulty": "intermediate",
  "prerequisites": ["transformer-arch", "docker-fundamentals"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "llm-rag", "name": "RAG 检索增强", "directions": ["llm"], "courses": ["rag-basics"] },
{ "id": "llm-finetune", "name": "模型微调", "directions": ["llm", "ml"], "courses": ["llm-finetuning"] },
{ "id": "llm-deploy", "name": "模型部署与推理优化", "directions": ["llm", "infra"], "courses": ["llm-deployment"] }
```

- [ ] **Step 3: 生成 RAG 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/llm/rag-basics.md`

- [ ] **Step 4: 生成 LLM 微调课程 MD 文件**

使用 course-designer skill 生成 `data/courses/llm/llm-finetuning.md`

- [ ] **Step 5: 生成 LLM 部署课程 MD 文件**

使用 course-designer skill 生成 `data/courses/llm/llm-deployment.md`

---

### Task 3: 补充 AI Agent 方向课程

**Files:**
- Create: `data/courses/ai-agent/agent-architecture.md`
- Create: `data/courses/ai-agent/langchain-basics.md`
- Create: `data/courses/ai-agent/tool-calling.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加 Agent 课程元数据**

```json
{
  "id": "agent-architecture",
  "title": "Agent 架构设计",
  "difficulty": "intermediate",
  "prerequisites": ["prompt-engineering-advanced"],
  "resources": []
},
{
  "id": "langchain-basics",
  "title": "LangChain 基础",
  "difficulty": "intermediate",
  "prerequisites": ["python-fundamentals", "prompt-engineering-advanced"],
  "resources": []
},
{
  "id": "tool-calling",
  "title": "工具调用基础",
  "difficulty": "intermediate",
  "prerequisites": ["prompt-engineering-advanced"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "agent-arch", "name": "Agent 架构", "directions": ["ai-agent"], "courses": ["agent-architecture"] },
{ "id": "agent-framework", "name": "Agent 平台与框架", "directions": ["ai-agent"], "courses": ["langchain-basics"] },
{ "id": "agent-tool", "name": "工具调用", "directions": ["ai-agent"], "courses": ["tool-calling"] }
```

- [ ] **Step 3: 生成 Agent 架构课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ai-agent/agent-architecture.md`

- [ ] **Step 4: 生成 LangChain 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ai-agent/langchain-basics.md`

- [ ] **Step 5: 生成工具调用课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ai-agent/tool-calling.md`

---

### Task 4: 补充机器学习课程

**Files:**
- Create: `data/courses/ml/logistic-regression.md`
- Create: `data/courses/ml/decision-tree.md`
- Create: `data/courses/ml/clustering-basics.md`
- Create: `data/courses/ml/neural-networks.md`
- Create: `data/courses/data-mining/feature-engineering.md`
- Create: `data/courses/data-mining/recommendation-systems.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加 ML 课程元数据**

```json
{
  "id": "logistic-regression",
  "title": "逻辑回归",
  "difficulty": "beginner",
  "prerequisites": ["linear-regression"],
  "resources": []
},
{
  "id": "decision-tree",
  "title": "决策树",
  "difficulty": "beginner",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "clustering-basics",
  "title": "聚类算法基础",
  "difficulty": "beginner",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "neural-networks",
  "title": "神经网络基础",
  "difficulty": "intermediate",
  "prerequisites": ["linear-regression", "python-fundamentals"],
  "resources": []
},
{
  "id": "feature-engineering",
  "title": "特征工程",
  "difficulty": "intermediate",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "recommendation-systems",
  "title": "推荐系统基础",
  "difficulty": "intermediate",
  "prerequisites": ["python-fundamentals", "linear-regression"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "ml-supervised", "name": "监督学习", "directions": ["ml"], "courses": ["linear-regression", "logistic-regression", "decision-tree"] },
{ "id": "ml-unsupervised", "name": "无监督学习", "directions": ["ml"], "courses": ["clustering-basics"] },
{ "id": "ml-deep", "name": "深度学习基础", "directions": ["ml"], "courses": ["neural-networks"] },
{ "id": "mining-feature", "name": "特征工程", "directions": ["data-mining", "ml"], "courses": ["feature-engineering"] },
{ "id": "mining-recommendation", "name": "推荐系统", "directions": ["data-mining", "ml", "backend"], "courses": ["recommendation-systems"] }
```

- [ ] **Step 3: 生成逻辑回归课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ml/logistic-regression.md`

- [ ] **Step 4: 生成决策树课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ml/decision-tree.md`

- [ ] **Step 5: 生成聚类算法课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ml/clustering-basics.md`

- [ ] **Step 6: 生成神经网络课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ml/neural-networks.md`

- [ ] **Step 7: 生成特征工程课程 MD 文件**

使用 course-designer skill 生成 `data/courses/data-mining/feature-engineering.md`

- [ ] **Step 8: 生成推荐系统课程 MD 文件**

使用 course-designer skill 生成 `data/courses/data-mining/recommendation-systems.md`

---

### Task 5: 补充基础设施与运维课程

**Files:**
- Create: `data/courses/infra/terraform-basics.md`
- Create: `data/courses/ops/cicd-basics.md`
- Create: `data/courses/ops/linux-basics.md`
- Create: `data/courses/ops/monitoring-basics.md`
- Create: `data/courses/backend/serverless-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加基础设施课程元数据**

```json
{
  "id": "terraform-basics",
  "title": "Terraform 基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "cicd-basics",
  "title": "CI/CD 基础",
  "difficulty": "beginner",
  "prerequisites": ["git-fundamentals", "docker-fundamentals"],
  "resources": []
},
{
  "id": "linux-basics",
  "title": "Linux 运维基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "monitoring-basics",
  "title": "监控系统基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "serverless-basics",
  "title": "Serverless 基础",
  "difficulty": "intermediate",
  "prerequisites": ["docker-fundamentals"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "infra-iac", "name": "基础设施即代码", "directions": ["infra"], "courses": ["terraform-basics"] },
{ "id": "ops-cicd", "name": "CI/CD", "directions": ["ops", "testing", "infra"], "courses": ["cicd-basics"] },
{ "id": "ops-linux", "name": "Linux 运维", "directions": ["ops"], "courses": ["linux-basics"] },
{ "id": "ops-monitor", "name": "系统监控", "directions": ["ops"], "courses": ["monitoring-basics"] },
{ "id": "backend-serverless", "name": "Serverless", "directions": ["backend", "infra"], "courses": ["serverless-basics"] }
```

- [ ] **Step 3: 生成 Terraform 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/infra/terraform-basics.md`

- [ ] **Step 4: 生成 CI/CD 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ops/cicd-basics.md`

- [ ] **Step 5: 生成 Linux 运维课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ops/linux-basics.md`

- [ ] **Step 6: 生成监控系统课程 MD 文件**

使用 course-designer skill 生成 `data/courses/ops/monitoring-basics.md`

- [ ] **Step 7: 生成 Serverless 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/backend/serverless-basics.md`

---

### Task 6: 补充大数据课程

**Files:**
- Create: `data/courses/bigdata/spark-basics.md`
- Create: `data/courses/bigdata/data-warehouse.md`
- Create: `data/courses/bigdata/etl-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加大数据课程元数据**

```json
{
  "id": "spark-basics",
  "title": "Spark 基础",
  "difficulty": "intermediate",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "data-warehouse",
  "title": "数据仓库基础",
  "difficulty": "intermediate",
  "prerequisites": ["sql-fundamentals"],
  "resources": []
},
{
  "id": "etl-basics",
  "title": "ETL 工程基础",
  "difficulty": "beginner",
  "prerequisites": ["sql-fundamentals", "python-fundamentals"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "bigdata-spark", "name": "Spark 生态", "directions": ["bigdata"], "courses": ["spark-basics"] },
{ "id": "bigdata-warehouse", "name": "数据仓库", "directions": ["bigdata"], "courses": ["data-warehouse"] },
{ "id": "bigdata-etl", "name": "ETL 工程", "directions": ["bigdata"], "courses": ["etl-basics"] }
```

- [ ] **Step 3: 生成 Spark 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/bigdata/spark-basics.md`

- [ ] **Step 4: 生成数据仓库课程 MD 文件**

使用 course-designer skill 生成 `data/courses/bigdata/data-warehouse.md`

- [ ] **Step 5: 生成 ETL 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/bigdata/etl-basics.md`

---

### Task 7: 补充算法课程

**Files:**
- Create: `data/courses/algo/data-structures.md`
- Create: `data/courses/algo/sorting-algorithms.md`
- Create: `data/courses/algo/dynamic-programming.md`
- Create: `data/courses/algo/graph-algorithms.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加算法课程元数据**

```json
{
  "id": "data-structures",
  "title": "数据结构基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "sorting-algorithms",
  "title": "排序算法",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "dynamic-programming",
  "title": "动态规划",
  "difficulty": "intermediate",
  "prerequisites": ["data-structures"],
  "resources": []
},
{
  "id": "graph-algorithms",
  "title": "图算法基础",
  "difficulty": "intermediate",
  "prerequisites": ["data-structures"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "algo-ds", "name": "数据结构", "directions": ["algo"], "courses": ["data-structures"] },
{ "id": "algo-sort", "name": "排序与搜索", "directions": ["algo"], "courses": ["sorting-algorithms"] },
{ "id": "algo-dp", "name": "动态规划", "directions": ["algo"], "courses": ["dynamic-programming"] },
{ "id": "algo-graph", "name": "图算法", "directions": ["algo"], "courses": ["graph-algorithms"] }
```

- [ ] **Step 3: 生成数据结构课程 MD 文件**

使用 course-designer skill 生成 `data/courses/algo/data-structures.md`

- [ ] **Step 4: 生成排序算法课程 MD 文件**

使用 course-designer skill 生成 `data/courses/algo/sorting-algorithms.md`

- [ ] **Step 5: 生成动态规划课程 MD 文件**

使用 course-designer skill 生成 `data/courses/algo/dynamic-programming.md`

- [ ] **Step 6: 生成图算法课程 MD 文件**

使用 course-designer skill 生成 `data/courses/algo/graph-algorithms.md`

---

### Task 8: 补充安全课程

**Files:**
- Create: `data/courses/security/web-security.md`
- Create: `data/courses/security/cryptography.md`
- Create: `data/courses/security/network-security.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加安全课程元数据**

```json
{
  "id": "web-security",
  "title": "Web 安全基础",
  "difficulty": "beginner",
  "prerequisites": ["javascript-fundamentals"],
  "resources": []
},
{
  "id": "cryptography",
  "title": "密码学基础",
  "difficulty": "intermediate",
  "prerequisites": [],
  "resources": []
},
{
  "id": "network-security",
  "title": "网络安全基础",
  "difficulty": "intermediate",
  "prerequisites": [],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "sec-app", "name": "应用安全", "directions": ["security"], "courses": ["web-security"] },
{ "id": "sec-crypto", "name": "密码学", "directions": ["security"], "courses": ["cryptography"] },
{ "id": "sec-network", "name": "网络安全", "directions": ["security"], "courses": ["network-security"] }
```

- [ ] **Step 3: 生成 Web 安全课程 MD 文件**

使用 course-designer skill 生成 `data/courses/security/web-security.md`

- [ ] **Step 4: 生成密码学课程 MD 文件**

使用 course-designer skill 生成 `data/courses/security/cryptography.md`

- [ ] **Step 5: 生成网络安全课程 MD 文件**

使用 course-designer skill 生成 `data/courses/security/network-security.md`

---

### Task 9: 补充移动开发课程

**Files:**
- Create: `data/courses/mobile/flutter-basics.md`
- Create: `data/courses/mobile/react-native-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加移动开发课程元数据**

```json
{
  "id": "flutter-basics",
  "title": "Flutter 基础",
  "difficulty": "beginner",
  "prerequisites": [],
  "resources": []
},
{
  "id": "react-native-basics",
  "title": "React Native 基础",
  "difficulty": "beginner",
  "prerequisites": ["javascript-fundamentals", "react-basics"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "mobile-cross", "name": "跨平台", "directions": ["mobile", "frontend"], "courses": ["flutter-basics", "react-native-basics"] }
```

- [ ] **Step 3: 生成 Flutter 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/mobile/flutter-basics.md`

- [ ] **Step 4: 生成 React Native 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/mobile/react-native-basics.md`

---

### Task 10: 补充计算机视觉课程

**Files:**
- Create: `data/courses/cv/opencv-basics.md`
- Create: `data/courses/cv/object-detection.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加 CV 课程元数据**

```json
{
  "id": "opencv-basics",
  "title": "OpenCV 基础",
  "difficulty": "beginner",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "object-detection",
  "title": "目标检测基础",
  "difficulty": "intermediate",
  "prerequisites": ["opencv-basics", "neural-networks"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "cv-traditional", "name": "传统 CV", "directions": ["cv"], "courses": ["opencv-basics"] },
{ "id": "cv-detection", "name": "目标检测", "directions": ["cv"], "courses": ["object-detection"] }
```

- [ ] **Step 3: 生成 OpenCV 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/cv/opencv-basics.md`

- [ ] **Step 4: 生成目标检测课程 MD 文件**

使用 course-designer skill 生成 `data/courses/cv/object-detection.md`

---

### Task 11: 补充 NLP 课程

**Files:**
- Create: `data/courses/nlp/nlp-basics.md`
- Create: `data/courses/nlp/text-classification.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 index.json 添加 NLP 课程元数据**

```json
{
  "id": "nlp-basics",
  "title": "NLP 基础",
  "difficulty": "beginner",
  "prerequisites": ["python-fundamentals"],
  "resources": []
},
{
  "id": "text-classification",
  "title": "文本分类",
  "difficulty": "intermediate",
  "prerequisites": ["nlp-basics", "transformer-arch"],
  "resources": []
}
```

- [ ] **Step 2: 更新 subdirections.json 课程映射**

```json
{ "id": "nlp-traditional", "name": "传统 NLP", "directions": ["nlp"], "courses": ["nlp-basics"] },
{ "id": "nlp-app", "name": "NLP 应用", "directions": ["nlp"], "courses": ["text-classification"] }
```

- [ ] **Step 3: 生成 NLP 基础课程 MD 文件**

使用 course-designer skill 生成 `data/courses/nlp/nlp-basics.md`

- [ ] **Step 4: 生成文本分类课程 MD 文件**

使用 course-designer skill 生成 `data/courses/nlp/text-classification.md`

---

## 预期成果

完成本计划后：

1. **课程总数**：从 29 门增加到 60+ 门
2. **方向覆盖率**：所有 18 个学习方向都有课程覆盖
3. **子方向覆盖率**：从约 30% 提升到约 70%

### 各方向课程数量变化

| 方向 | 原有 | 新增 | 总计 |
|------|------|------|------|
| programming-languages | 2 | 6 | 8 |
| llm | 2 | 3 | 5 |
| ai-agent | 0 | 3 | 3 |
| ml | 1 | 4 | 5 |
| data-mining | 0 | 2 | 2 |
| infra | 2 | 1 | 3 |
| ops | 0 | 4 | 4 |
| bigdata | 0 | 3 | 3 |
| algo | 0 | 4 | 4 |
| security | 0 | 3 | 3 |
| mobile | 0 | 2 | 2 |
| cv | 0 | 2 | 2 |
| nlp | 0 | 2 | 2 |
| backend | 8 | 1 | 9 |
