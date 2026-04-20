# ETL 工程 三层深度学习教程

## [总览] 技术总览

ETL（Extract-Transform-Load）是数据集成的核心流程，负责从多个数据源抽取数据、转换处理、加载到目标系统。现代 ETL 工具包括 Apache Airflow、Informatica、Talend、dbt 等。良好的 ETL 设计是数据平台稳定运行的基础。

本教程采用三层漏斗学习法：**核心层**聚焦数据抽取、数据转换、数据加载三大基石；**重点层**深入 ETL 调度和数据质量；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 数据抽取

#### [概念] 概念解释

数据抽取是从源系统获取数据的过程，包括全量抽取和增量抽取。需要处理多种数据源：关系数据库、API、文件、消息队列等。

#### [语法] 核心语法 / 命令 / API

| 抽取方式 | 说明 | 适用场景 |
|----------|------|----------|
| 全量抽取 | 抽取全部数据 | 小表、初始化 |
| 增量抽取 | 抽取变化数据 | 大表、日常同步 |
| CDC | 变化数据捕获 | 实时同步 |
| API 抽取 | 调用接口获取 | 第三方数据 |

#### [代码] 代码示例

```python
# 数据抽取示例
import pandas as pd
import requests
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import json

class DataExtractor:
    """数据抽取器"""
    
    def __init__(self, config: dict):
        self.config = config
        self.connections = {}
    
    def extract_from_database(self, query: str, connection_string: str) -> pd.DataFrame:
        """从数据库抽取数据"""
        engine = create_engine(connection_string)
        return pd.read_sql(query, engine)
    
    def extract_incremental(self, table: str, timestamp_col: str, 
                           last_extract_time: datetime, 
                           connection_string: str) -> pd.DataFrame:
        """增量抽取"""
        query = f"""
            SELECT * FROM {table}
            WHERE {timestamp_col} > '{last_extract_time}'
            ORDER BY {timestamp_col}
        """
        return self.extract_from_database(query, connection_string)
    
    def extract_from_api(self, url: str, params: dict = None, 
                         headers: dict = None) -> dict:
        """从 API 抽取数据"""
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    
    def extract_from_file(self, file_path: str, file_type: str = 'csv') -> pd.DataFrame:
        """从文件抽取数据"""
        if file_type == 'csv':
            return pd.read_csv(file_path)
        elif file_type == 'json':
            return pd.read_json(file_path)
        elif file_type == 'parquet':
            return pd.read_parquet(file_path)
        elif file_type == 'excel':
            return pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def extract_with_pagination(self, base_url: str, 
                                page_param: str = 'page',
                                page_size: int = 100,
                                max_pages: int = 100) -> list:
        """分页抽取"""
        all_data = []
        page = 1
        
        while page <= max_pages:
            params = {page_param: page, 'page_size': page_size}
            data = self.extract_from_api(base_url, params)
            
            if not data or len(data) == 0:
                break
            
            all_data.extend(data)
            page += 1
        
        return all_data

# 使用示例
extractor = DataExtractor({})

# 数据库抽取
df_orders = extractor.extract_from_database(
    "SELECT * FROM orders WHERE order_date >= '2024-01-01'",
    "postgresql://user:pass@localhost:5432/db"
)

# 增量抽取
df_incremental = extractor.extract_incremental(
    table="orders",
    timestamp_col="updated_at",
    last_extract_time=datetime.now() - timedelta(days=1),
    connection_string="postgresql://user:pass@localhost:5432/db"
)

# API 抽取
api_data = extractor.extract_from_api(
    "https://api.example.com/users",
    headers={"Authorization": "Bearer token"}
)

# 文件抽取
df_file = extractor.extract_from_file("data/sales.csv")
```

#### [场景] 典型应用场景

- 数据库同步
- API 数据采集
- 日志文件处理

### 2. 数据转换

#### [概念] 概念解释

数据转换是对抽取的数据进行清洗、标准化、聚合等处理。常见转换包括数据类型转换、空值处理、数据映射、计算字段等。

#### [语法] 核心语法 / 命令 / API

