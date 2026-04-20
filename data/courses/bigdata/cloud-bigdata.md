# 云大数据服务 三层深度学习教程

## [总览] 技术总览

云大数据服务提供托管的大数据处理和分析能力，无需管理底层基础设施。主流服务包括 AWS EMR/Glue/Redshift、Azure Synapse/Databricks、GCP BigQuery/Dataflow 等。云服务降低了大数据技术的使用门槛。

本教程采用三层漏斗学习法：**核心层**聚焦云存储服务、云数据仓库、云计算服务三大基石；**重点层**深入数据流水线和成本优化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 云存储服务

#### [概念] 概念解释

云存储是大数据的基础设施，提供海量数据的存储和管理。主要服务包括 AWS S3、Azure Blob Storage、GCP Cloud Storage。支持多种存储类别和生命周期管理。

#### [语法] 核心语法 / 命令 / API

| 服务 | AWS | Azure | GCP |
|------|-----|-------|-----|
| 对象存储 | S3 | Blob Storage | Cloud Storage |
| 文件存储 | EFS | Files | Filestore |
| 块存储 | EBS | Disk | Persistent Disk |

#### [代码] 代码示例

```python
# AWS S3 操作
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3')

# 创建存储桶
def create_bucket(bucket_name: str, region: str = 'us-east-1'):
    try:
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        print(f"Bucket {bucket_name} created")
    except ClientError as e:
        print(f"Error creating bucket: {e}")

# 上传文件
def upload_file(file_path: str, bucket: str, key: str):
    try:
        s3.upload_file(file_path, bucket, key)
        print(f"Uploaded {file_path} to s3://{bucket}/{key}")
    except ClientError as e:
        print(f"Error uploading file: {e}")

# 分片上传大文件
def upload_large_file(file_path: str, bucket: str, key: str):
    from boto3.s3.transfer import TransferConfig
    
    config = TransferConfig(
        multipart_threshold=100 * 1024 * 1024,  # 100MB
        max_concurrency=10,
        multipart_chunksize=25 * 1024 * 1024  # 25MB
    )
    s3.upload_file(file_path, bucket, key, Config=config)

# 下载文件
def download_file(bucket: str, key: str, file_path: str):
    s3.download_file(bucket, key, file_path)

# 列出对象
def list_objects(bucket: str, prefix: str = ''):
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    for obj in response.get('Contents', []):
        print(f"{obj['Key']} - {obj['Size']} bytes")

# 设置生命周期策略
def set_lifecycle_policy(bucket: str):
    lifecycle_config = {
        'Rules': [
            {
                'ID': 'MoveToIA',
                'Status': 'Enabled',
                'Filter': {'Prefix': 'logs/'},
                'Transitions': [
                    {'Days': 30, 'StorageClass': 'STANDARD_IA'},
                    {'Days': 90, 'StorageClass': 'GLACIER'}
                ]
            },
            {
                'ID': 'DeleteOldVersions',
                'Status': 'Enabled',
                'Filter': {'Prefix': ''},
                'NoncurrentVersionExpiration': {'NoncurrentDays': 30}
            }
        ]
    }
    s3.put_bucket_lifecycle_configuration(
        Bucket=bucket,
        LifecycleConfiguration=lifecycle_config
    )

# Azure Blob Storage 操作
from azure.storage.blob import BlobServiceClient

def azure_blob_operations():
    # 连接
    blob_service = BlobServiceClient.from_connection_string(
        "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
    )
    
    # 创建容器
    container = blob_service.get_container_client("my-container")
    container.create_container()
    
    # 上传文件
    blob_client = blob_service.get_blob_client(
        container="my-container", 
        blob="data/file.csv"
    )
    with open("local_file.csv", "rb") as data:
        blob_client.upload_blob(data)
    
    # 下载文件
    with open("downloaded.csv", "wb") as download_file:
        download_file.write(blob_client.download_blob().readall())

# GCP Cloud Storage 操作
from google.cloud import storage

def gcs_operations():
    client = storage.Client()
    
    # 创建存储桶
    bucket = client.bucket("my-bucket")
    bucket.create(location="us")
    
    # 上传文件
    blob = bucket.blob("data/file.csv")
    blob.upload_from_filename("local_file.csv")
    
    # 下载文件
    blob.download_to_filename("downloaded.csv")
    
    # 设置存储类别
    blob.update_storage_class("NEARLINE")
```

#### [场景] 典型应用场景

