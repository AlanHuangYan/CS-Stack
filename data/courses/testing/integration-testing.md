# 集成测试 三层深度学习教程

## [总览] 技术总览

集成测试是软件测试的重要环节，验证多个模块或组件协同工作时的正确性。它介于单元测试和端到端测试之间，专注于模块间的接口、数据流和交互行为。

本教程采用三层漏斗学习法：**核心层**聚焦测试策略、Mock/Stub 技术、数据库集成测试三大基石；**重点层**深入 API 集成测试和测试容器化；**扩展层**仅作关键词索引。

---

## [核心] 第一部分：核心层（20% 基石内容）

### 1. 集成测试策略

#### [概念] 概念解释

集成测试策略定义了如何组合和测试多个模块。主要策略包括：大爆炸式（一次性集成所有模块）、自顶向下（从主模块开始逐层集成）、自底向上（从底层模块开始集成）、三明治式（结合自顶向下和自底向上）。

#### [代码] 代码示例

```python
# 集成测试示例 - 用户服务与订单服务集成
import pytest
from user_service import UserService
from order_service import OrderService
from database import Database

class TestUserOrderIntegration:
    
    @pytest.fixture
    def setup_services(self):
        db = Database(":memory:")
        user_service = UserService(db)
        order_service = OrderService(db, user_service)
        yield user_service, order_service
        db.close()
    
    def test_create_order_for_existing_user(self, setup_services):
        user_service, order_service = setup_services
        
        user = user_service.create_user(
            username="testuser",
            email="test@example.com"
        )
        
        order = order_service.create_order(
            user_id=user.id,
            product="Python Book",
            quantity=2
        )
        
        assert order.user_id == user.id
        assert order.product == "Python Book"
        assert order.total_price == 99.8
    
    def test_create_order_for_nonexistent_user(self, setup_services):
        user_service, order_service = setup_services
        
        with pytest.raises(ValueError, match="User not found"):
            order_service.create_order(
                user_id=999,
                product="Python Book",
                quantity=1
            )
```

### 2. Mock 与 Stub 技术

#### [概念] 概念解释

Mock 和 Stub 是隔离测试的技术。Stub 提供预设的响应，用于替代真实依赖；Mock 不仅提供响应，还能验证调用行为。它们使集成测试更快速、可控、独立。

#### [代码] 代码示例

```python
# 使用 unittest.mock 进行集成测试
from unittest.mock import Mock, patch, MagicMock
import pytest

class PaymentGateway:
    def process_payment(self, amount, card_info):
        pass

class NotificationService:
    def send_email(self, to, subject, body):
        pass

class OrderProcessor:
    def __init__(self, payment_gateway, notification_service):
        self.payment_gateway = payment_gateway
        self.notification_service = notification_service
    
    def process_order(self, order):
        payment_result = self.payment_gateway.process_payment(
            order.total, order.card_info
        )
        if payment_result.success:
            self.notification_service.send_email(
                order.user_email,
                "Order Confirmed",
                f"Your order #{order.id} has been processed."
            )
        return payment_result

class TestOrderProcessorIntegration:
    
    def test_process_order_success(self):
        mock_payment = Mock()
        mock_payment.process_payment.return_value = Mock(success=True)
        
        mock_notification = Mock()
        
        processor = OrderProcessor(mock_payment, mock_notification)
        
        order = Mock(
            id=1,
            total=99.99,
            card_info={"number": "4111111111111111"},
            user_email="user@example.com"
        )
        
        result = processor.process_order(order)
        
        assert result.success is True
        mock_payment.process_payment.assert_called_once_with(
            99.99, {"number": "4111111111111111"}
        )
        mock_notification.send_email.assert_called_once()
    
    def test_process_order_payment_failed(self):
        mock_payment = Mock()
        mock_payment.process_payment.return_value = Mock(success=False)
        
        mock_notification = Mock()
        
        processor = OrderProcessor(mock_payment, mock_notification)
        
        order = Mock(
            id=1,
            total=99.99,
            card_info={"number": "4111111111111111"},
            user_email="user@example.com"
        )
        
        result = processor.process_order(order)
        
        assert result.success is False
        mock_notification.send_email.assert_not_called()
```

### 3. 数据库集成测试

#### [概念] 概念解释

数据库集成测试验证应用与数据库的交互是否正确。关键点包括：使用测试数据库、事务回滚清理、测试数据隔离、连接池管理。

#### [代码] 代码示例

```python
# 数据库集成测试
import pytest
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(100))

class UserRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, username: str, email: str) -> User:
        user = User(username=username, email=email)
        self.session.add(user)
        self.session.commit()
        return user
    
    def find_by_username(self, username: str) -> User:
        return self.session.query(User).filter_by(
            username=username
        ).first()

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

class TestUserRepositoryIntegration:
    
    def test_create_user(self, db_session):
        repo = UserRepository(db_session)
        
        user = repo.create("testuser", "test@example.com")
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
    
    def test_find_by_username(self, db_session):
        repo = UserRepository(db_session)
        repo.create("testuser", "test@example.com")
        
        found = repo.find_by_username("testuser")
        
        assert found is not None
        assert found.email == "test@example.com"
    
    def test_find_nonexistent_user(self, db_session):
        repo = UserRepository(db_session)
        
        found = repo.find_by_username("nonexistent")
        
        assert found is None
```

