# Shell 脚本编程 三层深度学习教程

## [总览] 技术总览

Shell 脚本是 Linux/Unix 系统的命令行脚本语言，用于自动化系统管理、部署和数据处理任务。Bash 是最常用的 Shell，支持变量、条件判断、循环、函数等编程特性。

本教程采用三层漏斗学习法：**核心层**聚焦基础语法、流程控制、文本处理三大基石；**重点层**深入函数和错误处理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 基础语法与变量

#### [概念] 概念解释

Shell 脚本以 `#!/bin/bash` 开头指定解释器。变量无需声明类型，直接赋值。使用 `$` 引用变量，`$()` 或反引号执行命令替换。

#### [代码] 代码示例

```bash
#!/bin/bash

# 变量赋值（等号两边不能有空格）
name="Shell"
count=10
pi=3.14

# 使用变量
echo "Hello, $name!"
echo "Count: ${count}"

# 命令替换
current_date=$(date +%Y-%m-%d)
current_dir=`pwd`
echo "Today: $current_date"
echo "Directory: $current_dir"

# 特殊变量
echo "Script name: $0"        # 脚本名
echo "First argument: $1"     # 第一个参数
echo "All arguments: $@"      # 所有参数
echo "Number of arguments: $#" # 参数个数
echo "Exit status: $?"        # 上个命令退出状态
echo "Process ID: $$"         # 当前进程 ID

# 数组
fruits=("apple" "banana" "orange")
echo "First fruit: ${fruits[0]}"
echo "All fruits: ${fruits[@]}"
echo "Array length: ${#fruits[@]}"

# 关联数组（需要 declare）
declare -A scores
scores["alice"]=90
scores["bob"]=85
echo "Alice's score: ${scores[alice]}"

# 算术运算
a=10
b=3
echo "Add: $((a + b))"
echo "Sub: $((a - b))"
echo "Mul: $((a * b))"
echo "Div: $((a / b))"
echo "Mod: $((a % b))"

# 字符串操作
str="Hello World"
echo "Length: ${#str}"
echo "Substring: ${str:0:5}"
echo "Replace: ${str/World/Shell}"
echo "Upper: ${str^^}"
echo "Lower: ${str,,}"
```

### 2. 流程控制

#### [概念] 概念解释

Shell 支持条件判断（if/else）、循环（for/while/until）、分支选择（case）。条件测试使用 `test` 命令或 `[]`、`[[]]` 语法。

#### [代码] 代码示例

```bash
#!/bin/bash

# 条件判断
age=18

if [ $age -ge 18 ]; then
    echo "Adult"
elif [ $age -ge 13 ]; then
    echo "Teenager"
else
    echo "Child"
fi

# 数值比较
# -eq: 等于, -ne: 不等于
# -gt: 大于, -lt: 小于
# -ge: 大于等于, -le: 小于等于

# 字符串比较
str1="hello"
str2="world"
if [ "$str1" = "$str2" ]; then
    echo "Equal"
elif [ "$str1" != "$str2" ]; then
    echo "Not equal"
fi

# 文件测试
file="test.txt"
if [ -f "$file" ]; then
    echo "File exists"
fi
if [ -d "$file" ]; then
    echo "Directory exists"
fi
if [ -r "$file" ]; then
    echo "Readable"
fi
if [ -w "$file" ]; then
    echo "Writable"
fi

# for 循环
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

for i in {1..5}; do
    echo "Range: $i"
done

for i in {1..10..2}; do
    echo "Step 2: $i"
done

for file in *.txt; do
    echo "File: $file"
done

# C 风格 for 循环
for ((i=0; i<5; i++)); do
    echo "C-style: $i"
done

# while 循环
count=0
while [ $count -lt 5 ]; do
    echo "While: $count"
    ((count++))
done

# until 循环（条件为假时执行）
count=0
until [ $count -ge 5 ]; do
    echo "Until: $count"
    ((count++))
done

# case 语句
fruit="apple"
case $fruit in
    "apple")
        echo "Red fruit"
        ;;
    "banana")
        echo "Yellow fruit"
        ;;
    "orange"|"grape")
        echo "Orange or Grape"
        ;;
    *)
        echo "Unknown fruit"
        ;;
esac
```

### 3. 文本处理

#### [概念] 概念解释

Shell 常用 `grep` 搜索文本、`sed` 编辑文本、`awk` 处理结构化数据。这三个工具是文本处理的瑞士军刀。

#### [代码] 代码示例

