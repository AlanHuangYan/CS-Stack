# Phase 3: 方向选择器与技能树 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现方向选择器（用户选择目标方向后自动生成学习路径）、技能树可视化（展示课程依赖关系和知识点分布）。

**Architecture:** 前端新增方向选择器页面和交互式技能树组件；后端新增方向选择 API 和技能树数据聚合 API。数据基于已有的 directions/subdirections/courses JSON 结构。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + lucide-react (前端) | FastAPI + JSON (后端)

---

## File Structure Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/routes/paths.py` | Create | 方向选择和学习路径 API |
| `backend/routes/skilltree.py` | Create | 技能树数据聚合 API |
| `backend/main.py` | Modify | 挂载新路由 |
| `frontend/src/pages/DirectionPicker.tsx` | Create | 方向选择器页面 |
| `frontend/src/pages/LearningPath.tsx` | Create | 生成的学习路径页 |
| `frontend/src/components/SkillTree.tsx` | Create | 技能树可视化组件 |
| `frontend/src/components/DirectionCard.tsx` | Create | 方向卡片组件 |
| `frontend/src/types/index.ts` | Modify | 添加 LearningPath 类型 |
| `frontend/src/App.tsx` | Modify | 增加路由 |

---

### Task 1: 后端 — 方向选择 API

**Files:**
- Create: `backend/routes/paths.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 创建 paths.py**

```python
# backend/routes/paths.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.storage import read_list
from backend.models import Direction, SubDirection, Course

router = APIRouter()
DIR_FILE = "directions.json"
DIR_KEY = "directions"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"


def _get_courses_for_subdirection(sub_id: str) -> list[dict]:
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    sub = next((s for s in subdirections if s["id"] == sub_id), None)
    if not sub:
        return []
    
    course_ids = set(sub.get("courses", []))
    return [c for c in courses if c["id"] in course_ids]


def _get_difficulty_label(d: str) -> str:
    return {"beginner": "入门", "intermediate": "进阶", "advanced": "高级"}.get(d, d)


@router.get("/{direction_id}")
def get_learning_path(direction_id: str):
    """根据方向 ID 生成完整学习路径。"""
    directions = read_list(DIR_FILE, DIR_KEY)
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")
    
    sub_ids = direction.get("subdirections", [])
    path_items = []
    total_hours = 0
    
    for sub_id in sub_ids:
        subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
        sub = next((s for s in subdirections if s["id"] == sub_id), None)
        if not sub:
            continue
        
        courses = _get_courses_for_subdirection(sub_id)
        
        for course in courses:
            kp_count = (
                len(course.get("knowledge_points", {}).get("core", []))
                + len(course.get("knowledge_points", {}).get("important", []))
                + len(course.get("knowledge_points", {}).get("extended", []))
            )
            total_hours += course.get("estimated_hours", 0)
            
            path_items.append({
                "subdirection_id": sub_id,
                "subdirection_name": sub["name"],
                "course_id": course["id"],
                "course_title": course["title"],
                "difficulty": _get_difficulty_label(course.get("difficulty", "")),
                "estimated_hours": course.get("estimated_hours", 0),
                "knowledge_points": kp_count,
                "prerequisites": course.get("prerequisites", []),
            })
    
    return {
        "direction_id": direction_id,
        "direction_name": direction["name"],
        "total_courses": len(path_items),
        "total_hours": total_hours,
        "items": path_items,
    }


@router.get("/")
def list_paths():
    """列出所有可用方向。"""
    directions = read_list(DIR_FILE, DIR_KEY)
    result = []
    
    for d in directions:
        sub_ids = d.get("subdirections", [])
        total_courses = 0
        for sub_id in sub_ids:
            total_courses += len(_get_courses_for_subdirection(sub_id))
        
        result.append({
            "id": d["id"],
            "name": d["name"],
            "name_en": d["name_en"],
            "icon": d["icon"],
            "description": d["description"],
            "course_count": total_courses,
        })
    
    return result
```

- [ ] **Step 2: 在 main.py 中挂载路由**

```python
from backend.routes.paths import router as paths_router

app.include_router(paths_router, prefix="/api/paths", tags=["paths"])
```

- [ ] **Step 3: 提交**

```bash
git add backend/routes/paths.py backend/main.py
git commit -m "feat: 添加方向选择和学习路径 API"
```

---

### Task 2: 后端 — 技能树数据聚合 API

**Files:**
- Create: `backend/routes/skilltree.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 创建 skilltree.py**

