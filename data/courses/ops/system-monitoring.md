# 系统监控 三层深度学习教程

## [总览] 技术总览

系统监控是运维的核心能力，通过收集和分析系统指标，及时发现和解决问题。监控对象包括服务器、网络、应用、数据库等。主流工具包括 Prometheus、Grafana、Zabbix、Nagios 等。

本教程采用三层漏斗学习法：**核心层**聚焦指标采集、告警配置、可视化展示三大基石；**重点层**深入监控架构和故障排查；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 指标采集

#### [概念] 概念解释

指标采集是监控系统的基础，收集 CPU、内存、磁盘、网络等系统指标，以及应用层面的自定义指标。采集方式包括拉取式和推送式。

#### [语法] 核心语法 / 命令 / API

| 指标类型 | 说明 | 常用指标 |
|----------|------|----------|
| Counter | 只增不减 | 请求总数、错误总数 |
| Gauge | 可增可减 | 内存使用、CPU 使用率 |
| Histogram | 分布统计 | 请求延迟分布 |
| Summary | 分位数 | P50、P95、P99 |

#### [代码] 代码示例

```python
# Prometheus 指标采集示例
from prometheus_client import Counter, Gauge, Histogram, start_http_server
import psutil
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

CPU_USAGE = Gauge('system_cpu_usage', 'CPU usage percentage')
MEMORY_USAGE = Gauge('system_memory_usage_bytes', 'Memory usage in bytes')
DISK_USAGE = Gauge('system_disk_usage_bytes', 'Disk usage in bytes', ['mount_point'])

# 系统指标采集
def collect_system_metrics():
    """采集系统指标"""
    # CPU 使用率
    CPU_USAGE.set(psutil.cpu_percent(interval=1))
    
    # 内存使用
    memory = psutil.virtual_memory()
    MEMORY_USAGE.set(memory.used)
    
    # 磁盘使用
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            DISK_USAGE.labels(mount_point=partition.mountpoint).set(usage.used)
        except PermissionError:
            pass

# Node Exporter 风格的指标
class SystemMetricsCollector:
    """系统指标收集器"""
    
    def __init__(self):
        self.metrics = {}
    
    def collect_cpu_metrics(self) -> dict:
        """收集 CPU 指标"""
        cpu_times = psutil.cpu_times()
        cpu_percent = psutil.cpu_percent(percpu=True)
        
        return {
            'cpu_user': cpu_times.user,
            'cpu_system': cpu_times.system,
            'cpu_idle': cpu_times.idle,
            'cpu_percent': cpu_percent,
            'cpu_count': psutil.cpu_count()
        }
    
    def collect_memory_metrics(self) -> dict:
        """收集内存指标"""
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'memory_total': mem.total,
            'memory_available': mem.available,
            'memory_used': mem.used,
            'memory_percent': mem.percent,
            'swap_total': swap.total,
            'swap_used': swap.used,
            'swap_percent': swap.percent
        }
    
    def collect_disk_metrics(self) -> dict:
        """收集磁盘指标"""
        metrics = {}
        
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                metrics[partition.mountpoint] = {
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'percent': usage.percent
                }
            except PermissionError:
                continue
        
        # 磁盘 IO
        io_counters = psutil.disk_io_counters()
        if io_counters:
            metrics['io'] = {
                'read_bytes': io_counters.read_bytes,
                'write_bytes': io_counters.write_bytes,
                'read_count': io_counters.read_count,
                'write_count': io_counters.write_count
            }
        
        return metrics
    
    def collect_network_metrics(self) -> dict:
        """收集网络指标"""
        net_io = psutil.net_io_counters()
        
        return {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv,
            'errin': net_io.errin,
            'errout': net_io.errout,
            'dropin': net_io.dropin,
            'dropout': net_io.dropout
        }
    
    def collect_process_metrics(self) -> dict:
        """收集进程指标"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'cpu_percent': proc.info['cpu_percent'],
                    'memory_percent': proc.info['memory_percent']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        # 按内存排序
        processes.sort(key=lambda x: x['memory_percent'], reverse=True)
        
        return {
            'total_processes': len(processes),
            'top_by_memory': processes[:10]
        }

# Prometheus 配置
"""
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node1:9100', 'node2:9100']

  - job_name: 'app'
    static_configs:
      - targets: ['app1:8000', 'app2:8000']
"""

# 启动指标服务
if __name__ == '__main__':
    start_http_server(8000)
    
    while True:
        collect_system_metrics()
        time.sleep(15)
```

#### [场景] 典型应用场景