```python
# 数据转换示例
import pandas as pd
import numpy as np
from typing import Callable, List, Dict
from dataclasses import dataclass

@dataclass
class TransformRule:
    """转换规则"""
    column: str
    transform_type: str
    params: dict = None

class DataTransformer:
    """数据转换器"""
    
    def __init__(self):
        self.transformations = []
    
    def add_transformation(self, rule: TransformRule):
        """添加转换规则"""
        self.transformations.append(rule)
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """执行所有转换"""
        for rule in self.transformations:
            df = self._apply_transformation(df, rule)
        return df
    
    def _apply_transformation(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        """应用单个转换"""
        transform_map = {
            'rename': self._rename_column,
            'type_cast': self._type_cast,
            'fill_na': self._fill_na,
            'drop_na': self._drop_na,
            'map_values': self._map_values,
            'calculate': self._calculate,
            'split': self._split_column,
            'concat': self._concat_columns,
            'normalize': self._normalize,
            'aggregate': self._aggregate,
        }
        
        transform_fn = transform_map.get(rule.transform_type)
        if transform_fn:
            return transform_fn(df, rule)
        else:
            raise ValueError(f"Unknown transformation: {rule.transform_type}")
    
    def _rename_column(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        return df.rename(columns={rule.column: rule.params['new_name']})
    
    def _type_cast(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        df[rule.column] = df[rule.column].astype(rule.params['dtype'])
        return df
    
    def _fill_na(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        df[rule.column] = df[rule.column].fillna(rule.params['value'])
        return df
    
    def _drop_na(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        return df.dropna(subset=[rule.column])
    
    def _map_values(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        df[rule.column] = df[rule.column].map(rule.params['mapping'])
        return df
    
    def _calculate(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        df[rule.column] = df.eval(rule.params['expression'])
        return df
    
    def _split_column(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        split_data = df[rule.column].str.split(
            rule.params['delimiter'], 
            expand=True
        )
        for i, col in enumerate(rule.params['new_columns']):
            df[col] = split_data[i]
        return df
    
    def _concat_columns(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        df[rule.column] = df[rule.params['columns']].apply(
            lambda x: rule.params['separator'].join(x.astype(str)), 
            axis=1
        )
        return df
    
    def _normalize(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        col = df[rule.column]
        df[rule.column] = (col - col.min()) / (col.max() - col.min())
        return df
    
    def _aggregate(self, df: pd.DataFrame, rule: TransformRule) -> pd.DataFrame:
        return df.groupby(rule.params['group_by']).agg(rule.params['aggregations'])

# 使用示例
transformer = DataTransformer()

# 添加转换规则
transformer.add_transformation(TransformRule(
    column='customer_name',
    transform_type='rename',
    params={'new_name': 'customer_full_name'}
))

transformer.add_transformation(TransformRule(
    column='order_date',
    transform_type='type_cast',
    params={'dtype': 'datetime64[ns]'}
))

transformer.add_transformation(TransformRule(
    column='amount',
    transform_type='fill_na',
    params={'value': 0}
))

transformer.add_transformation(TransformRule(
    column='status',
    transform_type='map_values',
    params={'mapping': {'P': 'Pending', 'C': 'Completed', 'X': 'Cancelled'}}
))

transformer.add_transformation(TransformRule(
    column='total_amount',
    transform_type='calculate',
    params={'expression': 'quantity * unit_price'}
))

# 执行转换
df_transformed = transformer.transform(df_raw)
```

#### [代码] 代码示例

```python
# 复杂数据转换示例

def clean_customer_data(df: pd.DataFrame) -> pd.DataFrame:
    """清洗客户数据"""
    # 去除空格
    df['customer_name'] = df['customer_name'].str.strip()
    
    # 标准化邮箱
    df['email'] = df['email'].str.lower().str.strip()
    
    # 解析电话号码
    df['phone'] = df['phone'].str.replace(r'\D', '', regex=True)
    
    # 处理缺失值
    df['city'] = df['city'].fillna('Unknown')
    df['country'] = df['country'].fillna('Unknown')
    
    # 去重
    df = df.drop_duplicates(subset=['customer_id'])
    
    return df

def transform_order_data(df: pd.DataFrame) -> pd.DataFrame:
    """转换订单数据"""
    # 计算派生字段
    df['order_year'] = df['order_date'].dt.year
    df['order_month'] = df['order_date'].dt.month
    df['order_weekday'] = df['order_date'].dt.day_name()
    
    # 计算金额
    df['subtotal'] = df['quantity'] * df['unit_price']
    df['discount_amount'] = df['subtotal'] * df['discount_rate']
    df['total_amount'] = df['subtotal'] - df['discount_amount']
    
    # 分类
    df['order_size'] = pd.cut(
        df['total_amount'],
        bins=[0, 100, 500, 1000, float('inf')],
        labels=['Small', 'Medium', 'Large', 'Extra Large']
    )
    
    return df

def aggregate_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """聚合销售数据"""
    return df.groupby(['product_id', 'order_date']).agg({
        'quantity': 'sum',
        'total_amount': 'sum',
        'order_id': 'nunique'
    }).reset_index().rename(columns={
        'quantity': 'total_quantity',
        'total_amount': 'total_revenue',
        'order_id': 'order_count'
    })
```

