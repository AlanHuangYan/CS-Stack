# 数字取证 三层深度学习教程

## [总览] 技术总览

数字取证是收集、保存、分析和呈现电子证据的科学方法。应用于安全事件调查、法律诉讼、内部审计等场景。遵循证据链完整、取证过程可复现的原则。

本教程采用三层漏斗学习法：**核心层**聚焦取证流程、证据收集、证据分析三大基石；**重点层**深入日志分析和恶意软件分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 取证流程

#### [概念] 概念解释

数字取证流程遵循标准化方法，确保证据的完整性和可采性。主要阶段包括识别、保存、收集、分析、报告、呈现。

#### [语法] 核心语法 / 命令 / API

```python
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime
from enum import Enum
import hashlib
import json

class EvidenceType(Enum):
    DISK_IMAGE = "磁盘镜像"
    MEMORY_DUMP = "内存转储"
    LOG_FILE = "日志文件"
    NETWORK_CAPTURE = "网络捕获"
    EMAIL = "电子邮件"
    DATABASE = "数据库"

class CaseStatus(Enum):
    OPEN = "进行中"
    CLOSED = "已关闭"
    SUSPENDED = "已暂停"

@dataclass
class Evidence:
    evidence_id: str
    case_id: str
    evidence_type: EvidenceType
    source: str
    collected_by: str
    collected_at: datetime
    hash_md5: str
    hash_sha256: str
    chain_of_custody: List[dict]
    description: str

@dataclass
class Case:
    case_id: str
    title: str
    description: str
    status: CaseStatus
    created_at: datetime
    investigator: str
    evidence: List[Evidence]

class ForensicsWorkflow:
    """取证工作流"""
    
    def __init__(self):
        self.cases: dict = {}
    
    def create_case(self, title: str, description: str, investigator: str) -> Case:
        """创建案件"""
        case_id = f"CASE-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        case = Case(
            case_id=case_id,
            title=title,
            description=description,
            status=CaseStatus.OPEN,
            created_at=datetime.now(),
            investigator=investigator,
            evidence=[]
        )
        
        self.cases[case_id] = case
        return case
    
    def collect_evidence(self, case_id: str, evidence_type: EvidenceType,
                        source: str, data: bytes, collector: str) -> Evidence:
        """收集证据"""
        case = self.cases.get(case_id)
        if not case:
            raise ValueError(f"Case not found: {case_id}")
        
        evidence_id = f"EV-{len(case.evidence) + 1:04d}"
        
        # 计算哈希
        hash_md5 = hashlib.md5(data).hexdigest()
        hash_sha256 = hashlib.sha256(data).hexdigest()
        
        evidence = Evidence(
            evidence_id=evidence_id,
            case_id=case_id,
            evidence_type=evidence_type,
            source=source,
            collected_by=collector,
            collected_at=datetime.now(),
            hash_md5=hash_md5,
            hash_sha256=hash_sha256,
            chain_of_custody=[{
                'action': 'collected',
                'by': collector,
                'at': datetime.now().isoformat(),
                'notes': f'Collected from {source}'
            }],
            description=f"{evidence_type.value} evidence"
        )
        
        case.evidence.append(evidence)
        return evidence
    
    def verify_evidence_integrity(self, evidence: Evidence, data: bytes) -> bool:
        """验证证据完整性"""
        current_md5 = hashlib.md5(data).hexdigest()
        current_sha256 = hashlib.sha256(data).hexdigest()
        
        return (current_md5 == evidence.hash_md5 and 
                current_sha256 == evidence.hash_sha256)
    
    def transfer_custody(self, evidence: Evidence, from_person: str, 
                        to_person: str, reason: str):
        """转移证据保管"""
        evidence.chain_of_custody.append({
            'action': 'transferred',
            'from': from_person,
            'to': to_person,
            'at': datetime.now().isoformat(),
            'reason': reason
        })
    
    def generate_report(self, case_id: str) -> dict:
        """生成取证报告"""
        case = self.cases.get(case_id)
        if not case:
            return {}
        
        return {
            'case_id': case.case_id,
            'title': case.title,
            'status': case.status.value,
            'investigator': case.investigator,
            'created_at': case.created_at.isoformat(),
            'evidence_count': len(case.evidence),
            'evidence_list': [
                {
                    'evidence_id': e.evidence_id,
                    'type': e.evidence_type.value,
                    'source': e.source,
                    'collected_at': e.collected_at.isoformat(),
                    'md5': e.hash_md5,
                    'sha256': e.hash_sha256
                }
                for e in case.evidence
            ]
        }

# 使用示例
if __name__ == "__main__":
    workflow = ForensicsWorkflow()
    
    # 创建案件
    case = workflow.create_case(
        title="数据泄露调查",
        description="调查客户数据泄露事件",
        investigator="安全团队"
    )
    
    # 收集证据
    log_data = b"2024-01-15 10:30:00 User login failed..."
    evidence = workflow.collect_evidence(
        case.case_id,
        EvidenceType.LOG_FILE,
        "/var/log/auth.log",
        log_data,
        "取证专家A"
    )
    
    # 验证完整性
    is_valid = workflow.verify_evidence_integrity(evidence, log_data)
    print(f"证据完整性验证: {'通过' if is_valid else '失败'}")
    
    # 生成报告
    report = workflow.generate_report(case.case_id)
    print(json.dumps(report, indent=2, ensure_ascii=False))
```

