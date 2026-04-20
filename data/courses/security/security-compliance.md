# 安全合规 三层深度学习教程

## [总览] 技术总览

安全合规确保组织的信息系统符合法律法规和行业标准要求。涵盖合规框架理解、风险评估、控制实施、审计认证等环节。常见合规框架包括 ISO 27001、SOC 2、GDPR、HIPAA 等。

本教程采用三层漏斗学习法：**核心层**聚焦合规框架、风险评估、控制措施三大基石；**重点层**深入审计流程和合规工具；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 合规框架

#### [概念] 概念解释

合规框架提供组织信息安全管理的结构化方法。定义了安全控制要求、实施指南和评估方法。不同行业和地区有不同的合规要求。

#### [语法] 核心语法 / 命令 / API

| 框架 | 适用范围 | 核心要求 |
|------|----------|----------|
| ISO 27001 | 通用 | 信息安全管理体系 |
| SOC 2 | 服务组织 | 信任服务准则 |
| GDPR | 欧盟 | 个人数据保护 |
| HIPAA | 医疗 | 健康信息保护 |
| PCI DSS | 支付 | 卡数据安全 |

#### [代码] 代码示例

```python
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class ComplianceFramework(Enum):
    ISO_27001 = "ISO 27001"
    SOC_2 = "SOC 2"
    GDPR = "GDPR"
    HIPAA = "HIPAA"
    PCI_DSS = "PCI DSS"

class ControlCategory(Enum):
    ACCESS_CONTROL = "访问控制"
    ENCRYPTION = "加密"
    AUDIT_LOGGING = "审计日志"
    INCIDENT_RESPONSE = "事件响应"
    CHANGE_MANAGEMENT = "变更管理"
    DATA_PROTECTION = "数据保护"

@dataclass
class Control:
    control_id: str
    name: str
    category: ControlCategory
    description: str
    frameworks: List[ComplianceFramework]
    implementation_guide: str

@dataclass
class ComplianceRequirement:
    framework: ComplianceFramework
    control: Control
    is_required: bool
    implementation_status: str
    evidence_required: List[str]

class ComplianceFrameworkManager:
    """合规框架管理器"""
    
    def __init__(self):
        self.controls: Dict[str, Control] = {}
        self.requirements: List[ComplianceRequirement] = []
    
    def add_control(self, control: Control):
        """添加控制措施"""
        self.controls[control.control_id] = control
    
    def get_framework_requirements(self, framework: ComplianceFramework) -> List[Control]:
        """获取框架要求的所有控制"""
        return [
            control for control in self.controls.values()
            if framework in control.frameworks
        ]
    
    def assess_compliance(self, framework: ComplianceFramework) -> dict:
        """评估合规状态"""
        required_controls = self.get_framework_requirements(framework)
        
        implemented = sum(
            1 for req in self.requirements
            if req.framework == framework and req.implementation_status == "implemented"
        )
        
        return {
            'framework': framework.value,
            'total_controls': len(required_controls),
            'implemented': implemented,
            'compliance_percentage': implemented / len(required_controls) * 100 if required_controls else 0
        }

# ISO 27001 控制示例
def create_iso27001_controls() -> List[Control]:
    """创建 ISO 27001 控制措施"""
    controls = [
        Control(
            control_id="A.9.1.1",
            name="访问控制策略",
            category=ControlCategory.ACCESS_CONTROL,
            description="建立、文档化并评审访问控制策略",
            frameworks=[ComplianceFramework.ISO_27001, ComplianceFramework.SOC_2],
            implementation_guide="制定访问控制策略，定义用户访问权限管理流程"
        ),
        Control(
            control_id="A.10.1.1",
            name="加密控制",
            category=ControlCategory.ENCRYPTION,
            description="制定并实施加密策略",
            frameworks=[ComplianceFramework.ISO_27001, ComplianceFramework.PCI_DSS],
            implementation_guide="对敏感数据实施加密，管理加密密钥"
        ),
        Control(
            control_id="A.12.4.1",
            name="事件日志",
            category=ControlCategory.AUDIT_LOGGING,
            description="记录用户活动、异常和信息安全事件",
            frameworks=[ComplianceFramework.ISO_27001, ComplianceFramework.SOC_2, ComplianceFramework.PCI_DSS],
            implementation_guide="配置系统日志，集中存储和保护日志"
        ),
        Control(
            control_id="A.16.1.1",
            name="事件管理职责",
            category=ControlCategory.INCIDENT_RESPONSE,
            description="建立信息安全事件管理职责",
            frameworks=[ComplianceFramework.ISO_27001, ComplianceFramework.SOC_2],
            implementation_guide="定义事件响应团队，建立事件报告流程"
        )
    ]
    return controls

# GDPR 合规检查
class GDPRComplianceChecker:
    """GDPR 合规检查器"""
    
    def __init__(self):
        self.requirements = [
            "数据主体同意机制",
            "数据访问请求流程",
            "数据删除请求流程",
            "数据可携带性",
            "隐私政策",
            "数据处理记录",
            "数据保护影响评估",
            "数据泄露通知流程",
            "数据保护官任命",
            "跨境数据传输机制"
        ]
    
    def check_compliance(self, organization_data: dict) -> dict:
        """检查 GDPR 合规状态"""
        results = {}
        
        for req in self.requirements:
            # 检查是否满足要求
            is_compliant = organization_data.get(req, False)
            results[req] = {
                'compliant': is_compliant,
                'status': 'PASS' if is_compliant else 'FAIL'
            }
        
        compliant_count = sum(1 for r in results.values() if r['compliant'])
        
        return {
            'total_requirements': len(self.requirements),
            'compliant_count': compliant_count,
            'compliance_rate': compliant_count / len(self.requirements) * 100,
            'details': results
        }

# 使用示例
if __name__ == "__main__":
    manager = ComplianceFrameworkManager()
    
    # 添加控制措施
    for control in create_iso27001_controls():
        manager.add_control(control)
    
    # 评估合规状态
    status = manager.assess_compliance(ComplianceFramework.ISO_27001)
    print(f"ISO 27001 合规状态: {status['compliance_percentage']:.1f}%")
```

