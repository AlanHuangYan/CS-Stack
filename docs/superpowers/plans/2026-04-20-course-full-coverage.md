# 课程内容全面补充计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有空白子学习方向补充课程内容，实现100%覆盖率

**Architecture:** 按学习方向分组，每组独立生成课程MD文件，同时更新index.json和subdirections.json

**Tech Stack:** Python, Markdown, JSON

---

## 当前状态分析

### 已有课程的子方向（跳过）
- frontend-core, frontend-frameworks, frontend-perf, frontend-css, frontend-build, frontend-test, frontend-a11y
- backend-api, backend-microservices, backend-db, backend-perf, backend-auth, backend-mq
- lang-python, lang-js-ts, lang-java, lang-c-cpp, lang-go, lang-rust, lang-csharp, lang-swift, lang-kotlin, lang-sql-shell
- tools-git, tools-docker, tools-ai-assistant
- agent-arch, agent-tool, agent-memory, agent-plan, agent-multi, agent-framework, agent-mcp
- llm-arch, llm-prompt, llm-rag, llm-finetune, llm-deploy, llm-eval
- ml-supervised
- infra-k8s

### 需要补充课程的子方向（共68个）

---

## Task 1: 补充 ML 机器学习课程 (5门)

**Files:**
- Create: `data/courses/ml/clustering-basics.md`
- Create: `data/courses/ml/deep-learning-basics.md`
- Create: `data/courses/ml/reinforcement-learning.md`
- Create: `data/courses/ml/mlops-basics.md`
- Create: `data/courses/ml/ml-ethics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| clustering-basics | 聚类算法基础 | intermediate | python-fundamentals, linear-regression | ml-unsupervised, mining-clustering |
| deep-learning-basics | 深度学习基础 | intermediate | python-fundamentals, linear-regression | ml-deep, cv-deep |
| reinforcement-learning | 强化学习基础 | advanced | python-fundamentals, linear-regression | ml-rl |
| mlops-basics | MLOps 基础 | intermediate | python-fundamentals, docker-fundamentals | ml-mlops |
| ml-ethics | ML 伦理与公平性 | beginner | python-fundamentals | ml-ethics |

- [ ] **Step 1: 创建聚类算法基础课程**
- [ ] **Step 2: 创建深度学习基础课程**
- [ ] **Step 3: 创建强化学习基础课程**
- [ ] **Step 4: 创建MLOps基础课程**
- [ ] **Step 5: 创建ML伦理与公平性课程**
- [ ] **Step 6: 更新index.json添加课程元数据**
- [ ] **Step 7: 更新subdirections.json添加课程映射**

---

## Task 2: 补充基础设施课程 (5门)

**Files:**
- Create: `data/courses/infra/cloud-platforms.md`
- Create: `data/courses/infra/terraform-basics.md`
- Create: `data/courses/infra/network-basics.md`
- Create: `data/courses/infra/observability-basics.md`
- Create: `data/courses/infra/sre-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| cloud-platforms | 云平台基础 | beginner | 无 | infra-cloud |
| terraform-basics | Terraform 基础 | intermediate | 无 | infra-iac |
| network-basics | 网络架构基础 | intermediate | 无 | infra-network |
| observability-basics | 可观测性基础 | intermediate | docker-fundamentals | infra-observability |
| sre-basics | SRE 工程基础 | intermediate | docker-fundamentals, kubernetes-basics | infra-sre |

- [ ] **Step 1: 创建云平台基础课程**
- [ ] **Step 2: 创建Terraform基础课程**
- [ ] **Step 3: 创建网络架构基础课程**
- [ ] **Step 4: 创建可观测性基础课程**
- [ ] **Step 5: 创建SRE工程基础课程**
- [ ] **Step 6: 更新index.json添加课程元数据**
- [ ] **Step 7: 更新subdirections.json添加课程映射**

---

## Task 3: 补充开发工具课程 (6门)