#### [场景] 典型应用场景

- 安全事件调查
- 法律诉讼支持
- 内部违规调查

### 2. 证据收集

#### [概念] 概念解释

证据收集是获取电子证据的过程。需要保证证据的原始性和完整性。常见证据源包括磁盘、内存、日志、网络流量等。

#### [语法] 核心语法 / 命令 / API

```python
import os
import subprocess
import json
from datetime import datetime

class EvidenceCollector:
    """证据收集器"""
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def collect_disk_info(self) -> dict:
        """收集磁盘信息"""
        # 获取磁盘使用情况
        df_output = subprocess.run(
            ['df', '-h'],
            capture_output=True,
            text=True
        ).stdout
        
        # 获取挂载点
        mount_output = subprocess.run(
            ['mount'],
            capture_output=True,
            text=True
        ).stdout
        
        return {
            'disk_usage': df_output,
            'mount_points': mount_output,
            'collected_at': datetime.now().isoformat()
        }
    
    def collect_system_info(self) -> dict:
        """收集系统信息"""
        return {
            'hostname': os.uname().nodename,
            'os': os.uname().sysname,
            'kernel': os.uname().release,
            'architecture': os.uname().machine,
            'collected_at': datetime.now().isoformat()
        }
    
    def collect_network_connections(self) -> list:
        """收集网络连接"""
        # netstat 或 ss 命令
        output = subprocess.run(
            ['netstat', '-tunap'],
            capture_output=True,
            text=True
        ).stdout
        
        connections = []
        for line in output.strip().split('\n')[2:]:
            parts = line.split()
            if len(parts) >= 6:
                connections.append({
                    'protocol': parts[0],
                    'local_address': parts[3],
                    'foreign_address': parts[4],
                    'state': parts[5] if len(parts) > 5 else '',
                    'pid': parts[6] if len(parts) > 6 else ''
                })
        
        return connections
    
    def collect_running_processes(self) -> list:
        """收集运行进程"""
        output = subprocess.run(
            ['ps', 'aux'],
            capture_output=True,
            text=True
        ).stdout
        
        processes = []
        for line in output.strip().split('\n')[1:]:
            parts = line.split(None, 10)
            if len(parts) >= 11:
                processes.append({
                    'user': parts[0],
                    'pid': parts[1],
                    'cpu': parts[2],
                    'mem': parts[3],
                    'command': parts[10]
                })
        
        return processes
    
    def collect_logs(self, log_path: str, lines: int = 1000) -> str:
        """收集日志文件"""
        try:
            with open(log_path, 'r') as f:
                # 读取最后 N 行
                content = f.readlines()[-lines:]
                return ''.join(content)
        except FileNotFoundError:
            return f"Log file not found: {log_path}"
    
    def collect_browser_history(self, browser: str = 'chrome') -> list:
        """收集浏览器历史"""
        # 简化实现，实际需要解析 SQLite 数据库
        history = []
        
        if browser == 'chrome':
            # Chrome 历史数据库路径
            # Windows: %LOCALAPPDATA%\Google\Chrome\User Data\Default\History
            # Linux: ~/.config/google-chrome/Default/History
            # macOS: ~/Library/Application Support/Google/Chrome/Default/History
            pass
        
        return history
    
    def save_evidence(self, evidence_name: str, data: any) -> str:
        """保存证据"""
        filename = f"{evidence_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # 计算哈希
        with open(filepath, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        return {
            'filepath': filepath,
            'sha256': file_hash
        }

# 内存取证工具集成
class MemoryForensics:
    """内存取证"""
    
    def __init__(self):
        self.tools = ['volatility', 'strings']
    
    def analyze_memory_dump(self, dump_path: str) -> dict:
        """分析内存转储"""
        results = {}
        
        # 使用 Volatility 分析
        # volatility -f <dump> imageinfo
        # volatility -f <dump> --profile=<profile> pslist
        # volatility -f <dump> --profile=<profile> netscan
        
        return results
    
    def extract_strings(self, dump_path: str, min_length: int = 8) -> list:
        """提取可读字符串"""
        output = subprocess.run(
            ['strings', '-n', str(min_length), dump_path],
            capture_output=True,
            text=True
        ).stdout
        
        return output.split('\n')

# 使用示例
if __name__ == "__main__":
    collector = EvidenceCollector('./evidence')
    
    # 收集系统信息
    system_info = collector.collect_system_info()
    print(f"系统信息: {system_info}")
    
    # 收集网络连接
    connections = collector.collect_network_connections()
    print(f"网络连接数: {len(connections)}")
    
    # 保存证据
    result = collector.save_evidence('system_info', system_info)
    print(f"证据保存: {result}")
```

