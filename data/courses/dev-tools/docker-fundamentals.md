# Docker 基础 三层深度学习教程

## [总览] 技术总览

Docker 是一个开源的容器化平台，通过容器技术将应用程序及其依赖打包成可移植的镜像。相比虚拟机，容器更轻量、启动更快、资源利用率更高，是现代云原生应用的基础设施。

本教程采用三层漏斗学习法：**核心层**聚焦容器概念、Dockerfile 编写、镜像操作三大基石；**重点层**深入数据卷、网络配置和多容器编排；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Docker 日常操作 **50% 以上** 的常见任务。

### 1. 容器概念

#### [概念] 概念解释

容器是一个轻量级、独立的可执行软件包，包含运行应用所需的所有内容：代码、运行时、库、环境变量和配置文件。与虚拟机不同，容器共享主机操作系统内核，因此更加轻量和高效。

#### [语法] 核心语法 / 命令 / API

**容器 vs 虚拟机：**

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动时间 | 秒级 | 分钟级 |
| 资源占用 | MB 级 | GB 级 |
| 性能 | 接近原生 | 有损耗 |
| 隔离性 | 进程级 | 操作系统级 |
| 可移植性 | 极高 | 较低 |

**核心概念：**

| 概念 | 说明 |
|------|------|
| 镜像 | 只读模板，包含创建容器的指令 |
| 容器 | 镜像的运行实例 |
| 仓库 | 存储和分发镜像的地方 |
| Dockerfile | 构建镜像的脚本文件 |

#### [代码] 代码示例

```bash
# 查看 Docker 版本
docker --version
docker version

# 查看 Docker 信息
docker info

# 运行第一个容器
docker run hello-world

# 运行交互式容器
docker run -it ubuntu bash

# 运行后台容器
docker run -d nginx

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器日志
docker logs container_id
docker logs -f container_id

# 进入运行中的容器
docker exec -it container_id bash

# 停止容器
docker stop container_id

# 启动已停止的容器
docker start container_id

# 重启容器
docker restart container_id

# 删除容器
docker rm container_id

# 强制删除运行中的容器
docker rm -f container_id

# 查看容器详情
docker inspect container_id

# 查看容器资源使用
docker stats

# 查看容器进程
docker top container_id

# 在容器和主机间复制文件
docker cp file.txt container_id:/path/
docker cp container_id:/path/file.txt ./

# 导出容器为 tar 文件
docker export container_id > container.tar

# 从 tar 文件导入镜像
cat container.tar | docker import - myimage:latest
```

#### [场景] 典型应用场景

1. 开发环境：快速搭建一致的开发环境
2. CI/CD：在容器中运行构建和测试
3. 微服务：每个服务运行在独立容器中

### 2. Dockerfile 编写

#### [概念] 概念解释

Dockerfile 是一个文本文件，包含构建 Docker 镜像的所有指令。通过 Dockerfile 可以自动化构建过程，确保镜像的可重复性和可维护性。

#### [语法] 核心语法 / 命令 / API

**常用指令：**

| 指令 | 说明 | 示例 |
|------|------|------|
| FROM | 基础镜像 | FROM python:3.9 |
| WORKDIR | 工作目录 | WORKDIR /app |
| COPY | 复制文件 | COPY . . |
| ADD | 添加文件（支持URL和解压） | ADD file.tar.gz /tmp/ |
| RUN | 执行命令 | RUN pip install flask |
| CMD | 容器启动命令 | CMD ["python", "app.py"] |
| ENTRYPOINT | 入口点 | ENTRYPOINT ["python"] |
| ENV | 环境变量 | ENV APP_ENV=production |
| EXPOSE | 暴露端口 | EXPOSE 8000 |
| ARG | 构建参数 | ARG VERSION=1.0 |
| LABEL | 元数据标签 | LABEL version="1.0" |
| USER | 运行用户 | USER appuser |
| VOLUME | 数据卷 | VOLUME /data |

#### [代码] 代码示例

