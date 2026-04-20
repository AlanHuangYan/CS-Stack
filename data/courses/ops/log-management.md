# 日志管理 三层深度学习教程

## [总览] 技术总览

日志管理是收集、存储、分析和查询系统日志的系统化方法。现代日志管理采用 ELK Stack（Elasticsearch、Logstash、Kibana）或 EFK Stack（Fluentd 替代 Logstash）。日志是故障排查和安全审计的重要数据源。

本教程采用三层漏斗学习法：**核心层**聚焦日志收集、日志解析、日志查询三大基石；**重点层**深入日志分析和告警；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 日志收集

#### [概念] 概念解释

日志收集从各种数据源采集日志数据。常见数据源包括应用日志、系统日志、Web 服务器日志等。收集方式包括文件采集、网络传输、API 推送等。

#### [语法] 核心语法 / 命令 / API

```python
import logging
import json
from datetime import datetime
import socket
import structlog

# 结构化日志配置
def setup_structured_logging():
    """配置结构化日志"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# 使用结构化日志
logger = structlog.get_logger()

def process_order(order_id: str, user_id: str):
    """处理订单示例"""
    log = logger.bind(order_id=order_id, user_id=user_id)
    
    log.info("order_processing_started")
    
    try:
        # 业务逻辑
        log.info("order_validated", items_count=3)
        log.info("order_completed", total_amount=150.00)
    except Exception as e:
        log.error("order_failed", error=str(e))
        raise

# 日志收集器
class LogCollector:
    """日志收集器"""
    
    def __init__(self, buffer_size: int = 1000):
        self.buffer = []
        self.buffer_size = buffer_size
    
    def collect_from_file(self, file_path: str, follow: bool = True):
        """从文件收集日志"""
        with open(file_path, 'r') as f:
            if follow:
                # 类似 tail -f
                f.seek(0, 2)  # 移动到文件末尾
                while True:
                    line = f.readline()
                    if line:
                        self._process_line(line)
                    else:
                        time.sleep(0.1)
            else:
                for line in f:
                    self._process_line(line)
    
    def collect_from_syslog(self, port: int = 514):
        """从 Syslog 收集日志"""
        import socketserver
        
        class SyslogHandler(socketserver.BaseRequestHandler):
            def handle(self):
                data = self.request[0].strip()
                # 处理 syslog 消息
                print(f"Received: {data}")
        
        server = socketserver.UDPServer(('0.0.0.0', port), SyslogHandler)
        server.serve_forever()
    
    def _process_line(self, line: str):
        """处理日志行"""
        log_entry = {
            'raw': line,
            'timestamp': datetime.now().isoformat(),
            'source': 'file'
        }
        
        self.buffer.append(log_entry)
        
        if len(self.buffer) >= self.buffer_size:
            self._flush()
    
    def _flush(self):
        """刷新缓冲区"""
        # 发送到日志存储
        print(f"Flushing {len(self.buffer)} log entries")
        self.buffer = []

# Fluentd 配置示例
"""
# fluent.conf
<source>
  @type tail
  path /var/log/app/*.log
  pos_file /var/log/fluentd/app.log.pos
  tag app
  format json
  time_key timestamp
</source>

<filter app.**>
  @type parser
  key_name message
  reserve_data true
  <parse>
    @type json
  </parse>
</filter>

<match app.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name app-logs
  type_name _doc
  logstash_format true
  logstash_prefix app
</match>
"""

# Logstash 配置示例
"""
# logstash.conf
input {
  file {
    path => "/var/log/app/*.log"
    start_position => "beginning"
    codec => json
  }
  
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
"""
```

#### [场景] 典型应用场景

- 应用日志集中收集
- 系统日志聚合
- 多源日志统一管理

### 2. 日志解析

#### [概念] 概念解释

日志解析将非结构化日志转换为结构化数据。常用方法包括正则表达式、Grok 模式、JSON 解析等。解析后的日志便于查询和分析。

#### [语法] 核心语法 / 命令 / API

