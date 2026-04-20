# CI/CD 基础 三层深度学习教程

## [总览] 技术总览

CI/CD（持续集成/持续部署）是现代软件开发的核心实践，通过自动化构建、测试和部署流程，提高开发效率和软件质量。掌握 CI/CD 是 DevOps 工程师的必备技能。

本教程采用三层漏斗学习法：**核心层**聚焦版本控制集成、自动化构建、自动化测试三大基石；**重点层**深入流水线设计、部署策略、环境管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 版本控制集成

#### [概念] 概念解释

CI/CD 与版本控制系统（如 Git）紧密集成，在代码提交时自动触发构建和测试流程。

#### [代码] 代码示例

```yaml
# GitHub Actions 基础配置
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

```yaml
# GitLab CI 基础配置
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  dependencies:
    - build

deploy:
  stage: deploy
  image: node:18
  script:
    - npm run deploy
  only:
    - main
```

### 2. 自动化构建

#### [概念] 概念解释

自动化构建将源代码转换为可部署的制品，包括编译、打包、依赖安装等步骤。

#### [代码] 代码示例

```yaml
# 多阶段构建
name: Build Pipeline

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          pytest tests/ --cov=src --cov-report=xml
      
      - name: Build package
        run: |
          python -m build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: package
          path: dist/
```

```dockerfile
# Docker 多阶段构建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. 自动化测试

#### [概念] 概念解释

自动化测试在 CI 流程中验证代码质量，包括单元测试、集成测试、端到端测试等。

#### [代码] 代码示例

```yaml
# 完整测试流水线
name: Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 流水线设计

#### [代码] 代码示例

```yaml
# 高级流水线设计
name: Advanced Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v3
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ needs.build.outputs.image-tag }}"
```

### 2. 部署策略

#### [代码] 代码示例

```yaml
# 蓝绿部署
deploy-blue-green:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - name: Deploy to green environment
      run: kubectl apply -f k8s/green.yaml
    
    - name: Run smoke tests
      run: npm run test:smoke
    
    - name: Switch traffic to green
      run: kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
    
    - name: Remove blue environment
      run: kubectl delete -f k8s/blue.yaml --ignore-not-found

# 金丝雀发布
deploy-canary:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy canary
      run: kubectl apply -f k8s/canary.yaml
    
    - name: Monitor canary
      run: |
        for i in {1..10}; do
          if ! kubectl logs -l app=app,track=canary | grep -q ERROR; then
            echo "Canary healthy"
          else
            echo "Canary failed"
            exit 1
          fi
          sleep 10
        done
    
    - name: Promote canary
      run: kubectl patch deployment app -p '{"spec":{"replicas":3}}'
```

### 3. 环境管理

#### [代码] 代码示例

```yaml
# 多环境部署
name: Deploy

on:
  push:
    branches:
      - main
      - develop
      - 'release/*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || github.ref == 'refs/heads/develop' && 'staging' || 'preview' }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Set environment variables
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "ENV=production" >> $GITHUB_ENV
            echo "DOMAIN=app.example.com" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/develop" ]; then
            echo "ENV=staging" >> $GITHUB_ENV
            echo "DOMAIN=staging.example.com" >> $GITHUB_ENV
          else
            echo "ENV=preview" >> $GITHUB_ENV
            echo "DOMAIN=preview-${{ github.sha }}.example.com" >> $GITHUB_ENV
          fi
      
      - name: Deploy
        run: |
          echo "Deploying to ${{ env.ENV }}"
          echo "Domain: ${{ env.DOMAIN }}"
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Matrix Builds | 需要多版本测试时 |
| Caching | 需要加速构建时 |
| Secrets | 需要管理敏感信息时 |
| Self-hosted Runners | 需要自定义运行环境时 |
| Workflow Dispatch | 需要手动触发时 |
| Scheduled Workflows | 需要定时执行时 |
| Release Automation | 需要自动发布时 |
| Rollback | 需要回滚时 |
| Feature Flags | 需要功能开关时 |
| GitOps | 需要 GitOps 工作流时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建完整的 CI/CD 流水线

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "Deploying to production"
```
