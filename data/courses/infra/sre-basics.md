# SRE 工程基础 三层深度学习教程

## [总览] 技术总览

SRE（Site Reliability Engineering）是 Google 提出的工程方法论，将软件工程方法应用于运维领域。核心目标是构建可靠、可扩展、高效的服务。关键概念包括 SLI/SLO/SLA、错误预算、事故管理、变更管理等。

本教程采用三层漏斗学习法：**核心层**聚焦 SLI/SLO/SLA、错误预算、事故响应三大基石；**重点层**深入变更管理和容量规划；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. SLI/SLO/SLA

#### [概念] 概念解释

- **SLI（Service Level Indicator）**：服务水平指标，衡量服务质量的量化指标
- **SLO（Service Level Objective）**：服务水平目标，SLI 的目标值
- **SLA（Service Level Agreement）**：服务水平协议，未达标的后果

#### [语法] 核心语法 / 命令 / API

| 概念 | 说明 | 示例 |
|------|------|------|
| SLI | 可用性指标 | 成功请求 / 总请求 |
| SLO | 目标值 | 99.9% 可用性 |
| SLA | 违约后果 | 退款或赔偿 |

#### [代码] 代码示例

```python
# SLO 计算和监控
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict
import math

@dataclass
class SLI:
    """服务水平指标"""
    name: str
    description: str
    query: str  # Prometheus 查询
    
@dataclass
class SLO:
    """服务水平目标"""
    name: str
    sli: SLI
    target: float  # 目标百分比
    window: timedelta  # 时间窗口
    
    @property
    def error_budget(self) -> float:
        """计算错误预算"""
        return 1 - self.target

class SLOMonitor:
    """SLO 监控器"""
    
    def __init__(self, slo: SLO):
        self.slo = slo
        self.events: List[Dict] = []
    
    def record_event(self, success: bool, timestamp: datetime = None):
        """记录事件"""
        self.events.append({
            'timestamp': timestamp or datetime.now(),
            'success': success
        })
    
    def calculate_sli(self, window: timedelta = None) -> float:
        """计算 SLI"""
        window = window or self.slo.window
        cutoff = datetime.now() - window
        
        recent_events = [e for e in self.events if e['timestamp'] >= cutoff]
        if not recent_events:
            return 1.0
        
        successful = sum(1 for e in recent_events if e['success'])
        return successful / len(recent_events)
    
    def get_error_budget_remaining(self) -> Dict:
        """获取剩余错误预算"""
        current_sli = self.calculate_sli()
        budget_used = max(0, self.slo.target - current_sli)
        budget_remaining = self.slo.error_budget - budget_used
        
        return {
            'current_sli': current_sli,
            'target_slo': self.slo.target,
            'error_budget_total': self.slo.error_budget,
            'error_budget_used': budget_used,
            'error_budget_remaining': budget_remaining,
            'error_budget_remaining_percent': (budget_remaining / self.slo.error_budget) * 100 if self.slo.error_budget > 0 else 0
        }

# 使用示例
availability_sli = SLI(
    name="availability",
    description="服务可用性",
    query="sum(rate(http_requests_total{status!~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
)

availability_slo = SLO(
    name="99.9% 可用性",
    sli=availability_sli,
    target=0.999,
    window=timedelta(days=30)
)

monitor = SLOMonitor(availability_slo)

# 模拟事件
import random
for _ in range(10000):
    monitor.record_event(success=random.random() < 0.9995)

print(monitor.get_error_budget_remaining())
```

```yaml
# Prometheus SLO 规则
groups:
  - name: slo_rules
    rules:
      # 可用性 SLI
      - record: slo:availability:ratio
        expr: |
          sum(rate(http_requests_total{status!~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m]))
      
      # 延迟 SLI (P95 < 200ms)
      - record: slo:latency:ratio
        expr: |
          sum(rate(http_request_duration_seconds_bucket{le="0.2"}[5m]))
          / sum(rate(http_request_duration_seconds_count[5m]))
      
      # 错误预算消耗速率
      - record: slo:error_budget:burn_rate
        expr: |
          (1 - slo:availability:ratio) 
          / (1 - 0.999)
      
      # 剩余错误预算
      - record: slo:error_budget:remaining
        expr: |
          1 - (
            (1 - avg_over_time(slo:availability:ratio[30d])) 
            / (1 - 0.999)
          )
```

#### [场景] 典型应用场景

