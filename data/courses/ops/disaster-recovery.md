# 灾备与恢复 三层深度学习教程

## [总览] 技术总览

灾备与恢复（Disaster Recovery）确保业务在灾难发生后能够快速恢复。涵盖备份策略、容灾架构、故障切换、恢复演练等内容。RTO（恢复时间目标）和 RPO（恢复点目标）是核心指标。

本教程采用三层漏斗学习法：**核心层**聚焦备份策略、容灾架构、故障切换三大基石；**重点层**深入恢复演练和业务连续性；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 备份策略

#### [概念] 概念解释

备份策略定义数据备份的方式、频率、保留周期。常见备份类型包括全量备份、增量备份、差异备份。备份策略需要平衡存储成本和恢复时间。

#### [语法] 核心语法 / 命令 / API

| 备份类型 | 说明 | 优点 | 缺点 |
|----------|------|------|------|
| 全量备份 | 备份所有数据 | 恢复快 | 占用空间大 |
| 增量备份 | 备份变化数据 | 占用空间小 | 恢复慢 |
| 差异备份 | 备份自上次全量后的变化 | 恢复较快 | 占用空间中等 |

#### [代码] 代码示例

```python
import os
import shutil
import tarfile
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict
from dataclasses import dataclass
from enum import Enum

class BackupType(Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

@dataclass
class BackupMetadata:
    backup_id: str
    backup_type: BackupType
    timestamp: datetime
    size: int
    checksum: str
    source_path: str
    backup_path: str
    parent_id: str = None

class BackupManager:
    """备份管理器"""
    
    def __init__(self, backup_root: str, retention_days: int = 30):
        self.backup_root = backup_root
        self.retention_days = retention_days
        self.metadata_file = os.path.join(backup_root, 'metadata.json')
        self.metadata: List[Dict] = self._load_metadata()
    
    def create_full_backup(self, source_path: str) -> BackupMetadata:
        """创建全量备份"""
        timestamp = datetime.now()
        backup_id = f"full-{timestamp.strftime('%Y%m%d%H%M%S')}"
        backup_path = os.path.join(self.backup_root, backup_id)
        
        os.makedirs(backup_path, exist_ok=True)
        
        # 创建压缩备份
        archive_path = os.path.join(backup_path, 'backup.tar.gz')
        with tarfile.open(archive_path, 'w:gz') as tar:
            tar.add(source_path, arcname=os.path.basename(source_path))
        
        # 计算校验和
        checksum = self._calculate_checksum(archive_path)
        size = os.path.getsize(archive_path)
        
        metadata = BackupMetadata(
            backup_id=backup_id,
            backup_type=BackupType.FULL,
            timestamp=timestamp,
            size=size,
            checksum=checksum,
            source_path=source_path,
            backup_path=backup_path
        )
        
        self._save_metadata(metadata)
        return metadata
    
    def create_incremental_backup(self, source_path: str, 
                                  parent_id: str) -> BackupMetadata:
        """创建增量备份"""
        timestamp = datetime.now()
        backup_id = f"incr-{timestamp.strftime('%Y%m%d%H%M%S')}"
        backup_path = os.path.join(self.backup_root, backup_id)
        
        os.makedirs(backup_path, exist_ok=True)
        
        # 获取上次备份后变化的文件
        parent = self._get_backup(parent_id)
        changed_files = self._detect_changes(source_path, parent)
        
        # 只备份变化的文件
        archive_path = os.path.join(backup_path, 'backup.tar.gz')
        with tarfile.open(archive_path, 'w:gz') as tar:
            for file_path in changed_files:
                arcname = os.path.relpath(file_path, source_path)
                tar.add(file_path, arcname=arcname)
        
        checksum = self._calculate_checksum(archive_path)
        size = os.path.getsize(archive_path)
        
        metadata = BackupMetadata(
            backup_id=backup_id,
            backup_type=BackupType.INCREMENTAL,
            timestamp=timestamp,
            size=size,
            checksum=checksum,
            source_path=source_path,
            backup_path=backup_path,
            parent_id=parent_id
        )
        
        self._save_metadata(metadata)
        return metadata
    
    def restore_backup(self, backup_id: str, restore_path: str):
        """恢复备份"""
        backup = self._get_backup(backup_id)
        if not backup:
            raise ValueError(f"Backup not found: {backup_id}")
        
        # 如果是增量备份，需要先恢复全量备份
        if backup['backup_type'] == BackupType.INCREMENTAL.value:
            parent_id = backup['parent_id']
            if parent_id:
                self.restore_backup(parent_id, restore_path)
        
        # 解压备份
        archive_path = os.path.join(backup['backup_path'], 'backup.tar.gz')
        
        # 验证校验和
        current_checksum = self._calculate_checksum(archive_path)
        if current_checksum != backup['checksum']:
            raise ValueError("Backup checksum mismatch - backup may be corrupted")
        
        # 解压到恢复路径
        with tarfile.open(archive_path, 'r:gz') as tar:
            tar.extractall(restore_path)
    
    def cleanup_old_backups(self):
        """清理过期备份"""
        cutoff = datetime.now() - timedelta(days=self.retention_days)
        
        to_remove = []
        for backup in self.metadata:
            timestamp = datetime.fromisoformat(backup['timestamp'])
            if timestamp < cutoff:
                to_remove.append(backup)
        
        for backup in to_remove:
            # 删除备份文件
            shutil.rmtree(backup['backup_path'], ignore_errors=True)
            # 从元数据中移除
            self.metadata.remove(backup)
        
        self._persist_metadata()
    
    def _detect_changes(self, source_path: str, parent: Dict) -> List[str]:
        """检测变化的文件"""
        changed_files = []
        parent_time = datetime.fromisoformat(parent['timestamp'])
        
        for root, dirs, files in os.walk(source_path):
            for file in files:
                file_path = os.path.join(root, file)
                mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                if mtime > parent_time:
                    changed_files.append(file_path)
        
        return changed_files
    
    def _calculate_checksum(self, file_path: str) -> str:
        """计算文件校验和"""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def _load_metadata(self) -> List[Dict]:
        """加载元数据"""
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return []
    
    def _save_metadata(self, metadata: BackupMetadata):
        """保存元数据"""
        self.metadata.append({
            'backup_id': metadata.backup_id,
            'backup_type': metadata.backup_type.value,
            'timestamp': metadata.timestamp.isoformat(),
            'size': metadata.size,
            'checksum': metadata.checksum,
            'source_path': metadata.source_path,
            'backup_path': metadata.backup_path,
            'parent_id': metadata.parent_id
        })
        self._persist_metadata()
    
    def _persist_metadata(self):
        """持久化元数据"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def _get_backup(self, backup_id: str) -> Dict:
        """获取备份信息"""
        for backup in self.metadata:
            if backup['backup_id'] == backup_id:
                return backup
        return None

# 数据库备份
class DatabaseBackup:
    """数据库备份"""
    
    def __init__(self, db_host: str, db_name: str, db_user: str, db_password: str):
        self.db_host = db_host
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
    
    def backup_mysql(self, output_path: str):
        """备份 MySQL 数据库"""
        import subprocess
        
        cmd = [
            'mysqldump',
            '-h', self.db_host,
            '-u', self.db_user,
            f'-p{self.db_password}',
            '--single-transaction',
            '--routines',
            '--triggers',
            self.db_name
        ]
        
        with open(output_path, 'w') as f:
            subprocess.run(cmd, stdout=f, check=True)
    
    def backup_postgresql(self, output_path: str):
        """备份 PostgreSQL 数据库"""
        import subprocess
        
        env = os.environ.copy()
        env['PGPASSWORD'] = self.db_password
        
        cmd = [
            'pg_dump',
            '-h', self.db_host,
            '-U', self.db_user,
            '-F', 'c',  # 自定义格式
            '-f', output_path,
            self.db_name
        ]
        
        subprocess.run(cmd, env=env, check=True)
    
    def restore_mysql(self, backup_path: str):
        """恢复 MySQL 数据库"""
        import subprocess
        
        cmd = [
            'mysql',
            '-h', self.db_host,
            '-u', self.db_user,
            f'-p{self.db_password}',
            self.db_name
        ]
        
        with open(backup_path, 'r') as f:
            subprocess.run(cmd, stdin=f, check=True)

# 使用示例
if __name__ == "__main__":
    manager = BackupManager('/backups', retention_days=30)
    
    # 创建全量备份
    full_backup = manager.create_full_backup('/data')
    print(f"Full backup created: {full_backup.backup_id}")
    
    # 创建增量备份
    incr_backup = manager.create_incremental_backup('/data', full_backup.backup_id)
    print(f"Incremental backup created: {incr_backup.backup_id}")
```

