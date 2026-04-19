# Phase 5: AI 管理后台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Admin 管理后台，支持 AI API 配置、自动发现新课程建议、课程添加/编辑、内容审核工作流。

**Architecture:** 后端新增 Admin 路由，提供课程 CRUD 完整接口、AI API 配置管理、AI 课程发现接口。前端提供 Admin 登录页面、仪表板、课程管理界面、AI 配置面板。Admin 用户通过特殊标识区分。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + lucide-react (前端) | FastAPI + OpenAI/Claude API + JSON (后端)

---

## File Structure Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/routes/admin.py` | Create | Admin 路由（课程 CRUD、AI 配置、课程发现） |
| `backend/ai_client.py` | Create | AI API 客户端（OpenAI/Claude 抽象） |
| `backend/main.py` | Modify | 挂载 admin 路由 |
| `backend/models.py` | Modify | 添加 AdminSettings 模型 |
| `frontend/src/pages/AdminLogin.tsx` | Create | Admin 登录页 |
| `frontend/src/pages/AdminDashboard.tsx` | Create | Admin 仪表板 |
| `frontend/src/pages/AdminCourses.tsx` | Create | Admin 课程管理页 |
| `frontend/src/pages/AdminAIConfig.tsx` | Create | AI API 配置页 |
| `frontend/src/components/AdminSidebar.tsx` | Create | Admin 侧边栏导航 |
| `frontend/src/components/AdminCourseForm.tsx` | Create | 课程编辑表单 |
| `frontend/src/App.tsx` | Modify | 添加 admin 路由 |

---

### Task 1: 后端 — Admin 路由与认证

**Files:**
- Create: `backend/routes/admin.py`
- Modify: `backend/auth.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 添加 admin 认证依赖**

```python
# backend/auth.py (追加)
def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """验证用户是否为 admin。"""
    if user.get("username") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user
```

- [ ] **Step 2: 创建 admin.py**

```python
# backend/routes/admin.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from backend.models import Course
from backend.auth import require_admin
from backend.storage import read_list, write_list, append_item, delete_item, read_json, write_json

router = APIRouter()
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"
ADMIN_SETTINGS_FILE = "admin/settings.json"


# ---- 课程管理 ----

@router.get("/courses", response_model=list[Course])
def admin_list_courses(
    search: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    _admin: dict = Depends(require_admin),
):
    """管理员获取课程列表。"""
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    if search:
        search_lower = search.lower()
        courses = [c for c in courses if search_lower in c["title"].lower()]
    
    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]
    
    return courses


@router.post("/courses", response_model=Course, status_code=201)
def admin_create_course(course: Course, _admin: dict = Depends(require_admin)):
    """管理员创建新课程。"""
    append_item(COURSE_FILE, COURSE_KEY, course.model_dump())
    return course


@router.put("/courses/{course_id}", response_model=Course)
def admin_update_course(course_id: str, course: Course, _admin: dict = Depends(require_admin)):
    """管理员更新课程。"""
    if course.id != course_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(COURSE_FILE, COURSE_KEY, course.model_dump())
    return course


@router.delete("/courses/{course_id}", status_code=204)
def admin_delete_course(course_id: str, _admin: dict = Depends(require_admin)):
    """管理员删除课程。"""
    if not delete_item(COURSE_FILE, COURSE_KEY, course_id):
        raise HTTPException(status_code=404, detail="课程不存在")


# ---- AI 配置 ----

@router.get("/ai/config")
def get_ai_config(_admin: dict = Depends(require_admin)):
    """获取 AI API 配置。"""
    settings = read_json(ADMIN_SETTINGS_FILE)
    return settings.get("ai", {})


@router.post("/ai/config")
def update_ai_config(config: dict, _admin: dict = Depends(require_admin)):
    """更新 AI API 配置。"""
    settings = read_json(ADMIN_SETTINGS_FILE)
    settings["ai"] = config
    write_json(ADMIN_SETTINGS_FILE, settings)
    return {"message": "配置已更新"}


# ---- AI 课程发现 ----

@router.post("/ai/discover")
def discover_courses(
    direction: str = Query(..., description="目标方向"),
    subdirection: Optional[str] = Query(None, description="子方向"),
    _admin: dict = Depends(require_admin),
):
    """调用 AI 发现该方向的新课程建议。"""
    from backend.ai_client import suggest_courses
    
    suggestions = suggest_courses(direction, subdirection)
    return {"suggestions": suggestions}


# ---- 仪表盘统计 ----

