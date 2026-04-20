# MLOps 基础 三层深度学习教程

## [总览] 技术总览

MLOps（Machine Learning Operations）将机器学习模型从开发到生产的全生命周期管理。核心环节：数据管理、模型训练、模型部署、监控告警。目标：提高 ML 系统的可靠性、可扩展性和可维护性。

本教程采用三层漏斗学习法：**核心层**聚焦实验跟踪、模型版本管理、模型部署三大基石；**重点层**深入 CI/CD 和监控；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 实验跟踪

#### [概念] 概念解释

实验跟踪记录每次训练的超参数、指标、代码版本。常用工具：MLflow、Weights & Biases、Neptune。帮助复现实验、比较模型、选择最优配置。

#### [代码] 代码示例

```python
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import hashlib

class ExperimentTracker:
    """实验跟踪器"""
    
    def __init__(self, tracking_dir: str = "./experiments"):
        self.tracking_dir = tracking_dir
        os.makedirs(tracking_dir, exist_ok=True)
        self.current_experiment = None
    
    def create_experiment(
        self,
        name: str,
        description: str = "",
        tags: List[str] = None
    ) -> str:
        """创建实验"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        experiment_id = f"{name}_{timestamp}"
        
        self.current_experiment = {
            "id": experiment_id,
            "name": name,
            "description": description,
            "tags": tags or [],
            "created_at": datetime.now().isoformat(),
            "parameters": {},
            "metrics": {},
            "artifacts": [],
            "status": "running"
        }
        
        # 创建实验目录
        exp_dir = os.path.join(self.tracking_dir, experiment_id)
        os.makedirs(exp_dir, exist_ok=True)
        
        return experiment_id
    
    def log_params(self, params: Dict[str, Any]) -> None:
        """记录参数"""
        if self.current_experiment:
            self.current_experiment["parameters"].update(params)
    
    def log_metric(self, key: str, value: float, step: int = None) -> None:
        """记录指标"""
        if self.current_experiment:
            if key not in self.current_experiment["metrics"]:
                self.current_experiment["metrics"][key] = []
            
            self.current_experiment["metrics"][key].append({
                "value": value,
                "step": step,
                "timestamp": datetime.now().isoformat()
            })
    
    def log_artifact(self, artifact_path: str, artifact_type: str = "model") -> None:
        """记录产物"""
        if self.current_experiment:
            self.current_experiment["artifacts"].append({
                "path": artifact_path,
                "type": artifact_type,
                "timestamp": datetime.now().isoformat()
            })
    
    def end_experiment(self, status: str = "completed") -> None:
        """结束实验"""
        if self.current_experiment:
            self.current_experiment["status"] = status
            self.current_experiment["ended_at"] = datetime.now().isoformat()
            
            # 保存实验记录
            exp_file = os.path.join(
                self.tracking_dir,
                self.current_experiment["id"],
                "experiment.json"
            )
            with open(exp_file, 'w') as f:
                json.dump(self.current_experiment, f, indent=2)
            
            self.current_experiment = None
    
    def list_experiments(self) -> List[Dict[str, Any]]:
        """列出所有实验"""
        experiments = []
        
        for exp_id in os.listdir(self.tracking_dir):
            exp_file = os.path.join(self.tracking_dir, exp_id, "experiment.json")
            if os.path.exists(exp_file):
                with open(exp_file, 'r') as f:
                    experiments.append(json.load(f))
        
        return sorted(experiments, key=lambda x: x["created_at"], reverse=True)
    
    def get_best_experiment(self, metric: str, mode: str = "max") -> Optional[Dict]:
        """获取最佳实验"""
        experiments = self.list_experiments()
        
        if not experiments:
            return None
        
        best_exp = None
        best_value = float('-inf') if mode == "max" else float('inf')
        
        for exp in experiments:
            if metric in exp["metrics"] and exp["metrics"][metric]:
                last_value = exp["metrics"][metric][-1]["value"]
                
                if (mode == "max" and last_value > best_value) or \
                   (mode == "min" and last_value < best_value):
                    best_value = last_value
                    best_exp = exp
        
        return best_exp

# 使用示例
if __name__ == "__main__":
    tracker = ExperimentTracker("./ml_experiments")
    
    # 创建实验
    exp_id = tracker.create_experiment(
        name="iris_classification",
        description="Iris 数据集分类实验",
        tags=["classification", "sklearn"]
    )
    
    # 记录参数
    tracker.log_params({
        "model": "RandomForest",
        "n_estimators": 100,
        "max_depth": 5,
        "random_state": 42
    })
    
    # 模拟训练过程
    for epoch in range(10):
        accuracy = 0.8 + 0.02 * epoch + 0.01 * (epoch % 3)
        tracker.log_metric("accuracy", accuracy, step=epoch)
    
    # 记录产物
    tracker.log_artifact("models/rf_model.pkl", "model")
    
    # 结束实验
    tracker.end_experiment()
    
    print(f"实验 ID: {exp_id}")
    
    # 查看最佳实验
    best = tracker.get_best_experiment("accuracy", mode="max")
    if best:
        print(f"最佳实验: {best['id']}")
        print(f"最佳准确率: {best['metrics']['accuracy'][-1]['value']:.4f}")
```