#### [场景] 典型应用场景

- 数据库备份
- 文件备份
- 配置备份

### 2. 容灾架构

#### [概念] 概念解释

容灾架构设计系统在灾难发生时的应对方案。常见模式包括主备、双活、多活。架构选择取决于业务需求和成本预算。

#### [语法] 核心语法 / 命令 / API

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class SiteRole(Enum):
    PRIMARY = "primary"
    STANDBY = "standby"
    ACTIVE = "active"

@dataclass
class Site:
    site_id: str
    name: str
    region: str
    role: SiteRole
    endpoint: str
    capacity: int
    health_status: str

class DisasterRecoveryArchitecture:
    """容灾架构"""
    
    def __init__(self):
        self.sites: Dict[str, Site] = {}
        self.replication_rules: List[Dict] = []
    
    def add_site(self, site: Site):
        """添加站点"""
        self.sites[site.site_id] = site
    
    def configure_replication(self, source_site: str, target_site: str,
                             replication_type: str, rpo: int):
        """配置复制"""
        self.replication_rules.append({
            'source': source_site,
            'target': target_site,
            'type': replication_type,  # sync, async
            'rpo': rpo  # 秒
        })
    
    def get_architecture_type(self) -> str:
        """获取架构类型"""
        active_count = sum(
            1 for site in self.sites.values()
            if site.role == SiteRole.ACTIVE
        )
        
        if active_count == 1:
            return "主备架构"
        elif active_count == 2:
            return "双活架构"
        else:
            return "多活架构"

