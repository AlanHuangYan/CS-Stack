# Serverless 基础 三层深度学习教程

## [总览] 技术总览

Serverless 是一种云计算执行模型，开发者无需管理服务器基础设施，只需编写业务逻辑代码。云提供商自动处理服务器配置、扩展和维护。Serverless 让开发者专注于业务代码，降低运维成本，实现按需付费。

本教程采用三层漏斗学习法：**核心层**聚焦函数即服务（FaaS）、事件触发、无状态设计三大基石；**重点层**深入冷启动优化、函数编排、成本控制；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

> **学习目标**：掌握本部分全部内容后，你应当能独立完成 Serverless 开发 **50% 以上** 的常见任务。

### 1. 函数即服务（FaaS）

#### [概念] 概念解释

FaaS 是 Serverless 的核心概念，开发者将代码部署为独立的函数，由云平台按需执行。函数由事件触发，执行完毕后自动释放资源。这种模式实现了真正的按使用付费。

#### [语法] 核心语法 / 命令 / API

**AWS Lambda 函数结构：**

| 组件 | 说明 |
|------|------|
| Handler | 函数入口点 |
| Event | 触发事件数据 |
| Context | 运行时上下文 |
| Response | 函数返回值 |

#### [代码] 代码示例

```python
# AWS Lambda Python 函数示例
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Lambda 函数入口点
    
    Args:
        event: 触发事件数据
        context: 运行时上下文信息
    """
    logger.info(f"收到事件: {json.dumps(event)}")
    
    # 获取请求参数
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    # 业务逻辑处理
    if http_method == 'GET':
        response_body = {
            'message': 'Hello from Lambda!',
            'path': path,
            'timestamp': context.aws_request_id
        }
    elif http_method == 'POST':
        body = json.loads(event.get('body', '{}'))
        response_body = {
            'message': '数据已接收',
            'data': body
        }
    else:
        response_body = {'error': '不支持的请求方法'}
    
    # 返回 API Gateway 格式响应
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_body)
    }

# 本地测试
if __name__ == "__main__":
    test_event = {
        'httpMethod': 'GET',
        'path': '/hello'
    }
    
    class MockContext:
        aws_request_id = "test-request-id"
    
    result = lambda_handler(test_event, MockContext())
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

```yaml
# serverless.yml 配置文件
service: my-serverless-app

provider:
  name: aws
  runtime: python3.9
  region: ap-northeast-1
  stage: dev
  timeout: 30
  memorySize: 256

functions:
  hello:
    handler: handler.lambda_handler
    events:
      - http:
          path: hello
          method: get
          cors: true
      - http:
          path: hello
          method: post
          cors: true

plugins:
  - serverless-python-requirements
```

#### [场景] 典型应用场景

1. API 后端服务，处理 HTTP 请求
2. 数据处理管道，响应文件上传事件
3. 定时任务执行，如数据备份和清理

### 2. 事件触发

#### [概念] 概念解释

Serverless 函数由各种事件触发执行，包括 HTTP 请求、数据库变更、消息队列、定时任务等。事件驱动架构使函数能够响应各种系统状态变化。

#### [语法] 核心语法 / 命令 / API

**常见事件源：**

| 事件源 | 触发场景 |
|--------|----------|
| API Gateway | HTTP 请求 |
| S3 | 文件上传/删除 |
| DynamoDB | 数据变更流 |
| SNS/SQS | 消息通知 |
| CloudWatch | 定时任务 |
| Kinesis | 数据流处理 |

#### [代码] 代码示例

```python
# S3 文件上传触发函数
import json
import boto3
import urllib.parse

s3_client = boto3.client('s3')

def s3_handler(event, context):
    """处理 S3 文件上传事件"""
    
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(
            record['s3']['object']['key']
        )
        
        print(f"处理文件: s3://{bucket}/{key}")
        
        try:
            # 读取文件内容
            response = s3_client.get_object(Bucket=bucket, Key=key)
            content = response['Body'].read().decode('utf-8')
            
            # 处理文件内容
            lines = content.split('\n')
            processed_count = len([l for l in lines if l.strip()])
            
            print(f"处理完成，共 {processed_count} 行数据")
            
        except Exception as e:
            print(f"处理文件失败: {e}")
            raise e
    
    return {
        'statusCode': 200,
        'body': json.dumps({'processed': len(event['Records'])})
    }

