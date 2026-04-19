import { useState, useEffect } from "react"
import { BookOpen, GitBranch, Layout, TrendingUp } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.get("/api/admin/stats").then((res) => setStats(res.data))
  }, [])

  const cards = stats
    ? [
        { icon: BookOpen, label: "课程总数", value: stats.total_courses, color: "text-blue-600" },
        { icon: Layout, label: "方向数", value: stats.total_directions, color: "text-green-600" },
        { icon: GitBranch, label: "子方向数", value: stats.total_subdirections, color: "text-purple-600" },
        { icon: TrendingUp, label: "入门课程", value: stats.by_difficulty?.beginner || 0, color: "text-yellow-600" },
      ]
    : []

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">管理仪表板</h1>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-white p-5">
              <card.icon className={`mb-2 h-6 w-6 ${card.color}`} />
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
