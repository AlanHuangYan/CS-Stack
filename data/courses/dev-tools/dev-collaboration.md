# 开发协作工具 三层深度学习教程

## [总览] 技术总览

开发协作工具是现代软件开发团队高效协作的基础设施，包括版本控制、代码审查、项目管理、文档协作等。掌握这些工具可以显著提升团队协作效率和代码质量。

本教程采用三层漏斗学习法：**核心层**聚焦 Git 工作流、代码审查、Issue 管理三大基石；**重点层**深入 CI/CD 集成、文档协作、项目管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能高效参与团队协作 **50% 以上** 的常见任务。

### 1. Git 工作流

#### [概念] 概念解释

Git 工作流是团队协作开发时使用 Git 的规范和流程。常见的工作流包括 Git Flow、GitHub Flow、GitLab Flow 等，选择合适的工作流可以提高开发效率。

#### [语法] 核心语法 / 命令 / API

**常用工作流：**

| 工作流 | 特点 | 适用场景 |
|--------|------|----------|
| Git Flow | 多分支模型 | 有明确发布周期 |
| GitHub Flow | 简化分支模型 | 持续部署 |
| GitLab Flow | 结合环境分支 | 灵活部署 |

#### [代码] 代码示例

```bash
# Git Flow 工作流示例

# 初始化 Git Flow
git flow init

# 开始新功能
git flow feature start new-feature

# 完成功能开发
git flow feature finish new-feature

# 开始发布
git flow release start v1.0.0

# 完成发布
git flow release finish v1.0.0

# 紧急修复
git flow hotfix start critical-bug
git flow hotfix finish critical-bug
```

```bash
# GitHub Flow 工作流示例

# 从 main 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 开发并提交
git add .
git commit -m "feat: add new feature"

# 推送到远程
git push origin feature/new-feature

# 创建 Pull Request
# 在 GitHub/GitLab 网页上操作

# 合并后删除分支
git checkout main
git pull origin main
git branch -d feature/new-feature
```

```bash
# 常用协作命令

# 同步远程仓库
git fetch origin
git rebase origin/main

# 解决冲突
# 1. 手动编辑冲突文件
# 2. 标记为已解决
git add <conflicted-file>
git rebase --continue

# 暂存工作进度
git stash
git stash pop

# 查看分支状态
git branch -vv
git status

# 查看提交历史
git log --oneline --graph --all

# 撤销操作
git reset --soft HEAD~1  # 撤销提交，保留更改
git reset --hard HEAD~1  # 撤销提交，丢弃更改
```

#### [场景] 典型应用场景

1. 多人协作开发同一项目
2. 功能分支开发和合并
3. 版本发布和热修复

### 2. 代码审查

#### [概念] 概念解释

代码审查（Code Review）是团队协作中保证代码质量的重要环节。通过 Pull Request/Merge Request 进行代码审查，可以发现潜在问题、分享知识、保持代码风格一致。

#### [语法] 核心语法 / 命令 / API

**代码审查要点：**

| 审查项 | 说明 |
|--------|------|
| 代码风格 | 是否符合团队规范 |
| 逻辑正确性 | 是否有逻辑错误 |
| 性能考虑 | 是否有性能问题 |
| 安全风险 | 是否有安全漏洞 |
| 测试覆盖 | 是否有足够测试 |

#### [代码] 代码示例

```markdown
# Pull Request 模板

## 变更描述
<!-- 描述本次变更的内容和原因 -->

## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 重构 (refactor)
- [ ] 文档更新 (docs)
- [ ] 其他

## 测试情况
<!-- 描述如何测试这些变更 -->

## 检查清单
- [ ] 代码遵循项目编码规范
- [ ] 已添加必要的测试
- [ ] 所有测试通过
- [ ] 已更新相关文档
- [ ] 没有引入新的警告

## 相关 Issue
<!-- 关联的 Issue 编号 -->
Closes #123
```

```yaml
# GitHub Actions 自动检查
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Linter
        run: npm run lint
      
      - name: Run Tests
        run: npm test
      
      - name: Check Coverage
        run: npm run coverage
```

