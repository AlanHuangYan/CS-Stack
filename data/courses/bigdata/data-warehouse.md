# 数据仓库 三层深度学习教程

## [总览] 技术总览

数据仓库是面向分析的主题化、集成化、非易失性的数据集合，支持企业决策分析。现代数据仓库架构包括数据湖、数据仓库、数据集市等层次，常用技术包括 Snowflake、BigQuery、Redshift、Hive 等。

本教程采用三层漏斗学习法：**核心层**聚焦数据建模、ETL 流程、SQL 分析三大基石；**重点层**深入数据湖架构和性能优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数据建模

#### [概念] 概念解释

数据建模是数据仓库设计的基础，主要方法包括维度建模（星型模型、雪花模型）和范式建模。维度建模以业务过程为中心，设计事实表和维度表。

#### [语法] 核心语法 / 命令 / API

| 概念 | 说明 | 示例 |
|------|------|------|
| 事实表 | 存储业务度量 | 订单事实、销售事实 |
| 维度表 | 存储描述性信息 | 时间维度、产品维度 |
| 星型模型 | 事实表直接关联维度 | 简单高效 |
| 雪花模型 | 维度表进一步规范化 | 节省空间 |

#### [代码] 代码示例

```sql
-- 数据仓库维度建模示例

-- 创建时间维度表
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE,
    year INT,
    quarter INT,
    month INT,
    week INT,
    day_of_week INT,
    day_name VARCHAR(10),
    month_name VARCHAR(10),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN
);

-- 创建产品维度表
CREATE TABLE dim_product (
    product_key INT PRIMARY KEY,
    product_id VARCHAR(20),
    product_name VARCHAR(100),
    category_key INT,
    category_name VARCHAR(50),
    subcategory_name VARCHAR(50),
    brand VARCHAR(50),
    cost DECIMAL(10, 2),
    price DECIMAL(10, 2)
);

-- 创建客户维度表
CREATE TABLE dim_customer (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(20),
    customer_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    customer_segment VARCHAR(20),
    registration_date DATE
);

-- 创建销售事实表
CREATE TABLE fact_sales (
    sales_key BIGINT PRIMARY KEY,
    date_key INT,
    product_key INT,
    customer_key INT,
    store_key INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    total_amount DECIMAL(12, 2),
    cost_amount DECIMAL(12, 2),
    profit_amount DECIMAL(12, 2),
    FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
    FOREIGN KEY (product_key) REFERENCES dim_product(product_key),
    FOREIGN KEY (customer_key) REFERENCES dim_customer(customer_key)
);

-- 创建 SCD Type 2 维度表（缓慢变化维度）
CREATE TABLE dim_customer_scd2 (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(20),
    customer_name VARCHAR(100),
    email VARCHAR(100),
    city VARCHAR(50),
    effective_date DATE,
    expiration_date DATE,
    is_current BOOLEAN
);

-- 插入时间维度数据
INSERT INTO dim_date
SELECT 
    TO_CHAR(d, 'YYYYMMDD')::INT as date_key,
    d as full_date,
    EXTRACT(YEAR FROM d) as year,
    EXTRACT(QUARTER FROM d) as quarter,
    EXTRACT(MONTH FROM d) as month,
    EXTRACT(WEEK FROM d) as week,
    EXTRACT(DOW FROM d) as day_of_week,
    TO_CHAR(d, 'Day') as day_name,
    TO_CHAR(d, 'Month') as month_name,
    EXTRACT(DOW FROM d) IN (0, 6) as is_weekend,
    FALSE as is_holiday
FROM generate_series('2024-01-01'::DATE, '2024-12-31'::DATE, '1 day'::INTERVAL) as d;
```

#### [场景] 典型应用场景

- 企业数据仓库建设
- BI 报表数据模型
- 数据集市设计

### 2. ETL 流程

#### [概念] 概念解释

ETL（Extract-Transform-Load）是从源系统抽取数据、转换处理、加载到数据仓库的过程。现代数据仓库采用 ELT 模式，先加载再转换。

#### [语法] 核心语法 / 命令 / API