- 定义服务质量目标
- 监控服务健康状态
- 制定错误预算策略

### 2. 错误预算

#### [概念] 概念解释

错误预算是 SLO 的补充概念，表示在给定时间窗口内可以容忍的故障量。错误预算用完后，应该停止新功能发布，专注于可靠性改进。

#### [语法] 核心语法 / 命令 / API

| 计算方式 | 公式 | 说明 |
|----------|------|------|
| 总预算 | 1 - SLO | 30天 99.9% = 43.2 分钟 |
| 消耗速率 | (1 - SLI) / (1 - SLO) | 速率 > 1 表示超支 |
| 剩余预算 | 总预算 - 已消耗 | 负值表示超标 |

#### [代码] 代码示例

```python
# 错误预算计算器
from dataclasses import dataclass
from datetime import timedelta

@dataclass
class ErrorBudget:
    """错误预算计算"""
    slo_target: float  # 如 0.999
    window_days: int = 30
    
    @property
    def total_budget_minutes(self) -> float:
        """总错误预算（分钟）"""
        total_minutes = self.window_days * 24 * 60
        return total_minutes * (1 - self.slo_target)
    
    @property
    def total_budget_seconds(self) -> float:
        """总错误预算（秒）"""
        return self.total_budget_minutes * 60
    
    def calculate_burn_rate(self, downtime_minutes: float, period_hours: float) -> float:
        """计算消耗速率"""
        # 速率 = 实际停机时间 / 预算允许的停机时间
        allowed_downtime = self.total_budget_minutes * (period_hours / (self.window_days * 24))
        return downtime_minutes / allowed_downtime
    
    def get_budget_status(self, used_budget_minutes: float) -> dict:
        """获取预算状态"""
        remaining = self.total_budget_minutes - used_budget_minutes
        remaining_percent = (remaining / self.total_budget_minutes) * 100
        
        if remaining_percent > 50:
            status = "healthy"
        elif remaining_percent > 20:
            status = "warning"
        elif remaining_percent > 0:
            status = "critical"
        else:
            status = "exhausted"
        
        return {
            'total_budget_minutes': self.total_budget_minutes,
            'used_budget_minutes': used_budget_minutes,
            'remaining_minutes': remaining,
            'remaining_percent': remaining_percent,
            'status': status
        }

# 使用示例
budget = ErrorBudget(slo_target=0.999, window_days=30)
print(f"30天错误预算: {budget.total_budget_minutes:.2f} 分钟")
print(f"30天错误预算: {budget.total_budget_seconds:.2f} 秒")

# 计算消耗速率
# 如果 1 小时内停机 5 分钟
burn_rate = budget.calculate_burn_rate(downtime_minutes=5, period_hours=1)
print(f"消耗速率: {burn_rate:.2f}x")

# 获取预算状态
status = budget.get_budget_status(used_budget_minutes=20)
print(f"预算状态: {status}")
```

```yaml
# 错误预算告警规则
groups:
  - name: error_budget_alerts
    rules:
      # 快速消耗告警（1小时内消耗 2% 预算）
      - alert: ErrorBudgetBurnRateHigh
        expr: slo:error_budget:burn_rate > 2
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "错误预算消耗过快"
          description: "消耗速率为 {{ $value }}，超过阈值 2"
      
      # 预算即将耗尽告警
      - alert: ErrorBudgetLow
        expr: slo:error_budget:remaining < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误预算即将耗尽"
          description: "剩余预算 {{ $value | humanizePercentage }}"
      
      # 预算耗尽告警
      - alert: ErrorBudgetExhausted
        expr: slo:error_budget:remaining <= 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "错误预算已耗尽"
          description: "服务已超出 SLO 目标"
```

#### [场景] 典型应用场景

- 决定是否发布新功能
- 评估可靠性投资优先级
- 平衡速度和稳定性

### 3. 事故响应

#### [概念] 概念解释

事故响应是处理服务中断或降级的标准化流程。包括事故分级、角色分工、沟通机制、复盘改进等环节。

#### [语法] 核心语法 / 命令 / API

| 事故级别 | 定义 | 响应时间 | 示例 |
|----------|------|----------|------|
| SEV1 | 完全不可用 | 5分钟 | 服务宕机 |
| SEV2 | 部分不可用 | 30分钟 | 部分功能故障 |
| SEV3 | 性能下降 | 2小时 | 响应变慢 |
| SEV4 | 小问题 | 1工作日 | 非关键功能异常 |

