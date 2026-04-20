# Kubernetes 基础 三层深度学习教程

## [总览] 技术总览

Kubernetes（K8s）是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用。它提供了服务发现、负载均衡、存储编排、自动滚动更新和回滚等功能，是云原生应用的事实标准。

本教程采用三层漏斗学习法：**核心层**聚焦 Pod、Deployment、Service 三大基石；**重点层**深入 ConfigMap/Secret 和 Ingress；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Kubernetes 日常操作 **50% 以上** 的常见任务。

### 1. Pod 概念

#### [概念] 概念解释

Pod 是 Kubernetes 中最小的部署单元，包含一个或多个容器。同一 Pod 内的容器共享网络和存储，总是被一起调度到同一节点上。理解 Pod 是使用 Kubernetes 的基础。

#### [语法] 核心语法 / 命令 / API

**Pod 特点：**

| 特点 | 说明 |
|------|------|
| 最小单元 | Kubernetes 调度的最小单位 |
| 共享网络 | 同一 Pod 内容器共享 IP |
| 共享存储 | 可共享 Volume |
| 临时性 | Pod 是临时的，重启后 IP 会变 |

#### [代码] 代码示例

```yaml
# basic-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    environment: production
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 10
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

```bash
# 创建 Pod
kubectl apply -f basic-pod.yaml

# 查看 Pod 状态
kubectl get pods
kubectl get pods -o wide
kubectl get pods -o yaml

# 查看 Pod 详情
kubectl describe pod nginx-pod

# 查看 Pod 日志
kubectl logs nginx-pod
kubectl logs -f nginx-pod
kubectl logs nginx-pod -c container-name

# 进入 Pod 容器
kubectl exec -it nginx-pod -- /bin/bash
kubectl exec -it nginx-pod -c container-name -- /bin/bash

# 删除 Pod
kubectl delete pod nginx-pod
kubectl delete -f basic-pod.yaml

# 端口转发
kubectl port-forward nginx-pod 8080:80

# 查看 Pod 资源使用
kubectl top pod nginx-pod
```

```yaml
# multi-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: app
    image: nginx:1.25
    ports:
    - containerPort: 80
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx
  
  - name: log-collector
    image: busybox
    command: ["sh", "-c", "tail -f /logs/access.log"]
    volumeMounts:
    - name: shared-logs
      mountPath: /logs
  
  volumes:
  - name: shared-logs
    emptyDir: {}
```

```yaml
# pod-with-init-container.yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-container-demo
spec:
  initContainers:
  - name: init-db
    image: busybox
    command: ["sh", "-c", "echo 'Initializing...' && sleep 5"]
  
  containers:
  - name: main-app
    image: nginx:1.25
    ports:
    - containerPort: 80
```

```yaml
# pod-with-resources.yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "256Mi"
        cpu: "1000m"
    env:
    - name: MAX_CONNECTIONS
      value: "100"
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: log-level
```

#### [场景] 典型应用场景

1. 单容器应用：运行独立的 Web 服务
2. 边车模式：主容器 + 日志收集容器
3. 初始化任务：使用 init 容器完成启动前准备

### 2. Deployment

#### [概念] 概念解释

Deployment 是管理 Pod 的控制器，提供声明式更新、滚动升级、回滚等功能。它通过 ReplicaSet 维护指定数量的 Pod 副本，确保应用高可用。

#### [语法] 核心语法 / 命令 / API

**Deployment 功能：**

| 功能 | 说明 |
|------|------|
| 副本管理 | 维护指定数量的 Pod |
| 滚动更新 | 无停机更新应用 |
| 回滚 | 回退到历史版本 |
| 扩缩容 | 调整副本数量 |

#### [代码] 代码示例

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# 创建 Deployment
kubectl apply -f deployment.yaml

# 查看 Deployment
kubectl get deployments
kubectl get deployments -o wide

# 查看 ReplicaSet
kubectl get rs

# 查看 Pod
kubectl get pods -l app=nginx

# 扩缩容
kubectl scale deployment nginx-deployment --replicas=5
kubectl scale deployment nginx-deployment --replicas=3

# 自动扩缩容
kubectl autoscale deployment nginx-deployment --min=2 --max=10 --cpu-percent=80

# 更新镜像
kubectl set image deployment/nginx-deployment nginx=nginx:1.26

# 查看更新状态
kubectl rollout status deployment/nginx-deployment

# 查看更新历史
kubectl rollout history deployment/nginx-deployment
kubectl rollout history deployment/nginx-deployment --revision=2

# 回滚
kubectl rollout undo deployment/nginx-deployment
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# 暂停和恢复更新
kubectl rollout pause deployment/nginx-deployment
kubectl rollout resume deployment/nginx-deployment

# 查看 Deployment 详情
kubectl describe deployment nginx-deployment

# 删除 Deployment
kubectl delete deployment nginx-deployment
```