```python
# 代码审查检查脚本
import os
import re
import subprocess

def check_code_style(files):
    """检查代码风格"""
    issues = []
    for file in files:
        if file.endswith('.py'):
            result = subprocess.run(
                ['flake8', file],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                issues.append(result.stdout)
    return issues

def check_security(files):
    """检查安全问题"""
    issues = []
    patterns = [
        (r'password\s*=\s*[\'"][^\'"]+[\'"]', '硬编码密码'),
        (r'api_key\s*=\s*[\'"][^\'"]+[\'"]', '硬编码 API Key'),
        (r'secret\s*=\s*[\'"][^\'"]+[\'"]', '硬编码密钥'),
    ]
    
    for file in files:
        with open(file, 'r') as f:
            content = f.read()
            for pattern, message in patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    issues.append(f"{file}: {message}")
    
    return issues

def check_test_coverage():
    """检查测试覆盖率"""
    result = subprocess.run(
        ['pytest', '--cov=src', '--cov-report=term'],
        capture_output=True,
        text=True
    )
    return result.stdout
```

#### [场景] 典型应用场景

1. 功能开发完成后的代码审查
2. 发现和修复代码问题
3. 知识分享和团队学习

### 3. Issue 管理

#### [概念] 概念解释

Issue 管理是项目问题跟踪和任务管理的核心。通过 Issue 可以记录 Bug、功能需求、技术债务等，并进行优先级排序和分配。

#### [语法] 核心语法 / 命令 / API

**Issue 类型：**

| 类型 | 标签 | 说明 |
|------|------|------|
| Bug | bug | 程序错误 |
| 功能 | feature | 新功能需求 |
| 优化 | enhancement | 改进优化 |
| 文档 | documentation | 文档相关 |

#### [代码] 代码示例

```markdown
# Bug Report 模板

## Bug 描述
<!-- 清晰描述遇到的问题 -->

## 复现步骤
1. 进入页面 '...'
2. 点击按钮 '...'
3. 滚动到 '...'
4. 看到错误

## 期望行为
<!-- 描述期望发生什么 -->

## 实际行为
<!-- 描述实际发生了什么 -->

## 截图
<!-- 如果适用，添加截图 -->

## 环境信息
- 操作系统: [如 Windows 11]
- 浏览器: [如 Chrome 120]
- 版本: [如 v1.0.0]

## 其他信息
<!-- 添加其他相关信息 -->
```

```markdown
# Feature Request 模板

## 功能描述
<!-- 清晰描述想要的功能 -->

## 问题背景
<!-- 描述这个功能要解决什么问题 -->

## 建议方案
<!-- 描述建议的实现方案 -->

## 替代方案
<!-- 描述考虑过的其他方案 -->

## 其他信息
<!-- 添加其他相关信息或截图 -->
```

```yaml
# GitHub Issue 模板配置
# .github/ISSUE_TEMPLATE/config.yml

blank_issues_enabled: false
contact_links:
  - name: 文档
    url: https://docs.example.com
    about: 查看项目文档
  - name: 讨论
    url: https://github.com/org/repo/discussions
    about: 参与社区讨论
```

```bash
# GitHub CLI 操作 Issue

# 创建 Issue
gh issue create --title "Bug: 登录失败" --body "描述..." --label bug

# 查看 Issue 列表
gh issue list --state open --limit 20

# 查看 Issue 详情
gh issue view 123

# 关闭 Issue
gh issue close 123

# 添加标签
gh issue edit 123 --add-label "priority:high"

# 分配 Issue
gh issue edit 123 --add-assignee @me
```

#### [场景] 典型应用场景

1. 报告和跟踪 Bug
2. 提交功能需求
3. 任务分配和进度跟踪

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的团队协作效率和项目管理能力将显著提升。

### 1. CI/CD 集成

#### [概念] 概念与解决的问题

CI/CD（持续集成/持续部署）将代码变更自动集成、测试和部署。通过自动化流程减少人工错误，加快交付速度。

#### [语法] 核心用法

**CI/CD 流程：**

| 阶段 | 说明 |
|------|------|
| Build | 构建项目 |
| Test | 运行测试 |
| Deploy | 部署应用 |

#### [代码] 代码示例

```yaml
# GitHub Actions 完整 CI/CD 配置
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # 部署脚本
```

#### [关联] 与核心层的关联

CI/CD 集成是代码审查的延伸，自动化执行测试和部署流程。

### 2. 文档协作

#### [概念] 概念与解决的问题