#### [场景] 典型应用场景

- 企业合规体系建设
- 合规差距分析
- 认证准备

### 2. 风险评估

#### [概念] 概念解释

风险评估识别、分析和评估信息安全风险。包括资产识别、威胁分析、脆弱性评估、风险计算等步骤。是合规管理的基础。

#### [语法] 核心语法 / 命令 / API

```python
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum
import math

class RiskLevel(Enum):
    CRITICAL = "严重"
    HIGH = "高"
    MEDIUM = "中"
    LOW = "低"
    NEGLIGIBLE = "可忽略"

class Likelihood(Enum):
    VERY_LOW = 1
    LOW = 2
    MEDIUM = 3
    HIGH = 4
    VERY_HIGH = 5

class Impact(Enum):
    NEGLIGIBLE = 1
    LOW = 2
    MEDIUM = 3
    HIGH = 4
    CRITICAL = 5

@dataclass
class Asset:
    asset_id: str
    name: str
    description: str
    owner: str
    classification: str  # Public, Internal, Confidential, Restricted
    value: int  # 1-5

@dataclass
class Threat:
    threat_id: str
    name: str
    description: str
    likelihood: Likelihood

@dataclass
class Vulnerability:
    vuln_id: str
    name: str
    description: str
    affected_assets: List[str]
    impact: Impact

@dataclass
class Risk:
    risk_id: str
    asset: Asset
    threat: Threat
    vulnerability: Vulnerability
    likelihood: Likelihood
    impact: Impact
    risk_level: RiskLevel
    treatment: str  # Accept, Mitigate, Transfer, Avoid

class RiskAssessment:
    """风险评估"""
    
    def __init__(self):
        self.assets: Dict[str, Asset] = {}
        self.threats: Dict[str, Threat] = {}
        self.vulnerabilities: Dict[str, Vulnerability] = {}
        self.risks: List[Risk] = []
    
    def add_asset(self, asset: Asset):
        self.assets[asset.asset_id] = asset
    
    def add_threat(self, threat: Threat):
        self.threats[threat.threat_id] = threat
    
    def add_vulnerability(self, vuln: Vulnerability):
        self.vulnerabilities[vuln.vuln_id] = vuln
    
    def calculate_risk_level(self, likelihood: Likelihood, impact: Impact) -> RiskLevel:
        """计算风险等级"""
        risk_score = likelihood.value * impact.value
        
        if risk_score >= 20:
            return RiskLevel.CRITICAL
        elif risk_score >= 15:
            return RiskLevel.HIGH
        elif risk_score >= 10:
            return RiskLevel.MEDIUM
        elif risk_score >= 5:
            return RiskLevel.LOW
        else:
            return RiskLevel.NEGLIGIBLE
    
    def identify_risks(self) -> List[Risk]:
        """识别风险"""
        self.risks = []
        
        for asset in self.assets.values():
            for vuln in self.vulnerabilities.values():
                if asset.asset_id in vuln.affected_assets:
                    for threat in self.threats.values():
                        likelihood = threat.likelihood
                        impact = vuln.impact
                        
                        risk_level = self.calculate_risk_level(likelihood, impact)
                        
                        risk = Risk(
                            risk_id=f"R-{asset.asset_id}-{vuln.vuln_id}-{threat.threat_id}",
                            asset=asset,
                            threat=threat,
                            vulnerability=vuln,
                            likelihood=likelihood,
                            impact=impact,
                            risk_level=risk_level,
                            treatment="Mitigate"
                        )
                        
                        self.risks.append(risk)
        
        return self.risks
    
    def generate_risk_report(self) -> dict:
        """生成风险报告"""
        risk_by_level = {}
        for level in RiskLevel:
            risk_by_level[level.value] = [
                {
                    'risk_id': r.risk_id,
                    'asset': r.asset.name,
                    'threat': r.threat.name,
                    'vulnerability': r.vulnerability.name
                }
                for r in self.risks if r.risk_level == level
            ]
        
        return {
            'total_risks': len(self.risks),
            'risk_distribution': {level: len(risks) for level, risks in risk_by_level.items()},
            'risks_by_level': risk_by_level
        }

# 使用示例
if __name__ == "__main__":
    assessment = RiskAssessment()
    
    # 添加资产
    assessment.add_asset(Asset(
        asset_id="A001",
        name="客户数据库",
        description="包含客户个人信息",
        owner="IT部门",
        classification="Confidential",
        value=5
    ))
    
    # 添加威胁
    assessment.add_threat(Threat(
        threat_id="T001",
        name="数据泄露",
        description="未经授权访问敏感数据",
        likelihood=Likelihood.MEDIUM
    ))
    
    # 添加漏洞
    assessment.add_vulnerability(Vulnerability(
        vuln_id="V001",
        name="弱密码策略",
        description="密码复杂度要求不足",
        affected_assets=["A001"],
        impact=Impact.HIGH
    ))
    
    # 识别风险
    risks = assessment.identify_risks()
    
    # 生成报告
    report = assessment.generate_risk_report()
    print(f"总风险数: {report['total_risks']}")
    print(f"风险分布: {report['risk_distribution']}")
```

