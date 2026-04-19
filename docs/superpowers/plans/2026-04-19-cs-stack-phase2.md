# Phase 2: 课程系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现课程系统前端展示、课程详情页、知识点 80/20 分类展示和用户学习进度追踪。

**Architecture:** 前后端分离。前端新增课程列表页、课程详情页、登录页、进度管理页；后端新增课程按方向/子方向筛选 API 和用户认证状态下的进度读写 API。所有数据通过 JSON 文件存储。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + lucide-react (前端) | FastAPI + Pydantic + JSON (后端)

---

## File Structure Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/routes/courses.py` | Modify | 增加按 direction/subdirection 筛选课程的端点 |
| `backend/models.py` | Modify | 添加 DirectionFilter 响应模型 |
| `frontend/src/pages/CourseList.tsx` | Create | 课程列表页：按难度筛选、卡片展示 |
| `frontend/src/pages/CourseDetail.tsx` | Create | 课程详情页：知识点 80/20 分类展示、进度操作 |
| `frontend/src/pages/Login.tsx` | Create | 用户登录页 |
| `frontend/src/pages/Progress.tsx` | Create | 用户学习进度总览页 |
| `frontend/src/components/KnowledgePointSection.tsx` | Create | 知识点 80/20 分组展示组件 |
| `frontend/src/components/CourseCard.tsx` | Create | 课程卡片组件 |
| `frontend/src/App.tsx` | Modify | 增加路由：课程列表、课程详情、登录、进度 |
| `frontend/src/types/index.ts` | Modify | 添加 LoginResponse 等辅助类型 |
| `data/directions.json` | Modify | 更新为 18 个方向 |
| `data/subdirections.json` | Modify | 更新为 122 个子方向 |
| `data/courses/index.json` | Modify | 扩充为 12 门种子课程 |

---

### Task 1: 后端课程 API 增强 — 增加方向/子方向筛选

**Files:**
- Modify: `backend/routes/courses.py`

- [ ] **Step 1: 修改 courses.py，增加方向/子方向筛选参数**

当前 `list_courses` 只支持 `direction` 和 `difficulty` 参数，但 `direction` 没有实际过滤逻辑。需要实现：
- `direction` 参数：如果提供，只返回该方向下子方向包含的课程
- `subdirection` 参数：如果提供，只返回该子方向的课程
- 支持同时按方向和难度筛选

```python
# backend/routes/courses.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models import Course
from backend.storage import read_list

router = APIRouter()
FILE = "courses/index.json"
KEY = "courses"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
DIR_FILE = "directions.json"
DIR_KEY = "directions"


def _get_direction_subdirections(direction_id: str) -> set[str]:
    directions = read_list(DIR_FILE, DIR_KEY)
    for d in directions:
        if d["id"] == direction_id:
            return set(d.get("subdirections", []))
    return set()


def _get_subdirection_courses(subdirection_id: str) -> set[str]:
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    for s in subdirections:
        if s["id"] == subdirection_id:
            return set(s.get("courses", []))
    return set()


@router.get("/", response_model=list[Course])
def list_courses(
    direction: Optional[str] = Query(None),
    subdirection: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
):
    courses = read_list(FILE, KEY)

    if subdirection:
        allowed = _get_subdirection_courses(subdirection)
        if allowed:
            courses = [c for c in courses if c["id"] in allowed]

    if direction:
        allowed_subs = _get_direction_subdirections(direction)
        course_ids = set()
        for sub_id in allowed_subs:
            course_ids.update(_get_subdirection_courses(sub_id))
        if course_ids:
            courses = [c for c in courses if c["id"] in course_ids]

    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]

    return courses
```

- [ ] **Step 2: 验证 API 正常**

```bash
cd backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

- [ ] **Step 3: 提交**

```bash
git add backend/routes/courses.py
git commit -m "feat: 增加课程 API 按方向/子方向筛选"
```

---

### Task 2: 前端基础组件 — CourseCard + KnowledgePointSection

**Files:**
- Create: `frontend/src/components/CourseCard.tsx`
- Create: `frontend/src/components/KnowledgePointSection.tsx`

- [ ] **Step 1: 创建 CourseCard 组件**

```tsx
import { Link } from "react-router-dom"
import { Clock, BookOpen } from "lucide-react"
import { Course } from "../types"

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
}

export function CourseCard({ course }: { course: Course }) {
  const totalPoints =
    course.knowledge_points.core.length +
    course.knowledge_points.important.length +
    course.knowledge_points.extended.length

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block rounded-xl border border-gray-200 p-5 transition hover:shadow-lg hover:border-blue-300"
    >
      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
      <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[course.difficulty]}`}>
          {DIFFICULTY_LABELS[course.difficulty]}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {course.estimated_hours} 小时
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" /> {totalPoints} 知识点
        </span>
      </div>
      {course.prerequisites.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">前置: {course.prerequisites.join(", ")}</p>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: 创建 KnowledgePointSection 组件**

```tsx
import { CheckCircle2, Circle, Target } from "lucide-react"
import { CourseKnowledgePoints } from "../types"

const SECTIONS = [
  {
    key: "core" as const,
    label: "核心 (20%)",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: Target,
  },
  {
    key: "important" as const,
    label: "重点 (20%)",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: CheckCircle2,
  },
  {
    key: "extended" as const,
    label: "扩展 (60%)",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: Circle,
  },
]