文档协作是团队知识管理的重要组成部分。良好的文档可以提高沟通效率，降低知识传递成本。

#### [语法] 核心用法

**文档类型：**

| 类型 | 说明 |
|------|------|
| README | 项目说明 |
| API 文档 | 接口文档 |
| 架构文档 | 系统设计 |
| 运维文档 | 部署运维 |

#### [代码] 代码示例

```markdown
# 项目 README 模板

# 项目名称

简短描述项目功能

## 功能特性

- 特性 1
- 特性 2
- 特性 3

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.9

### 安装

```bash
npm install
```

### 运行

```bash
npm start
```

## 项目结构

```
├── src/          # 源代码
├── tests/        # 测试文件
├── docs/         # 文档
└── README.md     # 说明文档
```

## 贡献指南

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献流程。

## 许可证

[MIT](LICENSE)
```

```yaml
# MkDocs 文档配置
site_name: 项目文档
site_url: https://docs.example.com

nav:
  - 首页: index.md
  - 快速开始: getting-started.md
  - API 参考: api.md
  - 架构设计: architecture.md
  - 运维指南: operations.md

theme:
  name: material
  language: zh

plugins:
  - search
  - mermaid2

markdown_extensions:
  - admonition
  - codehilite
  - toc:
      permalink: true
```

#### [场景] 典型应用场景

1. 编写项目文档
2. 维护 API 文档
3. 知识库建设

### 3. 项目管理

#### [概念] 概念与解决的问题

项目管理工具帮助团队规划、跟踪和交付项目。通过看板、里程碑、时间线等功能管理项目进度。

#### [语法] 核心用法

**项目管理要素：**

| 要素 | 说明 |
|------|------|
| Epic | 大型功能 |
| Story | 用户故事 |
| Task | 具体任务 |
| Sprint | 迭代周期 |

#### [代码] 代码示例

```yaml
# GitHub Projects 配置

# 项目看板列
columns:
  - name: Backlog
  - name: Ready
  - name: In Progress
  - name: Review
  - name: Done

# 自动化规则
automation:
  - trigger: issue_opened
    action: add_to_column
    column: Backlog
  
  - trigger: pr_opened
    action: add_to_column
    column: Review
  
  - trigger: pr_merged
    action: move_to_column
    column: Done
```

```markdown
# Sprint 计划模板

## Sprint 信息
- Sprint 编号: Sprint 23
- 开始日期: 2024-01-15
- 结束日期: 2024-01-29
- 目标: 完成用户认证模块

## 任务列表

### 高优先级
- [ ] #123 实现登录功能
- [ ] #124 实现注册功能
- [ ] #125 实现密码重置

### 中优先级
- [ ] #126 添加第三方登录
- [ ] #127 实现权限管理

### 低优先级
- [ ] #128 优化登录体验

## 风险项
- 第三方登录 API 文档不完整

## 回顾要点
- 完成情况
- 遇到的问题
- 改进建议
```

#### [场景] 典型应用场景

1. Sprint 计划和回顾
2. 任务分配和跟踪
3. 项目进度可视化

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Git Hooks | 需要自动化代码检查时 |
| Code Owners | 需要指定代码审查人时 |
| Branch Protection | 需要保护重要分支时 |
| GitHub Apps | 需要扩展 GitHub 功能时 |
| Slack Integration | 需要消息通知集成时 |
| Jira Integration | 需要项目管理集成时 |
| Wiki | 需要知识库管理时 |
| Discussion | 需要团队讨论时 |
| Release Notes | 需要发布说明时 |
| Changelog | 需要变更日志时 |

---

## [实战] 核心实战清单

### 实战任务 1：配置完整的团队协作流程

**任务描述：**
为一个开发团队配置完整的协作流程，包括 Git 工作流、代码审查和 CI/CD。

**要求：**
- 配置 Git 分支保护规则
- 创建 PR 模板和检查清单
- 配置 CI/CD 自动化流程
- 设置 Issue 模板

**参考实现：**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
```

```markdown
# .github/PULL_REQUEST_TEMPLATE.md
## 变更描述

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构

## 检查清单
- [ ] 代码风格检查通过
- [ ] 测试通过
- [ ] 文档已更新
```

```json
// .github/CODEOWNERS
* @team/developers
/src/api/ @team/backend
/src/ui/ @team/frontend
```
