# 云安全 三层深度学习教程

## [总览] 技术总览

云安全保护云计算环境中的数据、应用和基础设施。涵盖身份与访问管理、数据保护、网络安全、合规治理等方面。云安全遵循责任共担模型，云服务商和用户共同承担安全责任。

本教程采用三层漏斗学习法：**核心层**聚焦 IAM 安全、数据加密、网络安全三大基石；**重点层**深入安全合规和威胁检测；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. IAM 安全

#### [概念] 概念解释

IAM（Identity and Access Management）管理云资源的身份认证和访问控制。核心原则是最小权限原则，只授予完成任务所需的最小权限。

#### [语法] 核心语法 / 命令 / API

```python
import boto3
import json

iam = boto3.client('iam')

# 创建用户
def create_user(username: str) -> dict:
    """创建 IAM 用户"""
    response = iam.create_user(UserName=username)
    return response['User']

# 创建角色
def create_role(role_name: str, trust_policy: dict) -> dict:
    """创建 IAM 角色"""
    response = iam.create_role(
        RoleName=role_name,
        AssumeRolePolicyDocument=json.dumps(trust_policy)
    )
    return response['Role']

# 创建策略
def create_policy(policy_name: str, policy_document: dict) -> dict:
    """创建 IAM 策略"""
    response = iam.create_policy(
        PolicyName=policy_name,
        PolicyDocument=json.dumps(policy_document)
    )
    return response['Policy']

# 最小权限策略示例
minimal_s3_read_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}

# 附加策略到用户
def attach_user_policy(username: str, policy_arn: str):
    """附加策略到用户"""
    iam.attach_user_policy(
        UserName=username,
        PolicyArn=policy_arn
    )

# 创建访问密钥
def create_access_key(username: str) -> dict:
    """创建访问密钥"""
    response = iam.create_access_key(UserName=username)
    return response['AccessKey']

# 启用 MFA
def enable_mfa(username: str) -> dict:
    """启用 MFA"""
    response = iam.create_virtual_mfa_device(
        VirtualMFADeviceName=f"{username}-mfa"
    )
    return response['VirtualMFADevice']

# 安全最佳实践
def apply_security_best_practices(username: str):
    """应用安全最佳实践"""
    # 1. 设置密码策略
    iam.update_account_password_policy(
        MinimumPasswordLength=12,
        RequireSymbols=True,
        RequireNumbers=True,
        RequireUppercaseCharacters=True,
        RequireLowercaseCharacters=True,
        MaxPasswordAge=90,
        PasswordReusePrevention=5
    )
    
    # 2. 添加标签
    iam.tag_user(
        UserName=username,
        Tags=[
            {'Key': 'Environment', 'Value': 'Production'},
            {'Key': 'Owner', 'Value': 'SecurityTeam'}
        ]
    )
    
    # 3. 设置权限边界
    iam.put_user_permissions_boundary(
        UserName=username,
        PermissionsBoundary='arn:aws:iam::aws:policy/ReadOnlyAccess'
    )

# 审计用户权限
def audit_user_permissions(username: str) -> dict:
    """审计用户权限"""
    # 获取用户附加的策略
    attached_policies = iam.list_attached_user_policies(UserName=username)
    
    # 获取用户组
    groups = iam.list_groups_for_user(UserName=username)
    
    # 获取内联策略
    inline_policies = iam.list_user_policies(UserName=username)
    
    return {
        'attached_policies': attached_policies['AttachedPolicies'],
        'groups': groups['Groups'],
        'inline_policies': inline_policies['PolicyNames']
    }
```

#### [场景] 典型应用场景

- 多租户权限隔离
- 服务账号管理
- 临时凭证管理

### 2. 数据加密

#### [概念] 概念解释

云数据加密保护静态数据和传输数据。云服务商提供密钥管理服务（KMS）简化加密操作。加密范围包括存储、数据库、备份等。

#### [语法] 核心语法 / 命令 / API

