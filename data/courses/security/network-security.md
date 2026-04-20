# 网络安全 三层深度学习教程

## [总览] 技术总览

网络安全是保护计算机网络和数据免受攻击的技术和实践。包括防火墙配置、入侵检测、漏洞扫描、安全加固等内容。掌握网络安全是运维和安全工程师的核心技能。

本教程采用三层漏斗学习法：**核心层**聚焦防火墙配置、端口扫描、安全加固三大基石；**重点层**深入入侵检测、漏洞评估、日志分析；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 防火墙配置

#### [概念] 概念解释

防火墙是网络安全的第一道防线，通过规则控制网络流量。Linux 使用 iptables 或 firewalld 作为防火墙工具。

#### [代码] 代码示例

```bash
# iptables 基础

# 查看规则
iptables -L -n -v
iptables -L -n --line-numbers

# 允许 SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许本地回环
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 删除规则
iptables -D INPUT 1
iptables -F  # 清空所有规则

# 保存规则
iptables-save > /etc/iptables/rules.v4
iptables-restore < /etc/iptables/rules.v4

# firewalld 基础
firewall-cmd --state
firewall-cmd --list-all

# 开放端口
firewall-cmd --add-port=80/tcp --permanent
firewall-cmd --add-port=443/tcp --permanent
firewall-cmd --reload

# 开放服务
firewall-cmd --add-service=http --permanent
firewall-cmd --add-service=https --permanent

# 区域管理
firewall-cmd --get-zones
firewall-cmd --set-default-zone=public
```

### 2. 端口扫描

#### [概念] 概念解释

端口扫描用于发现网络服务和潜在漏洞。Nmap 是最流行的端口扫描工具。

#### [代码] 代码示例

```bash
# Nmap 基础扫描

# TCP 扫描
nmap 192.168.1.1
nmap -sT 192.168.1.1

# SYN 扫描（需要 root）
nmap -sS 192.168.1.1

# UDP 扫描
nmap -sU 192.168.1.1

# 端口范围
nmap -p 1-1000 192.168.1.1
nmap -p 80,443,22 192.168.1.1

# 服务版本检测
nmap -sV 192.168.1.1

# 操作系统检测
nmap -O 192.168.1.1

# 全面扫描
nmap -A 192.168.1.1

# 扫描网段
nmap 192.168.1.0/24

# 脚本扫描
nmap --script vuln 192.168.1.1
nmap --script auth 192.168.1.1

# 输出格式
nmap -oN output.txt 192.168.1.1
nmap -oX output.xml 192.168.1.1

# Netcat 端口检测
nc -zv 192.168.1.1 80
nc -zv 192.168.1.1 1-1000
```

### 3. 安全加固

#### [概念] 概念解释

安全加固是减少系统攻击面的过程，包括关闭不必要服务、更新软件、配置安全策略等。

#### [代码] 代码示例

```bash
# SSH 加固

# 编辑 /etc/ssh/sshd_config
Port 2222                    # 更改默认端口
PermitRootLogin no           # 禁止 root 登录
PasswordAuthentication no    # 禁用密码登录
PubkeyAuthentication yes     # 启用密钥登录
MaxAuthTries 3               # 最大尝试次数
ClientAliveInterval 300      # 空闲超时
ClientAliveCountMax 2

# 重启 SSH
systemctl restart sshd

# 系统加固

# 更新系统
apt update && apt upgrade -y
yum update -y

# 安装安全工具
apt install fail2ban -y
apt install rkhunter -y

# 配置 fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 2222
EOF

systemctl enable fail2ban
systemctl start fail2ban

# 禁用不必要服务
systemctl disable bluetooth
systemctl stop bluetooth

# 内核安全参数
cat >> /etc/sysctl.conf << EOF
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
EOF

sysctl -p
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 入侵检测

#### [代码] 代码示例

```bash
# 安装 OSSEC
wget https://github.com/ossec/ossec-hids/archive/3.6.0.tar.gz
tar -xzf 3.6.0.tar.gz
cd ossec-hids-3.6.0
./install.sh