#### [场景] 典型应用场景

- 年度风险评估
- 新系统上线评估
- 合规差距分析

### 3. 控制措施

#### [概念] 概念解释

控制措施是降低风险的具体手段。分为预防性控制、检测性控制、纠正性控制。有效的控制措施组合形成纵深防御体系。

#### [语法] 核心语法 / 命令 / API

```python
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ControlType(Enum):
    PREVENTIVE = "预防性"
    DETECTIVE = "检测性"
    CORRECTIVE = "纠正性"
    DETERRENT = "威慑性"
    COMPENSATING = "补偿性"

class ControlStatus(Enum):
    PLANNED = "计划中"
    IMPLEMENTING = "实施中"
    OPERATIONAL = "运行中"
    FAILED = "失效"
    DEPRECATED = "已废弃"

@dataclass
class ControlImplementation:
    control_id: str
    name: str
    control_type: ControlType
    description: str
    owner: str
    status: ControlStatus
    implementation_date: Optional[datetime]
    last_review_date: Optional[datetime]
    effectiveness: int  # 1-5
    evidence: List[str]

class ControlManager:
    """控制措施管理器"""
    
    def __init__(self):
        self.controls: Dict[str, ControlImplementation] = {}
    
    def implement_control(self, control: ControlImplementation):
        """实施控制措施"""
        control.implementation_date = datetime.now()
        control.status = ControlStatus.OPERATIONAL
        self.controls[control.control_id] = control
    
    def evaluate_effectiveness(self, control_id: str, score: int):
        """评估控制有效性"""
        if control_id in self.controls:
            self.controls[control_id].effectiveness = score
            self.controls[control_id].last_review_date = datetime.now()
    
    def get_controls_by_type(self, control_type: ControlType) -> List[ControlImplementation]:
        """按类型获取控制措施"""
        return [
            c for c in self.controls.values()
            if c.control_type == control_type
        ]
    
    def get_control_gaps(self) -> List[dict]:
        """识别控制缺口"""
        gaps = []
        
        for control in self.controls.values():
            if control.status == ControlStatus.FAILED:
                gaps.append({
                    'control_id': control.control_id,
                    'name': control.name,
                    'issue': '控制失效'
                })
            elif control.effectiveness < 3:
                gaps.append({
                    'control_id': control.control_id,
                    'name': control.name,
                    'issue': f'有效性不足 ({control.effectiveness}/5)'
                })
        
        return gaps
    
    def generate_control_matrix(self) -> dict:
        """生成控制矩阵"""
        matrix = {}
        
        for control in self.controls.values():
            type_name = control.control_type.value
            if type_name not in matrix:
                matrix[type_name] = []
            
            matrix[type_name].append({
                'control_id': control.control_id,
                'name': control.name,
                'status': control.status.value,
                'effectiveness': control.effectiveness
            })
        
        return matrix

# 使用示例
if __name__ == "__main__":
    manager = ControlManager()
    
    # 实施控制措施
    manager.implement_control(ControlImplementation(
        control_id="C001",
        name="多因素认证",
        control_type=ControlType.PREVENTIVE,
        description="要求用户使用 MFA 登录",
        owner="安全团队",
        status=ControlStatus.OPERATIONAL,
        implementation_date=None,
        last_review_date=None,
        effectiveness=5,
        evidence=["MFA 配置截图", "策略文档"]
    ))
    
    # 生成控制矩阵
    matrix = manager.generate_control_matrix()
    print(f"控制矩阵: {matrix}")
```