- 数据湖存储
- 日志归档
- 静态资源托管

### 2. 云数据仓库

#### [概念] 概念解释

云数据仓库提供托管的 PB 级数据分析服务，支持标准 SQL 查询。主要服务包括 AWS Redshift、Azure Synapse、GCP BigQuery、Snowflake 等。

#### [语法] 核心语法 / 命令 / API

```python
# BigQuery 操作
from google.cloud import bigquery

client = bigquery.Client()

# 创建数据集
def create_dataset(dataset_id: str):
    dataset = bigquery.Dataset(f"{client.project}.{dataset_id}")
    dataset.location = "US"
    dataset = client.create_dataset(dataset)
    print(f"Created dataset {dataset.dataset_id}")

# 创建表
def create_table(dataset_id: str, table_id: str):
    schema = [
        bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("age", "INTEGER", mode="NULLABLE"),
        bigquery.SchemaField("created_at", "TIMESTAMP", mode="NULLABLE"),
    ]
    
    table = bigquery.Table(
        f"{client.project}.{dataset_id}.{table_id}",
        schema=schema
    )
    table = client.create_table(table)
    print(f"Created table {table.table_id}")

# 执行查询
def run_query(query: str):
    query_job = client.query(query)
    results = query_job.result()
    
    for row in results:
        print(row)

# 加载数据
def load_data_from_gcs(uri: str, table_id: str):
    job_config = bigquery.LoadJobConfig(
        schema=[
            bigquery.SchemaField("name", "STRING"),
            bigquery.SchemaField("age", "INTEGER"),
        ],
        skip_leading_rows=1,
        source_format=bigquery.SourceFormat.CSV,
    )
    
    load_job = client.load_table_from_uri(
        uri, table_id, job_config=job_config
    )
    load_job.result()
    print(f"Loaded {load_job.output_rows} rows")

# 导出数据
def export_to_gcs(table_id: str, uri: str):
    destination_uri = uri
    extract_job = client.extract_table(table_id, destination_uri)
    extract_job.result()
    print(f"Exported {table_id} to {destination_uri}")

# AWS Redshift 操作
import psycopg2

def redshift_operations():
    # 连接 Redshift
    conn = psycopg2.connect(
        host="my-cluster.xxxxx.us-east-1.redshift.amazonaws.com",
        database="analytics",
        user="admin",
        password="password",
        port=5439
    )
    
    cursor = conn.cursor()
    
    # 创建表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            sale_id INTEGER IDENTITY(1,1),
            product_id INTEGER,
            quantity INTEGER,
            amount DECIMAL(10,2),
            sale_date DATE
        )
        DISTKEY(product_id)
        SORTKEY(sale_date)
    """)
    
    # 从 S3 加载数据
    cursor.execute("""
        COPY sales
        FROM 's3://my-bucket/sales/'
        IAM_ROLE 'arn:aws:iam::123456789012:role/RedshiftCopyRole'
        CSV
        IGNOREHEADER 1
    """)
    
    # 查询
    cursor.execute("""
        SELECT product_id, SUM(amount) as total
        FROM sales
        GROUP BY product_id
        ORDER BY total DESC
        LIMIT 10
    """)
    
    for row in cursor.fetchall():
        print(row)
    
    conn.commit()
    conn.close()

# Snowflake 操作
import snowflake.connector

def snowflake_operations():
    conn = snowflake.connector.connect(
        user='user',
        password='password',
        account='account',
        warehouse='compute_wh',
        database='analytics',
        schema='public'
    )
    
    cursor = conn.cursor()
    
    # 创建仓库
    cursor.execute("CREATE WAREHOUSE IF NOT EXISTS etl_wh WITH WAREHOUSE_SIZE='XSMALL'")
    
    # 创建表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            event_id STRING,
            user_id STRING,
            event_type STRING,
            event_timestamp TIMESTAMP_NTZ
        )
        CLUSTER BY (event_timestamp)
    """)
    
    # 从 S3 加载数据
    cursor.execute("""
        COPY INTO events
        FROM 's3://my-bucket/events/'
        CREDENTIALS = (AWS_KEY_ID='xxx' AWS_SECRET_KEY='xxx')
        FILE_FORMAT = (TYPE = JSON)
    """)
    
    # 查询
    cursor.execute("""
        SELECT event_type, COUNT(*) as cnt
        FROM events
        GROUP BY event_type
    """)
    
    for row in cursor.fetchall():
        print(row)
    
    conn.close()
```