---

## [重点] 第二部分：重点层（20% 进阶内容）

### 1. API 集成测试

#### [概念] 概念解释

API 集成测试验证 API 端点与后端服务的集成。使用测试客户端模拟 HTTP 请求，验证响应状态码、数据格式、错误处理。

#### [代码] 代码示例

```python
# FastAPI 集成测试
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
import pytest

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str

class User(BaseModel):
    id: int
    username: str
    email: str

users_db = {}

@app.post("/users", response_model=User)
def create_user(user: UserCreate):
    user_id = len(users_db) + 1
    new_user = User(id=user_id, **user.dict())
    users_db[user_id] = new_user
    return new_user

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

class TestAPIIntegration:
    
    @pytest.fixture
    def client(self):
        users_db.clear()
        return TestClient(app)
    
    def test_create_user(self, client):
        response = client.post(
            "/users",
            json={"username": "testuser", "email": "test@example.com"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "id" in data
    
    def test_get_user(self, client):
        create_response = client.post(
            "/users",
            json={"username": "testuser", "email": "test@example.com"}
        )
        user_id = create_response.json()["id"]
        
        response = client.get(f"/users/{user_id}")
        
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"
    
    def test_get_nonexistent_user(self, client):
        response = client.get("/users/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
```

### 2. 测试容器化

#### [概念] 概念解释

使用 Docker 容器进行集成测试，确保测试环境与生产环境一致。Testcontainers 库提供可编程方式管理测试容器。

#### [代码] 代码示例

```python
# 使用 testcontainers 进行数据库集成测试
import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy import create_engine, text

class TestWithPostgresContainer:
    
    @pytest.fixture(scope="class")
    def postgres_container(self):
        with PostgresContainer("postgres:15") as postgres:
            yield postgres
    
    @pytest.fixture
    def db_engine(self, postgres_container):
        engine = create_engine(postgres_container.get_connection_url())
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE,
                    email VARCHAR(100)
                )
            """))
            conn.commit()
        yield engine
        engine.dispose()
    
    def test_insert_and_query(self, db_engine):
        with db_engine.connect() as conn:
            conn.execute(text(
                "INSERT INTO users (username, email) VALUES (:username, :email)"
            ), {"username": "testuser", "email": "test@example.com"})
            conn.commit()
            
            result = conn.execute(text(
                "SELECT * FROM users WHERE username = :username"
            ), {"username": "testuser"})
            user = result.fetchone()
            
            assert user.username == "testuser"
            assert user.email == "test@example.com"
```

### 3. 消息队列集成测试

#### [概念] 概念解释

消息队列集成测试验证生产者和消费者之间的消息传递。需要处理异步消息、超时、消息顺序等问题。

#### [代码] 代码示例

```python
# 消息队列集成测试
import pytest
import json
from queue import Queue
from threading import Thread
import time

class MessageQueue:
    def __init__(self):
        self._queue = Queue()
    
    def publish(self, topic: str, message: dict):
        self._queue.put({"topic": topic, "message": message})
    
    def subscribe(self, topic: str, callback):
        while True:
            item = self._queue.get()
            if item["topic"] == topic:
                callback(item["message"])

class OrderProducer:
    def __init__(self, queue: MessageQueue):
        self.queue = queue
    
    def send_order(self, order: dict):
        self.queue.publish("orders", order)

class OrderConsumer:
    def __init__(self, queue: MessageQueue):
        self.queue = queue
        self.processed_orders = []
    
    def process_order(self, message: dict):
        self.processed_orders.append(message)

class TestMessageQueueIntegration:
    
    def test_order_processing(self):
        mq = MessageQueue()
        producer = OrderProducer(mq)
        consumer = OrderConsumer(mq)
        
        def run_consumer():
            mq.subscribe("orders", consumer.process_order)
        
        consumer_thread = Thread(target=run_consumer, daemon=True)
        consumer_thread.start()
        
        producer.send_order({"order_id": 1, "product": "Book"})
        producer.send_order({"order_id": 2, "product": "Pen"})
        
        time.sleep(0.5)
        
        assert len(consumer.processed_orders) >= 2
```

---

## [扩展] 第三部分：扩展层（60% 广度索引）

| 关键词 | 场景提示 |
|--------|----------|
| Contract Testing | 契约测试，验证服务间接口契约 |
| Service Virtualization | 服务虚拟化，模拟依赖服务 |
| Test Data Management | 测试数据管理，数据工厂模式 |
| Integration Test Patterns | 集成测试模式，管道、适配器模式 |
| API Mocking | API 模拟，WireMock、MockServer |
| Database Fixtures | 数据库夹具，测试数据准备 |
| Test Isolation | 测试隔离，避免测试间干扰 |
| CI Integration | CI 集成，自动化测试流水线 |
| Performance Integration | 性能集成测试，负载场景验证 |
| Chaos Testing | 混沌测试，故障注入验证 |