```python
import boto3

kms = boto3.client('kms')
s3 = boto3.client('s3')

# 创建客户管理密钥
def create_kms_key(description: str) -> dict:
    """创建 KMS 密钥"""
    response = kms.create_key(
        Description=description,
        KeyUsage='ENCRYPT_DECRYPT',
        Origin='AWS_KMS'
    )
    return response['KeyMetadata']

# 加密数据
def encrypt_data(key_id: str, plaintext: bytes) -> bytes:
    """使用 KMS 加密数据"""
    response = kms.encrypt(
        KeyId=key_id,
        Plaintext=plaintext
    )
    return response['CiphertextBlob']

# 解密数据
def decrypt_data(ciphertext: bytes) -> bytes:
    """使用 KMS 解密数据"""
    response = kms.decrypt(CiphertextBlob=ciphertext)
    return response['Plaintext']

# S3 加密配置
def enable_s3_encryption(bucket_name: str, kms_key_id: str):
    """启用 S3 默认加密"""
    s3.put_bucket_encryption(
        Bucket=bucket_name,
        ServerSideEncryptionConfiguration={
            'Rules': [
                {
                    'ApplyServerSideEncryptionByDefault': {
                        'SSEAlgorithm': 'aws:kms',
                        'KMSMasterKeyID': kms_key_id
                    }
                }
            ]
        }
    )

# RDS 加密
def enable_rds_encryption(db_instance_identifier: str, kms_key_id: str):
    """启用 RDS 加密"""
    rds = boto3.client('rds')
    rds.modify_db_instance(
        DBInstanceIdentifier=db_instance_identifier,
        KmsKeyId=kms_key_id,
        ApplyImmediately=True
    )

# 密钥轮换
def enable_key_rotation(key_id: str):
    """启用密钥自动轮换"""
    kms.enable_key_rotation(KeyId=key_id)

# 密钥策略
def set_key_policy(key_id: str, policy: dict):
    """设置密钥策略"""
    kms.put_key_policy(
        KeyId=key_id,
        PolicyName='default',
        Policy=json.dumps(policy)
    )

# 使用示例
if __name__ == "__main__":
    # 创建密钥
    key = create_kms_key("Application encryption key")
    print(f"Created key: {key['KeyId']}")
    
    # 加密数据
    plaintext = b"Sensitive data"
    ciphertext = encrypt_data(key['KeyId'], plaintext)
    
    # 解密数据
    decrypted = decrypt_data(ciphertext)
    print(f"Decrypted: {decrypted}")
```

#### [场景] 典型应用场景

- 敏感数据存储加密
- 数据库加密
- 备份加密

### 3. 网络安全

#### [概念] 概念解释

云网络安全保护云资源的网络边界。包括 VPC 隔离、安全组、网络 ACL、VPN、WAF 等。遵循纵深防御原则。

#### [语法] 核心语法 / 命令 / API

