# Hadoop 基础 三层深度学习教程

## [总览] 技术总览

Hadoop 是分布式计算框架，用于处理大规模数据。核心组件包括 HDFS（分布式文件系统）和 MapReduce（分布式计算框架）。是大数据处理的基石技术。

本教程采用三层漏斗学习法：**核心层**聚焦 HDFS 操作、MapReduce 编程、YARN 资源管理三大基石；**重点层**深入 Hive 数据仓库、HBase 数据库、集群管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. HDFS 操作

#### [概念] 概念解释

HDFS（Hadoop Distributed File System）是分布式文件系统，将大文件分割成块存储在多个节点上，提供高容错和高吞吐量。

#### [代码] 代码示例

```bash
# HDFS 基本命令

# 查看目录
hdfs dfs -ls /
hdfs dfs -ls /user/hadoop

# 创建目录
hdfs dfs -mkdir -p /user/hadoop/input

# 上传文件
hdfs dfs -put localfile.txt /user/hadoop/input/
hdfs dfs -copyFromLocal localfile.txt /user/hadoop/input/

# 下载文件
hdfs dfs -get /user/hadoop/output/result.txt ./
hdfs dfs -copyToLocal /user/hadoop/output/result.txt ./

# 查看文件内容
hdfs dfs -cat /user/hadoop/input/file.txt
hdfs dfs -tail /user/hadoop/input/file.txt

# 删除文件/目录
hdfs dfs -rm /user/hadoop/input/file.txt
hdfs dfs -rm -r /user/hadoop/input/

# 移动/重命名
hdfs dfs -mv /user/hadoop/input/file.txt /user/hadoop/output/

# 复制
hdfs dfs -cp /user/hadoop/input/file.txt /user/hadoop/backup/

# 查看文件统计信息
hdfs dfs -stat /user/hadoop/input/file.txt
hdfs dfs -du -h /user/hadoop/

# 检查文件系统状态
hdfs fsck /
hdfs dfsadmin -report
```

```python
# Python HDFS 操作 (使用 hdfs 库)
from hdfs import InsecureClient

# 连接 HDFS
client = InsecureClient('http://namenode:50070', user='hadoop')

# 列出目录
files = client.list('/user/hadoop')
print(files)

# 上传文件
client.upload('/user/hadoop/input/', 'local_file.txt')

# 下载文件
client.download('/user/hadoop/output/result.txt', './')

# 读取文件
with client.read('/user/hadoop/input/file.txt') as reader:
    content = reader.read()
    print(content.decode())

# 创建目录
client.makedirs('/user/hadoop/new_dir')

# 删除文件
client.delete('/user/hadoop/input/file.txt')

# 检查文件是否存在
if client.status('/user/hadoop/input/file.txt', strict=False):
    print('File exists')
```

### 2. MapReduce 编程

#### [概念] 概念解释

MapReduce 是分布式计算模型，将任务分解为 Map（映射）和 Reduce（归约）两个阶段，并行处理大规模数据。

#### [代码] 代码示例

```python
# MapReduce Word Count (Python)
#!/usr/bin/env python3
import sys

# Mapper
def mapper():
    for line in sys.stdin:
        line = line.strip()
        words = line.split()
        for word in words:
            print(f'{word}\t1')

# Reducer
def reducer():
    current_word = None
    current_count = 0
    
    for line in sys.stdin:
        word, count = line.strip().split('\t')
        count = int(count)
        
        if current_word == word:
            current_count += count
        else:
            if current_word:
                print(f'{current_word}\t{current_count}')
            current_word = word
            current_count = count
    
    if current_word:
        print(f'{current_word}\t{current_count}')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'mapper':
        mapper()
    elif len(sys.argv) > 1 and sys.argv[1] == 'reducer':
        reducer()
```

```bash
# 运行 MapReduce 作业

# 使用 Hadoop Streaming
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -input /user/hadoop/input \
    -output /user/hadoop/output \
    -mapper "python3 mapper.py mapper" \
    -reducer "python3 reducer.py reducer" \
    -file mapper.py \
    -file reducer.py
```

```java
// MapReduce Word Count (Java)
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class WordCount {
    
    public static class TokenizerMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();
        
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            String line = value.toString();
            String[] words = line.split("\\s+");
            for (String w : words) {
                word.set(w);
                context.write(word, one);
            }
        }
    }
    
    public static class IntSumReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
        private IntWritable result = new IntWritable();
        
        public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            result.set(sum);
            context.write(key, result);
        }
    }
}
```

### 3. YARN 资源管理

#### [概念] 概念解释

YARN（Yet Another Resource Negotiator）是 Hadoop 的资源管理系统，负责集群资源分配和任务调度。

#### [代码] 代码示例

```bash
# YARN 命令

# 查看应用列表
yarn application -list
yarn application -list -appStates RUNNING

# 查看应用状态
yarn application -status application_1234567890_0001

# 杀死应用
yarn application -kill application_1234567890_0001

# 查看节点状态
yarn node -list
yarn node -status node1:8041

# 查看队列
yarn queue -list

# 查看日志
yarn logs -applicationId application_1234567890_0001

# 查看集群指标
yarn cluster -daemonlog

# ResourceManager Web UI
# http://resourcemanager:8088
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Hive 数据仓库

#### [代码] 代码示例

```sql
-- Hive SQL

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