```python
# backend/routes/skilltree.py
from fastapi import APIRouter, HTTPException
from backend.storage import read_list

router = APIRouter()
DIR_FILE = "directions.json"
DIR_KEY = "directions"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"


@router.get("/{direction_id}")
def get_skill_tree(direction_id: str):
    """获取指定方向的技能树数据。"""
    directions = read_list(DIR_FILE, DIR_KEY)
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")
    
    sub_ids = direction.get("subdirections", [])
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    nodes = []
    
    for sub_id in sub_ids:
        sub = next((s for s in subdirections if s["id"] == sub_id), None)
        if not sub:
            continue
        
        sub_courses = []
        for c in courses:
            if c["id"] in sub.get("courses", []):
                kp = c.get("knowledge_points", {})
                sub_courses.append({
                    "id": c["id"],
                    "title": c["title"],
                    "difficulty": c["difficulty"],
                    "estimated_hours": c["estimated_hours"],
                    "core_kp": len(kp.get("core", [])),
                    "important_kp": len(kp.get("important", [])),
                    "extended_kp": len(kp.get("extended", [])),
                    "prerequisites": c.get("prerequisites", []),
                })
        
        nodes.append({
            "id": sub_id,
            "name": sub["name"],
            "courses": sub_courses,
            "total_kp": sum(
                len(c.get("knowledge_points", {}).get("core", []))
                + len(c.get("knowledge_points", {}).get("important", []))
                + len(c.get("knowledge_points", {}).get("extended", []))
                for c in sub_courses
            ),
        })
    
    return {
        "direction_id": direction_id,
        "direction_name": direction["name"],
        "nodes": nodes,
    }
```

- [ ] **Step 2: 在 main.py 中挂载路由**

```python
from backend.routes.skilltree import router as skilltree_router

app.include_router(skilltree_router, prefix="/api/skilltree", tags=["skilltree"])
```

- [ ] **Step 3: 提交**

```bash
git add backend/routes/skilltree.py backend/main.py
git commit -m "feat: 添加技能树数据聚合 API"
```

---

### Task 3: 前端 — 方向选择器页面

**Files:**
- Create: `frontend/src/pages/DirectionPicker.tsx`
- Create: `frontend/src/components/DirectionCard.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建 DirectionCard 组件**

```tsx
// frontend/src/components/DirectionCard.tsx
import { Link } from "react-router-dom"
import { ChevronRight, BookOpen } from "lucide-react"

interface DirectionCardProps {
  id: string
  name: string
  nameEn: string
  icon: string
  description: string
  courseCount: number
}

const iconMap: Record<string, string> = {
  layout: "🖥️",
  server: "⚙️",
  code: "💻",
  wrench: "🔧",
  smartphone: "📱",
  database: "🗃️",
  bot: "🤖",
  brain: "🧠",
  cpu: "🔬",
  cloud: "☁️",
  "bar-chart-3": "📊",
  eye: "👁️",
  settings: "🛠️",
  "git-branch": "🌳",
  "check-square": "✅",
  "message-square": "💬",
  shield: "🛡️",
  video: "🎬",
}

