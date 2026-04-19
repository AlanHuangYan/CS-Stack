# My Study Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现"我的学习计划"功能——用户可以将学习方向或单个课程加入学习计划，查看各方向/课程的完成进度（已完成/学习中/未开始）。

**Architecture:** 前端新增"我的学习计划"页面，后端新增学习计划管理 API。学习计划的课程数据从用户进度 (progress) 和方向数据 (paths) 聚合而来。用户可以添加/移除整个方向或单个课程到计划中。移除学习时间相关字段。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + lucide-react (前端) | FastAPI + JSON (后端)

---

## File Structure Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/models.py` | Modify | 添加 `StudyPlan` 模型 |
| `backend/routes/studyplan.py` | Create | 学习计划 CRUD API |
| `backend/main.py` | Modify | 挂载 `studyplan` 路由 |
| `frontend/src/pages/MyStudyPlan.tsx` | Create | 我的学习计划页面 |
| `frontend/src/pages/LearningPath.tsx` | Modify | 添加"加入学习计划"功能 |
| `frontend/src/App.tsx` | Modify | 增加路由 |
| `frontend/src/api/client.ts` | Modify | (无需修改，已有通用 api) |

---

## Data Model Design

### 用户数据新增字段

```json
{
  "study_plan": {
    "directions": ["frontend", "backend"],
    "courses": ["html-basics", "css-layout"]
  }
}
```

- `directions`: 已加入的完整学习方向 ID 列表
- `courses`: 单独加入的课程 ID 列表（不在 directions 中的课程）

### 进度计算

对于每个学习方向，根据用户已有的 `progress` 数据计算：
- **已完成**：`status === "completed"`
- **学习中**：`status === "in_progress"`  
- **未开始**：`status === "not_started"` 或不在 progress 中

---

## Course Progress Status Removal

从 `CourseProgress` 模型和所有使用中移除 `started_at` 和 `hours_spent` 字段。

---

### Task 1: 后端 — 移除学习时间字段

**Files:**
- Modify: `backend/models.py`
- Modify: `data/users.json` (清理已有数据)

- [ ] **Step 1: 移除 `started_at` 和 `hours_spent` 字段**

```python
# backend/models.py - CourseProgress 修改为:
class CourseProgress(BaseModel):
    status: str = "not_started"
    completed_knowledge: list[str] = []
```

- [ ] **Step 2: 清理 users.json 中的旧字段**

Read `data/users.json`, remove `started_at` and `hours_spent` from all `progress` entries.

- [ ] **Step 3: Commit**

```bash
git add backend/models.py data/users.json
git commit -m "refactor: 移除课程进度中的学习时间字段"
```

---

### Task 2: 后端 — 学习计划管理 API

**Files:**
- Create: `backend/routes/studyplan.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 创建 studyplan.py**

```python
# backend/routes/studyplan.py
from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.storage import write_user
from backend.routes.paths import _get_courses_for_subdirection

router = APIRouter()

DIR_FILE = "directions.json"
SUB_DIR_FILE = "subdirections.json"
COURSE_FILE = "courses/index.json"


@router.get("/me")
def get_study_plan(user: dict = Depends(get_current_user)):
    """获取用户的学习计划及进度概览。"""
    from backend.storage import read_list
    plan = user.get("study_plan", {"directions": [], "courses": []})
    
    progress = user.get("progress", {})
    
    result = {
        "directions": [],
        "standalone_courses": [],
    }
    
    # Build direction progress
    directions = read_list(DIR_FILE, "directions")
    subdirections = read_list(SUB_DIR_FILE, "subdirections")
    all_courses = read_list(COURSE_FILE, "courses")
    
    for dir_id in plan.get("directions", []):
        direction = next((d for d in directions if d["id"] == dir_id), None)
        if not direction:
            continue
        
        # Collect all courses in this direction
        dir_course_ids = set()
        for sub_id in direction.get("subdirections", []):
            sub = next((s for s in subdirections if s["id"] == sub_id), None)
            if sub:
                dir_course_ids.update(sub.get("courses", []))
        
        total = len(dir_course_ids)
        completed = 0
        in_progress = 0
        not_started = 0
        
        for cid in dir_course_ids:
            p = progress.get(cid, {})
            status = p.get("status", "not_started")
            if status == "completed":
                completed += 1
            elif status == "in_progress":
                in_progress += 1
            else:
                not_started += 1
        
        result["directions"].append({
            "id": dir_id,
            "name": direction.get("name", dir_id),
            "icon": direction.get("icon", "📚"),
            "total_courses": total,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "progress_percent": round((completed / total * 100) if total > 0 else 0),
        })
    
    # Build standalone course progress
    for cid in plan.get("courses", []):
        course = next((c for c in all_courses if c["id"] == cid), None)
        if not course:
            continue
        p = progress.get(cid, {})
        status = p.get("status", "not_started")
        
        result["standalone_courses"].append({
            "id": cid,
            "title": course.get("title", cid),
            "difficulty": course.get("difficulty", "beginner"),
            "status": status,
        })
    
    return result