```python
import re
import json
from datetime import datetime
from typing import Dict, Optional

class LogParser:
    """日志解析器"""
    
    def __init__(self):
        # 常见日志格式模式
        self.patterns = {
            'apache_combined': re.compile(
                r'(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] '
                r'"(?P<method>\S+) (?P<path>\S+) (?P<protocol>[^"]+)" '
                r'(?P<status>\d+) (?P<size>\S+) '
                r'"(?P<referer>[^"]*)" "(?P<user_agent>[^"]*)"'
            ),
            'nginx': re.compile(
                r'(?P<ip>\S+) - (?P<user>\S+) \[(?P<timestamp>[^\]]+)\] '
                r'"(?P<request>[^"]*)" (?P<status>\d+) (?P<size>\S+) '
                r'"(?P<referer>[^"]*)" "(?P<user_agent>[^"]*)"'
            ),
            'syslog': re.compile(
                r'(?P<timestamp>\w{3}\s+\d+\s+\d+:\d+:\d+) '
                r'(?P<hostname>\S+) (?P<program>\S+?)(?:\[(?P<pid>\d+)\])?: '
                r'(?P<message>.*)'
            ),
            'json': None  # JSON 格式直接解析
        }
    
    def parse(self, line: str, log_type: str = 'auto') -> Optional[Dict]:
        """解析日志行"""
        if log_type == 'auto':
            return self._auto_detect_parse(line)
        
        if log_type == 'json':
            return self._parse_json(line)
        
        pattern = self.patterns.get(log_type)
        if pattern:
            return self._parse_with_pattern(line, pattern)
        
        return {'raw': line}
    
    def _auto_detect_parse(self, line: str) -> Optional[Dict]:
        """自动检测并解析"""
        # 尝试 JSON
        if line.strip().startswith('{'):
            result = self._parse_json(line)
            if result:
                return result
        
        # 尝试其他格式
        for log_type, pattern in self.patterns.items():
            if pattern:
                result = self._parse_with_pattern(line, pattern)
                if result:
                    result['log_type'] = log_type
                    return result
        
        return {'raw': line}
    
    def _parse_json(self, line: str) -> Optional[Dict]:
        """解析 JSON 日志"""
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            return None
    
    def _parse_with_pattern(self, line: str, pattern: re.Pattern) -> Optional[Dict]:
        """使用正则模式解析"""
        match = pattern.match(line)
        if match:
            return match.groupdict()
        return None

# Grok 模式解析器
class GrokParser:
    """Grok 模式解析器"""
    
    def __init__(self):
        self.patterns = {
            'WORD': r'\w+',
            'NUMBER': r'\d+',
            'IP': r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
            'TIMESTAMP_ISO8601': r'\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?',
            'QS': r'"[^"]*"',
            'DATA': r'.*?'
        }
    
    def compile_pattern(self, grok_pattern: str) -> re.Pattern:
        """编译 Grok 模式"""
        # 替换 Grok 模式为正则表达式
        pattern = grok_pattern
        
        # 匹配 %{PATTERN:name} 或 %{PATTERN:name:type}
        grok_regex = r'%\{(\w+)(?::(\w+))?(?::(\w+))?\}'
        
        def replace_pattern(match):
            pattern_name = match.group(1)
            field_name = match.group(2) or pattern_name.lower()
            regex = self.patterns.get(pattern_name, r'.*?')
            return f'(?P<{field_name}>{regex})'
        
        pattern = re.sub(grok_regex, replace_pattern, pattern)
        return re.compile(pattern)
    
    def parse(self, line: str, grok_pattern: str) -> Optional[Dict]:
        """使用 Grok 模式解析"""
        pattern = self.compile_pattern(grok_pattern)
        match = pattern.match(line)
        if match:
            return match.groupdict()
        return None

# 日志字段提取
class FieldExtractor:
    """日志字段提取器"""
    
    @staticmethod
    def extract_timestamp(log: Dict, field: str = 'timestamp') -> Optional[datetime]:
        """提取时间戳"""
        ts_str = log.get(field)
        if not ts_str:
            return None
        
        # 尝试多种格式
        formats = [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S',
            '%d/%b/%Y:%H:%M:%S %z',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(ts_str, fmt)
            except ValueError:
                continue
        
        return None
    
    @staticmethod
    def extract_level(log: Dict) -> str:
        """提取日志级别"""
        level = log.get('level', log.get('severity', 'INFO'))
        return level.upper()
    
    @staticmethod
    def extract_message(log: Dict) -> str:
        """提取消息"""
        return log.get('message', log.get('msg', log.get('raw', '')))

# 使用示例
if __name__ == "__main__":
    parser = LogParser()
    
    # 解析 Apache 日志
    apache_log = '192.168.1.1 - - [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0"'
    result = parser.parse(apache_log, 'apache_combined')
    print(f"Apache: {result}")
    
    # 解析 JSON 日志
    json_log = '{"timestamp": "2024-01-15T10:30:00Z", "level": "INFO", "message": "User logged in"}'
    result = parser.parse(json_log, 'json')
    print(f"JSON: {result}")
```

#### [场景] 典型应用场景

- 日志标准化
- 日志字段提取
- 多格式日志统一处理

### 3. 日志查询

#### [概念] 概念解释

