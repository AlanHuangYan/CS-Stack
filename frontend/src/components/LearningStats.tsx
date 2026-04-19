import { useState, useEffect } from "react"
import { TrendingUp, BookOpen, Award, Clock } from "lucide-react"
import { api } from "../api/client"

export function LearningStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/users/me/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 text-center text-gray-400">加载中...</div>
  if (!stats) return null

  const statCards = [
    {
      icon: TrendingUp,
      label: "总经验值",
      value: stats.total_xp || 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: BookOpen,
      label: "学习课程",
      value: Object.keys(stats.courses_completed || {}).length,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Award,
      label: "成就徽章",
      value: (stats.badges || []).length,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Clock,
      label: "连续打卡",
      value: `${stats.streak_days || 0}天`,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">学习统计</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-lg ${card.bg} p-4`}>
            <card.icon className={`mb-2 h-6 w-6 ${card.color}`} />
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-600">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