@router.post("/me/direction/{direction_id}")
def add_direction(direction_id: str, user: dict = Depends(get_current_user)):
    """将整个学习方向加入学习计划。"""
    from backend.storage import read_list
    directions = read_list(DIR_FILE, "directions")
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")
    
    if "study_plan" not in user:
        user["study_plan"] = {"directions": [], "courses": []}
    
    if direction_id not in user["study_plan"]["directions"]:
        user["study_plan"]["directions"].append(direction_id)
        # Remove individual courses from this direction if they exist in plan
        all_course_ids = set()
        subdirections = read_list(SUB_DIR_FILE, "subdirections")
        for sub_id in direction.get("subdirections", []):
            sub = next((s for s in subdirections if s["id"] == sub_id), None)
            if sub:
                all_course_ids.update(sub.get("courses", []))
        user["study_plan"]["courses"] = [
            c for c in user["study_plan"]["courses"] if c not in all_course_ids
        ]
    
    write_user(user["user_id"], user)
    return {"message": "方向已加入学习计划"}


@router.delete("/me/direction/{direction_id}")
def remove_direction(direction_id: str, user: dict = Depends(get_current_user)):
    """从学习计划中移除学习方向。"""
    if "study_plan" not in user:
        return {"message": "方向不在学习计划中"}
    
    user["study_plan"]["directions"] = [
        d for d in user["study_plan"]["directions"] if d != direction_id
    ]
    write_user(user["user_id"], user)
    return {"message": "方向已从学习计划中移除"}


@router.post("/me/course/{course_id}")
def add_course(course_id: str, user: dict = Depends(get_current_user)):
    """将单个课程加入学习计划。"""
    if "study_plan" not in user:
        user["study_plan"] = {"directions": [], "courses": []}
    
    if course_id not in user["study_plan"]["courses"]:
        user["study_plan"]["courses"].append(course_id)
    
    write_user(user["user_id"], user)
    return {"message": "课程已加入学习计划"}


@router.delete("/me/course/{course_id}")
def remove_course(course_id: str, user: dict = Depends(get_current_user)):
    """从学习计划中移除单个课程。"""
    if "study_plan" not in user:
        return {"message": "课程不在学习计划中"}
    
    user["study_plan"]["courses"] = [
        c for c in user["study_plan"]["courses"] if c != course_id
    ]
    write_user(user["user_id"], user)
    return {"message": "课程已从学习计划中移除"}
```

- [ ] **Step 2: 挂载路由**

```python
# backend/main.py - 在路由挂载区域添加:
from backend.routes import studyplan
app.include_router(studyplan.router, prefix="/api/studyplan")
```

- [ ] **Step 3: Commit**

```bash
git add backend/routes/studyplan.py backend/main.py backend/models.py
git commit -m "feat: 添加学习计划管理 API"
```

---

### Task 3: 前端 — 我的学习计划页面

**Files:**
- Create: `frontend/src/pages/MyStudyPlan.tsx`
- Create: `frontend/src/components/StudyPlanDirectionCard.tsx`
- Create: `frontend/src/components/StudyPlanCourseCard.tsx`

- [ ] **Step 1: 创建方向卡片组件**

```tsx
// frontend/src/components/StudyPlanDirectionCard.tsx
import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, CheckCircle, PlayCircle, Circle } from "lucide-react"

