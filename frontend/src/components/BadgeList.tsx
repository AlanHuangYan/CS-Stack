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