#### [场景] 典型应用场景

- 数据清洗和标准化
- 数据格式转换
- 数据聚合计算

### 3. 数据加载

#### [概念] 概念解释

数据加载是将转换后的数据写入目标系统的过程。包括全量加载、增量加载、追加加载、覆盖加载等方式。

#### [语法] 核心语法 / 命令 / API

```python
# 数据加载示例
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.postgresql import insert
import pandas as pd
from typing import Literal

class DataLoader:
    """数据加载器"""
    
    def __init__(self, connection_string: str):
        self.engine = create_engine(connection_string)
    
    def load_full(self, df: pd.DataFrame, table: str, 
                  if_exists: Literal['fail', 'replace', 'append'] = 'replace'):
        """全量加载"""
        df.to_sql(table, self.engine, if_exists=if_exists, index=False)
    
    def load_incremental(self, df: pd.DataFrame, table: str, 
                        key_columns: list):
        """增量加载（Upsert）"""
        with self.engine.begin() as conn:
            for _, row in df.iterrows():
                # 检查是否存在
                conditions = ' AND '.join([f"{col} = :{col}" for col in key_columns])
                existing = conn.execute(
                    text(f"SELECT 1 FROM {table} WHERE {conditions}"),
                    {col: row[col] for col in key_columns}
                ).fetchone()
                
                if existing:
                    # 更新
                    update_cols = [col for col in df.columns if col not in key_columns]
                    update_stmt = ', '.join([f"{col} = :{col}" for col in update_cols])
                    conn.execute(
                        text(f"UPDATE {table} SET {update_stmt} WHERE {conditions}"),
                        row.to_dict()
                    )
                else:
                    # 插入
                    cols = ', '.join(df.columns)
                    placeholders = ', '.join([f":{col}" for col in df.columns])
                    conn.execute(
                        text(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"),
                        row.to_dict()
                    )
    
    def load_batch(self, df: pd.DataFrame, table: str, batch_size: int = 1000):
        """批量加载"""
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i + batch_size]
            batch.to_sql(table, self.engine, if_exists='append', index=False)
    
    def load_with_partition(self, df: pd.DataFrame, table: str, 
                           partition_column: str):
        """分区加载"""
        for partition_value, group in df.groupby(partition_column):
            # 创建分区表（如果不存在）
            partition_table = f"{table}_{partition_value}"
            group.to_sql(partition_table, self.engine, if_exists='append', index=False)

# 使用示例
loader = DataLoader("postgresql://user:pass@localhost:5432/dw")

# 全量加载
loader.load_full(df_customers, "dim_customer", if_exists='replace')

# 增量加载
loader.load_incremental(df_orders, "fact_order", key_columns=['order_id'])

# 批量加载
loader.load_batch(df_large_data, "large_table", batch_size=5000)

# 分区加载
loader.load_with_partition(df_sales, "fact_sales", partition_column='order_month')
```

#### [场景] 典型应用场景

- 数据仓库加载
- 数据库同步
- 文件导出

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. ETL 调度

#### [概念] 概念与解决的问题

ETL 调度管理多个任务的执行顺序和依赖关系。Apache Airflow 是最流行的开源调度工具，支持 DAG 定义、任务依赖、重试机制等。

#### [语法] 核心用法

