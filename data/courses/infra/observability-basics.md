# 可观测性基础 三层深度学习教程

## [总览] 技术总览

可观测性（Observability）是通过系统外部输出推断系统内部状态的能力，包含三大支柱：指标（Metrics）、日志（Logs）、追踪（Traces）。良好的可观测性是现代分布式系统运维的基础，帮助快速定位问题、优化性能。

本教程采用三层漏斗学习法：**核心层**聚焦指标监控、日志收集、告警配置三大基石；**重点层**深入分布式追踪和可视化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 指标监控

#### [概念] 概念解释

指标是系统状态的数值表示，包括计数器（Counter）、计量器（Gauge）、直方图（Histogram）等类型。通过指标可以监控系统健康状态、性能趋势。

#### [语法] 核心语法 / 命令 / API

| 指标类型 | 说明 | 示例 |
|----------|------|------|
| Counter | 只增不减的累计值 | 请求总数、错误总数 |
| Gauge | 可增可减的瞬时值 | 内存使用、CPU 使用率 |
| Histogram | 分布统计 | 请求延迟分布 |
| Summary | 分位数统计 | P50、P95、P99 延迟 |

#### [代码] 代码示例

```python
# Prometheus Python 客户端
from prometheus_client import Counter, Gauge, Histogram, start_http_server
import random
import time

# 定义指标
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

MEMORY_USAGE = Gauge(
    'process_memory_bytes',
    'Process memory usage in bytes'
)

# 使用示例
def handle_request(method, endpoint):
    start_time = time.time()
    
    try:
        # 模拟请求处理
        time.sleep(random.uniform(0.1, 0.5))
        status = 200
    except Exception:
        status = 500
    
    # 记录指标
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(time.time() - start_time)
    
    return status

# 更新 Gauge 指标
def update_gauges():
    import psutil
    MEMORY_USAGE.set(psutil.Process().memory_info().rss)
    ACTIVE_CONNECTIONS.set(random.randint(10, 100))

# 启动指标服务
if __name__ == '__main__':
    start_http_server(8000)
    while True:
        handle_request('GET', '/api/users')
        update_gauges()
        time.sleep(1)
```

```yaml
# Prometheus 配置文件
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'app'
    static_configs:
      - targets: ['app1:8000', 'app2:8000']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node1:9100', 'node2:9100']

# 告警规则
rule_files:
  - 'alerts.yml'
```

#### [场景] 典型应用场景

- 监控服务健康状态
- 性能瓶颈分析
- 容量规划和预测

### 2. 日志收集

#### [概念] 概念解释

日志记录系统运行过程中的事件和错误信息。结构化日志便于搜索和分析，是故障排查的重要依据。

#### [语法] 核心语法 / 命令 / API

| 日志级别 | 说明 | 使用场景 |
|----------|------|----------|
| DEBUG | 调试信息 | 开发调试 |
| INFO | 一般信息 | 正常操作 |
| WARN | 警告信息 | 潜在问题 |
| ERROR | 错误信息 | 需要处理的问题 |
| FATAL | 致命错误 | 系统崩溃 |

#### [代码] 代码示例

```python
# Python 结构化日志
import logging
import json
import sys
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # 添加额外字段
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        # 添加异常信息
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# 配置日志
logger = logging.getLogger('app')
logger.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# 使用示例
def process_order(order_id, user_id):
    logger.info(
        'Processing order',
        extra={'request_id': 'req-123', 'user_id': user_id}
    )
    
    try:
        # 业务逻辑
        result = do_something(order_id)
        logger.info(
            'Order processed successfully',
            extra={'request_id': 'req-123', 'order_id': order_id}
        )
        return result
    except Exception as e:
        logger.error(
            'Failed to process order',
            extra={'request_id': 'req-123', 'order_id': order_id},
            exc_info=True
        )
        raise
```

```yaml
# Fluentd 配置 - 收集并转发日志
<source>
  @type tail
  path /var/log/app/*.log
  pos_file /var/log/fluentd/app.log.pos
  tag app
  format json
  time_key timestamp
  time_format %Y-%m-%dT%H:%M:%S.%NZ
</source>

<filter app.**>
  @type parser
  key_name message
  reserve_data true
  <parse>
    @type json
  </parse>
</filter>

<match app.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name app-logs
  type_name _doc
  logstash_format true
  logstash_prefix app
  <buffer>
    @type file
    path /var/log/fluentd/buffer
    flush_interval 10s
  </buffer>
</match>
```

#### [场景] 典型应用场景

- 错误日志收集和分析
- 审计日志记录
- 安全事件追踪

### 3. 告警配置

#### [概念] 概念解释

告警系统在指标超过阈值或特定事件发生时通知相关人员。合理的告警配置可以及时发现和处理问题，避免告警疲劳。

#### [语法] 核心语法 / 命令 / API

| 告警级别 | 说明 | 响应时间 |
|----------|------|----------|
| Critical | 严重故障 | 立即响应 |
| Warning | 警告 | 24小时内 |
| Info | 信息通知 | 无需响应 |

#### [代码] 代码示例

```yaml
# Prometheus 告警规则
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"

      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          description: "{{ $labels.instance }} has been down for more than 1 minute."

      - alert: MemoryUsageHigh
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) 
          / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
```