-- 创建表
CREATE TABLE IF NOT EXISTS users (
    id INT,
    name STRING,
    email STRING,
    created_at TIMESTAMP
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

-- 创建分区表
CREATE TABLE logs (
    id INT,
    message STRING,
    level STRING
)
PARTITIONED BY (dt STRING)
STORED AS ORC;

-- 加载数据
LOAD DATA INPATH '/user/hadoop/users.csv' INTO TABLE users;

-- 插入数据
INSERT INTO TABLE logs PARTITION (dt='2024-01-01')
SELECT id, message, level FROM staging_logs;

-- 查询
SELECT name, COUNT(*) as count
FROM users
GROUP BY name
ORDER BY count DESC;

-- 连接查询
SELECT u.name, l.message
FROM users u
JOIN logs l ON u.id = l.id
WHERE l.dt = '2024-01-01';

-- 创建视图
CREATE VIEW active_users AS
SELECT * FROM users WHERE created_at > '2024-01-01';
```

### 2. HBase 数据库

#### [代码] 代码示例

```bash
# HBase Shell

# 创建表
create 'users', 'info', 'activity'

# 查看表
list
describe 'users'

# 插入数据
put 'users', 'user1', 'info:name', 'Alice'
put 'users', 'user1', 'info:email', 'alice@example.com'
put 'users', 'user1', 'activity:login', '2024-01-01'

# 读取数据
get 'users', 'user1'
get 'users', 'user1', 'info:name'

# 扫描表
scan 'users'
scan 'users', {STARTROW => 'user1', STOPROW => 'user3'}

# 删除数据
delete 'users', 'user1', 'info:email'
deleteall 'users', 'user1'

# 禁用/启用表
disable 'users'
enable 'users'

# 删除表
disable 'users'
drop 'users'
```

```python
# Python HBase 操作 (使用 happybase)
import happybase

# 连接 HBase
connection = happybase.Connection('localhost')
connection.open()

# 创建表
connection.create_table(
    'users',
    {
        'info': dict(max_versions=5),
        'activity': dict(max_versions=1)
    }
)

# 获取表
table = connection.table('users')

# 插入数据
table.put(b'user1', {b'info:name': b'Alice', b'info:email': b'alice@example.com'})

# 读取数据
row = table.row(b'user1')
print(row[b'info:name'])

# 扫描
for key, data in table.scan():
    print(key, data)

# 删除数据
table.delete(b'user1')

# 关闭连接
connection.close()
```

### 3. 集群管理

#### [代码] 代码示例

```bash
# 集群管理命令

# 启动 HDFS
start-dfs.sh
stop-dfs.sh

# 启动 YARN
start-yarn.sh
stop-yarn.sh

# 启动所有服务
start-all.sh
stop-all.sh

# 查看进程
jps

# NameNode 管理
hdfs namenode -format  # 格式化（仅首次）
hdfs namenode -recover  # 恢复模式

# DataNode 管理
hdfs dfsadmin -refreshNodes  # 刷新节点

# 安全模式
hdfs dfsadmin -safemode enter
hdfs dfsadmin -safemode leave
hdfs dfsadmin -safemode get

# 均衡数据
hdfs balancer

# 检查文件系统
hdfs fsck / -files -blocks -locations

# 监控
# NameNode UI: http://namenode:9870
# ResourceManager UI: http://resourcemanager:8088
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| HDFS Federation | 需要联邦命名空间时 |
| HDFS High Availability | 需要高可用时 |
| YARN Scheduler | 需要调度器配置时 |
| Capacity Scheduler | 需要容量调度时 |
| Fair Scheduler | 需要公平调度时 |
| Hive UDF | 需要自定义函数时 |
| Hive Partitioning | 需要分区优化时 |
| HBase Coprocessor | 需要协处理器时 |
| ZooKeeper | 需要协调服务时 |
| Oozie | 需要工作流调度时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建日志分析管道

```bash
#!/bin/bash

# 日志分析管道

# 1. 上传日志到 HDFS
hdfs dfs -mkdir -p /logs/$(date +%Y-%m-%d)
hdfs dfs -put /var/log/app/*.log /logs/$(date +%Y-%m-%d)/

# 2. 创建 Hive 外部表
hive -e "
CREATE EXTERNAL TABLE IF NOT EXISTS app_logs (
    timestamp STRING,
    level STRING,
    message STRING
)
PARTITIONED BY (dt STRING)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/logs';
"

# 3. 添加分区
hive -e "
ALTER TABLE app_logs ADD PARTITION (dt='$(date +%Y-%m-%d)');
"

# 4. 分析日志
hive -e "
SELECT level, COUNT(*) as count
FROM app_logs
WHERE dt = '$(date +%Y-%m-%d)'
GROUP BY level;
"

# 5. 导出结果
hive -e "
INSERT OVERWRITE DIRECTORY '/output/error_logs'
SELECT * FROM app_logs
WHERE level = 'ERROR' AND dt = '$(date +%Y-%m-%d)';
"

hdfs dfs -get /output/error_logs ./error_logs_$(date +%Y-%m-%d).txt
```