#### [场景] 典型应用场景

- 现场取证
- 远程取证
- 云环境取证

### 3. 证据分析

#### [概念] 概念解释

证据分析是从收集的证据中提取有价值信息的过程。包括时间线分析、关联分析、模式识别等。目标是还原事件真相。

#### [语法] 核心语法 / 命令 / API

```python
from datetime import datetime
from collections import defaultdict
import re

class EvidenceAnalyzer:
    """证据分析器"""
    
    def __init__(self):
        self.timeline = []
    
    def add_event(self, timestamp: datetime, source: str, event_type: str, details: dict):
        """添加事件到时间线"""
        self.timeline.append({
            'timestamp': timestamp,
            'source': source,
            'event_type': event_type,
            'details': details
        })
    
    def build_timeline(self) -> list:
        """构建时间线"""
        return sorted(self.timeline, key=lambda x: x['timestamp'])
    
    def analyze_log_patterns(self, log_content: str, patterns: dict) -> dict:
        """分析日志模式"""
        results = defaultdict(list)
        
        for pattern_name, pattern in patterns.items():
            matches = re.finditer(pattern, log_content, re.MULTILINE)
            for match in matches:
                results[pattern_name].append({
                    'match': match.group(),
                    'position': match.span()
                })
        
        return dict(results)
    
    def find_anomalies(self, events: list, baseline: dict) -> list:
        """发现异常"""
        anomalies = []
        
        for event in events:
            # 检查是否偏离基线
            event_type = event.get('event_type')
            
            if event_type in baseline:
                expected = baseline[event_type]
                actual = event.get('details', {})
                
                # 简单的异常检测
                if actual.get('count', 0) > expected.get('threshold', 10):
                    anomalies.append({
                        'event': event,
                        'reason': f"Count {actual.get('count')} exceeds threshold {expected.get('threshold')}"
                    })
        
        return anomalies
    
    def correlate_events(self, events: list, time_window: int = 60) -> list:
        """关联事件"""
        correlated = []
        
        # 按时间窗口分组
        for i, event in enumerate(events):
            related = [event]
            
            for other in events[i+1:]:
                time_diff = abs((other['timestamp'] - event['timestamp']).total_seconds())
                if time_diff <= time_window:
                    related.append(other)
                else:
                    break
            
            if len(related) > 1:
                correlated.append(related)
        
        return correlated

# 日志分析示例
class LogAnalyzer:
    """日志分析器"""
    
    def __init__(self):
        self.patterns = {
            'failed_login': r'Failed password for .* from (\d+\.\d+\.\d+\.\d+)',
            'successful_login': r'Accepted password for .* from (\d+\.\d+\.\d+\.\d+)',
            'sudo_usage': r'sudo:.*COMMAND=(.+)',
            'ssh_connection': r'sshd\[\d+\]: Accepted .* from (\d+\.\d+\.\d+\.\d+)'
        }
    
    def analyze_auth_log(self, log_content: str) -> dict:
        """分析认证日志"""
        results = {}
        
        # 失败登录统计
        failed_logins = re.findall(self.patterns['failed_login'], log_content)
        results['failed_login_ips'] = list(set(failed_logins))
        results['failed_login_count'] = len(failed_logins)
        
        # 成功登录统计
        successful_logins = re.findall(self.patterns['successful_login'], log_content)
        results['successful_login_ips'] = list(set(successful_logins))
        results['successful_login_count'] = len(successful_logins)
        
        # 检测暴力破解
        ip_failed_count = defaultdict(int)
        for ip in failed_logins:
            ip_failed_count[ip] += 1
        
        brute_force_ips = [
            ip for ip, count in ip_failed_count.items()
            if count > 5
        ]
        results['potential_brute_force'] = brute_force_ips
        
        return results
    
    def extract_timeline_from_logs(self, log_content: str) -> list:
        """从日志提取时间线"""
        # 常见日志时间格式
        time_pattern = r'(\w{3}\s+\d+\s+\d+:\d+:\d+)'
        
        timeline = []
        for line in log_content.split('\n'):
            match = re.search(time_pattern, line)
            if match:
                timestamp_str = match.group(1)
                # 解析时间戳（简化）
                timeline.append({
                    'timestamp': timestamp_str,
                    'event': line
                })
        
        return timeline

# 使用示例
if __name__ == "__main__":
    analyzer = EvidenceAnalyzer()
    log_analyzer = LogAnalyzer()
    
    # 模拟日志内容
    log_content = """
    Jan 15 10:30:01 server sshd[1234]: Failed password for admin from 192.168.1.100
    Jan 15 10:30:05 server sshd[1234]: Failed password for admin from 192.168.1.100
    Jan 15 10:30:10 server sshd[1234]: Accepted password for admin from 192.168.1.100
    """
    
    # 分析日志
    results = log_analyzer.analyze_auth_log(log_content)
    print(f"分析结果: {results}")
```

