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
