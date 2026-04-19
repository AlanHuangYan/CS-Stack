import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { api } from "../api/client"
import { ContinueLearning } from "../components/ContinueLearning"
import { DirectionRecommendations } from "../components/DirectionRecommendations"
import { RecentBadges } from "../components/RecentBadges"
import { QuickActions } from "../components/QuickActions"

export function AuthenticatedHome() {
  const [username, setUsername] = useState("")
  const [selectedDirections, setSelectedDirections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/api/users/me"),
    ])
      .then(([userRes]) => {
        setUsername(userRes.data.username)
        setSelectedDirections(userRes.data.selected_directions || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来，{username}！</h1>
          <p className="mt-1 text-gray-500">每天进步一点点，成为更好的自己</p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          仪表板 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <ContinueLearning />
          <DirectionRecommendations selectedDirections={selectedDirections} />
          <RecentBadges />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
