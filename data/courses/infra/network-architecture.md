# 网络架构设计 三层深度学习教程

## [总览] 技术总览

网络架构设计是构建可靠、安全、高性能网络基础设施的核心技能。涵盖网络拓扑设计、IP 地址规划、路由策略、安全策略等内容。良好的网络架构是云原生应用和企业 IT 基础设施的基石。

本教程采用三层漏斗学习法：**核心层**聚焦网络拓扑、IP 规划、路由基础三大基石；**重点层**深入网络安全和负载均衡；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 网络拓扑设计

#### [概念] 概念解释

网络拓扑定义了网络设备之间的连接方式和布局。常见拓扑包括星型、环型、总线型、树型和网状拓扑。现代数据中心通常采用三层架构：核心层、汇聚层、接入层。

#### [语法] 核心语法 / 命令 / API

| 拓扑类型 | 特点 | 适用场景 |
|----------|------|----------|
| 星型 | 中心节点连接所有设备 | 小型办公网络 |
| 树型 | 层级结构，易于扩展 | 企业园区网络 |
| 网状 | 多路径冗余 | 数据中心核心 |
| Spine-Leaf | 扁平化，等价多路径 | 现代数据中心 |

#### [代码] 代码示例

```hcl
# AWS VPC 三层网络架构设计
# 核心层：NAT Gateway, VPN Gateway
# 汇聚层：Public/Private Subnets
# 接入层：EC2 Instances

# VPC 配置
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "main-vpc"
  }
}

# 公有子网（汇聚层）
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
    Tier = "public"
  }
}

# 私有子网（接入层）
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "private-subnet-${count.index + 1}"
    Tier = "private"
  }
}

# 数据库子网（接入层）
resource "aws_subnet" "database" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "database-subnet-${count.index + 1}"
    Tier = "database"
  }
}
```

#### [场景] 典型应用场景

- 企业数据中心网络规划
- 云上 VPC 网络设计
- 多区域网络互联

### 2. IP 地址规划

#### [概念] 概念解释

IP 地址规划是网络设计的基础，合理的 IP 规划可以提高网络可管理性、安全性和路由效率。需要考虑 CIDR 划分、子网掩码、地址预留等因素。

#### [语法] 核心语法 / 命令 / API

| 规划原则 | 说明 | 示例 |
|----------|------|------|
| 层次化 | 按区域/服务划分 | 10.0.0.0/8 -> 10.1.0.0/16 |
| 连续性 | 预留扩展空间 | /24 实际使用 /25 |
| 可聚合 | 支持路由汇总 | 相邻子网合并通告 |
| 安全隔离 | 不同安全域分开 | DMZ、内网、管理网 |

#### [代码] 代码示例

```python
# IP 地址规划工具
import ipaddress

def plan_subnets(base_cidr, subnet_sizes):
    """
    规划子网地址
    base_cidr: 基础网段，如 "10.0.0.0/16"
    subnet_sizes: 子网主机数量列表，如 [500, 200, 100]
    """
    network = ipaddress.ip_network(base_cidr)
    subnets = []
    current = network
    
    for size in subnet_sizes:
        # 计算所需的前缀长度
        host_bits = (size - 1).bit_length()
        prefix = 32 - host_bits
        
        # 分配子网
        subnet = list(current.subnets(new_prefix=prefix))[0]
        subnets.append({
            'cidr': str(subnet),
            'usable_hosts': subnet.num_addresses - 2,
            'network': str(subnet.network_address),
            'broadcast': str(subnet.broadcast_address),
            'netmask': str(subnet.netmask)
        })
        
        # 更新剩余空间
        remaining = list(current.subnets(new_prefix=prefix))[1:]
        if remaining:
            current = remaining[0]
    
    return subnets

# 示例：规划企业网络
subnets = plan_subnets("10.0.0.0/16", [500, 200, 100, 50, 50])
for i, subnet in enumerate(subnets, 1):
    print(f"子网{i}: {subnet['cidr']} (可用主机: {subnet['usable_hosts']})")

# 输出:
# 子网1: 10.0.0.0/23 (可用主机: 510)
# 子网2: 10.0.2.0/24 (可用主机: 254)
# 子网3: 10.0.3.0/25 (可用主机: 126)
# 子网4: 10.0.3.128/26 (可用主机: 62)
# 子网5: 10.0.3.192/26 (可用主机: 62)
```