# 配置规则
cat >> /var/ossec/etc/ossec.conf << EOF
<rules>
  <rule id="100001" level="10">
    <if_sid>5501</if_sid>
    <match>illegal user|invalid user</match>
    <description>sshd: Attempt to login using a non-existent user</description>
  </rule>
</rules>
EOF

# 文件完整性监控
cat >> /var/ossec/etc/ossec.conf << EOF
<syscheck>
  <directories check_all="yes">/etc,/usr/bin,/usr/sbin</directories>
  <directories check_all="yes">/bin,/sbin</directories>
</syscheck>
EOF

# Rootkit 检测
rkhunter --update
rkhunter --check

# 日志监控
grep "Failed password" /var/log/auth.log
grep "Invalid user" /var/log/auth.log
```

### 2. 漏洞评估

#### [代码] 代码示例

```bash
# OpenVAS 安装
apt install openvas
gvm-setup

# 扫描目标
gvm-cli socket --xml "<create_target><name>Test Target</name><hosts>192.168.1.1</hosts></create_target>"

# 创建任务
gvm-cli socket --xml "<create_task><name>Test Scan</name><target id='TARGET_ID'/><config id='CONFIG_ID'/></create_task>"

# 启动扫描
gvm-cli socket --xml "<start_task task_id='TASK_ID'/>"

# 使用 Lynis 审计
apt install lynis
lynis audit system

# 查看报告
cat /var/log/lynis-report.dat
```

### 3. 日志分析

#### [代码] 代码示例

```bash
# 日志分析脚本
#!/bin/bash

# SSH 登录失败统计
echo "=== SSH Failed Logins ==="
grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -10

# 暴力破解 IP
echo "=== Brute Force IPs ==="
grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | awk '$1 > 10 {print $2}'

# 成功登录
echo "=== Successful Logins ==="
grep "Accepted password" /var/log/auth.log | tail -20

# sudo 使用
echo "=== Sudo Usage ==="
grep "sudo:" /var/log/auth.log | tail -20

# 网络连接
echo "=== Network Connections ==="
netstat -tunap

# 可疑进程
echo "=== Suspicious Processes ==="
ps aux --sort=-%cpu | head -20
ps aux --sort=-%mem | head -20

# 使用 ELK 分析
# Filebeat 配置
cat > /etc/filebeat/filebeat.yml << EOF
filebeat.inputs:
- type: log
  paths:
    - /var/log/auth.log
  fields:
    type: auth
output.elasticsearch:
  hosts: ["localhost:9200"]
EOF

systemctl start filebeat
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| IDS/IPS | 需要入侵检测/防御时 |
| SIEM | 需要安全信息管理时 |
| VPN | 需要虚拟专用网络时 |
| SSL/TLS | 需要加密通信时 |
| Two-Factor Auth | 需要双因素认证时 |
| Security Audit | 需要安全审计时 |
| Penetration Testing | 需要渗透测试时 |
| DDoS Protection | 需要 DDoS 防护时 |
| WAF | 需要 Web 应用防火墙时 |
| Honeypot | 需要蜜罐时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建服务器安全基线脚本

```bash
#!/bin/bash

security_hardening() {
    echo "Starting security hardening..."
    
    # 更新系统
    apt update && apt upgrade -y
    
    # 安装安全工具
    apt install -y fail2ban ufw rkhunter
    
    # 配置防火墙
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    # SSH 加固
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    systemctl restart sshd
    
    # 配置 fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # 内核安全
    sysctl -w net.ipv4.tcp_syncookies=1
    sysctl -w net.ipv4.conf.all.rp_filter=1
    
    # Rootkit 扫描
    rkhunter --update
    rkhunter --check --skip-keypress
    
    echo "Security hardening completed!"
}

security_hardening
```