```yaml
# Alertmanager 配置
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'

  - name: 'critical'
    email_configs:
      - to: 'oncall@example.com'
    pagerduty_configs:
      - service_key: 'your-service-key'
    slack_configs:
      - channel: '#alerts-critical'
        send_resolved: true

  - name: 'warning'
    email_configs:
      - to: 'team@example.com'
    slack_configs:
      - channel: '#alerts-warning'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

#### [场景] 典型应用场景

- 服务可用性监控
- 性能异常告警
- 资源使用告警

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 分布式追踪

#### [概念] 概念与解决的问题

分布式追踪记录请求在微服务间的调用链路，帮助定位性能瓶颈和故障点。遵循 OpenTelemetry 标准。

#### [语法] 核心用法

```python
# OpenTelemetry Python 追踪
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from flask import Flask, request
import requests

# 配置追踪
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# 配置导出器
otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4317")
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

# 自动埋点
FlaskInstrumentor().instrument()
RequestsInstrumentor().instrument()

app = Flask(__name__)

@app.route('/api/users')
def get_users():
    with tracer.start_as_current_span("get_users") as span:
        span.set_attribute("user.id", request.headers.get("X-User-ID"))
        
        # 调用下游服务
        response = requests.get("http://user-service/users")
        
        span.set_attribute("users.count", len(response.json()))
        return response.json()

@app.route('/api/orders')
def get_orders():
    with tracer.start_as_current_span("get_orders") as span:
        # 调用多个下游服务
        users = requests.get("http://user-service/users").json()
        orders = requests.get("http://order-service/orders").json()
        
        span.set_attribute("orders.count", len(orders))
        return {"users": users, "orders": orders}
```

#### [代码] 代码示例

```yaml
# Jaeger 部署配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
        - name: jaeger
          image: jaegertracing/all-in-one:latest
          ports:
            - containerPort: 16686  # UI
            - containerPort: 4317   # OTLP gRPC
            - containerPort: 4318   # OTLP HTTP
          env:
            - name: COLLECTOR_OTLP_ENABLED
              value: "true"
---
apiVersion: v1
kind: Service
metadata:
  name: jaeger
spec:
  selector:
    app: jaeger
  ports:
    - name: ui
      port: 16686
      targetPort: 16686
    - name: otlp-grpc
      port: 4317
      targetPort: 4317
```

#### [关联] 与核心层的关联

分布式追踪与指标、日志结合，形成完整的可观测性体系。

### 2. 可视化仪表板

#### [概念] 概念与解决的问题

可视化仪表板将指标、日志、追踪数据以图形方式展示，便于快速了解系统状态和趋势分析。

#### [语法] 核心用法

```json
// Grafana 仪表板配置
{
  "dashboard": {
    "title": "Application Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8}
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8}
      },
      {
        "title": "Latency P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8}
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory %"
          }
        ],
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8},
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 70},
                {"color": "red", "value": 90}
              ]
            },
            "unit": "percent"
          }
        }
      }
    ]
  }
}
```

#### [代码] 代码示例

```yaml
# Grafana 数据源配置
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686

# Grafana Dashboard Provider
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards
```

#### [关联] 与核心层的关联

仪表板是指标和日志的展示层，帮助运维人员快速定位问题。

### 3. 日志聚合与分析

#### [概念] 概念与解决的问题

日志聚合将分散的日志集中存储，支持全文搜索和复杂查询，便于故障排查和安全审计。

#### [语法] 核心用法

```yaml
# Loki 日志聚合配置
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h

# Promtail 日志采集配置
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app
    static_configs:
      - targets:
          - localhost
        labels:
          job: app
          __path__: /var/log/app/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            message: message
            timestamp: timestamp
      - labels:
          level:
      - timestamp:
          source: timestamp
          format: RFC3339
```

#### [代码] 代码示例

```python
# LogQL 查询示例

# 查询错误日志
{job="app"} |= "error" | json | level = "ERROR"

# 统计错误数量
sum(count_over_time({job="app"} |= "error" [1h]))

# 查询特定请求的日志
{job="app"} | json | request_id = "req-123"

# 解析并过滤
{job="app"} 
  | regexp `(?P<method>\w+) (?P<path>/\S+) (?P<status>\d+)`
  | status >= 500

# 聚合分析
sum by (status) (
  count_over_time({job="app"} | regexp `(?P<status>\d{3})` | status != "" [5m])
)
```

#### [关联] 与核心层的关联

日志聚合是日志收集的延伸，提供更强大的查询和分析能力。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| OpenTelemetry | 统一可观测性标准 |
| SLI/SLO | 服务水平指标和目标 |
| Error Budget | 错误预算管理 |
| APM | 应用性能监控 |
| Synthetic Monitoring | 合成监控 |
| Log Analytics | 日志分析平台 |
| Time Series DB | 时序数据库 |
| Alert Fatigue | 告警疲劳处理 |
| Runbook | 运维手册自动化 |
| Incident Management | 事件管理流程 |

---

## [实战] 核心实战清单

### 实战任务 1：搭建完整可观测性平台

使用 Prometheus + Grafana + Loki + Jaeger 搭建完整的可观测性平台：

```yaml
# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail.yml:/etc/promtail/config.yml
      
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "4317:4317"
      - "4318:4318"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

volumes:
  grafana-data:
```