- 服务器性能监控
- 应用性能监控
- 容量规划

### 2. 告警配置

#### [概念] 概念解释

告警系统在指标超过阈值时通知相关人员。合理的告警配置可以及时发现和处理问题，避免告警疲劳。

#### [语法] 核心语法 / 命令 / API

```yaml
# Prometheus 告警规则
groups:
  - name: system_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Disk {{ $labels.mountpoint }} has only {{ $value }}% free"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

# Alertmanager 配置
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'

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

  - name: 'warning'
    email_configs:
      - to: 'team@example.com'
    slack_configs:
      - channel: '#alerts-warning'
```

#### [代码] 代码示例

```python
# 自定义告警管理器
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime
from enum import Enum

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

@dataclass
class Alert:
    alert_id: str
    name: str
    severity: AlertSeverity
    message: str
    labels: Dict[str, str]
    starts_at: datetime
    ends_at: datetime = None
    status: str = "firing"

class AlertManager:
    """告警管理器"""
    
    def __init__(self):
        self.alerts: List[Alert] = []
        self.silences: List[dict] = []
    
    def create_alert(self, name: str, severity: AlertSeverity, 
                    message: str, labels: dict) -> Alert:
        """创建告警"""
        alert = Alert(
            alert_id=f"alert-{len(self.alerts) + 1}",
            name=name,
            severity=severity,
            message=message,
            labels=labels,
            starts_at=datetime.now()
        )
        
        self.alerts.append(alert)
        self._send_notification(alert)
        
        return alert
    
    def resolve_alert(self, alert_id: str):
        """解决告警"""
        for alert in self.alerts:
            if alert.alert_id == alert_id and alert.status == "firing":
                alert.status = "resolved"
                alert.ends_at = datetime.now()
    
    def add_silence(self, matchers: dict, duration_hours: int, reason: str):
        """添加静默"""
        self.silences.append({
            'matchers': matchers,
            'duration_hours': duration_hours,
            'reason': reason,
            'created_at': datetime.now()
        })
    
    def is_silenced(self, alert: Alert) -> bool:
        """检查告警是否被静默"""
        for silence in self.silences:
            if self._matches_silence(alert, silence):
                return True
        return False
    
    def _matches_silence(self, alert: Alert, silence: dict) -> bool:
        """检查告警是否匹配静默规则"""
        for key, value in silence['matchers'].items():
            if alert.labels.get(key) != value:
                return False
        return True
    
    def _send_notification(self, alert: Alert):
        """发送通知"""
        if self.is_silenced(alert):
            return
        
        # 根据严重程度选择通知渠道
        if alert.severity == AlertSeverity.CRITICAL:
            self._send_critical_notification(alert)
        elif alert.severity == AlertSeverity.WARNING:
            self._send_warning_notification(alert)
    
    def _send_critical_notification(self, alert: Alert):
        """发送严重告警通知"""
        # 发送邮件、Slack、短信等
        print(f"[CRITICAL] {alert.name}: {alert.message}")
    
    def _send_warning_notification(self, alert: Alert):
        """发送警告通知"""
        print(f"[WARNING] {alert.name}: {alert.message}")
    
    def get_active_alerts(self) -> List[Alert]:
        """获取活跃告警"""
        return [a for a in self.alerts if a.status == "firing"]
```

#### [场景] 典型应用场景

- 服务可用性监控
- 性能异常告警
- 资源使用告警

### 3. 可视化展示

#### [概念] 概念解释

可视化将监控数据以图表形式展示，便于快速了解系统状态。Grafana 是最流行的可视化平台，支持多种数据源。

#### [语法] 核心语法 / 命令 / API

```json
// Grafana Dashboard 配置
{
  "dashboard": {
    "title": "System Monitoring",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{ instance }}"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8}
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "targets": [
          {
            "expr": "(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100",
            "legendFormat": "Memory %"
          }
        ],
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8},
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
      },
      {
        "title": "Network Traffic",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total{device!=\"lo\"}[5m])",
            "legendFormat": "Receive - {{ device }}"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total{device!=\"lo\"}[5m])",
            "legendFormat": "Transmit - {{ device }}"
          }
        ],
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8}
      },
      {
        "title": "Disk I/O",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_disk_read_bytes_total[5m])",
            "legendFormat": "Read"
          },
          {
            "expr": "rate(node_disk_written_bytes_total[5m])",
            "legendFormat": "Write"
          }
        ],
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8}
      }
    ]
  }
}
```

#### [场景] 典型应用场景

- 运维仪表板
- 业务监控大屏
- 性能分析报告

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 监控架构

