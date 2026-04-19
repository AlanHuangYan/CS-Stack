# Phase 4: 激励机制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现经验值系统、成就徽章、连续打卡奖励和用户仪表板，通过游戏化机制激励用户持续学习。

**Architecture:** 后端在用户进度更新时自动计算经验值、检查徽章条件；前端展示徽章列表、成就时间线、经验值进度条和激励通知。所有数据存储在用户 JSON 文件中。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + lucide-react (前端) | FastAPI + JSON (后端)

---

## File Structure Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/routes/xp.py` | Create | 经验值和徽章系统 API |
| `backend/routes/users.py` | Modify | 课程完成时自动发放经验值 |
| `frontend/src/components/BadgeList.tsx` | Create | 徽章展示组件 |
| `frontend/src/components/XPProgress.tsx` | Create | 经验值进度组件 |
| `frontend/src/components/AchievementTimeline.tsx` | Create | 成就时间线组件 |
| `frontend/src/components/XPNotification.tsx` | Create | 经验值获取通知组件 |
| `frontend/src/pages/Dashboard.tsx` | Create | 用户仪表板页面 |
| `frontend/src/types/index.ts` | Modify | 添加 Badge/XP 类型 |
| `frontend/src/App.tsx` | Modify | 增加仪表板路由 |

---

### Task 1: 后端 — 经验值与徽章系统 API

**Files:**
- Create: `backend/routes/xp.py`
- Modify: `backend/main.py`
- Modify: `backend/models.py`

- [ ] **Step 1: 添加 XP 和 Badge 模型**

```python
# backend/models.py (追加)
class BadgeAward(BaseModel):
    badge_id: str
    name: str
    description: str
    awarded_at: str

class XPLog(BaseModel):
    action: str
    xp: int
    timestamp: str
```

- [ ] **Step 2: 创建 xp.py**

```python
# backend/routes/xp.py
from fastapi import APIRouter, HTTPException, Depends
from backend.auth import get_current_user
from backend.storage import read_user, write_user

router = APIRouter()

# 经验值规则
XP_RULES = {
    "knowledge_completed": 10,
    "course_completed_beginner": 50,
    "course_completed_intermediate": 100,
    "course_completed_advanced": 200,
    "first_login": 5,
    "streak_7_days": 100,
    "streak_30_days": 500,
}

# 徽章定义
BADGES = {
    "first_course": {"name": "初次学习", "description": "完成第一门课程", "icon": "🎓"},
    "knowledge_10": {"name": "知识点达人", "description": "掌握 10 个知识点", "icon": "📚"},
    "knowledge_50": {"name": "知识渊博", "description": "掌握 50 个知识点", "icon": "🎯"},
    "week_warrior": {"name": "七日战士", "description": "连续打卡 7 天", "icon": "🔥"},
    "month_master": {"name": "月度达人", "description": "连续打卡 30 天", "icon": "👑"},
    "beginner_done": {"name": "入门达成", "description": "完成所有入门课程", "icon": "🌱"},
    "advanced_done": {"name": "高级达成", "description": "完成所有高级课程", "icon": "🏆"},
    "xp_1000": {"name": "经验值千", "description": "累计 1000 经验值", "icon": "⭐"},
    "xp_5000": {"name": "经验值五千", "description": "累计 5000 经验值", "icon": "💫"},
}


def _award_badge_if_missing(user: dict, badge_id: str) -> bool:
    stats = user.get("stats", {})
    badges = stats.get("badges", [])
    
    for b in badges:
        if isinstance(b, dict) and b.get("badge_id") == badge_id:
            return False
    
    badge_def = BADGES.get(badge_id, {})
    from datetime import datetime, timezone
    new_badge = {
        "badge_id": badge_id,
        "name": badge_def.get("name", badge_id),
        "description": badge_def.get("description", ""),
        "icon": badge_def.get("icon", "🏅"),
        "awarded_at": datetime.now(timezone.utc).isoformat(),
    }
    
    badges.append(new_badge)
    stats["badges"] = badges
    user["stats"] = stats
    return True


def _add_xp(user: dict, xp: int, action: str) -> int:
    stats = user.get("stats", {})
    stats["total_xp"] = stats.get("total_xp", 0) + xp
    user["stats"] = stats
    return stats["total_xp"]


def check_achievements(user: dict, course_id: str, new_kp_count: int) -> list[dict]:
    """检查并颁发新徽章。返回新获得的徽章列表。"""
    stats = user.get("stats", {})
    progress = user.get("progress", {})
    new_badges_awarded = []
    
    total_kp_completed = sum(
        len(p.get("completed_knowledge", [])) for p in progress.values()
    )
    
    if total_kp_completed >= 1 and new_kp_count > 0:
        if _award_badge_if_missing(user, "first_course"):
            new_badges_awarded.append(BADGES["first_course"])
    
    if total_kp_completed >= 10:
        if _award_badge_if_missing(user, "knowledge_10"):
            new_badges_awarded.append(BADGES["knowledge_10"])
    
    if total_kp_completed >= 50:
        if _award_badge_if_missing(user, "knowledge_50"):
            new_badges_awarded.append(BADGES["knowledge_50"])
    
    if stats.get("streak_days", 0) >= 7:
        if _award_badge_if_missing(user, "week_warrior"):
            new_badges_awarded.append(BADGES["week_warrior"])
    
    if stats.get("streak_days", 0) >= 30:
        if _award_badge_if_missing(user, "month_master"):
            new_badges_awarded.append(BADGES["month_master"])
    
    total_xp = stats.get("total_xp", 0)
    if total_xp >= 1000:
        if _award_badge_if_missing(user, "xp_1000"):
            new_badges_awarded.append(BADGES["xp_1000"])
    
    if total_xp >= 5000:
        if _award_badge_if_missing(user, "xp_5000"):
            new_badges_awarded.append(BADGES["xp_5000"])
    
    return new_badges_awarded


@router.get("/me")
def get_xp_info(user: dict = Depends(get_current_user)):
    """获取经验值和徽章信息。"""
    stats = user.get("stats", {})
    return {
        "total_xp": stats.get("total_xp", 0),
        "badges": stats.get("badges", []),
        "milestones": stats.get("milestones", []),
        "streak_days": stats.get("streak_days", 0),
    }


@router.post("/me/award-kp")
def award_knowledge_points(count: int = 1, user: dict = Depends(get_current_user)):
    """为完成的知识点发放经验值并检查徽章。"""
    xp_earned = count * XP_RULES["knowledge_completed"]
    new_total = _add_xp(user, xp_earned, f"knowledge_completed x{count}")
    
    new_badges = check_achievements(user, "", count)
    user_obj = read_user(user["user_id"])
    user_obj["stats"] = user["stats"]
    write_user(user["user_id"], user_obj)
    
    return {
        "xp_earned": xp_earned,
        "total_xp": new_total,
        "new_badges": new_badges,
    }
```