```bash
# 创建示例项目
mkdir docker-demo
cd docker-demo

# 创建 Python 应用
cat > app.py << 'EOF'
from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return f"Hello from Docker! Env: {os.getenv('APP_ENV', 'development')}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
EOF

# 创建 requirements.txt
cat > requirements.txt << 'EOF'
flask==2.3.0
EOF

# 创建 Dockerfile
cat > Dockerfile << 'EOF'
# 基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_ENV=production

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# 启动命令
CMD ["python", "app.py"]
EOF

# 构建镜像
docker build -t my-flask-app:1.0 .

# 构建时传递参数
docker build --build-arg VERSION=2.0 -t my-flask-app:2.0 .

# 查看构建历史
docker history my-flask-app:1.0

# 运行容器
docker run -d -p 8000:8000 --name flask-app my-flask-app:1.0

# 测试应用
curl http://localhost:8000/

# 查看容器日志
docker logs flask-app

# 多阶段构建 Dockerfile
cat > Dockerfile.multistage << 'EOF'
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 使用多阶段构建
docker build -f Dockerfile.multistage -t my-nginx-app:1.0 .

# 最佳实践：使用 .dockerignore
cat > .dockerignore << 'EOF'
__pycache__
*.pyc
*.pyo
.git
.gitignore
.env
venv
.venv
node_modules
*.log
EOF
```

#### [场景] 典型应用场景

1. Web 应用：打包 Flask/Django/Express 应用
2. 微服务：每个服务一个 Dockerfile
3. 构建环境：创建编译和打包环境

### 3. 镜像操作

#### [概念] 概念解释

镜像是容器的蓝图，包含运行应用所需的所有文件和配置。镜像由多个只读层组成，每层代表 Dockerfile 中的一个指令。

#### [语法] 核心语法 / 命令 / API

**镜像命令：**

| 命令 | 说明 |
|------|------|
| docker images | 列出本地镜像 |
| docker pull | 拉取镜像 |
| docker push | 推送镜像 |
| docker rmi | 删除镜像 |
| docker tag | 标记镜像 |
| docker save | 导出镜像 |
| docker load | 导入镜像 |

#### [代码] 代码示例

```bash
# 列出本地镜像
docker images
docker images -a

# 搜索镜像
docker search nginx
docker search --filter=stars=100 nginx

# 拉取镜像
docker pull nginx
docker pull nginx:1.25
docker pull python:3.9-slim

# 查看镜像详情
docker inspect nginx:latest

# 查看镜像层
docker history nginx:latest

# 标记镜像
docker tag my-flask-app:1.0 my-registry.com/flask-app:1.0
docker tag my-flask-app:1.0 my-flask-app:latest

# 删除镜像
docker rmi my-flask-app:1.0

# 强制删除（如果有容器使用）
docker rmi -f my-flask-app:1.0

# 清理悬空镜像
docker image prune

# 清理所有未使用的镜像
docker image prune -a

# 导出镜像为 tar 文件
docker save -o my-flask-app.tar my-flask-app:1.0

# 从 tar 文件导入镜像
docker load -i my-flask-app.tar

# 推送到 Docker Hub
docker login
docker tag my-flask-app:1.0 username/flask-app:1.0
docker push username/flask-app:1.0

# 推送到私有仓库
docker tag my-flask-app:1.0 registry.example.com/flask-app:1.0
docker push registry.example.com/flask-app:1.0

# 从私有仓库拉取
docker pull registry.example.com/flask-app:1.0

# 查看镜像摘要
docker images --digests

# 按大小排序
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k3 -h

# 批量删除镜像
docker rmi $(docker images -q nginx)

# 创建镜像摘要
docker build -t myapp:1.0 --no-cache .

# 查看镜像构建缓存
docker builder prune
```

#### [场景] 典型应用场景

1. 镜像分发：将构建好的镜像推送到仓库
2. 版本管理：使用 tag 管理不同版本
3. 镜像迁移：在不同环境间迁移镜像

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的容器化应用部署能力和问题解决能力将显著提升。

### 1. 数据卷

#### [概念] 概念与解决的问题

容器内的数据在容器删除后会丢失。数据卷提供了持久化存储的机制，将数据存储在容器外部，实现数据与容器的解耦。

#### [语法] 核心用法

**数据卷类型：**

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| Volume | Docker 管理的卷 | 持久化数据 |
| Bind Mount | 主机目录挂载 | 开发环境 |
| tmpfs | 内存存储 | 敏感数据 |

#### [代码] 代码示例