### 2. 模型版本管理

#### [概念] 概念解释

模型版本管理跟踪模型的变化历史，支持回滚和比较。核心功能：版本号、元数据、模型文件存储。常用工具：MLflow Model Registry、DVC。

#### [代码] 代码示例

```python
import os
import json
import shutil
from datetime import datetime
from typing import Dict, Any, List, Optional
import hashlib

class ModelRegistry:
    """模型注册中心"""
    
    def __init__(self, registry_dir: str = "./model_registry"):
        self.registry_dir = registry_dir
        os.makedirs(registry_dir, exist_ok=True)
        self.models_index = self._load_index()
    
    def _load_index(self) -> Dict[str, Any]:
        """加载模型索引"""
        index_file = os.path.join(self.registry_dir, "models_index.json")
        if os.path.exists(index_file):
            with open(index_file, 'r') as f:
                return json.load(f)
        return {"models": {}}
    
    def _save_index(self) -> None:
        """保存模型索引"""
        index_file = os.path.join(self.registry_dir, "models_index.json")
        with open(index_file, 'w') as f:
            json.dump(self.models_index, f, indent=2)
    
    def register_model(
        self,
        name: str,
        model_path: str,
        version: str = None,
        description: str = "",
        metrics: Dict[str, float] = None,
        tags: List[str] = None
    ) -> str:
        """注册模型"""
        # 生成版本号
        if version is None:
            existing_versions = self.models_index["models"].get(name, {}).get("versions", [])
            version_nums = [int(v["version"].split(".")[0]) for v in existing_versions]
            next_version = max(version_nums, default=0) + 1
            version = f"{next_version}.0"
        
        # 计算模型文件哈希
        model_hash = self._compute_hash(model_path)
        
        # 创建版本记录
        version_info = {
            "version": version,
            "description": description,
            "metrics": metrics or {},
            "tags": tags or [],
            "model_hash": model_hash,
            "registered_at": datetime.now().isoformat(),
            "stage": "None"
        }
        
        # 复制模型文件
        model_dir = os.path.join(self.registry_dir, name, version)
        os.makedirs(model_dir, exist_ok=True)
        shutil.copy(model_path, os.path.join(model_dir, "model.pkl"))
        
        # 更新索引
        if name not in self.models_index["models"]:
            self.models_index["models"][name] = {
                "name": name,
                "created_at": datetime.now().isoformat(),
                "versions": []
            }
        
        self.models_index["models"][name]["versions"].append(version_info)
        self._save_index()
        
        return version
    
    def _compute_hash(self, file_path: str) -> str:
        """计算文件哈希"""
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    def get_model(self, name: str, version: str = None) -> Optional[str]:
        """获取模型路径"""
        if name not in self.models_index["models"]:
            return None
        
        if version is None:
            # 获取最新版本
            versions = self.models_index["models"][name]["versions"]
            if not versions:
                return None
            version = versions[-1]["version"]
        
        model_path = os.path.join(self.registry_dir, name, version, "model.pkl")
        return model_path if os.path.exists(model_path) else None
    
    def transition_stage(self, name: str, version: str, stage: str) -> bool:
        """转换模型阶段"""
        if name not in self.models_index["models"]:
            return False
        
        for v in self.models_index["models"][name]["versions"]:
            if v["version"] == version:
                v["stage"] = stage
                self._save_index()
                return True
        
        return False
    
    def list_models(self) -> List[Dict[str, Any]]:
        """列出所有模型"""
        return list(self.models_index["models"].values())
    
    def get_production_model(self, name: str) -> Optional[Dict]:
        """获取生产环境模型"""
        if name not in self.models_index["models"]:
            return None
        
        for v in self.models_index["models"][name]["versions"]:
            if v["stage"] == "Production":
                return v
        
        return None

# 使用示例
if __name__ == "__main__":
    registry = ModelRegistry("./ml_registry")
    
    # 模拟模型文件
    os.makedirs("./temp_models", exist_ok=True)
    with open("./temp_models/model_v1.pkl", 'w') as f:
        f.write("model_data_v1")
    
    # 注册模型
    version = registry.register_model(
        name="iris_classifier",
        model_path="./temp_models/model_v1.pkl",
        description="RandomForest 分类器",
        metrics={"accuracy": 0.95, "f1": 0.94},
        tags=["production", "sklearn"]
    )
    
    print(f"注册版本: {version}")
    
    # 转换为生产环境
    registry.transition_stage("iris_classifier", version, "Production")
    
    # 获取生产模型
    prod_model = registry.get_production_model("iris_classifier")
    if prod_model:
        print(f"生产模型版本: {prod_model['version']}")
        print(f"准确率: {prod_model['metrics']['accuracy']}")
```