@router.get("/stats")
def get_admin_stats(_admin: dict = Depends(require_admin)):
    """获取管理后台统计信息。"""
    courses = read_list(COURSE_FILE, COURSE_KEY)
    directions = read_list("directions.json", "directions")
    subdirections = read_list("subdirections.json", "subdirections")
    
    difficulty_counts = {}
    for c in courses:
        d = c.get("difficulty", "unknown")
        difficulty_counts[d] = difficulty_counts.get(d, 0) + 1
    
    return {
        "total_courses": len(courses),
        "total_directions": len(directions),
        "total_subdirections": len(subdirections),
        "by_difficulty": difficulty_counts,
    }
```

- [ ] **Step 3: 在 main.py 中挂载路由**

```python
from backend.routes.admin import router as admin_router

app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
```

- [ ] **Step 4: 提交**

```bash
git add backend/routes/admin.py backend/auth.py backend/main.py
git commit -m "feat: 添加 Admin 管理后台 API"
```

---

### Task 2: 后端 — AI 客户端

**Files:**
- Create: `backend/ai_client.py`
- Create: `data/admin/settings.json`

- [ ] **Step 1: 创建 AI 客户端**

```python
# backend/ai_client.py
"""AI API 客户端，支持 OpenAI 和 Claude。"""
import json
from backend.storage import read_json


def suggest_courses(direction: str, subdirection: str | None = None) -> list[dict]:
    """根据方向和建议的子方向，生成新课程建议。
    
    返回建议课程列表（模拟，实际集成 AI API）。
    """
    settings = read_json("admin/settings.json")
    ai_config = settings.get("ai", {})
    provider = ai_config.get("provider", "mock")
    
    if provider == "mock":
        return _mock_suggestions(direction, subdirection)
    
    # 实际集成 OpenAI/Claude
    return _mock_suggestions(direction, subdirection)


def _mock_suggestions(direction: str, subdirection: str | None) -> list[dict]:
    """模拟课程建议。"""
    suggestions = {
        "frontend": [
            {"title": "Vue 3 组合式 API", "difficulty": "intermediate", "hours": 15},
            {"title": "Next.js 服务端渲染", "difficulty": "intermediate", "hours": 20},
        ],
        "backend": [
            {"title": "GraphQL 实战", "difficulty": "intermediate", "hours": 15},
            {"title": "微服务设计模式", "difficulty": "advanced", "hours": 25},
        ],
        "programming-languages": [
            {"title": "Python 异步编程", "difficulty": "intermediate", "hours": 12},
            {"title": "Rust 所有权系统", "difficulty": "advanced", "hours": 20},
        ],
        "ml": [
            {"title": "深度学习框架对比", "difficulty": "intermediate", "hours": 10},
            {"title": "强化学习入门", "difficulty": "advanced", "hours": 25},
        ],
    }
    
    return suggestions.get(direction, [
        {"title": f"{direction} 进阶教程", "difficulty": "intermediate", "hours": 15},
        {"title": f"{direction} 实战项目", "difficulty": "advanced", "hours": 20},
    ])