```bash
# 创建数据卷
docker volume create my-volume

# 列出所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect my-volume

# 删除数据卷
docker volume rm my-volume

# 清理未使用的数据卷
docker volume prune

# 使用 Volume 运行容器
docker run -d -v my-volume:/app/data nginx

# 使用 Bind Mount 运行容器
docker run -d -v /host/path:/container/path nginx

# 只读挂载
docker run -d -v my-volume:/app/data:ro nginx

# 匿名卷
docker run -d -v /app/data nginx

# 多个数据卷
docker run -d \
    -v my-volume:/app/data \
    -v /host/config:/app/config:ro \
    nginx

# MySQL 数据持久化
docker run -d \
    --name mysql \
    -e MYSQL_ROOT_PASSWORD=password \
    -v mysql-data:/var/lib/mysql \
    mysql:8.0

# 共享数据卷
docker run -d --name app1 -v shared-data:/data nginx
docker run -d --name app2 --volumes-from app1 nginx

# 查看容器挂载信息
docker inspect --format='{{json .Mounts}}' container_id

# 备份数据卷
docker run --rm \
    -v my-volume:/data \
    -v $(pwd):/backup \
    alpine tar czf /backup/backup.tar.gz /data

# 恢复数据卷
docker run --rm \
    -v my-volume:/data \
    -v $(pwd):/backup \
    alpine sh -c "cd / && tar xzf /backup/backup.tar.gz"

# tmpfs 挂载
docker run -d --tmpfs /tmp nginx

# 实际应用：开发环境
docker run -d \
    -p 8000:8000 \
    -v $(pwd)/app:/app \
    -v $(pwd)/requirements.txt:/app/requirements.txt \
    my-flask-app:1.0
```

#### [关联] 与核心层的关联

数据卷是对容器存储的扩展，在 Dockerfile 中通过 VOLUME 指令声明，运行时通过 -v 参数挂载。

### 2. 网络配置

#### [概念] 概念与解决的问题

Docker 网络允许容器之间以及容器与外部世界通信。理解网络模式对于构建分布式应用至关重要。

#### [语法] 核心用法

**网络模式：**

| 模式 | 说明 | 使用场景 |
|------|------|----------|
| bridge | 默认模式，容器有独立 IP | 单机容器 |
| host | 共享主机网络 | 高性能网络 |
| none | 无网络 | 隔离容器 |
| overlay | 跨主机网络 | Swarm 集群 |

#### [代码] 代码示例

```bash
# 列出网络
docker network ls

# 创建网络
docker network create my-network

# 创建指定子网的网络
docker network create --subnet=172.20.0.0/16 my-network

# 查看网络详情
docker network inspect my-network

# 删除网络
docker network rm my-network

# 清理未使用的网络
docker network prune

# 运行容器并连接网络
docker run -d --name web --network my-network nginx

# 连接运行中的容器到网络
docker network connect my-network container_id

# 断开容器网络连接
docker network disconnect my-network container_id

# 使用 host 模式
docker run -d --network host nginx

# 使用 none 模式
docker run -d --network none alpine

# 端口映射
docker run -d -p 8080:80 nginx
docker run -d -p 192.168.1.1:8080:80 nginx
docker run -d -P nginx

# 查看端口映射
docker port container_id

# 容器间通信
docker run -d --name db --network my-network -e MYSQL_ROOT_PASSWORD=password mysql
docker run -d --name app --network my-network -e DB_HOST=db my-app

# 通过容器名访问
docker exec app ping db

# DNS 配置
docker run -d --dns 8.8.8.8 nginx
docker run -d --dns-search example.com nginx

# 自定义 hosts
docker run -d --add-host myhost:192.168.1.1 nginx

# 实际应用：Web 应用 + 数据库
docker network create app-network

docker run -d \
    --name mysql \
    --network app-network \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_DATABASE=myapp \
    -v mysql-data:/var/lib/mysql \
    mysql:8.0

docker run -d \
    --name web \
    --network app-network \
    -e DATABASE_URL=mysql://root:password@mysql:3306/myapp \
    -p 8000:8000 \
    my-flask-app:1.0
```

#### [关联] 与核心层的关联

网络配置与容器运行紧密相关，通过 --network 参数指定网络模式，实现容器间通信。

### 3. Docker Compose

#### [概念] 概念与解决的问题

Docker Compose 是一个用于定义和运行多容器应用的工具。通过 YAML 文件配置应用的服务、网络和数据卷，简化了多容器应用的管理。

#### [语法] 核心用法

**docker-compose.yml 结构：**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
```

#### [代码] 代码示例

```bash
# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/myapp
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./app:/app
    networks:
      - app-network

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=myapp
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    networks:
      - app-network

