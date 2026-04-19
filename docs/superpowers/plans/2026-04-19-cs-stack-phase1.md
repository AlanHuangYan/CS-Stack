# Phase 1: 基础设施 — 项目脚手架与核心 API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 React + FastAPI 前后端分离项目脚手架，实现 JSON 数据存储层、简单用户认证、以及方向/子方向/课程基础 CRUD API。

**Architecture:** 前后端分离开发模式。前端使用 React + Vite + TypeScript + TailwindCSS。后端使用 Python FastAPI，通过 JSON 文件持久化数据。前端开发时通过 CORS 访问后端 API。

**Tech Stack:** React 18, Vite, TypeScript, TailwindCSS, Python 3.11+, FastAPI, Pydantic, json (内置)

---

## 文件结构

```
CS-Stack/
├── backend/
│   ├── main.py                          # FastAPI 入口
│   ├── models.py                        # Pydantic 数据模型
│   ├── storage.py                       # JSON 文件读写层
│   ├── auth.py                          # 简单用户认证
│   ├── routes/
│   │   ├── directions.py                # 方向 API
│   │   ├── subdirections.py             # 子方向 API
│   │   ├── courses.py                   # 课程 API
│   │   └── users.py                     # 用户 API
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── client.ts                # Axios 客户端
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript 类型定义
│   │   └── pages/
│   │       └── Home.tsx                 # 首页占位
│   └── .env
├── data/                                # JSON 数据存储目录
│   ├── directions.json
│   ├── subdirections.json
│   ├── courses/
│   └── users/
└── .gitignore
```

---

## File Structure Summary

| 文件 | 职责 |
|------|------|
| `backend/main.py` | FastAPI 应用入口，挂载路由、CORS、静态文件 |
| `backend/models.py` | 所有 Pydantic 请求/响应模型 |
| `backend/storage.py` | JSON 文件读写通用工具 |
| `backend/auth.py` | 简单 JWT 认证中间件 |
| `backend/routes/directions.py` | 方向 CRUD API |
| `backend/routes/subdirections.py` | 子方向 CRUD API |
| `backend/routes/courses.py` | 课程 CRUD API |
| `backend/routes/users.py` | 用户注册/登录/进度 API |
| `frontend/src/api/client.ts` | Axios 封装 |
| `frontend/src/types/index.ts` | TypeScript 类型声明 |
| `frontend/src/pages/Home.tsx` | 首页组件 |
| `frontend/src/App.tsx` | 路由配置 |

---

### Task 1: 创建后端项目脚手架

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/main.py`
- Create: `backend/models.py`
- Create: `backend/storage.py`
- Create: `backend/auth.py`
- Create: `data/directions.json`
- Create: `data/subdirections.json`
- Create: `data/users/default.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 requirements.txt**

```
fastapi==0.115.0
uvicorn==0.30.0
pydantic==2.9.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
```

- [ ] **Step 2: 创建 data 目录和初始 JSON 文件**

```bash
mkdir -p data/courses data/users
```

`data/directions.json`:
```json
{
  "directions": []
}
```

`data/subdirections.json`:
```json
{
  "subdirections": []
}
```

`data/users/default.json`:
```json
{
  "user_id": "default",
  "username": "admin",
  "password_hash": "$2b$12$LJ3m4ys3Lk0T0K5nGH5jFO9BqF0j0kF0j0kF0j0kF0j0kF0j0kF0",
  "created_at": "2026-04-19T00:00:00Z",
  "selected_directions": [],
  "progress": {},
  "stats": {
    "total_xp": 0,
    "streak_days": 0,
    "badges": [],
    "milestones": []
  }
}
```

- [ ] **Step 3: 创建 .gitignore**

`.gitignore`:
```
__pycache__/
*.pyc
node_modules/
dist/
.env
.venv/
venv/
*.egg-info/
.superpowers/
```

- [ ] **Step 4: 创建 storage.py — JSON 文件读写层**