```python
# Apache Airflow DAG 示例
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.dummy import DummyOperator
from airflow.utils.task_group import TaskGroup
from datetime import datetime, timedelta

# 默认参数
default_args = {
    'owner': 'data_team',
    'depends_on_past': False,
    'email': ['data_team@company.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

# 定义 DAG
with DAG(
    'sales_data_pipeline',
    default_args=default_args,
    description='Sales data ETL pipeline',
    schedule_interval='0 2 * * *',  # 每天凌晨 2 点执行
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['etl', 'sales'],
) as dag:
    
    # 开始任务
    start = DummyOperator(task_id='start')
    
    # 数据抽取任务
    def extract_orders(**context):
        # 抽取订单数据
        pass
    
    def extract_customers(**context):
        # 抽取客户数据
        pass
    
    def extract_products(**context):
        # 抽取产品数据
        pass
    
    extract_orders_task = PythonOperator(
        task_id='extract_orders',
        python_callable=extract_orders,
    )
    
    extract_customers_task = PythonOperator(
        task_id='extract_customers',
        python_callable=extract_customers,
    )
    
    extract_products_task = PythonOperator(
        task_id='extract_products',
        python_callable=extract_products,
    )
    
    # 数据转换任务组
    with TaskGroup('transform_group') as transform_group:
        
        def transform_customers(**context):
            # 转换客户数据
            pass
        
        def transform_orders(**context):
            # 转换订单数据
            pass
        
        def validate_data(**context):
            # 数据验证
            pass
        
        transform_customers_task = PythonOperator(
            task_id='transform_customers',
            python_callable=transform_customers,
        )
        
        transform_orders_task = PythonOperator(
            task_id='transform_orders',
            python_callable=transform_orders,
        )
        
        validate_task = PythonOperator(
            task_id='validate_data',
            python_callable=validate_data,
        )
        
        [transform_customers_task, transform_orders_task] >> validate_task
    
    # 数据加载任务
    def load_to_warehouse(**context):
        # 加载到数据仓库
        pass
    
    load_task = PythonOperator(
        task_id='load_to_warehouse',
        python_callable=load_to_warehouse,
    )
    
    # 结束任务
    end = DummyOperator(task_id='end')
    
    # 定义任务依赖
    start >> [extract_orders_task, extract_customers_task, extract_products_task]
    [extract_orders_task, extract_customers_task, extract_products_task] >> transform_group
    transform_group >> load_task >> end
```

#### [关联] 与核心层的关联

ETL 调度编排抽取、转换、加载任务，是 ETL 工程的核心组件。

### 2. 数据质量

#### [概念] 概念与解决的问题

数据质量确保数据的准确性、完整性、一致性、及时性。需要建立数据质量检查规则和监控机制。

#### [语法] 核心用法

```python
# 数据质量检查框架
from dataclasses import dataclass
from typing import Callable, List, Dict
from enum import Enum
import pandas as pd

class QualityLevel(Enum):
    ERROR = "error"      # 阻断加载
    WARNING = "warning"  # 记录警告
    INFO = "info"        # 仅记录

@dataclass
class QualityRule:
    """数据质量规则"""
    name: str
    description: str
    check_fn: Callable[[pd.DataFrame], tuple]
    level: QualityLevel
    threshold: float = 1.0

class DataQualityChecker:
    """数据质量检查器"""
    
    def __init__(self):
        self.rules: List[QualityRule] = []
        self.results: List[Dict] = []
    
    def add_rule(self, rule: QualityRule):
        """添加规则"""
        self.rules.append(rule)
    
    def check(self, df: pd.DataFrame) -> Dict:
        """执行所有检查"""
        self.results = []
        passed = True
        
        for rule in self.rules:
            is_passed, score, details = rule.check_fn(df)
            
            result = {
                'rule': rule.name,
                'level': rule.level.value,
                'passed': is_passed,
                'score': score,
                'threshold': rule.threshold,
                'details': details
            }
            self.results.append(result)
            
            if not is_passed and rule.level == QualityLevel.ERROR:
                passed = False
        
        return {
            'passed': passed,
            'total_rules': len(self.rules),
            'passed_rules': sum(1 for r in self.results if r['passed']),
            'results': self.results
        }

# 预定义检查函数
def check_completeness(column: str) -> Callable:
    """完整性检查"""
    def check(df: pd.DataFrame) -> tuple:
        total = len(df)
        non_null = df[column].notna().sum()
        score = non_null / total if total > 0 else 0
        return score >= 0.99, score, {'null_count': total - non_null}
    return check

def check_uniqueness(column: str) -> Callable:
    """唯一性检查"""
    def check(df: pd.DataFrame) -> tuple:
        total = len(df)
        unique = df[column].nunique()
        score = unique / total if total > 0 else 0
        return score >= 0.99, score, {'duplicate_count': total - unique}
    return check

def check_range(column: str, min_val: float, max_val: float) -> Callable:
    """范围检查"""
    def check(df: pd.DataFrame) -> tuple:
        in_range = ((df[column] >= min_val) & (df[column] <= max_val)).sum()
        total = len(df)
        score = in_range / total if total > 0 else 0
        return score >= 0.99, score, {'out_of_range': total - in_range}
    return check

def check_pattern(column: str, pattern: str) -> Callable:
    """模式检查"""
    def check(df: pd.DataFrame) -> tuple:
        import re
        matches = df[column].astype(str).str.match(pattern).sum()
        total = len(df)
        score = matches / total if total > 0 else 0
        return score >= 0.99, score, {'invalid_count': total - matches}
    return check

# 使用示例
checker = DataQualityChecker()

checker.add_rule(QualityRule(
    name='order_id_completeness',
    description='订单 ID 不能为空',
    check_fn=check_completeness('order_id'),
    level=QualityLevel.ERROR
))

checker.add_rule(QualityRule(
    name='order_id_uniqueness',
    description='订单 ID 必须唯一',
    check_fn=check_uniqueness('order_id'),
    level=QualityLevel.ERROR
))

checker.add_rule(QualityRule(
    name='amount_range',
    description='金额必须在 0-1000000 之间',
    check_fn=check_range('amount', 0, 1000000),
    level=QualityLevel.WARNING
))

checker.add_rule(QualityRule(
    name='email_pattern',
    description='邮箱格式必须正确',
    check_fn=check_pattern('email', r'^[\w\.-]+@[\w\.-]+\.\w+$'),
    level=QualityLevel.WARNING
))

# 执行检查
result = checker.check(df_orders)
print(f"Data quality passed: {result['passed']}")
```