interface DirectionProgress {
  id: string
  name: string
  icon: string
  total_courses: number
  completed: number
  in_progress: number
  not_started: number
  progress_percent: number
}

export function StudyPlanDirectionCard({ data }: { data: DirectionProgress }) {
  return (
    <div className="rounded-xl border bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
            {data.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{data.name}</h3>
            <p className="text-xs text-gray-500">{data.total_courses} 门课程</p>
          </div>
        </div>
        <Link
          to={`/paths/${data.id}`}
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-green-50 p-2">
          <CheckCircle className="mx-auto mb-1 h-4 w-4 text-green-600" />
          <span className="block font-medium text-green-600">{data.completed}</span>
          <span className="text-gray-500">已完成</span>
        </div>
        <div className="rounded-lg bg-blue-50 p-2">
          <PlayCircle className="mx-auto mb-1 h-4 w-4 text-blue-600" />
          <span className="block font-medium text-blue-600">{data.in_progress}</span>
          <span className="text-gray-500">学习中</span>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <Circle className="mx-auto mb-1 h-4 w-4 text-gray-400" />
          <span className="block font-medium text-gray-400">{data.not_started}</span>
          <span className="text-gray-500">未开始</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>进度</span>
          <span>{data.progress_percent}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${data.progress_percent}%` }}
          />
        </div>
      </div>

      <Link
        to={`/paths/${data.id}`}
        className="mt-4 block rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
      >
        进入学习方向
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: 创建独立课程卡片组件**

```tsx
// frontend/src/components/StudyPlanCourseCard.tsx
import { Link } from "react-router-dom"
import { PlayCircle, CheckCircle, Circle, X } from "lucide-react"
import { api } from "../api/client"

const STATUS_CONFIG: Record<string, { icon: typeof PlayCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-600", label: "已完成" },
  in_progress: { icon: PlayCircle, color: "text-blue-600, label: "学习中" },
  not_started: { icon: Circle, color: "text-gray-400", label: "未开始" },
}

interface StandaloneCourse {
  id: string
  title: string
  difficulty: string
  status: string
}

export function StudyPlanCourseCard({ data, onRemove }: { data: StandaloneCourse; onRemove: () => void }) {
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.not_started
  const Icon = config.icon

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
  }

  const difficultyLabels: Record<string, string> = {
    beginner: "入门",
    intermediate: "中级",
    advanced: "高级",
  }

  return (
    <Link
      to={`/courses/${data.id}`}
      className="group flex items-center justify-between rounded-lg border bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <div>
          <span className="font-medium text-gray-900 group-hover:text-blue-600">{data.title}</span>
          <span className="ml-2 text-xs text-gray-400">{difficultyLabels[data.difficulty]}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${config.color}`}>{config.label}</span>
        <button
          onClick={handleRemove}
          className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: 创建学习计划主页面**

```tsx
// frontend/src/pages/MyStudyPlan.tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, BookOpen } from "lucide-react"
import { api } from "../api/client"
import { StudyPlanDirectionCard } from "../components/StudyPlanDirectionCard"
import { StudyPlanCourseCard } from "../components/StudyPlanCourseCard"

interface DirectionProgress {
  id: string
  name: string
  icon: string
  total_courses: number
  completed: number
  in_progress: number
  not_started: number
  progress_percent: number
}

interface StandaloneCourse {
  id: string
  title: string
  difficulty: string
  status: string
}

export function MyStudyPlan() {
  const [directions, setDirections] = useState<DirectionProgress[]>([])
  const [standaloneCourses, setStandaloneCourses] = useState<StandaloneCourse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlan = () => {
    setLoading(true)
    api.get("/api/studyplan/me")
      .then((res) => {
        setDirections(res.data.directions || [])
        setStandaloneCourses(res.data.standalone_courses || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  const handleRemoveCourse = (courseId: string) => {
    api.delete(`/api/studyplan/me/course/${courseId}`)
      .then(() => {
        setStandaloneCourses((prev) => prev.filter((c) => c.id !== courseId))
      })
  }

  const handleRemoveDirection = (directionId: string) => {
    api.delete(`/api/studyplan/me/direction/${directionId}`)
      .then(() => {
        setDirections((prev) => prev.filter((d) => d.id !== directionId))
      })
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  }

  if (directions.length === 0 && standaloneCourses.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">我的学习计划</h1>
        <div className="rounded-xl border bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">还没有学习计划</h3>
          <p className="mb-6 text-gray-500">添加学习方向或课程，开始你的学习之旅</p>
          <Link
            to="/paths"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            选择学习方向 <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的学习计划</h1>
        <Link
          to="/paths"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          添加方向 <Plus className="h-4 w-4" />
        </Link>
      </div>

      {directions.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">学习方向</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((dir) => (
              <div key={dir.id} className="relative">
                <StudyPlanDirectionCard data={dir} />
                <button
                  onClick={() => handleRemoveDirection(dir.id)}
                  className="absolute right-2 top-2 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {standaloneCourses.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">单独课程</h2>
          <div className="space-y-2">
            {standaloneCourses.map((course) => (
              <StudyPlanCourseCard
                key={course.id}
                data={course}
                onRemove={() => handleRemoveCourse(course.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/MyStudyPlan.tsx frontend/src/components/StudyPlanDirectionCard.tsx frontend/src/components/StudyPlanCourseCard.tsx
git commit -m "feat: 添加我的学习计划页面"
```

---

### Task 4: 前端 — 学习方向页面增强（加入/移除学习计划）

**Files:**
- Modify: `frontend/src/pages/LearningPath.tsx`

- [ ] **Step 1: 修改 LearningPath.tsx 添加学习计划功能**

The LearningPath page currently shows courses in a direction. Add:
1. A button at top to "加入学习计划" / "移除学习计划"
2. Per-course "加入计划" / "已加入" buttons

```tsx
// frontend/src/pages/LearningPath.tsx
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Target, Plus, Check, Play } from "lucide-react"
import { api } from "../api/client"
import { SkillTree } from "../components/SkillTree"

interface PathItem {
  subdirection_id: string
  subdirection_name: string
  course_id: string
  course_title: string
  difficulty: string
  estimated_hours: number
  knowledge_points: number
  prerequisites: string[]
}

interface LearningPathData {
  direction_id: string
  direction_name: string
  total_courses: number
  total_hours: number
  items: PathItem[]
}

export function LearningPath() {
  const { id } = useParams()
  const [pathData, setPathData] = useState<LearningPathData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inPlan, setInPlan] = useState(false)
  const [courseInPlan, setCourseInPlan] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/api/paths/${id}`),
      api.get("/api/studyplan/me"),
    ])
      .then(([pathRes, planRes]) => {
        setPathData(pathRes.data)
        const plan = planRes.data
        setInPlan(plan.directions?.some((d: any) => d.id === id) || false)
        const courseIds = new Set(plan.standalone_courses?.map((c: any) => c.id) || [])
        // Also check courses in direction
        if (pathRes.data?.items) {
          pathRes.data.items.forEach((item: PathItem) => {
            if (courseIds.has(item.course_id)) {
              setCourseInPlan((prev) => new Set([...prev, item.course_id]))
            }
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const toggleDirectionPlan = () => {
    if (!id) return
    const method = inPlan ? "delete" : "post"
    api[method](`/api/studyplan/me/direction/${id}`)
      .then(() => setInPlan(!inPlan))
  }

  const toggleCoursePlan = (courseId: string) => {
    const isAdded = courseInPlan.has(courseId)
    const method = isAdded ? "delete" : "post"
    api[method](`/api/studyplan/me/course/${courseId}`)
      .then(() => {
        if (isAdded) {
          setCourseInPlan((prev) => {
            const next = new Set(prev)
            next.delete(courseId)
            return next
          })
        } else {
          setCourseInPlan((prev) => new Set([...prev, courseId]))
        }
      })
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!pathData) return <div className="flex justify-center py-20 text-gray-400">方向不存在</div>

  const itemsBySub: Record<string, PathItem[]> = {}
  for (const item of pathData.items) {
    if (!itemsBySub[item.subdirection_id]) {
      itemsBySub[item.subdirection_id] = []
    }
    itemsBySub[item.subdirection_id].push(item)
  }

  const firstCourseId = pathData.items[0]?.course_id

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/paths" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> 返回方向列表
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pathData.direction_name}</h1>
          <div className="mt-3 flex gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {pathData.total_courses} 门课程
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" /> {Object.keys(itemsBySub).length} 个模块
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleDirectionPlan}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              inPlan
                ? "border border-green-300 bg-green-50 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {inPlan ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {inPlan ? "已在计划中" : "加入学习计划"}
          </button>
          {firstCourseId && (
            <Link
              to={`/courses/${firstCourseId}`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <Play className="h-4 w-4" /> 开始学习
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">学习路径</h2>
        {Object.entries(itemsBySub).map(([subId, items]) => (
          <div key={subId} className="mb-6">
            <h3 className="mb-3 font-medium text-gray-700">{items[0].subdirection_name}</h3>
            <div className="space-y-2">
              {items.map((item) => {
                const isAdded = courseInPlan.has(item.course_id)
                return (
                  <div
                    key={item.course_id}
                    className="flex items-center justify-between rounded-lg border p-4 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/courses/${item.course_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.course_title}
                      </Link>
                      <span className="text-xs text-gray-400">{item.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{item.knowledge_points} 知识点</span>
                      <button
                        onClick={() => toggleCoursePlan(item.course_id)}
                        className={`rounded-lg p-1.5 text-xs transition ${
                          isAdded
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}
                      >
                        {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <SkillTree directionId={pathData.direction_id} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/LearningPath.tsx
git commit -m "feat: 学习方向页面添加加入学习计划功能"
```

---

### Task 5: 前端 — 路由更新与导航集成

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 添加路由**

```tsx
// frontend/src/App.tsx
// 添加 import:
import { MyStudyPlan } from "./pages/MyStudyPlan"

// 在 NavBar 中添加链接 (在 "学习方向" 后):
<Link to="/my-plan" className="text-sm text-gray-600 hover:text-gray-900">
  我的学习计划
</Link>

// 在 Routes 中添加:
<Route path="/my-plan" element={<MyStudyPlan />} />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: 添加我的学习计划路由和导航"
```

---

### Task 6: 验证与测试

- [ ] **Step 1: TypeScript 编译检查**

```bash
cd frontend
npx tsc -b --noEmit
```

Expected: Only pre-existing errors (client.ts env, Profile.tsx)

- [ ] **Step 2: 手动测试流程**

1. 登录 → 访问 `/my-plan` → 显示空状态
2. 点击"选择学习方向" → 选择方向 → 返回 `/my-plan` 查看方向卡片
3. 访问 `/paths/:id` → 点击"加入学习计划" → 查看按钮变化
4. 在 `/my-plan` 中点击方向卡片 → 跳转到学习方向
5. 在 `/paths/:id` 中点击单门课程旁的 "+" → 单独加入课程
6. 在 `/my-plan` 中点击 "X" 移除课程/方向

- [ ] **Step 3: Commit (if any fixes)**

```bash
git add -A
git commit -m "fix: 修复学习计划相关 bug"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ 我的学习计划页面 - Task 3
- ✅ 学习方向清单 - Task 3
- ✅ 每个方向显示课程统计（已完成/学习中/未学） - Task 2 (API) + Task 3 (UI)
- ✅ 可以进入学习方向 - Task 3
- ✅ 学习方向页面：加入整个方向 - Task 4
- ✅ 学习方向页面：加入单个课程 - Task 4
- ✅ 移除学习时间字段 - Task 1
- ❌ 学习提醒/目标设置 - 用户明确不要
- ❌ 学习时间统计 - 用户明确要删除

**2. Placeholder scan:** No placeholders found. All code is complete.

**3. Type consistency:** 
- `DirectionProgress` interface is consistent between Task 2 API response and Task 3 component props
- `StandaloneCourse` interface is consistent
- API paths use `/api/studyplan/me/...` pattern consistently