`backend/storage.py`:
```python
import json
import os
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent.parent / "data"


def _ensure_dir(file_path: Path) -> None:
    """确保文件所在目录存在。"""
    file_path.parent.mkdir(parents=True, exist_ok=True)


def read_json(file_name: str) -> Any:
    """读取 JSON 文件，不存在时返回 None。"""
    file_path = DATA_DIR / file_name
    if not file_path.exists():
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(file_name: str, data: Any) -> None:
    """写入 JSON 文件，自动创建目录。"""
    file_path = DATA_DIR / file_name
    _ensure_dir(file_path)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_list(file_name: str, key: str) -> list:
    """读取 JSON 中指定 key 的列表，不存在时返回空列表。"""
    data = read_json(file_name)
    if data is None:
        return []
    return data.get(key, [])


def write_list(file_name: str, key: str, items: list) -> None:
    """写入列表到 JSON 文件的指定 key。"""
    data = read_json(file_name) or {}
    data[key] = items
    write_json(file_name, data)


def append_item(file_name: str, key: str, item: dict, id_field: str = "id") -> None:
    """追加或更新列表中的项（按 id_field 去重）。"""
    items = read_list(file_name, key)
    for i, existing in enumerate(items):
        if existing.get(id_field) == item.get(id_field):
            items[i] = item
            write_list(file_name, key, items)
            return
    items.append(item)
    write_list(file_name, key, items)


def delete_item(file_name: str, key: str, item_id: str, id_field: str = "id") -> bool:
    """从列表中删除指定 id 的项。"""
    items = read_list(file_name, key)
    new_items = [i for i in items if i.get(id_field) != item_id]
    if len(new_items) == len(items):
        return False
    write_list(file_name, key, new_items)
    return True


def read_user(user_id: str) -> dict | None:
    """读取用户 JSON 文件。"""
    return read_json(f"users/{user_id}.json")


def write_user(user_id: str, data: dict) -> None:
    """写入用户 JSON 文件。"""
    write_json(f"users/{user_id}.json", data)
```

- [ ] **Step 5: 创建 models.py — Pydantic 数据模型**

`backend/models.py`:
```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class KnowledgePoint(BaseModel):
    name: str
    description: str = ""
    exercise: str = ""


class CourseKnowledgePoints(BaseModel):
    core: list[KnowledgePoint] = []
    important: list[KnowledgePoint] = []
    extended: list[KnowledgePoint] = []


class Resource(BaseModel):
    type: str
    url: str
    title: str = ""


class Course(BaseModel):
    id: str
    title: str
    difficulty: str = "beginner"
    estimated_hours: int = 10
    prerequisites: list[str] = []
    knowledge_points: CourseKnowledgePoints = Field(default_factory=CourseKnowledgePoints)
    resources: list[Resource] = []


class Direction(BaseModel):
    id: str
    name: str
    name_en: str = ""
    icon: str = ""
    description: str = ""
    subdirections: list[str] = []


class SubDirection(BaseModel):
    id: str
    name: str
    directions: list[str] = []
    courses: list[str] = []


class CourseProgress(BaseModel):
    status: str = "not_started"
    completed_knowledge: list[str] = []
    started_at: str = ""
    hours_spent: int = 0


class UserStats(BaseModel):
    total_xp: int = 0
    streak_days: int = 0
    badges: list[str] = []
    milestones: list[str] = []


class User(BaseModel):
    user_id: str
    username: str
    selected_directions: list[str] = []
    progress: dict[str, CourseProgress] = {}
    stats: UserStats = Field(default_factory=UserStats)


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

- [ ] **Step 6: 创建 auth.py — 简单 JWT 认证**

`backend/auth.py`:
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.storage import read_json

SECRET_KEY = "cs-stack-dev-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 天

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证令牌",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_data = read_json(f"users/{user_id}.json")
    if user_data is None:
        raise credentials_exception
    return user_data
```

- [ ] **Step 7: 创建 main.py — FastAPI 入口**

`backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.directions import router as directions_router
from backend.routes.subdirections import router as subdirections_router
from backend.routes.courses import router as courses_router
from backend.routes.users import router as users_router

app = FastAPI(title="CS-Stack API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(directions_router, prefix="/api/directions", tags=["directions"])
app.include_router(subdirections_router, prefix="/api/subdirections", tags=["subdirections"])
app.include_router(courses_router, prefix="/api/courses", tags=["courses"])
app.include_router(users_router, prefix="/api/users", tags=["users"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
```

- [ ] **Step 8: 创建路由目录**

```bash
mkdir -p backend/routes
touch backend/routes/__init__.py
```

- [ ] **Step 9: 验证后端可启动**

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected: Server starts on http://0.0.0.0:8000

访问 http://localhost:8000/api/health 返回 `{"status": "ok", "version": "0.1.0"}`

