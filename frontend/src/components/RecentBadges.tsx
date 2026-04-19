import { Link } from "react-router-dom"
import { Award, ChevronRight } from "lucide-react"
import { api } from "../api/client"
import { useState, useEffect } from "react"

interface Badge {
  badge_id: string
  name: string
  description: string
  icon: string
  awarded_at: string
}

export function RecentBadges() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/xp/me")
      .then((res) => {
        const badges = res.data.badges || []
        const sorted = badges.sort(
          (a: Badge, b: Badge) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime()
        )
        setEarnedBadges(sorted.slice(0, 4))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (earnedBadges.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">最近成就</h3>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <div className="text-4xl text-gray-300">🏅</div>
          <p className="mt-2 text-sm text-gray-500">完成课程和知识点学习，解锁你的第一个成就吧！</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">最近成就</h3>
        </div>
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
          查看全部 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {earnedBadges.map((badge) => (
          <div
            key={badge.badge_id}
            className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center transition hover:shadow-md"
          >
            <div className="text-3xl">{badge.icon}</div>
            <h4 className="mt-2 text-sm font-medium text-gray-900">{badge.name}</h4>
            <p className="text-xs text-gray-500">{badge.description}</p>
            <p className="mt-1 text-xs text-green-600">
              {new Date(badge.awarded_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
