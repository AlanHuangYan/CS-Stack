# Linux 系统管理 三层深度学习教程

## [总览] 技术总览

Linux 是服务器领域最流行的操作系统，掌握 Linux 系统管理是运维工程师和开发者的必备技能。包括用户管理、文件系统、进程管理、网络配置等核心内容。

本教程采用三层漏斗学习法：**核心层**聚焦文件操作、用户管理、进程管理三大基石；**重点层**深入 Shell 脚本、系统监控、服务管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 文件操作

#### [概念] 概念解释

Linux 文件系统采用树状结构，一切皆文件。掌握文件操作命令是 Linux 管理的基础。

#### [代码] 代码示例

```bash
# 文件和目录操作

# 创建目录
mkdir -p /path/to/directory

# 创建文件
touch file.txt

# 复制文件
cp source.txt destination.txt
cp -r source_dir/ destination_dir/

# 移动/重命名
mv old_name.txt new_name.txt
mv file.txt /new/path/

# 删除
rm file.txt
rm -r directory/
rm -rf directory/  # 强制删除

# 查看文件内容
cat file.txt
less file.txt
head -n 10 file.txt
tail -n 10 file.txt
tail -f /var/log/syslog  # 实时查看

# 查找文件
find /path -name "*.txt"
find /path -type f -mtime +7  # 7天前修改的文件
locate filename  # 快速查找

# 搜索内容
grep "pattern" file.txt
grep -r "pattern" /path/
grep -i "pattern" file.txt  # 忽略大小写

# 文件权限
chmod 755 script.sh
chmod +x script.sh
chown user:group file.txt
chown -R user:group directory/

# 磁盘操作
df -h  # 查看磁盘使用
du -sh /path  # 查看目录大小
lsblk  # 列出块设备
```

### 2. 用户管理

#### [概念] 概念解释

Linux 是多用户系统，用户管理包括创建用户、设置权限、管理组等操作。

#### [代码] 代码示例

```bash
# 用户管理

# 创建用户
useradd -m -s /bin/bash username
useradd -m -G sudo,docker username  # 添加到组

# 设置密码
passwd username

# 修改用户
usermod -aG docker username  # 添加到组
usermod -l newname oldname   # 重命名
usermod -L username          # 锁定用户
usermod -U username          # 解锁用户

# 删除用户
userdel -r username  # -r 删除家目录

# 组管理
groupadd developers
groupdel developers
gpasswd -a user developers  # 添加用户到组
gpasswd -d user developers  # 从组移除用户

# 查看用户信息
id username
groups username
whoami
who  # 当前登录用户
w    # 详细登录信息

# 切换用户
su - username
sudo -u username command

# sudo 配置
visudo
# 添加: username ALL=(ALL) NOPASSWD: ALL

# 查看用户配置文件
cat /etc/passwd
cat /etc/shadow
cat /etc/group
```

### 3. 进程管理

#### [概念] 概念解释

进程是程序的运行实例。Linux 提供丰富的进程管理命令，用于监控和控制进程。

#### [代码] 代码示例

```bash
# 进程管理

# 查看进程
ps aux
ps aux | grep nginx
ps -ef

# 动态监控
top
htop  # 更友好的界面

# 查看进程树
pstree
pstree -p

# 终止进程
kill PID
kill -9 PID  # 强制终止
killall process_name
pkill -f "pattern"

# 后台运行
command &
nohup command &
nohup command > output.log 2>&1 &

# 查看后台任务
jobs
fg %1  # 前台运行
bg %1  # 后台运行

# 进程优先级
nice -n 10 command  # 启动时设置
renice -n 5 -p PID  # 修改运行中的进程

# 系统资源
free -h  # 内存
vmstat  # 虚拟内存
iostat  # IO 统计
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Shell 脚本

#### [代码] 代码示例

```bash
#!/bin/bash

# 变量
NAME="World"
echo "Hello, $NAME"

# 条件判断
if [ -f "/etc/passwd" ]; then
    echo "File exists"