```yaml
# deployment-with-probes.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:1.25
        ports:
        - containerPort: 80
        
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        startupProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 30
```

```yaml
# deployment-with-node-selector.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gpu-app
  template:
    metadata:
      labels:
        app: gpu-app
    spec:
      nodeSelector:
        gpu: "true"
      containers:
      - name: app
        image: nvidia/cuda:11.0-base
        resources:
          limits:
            nvidia.com/gpu: 1
```

#### [场景] 典型应用场景

1. Web 应用部署：管理多个副本的 Web 服务
2. 微服务部署：每个服务一个 Deployment
3. 批处理任务：使用 Deployment 管理工作节点

### 3. Service

#### [概念] 概念解释

Service 为一组 Pod 提供稳定的访问入口。它通过标签选择器找到后端 Pod，并提供负载均衡。Service 解决了 Pod IP 动态变化的问题。

#### [语法] 核心语法 / 命令 / API

**Service 类型：**

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| ClusterIP | 集群内部访问 | 内部服务 |
| NodePort | 节点端口映射 | 开发测试 |
| LoadBalancer | 云负载均衡器 | 生产环境 |
| ExternalName | 外部服务别名 | 外部服务引用 |

#### [代码] 代码示例

```yaml
# service-clusterip.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```

```yaml
# service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

```yaml
# service-loadbalancer.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```

```bash
# 创建 Service
kubectl apply -f service-clusterip.yaml

# 查看 Service
kubectl get services
kubectl get svc
kubectl get svc -o wide

# 查看 Service 详情
kubectl describe svc nginx-service

# 查看 Service 端点
kubectl get endpoints nginx-service

# 通过 Service 访问
kubectl run test --image=busybox --rm -it -- wget -qO- nginx-service

# 删除 Service
kubectl delete svc nginx-service
```

```yaml
# 完整示例：Web 应用 + Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:1.25
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

```yaml
# 多端口 Service
apiVersion: v1
kind: Service
metadata:
  name: multi-port-service
spec:
  selector:
    app: multi-port-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
```

```yaml
# Headless Service（无 ClusterIP）
apiVersion: v1
kind: Service
metadata:
  name: headless-service
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    app: stateful-app
  ports:
  - port: 80
    targetPort: 80
```

#### [场景] 典型应用场景

1. 内部服务通信：使用 ClusterIP 类型
2. 开发测试访问：使用 NodePort 类型
3. 生产环境暴露：使用 LoadBalancer 类型

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Kubernetes 配置管理和网络暴露能力将显著提升。

### 1. ConfigMap 和 Secret

#### [概念] 概念与解决的问题

ConfigMap 用于存储非敏感配置数据，Secret 用于存储敏感信息（如密码、密钥）。它们将配置与镜像解耦，实现配置的动态更新。

#### [语法] 核心用法

**ConfigMap 创建方式：**

| 方式 | 说明 |
|------|------|
| 字面值 | --from-literal |
| 文件 | --from-file |
| 目录 | --from-file |
| YAML 文件 | kubectl apply -f |

#### [代码] 代码示例

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_host: "mysql-service"
  database_port: "3306"
  cache_host: "redis-service"
  log_level: "info"
  app.properties: |
    server.port=8080
    spring.profiles.active=prod
    logging.level.root=INFO
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  database_password: cGFzc3dvcmQxMjM=
  api_key: YXBpLWtleS0xMjM0NTY3ODkw
stringData:
  database_user: "admin"
```

```bash
# 创建 ConfigMap
kubectl create configmap app-config --from-literal=key1=value1 --from-literal=key2=value2
kubectl create configmap app-config --from-file=config.properties
kubectl create configmap app-config --from-file=path/to/config/dir/

# 创建 Secret
kubectl create secret generic app-secret --from-literal=password=secret123
kubectl create secret generic app-secret --from-file=secret.txt
kubectl create secret tls tls-secret --cert=path/to/cert --key=path/to/key

# 查看 ConfigMap
kubectl get configmaps
kubectl describe configmap app-config

# 查看 Secret
kubectl get secrets
kubectl describe secret app-secret

# 解码 Secret
kubectl get secret app-secret -o jsonpath='{.data.password}' | base64 --decode
```