#### [关联] 与核心层的关联

数据质量检查是数据转换和加载的重要环节，确保数据可靠性。

### 3. 错误处理

#### [概念] 概念与解决的问题

ETL 错误处理包括异常捕获、重试机制、错误记录、告警通知等。良好的错误处理可以提高 ETL 的稳定性。

#### [语法] 核心用法

```python
# ETL 错误处理示例
import logging
from functools import wraps
from typing import Callable
import time

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('etl')

def retry(max_attempts: int = 3, delay: int = 5, 
          exceptions: tuple = (Exception,)):
    """重试装饰器"""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_attempts} failed: {e}"
                    )
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
            
            logger.error(f"All {max_attempts} attempts failed")
            raise last_exception
        return wrapper
    return decorator

class ETLErrorHandler:
    """ETL 错误处理器"""
    
    def __init__(self):
        self.error_records = []
    
    def handle_record_error(self, record: dict, error: Exception, 
                           table: str, stage: str):
        """处理单条记录错误"""
        error_info = {
            'table': table,
            'stage': stage,
            'record': record,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'timestamp': datetime.now()
        }
        self.error_records.append(error_info)
        logger.error(f"Record error in {table}.{stage}: {error}")
    
    def get_error_summary(self) -> dict:
        """获取错误摘要"""
        return {
            'total_errors': len(self.error_records),
            'by_table': self._group_errors('table'),
            'by_stage': self._group_errors('stage'),
            'by_type': self._group_errors('error_type')
        }
    
    def _group_errors(self, key: str) -> dict:
        from collections import Counter
        return dict(Counter(e[key] for e in self.error_records))

# 使用示例
error_handler = ETLErrorHandler()

@retry(max_attempts=3, delay=5)
def extract_with_retry():
    # 抽取数据
    pass

def process_records(records: list, table: str):
    """处理记录，捕获单条错误"""
    success_records = []
    
    for record in records:
        try:
            # 转换记录
            transformed = transform_record(record)
            success_records.append(transformed)
        except Exception as e:
            error_handler.handle_record_error(
                record, e, table, 'transform'
            )
    
    return success_records
```

#### [关联] 与核心层的关联

错误处理贯穿 ETL 全流程，保障数据处理的健壮性。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Airflow | 工作流调度平台 |
| dbt | 数据转换工具 |
| Informatica | 企业 ETL 工具 |
| Talend | 开源 ETL 平台 |
| Spark ETL | 大数据 ETL |
| Change Data Capture | 变化数据捕获 |
| Data Validation | 数据验证 |
| Slowly Changing Dimension | 缓慢变化维度 |
| Data Lineage | 数据血缘 |
| ELT | 先加载后转换 |

---

## [实战] 核心实战清单

### 实战任务 1：构建完整 ETL 管道

使用 Airflow 构建一个完整的数据同步管道：

```python
# 完整 ETL 管道示例
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data_team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'full_etl_pipeline',
    default_args=default_args,
    schedule_interval='0 3 * * *',
    start_date=datetime(2024, 1, 1),
) as dag:
    
    def extract(**context):
        # 从源系统抽取数据
        pass
    
    def transform(**context):
        # 数据转换
        pass
    
    def validate(**context):
        # 数据质量检查
        pass
    
    def load(**context):
        # 加载到目标系统
        pass
    
    def notify(**context):
        # 发送通知
        pass
    
    extract_task = PythonOperator(task_id='extract', python_callable=extract)
    transform_task = PythonOperator(task_id='transform', python_callable=transform)
    validate_task = PythonOperator(task_id='validate', python_callable=validate)
    load_task = PythonOperator(task_id='load', python_callable=load)
    notify_task = PythonOperator(task_id='notify', python_callable=notify)
    
    extract_task >> transform_task >> validate_task >> load_task >> notify_task
```