# DynamoDB Stream 触发函数
def dynamodb_handler(event, context):
    """处理 DynamoDB 数据变更事件"""
    
    for record in event['Records']:
        event_name = record['eventName']
        
        if event_name == 'INSERT':
            new_image = record['dynamodb']['NewImage']
            print(f"新增数据: {new_image}")
            
        elif event_name == 'MODIFY':
            old_image = record['dynamodb']['OldImage']
            new_image = record['dynamodb']['NewImage']
            print(f"数据修改: {old_image} -> {new_image}")
            
        elif event_name == 'REMOVE':
            old_image = record['dynamodb']['OldImage']
            print(f"数据删除: {old_image}")
    
    return {'processed': len(event['Records'])}

# 定时任务触发函数
def scheduled_handler(event, context):
    """处理定时触发事件"""
    import datetime
    
    now = datetime.datetime.now()
    print(f"定时任务执行时间: {now}")
    
    # 执行定时任务逻辑
    # 例如：数据备份、清理过期数据等
    
    return {
        'status': 'completed',
        'timestamp': now.isoformat()
    }
```

#### [场景] 典型应用场景

1. 图片上传后自动生成缩略图
2. 数据库变更实时同步
3. 定期生成报表和统计数据

### 3. 无状态设计

#### [概念] 概念解释

Serverless 函数必须是无状态的，每次执行都是独立的实例。状态数据需要存储在外部服务中，如数据库、缓存或对象存储。这种设计使函数能够自动扩展和容错。

#### [语法] 核心语法 / 命令 / API

**状态存储方案：**

| 存储类型 | 服务 | 适用场景 |
|----------|------|----------|
| 键值存储 | DynamoDB | 用户会话、配置 |
| 缓存 | ElastiCache | 临时数据、计数器 |
| 对象存储 | S3 | 文件、大数据 |
| 关系数据库 | RDS | 事务数据 |

#### [代码] 代码示例

```python
# 无状态函数设计示例
import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME', 'users'))

def stateless_handler(event, context):
    """
    无状态函数：用户会话管理
    状态存储在 DynamoDB 中
    """
    
    # 从事件获取用户 ID
    user_id = event.get('userId')
    action = event.get('action')
    
    if action == 'login':
        # 创建会话状态
        session_data = {
            'userId': user_id,
            'loginTime': context.aws_request_id,
            'status': 'active'
        }
        table.put_item(Item=session_data)
        return {'status': 'logged_in', 'userId': user_id}
    
    elif action == 'check':
        # 读取会话状态
        response = table.get_item(Key={'userId': user_id})
        session = response.get('Item')
        
        if session:
            return {'status': 'active', 'session': session}
        else:
            return {'status': 'not_found'}
    
    elif action == 'logout':
        # 删除会话状态
        table.delete_item(Key={'userId': user_id})
        return {'status': 'logged_out'}

# 使用环境变量配置
# 环境变量在 serverless.yml 中定义
"""
provider:
  environment:
    TABLE_NAME: ${self:service}-${self:provider.stage}-sessions
"""
```

#### [场景] 典型应用场景

1. 用户认证和会话管理
2. 购物车状态维护
3. 工作流状态跟踪

---

## [重点] 第二部分：重点层（20% 进阶内容）

> **学习目标**：掌握本部分后，你的 Serverless 应用性能和成本控制能力将显著提升。

### 1. 冷启动优化

#### [概念] 概念与解决的问题

冷启动是指函数首次调用或长时间未调用后，云平台需要初始化运行环境，导致响应延迟。优化冷启动可以提升用户体验和系统性能。

#### [语法] 核心用法

**冷启动优化策略：**

| 策略 | 说明 |
|------|------|
| 减少依赖 | 精简代码包大小 |
| 预留实例 | 保持函数预热状态 |
| 连接复用 | 复用数据库连接 |
| 分层部署 | 使用 Lambda Layers |

#### [代码] 代码示例

```python
# 冷启动优化示例
import json
import boto3
import os