```sql
-- ETL 流程示例

-- 1. 数据抽取（从业务系统）
CREATE TABLE stg_orders AS
SELECT 
    order_id,
    customer_id,
    product_id,
    order_date,
    quantity,
    unit_price,
    discount,
    total_amount
FROM source_system.orders
WHERE order_date >= '2024-01-01';

-- 2. 数据清洗和转换
CREATE TABLE int_orders_cleaned AS
SELECT 
    order_id,
    COALESCE(customer_id, 'UNKNOWN') as customer_id,
    COALESCE(product_id, 'UNKNOWN') as product_id,
    order_date,
    quantity,
    unit_price,
    COALESCE(discount, 0) as discount,
    total_amount,
    -- 数据质量检查
    CASE 
        WHEN quantity <= 0 THEN 'INVALID_QUANTITY'
        WHEN unit_price <= 0 THEN 'INVALID_PRICE'
        WHEN total_amount != quantity * unit_price - discount THEN 'AMOUNT_MISMATCH'
        ELSE 'VALID'
    END as data_quality_flag
FROM stg_orders;

-- 3. 维度查找和代理键分配
INSERT INTO fact_sales
SELECT 
    NEXTVAL('fact_sales_seq') as sales_key,
    dd.date_key,
    dp.product_key,
    dc.customer_key,
    ds.store_key,
    o.quantity,
    o.unit_price,
    o.discount,
    o.total_amount,
    dp.cost * o.quantity as cost_amount,
    o.total_amount - (dp.cost * o.quantity) as profit_amount
FROM int_orders_cleaned o
JOIN dim_date dd ON dd.full_date = o.order_date
JOIN dim_product dp ON dp.product_id = o.product_id
JOIN dim_customer dc ON dc.customer_id = o.customer_id
JOIN dim_store ds ON ds.store_id = o.store_id
WHERE o.data_quality_flag = 'VALID';

-- 4. 增量加载（Merge/Upsert）
MERGE INTO fact_sales t
USING (
    SELECT * FROM int_orders_cleaned
    WHERE order_date = CURRENT_DATE - 1
) s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET
    quantity = s.quantity,
    total_amount = s.total_amount
WHEN NOT MATCHED THEN INSERT (
    sales_key, date_key, product_key, customer_key,
    quantity, unit_price, discount, total_amount
) VALUES (
    NEXTVAL('fact_sales_seq'),
    (SELECT date_key FROM dim_date WHERE full_date = s.order_date),
    (SELECT product_key FROM dim_product WHERE product_id = s.product_id),
    (SELECT customer_key FROM dim_customer WHERE customer_id = s.customer_id),
    s.quantity, s.unit_price, s.discount, s.total_amount
);
```

#### [代码] 代码示例

```python
# Python ETL 框架示例
from dataclasses import dataclass
from typing import Callable, List, Any
from datetime import datetime
import logging

@dataclass
class ETLPipeline:
    """ETL 管道"""
    name: str
    extract_fn: Callable
    transform_fn: Callable
    load_fn: Callable
    
    def run(self) -> dict:
        """执行 ETL"""
        start_time = datetime.now()
        stats = {'extracted': 0, 'transformed': 0, 'loaded': 0, 'errors': []}
        
        try:
            # Extract
            logging.info(f"[{self.name}] Starting extraction...")
            data = self.extract_fn()
            stats['extracted'] = len(data) if hasattr(data, '__len__') else 'N/A'
            
            # Transform
            logging.info(f"[{self.name}] Starting transformation...")
            transformed = self.transform_fn(data)
            stats['transformed'] = len(transformed) if hasattr(transformed, '__len__') else 'N/A'
            
            # Load
            logging.info(f"[{self.name}] Starting load...")
            self.load_fn(transformed)
            stats['loaded'] = stats['transformed']
            
        except Exception as e:
            logging.error(f"[{self.name}] Error: {e}")
            stats['errors'].append(str(e))
        
        stats['duration'] = (datetime.now() - start_time).total_seconds()
        return stats

class DataQualityChecker:
    """数据质量检查器"""
    
    def __init__(self):
        self.rules = []
    
    def add_rule(self, name: str, check_fn: Callable, threshold: float = 1.0):
        """添加检查规则"""
        self.rules.append({
            'name': name,
            'check': check_fn,
            'threshold': threshold
        })
    
    def run_checks(self, data: List[dict]) -> dict:
        """运行所有检查"""
        results = {}
        for rule in self.rules:
            passed, score = rule['check'](data)
            results[rule['name']] = {
                'passed': score >= rule['threshold'],
                'score': score,
                'threshold': rule['threshold']
            }
        return results

# 使用示例
def extract_orders():
    # 从源系统抽取数据
    return [
        {'order_id': 1, 'customer_id': 'C001', 'amount': 100},
        {'order_id': 2, 'customer_id': 'C002', 'amount': 200},
    ]

def transform_orders(data):
    # 转换数据
    return [
        {**d, 'amount_usd': d['amount'] * 0.01}
        for d in data
    ]

def load_orders(data):
    # 加载到数据仓库
    print(f"Loading {len(data)} records")

pipeline = ETLPipeline(
    name="orders_etl",
    extract_fn=extract_orders,
    transform_fn=transform_orders,
    load_fn=load_orders
)

stats = pipeline.run()
print(f"ETL Stats: {stats}")
```

