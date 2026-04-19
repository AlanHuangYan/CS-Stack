import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { api } from "../api/client"
import { Course } from "../types"
import { KnowledgePointSection } from "../components/KnowledgePointSection"

export function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<{
    status: string
    completed_knowledge: string[]
  }>({ status: "not_started", completed_knowledge: [] })
  const token = localStorage.getItem("token")

  const fetchCourse = () => {
    setLoading(true)
    api
      .get(`/api/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }

  const fetchProgress = () => {
    if (!token) return
    api
      .get("/api/users/me/progress")
      .then((res) => {
        const p = res.data[id!]
        if (p) setProgress(p)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchCourse()
    fetchProgress()
  }, [id, token])

  const toggleKnowledge = (name: string) => {
    const completed = progress.completed_knowledge.includes(name)
      ? progress.completed_knowledge.filter((n: string) => n !== name)
      : [...progress.completed_knowledge, name]

    const newProgress = {
      ...progress,
      completed_knowledge: completed,
      status: completed.length > 0 ? "in_progress" : "not_started",
    }

    if (course) {
      const totalPoints =
        course.knowledge_points.core.length +
        course.knowledge_points.important.length +
        course.knowledge_points.extended.length
      if (completed.length >= totalPoints) {
        newProgress.status = "completed"
      }
    }

    setProgress(newProgress)

    if (token) {
      api.put(`/api/users/me/progress/${id}`, newProgress).catch(() => {})
    }
  }

  const handleStatusChange = (status: string) => {
    const newProgress = {
      ...progress,
      status,
    }
    setProgress(newProgress)
    if (token) {
      api.put(`/api/users/me/progress/${id}`, newProgress).catch(() => {})
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!course) return <div className="flex justify-center py-20 text-gray-400">课程不存在</div>

  const STATUS_LABELS: Record<string, string> = {
    not_started: "未开始",
    in_progress: "学习中",
    completed: "已完成",
  }

  const totalPoints =
    course.knowledge_points.core.length +
    course.knowledge_points.important.length +
    course.knowledge_points.extended.length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>难度: {course.difficulty}</span>
        </div>
        {course.prerequisites.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">前置课程: {course.prerequisites.join(", ")}</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-gray-700">学习状态</h3>
        <div className="flex gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                progress.status === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!token && <p className="mt-2 text-xs text-orange-500">请先登录以保存进度</p>}
      </div>

      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm text-gray-500">
          <span>知识点进度</span>
          <span>
            {progress.completed_knowledge.length} / {totalPoints}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{
              width: `${((progress.completed_knowledge.length / totalPoints) * 100) || 0}%`,
            }}
          />
        </div>
      </div>

      <KnowledgePointSection
        points={course.knowledge_points}
        completed={progress.completed_knowledge}
        onToggle={toggleKnowledge}
      />

      {course.resources.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-medium text-gray-700">学习资源</h3>
          <ul className="space-y-2">
            {course.resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {r.title || r.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