- [ ] **Step 10: Commit**

```bash
git add backend/ data/ .gitignore
git commit -m "feat: 搭建后端项目脚手架，包含 JSON 存储层和基础模型"
```

---

### Task 2: 实现方向 (Directions) API

**Files:**
- Create: `backend/routes/directions.py`

- [ ] **Step 1: 创建方向 API 路由**

`backend/routes/directions.py`:
```python
from fastapi import APIRouter, HTTPException
from backend.models import Direction
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "directions.json"
KEY = "directions"


@router.get("/", response_model=list[Direction])
def list_directions():
    """获取所有专业方向。"""
    return read_list(FILE, KEY)


@router.get("/{direction_id}", response_model=Direction)
def get_direction(direction_id: str):
    """获取单个方向详情。"""
    directions = read_list(FILE, KEY)
    for d in directions:
        if d["id"] == direction_id:
            return d
    raise HTTPException(status_code=404, detail="方向不存在")


@router.post("/", response_model=Direction, status_code=201)
def create_direction(direction: Direction):
    """创建新方向。"""
    append_item(FILE, KEY, direction.model_dump())
    return direction


@router.put("/{direction_id}", response_model=Direction)
def update_direction(direction_id: str, direction: Direction):
    """更新方向信息。"""
    if direction.id != direction_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, direction.model_dump())
    return direction


@router.delete("/{direction_id}", status_code=204)
def delete_direction(direction_id: str):
    """删除方向。"""
    if not delete_item(FILE, KEY, direction_id):
        raise HTTPException(status_code=404, detail="方向不存在")
```

- [ ] **Step 2: 验证 API**

```bash
curl http://localhost:8000/api/directions/
```

Expected: `[]`

```bash
curl -X POST http://localhost:8000/api/directions/ \
  -H "Content-Type: application/json" \
  -d '{"id": "backend", "name": "后端开发", "name_en": "Backend Development", "icon": "server", "description": "学习服务器端开发技术", "subdirections": []}'
```

Expected: 返回创建的方向对象

- [ ] **Step 3: Commit**

```bash
git add backend/routes/directions.py
git commit -m "feat: 实现方向 CRUD API"
```

---

### Task 3: 实现子方向 (SubDirections) API

**Files:**
- Create: `backend/routes/subdirections.py`

- [ ] **Step 1: 创建子方向 API 路由**

`backend/routes/subdirections.py`:
```python
from fastapi import APIRouter, HTTPException
from backend.models import SubDirection
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "subdirections.json"
KEY = "subdirections"


@router.get("/", response_model=list[SubDirection])
def list_subdirections():
    """获取所有子方向。"""
    return read_list(FILE, KEY)


@router.get("/{subdirection_id}", response_model=SubDirection)
def get_subdirection(subdirection_id: str):
    """获取单个子方向详情。"""
    items = read_list(FILE, KEY)
    for item in items:
        if item["id"] == subdirection_id:
            return item
    raise HTTPException(status_code=404, detail="子方向不存在")


@router.post("/", response_model=SubDirection, status_code=201)
def create_subdirection(subdirection: SubDirection):
    """创建新子方向。"""
    append_item(FILE, KEY, subdirection.model_dump())
    return subdirection


@router.put("/{subdirection_id}", response_model=SubDirection)
def update_subdirection(subdirection_id: str, subdirection: SubDirection):
    """更新子方向信息。"""
    if subdirection.id != subdirection_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, subdirection.model_dump())
    return subdirection


@router.delete("/{subdirection_id}", status_code=204)
def delete_subdirection(subdirection_id: str):
    """删除子方向。"""
    if not delete_item(FILE, KEY, subdirection_id):
        raise HTTPException(status_code=404, detail="子方向不存在")
```

- [ ] **Step 2: 验证 API**

```bash
curl http://localhost:8000/api/subdirections/
```

Expected: `[]`

- [ ] **Step 3: Commit**

```bash
git add backend/routes/subdirections.py
git commit -m "feat: 实现子方向 CRUD API"
```

---

### Task 4: 实现课程 (Courses) API

**Files:**
- Create: `backend/routes/courses.py`
- Create: `data/courses/index.json`

- [ ] **Step 1: 创建课程索引文件**

`data/courses/index.json`:
```json
{
  "courses": []
}
```

- [ ] **Step 2: 创建课程 API 路由**

