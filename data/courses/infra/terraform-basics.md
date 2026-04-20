# Terraform 基础 三层深度学习教程

## [总览] 技术总览

Terraform 是 HashiCorp 开发的基础设施即代码（IaC）工具，使用声明式配置语言 HCL 管理云资源。支持 AWS、Azure、GCP 等主流云平台，实现基础设施的版本控制、自动化部署和环境一致性。

本教程采用三层漏斗学习法：**核心层**聚焦 HCL 语法、资源管理、状态管理三大基石；**重点层**深入模块化和最佳实践；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. HCL 语法基础

#### [概念] 概念解释

HCL（HashiCorp Configuration Language）是 Terraform 的配置语言，采用声明式风格描述基础设施的期望状态。基本结构包括 provider、resource、data、variable、output 等。

#### [语法] 核心语法 / 命令 / API

| 块类型 | 说明 | 示例 |
|--------|------|------|
| provider | 云服务提供商配置 | `provider "aws" {}` |
| resource | 资源定义 | `resource "aws_instance" "web" {}` |
| data | 数据源查询 | `data "aws_ami" "latest" {}` |
| variable | 输入变量 | `variable "region" {}` |
| output | 输出值 | `output "instance_ip" {}` |

#### [代码] 代码示例

```hcl
# main.tf - Terraform 基础配置

# 配置 AWS 提供商
provider "aws" {
  region = var.region
}

# 定义输入变量
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "terraform-demo"
  }
}

# 创建 EC2 实例
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  
  tags = var.tags
}

# 查询最新 Amazon Linux AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# 输出实例公网 IP
output "instance_public_ip" {
  description = "Public IP of the web instance"
  value       = aws_instance.web.public_ip
}

output "instance_id" {
  description = "ID of the web instance"
  value       = aws_instance.web.id
}
```

#### [场景] 典型应用场景

- 定义云资源配置
- 参数化配置实现环境复用
- 输出关键信息供其他工具使用

### 2. 资源管理

#### [概念] 概念解释

资源是 Terraform 管理的基础设施组件，每个资源对应云平台上的一个实体。Terraform 通过比较期望状态和实际状态来决定需要执行的操作。

#### [语法] 核心语法 / 命令 / API

| 命令 | 说明 | 用途 |
|------|------|------|
| terraform init | 初始化 | 下载 provider 插件 |
| terraform plan | 计划 | 预览变更 |
| terraform apply | 应用 | 执行变更 |
| terraform destroy | 销毁 | 删除所有资源 |
| terraform show | 显示 | 查看状态 |

#### [代码] 代码示例

```hcl
# vpc.tf - 创建 VPC 网络资源

# 创建 VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "main-vpc"
  }
}

# 创建子网
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

# 查询可用区
data "aws_availability_zones" "available" {
  state = "available"
}

# 创建互联网网关
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "main-igw"
  }
}

# 创建路由表
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "public-rt"
  }
}

# 关联路由表和子网
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

```bash
# Terraform 命令行操作

# 初始化项目
terraform init

# 格式化配置文件
terraform fmt

# 验证配置语法
terraform validate

# 查看执行计划
terraform plan -out=tfplan

# 应用变更
terraform apply tfplan

# 查看输出
terraform output

# 销毁资源
terraform destroy
```

#### [场景] 典型应用场景

- 创建 VPC 网络环境
- 部署 EC2 实例
- 配置安全组和网络 ACL

### 3. 状态管理

#### [概念] 概念解释

Terraform 状态文件记录了资源与实际基础设施的映射关系。状态管理是 Terraform 工作的核心，支持本地存储和远程存储。

#### [语法] 核心语法 / 命令 / API

| 后端类型 | 说明 | 适用场景 |
|----------|------|----------|
| local | 本地文件 | 个人开发 |
| s3 | AWS S3 | 团队协作 |
| azurerm | Azure Blob | Azure 环境 |
| gcs | Google Cloud Storage | GCP 环境 |
| terraform cloud | Terraform Cloud | 企业级管理 |

#### [代码] 代码示例

```hcl
# backend.tf - 状态存储配置

# 本地后端（默认）
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

# S3 远程后端（推荐生产使用）
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Azure Blob 后端
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state"
    storage_account_name = "tfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

```bash
# 状态管理命令

# 查看当前状态
terraform state list

# 查看特定资源状态
terraform state show aws_instance.web

# 移动资源到新名称
terraform state mv aws_instance.web aws_instance.web_server

# 从状态中移除资源（不删除实际资源）
terraform state rm aws_instance.web

# 导入现有资源到状态
terraform import aws_instance.web i-1234567890abcdef0

# 远程状态拉取
terraform state pull > terraform.tfstate
```

#### [场景] 典型应用场景

- 团队协作共享状态
- 状态锁定防止并发修改
- 导入已存在的资源

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 模块化设计

#### [概念] 概念与解决的问题

模块是可复用的 Terraform 配置单元，将相关资源组织在一起。模块化设计提高代码复用性、可维护性。

#### [语法] 核心用法