日志查询从大量日志中检索特定信息。支持全文搜索、字段过滤、时间范围查询等。Elasticsearch 是最常用的日志搜索引擎。

#### [语法] 核心语法 / 命令 / API

```python
from elasticsearch import Elasticsearch
from datetime import datetime, timedelta

class LogQueryEngine:
    """日志查询引擎"""
    
    def __init__(self, hosts: list):
        self.es = Elasticsearch(hosts)
    
    def search_by_keyword(self, keyword: str, index: str = 'logs-*', 
                         size: int = 100) -> list:
        """关键词搜索"""
        query = {
            'query': {
                'match': {
                    'message': keyword
                }
            },
            'size': size,
            'sort': [{'@timestamp': {'order': 'desc'}}]
        }
        
        result = self.es.search(index=index, body=query)
        return [hit['_source'] for hit in result['hits']['hits']]
    
    def search_by_time_range(self, start: datetime, end: datetime,
                            index: str = 'logs-*') -> list:
        """时间范围查询"""
        query = {
            'query': {
                'range': {
                    '@timestamp': {
                        'gte': start.isoformat(),
                        'lte': end.isoformat()
                    }
                }
            }
        }
        
        result = self.es.search(index=index, body=query)
        return [hit['_source'] for hit in result['hits']['hits']]
    
    def search_by_level(self, level: str, index: str = 'logs-*') -> list:
        """按日志级别查询"""
        query = {
            'query': {
                'term': {
                    'level': level.upper()
                }
            }
        }
        
        result = self.es.search(index=index, body=query)
        return [hit['_source'] for hit in result['hits']['hits']]
    
    def aggregate_by_field(self, field: str, index: str = 'logs-*') -> dict:
        """字段聚合统计"""
        query = {
            'size': 0,
            'aggs': {
                'field_stats': {
                    'terms': {
                        'field': field,
                        'size': 10
                    }
                }
            }
        }
        
        result = self.es.search(index=index, body=query)
        return {
            bucket['key']: bucket['doc_count']
            for bucket in result['aggregations']['field_stats']['buckets']
        }
    
    def count_errors(self, time_range: int = 3600, index: str = 'logs-*') -> int:
        """统计错误数量"""
        start = datetime.now() - timedelta(seconds=time_range)
        
        query = {
            'query': {
                'bool': {
                    'must': [
                        {'term': {'level': 'ERROR'}},
                        {'range': {'@timestamp': {'gte': start.isoformat()}}}
                    ]
                }
            }
        }
        
        result = self.es.count(index=index, body=query)
        return result['count']

# Elasticsearch 查询 DSL 示例
"""
# 复合查询
{
  "query": {
    "bool": {
      "must": [
        {"match": {"message": "error"}}
      ],
      "filter": [
        {"range": {"@timestamp": {"gte": "now-1h"}}},
        {"term": {"level": "ERROR"}}
      ],
      "must_not": [
        {"match": {"message": "timeout"}}
      ]
    }
  }
}

# 聚合查询
{
  "size": 0,
  "aggs": {
    "errors_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h"
      },
      "aggs": {
        "error_levels": {
          "terms": {"field": "level"}
        }
      }
    }
  }
}
"""

# 使用示例
if __name__ == "__main__":
    engine = LogQueryEngine(['http://localhost:9200'])
    
    # 搜索关键词
    results = engine.search_by_keyword('error')
    print(f"Found {len(results)} logs with 'error'")
    
    # 统计错误数量
    error_count = engine.count_errors()
    print(f"Errors in last hour: {error_count}")
```

#### [场景] 典型应用场景

- 故障排查
- 日志分析
- 安全审计

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. 日志分析

#### [概念] 概念与解决的问题

日志分析从日志中提取有价值的信息和洞察。包括错误分析、性能分析、用户行为分析等。

#### [语法] 核心用法