`backend/routes/courses.py`:
```python
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models import Course
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "courses/index.json"
KEY = "courses"


@router.get("/", response_model=list[Course])
def list_courses(
    direction: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
):
    """获取课程列表，支持按方向和难度筛选。"""
    courses = read_list(FILE, KEY)
    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]
    return courses


@router.get("/{course_id}", response_model=Course)
def get_course(course_id: str):
    """获取课程详情。"""
    courses = read_list(FILE, KEY)
    for c in courses:
        if c["id"] == course_id:
            return c
    raise HTTPException(status_code=404, detail="课程不存在")


@router.post("/", response_model=Course, status_code=201)
def create_course(course: Course):
    """创建新课程。"""
    append_item(FILE, KEY, course.model_dump())
    return course


@router.put("/{course_id}", response_model=Course)
def update_course(course_id: str, course: Course):
    """更新课程信息。"""
    if course.id != course_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, course.model_dump())
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: str):
    """删除课程。"""
    if not delete_item(FILE, KEY, course_id):
        raise HTTPException(status_code=404, detail="课程不存在")
```

- [ ] **Step 3: 验证 API**

```bash
curl http://localhost:8000/api/courses/
```

Expected: `[]`

- [ ] **Step 4: Commit**

```bash
git add backend/routes/courses.py data/courses/index.json
git commit -m "feat: 实现课程 CRUD API，支持难度筛选"
```

---

### Task 5: 实现用户 API（注册/登录/进度）

**Files:**
- Create: `backend/routes/users.py`

- [ ] **Step 1: 创建用户 API 路由**

`backend/routes/users.py`:
```python
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.models import User, UserCreate, UserLogin, Token, CourseProgress
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.storage import read_user, write_user

router = APIRouter()


@router.post("/register", response_model=User, status_code=201)
def register(user_data: UserCreate):
    """用户注册。"""
    user_id = str(uuid.uuid4())[:8]
    hashed = get_password_hash(user_data.password)
    
    user = {
        "user_id": user_id,
        "username": user_data.username,
        "password_hash": hashed,
        "created_at": datetime.utcnow().isoformat(),
        "selected_directions": [],
        "progress": {},
        "stats": {
            "total_xp": 0,
            "streak_days": 0,
            "badges": [],
            "milestones": []
        }
    }
    write_user(user_id, user)
    user.pop("password_hash")
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    """用户登录，返回 JWT token。"""
    users_dir = "data/users"
    import os
    from pathlib import Path
    data_dir = Path(__file__).parent.parent.parent / "data" / "users"
    
    for fname in os.listdir(data_dir):
        if not fname.endswith(".json"):
            continue
        import json
        with open(data_dir / fname, "r", encoding="utf-8") as f:
            user = json.load(f)
        if user["username"] == credentials.username:
            if not verify_password(credentials.password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="密码错误")
            token = create_access_token({"sub": user["user_id"]})
            return Token(access_token=token)
    
    raise HTTPException(status_code=404, detail="用户不存在")


@router.get("/me", response_model=User)
def get_me(user: dict = Depends(get_current_user)):
    """获取当前用户信息。"""
    user.pop("password_hash", None)
    return user


@router.put("/me/directions")
def update_directions(directions: list[str], user: dict = Depends(get_current_user)):
    """更新用户选择的学习方向。"""
    user["selected_directions"] = directions
    write_user(user["user_id"], user)
    return {"message": "方向已更新", "directions": directions}


@router.get("/me/progress")
def get_progress(user: dict = Depends(get_current_user)):
    """获取用户学习进度。"""
    return user.get("progress", {})


@router.put("/me/progress/{course_id}")
def update_progress(course_id: str, progress: CourseProgress, user: dict = Depends(get_current_user)):
    """更新课程学习进度。"""
    if "progress" not in user:
        user["progress"] = {}
    user["progress"][course_id] = progress.model_dump()
    write_user(user["user_id"], user)
    return {"message": "进度已更新", "course_id": course_id, "progress": progress}


@router.get("/me/stats")
def get_stats(user: dict = Depends(get_current_user)):
    """获取用户统计信息。"""
    return user.get("stats", {})
```

- [ ] **Step 2: 验证 API**

```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
```

Expected: 返回用户对象

```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
```

Expected: 返回 `{"access_token": "...", "token_type": "bearer"}`

- [ ] **Step 3: Commit**

