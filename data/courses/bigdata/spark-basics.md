# Spark 基础 三层深度学习教程

## [总览] 技术总览

Apache Spark 是快速、通用的大规模数据处理引擎，基于内存计算提供比 Hadoop MapReduce 快 100 倍的处理速度。支持批处理、流处理、机器学习、图计算等多种工作负载，是大数据处理的主流工具。

本教程采用三层漏斗学习法：**核心层**聚焦 RDD 编程、DataFrame 操作、Spark SQL 三大基石；**重点层**深入 Spark Streaming 和性能优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. RDD 编程

#### [概念] 概念解释

RDD（Resilient Distributed Dataset）是 Spark 的核心数据抽象，代表一个不可变、可分区、里面的元素可并行计算的集合。RDD 支持两种操作：转换（Transformation）和行动（Action）。

#### [语法] 核心语法 / 命令 / API

| 操作类型 | 说明 | 示例 |
|----------|------|------|
| Transformation | 懒执行，返回新 RDD | map, filter, flatMap |
| Action | 触发执行，返回结果 | collect, count, saveAsTextFile |
| 持久化 | 缓存 RDD | persist, cache |

#### [代码] 代码示例

```python
from pyspark import SparkContext, SparkConf

# 创建 SparkContext
conf = SparkConf().setAppName("RDD Demo").setMaster("local[*]")
sc = SparkContext(conf=conf)

# 创建 RDD
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
rdd = sc.parallelize(data, numSlices=4)

# 从文件创建 RDD
file_rdd = sc.textFile("hdfs://path/to/file.txt")

# Transformation 操作
mapped_rdd = rdd.map(lambda x: x * 2)
filtered_rdd = rdd.filter(lambda x: x % 2 == 0)
flat_mapped_rdd = rdd.flatMap(lambda x: [x, x * 2])

# 键值对操作
pairs = rdd.map(lambda x: (x % 3, x))
grouped = pairs.groupByKey()
reduced = pairs.reduceByKey(lambda a, b: a + b)

# Action 操作
print("Count:", rdd.count())
print("Sum:", rdd.reduce(lambda a, b: a + b))
print("First:", rdd.first())
print("Take 3:", rdd.take(3))
print("Collect:", mapped_rdd.collect())

# 持久化
rdd.cache()
rdd.persist(storageLevel="MEMORY_AND_DISK")

# 统计操作
print("Mean:", rdd.mean())
print("Variance:", rdd.variance())
print("Max:", rdd.max())
print("Min:", rdd.min())

# 关闭 SparkContext
sc.stop()
```

#### [场景] 典型应用场景

- 日志分析处理
- ETL 数据清洗
- 大规模数据聚合

### 2. DataFrame 操作

#### [概念] 概念解释

DataFrame 是带有 Schema 的分布式 Row 对象集合，类似数据库表。比 RDD 更高效，支持 Catalyst 优化器自动优化执行计划。

#### [语法] 核心语法 / 命令 / API

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum, avg, max, min, when
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType

# 创建 SparkSession
spark = SparkSession.builder \
    .appName("DataFrame Demo") \
    .master("local[*]") \
    .getOrCreate()

# 定义 Schema
schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("age", IntegerType(), True),
    StructField("salary", DoubleType(), True),
    StructField("department", StringType(), True)
])

# 创建 DataFrame
data = [
    (1, "Alice", 30, 50000.0, "Engineering"),
    (2, "Bob", 25, 45000.0, "Sales"),
    (3, "Charlie", 35, 60000.0, "Engineering"),
    (4, "Diana", 28, 55000.0, "Marketing"),
    (5, "Eve", 32, 52000.0, "Engineering")
]
df = spark.createDataFrame(data, schema)

# 从文件读取
df_csv = spark.read.csv("data.csv", header=True, inferSchema=True)
df_json = spark.read.json("data.json")
df_parquet = spark.read.parquet("data.parquet")

# 基本操作
df.show()
df.printSchema()
df.select("name", "age").show()
df.filter(col("age") > 25).show()
df.filter((col("age") > 25) & (col("salary") > 50000)).show()

