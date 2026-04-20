# Kafka 基础 三层深度学习教程

## [总览] 技术总览

Apache Kafka 是分布式流处理平台，高吞吐、低延迟、高可用。广泛用于日志收集、事件驱动架构、实时数据管道。

本教程采用三层漏斗学习法：**核心层**聚焦生产者消费者、Topic 分区、消息可靠性三大基石；**重点层**深入消费者组和消息存储；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 生产者消费者

#### [概念] 概念解释

生产者发送消息到 Topic，消费者从 Topic 订阅消息。Kafka 作为消息中间件解耦生产者和消费者。

#### [代码] 代码示例

```python
# 安装: pip install kafka-python

from kafka import KafkaProducer, KafkaConsumer
import json

# 生产者
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 发送消息
producer.send('my-topic', {'key': 'value'})
producer.flush()

# 消费者
consumer = KafkaConsumer(
    'my-topic',
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='earliest',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

# 消费消息
for message in consumer:
    print(f"Received: {message.value}")
```

### 2. Topic 分区

#### [概念] 概念解释

Topic 分为多个分区，每个分区有序存储消息。分区实现并行处理和水平扩展。

#### [代码] 代码示例

```python
# 创建 Topic（使用 Kafka 命令行）
# kafka-topics.sh --create --topic orders --partitions 3 --replication-factor 1 --bootstrap-server localhost:9092

# 指定分区发送
producer.send('orders', key=b'order-1', value={'product': 'iPhone'})

# 分区策略
def partitioner(key_bytes, all_partitions, available_partitions):
    # 自定义分区逻辑
    return all_partitions[0]
```

### 3. 消息可靠性

#### [概念] 概念解释

通过 ACK 配置保证消息不丢失：acks=0（不等待）、acks=1（等待 Leader）、acks=all（等待所有副本）。

#### [代码] 代码示例

```python
# 可靠生产者配置
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    acks='all',  # 等待所有副本确认
    retries=3,   # 重试次数
    max_in_flight_requests_per_connection=1,  # 保证顺序
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 可靠消费者配置
consumer = KafkaConsumer(
    'my-topic',
    bootstrap_servers=['localhost:9092'],
    enable_auto_commit=False,  # 手动提交偏移量
    auto_offset_reset='earliest'
)

for message in consumer:
    try:
        # 处理消息
        process_message(message.value)
        # 手动提交
        consumer.commit()
    except Exception as e:
        print(f"Error: {e}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 消费者组

#### [概念] 概念与解决的问题

消费者组实现消息的负载均衡和容错。同一组内的消费者分担分区，不同组独立消费。

#### [代码] 代码示例

```python
# 消费者组示例
consumer1 = KafkaConsumer(
    'orders',
    group_id='order-processors',
    bootstrap_servers=['localhost:9092']
)

consumer2 = KafkaConsumer(
    'orders',
    group_id='order-processors',  # 同一组
    bootstrap_servers=['localhost:9092']
)

# consumer1 和 consumer2 分担分区
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Kafka Connect | 需要数据集成时使用 |
| Kafka Streams | 需要流处理时使用 |
| Schema Registry | 需要消息格式管理时使用 |
| KSQL | 需要 SQL 查询时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：订单事件系统

**任务描述：** 使用 Kafka 实现订单事件驱动系统。

**要求：**
1. 订单服务发送订单事件
2. 库存服务消费并处理
3. 通知服务消费并发送通知
