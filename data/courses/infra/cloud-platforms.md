# 云平台基础 三层深度学习教程

## [总览] 技术总览

云平台提供按需的计算、存储、网络等基础设施服务，是现代应用部署的核心。主流云平台包括 AWS、Azure、GCP 和阿里云等。掌握云平台基础是云原生开发和运维的必备技能。

本教程采用三层漏斗学习法：**核心层**聚焦云服务模型、核心服务、计费模式三大基石；**重点层**深入云安全和架构设计；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 云服务模型

#### [概念] 概念解释

云服务模型定义了云服务提供商和用户之间的责任边界。主要有三种模型：IaaS（基础设施即服务）、PaaS（平台即服务）、SaaS（软件即服务）。

#### [语法] 核心语法 / 命令 / API

| 模型 | 说明 | 用户责任 |
|------|------|----------|
| IaaS | 提供虚拟机、存储、网络 | 操作系统、中间件、应用 |
| PaaS | 提供运行时环境 | 应用代码、数据 |
| SaaS | 提供完整应用 | 仅使用配置 |

#### [代码] 代码示例

```bash
# AWS CLI 创建 EC2 实例 (IaaS 示例)
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --count 1 \
    --instance-type t2.micro \
    --key-name my-key-pair \
    --security-group-ids sg-12345678

# Azure CLI 创建 Web App (PaaS 示例)
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE
az webapp create --name myWebApp --resource-group myResourceGroup --plan myAppServicePlan

# 阿里云 CLI 创建 ECS 实例
aliyun ecs CreateInstance \
    --ImageId centos_7_06_64_20G_alibase_20190218.vhd \
    --InstanceType ecs.t5-lc2m1.nano \
    --SecurityGroupId sg-1234567890
```

#### [场景] 典型应用场景

- IaaS：需要完全控制服务器环境的场景
- PaaS：快速部署 Web 应用，无需管理服务器
- SaaS：使用现成的企业应用如邮箱、CRM

### 2. 核心云服务

#### [概念] 概念解释

云平台提供计算、存储、网络、数据库等核心服务。理解这些服务是使用云平台的基础。

#### [语法] 核心语法 / 命令 / API

| 服务类型 | AWS | Azure | GCP | 阿里云 |
|----------|-----|-------|-----|--------|
| 计算 | EC2 | VM | Compute Engine | ECS |
| 存储 | S3 | Blob Storage | Cloud Storage | OSS |
| 数据库 | RDS | SQL Database | Cloud SQL | RDS |
| 网络 | VPC | VNet | VPC | VPC |

#### [代码] 代码示例

```bash
# AWS S3 存储操作
aws s3 mb s3://my-unique-bucket-name
aws s3 cp local-file.txt s3://my-unique-bucket-name/
aws s3 ls s3://my-unique-bucket-name/

# Azure Blob 存储操作
az storage account create --name mystorageaccount --resource-group myResourceGroup --location eastus --sku Standard_LRS
az storage container create --name mycontainer --account-name mystorageaccount

# GCP Cloud Storage 操作
gsutil mb gs://my-unique-bucket-name/
gsutil cp local-file.txt gs://my-unique-bucket-name/
gsutil ls gs://my-unique-bucket-name/

# 阿里云 OSS 操作
aliyun oss mb oss://my-bucket-name
aliyun oss cp local-file.txt oss://my-bucket-name/
```

#### [场景] 典型应用场景

- 对象存储：图片、视频、备份文件存储
- 云数据库：托管数据库服务，无需运维
- 虚拟网络：构建隔离的网络环境

### 3. 计费与成本管理

#### [概念] 概念解释

云平台采用按需付费模式，了解计费方式有助于控制成本。主要计费模式包括按量付费、预留实例、竞价实例。

#### [语法] 核心语法 / 命令 / API

| 计费模式 | 说明 | 适用场景 |
|----------|------|----------|
| 按量付费 | 按使用时长计费 | 开发测试、突发流量 |
| 预留实例 | 提前购买享受折扣 | 稳定长期负载 |
| 竞价实例 | 使用闲置资源，价格波动 | 批处理、容错任务 |

#### [代码] 代码示例

```bash
# AWS 查看账单
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost

# 设置预算告警
aws budgets create-budget \
    --account-id 123456789012 \
    --budget file://budget.json

# budget.json 内容
{
    "BudgetName": "MonthlyBudget",
    "BudgetLimit": {
        "Amount": 100,
        "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
}

# Azure 查看消费
az consumption usage list --top 10

# 阿里云查看账单
aliyun bss DescribeInstanceBill --BillingCycle 2024-01
```

#### [场景] 典型应用场景

- 成本监控：定期查看消费趋势
- 预算控制：设置告警防止超支
- 资源优化：识别闲置资源降低成本

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 云安全基础