# 在函数外部初始化客户端（连接复用）
# 这些对象在容器复用时会被保留
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TABLE_NAME'))

# 全局缓存
_cache = {}

def optimized_handler(event, context):
    """优化后的函数处理"""
    
    # 复用全局缓存
    cache_key = event.get('cacheKey')
    
    if cache_key in _cache:
        return {'data': _cache[cache_key], 'source': 'cache'}
    
    # 执行业务逻辑
    result = process_data(event)
    
    # 更新缓存
    _cache[cache_key] = result
    
    return {'data': result, 'source': 'computed'}

def process_data(event):
    """数据处理逻辑"""
    return {'processed': True, 'data': event}

# serverless.yml 配置预留实例
"""
functions:
  optimized:
    handler: handler.optimized_handler
    reservedConcurrency: 5
    provisionedConcurrency: 2
"""
```

#### [关联] 与核心层的关联

冷启动优化是在无状态设计基础上的性能增强，通过合理的资源管理和缓存策略减少初始化开销。

### 2. 函数编排

#### [概念] 概念与解决的问题

复杂业务流程需要多个函数协调执行。函数编排提供了工作流管理能力，支持顺序执行、并行处理、错误重试等模式。

#### [语法] 核心用法

**Step Functions 状态类型：**

| 状态类型 | 用途 |
|----------|------|
| Task | 执行函数 |
| Choice | 条件分支 |
| Parallel | 并行执行 |
| Wait | 延迟等待 |
| Map | 批量处理 |

#### [代码] 代码示例

```json
// Step Functions 工作流定义
{
  "Comment": "订单处理工作流",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:region:account:function:validate-order",
      "Next": "CheckInventory"
    },
    "CheckInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:region:account:function:check-inventory",
      "Next": "InventoryChoice"
    },
    "InventoryChoice": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.inStock",
          "BooleanEquals": true,
          "Next": "ProcessPayment"
        }
      ],
      "Default": "NotifyOutOfStock"
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:region:account:function:process-payment",
      "Retry": [
        {
          "ErrorEquals": ["PaymentError"],
          "IntervalSeconds": 2,
          "MaxAttempts": 3
        }
      ],
      "Next": "ShipOrder"
    },
    "ShipOrder": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "UpdateInventory",
          "States": {
            "UpdateInventory": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:region:account:function:update-inventory",
              "End": true
            }
          }
        },
        {
          "StartAt": "SendConfirmation",
          "States": {
            "SendConfirmation": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:region:account:function:send-confirmation",
              "End": true
            }
          }
        }
      ],
      "Next": "Success"
    },
    "NotifyOutOfStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:region:account:function:notify-out-of-stock",
      "Next": "Fail"
    },
    "Success": {
      "Type": "Succeed"
    },
    "Fail": {
      "Type": "Fail"
    }
  }
}
```

#### [场景] 典型应用场景

1. 订单处理流程
2. 数据处理管道
3. 审批工作流

### 3. 成本控制

#### [概念] 概念与解决的问题

Serverless 按执行次数和运行时间计费，不合理的配置可能导致成本失控。需要优化内存配置、执行时间和调用频率。

#### [语法] 核心用法

**成本优化策略：**

| 策略 | 说明 |
|------|------|
| 内存调优 | 找到最佳内存配置 |
| 批量处理 | 合并多次调用 |
| 缓存策略 | 减少重复计算 |
| 监控告警 | 设置预算告警 |

#### [代码] 代码示例

```python
# 成本优化示例
import json
import boto3
from datetime import datetime

def cost_optimized_handler(event, context):
    """
    成本优化的数据处理函数
    """
    
    # 批量处理多条记录
    records = event.get('records', [])
    batch_size = 100
    
    results = []
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        
        # 批量处理
        batch_results = process_batch(batch)
        results.extend(batch_results)
    
    return {
        'processed': len(results),
        'timestamp': datetime.now().isoformat()
    }

def process_batch(batch):
    """批量处理逻辑"""
    return [
        {'id': r['id'], 'processed': True}
        for r in batch
    ]