volumes:
  mysql-data:

networks:
  app-network:
    driver: bridge
EOF

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs -f web

# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 删除包括数据卷
docker-compose down -v

# 构建服务
docker-compose build

# 重新构建并启动
docker-compose up --build -d

# 扩展服务
docker-compose up -d --scale web=3

# 执行命令
docker-compose exec web bash
docker-compose run web python manage.py migrate

# 查看服务进程
docker-compose top

# 暂停/恢复服务
docker-compose pause
docker-compose unpause

# 实际应用：完整 Web 应用栈
cat > docker-compose.full.yml << 'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - static-files:/var/www/static
    depends_on:
      - web
    networks:
      - frontend

  web:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgres://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./app:/app
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:alpine
    networks:
      - backend

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgres://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - backend

volumes:
  postgres-data:
  static-files:

networks:
  frontend:
  backend:
EOF

docker-compose -f docker-compose.full.yml up -d
```

#### [关联] 与核心层的关联

Docker Compose 是 Dockerfile 和容器运行命令的编排工具，将多个服务的配置集中管理。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| 多阶段构建 | 需要优化镜像大小，分离构建和运行环境 |
| Docker Swarm | 需要容器编排和集群管理 |
| Docker Registry | 需要搭建私有镜像仓库 |
| Docker Security | 需要容器安全扫描和加固 |
| Docker Logging | 需要集中管理容器日志 |
| Docker Monitoring | 需要监控容器资源使用 |
| Docker BuildKit | 需要加速镜像构建 |
| Docker Context | 需要管理多个 Docker 环境 |
| Docker Manifest | 需要创建多架构镜像 |
| Docker System | 需要清理系统资源 |
| Docker Plugin | 需要扩展 Docker 功能 |
| Docker Stats | 需要实时监控容器资源 |
| Docker Events | 需要监听 Docker 事件 |
| Docker Trust | 需要镜像签名和验证 |
| Docker Scout | 需要镜像安全分析 |

---

## [实战] 核心实战清单

### 实战任务 1：部署一个完整的 Web 应用栈

**任务描述：**

使用 Docker Compose 部署一个包含以下组件的 Web 应用：
1. Nginx 作为反向代理
2. Flask Web 应用
3. MySQL 数据库
4. Redis 缓存

**要求：**
- 使用 Dockerfile 构建 Flask 应用镜像
- 使用 Docker Compose 编排所有服务
- 配置数据持久化
- 配置健康检查

**参考实现：**

```bash
# 项目结构
mkdir -p docker-web-stack/{app,nginx}
cd docker-web-stack

# Flask 应用
cat > app/app.py << 'EOF'
from flask import Flask, jsonify
import mysql.connector
import redis
import os

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'db'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', 'password'),
        database=os.getenv('MYSQL_DATABASE', 'myapp')
    )

def get_redis():
    return redis.Redis(
        host=os.getenv('REDIS_HOST', 'redis'),
        port=6379,
        decode_responses=True
    )

@app.route('/')
def index():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/db-test')
def db_test():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({"database": "connected"})
    except Exception as e:
        return jsonify({"database": "error", "message": str(e)})

@app.route('/redis-test')
def redis_test():
    try:
        r = get_redis()
        r.set('test', 'value')
        value = r.get('test')
        return jsonify({"redis": "connected", "value": value})
    except Exception as e:
        return jsonify({"redis": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
EOF

cat > app/requirements.txt << 'EOF'
flask==2.3.0
mysql-connector-python==8.0.33
redis==4.5.5
EOF

# Flask Dockerfile
cat > app/Dockerfile << 'EOF'
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
EOF

# Nginx 配置
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream flask_app {
        server web:5000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://flask_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /health {
            proxy_pass http://flask_app/health;
        }
    }
}
EOF

# Docker Compose
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
    networks:
      - frontend

  web:
    build: ./app
    environment:
      - MYSQL_HOST=db
      - MYSQL_USER=root
      - MYSQL_PASSWORD=password
      - MYSQL_DATABASE=myapp
      - REDIS_HOST=redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=myapp
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:alpine
    networks:
      - backend

volumes:
  mysql-data:

networks:
  frontend:
  backend:
EOF

# 启动
docker-compose up -d --build

# 测试
curl http://localhost/
curl http://localhost/health
curl http://localhost/db-test
curl http://localhost/redis-test
```