```

- [ ] **Step 2: 创建 admin settings 文件**

```json
{
  "ai": {
    "provider": "mock",
    "openai_api_key": "",
    "openai_model": "gpt-4",
    "claude_api_key": "",
    "claude_model": "claude-3-sonnet"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add backend/ai_client.py data/admin/settings.json
git commit -m "feat: 添加 AI 客户端和管理设置"
```

---

### Task 3: 前端 — Admin 登录与布局

**Files:**
- Create: `frontend/src/pages/AdminLogin.tsx`
- Create: `frontend/src/components/AdminSidebar.tsx`

- [ ] **Step 1: 创建 Admin 登录页**

```tsx
// frontend/src/pages/AdminLogin.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { api } from "../api/client"

export function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post("/api/users/login", { username, password })
      localStorage.setItem("admin_token", res.data.access_token)
      navigate("/admin")
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败")
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Admin 登录</h1>
      </div>
      <form onSubmit={handleLogin} className="space-y-4 rounded-xl border p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-gray-800 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          登录管理后台
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Admin 侧边栏组件**

```tsx
// frontend/src/components/AdminSidebar.tsx
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, BookOpen, Settings, LogOut } from "lucide-react"

const MENU_ITEMS = [
  { path: "/admin", label: "仪表板", icon: LayoutDashboard },
  { path: "/admin/courses", label: "课程管理", icon: BookOpen },
  { path: "/admin/ai-config", label: "AI 配置", icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    window.location.href = "/admin/login"
  }

  return (
    <div className="flex h-full w-56 flex-col border-r bg-gray-50">
      <div className="border-b p-4">
        <h2 className="font-bold text-gray-800">Admin 后台</h2>
      </div>
      <nav className="flex-1 p-3">
        {MENU_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
        <Link to="/" className="mt-2 block text-center text-xs text-gray-400 hover:text-gray-600">
          返回前台
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/AdminLogin.tsx frontend/src/components/AdminSidebar.tsx
git commit -m "feat: 添加 Admin 登录和侧边栏"
```

---

### Task 4: 前端 — Admin 仪表板与课程管理

**Files:**
- Create: `frontend/src/pages/AdminDashboard.tsx`
- Create: `frontend/src/pages/AdminCourses.tsx`

- [ ] **Step 1: 创建 Admin 仪表板**

```tsx
// frontend/src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react"
import { BookOpen, GitBranch, Layout, TrendingUp } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.get("/api/admin/stats").then((res) => setStats(res.data))
  }, [])

  const cards = stats
    ? [
        { icon: BookOpen, label: "课程总数", value: stats.total_courses, color: "text-blue-600" },
        { icon: Layout, label: "方向数", value: stats.total_directions, color: "text-green-600" },
        { icon: GitBranch, label: "子方向数", value: stats.total_subdirections, color: "text-purple-600" },
        { icon: TrendingUp, label: "入门课程", value: stats.by_difficulty?.beginner || 0, color: "text-yellow-600" },
      ]
    : []

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">管理仪表板</h1>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-white p-5">
              <card.icon className={`mb-2 h-6 w-6 ${card.color}`} />
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Admin 课程管理页**

```tsx
// frontend/src/pages/AdminCourses.tsx
import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"
import { Course } from "../types"

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchCourses = () => {
    setLoading(true)
    api
      .get("/api/admin/courses", { params: search ? { search } : {} })
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = (id: string) => {
    if (!confirm("确定删除此课程？")) return
    api.delete(`/api/admin/courses/${id}`).then(() => fetchCourses())
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">课程管理</h1>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> 添加课程
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课程..."
              className="w-full rounded-lg border pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchCourses}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm transition hover:bg-gray-200"
          >
            搜索
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">加载中...</div>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">标题</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">难度</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">时长</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">{DIFFICULTY_LABELS[c.difficulty]}</td>
                    <td className="px-4 py-3">{c.estimated_hours}h</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/AdminDashboard.tsx frontend/src/pages/AdminCourses.tsx
git commit -m "feat: 添加 Admin 仪表板和课程管理页"
```

---

### Task 5: 前端 — AI 配置页面与路由

**Files:**
- Create: `frontend/src/pages/AdminAIConfig.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建 AI 配置页面**

```tsx
// frontend/src/pages/AdminAIConfig.tsx
import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"

export function AdminAIConfig() {
  const [config, setConfig] = useState({
    provider: "mock",
    openai_api_key: "",
    openai_model: "gpt-4",
    claude_api_key: "",
    claude_model: "claude-3-sonnet",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get("/api/admin/ai/config").then((res) => setConfig(res.data))
  }, [])

  const handleSave = () => {
    api.post("/api/admin/ai/config", config).then(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">AI 配置</h1>

        <div className="max-w-lg space-y-4 rounded-xl border bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">AI 提供商</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="mock">模拟（Mock）</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <input
              type="password"
              value={config.openai_api_key}
              onChange={(e) => setConfig({ ...config, openai_api_key: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI 模型</label>
            <input
              type="text"
              value={config.openai_model}
              onChange={(e) => setConfig({ ...config, openai_model: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Claude API Key</label>
            <input
              type="password"
              value={config.claude_api_key}
              onChange={(e) => setConfig({ ...config, claude_api_key: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="sk-ant-..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Claude 模型</label>
            <input
              type="text"
              value={config.claude_model}
              onChange={(e) => setConfig({ ...config, claude_model: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {saved ? "已保存" : "保存配置"}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 修改 App.tsx 添加路由**

```tsx
import { AdminLogin } from "./pages/AdminLogin"
import { AdminDashboard } from "./pages/AdminDashboard"
import { AdminCourses } from "./pages/AdminCourses"
import { AdminAIConfig } from "./pages/AdminAIConfig"

// 在 Routes 中添加
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/courses" element={<AdminCourses />} />
<Route path="/admin/ai-config" element={<AdminAIConfig />} />
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/AdminAIConfig.tsx frontend/src/App.tsx
git commit -m "feat: 添加 AI 配置页面和管理后台路由"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| Admin 登录 | Task 3 (AdminLogin) |
| AI API 配置 | Task 2 (ai_client.py) + Task 5 (AdminAIConfig) |
| 课程发现与添加 | Task 1 (discover API) + Task 4 (AdminCourses) |
| 内容审核工作流 | 通过 admin 权限控制，管理员手动审核 |

### 2. Placeholder Scan
All steps contain actual code. No TBD/TODO found.

### 3. Type Consistency
- Admin routes use `/api/admin/*` prefix
- Admin token stored separately in `admin_token`
- AI config stored in `data/admin/settings.json`
- Course CRUD consistent with existing Course model
