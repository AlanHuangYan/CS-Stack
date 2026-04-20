# 流处理基础 三层深度学习教程

## [总览] 技术总览

流处理是对无界数据流进行实时处理的技术，与批处理相比具有低延迟、实时响应的特点。主流框架包括 Apache Kafka Streams、Apache Flink、Apache Storm 等。广泛应用于实时监控、实时推荐、欺诈检测等场景。

本教程采用三层漏斗学习法：**核心层**聚焦流处理概念、Kafka 基础、窗口操作三大基石；**重点层**深入 Exactly-Once 语义和状态管理；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 流处理概念

#### [概念] 概念解释

流处理是对连续产生的数据进行实时处理的方式。与批处理不同，流处理数据是无界的，需要处理时间概念（事件时间 vs 处理时间）和窗口机制。

#### [语法] 核心语法 / 命令 / API

| 概念 | 说明 | 示例 |
|------|------|------|
| 无界数据 | 无限增长的数据流 | 日志、传感器数据 |
| 有界数据 | 固定大小的数据集 | 文件、数据库表 |
| 事件时间 | 事件发生的时间 | 日志中的时间戳 |
| 处理时间 | 系统处理的时间 | 当前系统时间 |
| 窗口 | 数据分片处理单位 | 滚动窗口、滑动窗口 |

#### [代码] 代码示例

```python
# 流处理基本模式
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterator, Callable
import time

@dataclass
class Event:
    """事件数据结构"""
    key: str
    value: any
    event_time: datetime
    processing_time: datetime = None
    
    def __post_init__(self):
        if self.processing_time is None:
            self.processing_time = datetime.now()

class StreamProcessor:
    """流处理器基类"""
    
    def __init__(self, name: str):
        self.name = name
        self.handlers = []
    
    def process(self, event: Event) -> Event:
        """处理单个事件"""
        for handler in self.handlers:
            event = handler(event)
        return event
    
    def add_handler(self, handler: Callable):
        """添加处理函数"""
        self.handlers.append(handler)
        return self

# 窗口类型
class TumblingWindow:
    """滚动窗口 - 固定大小，不重叠"""
    
    def __init__(self, size: timedelta):
        self.size = size
    
    def get_window(self, event_time: datetime) -> tuple:
        start = event_time.replace(
            second=0, microsecond=0
        )
        start = start.replace(
            minute=(start.minute // (self.size.seconds // 60)) * (self.size.seconds // 60)
        )
        end = start + self.size
        return start, end

class SlidingWindow:
    """滑动窗口 - 固定大小，可重叠"""
    
    def __init__(self, size: timedelta, slide: timedelta):
        self.size = size
        self.slide = slide
    
    def get_windows(self, event_time: datetime) -> list:
        windows = []
        # 计算事件所属的所有窗口
        current = event_time.replace(second=0, microsecond=0)
        while current > event_time - self.size:
            windows.append((current, current + self.size))
            current -= self.slide
        return windows

class SessionWindow:
    """会话窗口 - 基于活动间隔"""
    
    def __init__(self, gap: timedelta):
        self.gap = gap
        self.sessions = {}
    
    def add_event(self, key: str, event_time: datetime) -> tuple:
        if key not in self.sessions:
            self.sessions[key] = (event_time, event_time)
        
        start, end = self.sessions[key]
        if event_time - end > self.gap:
            # 新会话
            self.sessions[key] = (event_time, event_time)
            return start, end
        else:
            # 扩展会话
            self.sessions[key] = (start, event_time)
            return self.sessions[key]

# 使用示例
processor = StreamProcessor("demo")

# 添加处理函数
processor.add_handler(lambda e: Event(
    key=e.key.upper(),
    value=e.value * 2,
    event_time=e.event_time
))

# 处理事件
event = Event(
    key="user_001",
    value=100,
    event_time=datetime(2024, 1, 15, 10, 30, 45)
)
result = processor.process(event)
print(f"Processed: {result}")
```

#### [场景] 典型应用场景

- 实时监控告警
- 实时数据分析
- 实时推荐系统

### 2. Kafka 基础

#### [概念] 概念解释

Apache Kafka 是分布式流处理平台，提供高吞吐、低延迟的消息队列服务。核心概念包括 Topic、Partition、Consumer Group、Offset 等。

#### [语法] 核心语法 / 命令 / API