# serverless.yml 成本配置
"""
functions:
  costOptimized:
    handler: handler.cost_optimized_handler
    memorySize: 256
    timeout: 30
    reservedConcurrency: 10
"""
```

---

## [扩展] 第三部分：扩展层（60% 按需检索）

> **学习策略**：本层内容仅作索引，遇到具体场景时再查阅官方文档深入学习。

| 关键词 | 场景提示 |
|--------|----------|
| Lambda Layers | 需要共享依赖库时 |
| Provisioned Concurrency | 需要消除冷启动延迟时 |
| Step Functions | 需要复杂工作流编排时 |
| API Gateway | 需要构建 REST API 时 |
| EventBridge | 需要事件总线架构时 |
| SAM/Serverless Framework | 需要基础设施即代码时 |
| X-Ray | 需要分布式追踪时 |
| CloudWatch Insights | 需要日志分析时 |
| Lambda Extensions | 需要扩展函数能力时 |
| Container Image | 需要自定义运行时时 |

---

## [实战] 核心实战清单

### 实战任务 1：构建 Serverless REST API

**任务描述：**
使用 Serverless Framework 构建一个完整的 REST API，包含用户 CRUD 操作，数据存储在 DynamoDB 中。

**要求：**
- 实现用户创建、查询、更新、删除功能
- 配置 API Gateway 和 DynamoDB
- 实现输入验证和错误处理
- 添加日志记录和监控

**参考实现：**

```python
# handler.py
import json
import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('USERS_TABLE'))

def create_user(event, context):
    """创建用户"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # 输入验证
        if not body.get('name') or not body.get('email'):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'name and email are required'})
            }
        
        user = {
            'userId': str(uuid.uuid4()),
            'name': body['name'],
            'email': body['email'],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        table.put_item(Item=user)
        
        return {
            'statusCode': 201,
            'body': json.dumps(user)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def get_user(event, context):
    """获取用户"""
    try:
        user_id = event['pathParameters']['userId']
        
        response = table.get_item(Key={'userId': user_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        
        return {
            'statusCode': 200,
            'body': json.dumps(response['Item'])
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def list_users(event, context):
    """列出所有用户"""
    try:
        response = table.scan()
        
        return {
            'statusCode': 200,
            'body': json.dumps({'users': response.get('Items', [])})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def update_user(event, context):
    """更新用户"""
    try:
        user_id = event['pathParameters']['userId']
        body = json.loads(event.get('body', '{}'))
        
        update_expr = 'SET updatedAt = :updatedAt'
        expr_values = {
            ':updatedAt': datetime.now().isoformat()
        }
        
        if 'name' in body:
            update_expr += ', #name = :name'
            expr_values[':name'] = body['name']
        
        if 'email' in body:
            update_expr += ', email = :email'
            expr_values[':email'] = body['email']
        
        response = table.update_item(
            Key={'userId': user_id},
            UpdateExpression=update_expr,
            ExpressionAttributeNames={'#name': 'name'},
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps(response['Attributes'])
        }
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ValidationException':
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        raise e

def delete_user(event, context):
    """删除用户"""
    try:
        user_id = event['pathParameters']['userId']
        
        table.delete_item(Key={'userId': user_id})
        
        return {
            'statusCode': 204,
            'body': ''
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

```yaml
# serverless.yml
service: serverless-api

provider:
  name: aws
  runtime: python3.9
  region: ap-northeast-1
  environment:
    USERS_TABLE: ${self:service}-${self:provider.stage}-users

functions:
  createUser:
    handler: handler.create_user
    events:
      - http:
          path: users
          method: post
          cors: true

  getUser:
    handler: handler.get_user
    events:
      - http:
          path: users/{userId}
          method: get
          cors: true

  listUsers:
    handler: handler.list_users
    events:
      - http:
          path: users
          method: get
          cors: true

  updateUser:
    handler: handler.update_user
    events:
      - http:
          path: users/{userId}
          method: put
          cors: true

  deleteUser:
    handler: handler.delete_user
    events:
      - http:
          path: users/{userId}
          method: delete
          cors: true

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-${self:provider.stage}-users
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