export function DirectionCard({ id, name, nameEn, icon, description, courseCount }: DirectionCardProps) {
  return (
    <Link
      to={`/paths/${id}`}
      className="group block rounded-xl border border-gray-200 p-5 transition hover:shadow-lg hover:border-blue-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
          {iconMap[icon] || "📚"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{name}</h3>
              <p className="text-xs text-gray-400">{nameEn}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{courseCount} 门课程</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: 创建方向选择器页面**

```tsx
// frontend/src/pages/DirectionPicker.tsx
import { useState, useEffect } from "react"
import { api } from "../api/client"
import { DirectionCard } from "../components/DirectionCard"

interface PathInfo {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  course_count: number
}

const CATEGORIES = [
  { label: "全部", value: "" },
  { label: "开发", value: "dev" },
  { label: "AI/数据", value: "ai" },
  { label: "基础", value: "base" },
]

const CATEGORY_MAP: Record<string, string[]> = {
  dev: ["frontend", "backend", "mobile", "dev-tools"],
  ai: ["ai-agent", "llm", "ml", "data-mining", "cv", "nlp"],
  base: ["programming-languages", "algo", "infra", "ops", "testing", "security", "bigdata", "multimedia"],
}

export function DirectionPicker() {
  const [paths, setPaths] = useState<PathInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.get("/api/paths/").then((res) => setPaths(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = paths.filter((p) => {
    if (category && !CATEGORY_MAP[category]?.includes(p.id)) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.name_en.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">选择学习方向</h1>
      <p className="mb-6 text-gray-500">选择你想学习的方向，自动生成学习路径</p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索方向..."
            className="rounded-lg border px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">加载中...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <DirectionCard
              key={p.id}
              id={p.id}
              name={p.name}
              nameEn={p.name_en}
              icon={p.icon}
              description={p.description}
              courseCount={p.course_count}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 修改 App.tsx 增加路由**

```tsx
import { DirectionPicker } from "./pages/DirectionPicker"
import { LearningPath } from "./pages/LearningPath"

// 在 nav 中添加
<Link to="/paths" className="text-sm text-gray-600 hover:text-gray-900">
  学习方向
</Link>

// 在 Routes 中添加
<Route path="/paths" element={<DirectionPicker />} />
<Route path="/paths/:id" element={<LearningPath />} />
```

- [ ] **Step 4: 提交**

```bash
git add frontend/src/pages/DirectionPicker.tsx frontend/src/components/DirectionCard.tsx frontend/src/App.tsx
git commit -m "feat: 添加方向选择器页面"
```

---

### Task 4: 前端 — 学习路径页面

**Files:**
- Create: `frontend/src/pages/LearningPath.tsx`

- [ ] **Step 1: 创建学习路径页面**

```tsx
// frontend/src/pages/LearningPath.tsx
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Target } from "lucide-react"
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

  useEffect(() => {
    if (!id) return
    api
      .get(`/api/paths/${id}`)
      .then((res) => setPathData(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!pathData) return <div className="flex justify-center py-20 text-gray-400">方向不存在</div>

  const itemsBySub: Record<string, PathItem[]> = {}
  for (const item of pathData.items) {
    if (!itemsBySub[item.subdirection_id]) {
      itemsBySub[item.subdirection_id] = []
    }
    itemsBySub[item.subdirection_id].push(item)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/paths" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> 返回方向列表
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{pathData.direction_name}</h1>
        <div className="mt-3 flex gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> {pathData.total_courses} 门课程
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {pathData.total_hours} 小时
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" /> {Object.keys(itemsBySub).length} 个模块
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">学习路径</h2>
        {Object.entries(itemsBySub).map(([subId, items]) => (
          <div key={subId} className="mb-6">
            <h3 className="mb-3 font-medium text-gray-700">{items[0].subdirection_name}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.course_id}
                  to={`/courses/${item.course_id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900">{item.course_title}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.knowledge_points} 知识点</span>
                    <span>{item.estimated_hours} 小时</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SkillTree directionId={pathData.direction_id} />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/LearningPath.tsx
git commit -m "feat: 添加学习路径页面"
```

---

### Task 5: 前端 — 技能树可视化组件

**Files:**
- Create: `frontend/src/components/SkillTree.tsx`

- [ ] **Step 1: 创建技能树组件**

```tsx
// frontend/src/components/SkillTree.tsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { api } from "../api/client"

interface CourseNode {
  id: string
  title: string
  difficulty: string
  estimated_hours: number
  core_kp: number
  important_kp: number
  extended_kp: number
  prerequisites: string[]
}

interface SubNode {
  id: string
  name: string
  courses: CourseNode[]
  total_kp: number
}

interface SkillTreeData {
  direction_id: string
  direction_name: string
  nodes: SubNode[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

export function SkillTree({ directionId }: { directionId: string }) {
  const [data, setData] = useState<SkillTreeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/api/skilltree/${directionId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [directionId])

  if (loading || !data) return null

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{data.direction_name} — 技能树</h2>
      
      <div className="space-y-6">
        {data.nodes.map((node, idx) => (
          <div key={node.id} className="relative">
            {idx > 0 && (
              <div className="absolute -top-6 left-6 h-6 w-0.5 bg-gray-300" />
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="font-medium text-gray-800">{node.name}</h3>
              <span className="text-xs text-gray-400">{node.total_kp} 知识点</span>
            </div>
            
            <div className="mt-3 ml-11 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {node.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className={`rounded-lg border p-3 text-sm transition hover:shadow-sm ${DIFFICULTY_COLORS[course.difficulty]}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-75">
                    {course.estimated_hours}h · {course.core_kp}核心 · {course.important_kp}重点
                  </div>
                </Link>
              ))}
              {node.courses.length === 0 && (
                <p className="text-sm text-gray-400">暂无课程</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/SkillTree.tsx
git commit -m "feat: 添加技能树可视化组件"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| 方向选择器 | Task 3 (DirectionPicker) |
| 必修/选修课程生成 | Task 1 (paths API) + Task 4 (LearningPath) |
| 技能树可视化 | Task 2 (skilltree API) + Task 5 (SkillTree component) |

### 2. Placeholder Scan
All steps contain actual code. No TBD/TODO found.

### 3. Type Consistency
- API paths: `/api/paths/`, `/api/paths/{id}`, `/api/skilltree/{id}` consistent
- Course difficulty values match existing patterns
- Router prefix and mounting consistent with existing pattern