#### [场景] 典型应用场景

- 每日数据同步
- 数据清洗和标准化
- 数据质量保障

### 3. SQL 分析

#### [概念] 概念解释

数据仓库支持复杂的 SQL 分析查询，包括聚合分析、窗口函数、时间序列分析等。良好的 SQL 技能是数据分析师的核心能力。

#### [语法] 核心语法 / 命令 / API

```sql
-- 数据仓库分析查询示例

-- 1. 基础聚合分析
SELECT 
    d.year,
    d.quarter,
    d.month_name,
    p.category_name,
    COUNT(DISTINCT f.customer_key) as unique_customers,
    COUNT(*) as order_count,
    SUM(f.quantity) as total_quantity,
    SUM(f.total_amount) as total_revenue,
    AVG(f.total_amount) as avg_order_value,
    SUM(f.profit_amount) as total_profit,
    SUM(f.profit_amount) / SUM(f.total_amount) as profit_margin
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
WHERE d.year = 2024
GROUP BY d.year, d.quarter, d.month_name, p.category_name
ORDER BY d.year, d.quarter, total_revenue DESC;

-- 2. 窗口函数分析
SELECT 
    customer_name,
    order_date,
    total_amount,
    -- 累计销售额
    SUM(total_amount) OVER (
        PARTITION BY customer_key 
        ORDER BY order_date
    ) as cumulative_amount,
    -- 移动平均
    AVG(total_amount) OVER (
        PARTITION BY customer_key 
        ORDER BY order_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as moving_avg_3,
    -- 排名
    RANK() OVER (
        PARTITION BY customer_key 
        ORDER BY total_amount DESC
    ) as order_rank,
    -- 同比增长
    LAG(total_amount, 1) OVER (
        PARTITION BY customer_key 
        ORDER BY order_date
    ) as prev_order_amount,
    (total_amount - LAG(total_amount, 1) OVER (
        PARTITION BY customer_key ORDER BY order_date
    )) / LAG(total_amount, 1) OVER (
        PARTITION BY customer_key ORDER BY order_date
    ) as growth_rate
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key
JOIN dim_date d ON f.date_key = d.date_key;

-- 3. 同比环比分析
WITH monthly_sales AS (
    SELECT 
        d.year,
        d.month,
        SUM(f.total_amount) as total_revenue
    FROM fact_sales f
    JOIN dim_date d ON f.date_key = d.date_key
    GROUP BY d.year, d.month
)
SELECT 
    year,
    month,
    total_revenue,
    -- 环比
    LAG(total_revenue, 1) OVER (ORDER BY year, month) as prev_month,
    (total_revenue - LAG(total_revenue, 1) OVER (ORDER BY year, month)) 
        / LAG(total_revenue, 1) OVER (ORDER BY year, month) as mom_growth,
    -- 同比
    LAG(total_revenue, 12) OVER (ORDER BY year, month) as prev_year_month,
    (total_revenue - LAG(total_revenue, 12) OVER (ORDER BY year, month)) 
        / LAG(total_revenue, 12) OVER (ORDER BY year, month) as yoy_growth
FROM monthly_sales;

-- 4. RFM 分析
WITH rfm AS (
    SELECT 
        customer_key,
        DATEDIFF(DAY, MAX(order_date), CURRENT_DATE) as recency,
        COUNT(*) as frequency,
        SUM(total_amount) as monetary
    FROM fact_sales f
    JOIN dim_date d ON f.date_key = d.date_key
    GROUP BY customer_key
),
rfm_scores AS (
    SELECT 
        customer_key,
        NTILE(5) OVER (ORDER BY recency DESC) as r_score,
        NTILE(5) OVER (ORDER BY frequency) as f_score,
        NTILE(5) OVER (ORDER BY monetary) as m_score
    FROM rfm
)
SELECT 
    customer_key,
    r_score, f_score, m_score,
    CONCAT(r_score, f_score, m_score) as rfm_segment,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 4 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 3 AND m_score >= 4 THEN 'Big Spenders'
        WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost Customers'
        ELSE 'Others'
    END as customer_segment
FROM rfm_scores;
```