```python
# Kafka 生产者和消费者
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
import json

# 生产者配置
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    key_serializer=str.encode,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',  # 等待所有副本确认
    retries=3,
    max_in_flight_requests_per_connection=1,
    enable_idempotence=True  # 幂等性
)

# 发送消息
def send_message(topic: str, key: str, value: dict):
    future = producer.send(topic, key=key, value=value)
    try:
        record_metadata = future.get(timeout=10)
        print(f"Sent to {record_metadata.topic}:{record_metadata.partition}:{record_metadata.offset}")
    except KafkaError as e:
        print(f"Failed to send: {e}")

# 批量发送
for i in range(100):
    send_message("events", f"key_{i}", {"id": i, "data": f"value_{i}"})

producer.flush()
producer.close()

# 消费者配置
consumer = KafkaConsumer(
    'events',
    bootstrap_servers=['localhost:9092'],
    group_id='my-consumer-group',
    key_deserializer=lambda k: k.decode('utf-8') if k else None,
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='earliest',  # 从最早开始消费
    enable_auto_commit=False,  # 手动提交 offset
    max_poll_records=100
)

# 消费消息
for message in consumer:
    print(f"Received: {message.key} -> {message.value}")
    print(f"Partition: {message.partition}, Offset: {message.offset}")
    
    # 处理消息
    process_message(message.value)
    
    # 手动提交 offset
    consumer.commit()

consumer.close()
```

#### [代码] 代码示例

```python
# Kafka 流处理完整示例
from kafka import KafkaConsumer, KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic
import json
from datetime import datetime
from collections import defaultdict

class StreamProcessor:
    """基于 Kafka 的流处理器"""
    
    def __init__(self, bootstrap_servers: list):
        self.bootstrap_servers = bootstrap_servers
        self.consumer = None
        self.producer = None
        self.state = defaultdict(list)
    
    def setup(self, input_topic: str, output_topic: str, group_id: str):
        """初始化消费者和生产者"""
        self.consumer = KafkaConsumer(
            input_topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id=group_id,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=False
        )
        
        self.producer = KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        self.output_topic = output_topic
    
    def process_stream(self):
        """处理流数据"""
        window_size = 60  # 60秒窗口
        window_data = defaultdict(list)
        
        for message in self.consumer:
            event = message.value
            event_time = datetime.fromisoformat(event['timestamp'])
            window_key = event_time.replace(
                second=(event_time.second // 10) * 10,
                microsecond=0
            )
            
            # 累积窗口数据
            window_data[window_key].append(event['value'])
            
            # 计算窗口聚合
            if len(window_data[window_key]) >= 10:
                result = {
                    'window_start': window_key.isoformat(),
                    'count': len(window_data[window_key]),
                    'sum': sum(window_data[window_key]),
                    'avg': sum(window_data[window_key]) / len(window_data[window_key])
                }
                
                # 发送结果
                self.producer.send(self.output_topic, result)
                self.producer.flush()
                
                # 清理窗口
                del window_data[window_key]
            
            # 提交 offset
            self.consumer.commit()

# 使用示例
processor = StreamProcessor(['localhost:9092'])
processor.setup('input-events', 'aggregated-results', 'stream-processor')
processor.process_stream()
```

#### [场景] 典型应用场景

- 消息队列
- 日志收集
- 事件溯源

### 3. 窗口操作

#### [概念] 概念解释

窗口操作将无限数据流划分为有限的数据块进行处理。常见窗口类型包括滚动窗口、滑动窗口、会话窗口。

#### [语法] 核心语法 / 命令 / API

```python
# 使用 Flink (PyFlink) 进行窗口操作
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.window import TumblingEventTimeWindows, SlidingEventTimeWindows
from pyflink.datastream.functions import ProcessWindowFunction
from pyflink.common import WatermarkStrategy, Duration
from pyflink.table import StreamTableEnvironment

env = StreamExecutionEnvironment.get_execution_environment()
t_env = StreamTableEnvironment.create(env)

# 定义数据源
t_env.execute_sql("""
    CREATE TABLE events (
        event_id STRING,
        user_id STRING,
        event_type STRING,
        event_time TIMESTAMP(3),
        WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'events',
        'properties.bootstrap.servers' = 'localhost:9092',
        'format' = 'json'
    )
""")

# 滚动窗口聚合
t_env.execute_sql("""
    SELECT
        user_id,
        TUMBLE_START(event_time, INTERVAL '1' HOUR) as window_start,
        TUMBLE_END(event_time, INTERVAL '1' HOUR) as window_end,
        COUNT(*) as event_count
    FROM events
    GROUP BY
        user_id,
        TUMBLE(event_time, INTERVAL '1' HOUR)
""")

# 滑动窗口聚合
t_env.execute_sql("""
    SELECT
        user_id,
        HOP_START(event_time, INTERVAL '5' MINUTE, INTERVAL '1' HOUR) as window_start,
        HOP_END(event_time, INTERVAL '5' MINUTE, INTERVAL '1' HOUR) as window_end,
        COUNT(*) as event_count
    FROM events
    GROUP BY
        user_id,
        HOP(event_time, INTERVAL '5' MINUTE, INTERVAL '1' HOUR)
""")

# 会话窗口聚合
t_env.execute_sql("""
    SELECT
        user_id,
        SESSION_START(event_time, INTERVAL '30' MINUTE) as window_start,
        SESSION_END(event_time, INTERVAL '30' MINUTE) as window_end,
        COUNT(*) as event_count
    FROM events
    GROUP BY
        user_id,
        SESSION(event_time, INTERVAL '30' MINUTE)
""")
```