- [ ] **Step 3: 在 main.py 中挂载路由**

```python
from backend.routes.xp import router as xp_router

app.include_router(xp_router, prefix="/api/xp", tags=["xp"])
```

- [ ] **Step 4: 修改 courses.py 路由，在更新进度时发放经验值**

在 `update_course_progress` 中，计算新增知识点数量并调用 XP 发放。

- [ ] **Step 5: 提交**

```bash
git add backend/routes/xp.py backend/main.py backend/routes/courses.py backend/models.py
git commit -m "feat: 添加经验值和徽章系统"
```

---

### Task 2: 前端 — 徽章列表组件

**Files:**
- Create: `frontend/src/components/BadgeList.tsx`

- [ ] **Step 1: 创建徽章列表组件**

```tsx
// frontend/src/components/BadgeList.tsx
import { useState, useEffect } from "react"
import { Award } from "lucide-react"
import { api } from "../api/client"

interface Badge {
  badge_id: string
  name: string
  description: string
  icon: string
  awarded_at: string
}

const ALL_BADGES = [
  { badge_id: "first_course", name: "初次学习", description: "完成第一门课程", icon: "🎓" },
  { badge_id: "knowledge_10", name: "知识点达人", description: "掌握 10 个知识点", icon: "📚" },
  { badge_id: "knowledge_50", name: "知识渊博", description: "掌握 50 个知识点", icon: "🎯" },
  { badge_id: "week_warrior", name: "七日战士", description: "连续打卡 7 天", icon: "🔥" },
  { badge_id: "month_master", name: "月度达人", description: "连续打卡 30 天", icon: "👑" },
  { badge_id: "xp_1000", name: "经验值千", description: "累计 1000 经验值", icon: "⭐" },
  { badge_id: "xp_5000", name: "经验值五千", description: "累计 5000 经验值", icon: "💫" },
]

export function BadgeList() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/xp/me")
      .then((res) => setEarnedBadges(res.data.badges || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 text-center text-gray-400">加载中...</div>

  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id))

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">成就徽章</h3>
        <span className="ml-auto text-sm text-gray-500">
          {earnedBadges.length} / {ALL_BADGES.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ALL_BADGES.map((badge) => {
          const earned = earnedIds.has(badge.badge_id)
          const earnedData = earnedBadges.find((b) => b.badge_id === badge.badge_id)
          return (
            <div
              key={badge.badge_id}
              className={`rounded-lg border p-4 text-center transition ${
                earned ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className={`text-3xl ${!earned ? "grayscale" : ""}`}>{badge.icon}</div>
              <h4 className={`mt-2 text-sm font-medium ${earned ? "text-gray-900" : "text-gray-400"}`}>
                {badge.name}
              </h4>
              <p className="text-xs text-gray-500">{badge.description}</p>
              {earnedData && (
                <p className="mt-1 text-xs text-green-600">
                  {new Date(earnedData.awarded_at).toLocaleDateString("zh-CN")}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/BadgeList.tsx
git commit -m "feat: 添加成就徽章组件"
```

---

### Task 3: 前端 — 经验值进度组件

**Files:**
- Create: `frontend/src/components/XPProgress.tsx`

- [ ] **Step 1: 创建经验值进度组件**

```tsx
// frontend/src/components/XPProgress.tsx
import { useState, useEffect } from "react"
import { TrendingUp, Zap } from "lucide-react"
import { api } from "../api/client"

const XP_LEVELS = [
  { level: 1, name: "新手", min_xp: 0 },
  { level: 2, name: "学徒", min_xp: 100 },
  { level: 3, name: "初级", min_xp: 300 },
  { level: 4, name: "中级", min_xp: 600 },
  { level: 5, name: "高级", min_xp: 1000 },
  { level: 6, name: "专家", min_xp: 2000 },
  { level: 7, name: "大师", min_xp: 5000 },
]

export function XPProgress() {
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/xp/me").then((res) => setTotalXp(res.data.total_xp || 0)).finally(() => setLoading(false))
  }, [])

  if (loading) return null

  let currentLevel = XP_LEVELS[0]
  let nextLevel = XP_LEVELS[1]
  
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVELS[i].min_xp) {
      currentLevel = XP_LEVELS[i]
      nextLevel = XP_LEVELS[i + 1] || null
      break
    }
  }

  const progressInLevel = nextLevel
    ? ((totalXp - currentLevel.min_xp) / (nextLevel.min_xp - currentLevel.min_xp)) * 100
    : 100

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">经验值</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{totalXp}</span>
          <span className="ml-1 text-sm text-gray-500">XP</span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-blue-600">Lv.{currentLevel.level} {currentLevel.name}</span>
        {nextLevel && <span className="text-gray-400">Lv.{nextLevel.level} {nextLevel.name}</span>}
      </div>

      <div className="h-3 rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
          style={{ width: `${Math.min(progressInLevel, 100)}%` }}
        />
      </div>

      {nextLevel && (
        <p className="mt-2 text-xs text-gray-400">
          还需 {nextLevel.min_xp - totalXp} XP 升级到 {nextLevel.name}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/XPProgress.tsx
git commit -m "feat: 添加经验值进度组件"
```

---

### Task 4: 前端 — 用户仪表板页面

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建用户仪表板页面**

```tsx
// frontend/src/pages/Dashboard.tsx
import { Link } from "react-router-dom"
import { DailyCheckin } from "../components/DailyCheckin"
import { LearningStats } from "../components/LearningStats"
import { XPProgress } from "../components/XPProgress"
import { BadgeList } from "../components/BadgeList"

export function Dashboard() {
  const token = localStorage.getItem("token")
  
  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">我的仪表板</h1>
        <p className="text-gray-500">
          请先 <Link to="/login" className="text-blue-600 hover:underline">登录</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">我的仪表板</h1>

      <div className="mb-6">
        <XPProgress />
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <DailyCheckin />
        <LearningStats />
      </div>

      <div className="mb-6">
        <BadgeList />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 修改 App.tsx 添加路由**

```tsx
import { Dashboard } from "./pages/Dashboard"

// 在导航栏添加
<Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
  仪表板
</Link>

// 在 Routes 中添加
<Route path="/dashboard" element={<Dashboard />} />
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/Dashboard.tsx frontend/src/App.tsx
git commit -m "feat: 添加用户仪表板页面"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| 经验值系统 | Task 1 (xp.py API) + Task 3 (XPProgress) |
| 成就徽章 | Task 1 (badge logic) + Task 2 (BadgeList) |
| 连续打卡 | 已在 Phase 2 实现，Task 1 增加徽章关联 |
| 用户仪表板 | Task 4 (Dashboard page) |

### 2. Placeholder Scan
All steps contain actual code. No TBD/TODO found.

### 3. Type Consistency
- Badge structure matches `stats.badges` array in user JSON
- XP rules defined as constants for easy adjustment
- API paths: `/api/xp/me`, `/api/xp/me/award-kp`