# 主备架构示例
def setup_active_passive():
    """设置主备架构"""
    arch = DisasterRecoveryArchitecture()
    
    # 主站点
    arch.add_site(Site(
        site_id="primary",
        name="Primary Site",
        region="us-east-1",
        role=SiteRole.ACTIVE,
        endpoint="primary.example.com",
        capacity=100,
        health_status="healthy"
    ))
    
    # 备用站点
    arch.add_site(Site(
        site_id="standby",
        name="Standby Site",
        region="us-west-2",
        role=SiteRole.STANDBY,
        endpoint="standby.example.com",
        capacity=100,
        health_status="healthy"
    ))
    
    # 配置异步复制
    arch.configure_replication("primary", "standby", "async", 300)
    
    return arch

# 云容灾配置
class CloudDisasterRecovery:
    """云容灾配置"""
    
    def __init__(self, provider: str):
        self.provider = provider
    
    def setup_cross_region_replication(self, source_bucket: str, 
                                       target_bucket: str, target_region: str):
        """设置跨区域复制"""
        if self.provider == 'aws':
            import boto3
            
            s3 = boto3.client('s3')
            
            s3.put_bucket_replication(
                Bucket=source_bucket,
                ReplicationConfiguration={
                    'Role': 'arn:aws:iam::123456789012:role/replication-role',
                    'Rules': [{
                        'ID': 'replication-rule',
                        'Status': 'Enabled',
                        'Destination': {
                            'Bucket': f'arn:aws:s3:::{target_bucket}',
                            'StorageClass': 'STANDARD'
                        }
                    }]
                }
            )
    
    def setup_database_replication(self, source_db: str, target_region: str):
        """设置数据库复制"""
        if self.provider == 'aws':
            # RDS 只读副本
            import boto3
            
            rds = boto3.client('rds')
            
            rds.create_db_instance_read_replica(
                DBInstanceIdentifier=f"{source_db}-replica",
                SourceDBInstanceIdentifier=source_db,
                Region=target_region
            )