#### [概念] 概念与解决的问题

云安全遵循责任共担模型，云服务商负责云本身的安全，用户负责云中资源的安全。理解安全最佳实践可以保护数据和应用。

#### [语法] 核心用法

| 安全领域 | 措施 | 说明 |
|----------|------|------|
| 身份认证 | IAM | 最小权限原则 |
| 网络安全 | 安全组/防火墙 | 限制入站出站流量 |
| 数据安全 | 加密 | 传输和存储加密 |
| 审计 | 日志记录 | 记录所有操作 |

#### [代码] 代码示例

```bash
# AWS IAM 创建用户并授权
aws iam create-user --user-name app-user
aws iam attach-user-policy --user-name app-user --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# 创建安全组规则
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Azure 网络安全组
az network nsg create --resource-group myResourceGroup --name myNSG
az network nsg rule create --resource-group myResourceGroup --nsg-name myNSG --name AllowHTTPS --protocol tcp --destination-port-range 443 --access Allow

# 启用存储加密
aws s3api put-bucket-encryption \
    --bucket my-bucket \
    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

#### [关联] 与核心层的关联

安全配置需要与计算、存储、网络服务配合使用，确保整体架构安全。

### 2. 高可用架构设计

#### [概念] 概念与解决的问题

高可用架构通过多可用区部署、负载均衡、自动伸缩等机制，确保服务持续可用。

#### [语法] 核心用法

```bash
# 创建多可用区负载均衡器
aws elbv2 create-load-balancer \
    --name my-load-balancer \
    --subnets subnet-1 subnet-2 \
    --type application

# 创建自动伸缩组
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name my-asg \
    --launch-template LaunchTemplateId=lt-12345678 \
    --min-size 2 \
    --max-size 6 \
    --vpc-zone-identifier "subnet-1,subnet-2"
```

#### [代码] 代码示例

```python
import boto3

# 使用 Python SDK 创建高可用架构
elbv2 = boto3.client('elbv2')

# 创建负载均衡器
response = elbv2.create_load_balancer(
    Name='my-alb',
    Subnets=['subnet-1', 'subnet-2'],
    Scheme='internet-facing',
    Type='application'
)

# 创建目标组
target_group = elbv2.create_target_group(
    Name='my-targets',
    Protocol='HTTP',
    Port=80,
    VpcId='vpc-12345678',
    HealthCheckPath='/health'
)

# 创建监听器
listener = elbv2.create_listener(
    LoadBalancerArn=response['LoadBalancers'][0]['LoadBalancerArn'],
    Protocol='HTTP',
    Port=80,
    DefaultActions=[{
        'Type': 'forward',
        'TargetGroupArn': target_group['TargetGroups'][0]['TargetGroupArn']
    }]
)
```

#### [关联] 与核心层的关联

高可用架构基于核心计算和网络服务构建，是生产环境的标准配置。

### 3. 基础设施即代码

#### [概念] 概念与解决的问题

基础设施即代码（IaC）使用代码管理云资源，实现版本控制、自动化部署、环境一致性。

#### [语法] 核心用法

```hcl
# Terraform 配置示例
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
  }
}
```

#### [代码] 代码示例

```bash
# Terraform 基本工作流
terraform init
terraform plan
terraform apply
terraform destroy

# AWS CloudFormation 部署
aws cloudformation create-stack \
    --stack-name my-stack \
    --template-body file://template.yaml \
    --parameters ParameterKey=KeyName,ParameterValue=my-key
```

#### [关联] 与核心层的关联

IaC 是管理核心云服务的最佳实践，提高运维效率和可靠性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| 无服务器 | Lambda/Functions 事件驱动计算 |
| 容器服务 | EKS/AKS/GKE Kubernetes 托管 |
| CDN | CloudFront/CDN 内容分发加速 |
| DNS | Route 53/Azure DNS 域名解析 |
| 监控 | CloudWatch/Azure Monitor 可观测性 |
| 消息队列 | SQS/Service Bus 异步通信 |
| 缓存 | ElastiCache/Redis 托管缓存 |
| 数据湖 | S3/Data Lake 大数据存储 |
| 机器学习 | SageMaker/ML Studio AI 服务 |
| 边缘计算 | Lambda@Edge/Edge Functions |

---

## [实战] 核心实战清单

### 实战任务 1：部署高可用 Web 应用

使用云平台核心服务部署一个高可用的 Web 应用：

1. 创建 VPC 和子网（至少 2 个可用区）
2. 部署负载均衡器
3. 创建自动伸缩组
4. 配置数据库服务
5. 设置监控告警

```bash
# 使用 Terraform 完整部署
# 1. 初始化项目
terraform init

# 2. 查看执行计划
terraform plan

# 3. 应用配置
terraform apply

# 4. 验证部署
curl http://$(terraform output load_balancer_dns)
```