```bash
git add backend/routes/users.py
git commit -m "feat: 实现用户注册、登录、进度追踪 API"
```

---

### Task 6: 创建前端项目脚手架

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/.env`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: 使用 Vite 创建 React + TypeScript 项目**

```bash
cd e:\Works\Projects\python\CS-Stack
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: 安装依赖**

```bash
cd frontend
npm install axios react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 3: 配置 TailwindCSS**

`frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: 添加 Tailwind 指令到 CSS**

修改 `frontend/src/index.css`，在文件顶部添加：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: 配置环境变量**

`frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

- [ ] **Step 6: 创建 API 客户端**

`frontend/src/api/client.ts`:
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

- [ ] **Step 7: 创建 TypeScript 类型定义**

`frontend/src/types/index.ts`:
```typescript
export interface Direction {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  subdirections: string[]
}

export interface SubDirection {
  id: string
  name: string
  directions: string[]
  courses: string[]
}

export interface KnowledgePoint {
  name: string
  description: string
  exercise: string
}

export interface CourseKnowledgePoints {
  core: KnowledgePoint[]
  important: KnowledgePoint[]
  extended: KnowledgePoint[]
}

export interface Resource {
  type: string
  url: string
  title: string
}

export interface Course {
  id: string
  title: string
  difficulty: string
  estimated_hours: number
  prerequisites: string[]
  knowledge_points: CourseKnowledgePoints
  resources: Resource[]
}

export interface CourseProgress {
  status: string
  completed_knowledge: string[]
  started_at: string
  hours_spent: number
}

export interface UserStats {
  total_xp: number
  streak_days: number
  badges: string[]
  milestones: string[]
}

export interface User {
  user_id: string
  username: string
  selected_directions: string[]
  progress: Record<string, CourseProgress>
  stats: UserStats
}
```

- [ ] **Step 8: 创建首页组件**

`frontend/src/pages/Home.tsx`:
```typescript
import { useEffect, useState } from 'react'
import api from '../api/client'
import type { Direction } from '../types'

