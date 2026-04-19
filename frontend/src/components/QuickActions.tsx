import { Link } from "react-router-dom"
import { BookOpen, LayoutDashboard, Compass, Trophy, Zap, Award } from "lucide-react"
import { api } from "../api/client"
import { useState, useEffect } from "react"

interface UserStats {
  total_xp: number
  streak_days: number
  badges: any[]
}

const QUICK_ACTIONS = [
  {
    icon: BookOpen,
    title: "继续学习",
    description: "回到上次学习的课程",
    to: "/courses",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: Compass,
    title: "学习方向",
    description: "浏览所有学习路径",
    to: "/paths",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    icon: LayoutDashboard,
    title: "仪表板",
    description: "查看详细学习统计",
    to: "/dashboard",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    icon: Trophy,
    title: "成就徽章",
    description: "查看已获得的徽章",
    to: "/dashboard",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
]

export function QuickActions() {
  const [stats, setStats] = useState<UserStats>({
    total_xp: 0,
    streak_days: 0,
    badges: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/xp/me")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">快速入口</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className={`group flex flex-col items-center rounded-lg border p-4 text-center transition hover:shadow-md ${action.color}`}
          >
            <action.icon className="mb-2 h-8 w-8" />
            <h4 className="text-sm font-medium">{action.title}</h4>
            <p className="mt-1 text-xs opacity-75">{action.description}</p>
          </Link>
        ))}
      </div>

      {stats.total_xp > 0 || stats.streak_days > 0 ? (
        <div className="mt-4 flex items-center gap-4 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex items-center gap-1 text-blue-600">
            <Zap className="h-4 w-4" />
            <span className="font-medium">{stats.total_xp} XP</span>
          </div>
          {stats.streak_days > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <span>🔥</span>
              <span className="font-medium">{stats.streak_days} 天</span>
            </div>
          )}
          {stats.badges.length > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Award className="h-4 w-4" />
              <span className="font-medium">{stats.badges.length} 徽章</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