# 排序
df.orderBy(col("salary").desc()).show()
df.orderBy("department", col("salary").desc()).show()

# 分组聚合
df.groupBy("department").agg(
    count("*").alias("count"),
    avg("salary").alias("avg_salary"),
    max("salary").alias("max_salary"),
    sum("salary").alias("total_salary")
).show()

# 条件表达式
df.withColumn("salary_level",
    when(col("salary") >= 55000, "High")
    .when(col("salary") >= 50000, "Medium")
    .otherwise("Low")
).show()

# 连接操作
df2 = spark.createDataFrame([
    ("Engineering", "Building A"),
    ("Sales", "Building B"),
    ("Marketing", "Building C")
], ["department", "location"])

df.join(df2, "department").show()

# 写入文件
df.write.mode("overwrite").csv("output.csv")
df.write.mode("overwrite").parquet("output.parquet")
df.write.mode("overwrite").json("output.json")

spark.stop()
```

#### [场景] 典型应用场景

- 结构化数据分析
- 数据仓库 ETL
- 报表生成

### 3. Spark SQL

#### [概念] 概念解释

Spark SQL 允许使用 SQL 语句查询 DataFrame，支持注册临时视图、创建全局视图、执行复杂 SQL 查询。

#### [语法] 核心语法 / 命令 / API

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("Spark SQL Demo") \
    .enableHiveSupport() \
    .getOrCreate()

# 创建 DataFrame
df = spark.read.parquet("users.parquet")

# 注册临时视图
df.createOrReplaceTempView("users")

# 执行 SQL 查询
result = spark.sql("""
    SELECT 
        department,
        COUNT(*) as count,
        AVG(salary) as avg_salary,
        MAX(salary) as max_salary
    FROM users
    WHERE age > 25
    GROUP BY department
    HAVING count > 1
    ORDER BY avg_salary DESC
""")

result.show()

# 全局临时视图
df.createGlobalTempView("global_users")
spark.sql("SELECT * FROM global_temp.global_users").show()

# 子查询
spark.sql("""
    SELECT * FROM users
    WHERE salary > (SELECT AVG(salary) FROM users)
""").show()

# 窗口函数
spark.sql("""
    SELECT 
        name,
        department,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
        AVG(salary) OVER (PARTITION BY department) as dept_avg_salary
    FROM users
""").show()

# 创建数据库和表
spark.sql("CREATE DATABASE IF NOT EXISTS analytics")
spark.sql("USE analytics")
spark.sql("""
    CREATE TABLE IF NOT EXISTS employees (
        id INT,
        name STRING,
        department STRING,
        salary DOUBLE
    )
    USING PARQUET
    PARTITIONED BY (department)
""")

# 插入数据
spark.sql("""
    INSERT INTO employees
    SELECT id, name, department, salary FROM users
""")

spark.stop()
```

#### [场景] 典型应用场景

- 复杂数据分析查询
- 数据仓库报表
- BI 工具集成

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. Spark Streaming

#### [概念] 概念与解决的问题

Spark Streaming 提供实时数据流处理能力，支持从 Kafka、Flume、Kinesis 等数据源读取数据，进行实时分析和处理。

#### [语法] 核心用法

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import explode, split, window, count

spark = SparkSession.builder \
    .appName("Streaming Demo") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# 从 Kafka 读取流数据
stream_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "events") \
    .option("startingOffsets", "latest") \
    .load()

# 解析 JSON 数据
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, TimestampType

schema = StructType([
    StructField("event_type", StringType()),
    StructField("user_id", StringType()),
    StructField("timestamp", TimestampType()),
    StructField("data", StringType())
])

parsed_df = stream_df \
    .select(from_json(col("value").cast("string"), schema).alias("data")) \
    .select("data.*")

# 实时聚合 - 窗口统计
windowed_counts = parsed_df \
    .withWatermark("timestamp", "10 minutes") \
    .groupBy(
        window(col("timestamp"), "5 minutes", "1 minute"),
        col("event_type")
    ) \
    .agg(count("*").alias("count"))