```

#### [场景] 典型应用场景

- 跨区域容灾
- 数据中心容灾
- 云容灾

### 3. 故障切换

#### [概念] 概念解释

故障切换在主站点故障时自动切换到备用站点。包括故障检测、切换决策、流量切换、状态同步等步骤。需要确保切换过程对用户透明。

#### [语法] 核心语法 / 命令 / API

```python
import time
import requests
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class FailoverStatus(Enum):
    NORMAL = "normal"
    DEGRADED = "degraded"
    FAILOVER = "failover"
    RECOVERY = "recovery"

@dataclass
class HealthCheckResult:
    site_id: str
    is_healthy: bool
    response_time: float
    timestamp: float
    error: str = None

class FailoverManager:
    """故障切换管理器"""
    
    def __init__(self, check_interval: int = 30, failure_threshold: int = 3):
        self.check_interval = check_interval
        self.failure_threshold = failure_threshold
        self.sites: Dict[str, Site] = {}
        self.health_history: Dict[str, List[HealthCheckResult]] = {}
        self.status = FailoverStatus.NORMAL
        self.active_site: str = None
    
    def add_site(self, site: Site):
        """添加站点"""
        self.sites[site.site_id] = site
        self.health_history[site.site_id] = []
        
        if site.role == SiteRole.ACTIVE:
            self.active_site = site.site_id
    
    def health_check(self, site_id: str) -> HealthCheckResult:
        """健康检查"""
        site = self.sites[site_id]
        
        try:
            start_time = time.time()
            response = requests.get(
                f"{site.endpoint}/health",
                timeout=10
            )
            response_time = time.time() - start_time
            
            is_healthy = response.status_code == 200
            
            return HealthCheckResult(
                site_id=site_id,
                is_healthy=is_healthy,
                response_time=response_time,
                timestamp=time.time()
            )
        except Exception as e:
            return HealthCheckResult(
                site_id=site_id,
                is_healthy=False,
                response_time=0,
                timestamp=time.time(),
                error=str(e)
            )
    
    def check_and_failover(self):
        """检查并执行故障切换"""
        # 检查当前活跃站点
        result = self.health_check(self.active_site)
        self.health_history[self.active_site].append(result)
        
        # 检查连续失败次数
        recent_results = self.health_history[self.active_site][-self.failure_threshold:]
        failures = sum(1 for r in recent_results if not r.is_healthy)
        
        if failures >= self.failure_threshold:
            self._execute_failover()
    
    def _execute_failover(self):
        """执行故障切换"""
        print(f"Failover triggered from {self.active_site}")
        
        # 找到健康的备用站点
        for site_id, site in self.sites.items():
            if site_id == self.active_site:
                continue
            
            result = self.health_check(site_id)
            if result.is_healthy:
                self._switch_to_site(site_id)
                return
        
        print("No healthy site available for failover")
    
    def _switch_to_site(self, target_site_id: str):
        """切换到目标站点"""
        old_active = self.active_site
        self.active_site = target_site_id
        
        # 更新站点角色
        self.sites[old_active].role = SiteRole.STANDBY
        self.sites[target_site_id].role = SiteRole.ACTIVE
        
        # 更新 DNS 或负载均衡器
        self._update_dns(target_site_id)
        
        self.status = FailoverStatus.FAILOVER
        print(f"Switched from {old_active} to {target_site_id}")
    
    def _update_dns(self, site_id: str):
        """更新 DNS 记录"""
        site = self.sites[site_id]
        
        # 使用 Route 53 或其他 DNS 服务更新
        # 示例代码
        print(f"Updating DNS to point to {site.endpoint}")
    
    def failback(self):
        """故障恢复"""
        # 检查原主站点是否恢复
        original_primary = self._get_original_primary()
        
        if original_primary:
            result = self.health_check(original_primary)
            if result.is_healthy:
                self._switch_to_site(original_primary)
                self.status = FailoverStatus.NORMAL
                print(f"Failback to {original_primary} completed")

