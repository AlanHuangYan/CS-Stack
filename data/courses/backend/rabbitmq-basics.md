# RabbitMQ 基础 三层深度学习教程

## [总览] 技术总览

RabbitMQ 是开源消息代理，支持多种消息协议。相比 Kafka，更适合传统消息队列场景，功能丰富、易于使用。

本教程采用三层漏斗学习法：**核心层**聚焦队列模型、消息发布订阅、消息确认三大基石；**重点层**深入交换机和路由；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 队列模型

#### [概念] 概念解释

RabbitMQ 使用队列存储消息，生产者发送到队列，消费者从队列获取。支持点对点和发布订阅模式。

#### [代码] 代码示例

```python
# 安装: pip install pika

import pika

# 连接
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明队列
channel.queue_declare(queue='hello')

# 发送消息
channel.basic_publish(
    exchange='',
    routing_key='hello',
    body='Hello World!'
)
print(" [x] Sent 'Hello World!'")

# 接收消息
def callback(ch, method, properties, body):
    print(f" [x] Received {body}")

channel.basic_consume(
    queue='hello',
    on_message_callback=callback,
    auto_ack=True
)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

### 2. 消息发布订阅

#### [概念] 概念解释

使用 Exchange（交换机）实现发布订阅，消息发送到 Exchange，再路由到队列。

#### [代码] 代码示例

```python
# 发布订阅模式
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 声明 Fanout 交换机
channel.exchange_declare(exchange='logs', exchange_type='fanout')

# 发布消息
channel.basic_publish(
    exchange='logs',
    routing_key='',
    body='Broadcast message'
)

# 订阅者
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

channel.queue_bind(exchange='logs', queue=queue_name)

def callback(ch, method, properties, body):
    print(f" [x] {body}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
```

### 3. 消息确认

#### [概念] 概念解释

消息确认确保消息被正确处理，消费者处理完成后发送 ACK。

#### [代码] 代码示例

```python
import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='task_queue', durable=True)

def callback(ch, method, properties, body):
    print(f" [x] Received {body}")
    time.sleep(body.count(b'.'))  # 模拟处理
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag)  # 手动确认

channel.basic_qos(prefetch_count=1)  # 公平分发
channel.basic_consume(queue='task_queue', on_message_callback=callback)

channel.start_consuming()
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 交换机和路由

#### [概念] 概念与解决的问题

Exchange 类型：Direct（直连）、Fanout（广播）、Topic（主题）、Headers（头部）。

#### [代码] 代码示例

```python
# Topic 交换机 - 路由模式
channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

# 发送带路由键的消息
channel.basic_publish(
    exchange='topic_logs',
    routing_key='user.created',
    body='User created event'
)

# 订阅特定路由
channel.queue_bind(
    exchange='topic_logs',
    queue=queue_name,
    routing_key='user.*'  # 匹配 user.created, user.deleted 等
)
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| 死信队列 | 需要处理失败消息时使用 |
| 延迟队列 | 需要定时任务时使用 |
| 优先级队列 | 需要消息优先级时使用 |
| 消息持久化 | 需要消息不丢失时使用 |

---

## [实战] 核心实战清单

### 实战任务 1：异步任务处理系统

**任务描述：** 使用 RabbitMQ 实现异步任务队列。

**要求：**
1. 实现 Web API 提交任务
2. Worker 消费并处理任务
3. 实现任务状态查询