**Files:**
- Create: `data/courses/dev-tools/vscode-mastery.md`
- Create: `data/courses/dev-tools/debugging-techniques.md`
- Create: `data/courses/dev-tools/npm-package.md`
- Create: `data/courses/dev-tools/api-testing.md`
- Create: `data/courses/dev-tools/db-management.md`
- Create: `data/courses/dev-tools/dev-collaboration.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| vscode-mastery | VS Code 精通 | beginner | 无 | tools-ide |
| debugging-techniques | 调试技术 | intermediate | 无 | tools-debug |
| npm-package | NPM 包管理 | beginner | javascript-fundamentals | tools-package |
| api-testing | API 测试 | beginner | rest-api-basics | tools-api-test |
| db-management | 数据库管理工具 | beginner | sql-fundamentals | tools-db-mgmt |
| dev-collaboration | 开发协作与文档 | beginner | git-fundamentals | tools-collab |

- [ ] **Step 1: 创建VS Code精通课程**
- [ ] **Step 2: 创建调试技术课程**
- [ ] **Step 3: 创建NPM包管理课程**
- [ ] **Step 4: 创建API测试课程**
- [ ] **Step 5: 创建数据库管理工具课程**
- [ ] **Step 6: 创建开发协作与文档课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 4: 补充移动开发课程 (6门)

**Files:**
- Create: `data/courses/mobile/android-basics.md`
- Create: `data/courses/mobile/ios-basics.md`
- Create: `data/courses/mobile/react-native-basics.md`
- Create: `data/courses/mobile/flutter-basics.md`
- Create: `data/courses/mobile/mobile-architecture.md`
- Create: `data/courses/mobile/mobile-offline.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| android-basics | Android 开发基础 | intermediate | kotlin-basics | mobile-android |
| ios-basics | iOS 开发基础 | intermediate | swift-basics | mobile-ios |
| react-native-basics | React Native 基础 | intermediate | react-basics | mobile-cross |
| flutter-basics | Flutter 基础 | intermediate | 无 | mobile-cross |
| mobile-architecture | 移动端架构 | advanced | android-basics, ios-basics | mobile-arch |
| mobile-offline | 移动端离线与缓存 | intermediate | android-basics | mobile-offline |

- [ ] **Step 1: 创建Android开发基础课程**
- [ ] **Step 2: 创建iOS开发基础课程**
- [ ] **Step 3: 创建React Native基础课程**
- [ ] **Step 4: 创建Flutter基础课程**
- [ ] **Step 5: 创建移动端架构课程**
- [ ] **Step 6: 创建移动端离线与缓存课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 5: 补充大数据课程 (6门)

**Files:**
- Create: `data/courses/bigdata/hadoop-basics.md`
- Create: `data/courses/bigdata/spark-basics.md`
- Create: `data/courses/bigdata/stream-processing.md`
- Create: `data/courses/bigdata/data-warehouse.md`
- Create: `data/courses/bigdata/etl-basics.md`
- Create: `data/courses/bigdata/cloud-bigdata.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| hadoop-basics | Hadoop 基础 | intermediate | python-fundamentals, sql-fundamentals | bigdata-hadoop |
| spark-basics | Spark 基础 | intermediate | python-fundamentals, sql-fundamentals | bigdata-spark |
| stream-processing | 流处理基础 | intermediate | kafka-basics | bigdata-stream |
| data-warehouse | 数据仓库基础 | intermediate | sql-fundamentals | bigdata-warehouse |
| etl-basics | ETL 工程基础 | intermediate | python-fundamentals, sql-fundamentals | bigdata-etl |
| cloud-bigdata | 云大数据服务 | intermediate | cloud-platforms | bigdata-cloud |

- [ ] **Step 1: 创建Hadoop基础课程**
- [ ] **Step 2: 创建Spark基础课程**
- [ ] **Step 3: 创建流处理基础课程**
- [ ] **Step 4: 创建数据仓库基础课程**
- [ ] **Step 5: 创建ETL工程基础课程**
- [ ] **Step 6: 创建云大数据服务课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 6: 补充计算机视觉课程 (6门)

**Files:**
- Create: `data/courses/cv/cv-traditional.md`
- Create: `data/courses/cv/cnn-basics.md`
- Create: `data/courses/cv/object-detection.md`
- Create: `data/courses/cv/image-generation.md`
- Create: `data/courses/cv/video-understanding.md`
- Create: `data/courses/cv/3d-vision.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| cv-traditional | 传统计算机视觉 | intermediate | python-fundamentals | cv-traditional |
| cnn-basics | CNN 卷积神经网络 | intermediate | deep-learning-basics | cv-deep |
| object-detection | 目标检测 | advanced | cnn-basics | cv-detection |
| image-generation | 图像生成 | advanced | cnn-basics | cv-generation |
| video-understanding | 视频理解 | advanced | cnn-basics | cv-video |
| 3d-vision | 3D 视觉基础 | advanced | cnn-basics | cv-3d |