#### [场景] 典型应用场景

- 销售分析报表
- 用户行为分析
- 经营决策支持

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 数据湖架构

#### [概念] 概念与解决的问题

数据湖存储原始格式的数据，支持结构化和非结构化数据。现代架构采用湖仓一体（Lakehouse），结合数据湖的灵活性和数据仓库的管理能力。

#### [语法] 核心用法

```sql
-- 数据湖分层架构

-- Bronze 层：原始数据
CREATE TABLE bronze.orders_raw (
    file_name STRING,
    load_timestamp TIMESTAMP,
    raw_data STRING  -- JSON 格式原始数据
) USING DELTA
LOCATION 's3://data-lake/bronze/orders';

-- Silver 层：清洗后数据
CREATE TABLE silver.orders_cleaned (
    order_id STRING,
    customer_id STRING,
    order_timestamp TIMESTAMP,
    products ARRAY<STRUCT<product_id:STRING, quantity:INT, price:DOUBLE>>,
    total_amount DOUBLE,
    _source_file STRING,
    _processed_timestamp TIMESTAMP
) USING DELTA
LOCATION 's3://data-lake/silver/orders';

-- Gold 层：聚合数据
CREATE TABLE gold.daily_sales_summary (
    order_date DATE,
    product_category STRING,
    total_orders BIGINT,
    total_revenue DOUBLE,
    avg_order_value DOUBLE
) USING DELTA
LOCATION 's3://data-lake/gold/daily_sales_summary';

-- Bronze 到 Silver 的转换
INSERT INTO silver.orders_cleaned
SELECT 
    get_json_object(raw_data, '$.order_id') as order_id,
    get_json_object(raw_data, '$.customer_id') as customer_id,
    to_timestamp(get_json_object(raw_data, '$.timestamp')) as order_timestamp,
    from_json(get_json_object(raw_data, '$.products'), 
        'ARRAY<STRUCT<product_id:STRING,quantity:INT,price:DOUBLE>>') as products,
    cast(get_json_object(raw_data, '$.total_amount') as double) as total_amount,
    file_name as _source_file,
    current_timestamp() as _processed_timestamp
FROM bronze.orders_raw
WHERE load_timestamp > (SELECT COALESCE(MAX(_processed_timestamp), '1900-01-01') FROM silver.orders_cleaned);

-- Silver 到 Gold 的聚合
INSERT INTO gold.daily_sales_summary
SELECT 
    to_date(order_timestamp) as order_date,
    p.product_category,
    COUNT(DISTINCT order_id) as total_orders,
    SUM(p.quantity * p.price) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM silver.orders_cleaned
LATERAL VIEW explode(products) t as p
GROUP BY to_date(order_timestamp), p.product_category;
```

#### [关联] 与核心层的关联

数据湖是数据仓库的扩展，支持更多数据类型和分析场景。

### 2. 性能优化

#### [概念] 概念与解决的问题

数据仓库性能优化包括分区策略、索引设计、物化视图、查询优化等。良好的优化可以显著提升查询性能。

#### [语法] 核心用法

```sql
-- 分区策略
CREATE TABLE fact_sales_partitioned (
    sales_key BIGINT,
    product_key INT,
    customer_key INT,
    quantity INT,
    total_amount DECIMAL(12, 2)
) PARTITIONED BY (year INT, month INT)
STORED AS PARQUET;

-- 插入分区数据
INSERT INTO fact_sales_partitioned PARTITION (year=2024, month=1)
SELECT sales_key, product_key, customer_key, quantity, total_amount
FROM staging_sales
WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';

-- 物化视图
CREATE MATERIALIZED VIEW mv_monthly_sales
REFRESH EVERY 1 DAY
AS SELECT 
    d.year, d.month,
    p.category_name,
    SUM(f.total_amount) as total_revenue,
    COUNT(*) as order_count
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.year, d.month, p.category_name;

-- 聚簇索引
CREATE TABLE fact_sales_clustered (
    sales_key BIGINT,
    date_key INT,
    customer_key INT,
    product_key INT,
    total_amount DECIMAL(12, 2)
) CLUSTER BY (date_key, customer_key);

-- 查询优化提示
SELECT /*+ REPARTITION(100) */ 
    customer_key,
    SUM(total_amount) as total
FROM fact_sales
GROUP BY customer_key;

-- 统计信息收集
ANALYZE TABLE fact_sales COMPUTE STATISTICS FOR COLUMNS customer_key, product_key;
ANALYZE TABLE fact_sales COMPUTE STATISTICS FOR ALL COLUMNS;
```