### 3. 模型部署

#### [概念] 概念解释

模型部署将训练好的模型暴露为服务。常见方式：REST API、批量推理、边缘部署。关键考虑：延迟、吞吐量、可扩展性、监控。

#### [代码] 代码示例

```python
import json
import pickle
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import threading
import queue

@dataclass
class PredictionRequest:
    """预测请求"""
    request_id: str
    input_data: Dict[str, Any]
    timestamp: datetime

@dataclass
class PredictionResponse:
    """预测响应"""
    request_id: str
    prediction: Any
    latency_ms: float
    timestamp: datetime

class ModelServer:
    """模型服务"""
    
    def __init__(self, model_path: str):
        self.model = self._load_model(model_path)
        self.request_count = 0
        self.total_latency = 0.0
        self.lock = threading.Lock()
    
    def _load_model(self, model_path: str):
        """加载模型"""
        # 模拟加载模型
        return {"type": "mock_model", "path": model_path}
    
    def predict(self, input_data: Dict[str, Any]) -> Any:
        """预测"""
        start_time = time.time()
        
        # 模拟推理
        time.sleep(0.01)  # 模拟推理延迟
        
        # 模拟预测结果
        prediction = {
            "class": "setosa",
            "probabilities": {"setosa": 0.9, "versicolor": 0.08, "virginica": 0.02}
        }
        
        latency = (time.time() - start_time) * 1000
        
        with self.lock:
            self.request_count += 1
            self.total_latency += latency
        
        return prediction, latency
    
    def get_metrics(self) -> Dict[str, Any]:
        """获取指标"""
        with self.lock:
            avg_latency = self.total_latency / self.request_count if self.request_count > 0 else 0
            return {
                "request_count": self.request_count,
                "total_latency_ms": self.total_latency,
                "avg_latency_ms": avg_latency
            }

class BatchPredictor:
    """批量预测器"""
    
    def __init__(self, model_server: ModelServer, batch_size: int = 32):
        self.model_server = model_server
        self.batch_size = batch_size
        self.request_queue = queue.Queue()
        self.results: Dict[str, Any] = {}
    
    def submit(self, request_id: str, input_data: Dict[str, Any]) -> None:
        """提交预测请求"""
        self.request_queue.put((request_id, input_data))
    
    def process_batch(self) -> List[PredictionResponse]:
        """处理批量请求"""
        batch = []
        while len(batch) < self.batch_size and not self.request_queue.empty():
            batch.append(self.request_queue.get())
        
        if not batch:
            return []
        
        responses = []
        for request_id, input_data in batch:
            prediction, latency = self.model_server.predict(input_data)
            
            response = PredictionResponse(
                request_id=request_id,
                prediction=prediction,
                latency_ms=latency,
                timestamp=datetime.now()
            )
            responses.append(response)
            self.results[request_id] = response
        
        return responses
    
    def get_result(self, request_id: str) -> Optional[PredictionResponse]:
        """获取结果"""
        return self.results.get(request_id)

class ModelDeployment:
    """模型部署管理"""
    
    def __init__(self, model_registry):
        self.registry = model_registry
        self.deployments: Dict[str, ModelServer] = {}
    
    def deploy(
        self,
        model_name: str,
        version: str = None,
        deployment_name: str = None
    ) -> bool:
        """部署模型"""
        model_path = self.registry.get_model(model_name, version)
        
        if model_path is None:
            return False
        
        deployment_name = deployment_name or f"{model_name}_deployment"
        self.deployments[deployment_name] = ModelServer(model_path)
        
        return True
    
    def predict(
        self,
        deployment_name: str,
        input_data: Dict[str, Any]
    ) -> Optional[PredictionResponse]:
        """预测"""
        if deployment_name not in self.deployments:
            return None
        
        server = self.deployments[deployment_name]
        prediction, latency = server.predict(input_data)
        
        return PredictionResponse(
            request_id=f"req_{int(time.time() * 1000)}",
            prediction=prediction,
            latency_ms=latency,
            timestamp=datetime.now()
        )
    
    def get_deployment_metrics(self, deployment_name: str) -> Optional[Dict]:
        """获取部署指标"""
        if deployment_name not in self.deployments:
            return None
        
        return self.deployments[deployment_name].get_metrics()

# 使用示例
if __name__ == "__main__":
    # 创建模拟模型文件
    os.makedirs("./temp_models", exist_ok=True)
    with open("./temp_models/model.pkl", 'w') as f:
        f.write("model_data")
    
    # 初始化
    registry = ModelRegistry("./ml_registry")
    registry.register_model(
        name="iris_classifier",
        model_path="./temp_models/model.pkl",
        metrics={"accuracy": 0.95}
    )
    
    deployment = ModelDeployment(registry)
    
    # 部署模型
    deployment.deploy("iris_classifier")
    
    # 预测
    response = deployment.predict("iris_classifier_deployment", {
        "sepal_length": 5.1,
        "sepal_width": 3.5,
        "petal_length": 1.4,
        "petal_width": 0.2
    })
    
    if response:
        print(f"预测结果: {response.prediction}")
        print(f"延迟: {response.latency_ms:.2f}ms")
    
    # 获取指标
    metrics = deployment.get_deployment_metrics("iris_classifier_deployment")
    print(f"服务指标: {metrics}")
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. ML CI/CD

#### [概念] 概念解释

ML CI/CD 自动化模型训练和部署流程。包括：数据验证、模型训练、模型评估、模型部署。常用工具：GitHub Actions、Jenkins、Kubeflow Pipelines。

#### [代码] 代码示例

```python
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
from enum import Enum