- [ ] **Step 1: 创建传统计算机视觉课程**
- [ ] **Step 2: 创建CNN卷积神经网络课程**
- [ ] **Step 3: 创建目标检测课程**
- [ ] **Step 4: 创建图像生成课程**
- [ ] **Step 5: 创建视频理解课程**
- [ ] **Step 6: 创建3D视觉基础课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 7: 补充运维课程 (6门)

**Files:**
- Create: `data/courses/ops/system-monitoring.md`
- Create: `data/courses/ops/log-management.md`
- Create: `data/courses/ops/cicd-basics.md`
- Create: `data/courses/ops/config-management.md`
- Create: `data/courses/ops/disaster-recovery.md`
- Create: `data/courses/ops/linux-admin.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| system-monitoring | 系统监控 | intermediate | docker-fundamentals | ops-monitor |
| log-management | 日志管理 | intermediate | docker-fundamentals | ops-log |
| cicd-basics | CI/CD 持续集成与部署 | intermediate | git-fundamentals, docker-fundamentals | ops-cicd |
| config-management | 配置管理 | intermediate | shell-scripting | ops-config |
| disaster-recovery | 灾备与恢复 | advanced | kubernetes-basics | ops-dr |
| linux-admin | Linux 运维基础 | beginner | 无 | ops-linux |

- [ ] **Step 1: 创建系统监控课程**
- [ ] **Step 2: 创建日志管理课程**
- [ ] **Step 3: 创建CI/CD持续集成与部署课程**
- [ ] **Step 4: 创建配置管理课程**
- [ ] **Step 5: 创建灾备与恢复课程**
- [ ] **Step 6: 创建Linux运维基础课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 8: 补充算法课程 (7门)

**Files:**
- Create: `data/courses/algo/data-structures.md`
- Create: `data/courses/algo/sorting-searching.md`
- Create: `data/courses/algo/dynamic-programming.md`
- Create: `data/courses/algo/graph-algorithms.md`
- Create: `data/courses/algo/complexity-analysis.md`
- Create: `data/courses/algo/math-basics.md`
- Create: `data/courses/algo/string-algorithms.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| data-structures | 数据结构基础 | beginner | python-fundamentals | algo-ds |
| sorting-searching | 排序与搜索算法 | beginner | data-structures | algo-sort |
| dynamic-programming | 动态规划 | intermediate | data-structures | algo-dp |
| graph-algorithms | 图算法 | intermediate | data-structures | algo-graph |
| complexity-analysis | 复杂度分析 | beginner | python-fundamentals | algo-complexity |
| math-basics | 算法数学基础 | beginner | 无 | algo-math |
| string-algorithms | 字符串算法 | intermediate | data-structures | algo-string |