#### [关联] 与核心层的关联

性能优化基于数据模型设计，是生产环境的必要配置。

### 3. 数据治理

#### [概念] 概念与解决的问题

数据治理确保数据质量、安全性和合规性。包括数据血缘、元数据管理、访问控制、数据质量监控等。

#### [语法] 核心用法

```sql
-- 数据血缘追踪
CREATE TABLE data_lineage (
    table_name STRING,
    column_name STRING,
    source_table STRING,
    source_column STRING,
    transformation_logic STRING,
    created_at TIMESTAMP
);

INSERT INTO data_lineage VALUES
('fact_sales', 'total_amount', 'stg_orders', 'total_amount', 'Direct copy', CURRENT_TIMESTAMP),
('fact_sales', 'profit_amount', 'stg_orders', 'total_amount', 'total_amount - (cost * quantity)', CURRENT_TIMESTAMP);

-- 数据质量规则
CREATE TABLE data_quality_rules (
    table_name STRING,
    column_name STRING,
    rule_name STRING,
    rule_expression STRING,
    threshold DOUBLE
);

-- 数据质量检查
SELECT 
    'fact_sales' as table_name,
    'total_amount' as column_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN total_amount < 0 THEN 1 ELSE 0 END) as invalid_count,
    1 - SUM(CASE WHEN total_amount < 0 THEN 1 ELSE 0 END) / COUNT(*) as quality_score
FROM fact_sales;

-- 访问控制
GRANT SELECT ON TABLE fact_sales TO ROLE analyst;
GRANT SELECT ON TABLE dim_customer TO ROLE analyst;
REVOKE SELECT ON TABLE dim_customer FROM ROLE analyst;

-- 行级安全
CREATE POLICY customer_access ON dim_customer
    USING (customer_segment = current_user_segment());
```

#### [关联] 与核心层的关联

数据治理是数据仓库可靠运行的保障，贯穿整个数据生命周期。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Snowflake | 云原生数据仓库 |
| BigQuery | Google 云数据仓库 |
| Redshift | AWS 数据仓库 |
| Delta Lake | 数据湖表格式 |
| Iceberg | 开放表格式 |
| dbt | 数据转换工具 |
| Airflow | 工作流调度 |
| Data Catalog | 数据目录管理 |
| Data Lineage | 数据血缘追踪 |
| Data Quality | 数据质量管理 |

---

## [实战] 核心实战清单

### 实战任务 1：构建电商数据仓库

设计并实现一个完整的电商数据仓库：

```sql
-- 完整数据仓库架构

-- 1. 创建维度表
CREATE TABLE dim_user (
    user_key BIGINT PRIMARY KEY,
    user_id VARCHAR(50),
    username VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    registration_date DATE,
    user_level VARCHAR(20),
    city VARCHAR(50),
    province VARCHAR(50),
    effective_date DATE,
    expiration_date DATE,
    is_current BOOLEAN
);

CREATE TABLE dim_product (
    product_key BIGINT PRIMARY KEY,
    product_id VARCHAR(50),
    product_name VARCHAR(200),
    category_l1 VARCHAR(50),
    category_l2 VARCHAR(50),
    category_l3 VARCHAR(50),
    brand VARCHAR(50),
    price DECIMAL(10, 2)
);

-- 2. 创建事实表
CREATE TABLE fact_order (
    order_key BIGINT PRIMARY KEY,
    order_id VARCHAR(50),
    user_key BIGINT,
    product_key BIGINT,
    order_time TIMESTAMP,
    quantity INT,
    unit_price DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    total_amount DECIMAL(12, 2),
    payment_method VARCHAR(20),
    order_status VARCHAR(20)
) PARTITIONED BY (dt STRING);

-- 3. 创建聚合表
CREATE MATERIALIZED VIEW mv_user_order_summary
AS SELECT 
    user_key,
    COUNT(DISTINCT order_id) as order_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_order_amount,
    MAX(order_time) as last_order_time
FROM fact_order
GROUP BY user_key;
```