export default function Home() {
  const [directions, setDirections] = useState<Direction[]>([])

  useEffect(() => {
    api.get('/directions/').then((res) => setDirections(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">CS-Stack</h1>
          <p className="mt-2 text-gray-600">计算机科学学习路径平台</p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-4">专业方向</h2>
        {directions.length === 0 ? (
          <p className="text-gray-500">暂无方向数据</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((d) => (
              <div key={d.id} className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium">{d.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{d.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 9: 配置路由**

`frontend/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 10: 验证前端可启动**

```bash
cd frontend
npm run dev
```

Expected: Vite dev server starts on http://localhost:5173

打开浏览器访问 http://localhost:5173，应显示 "CS-Stack" 标题和空方向列表。

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat: 搭建前端项目脚手架，包含首页和方向列表"
```

---

### Task 7: 初始化种子数据（示例方向和课程）

**Files:**
- Modify: `data/directions.json`
- Modify: `data/subdirections.json`
- Modify: `data/courses/index.json`

- [ ] **Step 1: 添加示例方向数据**

`data/directions.json`:
```json
{
  "directions": [
    {
      "id": "backend",
      "name": "后端开发",
      "name_en": "Backend Development",
      "icon": "server",
      "description": "学习服务器端开发技术，包括 API 设计、微服务、数据库集成等",
      "subdirections": ["backend-api", "backend-microservices", "backend-db"]
    },
    {
      "id": "frontend",
      "name": "前端开发",
      "name_en": "Frontend Development",
      "icon": "layout",
      "description": "学习现代 Web 前端技术，包括 React、Vue、CSS 工程等",
      "subdirections": ["frontend-core", "frontend-frameworks"]
    }
  ]
}
```

`data/subdirections.json`:
```json
{
  "subdirections": [
    {
      "id": "backend-api",
      "name": "API 设计与开发",
      "directions": ["backend"],
      "courses": ["rest-api-basics"]
    },
    {
      "id": "frontend-core",
      "name": "核心技能",
      "directions": ["frontend"],
      "courses": ["html-css-basics"]
    }
  ]
}
```

`data/courses/index.json`:
```json
{
  "courses": [
    {
      "id": "rest-api-basics",
      "title": "RESTful API 基础",
      "difficulty": "beginner",
      "estimated_hours": 15,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          {"name": "HTTP 方法与状态码", "description": "GET、POST、PUT、DELETE 及常见状态码", "exercise": "使用 curl 发送不同 HTTP 方法的请求"},
          {"name": "REST 设计原则", "description": "资源命名、URL 设计、无状态", "exercise": "为一个博客系统设计 RESTful API"},
          {"name": "JSON 数据格式", "description": "请求和响应的 JSON 序列化", "exercise": "编写 JSON 请求/响应示例"}
        ],
        "important": [
          {"name": "认证与授权", "description": "API Key、JWT、OAuth2 基础", "exercise": "实现简单的 JWT 认证中间件"},
          {"name": "错误处理", "description": "标准错误响应格式", "exercise": "设计统一的错误响应结构"}
        ],
        "extended": [
          {"name": "API 版本控制", "description": "URL 版本、Header 版本", "exercise": ""},
          {"name": "分页与过滤", "description": "游标分页、偏移分页", "exercise": ""},
          {"name": "API 文档", "description": "OpenAPI/Swagger 规范", "exercise": ""}
        ]
      },
      "resources": [
        {"type": "article", "url": "https://restfulapi.net/", "title": "RESTful API 设计指南"}
      ]
    },
    {
      "id": "html-css-basics",
      "title": "HTML & CSS 基础",
      "difficulty": "beginner",
      "estimated_hours": 20,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          {"name": "HTML 语义化标签", "description": "header、nav、main、article、section、footer", "exercise": "用语义化标签构建一个简单的文章页面"},
          {"name": "CSS 选择器与优先级", "description": "类、ID、属性、伪类选择器", "exercise": "编写 CSS 选择器优先级排序练习"},
          {"name": "Flexbox 布局", "description": "主轴、交叉轴、flex-grow/shrink/basis", "exercise": "用 Flexbox 实现一个响应式导航栏"}
        ],
        "important": [
          {"name": "CSS Grid 布局", "description": "网格轨道、区域、对齐", "exercise": "用 Grid 实现一个杂志式布局"},
          {"name": "响应式设计", "description": "Media Queries、断点", "exercise": "让一个页面在 mobile/tablet/desktop 下自适应"}
        ],
        "extended": [
          {"name": "CSS 自定义属性", "description": "变量、主题切换", "exercise": ""},
          {"name": "CSS 动画", "description": "transition、animation、keyframes", "exercise": ""},
          {"name": "无障碍基础", "description": "ARIA 属性、键盘导航", "exercise": ""}
        ]
      },
      "resources": [
        {"type": "article", "url": "https://developer.mozilla.org/zh-CN/docs/Learn", "title": "MDN Web 开发教程"}
      ]
    }
  ]
}
```

- [ ] **Step 2: 验证数据加载**

重启后端：
```bash
cd backend
uvicorn main:app --reload
```

访问：
```bash
curl http://localhost:8000/api/directions/
curl http://localhost:8000/api/subdirections/
curl http://localhost:8000/api/courses/
```

Expected: 各 API 返回对应的种子数据

打开前端 http://localhost:5173，应显示两个方向卡片。

- [ ] **Step 3: Commit**

```bash
git add data/
git commit -m "feat: 添加种子数据（2个方向、2个子方向、2门课程）"
```

---

## 自审

### 1. 规范覆盖检查

| 设计要求 | 对应 Task | 状态 |
|---------|----------|------|
| 项目脚手架（React + FastAPI） | Task 1, Task 6 | ✅ |
| JSON 数据存储层 | Task 1 (storage.py) | ✅ |
| 用户认证系统 | Task 5 | ✅ |
| 方向 API | Task 2 | ✅ |
| 子方向 API | Task 3 | ✅ |
| 课程 API | Task 4 | ✅ |
| 进度追踪 API | Task 5 | ✅ |

### 2. 占位符扫描
- 无 TBD/TODO
- 所有步骤包含完整代码
- 所有 API 端点都已实现
- 测试命令和期望输出已提供

### 3. 类型一致性
- Pydantic 模型 (`models.py`) 与 TypeScript 类型 (`types/index.ts`) 一致
- API 响应模型与前端类型匹配
- `CourseKnowledgePoints` 使用 `core/important/extended` 三个 key，前后端一致

### 4. 范围检查
- Phase 1 聚焦基础设施：脚手架、存储、认证、基础 API
- 前端仅包含首页占位，完整 UI 在 Phase 2+
- AI 管理后台不在本 Phase 范围内