- [ ] **Step 1: 创建数据结构基础课程**
- [ ] **Step 2: 创建排序与搜索算法课程**
- [ ] **Step 3: 创建动态规划课程**
- [ ] **Step 4: 创建图算法课程**
- [ ] **Step 5: 创建复杂度分析课程**
- [ ] **Step 6: 创建算法数学基础课程**
- [ ] **Step 7: 创建字符串算法课程**
- [ ] **Step 8: 更新index.json添加课程元数据**
- [ ] **Step 9: 更新subdirections.json添加课程映射**

---

## Task 9: 补充测试课程 (7门)

**Files:**
- Create: `data/courses/testing/unit-testing-basics.md`
- Create: `data/courses/testing/integration-testing.md`
- Create: `data/courses/testing/e2e-testing.md`
- Create: `data/courses/testing/performance-testing.md`
- Create: `data/courses/testing/tdd-bdd.md`
- Create: `data/courses/testing/security-testing.md`
- Create: `data/courses/testing/test-automation.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| unit-testing-basics | 单元测试基础 | beginner | python-fundamentals | test-unit |
| integration-testing | 集成测试 | intermediate | unit-testing-basics | test-integration |
| e2e-testing | E2E 端到端测试 | intermediate | javascript-fundamentals | test-e2e |
| performance-testing | 性能测试 | intermediate | python-fundamentals | test-perf |
| tdd-bdd | TDD/BDD 测试驱动开发 | intermediate | unit-testing-basics | test-tdd |
| security-testing | 安全测试 | intermediate | rest-api-basics | test-security |
| test-automation | 测试自动化 | intermediate | unit-testing-basics | test-auto |

- [ ] **Step 1: 创建单元测试基础课程**
- [ ] **Step 2: 创建集成测试课程**
- [ ] **Step 3: 创建E2E端到端测试课程**
- [ ] **Step 4: 创建性能测试课程**
- [ ] **Step 5: 创建TDD/BDD测试驱动开发课程**
- [ ] **Step 6: 创建安全测试课程**
- [ ] **Step 7: 创建测试自动化课程**
- [ ] **Step 8: 更新index.json添加课程元数据**
- [ ] **Step 9: 更新subdirections.json添加课程映射**

---

## Task 10: 补充 NLP 课程 (6门)

**Files:**
- Create: `data/courses/nlp/nlp-traditional.md`
- Create: `data/courses/nlp/nlp-transformer.md`
- Create: `data/courses/nlp/nlp-llm.md`
- Create: `data/courses/nlp/nlp-applications.md`
- Create: `data/courses/nlp/multimodal.md`
- Create: `data/courses/nlp/nlp-evaluation.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| nlp-traditional | 传统 NLP 技术 | intermediate | python-fundamentals | nlp-traditional, mining-text |
| nlp-transformer | NLP 中的 Transformer | intermediate | transformer-arch | nlp-transformer |
| nlp-llm | NLP 与大语言模型 | advanced | transformer-arch | nlp-llm |
| nlp-applications | NLP 应用开发 | intermediate | python-fundamentals | nlp-app |
| multimodal | 多模态学习 | advanced | cnn-basics, transformer-arch | nlp-multimodal |
| nlp-evaluation | NLP 评估与对齐 | intermediate | transformer-arch | nlp-align |

- [ ] **Step 1: 创建传统NLP技术课程**
- [ ] **Step 2: 创建NLP中的Transformer课程**
- [ ] **Step 3: 创建NLP与大语言模型课程**
- [ ] **Step 4: 创建NLP应用开发课程**
- [ ] **Step 5: 创建多模态学习课程**
- [ ] **Step 6: 创建NLP评估与对齐课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 11: 补充安全课程 (6门)