#### [代码] 代码示例

```python
# 事故管理流程
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Optional
import json

class Severity(Enum):
    SEV1 = "SEV1"  # Critical
    SEV2 = "SEV2"  # Major
    SEV3 = "SEV3"  # Minor
    SEV4 = "SEV4"  # Low

@dataclass
class Incident:
    """事故记录"""
    id: str
    title: str
    severity: Severity
    status: str = "investigating"  # investigating, identified, monitoring, resolved
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    
    # 角色分工
    incident_commander: Optional[str] = None
    communication_lead: Optional[str] = None
    operations_lead: Optional[str] = None
    
    # 时间线
    timeline: List[dict] = field(default_factory=list)
    
    # 影响
    affected_services: List[str] = field(default_factory=list)
    customer_impact: str = ""
    
    # 根因
    root_cause: str = ""
    resolution: str = ""
    
    def add_timeline_event(self, event: str, author: str):
        """添加时间线事件"""
        self.timeline.append({
            'timestamp': datetime.now().isoformat(),
            'event': event,
            'author': author
        })
        self.updated_at = datetime.now()
    
    def resolve(self, root_cause: str, resolution: str):
        """解决事故"""
        self.status = "resolved"
        self.root_cause = root_cause
        self.resolution = resolution
        self.resolved_at = datetime.now()
        self.updated_at = datetime.now()
    
    @property
    def duration_minutes(self) -> Optional[int]:
        """事故持续时间"""
        if self.resolved_at:
            return int((self.resolved_at - self.created_at).total_seconds() / 60)
        return None
    
    def to_status_message(self) -> str:
        """生成状态消息"""
        return f"""
【事故通报】{self.title}
级别: {self.severity.value}
状态: {self.status}
时间: {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}

影响范围: {', '.join(self.affected_services)}
客户影响: {self.customer_impact}

当前负责人:
- 事故指挥: {self.incident_commander or '待指定'}
- 沟通负责人: {self.communication_lead or '待指定'}
- 运维负责人: {self.operations_lead or '待指定'}

时间线:
{chr(10).join(f"- {e['timestamp']}: {e['event']}" for e in self.timeline[-5:])}
"""

class IncidentManager:
    """事故管理器"""
    
    def __init__(self):
        self.incidents: List[Incident] = []
    
    def create_incident(self, title: str, severity: Severity, 
                       affected_services: List[str], customer_impact: str) -> Incident:
        """创建事故"""
        incident = Incident(
            id=f"INC-{len(self.incidents) + 1:04d}",
            title=title,
            severity=severity,
            affected_services=affected_services,
            customer_impact=customer_impact
        )
        incident.add_timeline_event("事故创建", "system")
        self.incidents.append(incident)
        return incident
    
    def get_active_incidents(self) -> List[Incident]:
        """获取活跃事故"""
        return [i for i in self.incidents if i.status != "resolved"]

# 使用示例
manager = IncidentManager()

# 创建事故
incident = manager.create_incident(
    title="API 服务不可用",
    severity=Severity.SEV1,
    affected_services=["api-gateway", "user-service"],
    customer_impact="用户无法登录和使用服务"
)

# 分配角色
incident.incident_commander = "张三"
incident.communication_lead = "李四"
incident.operations_lead = "王五"

# 添加时间线
incident.add_timeline_event("开始调查", "王五")
incident.add_timeline_event("发现问题: 数据库连接池耗尽", "王五")
incident.add_timeline_event("扩容数据库连接池", "王五")

# 解决事故
incident.resolve(
    root_cause="数据库连接池配置过小，高峰期连接耗尽",
    resolution="扩大连接池大小，添加连接池监控告警"
)

print(incident.to_status_message())
print(f"事故持续时间: {incident.duration_minutes} 分钟")
```

#### [场景] 典型应用场景

- 服务故障响应
- 重大事件处理
- 团队协作和沟通

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 变更管理

#### [概念] 概念与解决的问题

变更管理是控制服务变更风险的流程。包括变更审批、灰度发布、回滚机制等。良好的变更管理可以减少因变更导致的事故。

#### [语法] 核心用法

| 变更类型 | 风险等级 | 审批要求 |
|----------|----------|----------|
| 标准变更 | 低 | 自动审批 |
| 正常变更 | 中 | 团队审批 |
| 紧急变更 | 高 | 紧急审批流程 |