#### [场景] 典型应用场景

- 事件时间线重建
- 攻击路径分析
- 用户行为分析

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 日志分析

#### [概念] 概念与解决的问题

日志分析从系统日志中提取安全相关信息。包括日志收集、解析、关联、告警等环节。是安全运营的核心能力。

#### [语法] 核心用法

```python
import re
from datetime import datetime
from collections import Counter

class SecurityLogAnalyzer:
    """安全日志分析器"""
    
    def __init__(self):
        self.alert_rules = []
    
    def add_alert_rule(self, name: str, pattern: str, severity: str):
        """添加告警规则"""
        self.alert_rules.append({
            'name': name,
            'pattern': re.compile(pattern),
            'severity': severity
        })
    
    def scan_logs(self, log_entries: list) -> list:
        """扫描日志"""
        alerts = []
        
        for entry in log_entries:
            for rule in self.alert_rules:
                if rule['pattern'].search(entry):
                    alerts.append({
                        'rule': rule['name'],
                        'severity': rule['severity'],
                        'entry': entry
                    })
        
        return alerts
    
    def detect_attack_patterns(self, logs: list) -> dict:
        """检测攻击模式"""
        patterns = {
            'port_scan': self._detect_port_scan,
            'brute_force': self._detect_brute_force,
            'privilege_escalation': self._detect_privilege_escalation
        }
        
        results = {}
        for name, detector in patterns.items():
            results[name] = detector(logs)
        
        return results
    
    def _detect_port_scan(self, logs: list) -> list:
        """检测端口扫描"""
        # 统计每个 IP 访问的不同端口数
        ip_ports = defaultdict(set)
        
        for log in logs:
            # 提取 IP 和端口
            match = re.search(r'from (\d+\.\d+\.\d+\.\d+).*port (\d+)', log)
            if match:
                ip, port = match.groups()
                ip_ports[ip].add(port)
        
        # 端口数超过阈值视为扫描
        return [ip for ip, ports in ip_ports.items() if len(ports) > 10]
    
    def _detect_brute_force(self, logs: list) -> list:
        """检测暴力破解"""
        # 统计失败登录次数
        failed_attempts = Counter()
        
        for log in logs:
            if 'Failed password' in log:
                match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', log)
                if match:
                    failed_attempts[match.group(1)] += 1
        
        return [ip for ip, count in failed_attempts.items() if count > 5]
    
    def _detect_privilege_escalation(self, logs: list) -> list:
        """检测权限提升"""
        events = []
        
        for log in logs:
            if 'sudo' in log and 'COMMAND' in log:
                events.append(log)
        
        return events
```