# 使用示例
if __name__ == "__main__":
    manager = FailoverManager(check_interval=30, failure_threshold=3)
    
    # 添加站点
    manager.add_site(Site(
        site_id="primary",
        name="Primary",
        region="us-east-1",
        role=SiteRole.ACTIVE,
        endpoint="https://primary.example.com",
        capacity=100,
        health_status="healthy"
    ))
    
    manager.add_site(Site(
        site_id="standby",
        name="Standby",
        region="us-west-2",
        role=SiteRole.STANDBY,
        endpoint="https://standby.example.com",
        capacity=100,
        health_status="healthy"
    ))
    
    # 监控循环
    while True:
        manager.check_and_failover()
        time.sleep(manager.check_interval)
```

#### [场景] 典型应用场景

- 自动故障切换
- 手动切换
- 故障恢复

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 恢复演练

#### [概念] 概念与解决的问题

恢复演练验证灾备方案的有效性。定期演练可以发现潜在问题，提高团队应急响应能力。

#### [语法] 核心用法

```python
from dataclasses import dataclass
from typing import List
from datetime import datetime
from enum import Enum

class DrillType(Enum):
    TABLETOP = "tabletop"  # 桌面演练
    PARTIAL = "partial"    # 部分演练
    FULL = "full"          # 全量演练

@dataclass
class DrillResult:
    drill_id: str
    drill_type: DrillType
    start_time: datetime
    end_time: datetime
    rto_achieved: int  # 实际恢复时间（秒）
    rpo_achieved: int  # 实际数据丢失（秒）
    success: bool
    issues: List[str]
    recommendations: List[str]

class DisasterRecoveryDrill:
    """灾备演练"""
    
    def __init__(self):
        self.drill_history: List[DrillResult] = []
    
    def execute_drill(self, drill_type: DrillType) -> DrillResult:
        """执行演练"""
        drill_id = f"drill-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        start_time = datetime.now()
        
        issues = []
        recommendations = []
        
        try:
            # 1. 通知相关人员
            self._notify_stakeholders(drill_type)
            
            # 2. 验证备份可用性
            backup_issues = self._verify_backups()
            issues.extend(backup_issues)
            
            # 3. 执行故障切换（如果是全量演练）
            if drill_type == DrillType.FULL:
                failover_issues = self._execute_failover_test()
                issues.extend(failover_issues)
            
            # 4. 验证服务可用性
            service_issues = self._verify_services()
            issues.extend(service_issues)
            
            # 5. 执行故障恢复
            if drill_type == DrillType.FULL:
                recovery_issues = self._execute_failback()
                issues.extend(recovery_issues)
            
            success = len(issues) == 0
            
        except Exception as e:
            issues.append(f"Drill failed: {str(e)}")
            success = False
        
        end_time = datetime.now()
        rto = int((end_time - start_time).total_seconds())
        
        result = DrillResult(
            drill_id=drill_id,
            drill_type=drill_type,
            start_time=start_time,
            end_time=end_time,
            rto_achieved=rto,
            rpo_achieved=0,  # 需要根据实际情况计算
            success=success,
            issues=issues,
            recommendations=recommendations
        )
        
        self.drill_history.append(result)
        return result
    
    def _notify_stakeholders(self, drill_type: DrillType):
        """通知相关人员"""
        print(f"Notifying stakeholders about {drill_type.value} drill")
    
    def _verify_backups(self) -> List[str]:
        """验证备份"""
        issues = []
        # 检查备份完整性
        # 检查备份可恢复性
        return issues
    
    def _execute_failover_test(self) -> List[str]:
        """执行故障切换测试"""
        issues = []
        # 执行实际的故障切换
        return issues
    
    def _verify_services(self) -> List[str]:
        """验证服务"""
        issues = []
        # 检查所有关键服务
        return issues
    
    def _execute_failback(self) -> List[str]:
        """执行故障恢复"""
        issues = []
        # 恢复到原主站点
        return issues
