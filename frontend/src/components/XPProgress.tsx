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
  let nextLevel: typeof XP_LEVELS[0] | null = XP_LEVELS[1]
  
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