#### [场景] 典型应用场景

- 数据分析报表
- BI 工具后端
- 数据探索

### 3. 云计算服务

#### [概念] 概念解释

云计算服务提供托管的大数据处理引擎，如 AWS EMR、Azure HDInsight、GCP Dataproc。支持 Spark、Hadoop、Presto 等框架的快速部署。

#### [语法] 核心语法 / 命令 / API

```python
# AWS EMR 操作
import boto3

emr = boto3.client('emr')

def create_emr_cluster():
    cluster_response = emr.run_job_flow(
        Name='Spark Cluster',
        ReleaseLabel='emr-6.9.0',
        Applications=[
            {'Name': 'Spark'},
            {'Name': 'Hive'},
            {'Name': 'Presto'}
        ],
        Instances={
            'InstanceGroups': [
                {
                    'Name': 'Master nodes',
                    'Market': 'ON_DEMAND',
                    'InstanceRole': 'MASTER',
                    'InstanceType': 'm5.xlarge',
                    'InstanceCount': 1
                },
                {
                    'Name': 'Worker nodes',
                    'Market': 'ON_DEMAND',
                    'InstanceRole': 'CORE',
                    'InstanceType': 'm5.xlarge',
                    'InstanceCount': 3
                }
            ],
            'Ec2KeyName': 'my-key',
            'KeepJobFlowAliveWhenNoSteps': False,
            'TerminationProtected': False
        },
        Steps=[
            {
                'Name': 'Run Spark Job',
                'ActionOnFailure': 'TERMINATE_CLUSTER',
                'HadoopJarStep': {
                    'Jar': 'command-runner.jar',
                    'Args': [
                        'spark-submit',
                        '--deploy-mode', 'cluster',
                        's3://my-bucket/scripts/process.py'
                    ]
                }
            }
        ],
        JobFlowRole='EMR_EC2_DefaultRole',
        ServiceRole='EMR_DefaultRole',
        LogUri='s3://my-bucket/logs/'
    )
    
    cluster_id = cluster_response['JobFlowId']
    print(f"Created cluster: {cluster_id}")
    return cluster_id

# AWS Glue 操作
def glue_operations():
    glue = boto3.client('glue')
    
    # 创建数据库
    glue.create_database(
        DatabaseInput={'Name': 'analytics_db'}
    )
    
    # 创建爬虫
    glue.create_crawler(
        Name='s3_crawler',
        Role='AWSGlueServiceRole',
        DatabaseName='analytics_db',
        Targets={
            'S3Targets': [
                {'Path': 's3://my-bucket/data/'}
            ]
        }
    )
    
    # 运行爬虫
    glue.start_crawler(Name='s3_crawler')
    
    # 运行 ETL 作业
    glue.start_job_run(JobName='etl_job')

# GCP Dataproc 操作
from google.cloud import dataproc_v1

def dataproc_operations():
    cluster_client = dataproc_v1.ClusterControllerClient(
        client_options={'api_endpoint': 'us-central1-dataproc.googleapis.com:443'}
    )
    
    # 创建集群
    cluster = {
        'project_id': 'my-project',
        'cluster_name': 'spark-cluster',
        'config': {
            'master_config': {
                'num_instances': 1,
                'machine_type_uri': 'n1-standard-4'
            },
            'worker_config': {
                'num_instances': 3,
                'machine_type_uri': 'n1-standard-4'
            },
            'software_config': {
                'image_version': '2.0-debian10'
            }
        }
    }
    
    operation = cluster_client.create_cluster(
        request={'project_id': 'my-project', 'region': 'us-central1', 'cluster': cluster}
    )
    
    # 提交作业
    job_client = dataproc_v1.JobControllerClient(
        client_options={'api_endpoint': 'us-central1-dataproc.googleapis.com:443'}
    )
    
    job = {
        'placement': {'cluster_name': 'spark-cluster'},
        'pyspark_job': {
            'main_python_file_uri': 'gs://my-bucket/scripts/process.py'
        }
    }
    
    job_client.submit_job(
        request={'project_id': 'my-project', 'region': 'us-central1', 'job': job}
    )
```

#### [场景] 典型应用场景

- 大规模数据处理
- 批量 ETL 任务
- 数据科学计算

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 数据流水线

#### [概念] 概念与解决的问题

数据流水线自动化数据处理流程，实现从数据源到目标的端到端处理。云服务提供托管的流水线服务如 AWS Data Pipeline、Azure Data Factory、GCP Dataflow。