class PipelineStage(Enum):
    DATA_VALIDATION = "data_validation"
    DATA_PREPROCESSING = "data_preprocessing"
    MODEL_TRAINING = "model_training"
    MODEL_EVALUATION = "model_evaluation"
    MODEL_DEPLOYMENT = "model_deployment"

@dataclass
class PipelineResult:
    stage: PipelineStage
    success: bool
    metrics: Dict[str, Any]
    error: str = None

class MLPipeline:
    """ML 流水线"""
    
    def __init__(self, name: str):
        self.name = name
        self.stages: List[Callable] = []
        self.results: List[PipelineResult] = []
    
    def add_stage(self, stage_func: Callable) -> 'MLPipeline':
        """添加阶段"""
        self.stages.append(stage_func)
        return self
    
    def run(self) -> bool:
        """运行流水线"""
        self.results = []
        
        for stage_func in self.stages:
            try:
                result = stage_func()
                self.results.append(result)
                
                if not result.success:
                    print(f"Pipeline failed at stage: {result.stage.value}")
                    return False
                
            except Exception as e:
                self.results.append(PipelineResult(
                    stage=stage_func.__name__,
                    success=False,
                    metrics={},
                    error=str(e)
                ))
                return False
        
        return True

# 预定义阶段函数
def validate_data() -> PipelineResult:
    """数据验证"""
    return PipelineResult(
        stage=PipelineStage.DATA_VALIDATION,
        success=True,
        metrics={"rows": 1000, "columns": 4, "missing_rate": 0.01}
    )