#### [概念] 概念与解决的问题

监控架构设计影响系统的可扩展性和可靠性。包括数据采集、存储、查询、展示、告警等组件的选型和部署。

#### [语法] 核心用法

```yaml
# 完整监控架构示例
# Prometheus + Grafana + Alertmanager + Node Exporter

# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'

volumes:
  prometheus-data:
  grafana-data:
```

#### [关联] 与核心层的关联

监控架构是指标采集、告警、可视化的集成方案。

### 2. 故障排查

#### [概念] 概念与解决的问题

故障排查利用监控数据定位和解决问题。需要建立系统化的排查流程和工具链。

#### [语法] 核心用法

```python
# 故障排查工具
class TroubleshootingToolkit:
    """故障排查工具集"""
    
    def __init__(self):
        self.metrics_collector = SystemMetricsCollector()
    
    def diagnose_high_cpu(self) -> dict:
        """诊断高 CPU 问题"""
        # 获取 CPU 使用情况
        cpu_percent = psutil.cpu_percent(percpu=True)
        
        # 获取进程 CPU 使用
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'cpu': proc.info['cpu_percent']
                })
            except:
                continue
        
        processes.sort(key=lambda x: x['cpu'], reverse=True)
        
        return {
            'cpu_per_core': cpu_percent,
            'avg_cpu': sum(cpu_percent) / len(cpu_percent),
            'top_processes': processes[:10]
        }
    
    def diagnose_high_memory(self) -> dict:
        """诊断高内存问题"""
        mem = psutil.virtual_memory()
        
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'memory_percent', 'memory_info']):
            try:
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'memory_percent': proc.info['memory_percent'],
                    'memory_rss': proc.info['memory_info'].rss
                })
            except:
                continue
        
        processes.sort(key=lambda x: x['memory_percent'], reverse=True)
        
        return {
            'total_memory': mem.total,
            'available_memory': mem.available,
            'used_percent': mem.percent,
            'top_processes': processes[:10]
        }
    
    def diagnose_disk_issue(self) -> dict:
        """诊断磁盘问题"""
        issues = []
        
        # 检查磁盘空间
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                if usage.percent > 90:
                    issues.append({
                        'type': 'disk_space',
                        'mount_point': partition.mountpoint,
                        'percent_used': usage.percent
                    })
            except:
                continue
        
        # 检查磁盘 IO
        io_counters = psutil.disk_io_counters()
        
        return {
            'issues': issues,
            'io_stats': {
                'read_bytes': io_counters.read_bytes,
                'write_bytes': io_counters.write_bytes
            }
        }
    
    def diagnose_network_issue(self) -> dict:
        """诊断网络问题"""
        net_io = psutil.net_io_counters()
        
        # 检查网络连接
        connections = psutil.net_connections()
        
        # 统计连接状态
        status_count = {}
        for conn in connections:
            status = conn.status
            status_count[status] = status_count.get(status, 0) + 1
        
        return {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'connection_status': status_count,
            'total_connections': len(connections)
        }
    
    def generate_diagnostic_report(self) -> dict:
        """生成诊断报告"""
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu': self.diagnose_high_cpu(),
            'memory': self.diagnose_high_memory(),
            'disk': self.diagnose_disk_issue(),
            'network': self.diagnose_network_issue()
        }
```

#### [关联] 与核心层的关联

故障排查基于监控数据进行问题定位。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| APM | 应用性能监控 |
| Distributed Tracing | 分布式追踪 |
| Service Mesh | 服务网格监控 |
| Log Aggregation | 日志聚合 |
| Anomaly Detection | 异常检测 |
| Capacity Planning | 容量规划 |
| SLA Monitoring | SLA 监控 |
| Synthetic Monitoring | 合成监控 |
| Real User Monitoring | 真实用户监控 |
| Business Metrics | 业务指标监控 |

---

## [实战] 核心实战清单

### 实战任务 1：构建完整监控系统

使用 Prometheus + Grafana 构建完整的监控系统：

```python
# 完整监控部署脚本
def deploy_monitoring_stack():
    """部署监控栈"""
    
    # 1. 部署 Prometheus
    deploy_prometheus()
    
    # 2. 部署 Grafana
    deploy_grafana()
    
    # 3. 部署 Alertmanager
    deploy_alertmanager()
    
    # 4. 部署 Node Exporter
    deploy_node_exporter()
    
    # 5. 配置告警规则
    configure_alert_rules()
    
    # 6. 导入 Grafana Dashboard
    import_grafana_dashboards()
    
    return "Monitoring stack deployed successfully"
```