**Files:**
- Create: `data/courses/security/network-security.md`
- Create: `data/courses/security/cryptography.md`
- Create: `data/courses/security/app-security.md`
- Create: `data/courses/security/cloud-security.md`
- Create: `data/courses/security/compliance.md`
- Create: `data/courses/security/digital-forensics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| network-security | 网络安全基础 | intermediate | 无 | sec-network |
| cryptography | 密码学基础 | intermediate | 无 | sec-crypto |
| app-security | 应用安全 | intermediate | rest-api-basics | sec-app |
| cloud-security | 云安全 | intermediate | cloud-platforms | sec-cloud |
| compliance | 合规与治理 | beginner | 无 | sec-compliance |
| digital-forensics | 数字取证 | advanced | linux-admin | sec-forensics |

- [ ] **Step 1: 创建网络安全基础课程**
- [ ] **Step 2: 创建密码学基础课程**
- [ ] **Step 3: 创建应用安全课程**
- [ ] **Step 4: 创建云安全课程**
- [ ] **Step 5: 创建合规与治理课程**
- [ ] **Step 6: 创建数字取证课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 12: 补充多媒体课程 (6门)

**Files:**
- Create: `data/courses/multimedia/audio-processing.md`
- Create: `data/courses/multimedia/video-processing.md`
- Create: `data/courses/multimedia/streaming-media.md`
- Create: `data/courses/multimedia/image-processing.md`
- Create: `data/courses/multimedia/computer-graphics.md`
- Create: `data/courses/multimedia/arvr-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| audio-processing | 音频处理基础 | intermediate | python-fundamentals | mm-audio |
| video-processing | 视频处理基础 | intermediate | python-fundamentals | mm-video |
| streaming-media | 流媒体技术 | intermediate | docker-fundamentals | mm-streaming |
| image-processing | 图像处理基础 | intermediate | python-fundamentals | mm-image |
| computer-graphics | 计算机图形学 | advanced | cpp-basics | mm-graphics |
| arvr-basics | AR/VR 基础 | advanced | unity-basics | mm-arvr |

- [ ] **Step 1: 创建音频处理基础课程**
- [ ] **Step 2: 创建视频处理基础课程**
- [ ] **Step 3: 创建流媒体技术课程**
- [ ] **Step 4: 创建图像处理基础课程**
- [ ] **Step 5: 创建计算机图形学课程**
- [ ] **Step 6: 创建AR/VR基础课程**
- [ ] **Step 7: 更新index.json添加课程元数据**
- [ ] **Step 8: 更新subdirections.json添加课程映射**

---

## Task 13: 补充数据挖掘课程 (4门)

**Files:**
- Create: `data/courses/data-mining/association-rules.md`
- Create: `data/courses/data-mining/anomaly-detection.md`
- Create: `data/courses/data-mining/recommender-systems.md`
- Create: `data/courses/data-mining/feature-engineering.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| association-rules | 关联规则挖掘 | intermediate | python-fundamentals | mining-association |
| anomaly-detection | 异常检测 | intermediate | python-fundamentals, linear-regression | mining-anomaly |
| recommender-systems | 推荐系统基础 | intermediate | python-fundamentals, linear-regression | mining-recommendation |
| feature-engineering | 特征工程 | intermediate | python-fundamentals, linear-regression | mining-feature |

- [ ] **Step 1: 创建关联规则挖掘课程**
- [ ] **Step 2: 创建异常检测课程**
- [ ] **Step 3: 创建推荐系统基础课程**
- [ ] **Step 4: 创建特征工程课程**
- [ ] **Step 5: 更新index.json添加课程元数据**
- [ ] **Step 6: 更新subdirections.json添加课程映射**

---

## Task 14: 补充 AI Agent 剩余课程 (3门)

**Files:**
- Create: `data/courses/ai-agent/ai-skills-dev.md`
- Create: `data/courses/ai-agent/agent-eval-security.md`
- Create: `data/courses/ai-agent/agent-app-dev.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| ai-skills-dev | AI Skills 开发 | intermediate | agent-architecture, mcp-protocol | agent-skill |
| agent-eval-security | Agent 评估与安全 | intermediate | agent-architecture | agent-eval |
| agent-app-dev | Agent 应用开发 | intermediate | langchain-basics | agent-app |