def preprocess_data() -> PipelineResult:
    """数据预处理"""
    return PipelineResult(
        stage=PipelineStage.DATA_PREPROCESSING,
        success=True,
        metrics={"train_size": 800, "test_size": 200}
    )

def train_model() -> PipelineResult:
    """模型训练"""
    return PipelineResult(
        stage=PipelineStage.MODEL_TRAINING,
        success=True,
        metrics={"epochs": 100, "final_loss": 0.05}
    )

def evaluate_model() -> PipelineResult:
    """模型评估"""
    return PipelineResult(
        stage=PipelineStage.MODEL_EVALUATION,
        success=True,
        metrics={"accuracy": 0.95, "f1": 0.94, "precision": 0.96}
    )

def deploy_model() -> PipelineResult:
    """模型部署"""
    return PipelineResult(
        stage=PipelineStage.MODEL_DEPLOYMENT,
        success=True,
        metrics={"deployment_time": "2024-01-15T10:00:00", "endpoint": "/predict"}
    )

# 使用示例
if __name__ == "__main__":
    pipeline = MLPipeline("iris_training_pipeline")
    
    pipeline.add_stage(validate_data)
    pipeline.add_stage(preprocess_data)
    pipeline.add_stage(train_model)
    pipeline.add_stage(evaluate_model)
    pipeline.add_stage(deploy_model)
    
    success = pipeline.run()
    
    print(f"Pipeline {'succeeded' if success else 'failed'}")
    for result in pipeline.results:
        print(f"  {result.stage.value}: {'OK' if result.success else 'FAILED'}")
        if result.metrics:
            print(f"    Metrics: {result.metrics}")
```

---

## [扩展] 第三部分：扩展层（60% 广度内容）

| 关键词 | 场景提示 |
|--------|----------|
| MLflow | ML 生命周期管理 |
| Kubeflow | Kubernetes ML 平台 |
| Airflow | 工作流调度 |
| Feature Store | 特征存储 |
| Model Monitoring | 模型监控 |
| Data Drift | 数据漂移检测 |
| A/B Testing | A/B 测试 |
| Canary Deployment | 金丝雀部署 |
| Model Compression | 模型压缩 |
| Edge Deployment | 边缘部署 |

---

## [实战] 核心实战清单

1. 搭建一个实验跟踪系统，记录模型训练过程
2. 实现模型版本管理，支持模型回滚
3. 构建一个简单的模型部署服务

## [避坑] 三层避坑提醒

- **核心层误区**：实验记录不完整，无法复现结果
- **重点层误区**：CI/CD 流程过于复杂，维护成本高
- **扩展层建议**：使用 MLflow 等成熟工具，避免重复造轮子