#### [场景] 典型应用场景

- 安全控制实施
- 控制有效性评估
- 控制缺口识别

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 审计流程

#### [概念] 概念与解决的问题

合规审计验证组织是否符合法规和标准要求。包括内部审计和外部认证审计。审计流程包括准备、现场审计、报告、整改等阶段。

#### [语法] 核心用法

```python
from dataclasses import dataclass
from typing import List
from datetime import datetime
from enum import Enum

class AuditType(Enum):
    INTERNAL = "内部审计"
    EXTERNAL = "外部审计"
    CERTIFICATION = "认证审计"
    REGULATORY = "监管审计"

class AuditStatus(Enum):
    PLANNED = "计划中"
    IN_PROGRESS = "进行中"
    COMPLETED = "已完成"
    FAILED = "未通过"

@dataclass
class AuditFinding:
    finding_id: str
    control_id: str
    severity: str  # Major, Minor, Observation
    description: str
    recommendation: str
    status: str  # Open, In Progress, Closed

@dataclass
class Audit:
    audit_id: str
    audit_type: AuditType
    framework: str
    scope: List[str]
    auditor: str
    start_date: datetime
    end_date: datetime
    status: AuditStatus
    findings: List[AuditFinding]

class AuditManager:
    """审计管理器"""
    
    def __init__(self):
        self.audits: List[Audit] = []
    
    def create_audit(self, audit: Audit):
        """创建审计"""
        self.audits.append(audit)
    
    def add_finding(self, audit_id: str, finding: AuditFinding):
        """添加审计发现"""
        for audit in self.audits:
            if audit.audit_id == audit_id:
                audit.findings.append(finding)
    
    def generate_audit_report(self, audit_id: str) -> dict:
        """生成审计报告"""
        audit = next((a for a in self.audits if a.audit_id == audit_id), None)
        
        if not audit:
            return {}
        
        major_findings = [f for f in audit.findings if f.severity == "Major"]
        minor_findings = [f for f in audit.findings if f.severity == "Minor"]
        
        return {
            'audit_id': audit.audit_id,
            'framework': audit.framework,
            'audit_period': f"{audit.start_date} - {audit.end_date}",
            'total_findings': len(audit.findings),
            'major_findings': len(major_findings),
            'minor_findings': len(minor_findings),
            'status': audit.status.value,
            'recommendation': "通过" if len(major_findings) == 0 else "需要整改"
        }
```