#### [代码] 代码示例

```yaml
# GitOps 变更管理流程

# 1. 变更请求模板 (PR Template)
## 变更描述
<!-- 描述本次变更的内容 -->

## 变更类型
- [ ] 功能更新
- [ ] Bug 修复
- [ ] 配置变更
- [ ] 基础设施变更

## 风险评估
- 影响范围: 
- 回滚方案: 
- 测试情况: 

## 检查清单
- [ ] 代码已通过 Code Review
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 变更已通知相关团队
- [ ] 监控告警已配置

# 2. 变更审批工作流
name: Change Approval

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: |
          npm test
          npm run integration-test
      
      - name: Security Scan
        run: npm audit
      
      - name: Check SLO Impact
        run: |
          # 检查当前错误预算
          BUDGET=$(curl -s http://prometheus/api/v1/query?query=slo:error_budget:remaining | jq '.data.result[0].value[1]')
          if (( $(echo "$BUDGET < 0.1" | bc -l) )); then
            echo "错误预算不足，暂停变更"
            exit 1
          fi
  
  approve:
    needs: validate
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - name: Require Approval
        uses: hmarr/auto-approve-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          review-message: "Auto-approved after validation passed"
```

#### [关联] 与核心层的关联

变更管理是错误预算策略的执行层面，控制变更风险保护 SLO。

### 2. 容量规划

#### [概念] 概念与解决的问题

容量规划预测未来资源需求，确保服务有足够资源处理负载。包括负载预测、资源评估、扩容计划等。

#### [语法] 核心用法

```python
# 容量规划工具
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class CapacityMetrics:
    """容量指标"""
    timestamp: float
    cpu_usage: float
    memory_usage: float
    request_rate: float
    active_users: int

class CapacityPlanner:
    """容量规划器"""
    
    def __init__(self, history: List[CapacityMetrics]):
        self.history = history
    
    def predict_growth(self, days: int = 30) -> Tuple[float, float]:
        """预测增长率"""
        if len(self.history) < 2:
            return 0, 0
        
        # 简单线性回归
        x = np.array([m.timestamp for m in self.history])
        y_cpu = np.array([m.cpu_usage for m in self.history])
        y_mem = np.array([m.memory_usage for m in self.history])
        
        # 计算趋势
        cpu_slope = np.polyfit(x, y_cpu, 1)[0]
        mem_slope = np.polyfit(x, y_mem, 1)[0]
        
        # 预测未来值
        future_timestamp = self.history[-1].timestamp + days * 86400
        cpu_growth = cpu_slope * days * 86400
        mem_growth = mem_slope * days * 86400
        
        return cpu_growth, mem_growth
    
    def calculate_required_resources(self, 
                                     target_cpu: float = 0.7,
                                     target_memory: float = 0.8) -> dict:
        """计算所需资源"""
        current_cpu = self.history[-1].cpu_usage
        current_memory = self.history[-1].memory_usage
        
        # 当前实例数量
        current_instances = 10
        
        # 计算需要的实例数
        required_by_cpu = current_instances * (current_cpu / target_cpu)
        required_by_memory = current_instances * (current_memory / target_memory)
        
        recommended_instances = max(required_by_cpu, required_by_memory)
        
        return {
            'current_instances': current_instances,
            'current_cpu_usage': current_cpu,
            'current_memory_usage': current_memory,
            'recommended_instances': int(np.ceil(recommended_instances)),
            'scale_factor': recommended_instances / current_instances
        }
    
    def generate_report(self) -> str:
        """生成容量报告"""
        cpu_growth, mem_growth = self.predict_growth(30)
        resources = self.calculate_required_resources()
        
        return f"""
容量规划报告
============

当前状态:
- CPU 使用率: {resources['current_cpu_usage']:.1%}
- 内存使用率: {resources['current_memory_usage']:.1%}
- 当前实例数: {resources['current_instances']}

30天预测:
- CPU 增长: {cpu_growth:.1%}
- 内存增长: {mem_growth:.1%}

建议:
- 推荐实例数: {resources['recommended_instances']}
- 扩容比例: {resources['scale_factor']:.1f}x
"""
```

#### [代码] 代码示例