```hcl
# 模块目录结构
# modules/
#   vpc/
#     main.tf
#     variables.tf
#     outputs.tf
#   ec2/
#     main.tf
#     variables.tf
#     outputs.tf

# modules/vpc/variables.tf
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
}

# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags = {
    Name = "${var.name}-vpc"
  }
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_ids" {
  value = aws_subnet.public[*].id
}

# 使用模块
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr       = "10.0.0.0/16"
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  
  tags = {
    Environment = "prod"
  }
}

# 引用模块输出
resource "aws_instance" "web" {
  subnet_id = module.vpc.subnet_ids[0]
  # ...
}
```

#### [代码] 代码示例

```hcl
# 使用远程模块
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.0.0"
  
  name = "my-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
  
  tags = {
    Terraform   = "true"
    Environment = "prod"
  }
}

module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "2.0.0"
  
  name          = "web-server"
  instance_count = 2
  
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = module.vpc.public_subnets[0]
  
  tags = {
    Environment = "prod"
  }
}
```

#### [关联] 与核心层的关联

模块是对核心资源的封装，提高配置的组织性和复用性。

### 2. 变量与条件表达式

#### [概念] 概念与解决的问题

变量和条件表达式使配置更加灵活，支持多环境部署和动态配置。

#### [语法] 核心用法

```hcl
# 变量定义
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# 条件表达式
resource "aws_instance" "web" {
  count         = var.environment == "prod" ? 3 : 1
  instance_type = var.environment == "prod" ? "t3.medium" : "t2.micro"
  
  tags = {
    Name        = "web-${var.environment}"
    Environment = var.environment
  }
}

# locals 局部值
locals {
  common_tags = {
    Environment = var.environment
    Project     = "my-project"
    ManagedBy   = "terraform"
  }
  
  instance_count = {
    dev     = 1
    staging = 2
    prod    = 3
  }
}

# 使用 locals
resource "aws_instance" "web" {
  count = local.instance_count[var.environment]
  
  tags = merge(local.common_tags, {
    Name = "web-${count.index + 1}"
  })
}
```

#### [代码] 代码示例

```hcl
# terraform.tfvars - 变量值文件
environment   = "prod"
region        = "us-east-1"
instance_type = "t3.medium"

# dev.tfvars
environment   = "dev"
region        = "us-west-2"
instance_type = "t2.micro"

# 使用不同变量文件
# terraform apply -var-file="dev.tfvars"
# terraform apply -var-file="prod.tfvars"

# 动态块
resource "aws_security_group" "web" {
  name = "web-sg"
  vpc_id = module.vpc.vpc_id
  
  dynamic "ingress" {
    for_each = var.allowed_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}

variable "allowed_ports" {
  type    = list(number)
  default = [80, 443, 22]
}
```

#### [关联] 与核心层的关联

变量和条件表达式增强了资源配置的灵活性，支持多环境管理。

### 3. 工作空间管理

#### [概念] 概念与解决的问题

工作空间允许在同一配置下管理多个状态文件，适合管理多个环境（dev、staging、prod）。

#### [语法] 核心用法

```bash
# 创建工作空间
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# 列出工作空间
terraform workspace list

# 切换工作空间
terraform workspace select prod

# 查看当前工作空间
terraform workspace show
```

#### [代码] 代码示例

```hcl
# 使用工作空间区分环境
locals {
  environment = terraform.workspace
  
  instance_config = {
    dev     = { type = "t2.micro", count = 1 }
    staging = { type = "t2.small", count = 2 }
    prod    = { type = "t3.medium", count = 3 }
  }
  
  config = local.instance_config[local.environment]
}

resource "aws_instance" "web" {
  count         = local.config.count
  instance_type = local.config.type
  ami           = data.aws_ami.amazon_linux.id
  
  tags = {
    Name        = "web-${local.environment}-${count.index + 1}"
    Environment = local.environment
  }
}

# 基于工作空间的后端配置
resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-state-${terraform.workspace}"
  
  tags = {
    Environment = terraform.workspace
  }
}
```

#### [关联] 与核心层的关联

工作空间是状态管理的延伸，实现多环境隔离。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Provider | 云服务提供商插件配置 |
| Provisioner | 资源创建后执行脚本 |
| Data Source | 查询现有资源信息 |
| Lifecycle | 资源生命周期管理 |
| Import | 导入现有资源 |
| Taint | 标记资源重建 |
| Console | 交互式命令行 |
| Fmt | 格式化配置文件 |
| Graph | 生成依赖关系图 |
| Lock | 锁定 Provider 版本 |

---

## [实战] 核心实战清单

### 实战任务 1：创建可复用的 VPC 模块

创建一个可复用的 VPC 模块，支持自定义 CIDR、子网数量、NAT 网关配置：

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(var.tags, {
    Name = "${var.name}-vpc"
  })
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(var.tags, {
    Name = "${var.name}-public-${count.index + 1}"
  })
}

# 使用模块部署多环境
module "vpc_dev" {
  source = "./modules/vpc"
  
  name                = "dev"
  cidr_block          = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  availability_zones  = ["us-east-1a", "us-east-1b"]
  
  tags = {
    Environment = "dev"
  }
}
```