```bash
# Linux 网络配置
# 配置 IP 地址
ip addr add 10.0.1.10/24 dev eth0

# 添加路由
ip route add 10.0.2.0/24 via 10.0.1.1

# 查看路由表
ip route show

# 查看网络接口
ip addr show
```

#### [场景] 典型应用场景

- 企业内网 IP 规划
- 云上 VPC 子网划分
- VPN 互联地址规划

### 3. 路由基础

#### [概念] 概念解释

路由决定了数据包从源到目的的传输路径。包括静态路由和动态路由协议（OSPF、BGP）。理解路由原理是网络故障排查的基础。

#### [语法] 核心语法 / 命令 / API

| 路由类型 | 说明 | 适用场景 |
|----------|------|----------|
| 直连路由 | 接口所在网段 | 自动生成 |
| 静态路由 | 手动配置 | 简单网络 |
| OSPF | 链路状态协议 | 企业内网 |
| BGP | 路径向量协议 | 互联网、云互联 |

#### [代码] 代码示例

```hcl
# AWS 路由表配置

# 公有路由表
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

# 私有路由表
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  
  tags = {
    Name = "private-rt"
  }
}

# VPN 路由（连接企业数据中心）
resource "aws_route" "vpn" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "192.168.0.0/16"
  gateway_id             = aws_vpn_gateway.main.id
}

# 路由表关联
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
```

```bash
# Linux 路由配置

# 查看路由表
ip route show

# 添加默认网关
ip route add default via 10.0.1.1

# 添加静态路由
ip route add 192.168.1.0/24 via 10.0.1.254

# 添加策略路由（多路由表）
ip rule add from 10.0.2.0/24 table 100
ip route add default via 10.0.2.1 table 100

# 持久化配置 (Ubuntu/Debian)
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 10.0.1.10/24
      routes:
        - to: default
          via: 10.0.1.1
        - to: 192.168.1.0/24
          via: 10.0.1.254
```

#### [场景] 典型应用场景

- 配置默认网关和静态路由
- 实现网络隔离和访问控制
- 多线路负载均衡

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 网络安全设计

#### [概念] 概念与解决的问题

网络安全设计通过防火墙、安全组、网络 ACL 等机制保护网络免受攻击。遵循最小权限原则和纵深防御策略。

#### [语法] 核心用法

| 安全机制 | 层级 | 特点 |
|----------|------|------|
| 安全组 | 实例级 | 有状态，白名单 |
| 网络 ACL | 子网级 | 无状态，黑白名单 |
| 防火墙 | 网络边界 | 高级功能 |
| WAF | 应用层 | Web 攻击防护 |

#### [代码] 代码示例

```hcl
# AWS 安全组和网络 ACL 配置

# Web 服务器安全组
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id
  
  # 允许 HTTP
  ingress {
    description = "HTTP from ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  # 允许 HTTPS
  ingress {
    description = "HTTPS from ALB"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  # 允许 SSH（仅限堡垒机）
  ingress {
    description = "SSH from bastion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }
  
  # 允许所有出站流量
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "web-sg"
  }
}

# 数据库安全组
resource "aws_security_group" "database" {
  name        = "database-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "MySQL from app"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  
  tags = {
    Name = "database-sg"
  }
}

# 网络 ACL（子网级防护）
resource "aws_network_acl" "main" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id
  
  # 允许入站 HTTP
  ingress {
    rule_no    = 100
    action     = "allow"
    from_port  = 80
    to_port    = 80
    protocol   = "tcp"
    cidr_block = "10.0.0.0/8"
  }
  
  # 允许出站响应
  egress {
    rule_no    = 100
    action     = "allow"
    from_port  = 0
    to_port    = 0
    protocol   = "-1"
    cidr_block = "0.0.0.0/0"
  }
  
  tags = {
    Name = "main-nacl"
  }
}
```

#### [关联] 与核心层的关联

网络安全基于网络拓扑和路由设计，是架构设计的重要组成部分。