#### [场景] 典型应用场景

- 实时统计报表
- 异常检测
- 用户行为分析

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Exactly-Once 语义

#### [概念] 概念与解决的问题

Exactly-Once 语义确保消息恰好被处理一次，不丢失不重复。需要协调数据源、处理引擎、输出目标的原子性。

#### [语法] 核心用法

```python
# Kafka Exactly-Once 配置
from kafka import KafkaProducer, KafkaConsumer
import json

# 生产者配置 - 幂等性
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    # 幂等性配置
    enable_idempotence=True,
    acks='all',
    max_in_flight_requests_per_connection=5,
    # 事务配置
    transactional_id='my-transactional-producer'
)

# 初始化事务
producer.init_transactions()

try:
    # 开始事务
    producer.begin_transaction()
    
    # 发送多条消息
    producer.send('topic1', {'key': 'value1'})
    producer.send('topic2', {'key': 'value2'})
    
    # 提交事务
    producer.commit_transaction()
except Exception as e:
    # 回滚事务
    producer.abort_transaction()
finally:
    producer.close()

# 消费者配置 - 隔离级别
consumer = KafkaConsumer(
    'topic1',
    bootstrap_servers=['localhost:9092'],
    group_id='my-group',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    # 只读取已提交的消息
    isolation_level='read_committed',
    enable_auto_commit=False
)
```

#### [代码] 代码示例

```python
# Flink Exactly-Once 端到端配置
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.checkpointing import CheckpointingMode

env = StreamExecutionEnvironment.get_execution_environment()

# 启用 Checkpoint
env.enable_checkpointing(60000)  # 每 60 秒一次 checkpoint

# Checkpoint 配置
env.get_checkpoint_config().set_checkpointing_mode(CheckpointingMode.EXACTLY_ONCE)
env.get_checkpoint_config().set_checkpoint_timeout(600000)  # 10 分钟超时
env.get_checkpoint_config().set_min_pause_between_checkpoints(500)  # 最小间隔
env.get_checkpoint_config().set_max_concurrent_checkpoints(1)
env.get_checkpoint_config().set_tolerable_checkpoint_failure_number(3)

# 启用外部持久化
env.get_checkpoint_config().enable_externalized_checkpoints(
    mode=ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION
)
```

#### [关联] 与核心层的关联

Exactly-Once 语义建立在 Kafka 和流处理框架基础上，是生产环境的关键要求。

### 2. 状态管理

#### [概念] 概念与解决的问题

有状态流处理需要维护和更新处理状态，如聚合计数、去重、关联等。状态管理涉及状态的存储、恢复、迁移。

#### [语法] 核心用法

```python
# Flink 状态管理
from pyflink.datastream import StreamExecutionEnvironment, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor, ListStateDescriptor
from pyflink.datastream.functions import KeyedProcessFunction

class CountWithTimeoutFunction(KeyedProcessFunction):
    """带超时的计数器"""
    
    def __init__(self):
        self.state = None
    
    def open(self, runtime_context: RuntimeContext):
        # 初始化状态
        self.state = runtime_context.get_state(
            ValueStateDescriptor("count", int)
        )
    
    def process_element(self, value, ctx: 'KeyedProcessFunction.Context'):
        # 获取当前状态
        current = self.state.value()
        if current is None:
            current = 0
        
        # 更新状态
        current += 1
        self.state.update(current)
        
        # 注册定时器
        ctx.timer_service().register_event_time_timer(
            ctx.timestamp() + 60000  # 1 分钟后触发
        )
        
        # 输出结果
        yield (ctx.get_current_key(), current)
    
    def on_timer(self, timestamp: int, ctx: 'KeyedProcessFunction.OnTimerContext'):
        # 定时器触发
        current = self.state.value()
        yield (ctx.get_current_key(), f"Timeout at {timestamp}, count: {current}")
        self.state.clear()

# 使用示例
env = StreamExecutionEnvironment.get_execution_environment()
data_stream = env.from_collection([
    ('user1', 1), ('user2', 2), ('user1', 3)
])

result = data_stream.key_by(lambda x: x[0]) \
    .process(CountWithTimeoutFunction())

result.print()
env.execute()
```