# 输出到控制台
query = windowed_counts.writeStream \
    .outputMode("complete") \
    .format("console") \
    .option("truncate", False) \
    .start()

# 输出到 Kafka
output_query = parsed_df.writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("topic", "processed_events") \
    .option("checkpointLocation", "/tmp/checkpoint") \
    .start()

query.awaitTermination()
```

#### [代码] 代码示例

```python
# Structured Streaming 完整示例
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

spark = SparkSession.builder.appName("RealTimeAnalytics").getOrCreate()

# 读取 Socket 数据流
lines = spark.readStream \
    .format("socket") \
    .option("host", "localhost") \
    .option("port", 9999) \
    .load()

# 实时词频统计
words = lines.select(
    explode(split(col("value"), " ")).alias("word")
)

word_counts = words.groupBy("word").count()

# 状态聚合 - 会话窗口
events = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "user_events") \
    .load() \
    .select(
        from_json(col("value").cast("string"), schema).alias("data")
    ) \
    .select("data.*")

session_window = events \
    .withWatermark("event_time", "1 hour") \
    .groupBy(
        session_window(col("event_time"), "30 minutes"),
        col("user_id")
    ) \
    .agg(
        count("*").alias("event_count"),
        collect_list("event_type").alias("event_types")
    )

# 输出到多种 Sink
query = word_counts.writeStream \
    .outputMode("complete") \
    .format("memory") \
    .queryName("word_counts_table") \
    .start()

# 定期查询内存表
import time
while True:
    spark.sql("SELECT * FROM word_counts_table ORDER BY count DESC LIMIT 10").show()
    time.sleep(5)
```

#### [关联] 与核心层的关联

Spark Streaming 基于 DataFrame API，复用 Catalyst 优化器，与批处理代码一致。

### 2. 性能优化

#### [概念] 概念与解决的问题

Spark 性能优化涉及内存管理、并行度调整、数据倾斜处理、广播变量等。合理的优化可以显著提升处理效率。

#### [语法] 核心用法

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import broadcast, col

spark = SparkSession.builder \
    .appName("Optimization Demo") \
    .config("spark.sql.shuffle.partitions", "200") \
    .config("spark.executor.memory", "4g") \
    .config("spark.executor.cores", "2") \
    .config("spark.driver.memory", "2g") \
    .config("spark.sql.adaptive.enabled", "true") \
    .getOrCreate()

# 1. 广播变量 - 小表广播
large_df = spark.read.parquet("large_table.parquet")
small_df = spark.read.parquet("small_table.parquet")

result = large_df.join(broadcast(small_df), "key")

# 2. 分区优化
df = spark.read.parquet("data.parquet")
df.repartition(100, col("key")).write.parquet("output.parquet")
df.coalesce(10).write.parquet("output_small.parquet")

# 3. 缓存策略
df.cache()
df.persist(StorageLevel.MEMORY_AND_DISK)

# 4. 数据倾斜处理
from pyspark.sql.functions import rand, when

skewed_df = spark.read.parquet("skewed_data.parquet")

# 添加随机前缀打散热点 key
df_with_salt = skewed_df.withColumn(
    "salted_key",
    when(col("key") == "hot_key", 
         concat(col("key"), lit("_"), (rand() * 10).cast("int")))
    .otherwise(col("key"))
)

# 5. 查看执行计划
df.explain(True)

# 6. 使用 AQE (Adaptive Query Execution)
spark.conf.set("spark.sql.adaptive.enabled", True)
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", True)
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", True)
```

#### [代码] 代码示例

```python
# 完整性能调优配置
spark = SparkSession.builder \
    .appName("Production Spark") \
    .master("yarn") \
    .config("spark.executor.instances", "10") \
    .config("spark.executor.memory", "8g") \
    .config("spark.executor.cores", "4") \
    .config("spark.driver.memory", "4g") \
    .config("spark.sql.shuffle.partitions", "200") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \
    .config("spark.sql.adaptive.localShuffleReader.enabled", "true") \
    .config("spark.sql.inMemoryColumnarStorage.compressed", "true") \
    .config("spark.sql.inMemoryColumnarStorage.batchSize", "10000") \
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \
    .config("spark.kryoserializer.buffer.max", "512m") \
    .config("spark.memory.fraction", "0.8") \
    .config("spark.memory.storageFraction", "0.3") \
    .enableHiveSupport() \
    .getOrCreate()
```