#### [语法] 核心用法

```python
# AWS Step Functions 数据流水线
import boto3

stepfunctions = boto3.client('stepfunctions')

# 定义状态机
state_machine_definition = """
{
  "Comment": "Data Pipeline",
  "StartAt": "ExtractData",
  "States": {
    "ExtractData": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:extract-function",
      "Next": "ValidateData"
    },
    "ValidateData": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-function",
      "Next": "TransformChoice"
    },
    "TransformChoice": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.dataType",
          "StringEquals": "ORDER",
          "Next": "TransformOrders"
        },
        {
          "Variable": "$.dataType",
          "StringEquals": "USER",
          "Next": "TransformUsers"
        }
      ],
      "Default": "HandleError"
    },
    "TransformOrders": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:transform-orders",
      "Next": "LoadData"
    },
    "TransformUsers": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:transform-users",
      "Next": "LoadData"
    },
    "LoadData": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:load-function",
      "End": true
    },
    "HandleError": {
      "Type": "Fail",
      "Cause": "Unknown data type"
    }
  }
}
"""

# 创建状态机
response = stepfunctions.create_state_machine(
    name='DataPipeline',
    definition=state_machine_definition,
    roleArn='arn:aws:iam::123456789012:role/StepFunctionsRole'
)

# Azure Data Factory
from azure.identity import DefaultAzureCredential
from azure.mgmt.datafactory import DataFactoryManagementClient

def create_data_factory_pipeline():
    credential = DefaultAzureCredential()
    client = DataFactoryManagementClient(credential, subscription_id)
    
    # 创建管道
    pipeline = {
        'activities': [
            {
                'name': 'CopyFromS3',
                'type': 'Copy',
                'inputs': [{'referenceName': 'S3Source', 'type': 'DatasetReference'}],
                'outputs': [{'referenceName': 'BlobSink', 'type': 'DatasetReference'}],
                'typeProperties': {
                    'source': {'type': 'AmazonS3Source'},
                    'sink': {'type': 'BlobSink'}
                }
            },
            {
                'name': 'SparkTransform',
                'type': 'HDInsightSpark',
                'linkedServiceName': {'referenceName': 'SparkCluster', 'type': 'LinkedServiceReference'},
                'typeProperties': {
                    'rootPath': 'adftutorial/spark',
                    'entryFilePath': 'transform.py'
                },
                'dependsOn': [{'activity': 'CopyFromS3', 'dependencyConditions': ['Succeeded']}]
            }
        ]
    }
    
    client.pipelines.create_or_update(
        resource_group_name='rg',
        factory_name='adf',
        pipeline_name='ETLPipeline',
        parameters=pipeline
    )
```

#### [关联] 与核心层的关联

数据流水线编排存储、计算、仓库服务，实现端到端数据处理。

### 2. 成本优化

#### [概念] 概念与解决的问题

云大数据服务按使用量计费，需要合理规划资源使用以控制成本。优化策略包括存储分层、计算弹性、查询优化等。

#### [语法] 核心用法

```python
# 成本监控和优化
import boto3

ce = boto3.client('ce')  # Cost Explorer

def get_daily_costs(start_date: str, end_date: str):
    """获取每日成本"""
    response = ce.get_cost_and_usage(
        TimePeriod={'Start': start_date, 'End': end_date},
        Granularity='DAILY',
        Metrics=['BlendedCost'],
        GroupBy=[{'Type': 'SERVICE', 'Key': 'SERVICE'}]
    )
    
    for result in response['ResultsByTime']:
        print(f"Date: {result['TimePeriod']['Start']}")
        for group in result['Groups']:
            service = group['Keys'][0]
            cost = group['Metrics']['BlendedCost']['Amount']
            print(f"  {service}: ${cost}")

def optimize_s3_storage():
    """优化 S3 存储成本"""
    s3 = boto3.client('s3')
    
    # 分析存储使用
    response = s3.list_buckets()
    for bucket in response['Buckets']:
        # 获取存储统计
        metrics = s3.get_bucket_metrics_configuration(
            Bucket=bucket['Name'],
            Id='EntireBucket'
        )
        
        # 设置智能分层
        s3.put_bucket_intelligent_tiering_configuration(
            Bucket=bucket['Name'],
            Id='DefaultConfig',
            IntelligentTieringConfiguration={
                'Id': 'DefaultConfig',
                'Status': 'Enabled',
                'Filter': {'Prefix': ''},
                'Tierings': [
                    {'Days': 90, 'AccessTier': 'ARCHIVE_ACCESS'},
                    {'Days': 180, 'AccessTier': 'DEEP_ARCHIVE_ACCESS'}
                ]
            }
        )

def optimize_bigquery():
    """优化 BigQuery 成本"""
    from google.cloud import bigquery
    client = bigquery.Client()
    
    # 设置查询缓存
    job_config = bigquery.QueryJobConfig(
        use_query_cache=True
    )
    
    # 使用分区表减少扫描
    query = """
        SELECT * 
        FROM `project.dataset.table`
        WHERE date >= '2024-01-01'
        AND date < '2024-02-01'
    """
    
    # 估算查询成本
    job = client.query(query, job_config=job_config)
    print(f"Bytes processed: {job.total_bytes_processed}")
    
    # 设置预算告警
    from google.cloud import billing
    billing_client = billing.CloudBillingClient()
```