- [ ] **Step 1: 创建AI Skills开发课程**
- [ ] **Step 2: 创建Agent评估与安全课程**
- [ ] **Step 3: 创建Agent应用开发课程**
- [ ] **Step 4: 更新index.json添加课程元数据**
- [ ] **Step 5: 更新subdirections.json添加课程映射**

---

## Task 15: 补充 LLM 剩余课程 (3门)

**Files:**
- Create: `data/courses/llm/llm-data-processing.md`
- Create: `data/courses/llm/llm-memory-system.md`
- Create: `data/courses/llm/llm-security.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| llm-data-processing | LLM 数据处理 | intermediate | python-fundamentals | llm-data |
| llm-memory-system | LLM 记忆系统 | intermediate | transformer-arch, rag-basics | llm-memory |
| llm-security | LLM 安全与合规 | intermediate | transformer-arch | llm-security |

- [ ] **Step 1: 创建LLM数据处理课程**
- [ ] **Step 2: 创建LLM记忆系统课程**
- [ ] **Step 3: 创建LLM安全与合规课程**
- [ ] **Step 4: 更新index.json添加课程元数据**
- [ ] **Step 5: 更新subdirections.json添加课程映射**

---

## Task 16: 补充后端剩余课程 (1门)

**Files:**
- Create: `data/courses/backend/serverless-basics.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| serverless-basics | Serverless 基础 | intermediate | rest-api-basics, docker-fundamentals | backend-serverless |

- [ ] **Step 1: 创建Serverless基础课程**
- [ ] **Step 2: 更新index.json添加课程元数据**
- [ ] **Step 3: 更新subdirections.json添加课程映射**

---

## Task 17: 补充移动端发布课程 (1门)

**Files:**
- Create: `data/courses/mobile/mobile-publish.md`
- Modify: `data/courses/index.json`
- Modify: `data/subdirections.json`

**课程列表:**
| 课程ID | 标题 | 难度 | 先决条件 | 子方向 |
|--------|------|------|----------|--------|
| mobile-publish | 移动应用发布与运营 | beginner | android-basics | mobile-publish |

- [ ] **Step 1: 创建移动应用发布与运营课程**
- [ ] **Step 2: 更新index.json添加课程元数据**
- [ ] **Step 3: 更新subdirections.json添加课程映射**

---

## 统计汇总

| 方向 | 新增课程数 |
|------|-----------|
| ML 机器学习 | 5 |
| 基础设施 | 5 |
| 开发工具 | 6 |
| 移动开发 | 7 |
| 大数据 | 6 |
| 计算机视觉 | 6 |
| 运维 | 6 |
| 算法 | 7 |
| 测试 | 7 |
| NLP | 6 |
| 安全 | 6 |
| 多媒体 | 6 |
| 数据挖掘 | 4 |
| AI Agent | 3 |
| LLM | 3 |
| 后端 | 1 |
| **总计** | **78** |

---

## 课程内容格式要求

每门课程必须遵循三层漏斗学习法格式：

```markdown
# [课程名称] 三层深度学习教程

## [总览] 技术总览
[200-300字概括该领域是什么、解决什么核心问题]

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. [知识点名称]
#### [概念] 概念解释
#### [代码] 代码示例
```[语言]
[完整可运行的代码示例]
```

## [重点] 第二部分：重点层（20% 进阶内容）

## [扩展] 第三部分：扩展层（60% 广度内容）
| 关键词 | 场景提示 |
|--------|----------|
| ... | ... |

---

## [实战] 核心实战清单
1. [任务描述]
2. [任务描述]
3. [任务描述]

## [避坑] 三层避坑提醒
- **核心层误区**：...
- **重点层误区**：...
- **扩展层建议**：...
```

**重要规则：**
- 不要使用 emoji
- 使用中文标签如 [核心]、[重点]、[扩展]
- 代码示例必须完整可运行
- 不要生成 knowledge_points 字段