```python
import boto3

ec2 = boto3.resource('ec2')
ec2_client = boto3.client('ec2')

# 创建安全组
def create_security_group(vpc_id: str, group_name: str, description: str) -> str:
    """创建安全组"""
    response = ec2_client.create_security_group(
        GroupName=group_name,
        Description=description,
        VpcId=vpc_id
    )
    return response['GroupId']

# 配置安全组规则
def configure_security_group(group_id: str):
    """配置安全组入站规则"""
    # 允许 HTTPS
    ec2_client.authorize_security_group_ingress(
        GroupId=group_id,
        IpPermissions=[
            {
                'IpProtocol': 'tcp',
                'FromPort': 443,
                'ToPort': 443,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            },
            {
                'IpProtocol': 'tcp',
                'FromPort': 22,
                'ToPort': 22,
                'IpRanges': [{'CidrIp': '10.0.0.0/8'}]  # 仅内网
            }
        ]
    )

# 创建网络 ACL
def create_network_acl(vpc_id: str) -> str:
    """创建网络 ACL"""
    response = ec2_client.create_network_acl(VpcId=vpc_id)
    return response['NetworkAcl']['NetworkAclId']

# 配置网络 ACL 规则
def configure_network_acl(acl_id: str, subnet_id: str):
    """配置网络 ACL"""
    # 入站规则
    ec2_client.create_network_acl_entry(
        NetworkAclId=acl_id,
        RuleNumber=100,
        Protocol='6',  # TCP
        RuleAction='allow',
        Egress=False,
        CidrBlock='0.0.0.0/0',
        PortRange={'From': 443, 'To': 443}
    )

# VPC Flow Logs
def enable_flow_logs(vpc_id: str, log_group_name: str):
    """启用 VPC Flow Logs"""
    logs = boto3.client('logs')
    
    # 创建日志组
    logs.create_log_group(logGroupName=log_group_name)
    
    # 启用 Flow Logs
    ec2_client.create_flow_logs(
        ResourceIds=[vpc_id],
        ResourceType='VPC',
        TrafficType='ALL',
        LogGroupName=log_group_name,
        DeliverLogsPermissionArn='arn:aws:iam::123456789012:role/flowLogsRole'
    )

# WAF 配置
def configure_waf(web_acl_name: str):
    """配置 WAF"""
    waf = boto3.client('wafv2')
    
    # 创建 Web ACL
    response = waf.create_web_acl(
        Name=web_acl_name,
        Scope='REGIONAL',
        DefaultAction={'Allow': {}},
        Rules=[
            {
                'Name': 'RateLimitRule',
                'Priority': 1,
                'Statement': {
                    'RateBasedStatement': {
                        'Limit': 1000,
                        'AggregateKeyType': 'IP'
                    }
                },
                'Action': {'Block': {}}
            },
            {
                'Name': 'SQLiRule',
                'Priority': 2,
                'Statement': {
                    'ManagedRuleGroupStatement': {
                        'VendorName': 'AWS',
                        'Name': 'AWSManagedRulesSQLiRuleSet'
                    }
                },
                'OverrideAction': {'None': {}}
            }
        ]
    )
    
    return response['Summary']['ARN']

# 使用示例
if __name__ == "__main__":
    # 创建安全组
    sg_id = create_security_group(
        'vpc-12345678',
        'web-server-sg',
        'Security group for web servers'
    )
    
    # 配置规则
    configure_security_group(sg_id)
    print(f"Configured security group: {sg_id}")
```

#### [场景] 典型应用场景

- 多层架构网络隔离
- DDoS 防护
- 入侵检测

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 安全合规

#### [概念] 概念与解决的问题

云安全合规确保云环境符合法规和标准要求。常见合规框架包括 SOC 2、ISO 27001、GDPR、HIPAA 等。需要持续监控和审计。

#### [语法] 核心用法

```python
import boto3

# AWS Config 合规检查
config = boto3.client('config')

def enable_config_rules():
    """启用 Config 规则"""
    # 创建配置记录器
    config.put_configuration_recorder(
        ConfigurationRecorder={
            'name': 'default',
            'roleARN': 'arn:aws:iam::123456789012:role/config-role',
            'recordingGroup': {'allSupported': True}
        }
    )
    
    # 启用规则
    config.put_config_rule(
        ConfigRule={
            'ConfigRuleName': 's3-bucket-server-side-encryption-enabled',
            'Source': {
                'Owner': 'AWS',
                'SourceIdentifier': 'S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED'
            }
        }
    )

# Security Hub 安全中心
def enable_security_hub():
    """启用 Security Hub"""
    security_hub = boto3.client('securityhub')
    security_hub.enable_security_hub()

# CloudTrail 审计日志
def setup_cloudtrail():
    """设置 CloudTrail"""
    cloudtrail = boto3.client('cloudtrail')
    
    cloudtrail.create_trail(
        Name='security-trail',
        S3BucketName='audit-logs-bucket',
        IncludeGlobalServiceEvents=True,
        IsMultiRegionTrail=True,
        EnableLogFileValidation=True
    )
    
    cloudtrail.start_logging(Name='security-trail')

# 合规报告
def get_compliance_summary() -> dict:
    """获取合规摘要"""
    security_hub = boto3.client('securityhub')
    
    response = security_hub.get_findings(
        Filters={
            'RecordState': [{'Value': 'ACTIVE', 'Comparison': 'EQUALS'}]
        }
    )
    
    return {
        'total_findings': len(response['Findings']),
        'critical': sum(1 for f in response['Findings'] if f['Severity']['Label'] == 'CRITICAL'),
        'high': sum(1 for f in response['Findings'] if f['Severity']['Label'] == 'HIGH')
    }
```

