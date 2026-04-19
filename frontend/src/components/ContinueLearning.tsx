import { Link } from "react-router-dom"
import { BookOpen, PlayCircle, Clock } from "lucide-react"
import { api } from "../api/client"
import { useState, useEffect } from "react"

interface CourseProgress {
  status: string
  completed_knowledge: string[]
}

interface CourseInfo {
  id: string
  title: string
  difficulty: string
  knowledge_points: {
    core: { name: string }[]
    important: { name: string }[]
    extended: { name: string }[]
  }
}

interface CourseWithProgress {
  id: string
  progress: CourseProgress
  course?: CourseInfo
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "中级",
  advanced: "高级",
}

export function ContinueLearning() {
  const [inProgressCourses, setInProgressCourses] = useState<CourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/users/me")
      .then(async (res) => {
        const progress: Record<string, CourseProgress> = res.data.progress || {}
        const courses: CourseWithProgress[] = Object.entries(progress)
          .filter((entry) => (entry[1] as CourseProgress).status === "in_progress")
          .map(([id, p]) => ({ id, progress: p as CourseProgress }))

        for (const course of courses) {
          try {
            const res = await api.get(`/api/courses/${course.id}`)
            course.course = res.data
          } catch {
            // ignore
          }
        }

        setInProgressCourses(courses.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (inProgressCourses.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">继续学习</h3>
        </div>
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-500">还没有开始学习，去课程库选择一门课程吧</p>
          <Link
            to="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            浏览课程 <PlayCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">继续学习</h3>
        </div>
        <Link to="/progress" className="text-sm text-blue-600 hover:underline">
          查看全部
        </Link>
      </div>

      <div className="space-y-3">
        {inProgressCourses.map(({ id, progress, course }) => {
          const totalKnowledge =
            (course?.knowledge_points.core.length || 0) +
            (course?.knowledge_points.important.length || 0) +
            (course?.knowledge_points.extended.length || 0)
          const completedCount = progress.completed_knowledge.length
          const percentage = totalKnowledge > 0 ? Math.round((completedCount / totalKnowledge) * 100) : 0

          return (
            <Link
              key={id}
              to={`/courses/${id}`}
              className="group block rounded-lg border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {course?.title || id}
                  </h4>
                  <div className="mt-1 text-xs text-gray-500">
                    <span>{DIFFICULTY_LABELS[course?.difficulty || "beginner"]}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">{percentage}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                已掌握 {completedCount}/{totalKnowledge} 个知识点
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