#### [关联] 与核心层的关联

状态管理是窗口操作的基础，支持更复杂的流处理逻辑。

### 3. 水位线与迟到数据

#### [概念] 概念与解决的问题

水位线（Watermark）标记事件时间的进度，用于处理乱序事件。迟到数据是晚于水位线到达的数据，需要特殊处理。

#### [语法] 核心用法

```python
# Flink 水位线配置
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.common import WatermarkStrategy, Duration
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.datastream.functions import ProcessWindowFunction
from pyflink.common import Row

env = StreamExecutionEnvironment.get_execution_environment()

# 定义水位线策略
watermark_strategy = WatermarkStrategy \
    .for_bounded_out_of_orderness(Duration.seconds(5)) \
    .with_timestamp_assigner(lambda event, timestamp: event['timestamp'])

# 应用水位线
data_stream = env.from_collection([
    {'user': 'a', 'value': 1, 'timestamp': 1000},
    {'user': 'b', 'value': 2, 'timestamp': 2000},
    {'user': 'a', 'value': 3, 'timestamp': 1500},  # 乱序数据
])

timestamped_stream = data_stream.assign_timestamps_and_watermarks(watermark_strategy)

# 窗口处理
result = timestamped_stream \
    .key_by(lambda e: e['user']) \
    .window(TumblingEventTimeWindows.of(Duration.seconds(10))) \
    .allowed_lateness(Duration.seconds(5)) \
    .side_output_late_data('late-events') \
    .process(MyProcessWindowFunction())

# 获取迟到数据
late_events = result.get_side_output('late-events')
```

#### [关联] 与核心层的关联

水位线是事件时间处理的核心，与窗口操作紧密配合。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Kafka Streams | Kafka 原生流处理 |
| Flink | 低延迟流处理引擎 |
| Storm | 分布式实时计算 |
| Pulsar | 云原生消息队列 |
| Kinesis | AWS 流处理服务 |
| Backpressure | 背压处理机制 |
| CEP | 复杂事件处理 |
| State Backend | 状态后端存储 |
| Savepoint | 状态快照恢复 |
| Watermark | 事件时间进度标记 |

---

## [实战] 核心实战清单

### 实战任务 1：构建实时数据分析系统

使用 Kafka + Flink 构建完整的实时数据分析系统：

```python
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.table import StreamTableEnvironment, DataTypes
from pyflink.table.udf import udf

env = StreamExecutionEnvironment.get_execution_environment()
env.enable_checkpointing(60000)
t_env = StreamTableEnvironment.create(env)

# Kafka 数据源
t_env.execute_sql("""
    CREATE TABLE kafka_source (
        user_id STRING,
        event_type STRING,
        event_time TIMESTAMP(3),
        properties MAP<STRING, STRING>,
        WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'user_events',
        'properties.bootstrap.servers' = 'kafka:9092',
        'properties.group.id' = 'analytics',
        'scan.startup.mode' = 'latest-offset',
        'format' = 'json'
    )
""")

# 实时聚合查询
result = t_env.sql_query("""
    SELECT
        user_id,
        TUMBLE_START(event_time, INTERVAL '1' MINUTE) as window_start,
        COUNT(*) as event_count,
        COUNT(DISTINCT event_type) as unique_events
    FROM kafka_source
    GROUP BY
        user_id,
        TUMBLE(event_time, INTERVAL '1' MINUTE)
""")

# 输出到 Elasticsearch
t_env.execute_sql("""
    CREATE TABLE es_sink (
        user_id STRING,
        window_start TIMESTAMP(3),
        event_count BIGINT,
        unique_events BIGINT
    ) WITH (
        'connector' = 'elasticsearch-7',
        'hosts' = 'http://elasticsearch:9200',
        'index' = 'user-analytics'
    )
""")

result.execute_insert('es_sink')
```