#### [关联] 与核心层的关联

合规检查基于 IAM、加密、网络安全配置的审计。

### 2. 威胁检测

#### [概念] 概念与解决的问题

云威胁检测识别云环境中的安全威胁和异常行为。使用 SIEM、IDS/IPS、异常检测等技术。

#### [语法] 核心用法

```python
import boto3

# GuardDuty 威胁检测
def enable_guardduty():
    """启用 GuardDuty"""
    guardduty = boto3.client('guardduty')
    
    response = guardduty.create_detector(
        Enable=True,
        FindingPublishingFrequency='FIFTEEN_MINUTES'
    )
    
    return response['DetectorId']

def get_guardduty_findings(detector_id: str) -> list:
    """获取 GuardDuty 发现"""
    guardduty = boto3.client('guardduty')
    
    response = guardduty.list_findings(
        DetectorId=detector_id,
        FindingCriteria={
            'Criterion': {
                'severity': {'Gte': 4}  # 中等及以上严重性
            }
        }
    )
    
    return response['FindingIds']

# CloudWatch 告警
def create_security_alarm():
    """创建安全告警"""
    cloudwatch = boto3.client('cloudwatch')
    
    cloudwatch.put_metric_alarm(
        AlarmName='UnauthorizedAPICalls',
        AlarmDescription='Alert on unauthorized API calls',
        MetricName='CallCount',
        Namespace='AWS/CloudTrail',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=5,
        ComparisonOperator='GreaterThanThreshold',
        TreatMissingData='notBreaching'
    )

# 安全事件响应
def security_incident_response(finding_id: str):
    """安全事件响应"""
    # 1. 记录事件
    # 2. 评估影响
    # 3. 遏制威胁
    # 4. 根除原因
    # 5. 恢复服务
    # 6. 总结改进
    
    steps = [
        "记录安全事件详情",
        "评估影响范围和严重程度",
        "隔离受影响资源",
        "修复根本原因",
        "恢复正常服务",
        "更新安全策略和流程"
    ]
    
    return steps
```

#### [关联] 与核心层的关联

威胁检测监控 IAM、网络、数据访问的异常行为。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Zero Trust | 零信任架构 |
| CASB | 云访问安全代理 |
| CSPM | 云安全态势管理 |
| CWPP | 云工作负载保护平台 |
| SIEM | 安全信息事件管理 |
| SOAR | 安全编排自动化响应 |
| DLP | 数据防泄漏 |
| Secret Management | 密钥管理 |
| Container Security | 容器安全 |
| Serverless Security | 无服务器安全 |

---

## [实战] 核心实战清单

### 实战任务 1：构建云安全基线

为云环境建立安全基线配置：

```python
def setup_security_baseline():
    """设置云安全基线"""
    
    # 1. IAM 安全
    # - 启用 MFA
    # - 设置密码策略
    # - 移除未使用的用户和密钥
    
    # 2. 网络安全
    # - 配置安全组最小权限
    # - 启用 VPC Flow Logs
    # - 部署 WAF
    
    # 3. 数据安全
    # - 启用 S3 加密
    # - 配置 KMS 密钥
    # - 启用备份加密
    
    # 4. 监控审计
    # - 启用 CloudTrail
    # - 启用 GuardDuty
    # - 配置安全告警
    
    # 5. 合规检查
    # - 启用 Config
    # - 启用 Security Hub
    # - 定期合规扫描
    
    return "Security baseline configured"
```