#### [关联] 与核心层的关联

成本优化基于对云服务的深入理解，是生产环境的必要考量。

### 3. 安全与合规

#### [概念] 概念与解决的问题

云大数据安全包括数据加密、访问控制、网络隔离、审计日志等。需要遵循合规要求如 GDPR、HIPAA 等。

#### [语法] 核心用法

```python
# 数据加密
def enable_encryption():
    s3 = boto3.client('s3')
    
    # 启用默认加密
    s3.put_bucket_encryption(
        Bucket='my-bucket',
        ServerSideEncryptionConfiguration={
            'Rules': [
                {
                    'ApplyServerSideEncryptionByDefault': {
                        'SSEAlgorithm': 'aws:kms',
                        'KMSMasterKeyID': 'arn:aws:kms:us-east-1:123456789012:key/xxx'
                    }
                }
            ]
        }
    )

# 访问控制
def setup_access_control():
    iam = boto3.client('iam')
    
    # 创建最小权限策略
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::my-bucket",
                    "arn:aws:s3:::my-bucket/*"
                ]
            }
        ]
    }
    
    iam.put_role_policy(
        RoleName='DataAccessRole',
        PolicyName='S3ReadAccess',
        PolicyDocument=json.dumps(policy)
    )

# 审计日志
def enable_audit_logging():
    # CloudTrail
    cloudtrail = boto3.client('cloudtrail')
    cloudtrail.create_trail(
        Name='DataTrail',
        S3BucketName='audit-logs',
        IncludeGlobalServiceEvents=True
    )
    
    # BigQuery 审计日志
    from google.cloud import bigquery
    client = bigquery.Client()
    
    # 查询审计日志
    query = """
        SELECT 
            timestamp,
            protopayload_auditlog.authenticationInfo.principalEmail as user,
            protopayload_auditlog.methodName as method,
            protopayload_auditlog.resourceName as resource
        FROM `project.dataset.cloudaudit_googleapis_com_data_access_*`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
    """
```

#### [关联] 与核心层的关联

安全配置贯穿所有云服务，是数据治理的重要组成部分。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| Data Lake | 数据湖架构 |
| Lakehouse | 湖仓一体 |
| Serverless | 无服务器计算 |
| Spot Instances | 竞价实例 |
| Reserved Capacity | 预留容量 |
| Multi-region | 多区域部署 |
| Disaster Recovery | 灾难恢复 |
| Data Catalog | 数据目录 |
| Schema Registry | 模式注册 |
| Data Mesh | 数据网格 |

---

## [实战] 核心实战清单

### 实战任务 1：构建云原生数据平台

使用云服务构建完整的数据平台：

```python
# 云原生数据平台架构

# 1. 数据湖层
# S3/GCS 存储原始数据

# 2. 数据处理层
# EMR/Dataproc 运行 Spark ETL

# 3. 数据仓库层
# Redshift/BigQuery 存储分析数据

# 4. 编排层
# Step Functions/Airflow 调度任务

# 5. 监控层
# CloudWatch 监控和告警

# 完整流水线示例
def create_data_platform():
    # 创建数据湖存储
    create_data_lake_buckets()
    
    # 创建数据处理集群
    create_emr_cluster()
    
    # 创建数据仓库
    create_redshift_cluster()
    
    # 创建调度流水线
    create_step_functions_pipeline()
    
    # 配置监控告警
    setup_cloudwatch_alarms()
```