```python
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import re

class LogAnalyzer:
    """日志分析器"""
    
    def __init__(self, logs: list):
        self.logs = logs
    
    def analyze_error_distribution(self) -> dict:
        """分析错误分布"""
        errors = [log for log in self.logs if log.get('level') == 'ERROR']
        
        # 按错误类型分组
        error_types = Counter()
        for error in errors:
            msg = error.get('message', '')
            # 提取错误类型
            match = re.search(r'(\w+Error|\w+Exception)', msg)
            if match:
                error_types[match.group(1)] += 1
            else:
                error_types['Unknown'] += 1
        
        return dict(error_types.most_common(10))
    
    def analyze_response_time(self) -> dict:
        """分析响应时间"""
        response_times = []
        
        for log in self.logs:
            if 'response_time' in log or 'duration' in log:
                rt = log.get('response_time', log.get('duration'))
                response_times.append(rt)
        
        if not response_times:
            return {}
        
        response_times.sort()
        
        return {
            'count': len(response_times),
            'min': min(response_times),
            'max': max(response_times),
            'avg': sum(response_times) / len(response_times),
            'p50': response_times[len(response_times) // 2],
            'p95': response_times[int(len(response_times) * 0.95)],
            'p99': response_times[int(len(response_times) * 0.99)]
        }
    
    def analyze_traffic_pattern(self) -> dict:
        """分析流量模式"""
        hourly_counts = defaultdict(int)
        
        for log in self.logs:
            ts = log.get('@timestamp') or log.get('timestamp')
            if ts:
                # 按小时统计
                hour = ts[:13]  # YYYY-MM-DDTHH
                hourly_counts[hour] += 1
        
        return dict(sorted(hourly_counts.items()))
    
    def detect_anomalies(self) -> list:
        """检测异常"""
        anomalies = []
        
        # 检测错误激增
        error_counts = defaultdict(int)
        for log in self.logs:
            if log.get('level') == 'ERROR':
                ts = log.get('@timestamp', '')[:13]
                error_counts[ts] += 1
        
        # 计算平均值
        if error_counts:
            avg_errors = sum(error_counts.values()) / len(error_counts)
            
            for hour, count in error_counts.items():
                if count > avg_errors * 3:  # 超过平均值 3 倍
                    anomalies.append({
                        'type': 'error_spike',
                        'hour': hour,
                        'count': count,
                        'average': avg_errors
                    })
        
        return anomalies
```

#### [关联] 与核心层的关联

日志分析基于日志收集和解析的结果。

### 2. 日志告警

#### [概念] 概念与解决的问题

日志告警在检测到特定模式或异常时发送通知。支持关键词匹配、阈值告警、模式检测等。

#### [语法] 核心用法

```python
import re
from typing import List, Dict, Callable

class LogAlertEngine:
    """日志告警引擎"""
    
    def __init__(self):
        self.rules: List[Dict] = []
    
    def add_rule(self, name: str, condition: Callable, 
                severity: str, message: str):
        """添加告警规则"""
        self.rules.append({
            'name': name,
            'condition': condition,
            'severity': severity,
            'message': message
        })
    
    def check_log(self, log: Dict) -> List[Dict]:
        """检查日志是否触发告警"""
        alerts = []
        
        for rule in self.rules:
            if rule['condition'](log):
                alerts.append({
                    'rule': rule['name'],
                    'severity': rule['severity'],
                    'message': rule['message'],
                    'log': log
                })
        
        return alerts
    
    def process_logs(self, logs: List[Dict]) -> List[Dict]:
        """处理日志流"""
        all_alerts = []
        
        for log in logs:
            alerts = self.check_log(log)
            all_alerts.extend(alerts)
        
        return all_alerts

# 预定义告警规则
def create_error_alert_rule():
    """创建错误告警规则"""
    def condition(log):
        return log.get('level') == 'ERROR'
    
    return {
        'name': 'error_detected',
        'condition': condition,
        'severity': 'high',
        'message': 'Error detected in logs'
    }

def create_security_alert_rule():
    """创建安全告警规则"""
    security_patterns = [
        r'failed login',
        r'authentication failed',
        r'unauthorized access',
        r'sql injection',
        r'xss attack'
    ]
    
    pattern = re.compile('|'.join(security_patterns), re.IGNORECASE)
    
    def condition(log):
        message = log.get('message', '')
        return bool(pattern.search(message))
    
    return {
        'name': 'security_threat',
        'condition': condition,
        'severity': 'critical',
        'message': 'Potential security threat detected'
    }
```

#### [关联] 与核心层的关联

日志告警是日志分析的延伸，实现主动监控。

---

## [扩展] 第三部分：扩展层（60% 按需检索）

| 关键词 | 场景提示 |
|--------|----------|
| ELK Stack | Elasticsearch + Logstash + Kibana |
| EFK Stack | Elasticsearch + Fluentd + Kibana |
| Loki | Grafana 日志系统 |
| Splunk | 企业日志平台 |
| Log Rotation | 日志轮转 |
| Log Retention | 日志保留策略 |
| Log Sampling | 日志采样 |
| Structured Logging | 结构化日志 |
| Correlation ID | 关联 ID 追踪 |
| Log Anonymization | 日志脱敏 |

---

## [实战] 核心实战清单

### 实战任务 1：构建日志管理平台

使用 ELK Stack 构建完整的日志管理平台：

```yaml
# docker-compose.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.10.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: elastic/filebeat:8.10.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/log:/var/log:ro
    depends_on:
      - logstash

volumes:
  es-data:
```