```bash
#!/bin/bash

# 示例数据
cat > data.txt << EOF
Alice,25,Engineer,80000
Bob,30,Designer,70000
Charlie,28,Engineer,90000
Diana,22,Manager,75000
EOF

# grep - 文本搜索
echo "=== grep examples ==="
grep "Engineer" data.txt           # 包含 Engineer 的行
grep -i "engineer" data.txt        # 忽略大小写
grep -v "Engineer" data.txt        # 不包含 Engineer 的行
grep -c "Engineer" data.txt        # 统计匹配行数
grep -n "Engineer" data.txt        # 显示行号
grep -E "Engineer|Designer" data.txt  # 正则表达式

# sed - 流编辑器
echo "=== sed examples ==="
sed 's/Engineer/Developer/' data.txt      # 替换第一个匹配
sed 's/Engineer/Developer/g' data.txt     # 替换所有匹配
sed -n '2p' data.txt                      # 打印第 2 行
sed '2d' data.txt                         # 删除第 2 行
sed '/Bob/d' data.txt                     # 删除包含 Bob 的行
sed -i 's/Engineer/Developer/g' data.txt  # 直接修改文件

# awk - 文本处理
echo "=== awk examples ==="
awk -F',' '{print $1, $2}' data.txt       # 打印第 1,2 列
awk -F',' '{print $1, $4}' data.txt       # 打印姓名和薪资
awk -F',' '$3 == "Engineer"' data.txt     # 筛选 Engineer
awk -F',' '$4 > 75000' data.txt           # 薪资大于 75000
awk -F',' '{sum += $4} END {print sum}' data.txt  # 计算总薪资
awk -F',' '{print $1, $4*1.1}' data.txt   # 薪资涨 10%
awk -F',' 'NR==1 {print "Header: " $0}' data.txt  # 处理第一行

# 组合使用
echo "=== Combined examples ==="
# 统计 Engineer 的平均薪资
awk -F',' '$3 == "Engineer" {sum+=$4; count++} END {print "Avg:", sum/count}' data.txt

# 找出薪资最高的
sort -t',' -k4 -nr data.txt | head -1

# 提取所有姓名
cut -d',' -f1 data.txt

# 统计各职位人数
awk -F',' '{print $3}' data.txt | sort | uniq -c

# 清理
rm data.txt
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 函数与参数

#### [概念] 概念解释

Shell 函数使用 `function` 关键字或直接定义。函数可以接收参数，使用 `return` 返回状态码，通过 `echo` 返回值。

#### [代码] 代码示例

```bash
#!/bin/bash

# 函数定义
greet() {
    echo "Hello, $1!"
}

# 调用函数
greet "World"

# 带返回值的函数
add() {
    local sum=$(($1 + $2))
    echo $sum  # 通过 echo 返回值
}

result=$(add 5 3)
echo "Sum: $result"

# 使用 return 返回状态码
is_even() {
    if [ $(($1 % 2)) -eq 0 ]; then
        return 0  # 成功
    else
        return 1  # 失败
    fi
}

if is_even 4; then
    echo "4 is even"
fi

# 局部变量
counter() {
    local count=0  # 局部变量
    ((count++))
    echo $count
}

# 递归函数
factorial() {
    if [ $1 -le 1 ]; then
        echo 1
    else
        local prev=$(factorial $(($1 - 1)))
        echo $(($1 * prev))
    fi
}

result=$(factorial 5)
echo "5! = $result"

# 默认参数
greet_user() {
    local name=${1:-"Guest"}
    local greeting=${2:-"Hello"}
    echo "$greeting, $name!"
}

greet_user
greet_user "Alice"
greet_user "Bob" "Hi"

# 可变参数
sum_all() {
    local total=0
    for num in "$@"; do
        ((total += num))
    done
    echo $total
}

result=$(sum_all 1 2 3 4 5)
echo "Sum: $result"
```

### 2. 错误处理与调试

#### [概念] 概念解释

Shell 使用 `set` 命令控制脚本行为，`trap` 捕获信号和错误。良好的错误处理使脚本更健壮。

#### [代码] 代码示例

```bash
#!/bin/bash

# 错误处理选项
set -e  # 命令失败时退出
set -u  # 使用未定义变量时报错
set -o pipefail  # 管道中任一命令失败则退出

# 组合使用
set -euo pipefail

# trap 捕获信号
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/temp_$$
}

trap cleanup EXIT  # 脚本退出时执行
trap 'echo "Interrupted"; exit 1' INT  # Ctrl+C

# 错误处理函数
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# 使用示例
check_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        error_exit "File not found: $file"
    fi
}

# 带错误处理的命令
run_command() {
    local cmd=$1
    echo "Running: $cmd"
    if ! eval "$cmd"; then
        error_exit "Command failed: $cmd"
    fi
}

# 日志函数
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message"
}

log "INFO" "Starting script"
log "ERROR" "Something went wrong"

# 调试模式
debug_mode() {
    if [ "${DEBUG:-false}" = "true" ]; then
        set -x  # 打印执行的命令
    fi
}

debug_mode

# 使用示例
main() {
    log "INFO" "Script started"
    
    local temp_file="/tmp/temp_$$"
    touch "$temp_file"
    
    # 业务逻辑
    echo "Processing..."
    
    log "INFO" "Script completed"
}

main "$@"
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| cron | 定时任务 |
| xargs | 批量处理 |
| find | 文件查找 |
| tee | 同时输出到文件和屏幕 |
| process substitution | 进程替换 |
| here document | 多行输入 |
| parameter expansion | 参数扩展 |
| getopts | 命令行选项解析 |
| arrays | 数组操作 |
| subshell | 子 Shell |

---

## [实战] 核心实战清单

1. 编写一个日志分析脚本，统计错误日志数量并提取关键信息
2. 实现一个简单的备份脚本，支持增量备份和日志记录
3. 编写一个服务监控脚本，检测服务状态并在异常时发送通知

## [避坑] 三层避坑提醒

- **核心层误区**：变量赋值等号两边加空格导致语法错误
- **重点层误区**：忘记处理命令返回值，导致错误被忽略
- **扩展层建议**：使用 ShellCheck 工具检查脚本质量，遵循 Google Shell Style Guide