export function KnowledgePointSection({
  points,
  completed,
  onToggle,
}: {
  points: CourseKnowledgePoints
  completed: string[]
  onToggle: (name: string) => void
}) {
  return (
    <div className="space-y-6">
      {SECTIONS.map(({ key, label, color, bg, border, icon: Icon }) => {
        const items = points[key]
        if (items.length === 0) return null
        return (
          <div key={key} className={`rounded-lg border ${border} ${bg} p-4`}>
            <h4 className={`mb-3 font-semibold ${color}`}>
              <Icon className="mr-1 inline h-4 w-4" />
              {label}
            </h4>
            <ul className="space-y-2">
              {items.map((kp) => {
                const isCompleted = completed.includes(kp.name)
                return (
                  <li
                    key={kp.name}
                    className={`flex cursor-pointer items-start gap-2 rounded-md p-2 transition hover:bg-white/60 ${isCompleted ? "opacity-60" : ""}`}
                    onClick={() => onToggle(kp.name)}
                  >
                    <span className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </span>
                    <div>
                      <span className={`font-medium ${isCompleted ? "line-through" : ""}`}>{kp.name}</span>
                      {kp.description && <p className="text-sm text-gray-500">{kp.description}</p>}
                      {kp.exercise && (
                        <p className="mt-1 text-xs text-blue-600 font-medium">{kp.exercise}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/CourseCard.tsx frontend/src/components/KnowledgePointSection.tsx
git commit -m "feat: 添加课程卡片和知识点展示组件"
```

---

### Task 3: 前端课程列表页 + 路由

**Files:**
- Create: `frontend/src/pages/CourseList.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建课程列表页**

```tsx
import { useState, useEffect } from "react"
import { api } from "../api/client"
import { Course } from "../types"
import { CourseCard } from "../components/CourseCard"

const DIFFICULTIES = [
  { value: "", label: "全部" },
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "进阶" },
  { value: "advanced", label: "高级" },
]

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState("")

  const fetchCourses = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (difficulty) params.difficulty = difficulty
    api
      .get("/api/courses", { params })
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">课程库</h1>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-gray-600">难度:</span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              setDifficulty(d.value)
              setTimeout(fetchCourses, 0)
            }}
            className={`rounded-full px-3 py-1 text-sm transition ${
              difficulty === d.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {d.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">共 {courses.length} 门课程</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">加载中...</div>
      ) : courses.length === 0 ? (
        <div className="flex justify-center py-20 text-gray-400">暂无课程</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 修改 App.tsx 增加路由**

```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { Home } from "./pages/Home"
import { CourseList } from "./pages/CourseList"
import { CourseDetail } from "./pages/CourseDetail"
import { Login } from "./pages/Login"
import { Progress } from "./pages/Progress"

export default function App() {
  return (
    <BrowserRouter>
      <nav className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-6">
          <Link to="/" className="text-lg font-bold text-blue-600">
            CS-Stack
          </Link>
          <Link to="/courses" className="text-sm text-gray-600 hover:text-gray-900">
            课程库
          </Link>
          <Link to="/progress" className="text-sm text-gray-600 hover:text-gray-900">
            学习进度
          </Link>
          <Link to="/login" className="ml-auto text-sm text-gray-600 hover:text-gray-900">
            登录
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/CourseList.tsx frontend/src/App.tsx
git commit -m "feat: 添加课程列表页和路由配置"
```

---

### Task 4: 前端登录页

**Files:**
- Create: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: 创建登录页**

```tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/client"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/api/users/login", { username, password })
      localStorage.setItem("token", res.data.access_token)
      navigate("/progress")
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">登录</h1>
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
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Login.tsx
git commit -m "feat: 添加用户登录页"
```

---

### Task 5: 课程详情页 — 知识点展示 + 进度操作

**Files:**
- Create: `frontend/src/pages/CourseDetail.tsx`

- [ ] **Step 1: 创建课程详情页**

```tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock } from "lucide-react"
import { api } from "../api/client"
import { Course } from "../types"
import { KnowledgePointSection } from "../components/KnowledgePointSection"

export function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<{
    status: string
    completed_knowledge: string[]
    started_at: string
    hours_spent: number
  }>({ status: "not_started", completed_knowledge: [], started_at: "", hours_spent: 0 })
  const [token, setToken] = useState(localStorage.getItem("token"))

  const fetchCourse = () => {
    setLoading(true)
    api
      .get(`/api/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }

  const fetchProgress = () => {
    if (!token) return
    api
      .get("/api/users/me/progress")
      .then((res) => {
        const p = res.data[id!]
        if (p) setProgress(p)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchCourse()
    fetchProgress()
  }, [id, token])

  const toggleKnowledge = (name: string) => {
    const completed = progress.completed_knowledge.includes(name)
      ? progress.completed_knowledge.filter((n: string) => n !== name)
      : [...progress.completed_knowledge, name]

    const newProgress = {
      ...progress,
      completed_knowledge: completed,
      status: completed.length > 0 ? "in_progress" : "not_started",
      started_at: progress.started_at || new Date().toISOString(),
    }

    if (course) {
      const totalPoints =
        course.knowledge_points.core.length +
        course.knowledge_points.important.length +
        course.knowledge_points.extended.length
      if (completed.length >= totalPoints) {
        newProgress.status = "completed"
      }
    }

    setProgress(newProgress)

    if (token) {
      api.put(`/api/users/me/progress/${id}`, newProgress).catch(() => {})
    }
  }

  const handleStatusChange = (status: string) => {
    const newProgress = {
      ...progress,
      status,
      started_at: progress.started_at || new Date().toISOString(),
    }
    setProgress(newProgress)
    if (token) {
      api.put(`/api/users/me/progress/${id}`, newProgress).catch(() => {})
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!course) return <div className="flex justify-center py-20 text-gray-400">课程不存在</div>

  const STATUS_LABELS: Record<string, string> = {
    not_started: "未开始",
    in_progress: "学习中",
    completed: "已完成",
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {course.estimated_hours} 小时
          </span>
          <span>难度: {course.difficulty}</span>
        </div>
        {course.prerequisites.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">前置课程: {course.prerequisites.join(", ")}</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-gray-700">学习状态</h3>
        <div className="flex gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                progress.status === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!token && <p className="mt-2 text-xs text-orange-500">请先登录以保存进度</p>}
      </div>

      {course && (
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm text-gray-500">
            <span>知识点进度</span>
            <span>{progress.completed_knowledge.length} / {course.knowledge_points.core.length + course.knowledge_points.important.length + course.knowledge_points.extended.length}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{
                width: `${((progress.completed_knowledge.length / (course.knowledge_points.core.length + course.knowledge_points.important.length + course.knowledge_points.extended.length)) * 100) || 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <KnowledgePointSection
        points={course.knowledge_points}
        completed={progress.completed_knowledge}
        onToggle={toggleKnowledge}
      />

      {course.resources.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-medium text-gray-700">学习资源</h3>
          <ul className="space-y-2">
            {course.resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {r.title || r.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/CourseDetail.tsx
git commit -m "feat: 添加课程详情页，支持知识点标记和进度保存"
```

---

### Task 6: 学习进度总览页

**Files:**
- Create: `frontend/src/pages/Progress.tsx`

- [ ] **Step 1: 创建进度总览页**

```tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../api/client"
import { CourseProgress } from "../types"

const STATUS_LABELS: Record<string, string> = {
  not_started: "未开始",
  in_progress: "学习中",
  completed: "已完成",
}

const STATUS_COLORS: Record<string, string> = {
  not_started: "text-gray-400",
  in_progress: "text-blue-600",
  completed: "text-green-600",
}

export function Progress() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get("/api/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setError("获取用户信息失败"))
      .finally(() => setLoading(false))
  }, [])

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">学习进度</h1>
        <p className="text-gray-500">请先 <Link to="/login" className="text-blue-600 hover:underline">登录</Link> 查看学习进度</p>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (error) return <div className="flex justify-center py-20 text-red-400">{error}</div>
  if (!user) return <div className="flex justify-center py-20 text-gray-400">用户不存在</div>

  const progress = user.progress || {}
  const courseIds = Object.keys(progress)
  const completedCount = courseIds.filter((id) => progress[id].status === "completed").length
  const inProgressCount = courseIds.filter((id) => progress[id].status === "in_progress").length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">学习进度</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{courseIds.length}</div>
          <div className="text-sm text-gray-500">已选课程</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
          <div className="text-sm text-gray-500">学习中</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-gray-500">已完成</div>
        </div>
      </div>

      {courseIds.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-gray-400">
          还没有开始学习，去 <Link to="/courses" className="text-blue-600 hover:underline">课程库</Link> 选择课程吧
        </div>
      ) : (
        <div className="space-y-3">
          {courseIds.map((courseId) => {
            const p: CourseProgress = progress[courseId]
            return (
              <div key={courseId} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Link to={`/courses/${courseId}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {courseId}
                  </Link>
                  <p className="mt-1 text-xs text-gray-400">
                    知识点 {p.completed_knowledge.length} 已掌握
                  </p>
                </div>
                <span className={`text-sm font-medium ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {user.stats && (
        <div className="mt-8 rounded-xl border p-4">
          <h3 className="mb-3 font-medium text-gray-700">学习统计</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">经验值: </span>
              <span className="font-medium">{user.stats.total_xp}</span>
            </div>
            <div>
              <span className="text-gray-500">连续打卡: </span>
              <span className="font-medium">{user.stats.streak_days} 天</span>
            </div>
            <div>
              <span className="text-gray-500">徽章: </span>
              <span className="font-medium">{user.stats.badges.length} 个</span>
            </div>
            <div>
              <span className="text-gray-500">里程碑: </span>
              <span className="font-medium">{user.stats.milestones.length} 个</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Progress.tsx
git commit -m "feat: 添加学习进度总览页"
```

---

### Task 7: 完整种子数据 — 18 个方向的课程填充

**Files:**
- Modify: `data/courses/index.json`
- Modify: `data/directions.json`
- Modify: `data/subdirections.json`

- [ ] **Step 1: 更新 directions.json 为 18 个方向**

```json
{
  "directions": [
    { "id": "frontend", "name": "前端开发", "name_en": "Frontend Development", "icon": "layout", "description": "学习 Web 前端技术，构建用户界面", "subdirections": ["frontend-core", "frontend-frameworks", "frontend-perf", "frontend-css", "frontend-build", "frontend-test", "frontend-a11y"] },
    { "id": "backend", "name": "后端开发", "name_en": "Backend Development", "icon": "server", "description": "学习服务器端开发技术", "subdirections": ["backend-api", "backend-microservices", "backend-db", "backend-perf", "backend-auth", "backend-mq", "backend-serverless"] },
    { "id": "programming-languages", "name": "编程语言", "name_en": "Programming Languages", "icon": "code", "description": "掌握主流编程语言核心技能", "subdirections": ["lang-python", "lang-js-ts", "lang-java", "lang-c-cpp", "lang-go", "lang-rust", "lang-csharp", "lang-swift", "lang-kotlin", "lang-sql-shell"] },
    { "id": "dev-tools", "name": "开发工具", "name_en": "Development Tools", "icon": "wrench", "description": "熟练使用开发工具和 IDE", "subdirections": ["tools-ide", "tools-git", "tools-debug", "tools-package", "tools-api-test", "tools-db-mgmt", "tools-collab", "tools-docker", "tools-ai-assistant"] },
    { "id": "mobile", "name": "客户端/移动端", "name_en": "Mobile Development", "icon": "smartphone", "description": "学习移动应用开发", "subdirections": ["mobile-android", "mobile-ios", "mobile-cross", "mobile-arch", "mobile-offline", "mobile-publish"] },
    { "id": "data-mining", "name": "数据挖掘", "name_en": "Data Mining", "icon": "database", "description": "从数据中发现模式和知识", "subdirections": ["mining-association", "mining-clustering", "mining-anomaly", "mining-recommendation", "mining-feature", "mining-text"] },
    { "id": "ai-agent", "name": "AI Agent", "name_en": "AI Agent", "icon": "bot", "description": "构建智能体应用", "subdirections": ["agent-arch", "agent-tool", "agent-memory", "agent-plan", "agent-multi", "agent-framework", "agent-mcp", "agent-skill", "agent-eval", "agent-app"] },
    { "id": "llm", "name": "大模型 (LLM)", "name_en": "Large Language Models", "icon": "brain", "description": "学习和应用大语言模型", "subdirections": ["llm-arch", "llm-prompt", "llm-rag", "llm-finetune", "llm-deploy", "llm-eval", "llm-data", "llm-memory", "llm-security"] },
    { "id": "ml", "name": "机器学习", "name_en": "Machine Learning", "icon": "cpu", "description": "机器学习理论和实践", "subdirections": ["ml-supervised", "ml-unsupervised", "ml-deep", "ml-rl", "ml-mlops", "ml-ethics"] },
    { "id": "infra", "name": "基础架构", "name_en": "Infrastructure", "icon": "cloud", "description": "云原生和基础设施工程", "subdirections": ["infra-cloud", "infra-k8s", "infra-iac", "infra-network", "infra-observability", "infra-sre"] },
    { "id": "bigdata", "name": "大数据", "name_en": "Big Data", "icon": "bar-chart-3", "description": "大数据处理和分析", "subdirections": ["bigdata-hadoop", "bigdata-spark", "bigdata-stream", "bigdata-warehouse", "bigdata-etl", "bigdata-cloud"] },
    { "id": "cv", "name": "计算机视觉", "name_en": "Computer Vision", "icon": "eye", "description": "图像和视频理解技术", "subdirections": ["cv-traditional", "cv-deep", "cv-detection", "cv-generation", "cv-video", "cv-3d"] },
    { "id": "ops", "name": "运维工程", "name_en": "Operations Engineering", "icon": "settings", "description": "系统运维和自动化", "subdirections": ["ops-monitor", "ops-log", "ops-cicd", "ops-config", "ops-dr", "ops-linux"] },
    { "id": "algo", "name": "算法", "name_en": "Algorithms", "icon": "git-branch", "description": "算法和数据结构", "subdirections": ["algo-ds", "algo-sort", "algo-dp", "algo-graph", "algo-complexity", "algo-math", "algo-string"] },
    { "id": "testing", "name": "测试工程", "name_en": "Testing Engineering", "icon": "check-square", "description": "软件测试实践", "subdirections": ["test-unit", "test-integration", "test-e2e", "test-perf", "test-tdd", "test-security", "test-auto"] },
    { "id": "nlp", "name": "自然语言处理", "name_en": "Natural Language Processing", "icon": "message-square", "description": "文本和语言处理技术", "subdirections": ["nlp-traditional", "nlp-transformer", "nlp-llm", "nlp-app", "nlp-multimodal", "nlp-align"] },
    { "id": "security", "name": "安全", "name_en": "Security", "icon": "shield", "description": "网络安全和应用安全", "subdirections": ["sec-network", "sec-crypto", "sec-app", "sec-cloud", "sec-compliance", "sec-forensics"] },
    { "id": "multimedia", "name": "多媒体", "name_en": "Multimedia", "icon": "video", "description": "音频、视频、图像处理", "subdirections": ["mm-audio", "mm-video", "mm-streaming", "mm-image", "mm-graphics", "mm-arvr"] }
  ]
}
```

- [ ] **Step 2: 更新 subdirections.json 为完整的 122 个子方向**

```json
{
  "subdirections": [
    { "id": "frontend-core", "name": "核心技能", "directions": ["frontend"], "courses": ["html-css-basics", "javascript-fundamentals", "dom-programming", "web-api", "responsive-design", "semantic-html", "web-standards"] },
    { "id": "frontend-frameworks", "name": "框架生态", "directions": ["frontend"], "courses": ["react-basics", "vue-basics", "angular-basics", "nextjs", "state-management"] },
    { "id": "frontend-perf", "name": "性能优化", "directions": ["frontend"], "courses": ["web-perf", "bundle-optimization", "lazy-loading", "rendering-optimization"] },
    { "id": "frontend-css", "name": "CSS 工程化", "directions": ["frontend"], "courses": ["css-advanced", "tailwind-css", "css-in-js", "css-architecture"] },
    { "id": "frontend-build", "name": "构建工具", "directions": ["frontend", "dev-tools"], "courses": ["vite", "webpack", "esbuild"] },
    { "id": "frontend-test", "name": "前端测试", "directions": ["frontend", "testing"], "courses": ["jest", "cypress-e2e", "react-testing"] },
    { "id": "frontend-a11y", "name": "无障碍与 SEO", "directions": ["frontend"], "courses": ["a11y-basics", "seo-fundamentals", "meta-tags"] },
    { "id": "backend-api", "name": "API 设计与开发", "directions": ["backend"], "courses": ["rest-api-basics", "graphql-basics", "grpc-basics", "websocket-programming", "openapi-spec", "api-versioning"] },
    { "id": "backend-microservices", "name": "微服务架构", "directions": ["backend", "infra"], "courses": ["microservices-patterns", "service-mesh", "api-gateway"] },
    { "id": "backend-db", "name": "数据库集成", "directions": ["backend", "bigdata", "ops"], "courses": ["sql-fundamentals", "nosql-basics", "orm-patterns", "redis-practice", "database-design"] },
    { "id": "backend-perf", "name": "性能优化", "directions": ["backend"], "courses": ["caching-strategies", "db-optimization", "async-programming"] },
    { "id": "backend-auth", "name": "认证与授权", "directions": ["backend", "security"], "courses": ["jwt-auth", "oauth2-basics", "rbac"] },
    { "id": "backend-mq", "name": "消息队列", "directions": ["backend", "infra"], "courses": ["rabbitmq-basics", "kafka-basics", "celery-task"] },
    { "id": "backend-serverless", "name": "Serverless", "directions": ["backend", "infra"], "courses": ["aws-lambda", "serverless-framework"] },
    { "id": "lang-python", "name": "Python", "directions": ["programming-languages"], "courses": ["python-fundamentals", "python-oop", "python-async", "python-type-hints"] },
    { "id": "lang-js-ts", "name": "JavaScript/TypeScript", "directions": ["programming-languages", "frontend"], "courses": ["js-es6", "typescript-basics", "js-design-patterns"] },
    { "id": "lang-java", "name": "Java", "directions": ["programming-languages"], "courses": ["java-fundamentals", "java-spring", "java-jvm"] },
    { "id": "lang-c-cpp", "name": "C/C++", "directions": ["programming-languages"], "courses": ["c-fundamentals", "cpp-stl", "cpp-memory"] },
    { "id": "lang-go", "name": "Go", "directions": ["programming-languages"], "courses": ["go-fundamentals", "go-concurrency", "go-web"] },
    { "id": "lang-rust", "name": "Rust", "directions": ["programming-languages"], "courses": ["rust-fundamentals", "rust-ownership", "rust-async"] },
    { "id": "lang-csharp", "name": "C#", "directions": ["programming-languages"], "courses": ["csharp-fundamentals", "dotnet-webapi"] },
    { "id": "lang-swift", "name": "Swift", "directions": ["programming-languages", "mobile"], "courses": ["swift-fundamentals", "swiftui-basics"] },
    { "id": "lang-kotlin", "name": "Kotlin", "directions": ["programming-languages", "mobile"], "courses": ["kotlin-fundamentals", "kotlin-coroutines"] },
    { "id": "lang-sql-shell", "name": "SQL/Shell", "directions": ["programming-languages", "ops"], "courses": ["sql-advanced", "bash-scripting"] },
    { "id": "tools-ide", "name": "IDE 与编辑器", "directions": ["dev-tools"], "courses": ["vscode-guide", "vim-basics", "ide-shortcuts"] },
    { "id": "tools-git", "name": "版本控制", "directions": ["dev-tools"], "courses": ["git-fundamentals", "git-workflow", "github-actions"] },
    { "id": "tools-debug", "name": "调试与性能分析", "directions": ["dev-tools"], "courses": ["debugging-strategies", "profiling-basics"] },
    { "id": "tools-package", "name": "包管理与构建", "directions": ["dev-tools"], "courses": ["npm-guide", "pip-guide", "maven-gradle"] },
    { "id": "tools-api-test", "name": "API 测试", "directions": ["dev-tools", "testing"], "courses": ["postman-guide", "curl-guide"] },
    { "id": "tools-db-mgmt", "name": "数据库管理", "directions": ["dev-tools"], "courses": ["dbeaver-guide", "redis-insight"] },
    { "id": "tools-collab", "name": "协作与文档", "directions": ["dev-tools"], "courses": ["markdown-guide", "swagger-docs"] },
    { "id": "tools-docker", "name": "容器化开发", "directions": ["dev-tools", "infra", "ops"], "courses": ["docker-fundamentals", "docker-compose"] },
    { "id": "tools-ai-assistant", "name": "AI 编程助手", "directions": ["dev-tools", "ai-agent", "llm"], "courses": ["prompt-engineering", "ai-coding-tools"] },
    { "id": "mobile-android", "name": "Android", "directions": ["mobile"], "courses": ["android-basics", "android-jetpack", "android-kotlin"] },
    { "id": "mobile-ios", "name": "iOS", "directions": ["mobile"], "courses": ["ios-basics", "swiftui-guide", "ios-arkit"] },
    { "id": "mobile-cross", "name": "跨平台", "directions": ["mobile", "frontend"], "courses": ["react-native-basics", "flutter-basics"] },
    { "id": "mobile-arch", "name": "移动端架构", "directions": ["mobile"], "courses": ["mobile-mvvm", "mobile-clean-arch"] },
    { "id": "mobile-offline", "name": "离线与缓存", "directions": ["mobile"], "courses": ["offline-first", "mobile-caching"] },
    { "id": "mobile-publish", "name": "发布与运营", "directions": ["mobile"], "courses": ["app-store-guide", "mobile-analytics"] },
    { "id": "mining-association", "name": "关联规则", "directions": ["data-mining"], "courses": ["apriori-algorithm", "fp-growth"] },
    { "id": "mining-clustering", "name": "聚类分析", "directions": ["data-mining", "ml"], "courses": ["kmeans-clustering", "hierarchical-clustering", "dbscan"] },
    { "id": "mining-anomaly", "name": "异常检测", "directions": ["data-mining"], "courses": ["anomaly-detection-basics", "isolation-forest"] },
    { "id": "mining-recommendation", "name": "推荐系统", "directions": ["data-mining", "ml", "backend"], "courses": ["collaborative-filtering", "content-based-rec", "hybrid-rec"] },
    { "id": "mining-feature", "name": "特征工程", "directions": ["data-mining", "ml"], "courses": ["feature-selection", "feature-extraction", "dimensionality-reduction"] },
    { "id": "mining-text", "name": "文本挖掘", "directions": ["data-mining", "nlp"], "courses": ["text-classification", "sentiment-analysis"] },
    { "id": "agent-arch", "name": "Agent 架构", "directions": ["ai-agent"], "courses": ["agent-patterns", "react-agent"] },
    { "id": "agent-tool", "name": "工具调用", "directions": ["ai-agent"], "courses": ["function-calling", "tool-use-patterns"] },
    { "id": "agent-memory", "name": "记忆系统", "directions": ["ai-agent", "llm"], "courses": ["vector-memory", "episodic-memory"] },
    { "id": "agent-plan", "name": "规划与推理", "directions": ["ai-agent"], "courses": ["cot-prompting", "tree-of-thoughts", "plan-and-execute"] },
    { "id": "agent-multi", "name": "多智能体协作", "directions": ["ai-agent"], "courses": ["multi-agent-patterns", "agent-debate"] },
    { "id": "agent-framework", "name": "Agent 平台与框架", "directions": ["ai-agent"], "courses": ["langchain-basics", "autogen", "crewai"] },
    { "id": "agent-mcp", "name": "MCP 协议与集成", "directions": ["ai-agent", "dev-tools"], "courses": ["mcp-protocol", "mcp-server-dev"] },
    { "id": "agent-skill", "name": "AI Skills 开发", "directions": ["ai-agent"], "courses": ["skill-design", "skill-composition"] },
    { "id": "agent-eval", "name": "Agent 评估与安全", "directions": ["ai-agent", "security"], "courses": ["agent-evaluation", "agent-safety"] },
    { "id": "agent-app", "name": "Agent 应用开发", "directions": ["ai-agent"], "courses": ["agent-workflow", "agent-ui"] },
    { "id": "llm-arch", "name": "模型架构与原理", "directions": ["llm"], "courses": ["transformer-arch", "attention-mechanism", "llm-scaling"] },
    { "id": "llm-prompt", "name": "Prompt/Context 工程", "directions": ["llm"], "courses": ["prompt-engineering-advanced", "context-window-mgmt"] },
    { "id": "llm-rag", "name": "RAG 检索增强", "directions": ["llm"], "courses": ["rag-basics", "vector-database", "rag-optimization"] },
    { "id": "llm-finetune", "name": "模型微调", "directions": ["llm", "ml"], "courses": ["lora-finetune", "rlhf-basics", "qlora"] },
    { "id": "llm-deploy", "name": "模型部署与推理优化", "directions": ["llm", "infra"], "courses": ["vllm-deploy", "ollama-guide", "quantization"] },
    { "id": "llm-eval", "name": "评测系统", "directions": ["llm"], "courses": ["llm-benchmarks", "rag-eval"] },
    { "id": "llm-data", "name": "数据处理", "directions": ["llm", "data-mining"], "courses": ["llm-data-prep", "data-curation"] },
    { "id": "llm-memory", "name": "记忆系统", "directions": ["llm", "ai-agent"], "courses": ["conversation-memory", "long-term-memory"] },
    { "id": "llm-security", "name": "安全与合规", "directions": ["llm", "security"], "courses": ["prompt-injection", "llm-red-teaming"] },
    { "id": "ml-supervised", "name": "监督学习", "directions": ["ml"], "courses": ["linear-regression", "decision-trees", "svm-basics", "ensemble-methods"] },
    { "id": "ml-unsupervised", "name": "无监督学习", "directions": ["ml"], "courses": ["pca-basics", "autoencoder", "gan-basics"] },
    { "id": "ml-deep", "name": "深度学习基础", "directions": ["ml"], "courses": ["neural-networks", "backpropagation", "cnn-basics", "rnn-lstm"] },
    { "id": "ml-rl", "name": "强化学习", "directions": ["ml"], "courses": ["q-learning", "policy-gradient"] },
    { "id": "ml-mlops", "name": "MLOps", "directions": ["ml", "ops"], "courses": ["ml-pipeline", "model-monitoring", "mlflow"] },
    { "id": "ml-ethics", "name": "ML 伦理与公平性", "directions": ["ml"], "courses": ["ai-ethics", "bias-detection"] },
    { "id": "infra-cloud", "name": "云平台", "directions": ["infra"], "courses": ["aws-fundamentals", "gcp-fundamentals", "azure-fundamentals"] },
    { "id": "infra-k8s", "name": "容器编排", "directions": ["infra"], "courses": ["kubernetes-basics", "helm-charts", "istio"] },
    { "id": "infra-iac", "name": "基础设施即代码", "directions": ["infra"], "courses": ["terraform-basics", "ansible-basics", "pulumi"] },
    { "id": "infra-network", "name": "网络架构", "directions": ["infra"], "courses": ["tcp-ip-basics", "dns-http", "load-balancing"] },
    { "id": "infra-observability", "name": "可观测性", "directions": ["infra", "ops"], "courses": ["prometheus", "grafana-dashboard", "distributed-tracing"] },
    { "id": "infra-sre", "name": "SRE 工程", "directions": ["infra", "ops"], "courses": ["sre-principles", "slo-sli", "incident-response"] },
    { "id": "bigdata-hadoop", "name": "Hadoop 生态", "directions": ["bigdata"], "courses": ["hdfs-basics", "mapreduce", "yarn"] },
    { "id": "bigdata-spark", "name": "Spark 生态", "directions": ["bigdata"], "courses": ["spark-basics", "spark-sql", "spark-streaming"] },
    { "id": "bigdata-stream", "name": "流处理", "directions": ["bigdata"], "courses": ["flink-basics", "kafka-streams"] },
    { "id": "bigdata-warehouse", "name": "数据仓库", "directions": ["bigdata"], "courses": ["data-warehouse-basics", "snowflake", "redshift"] },
    { "id": "bigdata-etl", "name": "ETL 工程", "directions": ["bigdata"], "courses": ["etl-patterns", "airflow-basics"] },
    { "id": "bigdata-cloud", "name": "云大数据", "directions": ["bigdata", "infra"], "courses": ["aws-emr", "gcp-dataproc"] },
    { "id": "cv-traditional", "name": "传统 CV", "directions": ["cv"], "courses": ["opencv-basics", "image-filtering", "edge-detection"] },
    { "id": "cv-deep", "name": "深度学习 CV", "directions": ["cv", "ml"], "courses": ["cnn-architectures", "resnet", "efficientnet"] },
    { "id": "cv-detection", "name": "目标检测", "directions": ["cv"], "courses": ["yolo-basics", "faster-rcnn", "object-tracking"] },
    { "id": "cv-generation", "name": "图像生成", "directions": ["cv"], "courses": ["gan-image-gen", "diffusion-models", "style-transfer"] },
    { "id": "cv-video", "name": "视频理解", "directions": ["cv"], "courses": ["video-classification", "action-recognition"] },
    { "id": "cv-3d", "name": "3D 视觉", "directions": ["cv"], "courses": ["point-cloud", "neural-radiance-fields", "3d-reconstruction"] },
    { "id": "ops-monitor", "name": "系统监控", "directions": ["ops"], "courses": ["monitoring-basics", "zabbix", "nagios"] },
    { "id": "ops-log", "name": "日志管理", "directions": ["ops"], "courses": ["elk-stack", "loki", "log-management"] },
    { "id": "ops-cicd", "name": "CI/CD", "directions": ["ops", "testing", "infra"], "courses": ["jenkins-basics", "github-actions-cicd", "argocd"] },
    { "id": "ops-config", "name": "配置管理", "directions": ["ops"], "courses": ["ansible-advanced", "consul"] },
    { "id": "ops-dr", "name": "灾备与恢复", "directions": ["ops"], "courses": ["backup-strategies", "disaster-recovery"] },
    { "id": "ops-linux", "name": "Linux 运维", "directions": ["ops"], "courses": ["linux-admin", "systemd", "shell-scripting"] },
    { "id": "algo-ds", "name": "数据结构", "directions": ["algo"], "courses": ["arrays-linked-lists", "trees-graphs", "hash-tables", "heaps"] },
    { "id": "algo-sort", "name": "排序与搜索", "directions": ["algo"], "courses": ["sort-algorithms", "binary-search", "hashing"] },
    { "id": "algo-dp", "name": "动态规划", "directions": ["algo"], "courses": ["dp-basics", "dp-patterns", "knapsack-problem"] },
    { "id": "algo-graph", "name": "图算法", "directions": ["algo"], "courses": ["bfs-dfs", "dijkstra", "minimum-spanning-tree"] },
    { "id": "algo-complexity", "name": "复杂度分析", "directions": ["algo"], "courses": ["big-o", "amortized-analysis", "space-complexity"] },
    { "id": "algo-math", "name": "数学基础", "directions": ["algo"], "courses": ["discrete-math", "probability-basics", "linear-algebra"] },
    { "id": "algo-string", "name": "字符串算法", "directions": ["algo"], "courses": ["string-matching", "trie", "kmp"] },
    { "id": "test-unit", "name": "单元测试", "directions": ["testing"], "courses": ["unit-test-basics", "mocking", "test-coverage"] },
    { "id": "test-integration", "name": "集成测试", "directions": ["testing"], "courses": ["integration-test-patterns", "test-containers"] },
    { "id": "test-e2e", "name": "E2E 测试", "directions": ["testing"], "courses": ["playwright", "cypress-advanced"] },
    { "id": "test-perf", "name": "性能测试", "directions": ["testing"], "courses": ["load-testing", "jmeter", "k6"] },
    { "id": "test-tdd", "name": "TDD/BDD", "directions": ["testing"], "courses": ["tdd-guide", "bdd-cucumber"] },
    { "id": "test-security", "name": "安全测试", "directions": ["testing", "security"], "courses": ["owasp-testing", "penetration-testing"] },
    { "id": "test-auto", "name": "测试自动化", "directions": ["testing"], "courses": ["test-automation-framework", "ci-test-integration"] },
    { "id": "nlp-traditional", "name": "传统 NLP", "directions": ["nlp"], "courses": ["tokenization", "pos-tagging", "nltk-guide"] },
    { "id": "nlp-transformer", "name": "Transformer 架构", "directions": ["nlp"], "courses": ["transformer-nlp", "bert-basics"] },
    { "id": "nlp-llm", "name": "大语言模型", "directions": ["nlp", "llm"], "courses": ["gpt-family", "llm-nlp-tasks"] },
    { "id": "nlp-app", "name": "NLP 应用", "directions": ["nlp"], "courses": ["ner", "machine-translation", "text-summarization"] },
    { "id": "nlp-multimodal", "name": "多模态", "directions": ["nlp", "cv"], "courses": ["clip-basics", "vlm-basics"] },
    { "id": "nlp-align", "name": "评估与对齐", "directions": ["nlp"], "courses": ["nlp-evaluation", "instruction-tuning"] },
    { "id": "sec-network", "name": "网络安全", "directions": ["security"], "courses": ["network-security-basics", "firewall-config", "ids-ips"] },
    { "id": "sec-crypto", "name": "密码学", "directions": ["security"], "courses": ["symmetric-encryption", "asymmetric-encryption", "hash-functions"] },
    { "id": "sec-app", "name": "应用安全", "directions": ["security"], "courses": ["owasp-top10", "secure-coding", "xss-csrf"] },
    { "id": "sec-cloud", "name": "云安全", "directions": ["security"], "courses": ["cloud-security-basics", "iam-security"] },
    { "id": "sec-compliance", "name": "合规与治理", "directions": ["security"], "courses": ["gdpr-basics", "iso27001", "soc2"] },
    { "id": "sec-forensics", "name": "数字取证", "directions": ["security"], "courses": ["digital-forensics-basics", "incident-analysis"] },
    { "id": "mm-audio", "name": "音频处理", "directions": ["multimedia"], "courses": ["audio-basics", "speech-recognition"] },
    { "id": "mm-video", "name": "视频处理", "directions": ["multimedia"], "courses": ["video-codecs", "ffmpeg-guide"] },
    { "id": "mm-streaming", "name": "流媒体", "directions": ["multimedia"], "courses": ["hls-dash", "webrtc"] },
    { "id": "mm-image", "name": "图像处理", "directions": ["multimedia"], "courses": ["image-formats", "image-compression"] },
    { "id": "mm-graphics", "name": "计算机图形学", "directions": ["multimedia"], "courses": ["webgl-basics", "ray-tracing"] },
    { "id": "mm-arvr", "name": "AR/VR", "directions": ["multimedia"], "courses": ["ar-fundamentals", "webxr"] }
  ]
}
```

- [ ] **Step 3: 添加 12 门种子课程到 courses/index.json**

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
          { "name": "HTTP 方法与状态码", "description": "GET/POST/PUT/DELETE 及常见状态码", "exercise": "设计一个用户 CRUD API" },
          { "name": "资源建模", "description": "如何用名词建模 REST 资源", "exercise": "为一个博客系统设计资源结构" }
        ],
        "important": [
          { "name": "查询参数与分页", "description": "limit/offset 分页模式", "exercise": "实现分页查询接口" },
          { "name": "错误处理", "description": "统一的错误响应格式", "exercise": "设计错误响应中间件" }
        ],
        "extended": [
          { "name": "HATEOAS", "description": "超媒体作为应用状态引擎" },
          { "name": "API 版本策略", "description": "URL 路径、Header、查询参数版本控制" }
        ]
      },
      "resources": []
    },
    {
      "id": "html-css-basics",
      "title": "HTML & CSS 基础",
      "difficulty": "beginner",
      "estimated_hours": 20,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "HTML 语义化标签", "description": "header, nav, main, article, section, aside, footer", "exercise": "用语义化标签重构一个新闻页面" },
          { "name": "CSS 选择器", "description": "类、ID、属性、伪类、伪元素选择器", "exercise": "编写一个完整的页面样式表" },
          { "name": "盒模型", "description": "content-box vs border-box", "exercise": "实现一个 3 列布局" }
        ],
        "important": [
          { "name": "Flexbox 布局", "description": "弹性盒子排列", "exercise": "实现一个响应式导航栏" },
          { "name": "CSS Grid 布局", "description": "二维网格布局", "exercise": "实现一个卡片网格页面" }
        ],
        "extended": [
          { "name": "CSS 动画", "description": "transition 和 animation" },
          { "name": "CSS 变量", "description": "自定义属性" },
          { "name": "响应式设计", "description": "Media Queries 断点" }
        ]
      },
      "resources": []
    },
    {
      "id": "python-fundamentals",
      "title": "Python 基础",
      "difficulty": "beginner",
      "estimated_hours": 25,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "变量与数据类型", "description": "int, float, str, bool, list, dict", "exercise": "实现一个简单的通讯录管理程序" },
          { "name": "控制流", "description": "if/elif/else, for, while", "exercise": "编写一个猜数字游戏" },
          { "name": "函数定义", "description": "参数、返回值、默认值", "exercise": "实现一组数学工具函数" }
        ],
        "important": [
          { "name": "列表推导式", "description": "简洁的列表生成语法", "exercise": "用推导式处理数据列表" },
          { "name": "文件操作", "description": "open/read/write/with 语句", "exercise": "实现一个 CSV 文件读取器" }
        ],
        "extended": [
          { "name": "装饰器", "description": "@decorator 语法" },
          { "name": "生成器", "description": "yield 关键字" },
          { "name": "上下文管理器", "description": "__enter__/__exit__" }
        ]
      },
      "resources": []
    },
    {
      "id": "git-fundamentals",
      "title": "Git 版本控制",
      "difficulty": "beginner",
      "estimated_hours": 10,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "Git 基本概念", "description": "仓库、暂存区、提交、分支", "exercise": "初始化仓库并完成第一次提交" },
          { "name": "常用命令", "description": "add, commit, push, pull, status, log", "exercise": "完成日常开发提交流程" }
        ],
        "important": [
          { "name": "分支管理", "description": "branch, merge, rebase", "exercise": "创建功能分支并合并到主分支" },
          { "name": "冲突解决", "description": "合并冲突的识别和解决", "exercise": "手动解决一次合并冲突" }
        ],
        "extended": [
          { "name": "Git 钩子", "description": "pre-commit, pre-push 钩子" },
          { "name": "cherry-pick", "description": "挑选提交" },
          { "name": "stash", "description": "临时保存修改" }
        ]
      },
      "resources": []
    },
    {
      "id": "docker-fundamentals",
      "title": "Docker 基础",
      "difficulty": "intermediate",
      "estimated_hours": 15,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "容器概念", "description": "容器 vs 虚拟机", "exercise": "运行第一个 Docker 容器" },
          { "name": "Dockerfile", "description": "FROM, RUN, COPY, CMD, EXPOSE", "exercise": "为一个 Python 应用编写 Dockerfile" },
          { "name": "镜像操作", "description": "build, pull, push, tag", "exercise": "构建并推送自定义镜像" }
        ],
        "important": [
          { "name": "数据卷", "description": "Volume 和 Bind Mount", "exercise": "使用 Volume 持久化数据库数据" },
          { "name": "网络", "description": "bridge, host, none 网络", "exercise": "配置两个容器间的网络通信" }
        ],
        "extended": [
          { "name": "多阶段构建", "description": "减小镜像体积" },
          { "name": "Docker Compose", "description": "多容器编排" },
          { "name": "Docker 安全", "description": "非 root 用户运行、镜像扫描" }
        ]
      },
      "resources": []
    },
    {
      "id": "react-basics",
      "title": "React 基础",
      "difficulty": "beginner",
      "estimated_hours": 20,
      "prerequisites": ["javascript-fundamentals"],
      "knowledge_points": {
        "core": [
          { "name": "组件与 JSX", "description": "函数组件、JSX 语法", "exercise": "创建一个 TodoList 组件" },
          { "name": "Props", "description": "父子组件数据传递", "exercise": "实现可复用的按钮组件" },
          { "name": "useState", "description": "状态管理 Hook", "exercise": "实现计数器组件" }
        ],
        "important": [
          { "name": "useEffect", "description": "副作用管理", "exercise": "在组件中调用 API 获取数据" },
          { "name": "条件渲染", "description": "三元运算符和逻辑与", "exercise": "实现加载状态和错误状态" }
        ],
        "extended": [
          { "name": "useContext", "description": "跨组件状态共享" },
          { "name": "useReducer", "description": "复杂状态管理" },
          { "name": "React.memo", "description": "性能优化" }
        ]
      },
      "resources": []
    },
    {
      "id": "sql-fundamentals",
      "title": "SQL 基础",
      "difficulty": "beginner",
      "estimated_hours": 15,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "SELECT 查询", "description": "基本查询、WHERE 条件、ORDER BY", "exercise": "查询满足条件的数据记录" },
          { "name": "INSERT/UPDATE/DELETE", "description": "数据的增删改", "exercise": "完成一组数据操作" }
        ],
        "important": [
          { "name": "JOIN", "description": "INNER, LEFT, RIGHT, FULL JOIN", "exercise": "编写多表关联查询" },
          { "name": "聚合函数", "description": "COUNT, SUM, AVG, GROUP BY", "exercise": "编写统计报表查询" }
        ],
        "extended": [
          { "name": "子查询", "description": "嵌套查询" },
          { "name": "窗口函数", "description": "ROW_NUMBER, RANK" },
          { "name": "索引优化", "description": "索引原理和使用场景" }
        ]
      },
      "resources": []
    },
    {
      "id": "javascript-fundamentals",
      "title": "JavaScript 基础",
      "difficulty": "beginner",
      "estimated_hours": 20,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "变量与作用域", "description": "var, let, const 和块级作用域", "exercise": "编写作用域测试代码" },
          { "name": "函数", "description": "声明、表达式、箭头函数", "exercise": "实现一组工具函数" },
          { "name": "数组操作", "description": "map, filter, reduce", "exercise": "用数组方法处理数据" }
        ],
        "important": [
          { "name": "Promise", "description": "异步编程基础", "exercise": "用 Promise 封装异步操作" },
          { "name": "DOM 操作", "description": "getElementById, querySelector", "exercise": "实现一个 DOM 操作练习" }
        ],
        "extended": [
          { "name": "原型链", "description": "JavaScript 继承机制" },
          { "name": "Event Loop", "description": "事件循环和微任务" },
          { "name": "模块化", "description": "ES Module 和 CommonJS" }
        ]
      },
      "resources": []
    },
    {
      "id": "transformer-arch",
      "title": "Transformer 架构原理",
      "difficulty": "advanced",
      "estimated_hours": 30,
      "prerequisites": ["python-fundamentals", "neural-networks"],
      "knowledge_points": {
        "core": [
          { "name": "Self-Attention 机制", "description": "Q/K/V 矩阵计算", "exercise": "手动计算注意力权重" },
          { "name": "多头注意力", "description": "Multi-Head Attention", "exercise": "实现简化版多头注意力" }
        ],
        "important": [
          { "name": "位置编码", "description": "正弦位置编码", "exercise": "可视化位置编码" },
          { "name": "编码器-解码器架构", "description": "Encoder-Decoder 结构", "exercise": "绘制 Transformer 架构图" }
        ],
        "extended": [
          { "name": "Flash Attention", "description": "高效注意力计算" },
          { "name": "RoPE 旋转位置编码", "description": "现代位置编码方案" },
          { "name": "KV Cache", "description": "推理加速技术" }
        ]
      },
      "resources": []
    },
    {
      "id": "prompt-engineering-advanced",
      "title": "高级 Prompt 工程",
      "difficulty": "intermediate",
      "estimated_hours": 10,
      "prerequisites": [],
      "knowledge_points": {
        "core": [
          { "name": "Prompt 基本结构", "description": "角色、任务、约束、示例", "exercise": "编写一个结构化 Prompt" },
          { "name": "Zero-shot vs Few-shot", "description": "零样本和少样本提示", "exercise": "对比两种提示效果" }
        ],
        "important": [
          { "name": "Chain of Thought", "description": "思维链提示", "exercise": "设计 CoT 提示解决数学问题" },
          { "name": "输出格式控制", "description": "JSON/Markdown 格式约束", "exercise": "要求模型输出结构化 JSON" }
        ],
        "extended": [
          { "name": "ReAct 模式", "description": "推理+行动的提示模式" },
          { "name": "Prompt 优化", "description": "迭代优化技巧" },
          { "name": "System Prompt 设计", "description": "系统提示最佳实践" }
        ]
      },
      "resources": []
    },
    {
      "id": "linear-regression",
      "title": "线性回归",
      "difficulty": "intermediate",
      "estimated_hours": 15,
      "prerequisites": ["python-fundamentals"],
      "knowledge_points": {
        "core": [
          { "name": "一元线性回归", "description": "最小二乘法原理", "exercise": "用 Python 实现一元线性回归" },
          { "name": "损失函数", "description": "MSE 损失", "exercise": "手写 MSE 计算函数" }
        ],
        "important": [
          { "name": "多元线性回归", "description": "多特征建模", "exercise": "用 sklearn 实现多元回归" },
          { "name": "模型评估", "description": "R²、MAE、RMSE", "exercise": "评估回归模型性能" }
        ],
        "extended": [
          { "name": "正则化", "description": "Ridge/Lasso 回归" },
          { "name": "梯度下降", "description": "批量/随机/小批量梯度下降" },
          { "name": "特征多项式", "description": "多项式回归" }
        ]
      },
      "resources": []
    },
    {
      "id": "kubernetes-basics",
      "title": "Kubernetes 基础",
      "difficulty": "intermediate",
      "estimated_hours": 20,
      "prerequisites": ["docker-fundamentals"],
      "knowledge_points": {
        "core": [
          { "name": "Pod 概念", "description": "最小调度单元", "exercise": "创建一个 Nginx Pod" },
          { "name": "Deployment", "description": "声明式部署管理", "exercise": "部署一个多副本应用" }
        ],
        "important": [
          { "name": "Service", "description": "ClusterIP, NodePort, LoadBalancer", "exercise": "为应用创建 Service" },
          { "name": "ConfigMap/Secret", "description": "配置和敏感信息管理", "exercise": "使用 ConfigMap 注入配置" }
        ],
        "extended": [
          { "name": "Ingress", "description": "HTTP 路由管理" },
          { "name": "Helm", "description": "包管理工具" },
          { "name": "HPA", "description": "水平自动扩缩容" }
        ]
      },
      "resources": []
    }
  ]
}
```

- [ ] **Step 4: 提交**

```bash
git add data/directions.json data/subdirections.json data/courses/index.json
git commit -m "feat: 填充 18 个方向、122 子方向、12 门种子课程"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| 课程库前端展示 | Task 3 (CourseList) |
| 课程详情页 | Task 5 (CourseDetail) |
| 知识点 80/20 分类展示 | Task 2 (KnowledgePointSection) + Task 5 |
| 学习进度追踪 | Task 5 + Task 6 (Progress) |
| 用户登录 | Task 4 (Login) |
| 按方向/难度筛选课程 | Task 1 (backend) + Task 3 (frontend) |

### 2. Placeholder Scan

All steps contain actual code. No "TODO", "TBD", or placeholder references found.

### 3. Type Consistency

- `Course` type from `frontend/src/types/index.ts` matches `backend/models.py` Course model
- `CourseProgress` type matches
- API paths match: `/api/courses/`, `/api/users/me/`, `/api/users/me/progress/{course_id}`
- Difficulty values: `beginner`, `intermediate`, `advanced` consistent across backend models and frontend components