elif [ -d "/tmp" ]; then
    echo "Directory exists"
else
    echo "Not found"
fi

# 循环
for i in {1..5}; do
    echo "Number: $i"
done

while read line; do
    echo "$line"
done < file.txt

# 函数
greet() {
    local name=$1
    echo "Hello, $name"
}
greet "Alice"

# 参数处理
while getopts "u:p:" opt; do
    case $opt in
        u) USER=$OPTARG ;;
        p) PASS=$OPTARG ;;
        \?) echo "Invalid option"; exit 1 ;;
    esac
done

# 错误处理
set -e  # 遇错退出
set -u  # 未定义变量报错
trap 'echo "Error at line $LINENO"' ERR

# 实用脚本示例
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d)

backup_database() {
    local db=$1
    mysqldump -u root -p$DB_PASS $db > "$BACKUP_DIR/${db}_${DATE}.sql"
    gzip "$BACKUP_DIR/${db}_${DATE}.sql"
}

for db in db1 db2 db3; do
    backup_database $db
done

echo "Backup completed"
```

### 2. 系统监控

#### [代码] 代码示例

```bash
# 系统监控命令

# CPU
lscpu
cat /proc/cpuinfo
mpstat

# 内存
free -h
cat /proc/meminfo
vmstat 1

# 磁盘
df -h
du -sh /*
iostat -x 1

# 网络
netstat -tulpn
ss -tulpn
iftop
nethogs

# 系统负载
uptime
cat /proc/loadavg

# 日志
journalctl -u nginx
journalctl -f  # 实时
tail -f /var/log/syslog

# 监控脚本
#!/bin/bash
ALERT_THRESHOLD=90

check_disk() {
    usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ $usage -gt $ALERT_THRESHOLD ]; then
        echo "Warning: Disk usage is ${usage}%"
        # 发送告警
    fi
}

check_memory() {
    usage=$(free | awk '/Mem/{printf("%.0f"), $3/$2*100}')
    if [ $usage -gt $ALERT_THRESHOLD ]; then
        echo "Warning: Memory usage is ${usage}%"
    fi
}

check_disk
check_memory
```

### 3. 服务管理

#### [代码] 代码示例

```bash
# systemd 服务管理

# 服务操作
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx
systemctl status nginx

# 开机自启
systemctl enable nginx
systemctl disable nginx

# 查看服务
systemctl list-units --type=service
systemctl list-unit-files --type=service

# 创建服务
cat > /etc/systemd/system/myapp.service << EOF
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable myapp
systemctl start myapp

# 日志管理
journalctl -u myapp
journalctl -u myapp -f
journalctl --since "1 hour ago"
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| LVM | 需要逻辑卷管理时 |
| RAID | 需要磁盘阵列时 |
| Firewall | 需要防火墙配置时 |
| SELinux | 需要安全增强时 |
| Crontab | 需要定时任务时 |
| SSH Keys | 需要 SSH 密钥认证时 |
| Logrotate | 需要日志轮转时 |
| Systemd Timers | 需要 systemd 定时器时 |
| Network Namespaces | 需要网络命名空间时 |
| Containers | 需要容器化时 |

---

## [实战] 核心实战清单

### 实战任务 1：编写服务器健康检查脚本

```bash
#!/bin/bash

check_health() {
    echo "=== System Health Check ==="
    echo "Date: $(date)"
    echo ""
    
    # CPU
    echo "CPU Usage:"
    top -bn1 | head -5
    echo ""
    
    # Memory
    echo "Memory Usage:"
    free -h
    echo ""
    
    # Disk
    echo "Disk Usage:"
    df -h
    echo ""
    
    # Load
    echo "System Load:"
    uptime
    echo ""
    
    # Services
    echo "Service Status:"
    for service in nginx mysql docker; do
        systemctl is-active $service &>/dev/null && echo "$service: Running" || echo "$service: Stopped"
    done
}

check_health | mail -s "Daily Health Check" admin@example.com
```