```

#### [关联] 与核心层的关联

恢复演练验证备份策略和故障切换的有效性。

### 2. 业务连续性

#### [概念] 概念与解决的问题

业务连续性确保关键业务在灾难发生后能够持续运行。包括业务影响分析、风险评估、恢复策略制定等。

#### [语法] 核心用法

```python
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class BusinessPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class BusinessProcess:
    process_id: str
    name: str
    priority: BusinessPriority
    rto: int  # 恢复时间目标（秒）
    rpo: int  # 恢复点目标（秒）
    dependencies: List[str]
    owner: str

class BusinessContinuityPlan:
    """业务连续性计划"""
    
    def __init__(self):
        self.processes: Dict[str, BusinessProcess] = {}
        self.recovery_strategies: Dict[str, Dict] = {}
    
    def add_process(self, process: BusinessProcess):
        """添加业务流程"""
        self.processes[process.process_id] = process
    
    def define_recovery_strategy(self, process_id: str, strategy: Dict):
        """定义恢复策略"""
        self.recovery_strategies[process_id] = strategy
    
    def get_recovery_order(self) -> List[BusinessProcess]:
        """获取恢复顺序"""
        # 按优先级排序
        priority_order = {
            BusinessPriority.CRITICAL: 0,
            BusinessPriority.HIGH: 1,
            BusinessPriority.MEDIUM: 2,
            BusinessPriority.LOW: 3
        }
        
        return sorted(
            self.processes.values(),
            key=lambda p: priority_order[p.priority]
        )
    
    def generate_recovery_plan(self) -> Dict:
        """生成恢复计划"""
        recovery_order = self.get_recovery_order()
        
        plan = {
            'recovery_phases': [],
            'total_rto': 0,
            'total_rpo': 0
        }
        
        for process in recovery_order:
            strategy = self.recovery_strategies.get(process.process_id, {})
            
            plan['recovery_phases'].append({
                'process': process.name,
                'priority': process.priority.value,
                'rto': process.rto,
                'rpo': process.rpo,
                'strategy': strategy
            })
            
            plan['total_rto'] = max(plan['total_rto'], process.rto)
        
        return plan
```

#### [关联] 与核心层的关联

业务连续性是灾备的目标，指导备份和故障切换策略。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| RTO | 恢复时间目标 |
| RPO | 恢复点目标 |
| Hot Standby | 热备 |
| Cold Standby | 冷备 |
| Warm Standby | 温备 |
| Pilot Light | 飞行灯模式 |
| Multi-AZ | 多可用区部署 |
| Cross-Region | 跨区域部署 |
| Chaos Engineering | 混沌工程 |
| Runbook | 运维手册 |

---

## [实战] 核心实战清单

### 实战任务 1：构建完整灾备方案

构建完整的灾备方案：

```python
def build_disaster_recovery_plan():
    """构建灾备方案"""
    
    # 1. 业务影响分析
    bia = conduct_business_impact_analysis()
    
    # 2. 设计容灾架构
    architecture = design_dr_architecture(bia)
    
    # 3. 实施备份策略
    backup_strategy = implement_backup_strategy(architecture)
    
    # 4. 配置故障切换
    failover_config = configure_failover(architecture)
    
    # 5. 制定恢复计划
    recovery_plan = create_recovery_plan(bia, architecture)
    
    # 6. 定期演练
    schedule_dr_drills()
    
    return {
        'architecture': architecture,
        'backup': backup_strategy,
        'failover': failover_config,
        'recovery_plan': recovery_plan
    }
```