### 2. 负载均衡设计

#### [概念] 概念与解决的问题

负载均衡将流量分发到多个后端服务器，提高可用性和性能。包括四层（TCP/UDP）和七层（HTTP/HTTPS）负载均衡。

#### [语法] 核心用法

```hcl
# AWS Application Load Balancer 配置

# 创建 ALB
resource "aws_lb" "web" {
  name               = "web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = true
  
  tags = {
    Name = "web-alb"
  }
}

# 目标组
resource "aws_lb_target_group" "web" {
  name     = "web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

# HTTP 监听器
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.web.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# HTTPS 监听器
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.web.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# 基于路径的路由
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}
```

#### [代码] 代码示例

```nginx
# Nginx 负载均衡配置
upstream backend {
    # 负载均衡算法
    least_conn;  # 最少连接
    
    # 后端服务器
    server 10.0.1.10:8080 weight=3;
    server 10.0.1.11:8080 weight=2;
    server 10.0.1.12:8080 backup;  # 备用服务器
    
    # 健康检查
    keepalive 32;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
        proxy_send_timeout 30s;
    }
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### [关联] 与核心层的关联

负载均衡器部署在公有子网，后端服务器部署在私有子网，形成典型的三层架构。

### 3. VPN 与混合云网络

#### [概念] 概念与解决的问题

VPN 连接云上 VPC 和企业数据中心，实现混合云架构。包括 Site-to-Site VPN、Direct Connect 等方式。

#### [语法] 核心用法

```hcl
# AWS Site-to-Site VPN 配置

# VPN 网关
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "main-vgw"
  }
}

# 客户网关（企业数据中心）
resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  ip_address = "203.0.113.1"  # 企业公网 IP
  type       = "ipsec.1"
  
  tags = {
    Name = "dc-cgw"
  }
}

# VPN 连接
resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = true
  
  tags = {
    Name = "dc-vpn"
  }
}

# VPN 路由
resource "aws_vpn_connection_route" "office" {
  vpn_connection_id      = aws_vpn_connection.main.id
  destination_cidr_block = "192.168.0.0/16"
}
```

#### [代码] 代码示例

```bash
# StrongSwan VPN 配置 (Linux)

# /etc/ipsec.conf
conn aws-vpn
    authby=secret
    left=%defaultroute
    leftid=203.0.113.1
    leftsubnet=192.168.0.0/16
    right=52.10.10.10
    rightsubnet=10.0.0.0/16
    keyexchange=ikev1
    ike=aes128-sha1-modp1024
    esp=aes128-sha1
    keyingtries=0
    ikelifetime=8h
    lifetime=1h
    dpddelay=10
    dpdtimeout=30
    dpdaction=restart
    auto=start

# /etc/ipsec.secrets
203.0.113.1 52.10.10.10 : PSK "your-pre-shared-key"

# 启动 VPN
systemctl start strongswan
```

#### [关联] 与核心层的关联

VPN 连接扩展了网络边界，需要与路由表和安全组配合配置。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| VPC Peering | VPC 互联 |
| Transit Gateway | 多 VPC 集中管理 |
| Direct Connect | 专线连接 |
| DNS | Route 53/DNS 服务器 |
| CDN | CloudFront 内容分发 |
| IPv6 | 双栈网络配置 |
| QoS | 服务质量保障 |
| SD-WAN | 软件定义广域网 |
| VXLAN | 虚拟网络叠加 |
| Anycast | 任播路由 |

---

## [实战] 核心实战清单

### 实战任务 1：设计三层 Web 应用网络架构

使用 Terraform 设计一个完整的三层 Web 应用网络架构：

1. VPC 和子网规划（公有/私有/数据库层）
2. NAT Gateway 和 Internet Gateway
3. 安全组和网络 ACL
4. Application Load Balancer
5. VPN 连接企业数据中心

```hcl
# 完整架构示例
module "network" {
  source = "./modules/network"
  
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]
  db_subnets      = ["10.0.100.0/24", "10.0.200.0/24"]
  
  enable_vpn      = true
  vpn_cidr        = "192.168.0.0/16"
  
  tags = {
    Environment = "prod"
    Project     = "web-app"
  }
}
```