```yaml
# Kubernetes 自动扩容配置

# 水平 Pod 自动伸缩
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60

# 集群自动伸缩
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
spec:
  template:
    spec:
      containers:
        - name: cluster-autoscaler
          image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
          command:
            - ./cluster-autoscaler
            - --scale-down-unneeded-time=10m
            - --scale-down-delay-after-add=10m
            - --scale-down-delay-after-failure=3m
            - --scale-down-delay-after-delete=10s
```

#### [关联] 与核心层的关联

容量规划确保服务有足够资源满足 SLO 要求。

### 3. 事故复盘

#### [概念] 概念与解决的问题

事故复盘（Postmortem）是事故后的分析和改进过程。目标是找出根因、制定改进措施、防止类似问题再次发生。遵循"无责复盘"原则。

#### [语法] 核心用法

```markdown
# 事故复盘模板

## 基本信息
- 事故 ID: INC-0001
- 标题: API 服务不可用
- 发生时间: 2024-01-15 10:00 - 10:45
- 持续时间: 45 分钟
- 影响范围: 所有用户
- 事故级别: SEV1

## 时间线
| 时间 | 事件 | 负责人 |
|------|------|--------|
| 10:00 | 监控告警触发 | 系统 |
| 10:02 | 值班人员确认问题 | 张三 |
| 10:05 | 升级为 SEV1，启动事故响应 | 张三 |
| 10:10 | 定位问题：数据库连接池耗尽 | 李四 |
| 10:20 | 实施临时修复：重启服务 | 李四 |
| 10:30 | 服务恢复，进入监控 | 王五 |
| 10:45 | 确认服务稳定，关闭事故 | 王五 |

## 根因分析
### 直接原因
数据库连接池配置过小（最大连接数 100）

### 根本原因
1. 配置未根据业务增长调整
2. 缺少连接池使用率监控
3. 压力测试未覆盖高并发场景

### 五问法
1. 为什么服务不可用？ -> 数据库连接失败
2. 为什么连接失败？ -> 连接池耗尽
3. 为什么连接池耗尽？ -> 连接数配置过小
4. 为什么配置过小？ -> 未根据业务增长调整
5. 为什么未调整？ -> 缺少监控和容量规划

## 影响评估
- 用户影响: 约 10 万用户无法访问服务
- 业务影响: 估计损失 50 万订单
- 声誉影响: 社交媒体负面反馈

## 改进措施
| 措施 | 负责人 | 截止日期 | 状态 |
|------|--------|----------|------|
| 增加数据库连接池大小 | 李四 | 2024-01-16 | 完成 |
| 添加连接池监控告警 | 王五 | 2024-01-17 | 进行中 |
| 更新容量规划流程 | 张三 | 2024-01-20 | 待开始 |
| 增加高并发压测场景 | 李四 | 2024-01-25 | 待开始 |

## 经验教训
### 做得好的
- 事故响应流程执行顺利
- 团队协作高效

### 需要改进的
- 监控覆盖不足
- 容量规划滞后

### 行动项
- 完善监控体系
- 建立定期容量评审机制
```

#### [关联] 与核心层的关联

事故复盘是事故响应的闭环，通过持续改进提升服务可靠性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Toil | 重复性运维工作 |
| On-call | 值班制度 |
| Runbook | 运维手册 |
| Chaos Engineering | 混沌工程 |
| Incident Command | 事故指挥系统 |
| Blameless | 无责文化 |
| MTTR | 平均恢复时间 |
| MTBF | 平均故障间隔 |
| Canary Release | 金丝雀发布 |
| Feature Flag | 功能开关 |

---

## [实战] 核心实战清单

### 实战任务 1：建立完整的 SLO 体系

为一个 Web 服务建立完整的 SLO 体系：

1. 定义关键 SLI（可用性、延迟、吞吐量）
2. 设置 SLO 目标和错误预算
3. 配置监控和告警
4. 建立事故响应流程
5. 制定复盘改进机制

```python
# 完整 SLO 配置示例
slo_config = {
    'service': 'web-api',
    'slos': [
        {
            'name': 'availability',
            'description': '服务可用性',
            'target': 0.999,
            'window_days': 30,
            'sli_query': 'sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))',
            'alerting': {
                'burn_rate_threshold': 2,
                'budget_remaining_threshold': 0.1
            }
        },
        {
            'name': 'latency_p95',
            'description': 'P95 延迟 < 200ms',
            'target': 0.99,
            'window_days': 30,
            'sli_query': 'sum(rate(http_request_duration_seconds_bucket{le="0.2"}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))'
        }
    ]
}
```