#### [关联] 与核心层的关联

审计验证控制措施的有效性和合规状态。

### 2. 合规工具

#### [概念] 概念与解决的问题

合规工具自动化合规检查和管理流程。包括 GRC 平台、合规监控工具、证据收集工具等。

#### [语法] 核心用法

```python
import json
from datetime import datetime

class ComplianceAutomation:
    """合规自动化工具"""
    
    def __init__(self):
        self.policies = {}
        self.evidence = {}
    
    def collect_evidence(self, control_id: str, evidence_type: str, data: dict):
        """收集合规证据"""
        if control_id not in self.evidence:
            self.evidence[control_id] = []
        
        self.evidence[control_id].append({
            'type': evidence_type,
            'data': data,
            'collected_at': datetime.now().isoformat()
        })
    
    def run_compliance_check(self, control_id: str, check_function) -> dict:
        """运行合规检查"""
        result = check_function()
        
        return {
            'control_id': control_id,
            'compliant': result['compliant'],
            'details': result.get('details', {}),
            'checked_at': datetime.now().isoformat()
        }
    
    def generate_compliance_report(self, framework: str) -> dict:
        """生成合规报告"""
        return {
            'framework': framework,
            'generated_at': datetime.now().isoformat(),
            'evidence_count': sum(len(e) for e in self.evidence.values()),
            'controls_with_evidence': len(self.evidence)
        }

# 使用示例
def check_mfa_enabled():
    """检查 MFA 是否启用"""
    # 实际实现会检查系统配置
    return {
        'compliant': True,
        'details': {'mfa_enabled_users': 100, 'total_users': 100}
    }
```

#### [关联] 与核心层的关联

合规工具自动化风险评估和控制监控。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| GRC Platform | 治理风险合规平台 |
| Third-Party Risk | 第三方风险管理 |
| Privacy Impact Assessment | 隐私影响评估 |
| Data Classification | 数据分类 |
| Retention Policy | 数据保留策略 |
| Breach Notification | 数据泄露通知 |
| Consent Management | 同意管理 |
| Data Subject Rights | 数据主体权利 |
| Cross-Border Transfer | 跨境数据传输 |
| Compliance Training | 合规培训 |

---

## [实战] 核心实战清单

### 实战任务 1：建立合规管理体系

构建完整的合规管理体系：

```python
def build_compliance_program():
    """建立合规管理体系"""
    
    # 1. 确定适用法规
    applicable_frameworks = identify_applicable_frameworks()
    
    # 2. 差距分析
    gaps = perform_gap_analysis(applicable_frameworks)
    
    # 3. 制定整改计划
    remediation_plan = create_remediation_plan(gaps)
    
    # 4. 实施控制措施
    implement_controls(remediation_plan)
    
    # 5. 建立监控机制
    setup_monitoring()
    
    # 6. 准备审计
    prepare_audit()
    
    return "Compliance program established"
```