#### [关联] 与核心层的关联

性能优化基于对 RDD 和 DataFrame 执行原理的理解，是生产环境必备技能。

### 3. MLlib 机器学习

#### [概念] 概念与解决的问题

Spark MLlib 提供分布式机器学习库，支持分类、回归、聚类、协同过滤等算法，适合大规模数据集的机器学习任务。

#### [语法] 核心用法

```python
from pyspark.ml import Pipeline
from pyspark.ml.classification import LogisticRegression, RandomForestClassifier
from pyspark.ml.feature import VectorAssembler, StringIndexer, StandardScaler
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder

# 读取数据
df = spark.read.csv("data.csv", header=True, inferSchema=True)

# 特征工程
feature_cols = ["age", "income", "credit_score", "loan_amount"]

# 字符串转数值
indexer = StringIndexer(inputCol="target", outputCol="label")

# 特征向量
assembler = VectorAssembler(inputCols=feature_cols, outputCol="features_raw")

# 标准化
scaler = StandardScaler(inputCol="features_raw", outputCol="features")

# 模型
lr = LogisticRegression(featuresCol="features", labelCol="label")

# 构建 Pipeline
pipeline = Pipeline(stages=[indexer, assembler, scaler, lr])

# 划分数据集
train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

# 参数网格
paramGrid = ParamGridBuilder() \
    .addGrid(lr.regParam, [0.01, 0.1, 1.0]) \
    .addGrid(lr.elasticNetParam, [0.0, 0.5, 1.0]) \
    .build()

# 交叉验证
crossval = CrossValidator(
    estimator=pipeline,
    estimatorParamMaps=paramGrid,
    evaluator=BinaryClassificationEvaluator(),
    numFolds=5
)

# 训练模型
model = crossval.fit(train_df)

# 预测
predictions = model.transform(test_df)
predictions.select("features", "label", "prediction", "probability").show()

# 评估
evaluator = BinaryClassificationEvaluator()
auc = evaluator.evaluate(predictions)
print(f"AUC: {auc}")
```

#### [关联] 与核心层的关联

MLlib 基于 DataFrame API，与 Spark SQL 无缝集成，支持 Pipeline 机制。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Spark Core | RDD 核心引擎 |
| Spark SQL | 结构化数据查询 |
| Spark Streaming | 实时流处理 |
| MLlib | 机器学习库 |
| GraphX | 图计算框架 |
| SparkR | R 语言接口 |
| PySpark | Python 接口 |
| Cluster Manager | 集群管理器 |
| DAG | 有向无环图调度 |
| Catalyst | 查询优化器 |

---

## [实战] 核心实战清单

### 实战任务 1：构建实时数据分析管道

使用 Spark Streaming 处理 Kafka 数据流，实现实时统计分析：

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = SparkSession.builder \
    .appName("RealTimeAnalytics") \
    .config("spark.sql.shuffle.partitions", "10") \
    .getOrCreate()

# 读取 Kafka 数据流
stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "clicks") \
    .option("startingOffsets", "latest") \
    .load()

# 解析和处理
events = stream.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")

# 实时聚合
metrics = events \
    .withWatermark("event_time", "5 minutes") \
    .groupBy(window(col("event_time"), "1 minute")) \
    .agg(
        count("*").alias("total_events"),
        countDistinct("user_id").alias("unique_users"),
        avg("page_load_time").alias("avg_load_time")
    )

# 输出到 Elasticsearch
query = metrics.writeStream \
    .format("es") \
    .option("es.resource", "metrics/doc") \
    .option("es.nodes", "elasticsearch:9200") \
    .option("checkpointLocation", "/tmp/checkpoint") \
    .start()

query.awaitTermination()
```