```yaml
# pod-with-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmap-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    env:
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_host
    - name: DATABASE_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_port
    envFrom:
    - configMapRef:
        name: app-config
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

```yaml
# pod-with-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: database_password
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: app-secret
```

#### [关联] 与核心层的关联

ConfigMap 和 Secret 通过环境变量或 Volume 注入到 Pod 中，实现配置与镜像的解耦。

### 2. Ingress

#### [概念] 概念与解决的问题

Ingress 提供了从集群外部访问集群内服务的 HTTP/HTTPS 路由规则。它支持基于域名和路径的路由、TLS 终止、负载均衡等功能。

#### [语法] 核心用法

**Ingress 功能：**

| 功能 | 说明 |
|------|------|
| 路由规则 | 基于域名和路径 |
| TLS | HTTPS 支持 |
| 负载均衡 | 流量分发 |
| 虚拟主机 | 多域名支持 |

#### [代码] 代码示例

```yaml
# ingress-basic.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: basic-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

```yaml
# ingress-with-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - example.com
    - www.example.com
    secretName: tls-secret
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

```yaml
# ingress-multi-service.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-service-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

```bash
# 查看 Ingress
kubectl get ingress
kubectl get ing

# 查看 Ingress 详情
kubectl describe ingress basic-ingress

# 安装 Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# 查看 Ingress Controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

```yaml
# 完整示例：Web 应用 + Ingress
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:1.25
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - example.com
    secretName: web-tls
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

#### [关联] 与核心层的关联

Ingress 是 Service 的扩展，将外部流量路由到 Service，再由 Service 分发到 Pod。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| StatefulSet | 需要有状态应用部署 |
| DaemonSet | 需要每个节点运行一个 Pod |
| Job | 需要一次性任务 |
| CronJob | 需要定时任务 |
| PersistentVolume | 需要持久化存储 |
| PersistentVolumeClaim | 需要声明存储 |
| StorageClass | 需要动态存储供应 |
| Namespace | 需要资源隔离 |
| ResourceQuota | 需要资源配额限制 |
| LimitRange | 需要默认资源限制 |
| NetworkPolicy | 需要网络访问控制 |
| ServiceAccount | 需要身份认证 |
| RBAC | 需要权限控制 |
| Helm | 需要包管理 |
| Operator | 需要自定义控制器 |

---

## [实战] 核心实战清单

### 实战任务 1：部署一个完整的 Web 应用

**任务描述：**

部署一个包含前端、后端和数据库的 Web 应用：
1. 使用 Deployment 管理应用副本
2. 使用 Service 暴露服务
3. 使用 ConfigMap 和 Secret 管理配置
4. 使用 Ingress 暴露外部访问

**要求：**
- 前端 3 副本，后端 2 副本
- 数据库使用持久化存储
- 配置 HTTPS 访问

**参考实现：**

```yaml
# web-app-complete.yaml
# 数据库 Secret
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  MYSQL_ROOT_PASSWORD: "rootpassword"
  MYSQL_DATABASE: "myapp"
  MYSQL_USER: "appuser"
  MYSQL_PASSWORD: "apppassword"
---
# 数据库配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  MYSQL_HOST: "mysql-service"
  MYSQL_PORT: "3306"
---
# 数据库 PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
# 数据库 Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        envFrom:
        - secretRef:
            name: db-secret
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc
---
# 数据库 Service
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
---
# 后端 Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: myapp-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: db-config
        - secretRef:
            name: db-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# 后端 Service
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
---
# 前端 Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: nginx:1.25
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config
---
# 前端 Service
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
---
# Nginx 配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  default.conf: |
    upstream backend {
        server backend-service:8000;
    }
    server {
        listen 80;
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

```bash
# 部署应用
kubectl apply -f web-app-complete.yaml

# 查看部署状态
kubectl get all

# 查看部署详情
kubectl get pods -w

# 测试服务
kubectl port-forward svc/frontend-service 8080:80

# 查看日志
kubectl logs -l app=backend -f

# 清理
kubectl delete -f web-app-complete.yaml
```
