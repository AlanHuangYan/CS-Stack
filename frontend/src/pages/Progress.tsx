import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../api/client"
import { CourseProgress } from "../types"
import { DailyCheckin } from "../components/DailyCheckin"
import { LearningStats } from "../components/LearningStats"
import { RecommendationSection } from "../components/RecommendationSection"

const STATUS_LABELS: Record<string, string> = {
  not_started: "未开始",
  in_progress: "学习中",
  completed: "已完成",
}

const STATUS_COLORS: Record<string, string> = {
  not_started: "text-gray-400",
  in_progress: "text-blue-600",
  completed: "text-green-600",
}

export function Progress() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get("/api/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setError("获取用户信息失败"))
      .finally(() => setLoading(false))
  }, [])

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">学习进度</h1>
        <p className="text-gray-500">
          请先 <Link to="/login" className="text-blue-600 hover:underline">登录</Link> 查看学习进度
        </p>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (error) return <div className="flex justify-center py-20 text-red-400">{error}</div>
  if (!user) return <div className="flex justify-center py-20 text-gray-400">用户不存在</div>

  const progress = user.progress || {}
  const courseIds = Object.keys(progress)
  const completedCount = courseIds.filter((id) => progress[id].status === "completed").length
  const inProgressCount = courseIds.filter((id) => progress[id].status === "in_progress").length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">学习进度</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <DailyCheckin />
        <LearningStats />
      </div>

      <RecommendationSection directionId="frontend" title="为你推荐 - 前端开发" />

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">我的课程</h2>
        {courseIds.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-gray-400">
            还没有开始学习，去{" "}
            <Link to="/courses" className="text-blue-600 hover:underline">
              课程库
            </Link>{" "}
            选择课程吧
          </div>
        ) : (
          <div className="space-y-3">
            {courseIds.map((courseId) => {
              const p: CourseProgress = progress[courseId]
              return (
                <div key={courseId} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Link to={`/courses/${courseId}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {courseId}
                    </Link>
                  </div>
                  <span className={`text-sm font-medium ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