#### [关联] 与核心层的关联

日志分析是证据分析的具体应用，聚焦于安全事件检测。

### 2. 恶意软件分析

#### [概念] 概念与解决的问题

恶意软件分析识别和分析恶意代码。包括静态分析和动态分析。是事件响应的重要环节。

#### [语法] 核心用法

```python
import hashlib
import subprocess
import json

class MalwareAnalyzer:
    """恶意软件分析器"""
    
    def __init__(self):
        self.suspicious_strings = [
            'CreateRemoteThread',
            'VirtualAllocEx',
            'WriteProcessMemory',
            'RegSetValue',
            'URLDownloadToFile'
        ]
    
    def static_analysis(self, file_path: str) -> dict:
        """静态分析"""
        results = {}
        
        # 文件哈希
        with open(file_path, 'rb') as f:
            content = f.read()
            results['md5'] = hashlib.md5(content).hexdigest()
            results['sha256'] = hashlib.sha256(content).hexdigest()
        
        # 文件大小
        results['size'] = os.path.getsize(file_path)
        
        # 字符串提取
        strings = self._extract_strings(file_path)
        results['strings_count'] = len(strings)
        
        # 可疑字符串检测
        suspicious_found = []
        for s in strings:
            for pattern in self.suspicious_strings:
                if pattern.lower() in s.lower():
                    suspicious_found.append(s)
        
        results['suspicious_strings'] = suspicious_found
        
        return results
    
    def _extract_strings(self, file_path: str, min_length: int = 4) -> list:
        """提取可读字符串"""
        output = subprocess.run(
            ['strings', '-n', str(min_length), file_path],
            capture_output=True,
            text=True
        ).stdout
        
        return output.split('\n')
    
    def check_virus_total(self, file_hash: str) -> dict:
        """检查 VirusTotal（需要 API Key）"""
        # 实际实现需要调用 VirusTotal API
        return {
            'hash': file_hash,
            'detection_ratio': 'N/A'
        }
```

#### [关联] 与核心层的关联

恶意软件分析是证据分析的延伸，专门处理恶意代码。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Disk Forensics | 磁盘取证 |
| Memory Forensics | 内存取证 |
| Network Forensics | 网络取证 |
| Mobile Forensics | 移动设备取证 |
| Cloud Forensics | 云取证 |
| Steganography | 隐写术 |
| Anti-Forensics | 反取证技术 |
| Timeline Analysis | 时间线分析 |
| File Carving | 文件雕刻 |
| Hash Database | 哈希数据库 |

---

## [实战] 核心实战清单

### 实战任务 1：完整取证调查

执行一次完整的数字取证调查：

```python
def conduct_forensics_investigation():
    """执行取证调查"""
    
    # 1. 创建案件
    workflow = ForensicsWorkflow()
    case = workflow.create_case(
        title="安全事件调查",
        description="调查可疑活动",
        investigator="安全团队"
    )
    
    # 2. 收集证据
    collector = EvidenceCollector('./evidence')
    
    # 收集系统信息
    system_info = collector.collect_system_info()
    collector.save_evidence('system_info', system_info)
    
    # 收集日志
    auth_log = collector.collect_logs('/var/log/auth.log')
    collector.save_evidence('auth_log', {'content': auth_log})
    
    # 3. 分析证据
    analyzer = LogAnalyzer()
    analysis_results = analyzer.analyze_auth_log(auth_log)
    
    # 4. 生成报告
    report = workflow.generate_report(case.case_id)
    
    return report
```
