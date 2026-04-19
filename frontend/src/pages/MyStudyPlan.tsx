import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, BookOpen, X } from "lucide-react"
import { api } from "../api/client"
import { StudyPlanDirectionCard } from "../components/StudyPlanDirectionCard"
import { StudyPlanCourseCard } from "../components/StudyPlanCourseCard"
import { ConfirmDialog } from "../components/ConfirmDialog"

interface DirectionProgress {
  id: string
  name: string
  icon: string
  total_courses: number
  completed: number
  in_progress: number
  not_started: number
  progress_percent: number
}

interface StandaloneCourse {
  id: string
  title: string
  difficulty: string
  status: string
}

interface RemoveConfirm {
  type: "direction" | "course"
  id: string
  name: string
}

export function MyStudyPlan() {
  const [directions, setDirections] = useState<DirectionProgress[]>([])
  const [standaloneCourses, setStandaloneCourses] = useState<StandaloneCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<RemoveConfirm | null>(null)

  const fetchPlan = () => {
    setLoading(true)
    api.get("/api/studyplan/me")
      .then((res) => {
        setDirections(res.data.directions || [])
        setStandaloneCourses(res.data.standalone_courses || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  const handleRemoveCourse = (courseId: string) => {
    api.delete(`/api/studyplan/me/course/${courseId}`)
      .then(() => {
        setStandaloneCourses((prev) => prev.filter((c) => c.id !== courseId))
      })
  }

  const handleRemoveDirection = (directionId: string) => {
    api.delete(`/api/studyplan/me/direction/${directionId}`)
      .then(() => {
        setDirections((prev) => prev.filter((d) => d.id !== directionId))
      })
  }

  const requestRemoveDirection = (dir: DirectionProgress) => {
    setConfirm({ type: "direction", id: dir.id, name: dir.name })
  }

  const requestRemoveCourse = (course: StandaloneCourse) => {
    setConfirm({ type: "course", id: course.id, name: course.title })
  }

  const executeRemove = () => {
    if (!confirm) return
    if (confirm.type === "direction") {
      handleRemoveDirection(confirm.id)
    } else {
      handleRemoveCourse(confirm.id)
    }
  }

  const getWarning = (): string | undefined => {
    if (!confirm) return undefined
    if (confirm.type === "direction") {
      const dir = directions.find((d) => d.id === confirm.id)
      if (dir && dir.completed > 0) {
        return `该方向有 ${dir.completed} 门课程已完成。移除学习计划不会删除你的学习进度。`
      }
    } else {
      const course = standaloneCourses.find((c) => c.id === confirm.id)
      if (course && course.status === "completed") {
        return "该课程已完成。移除学习计划不会删除你的学习进度。"
      }
    }
    return undefined
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  }

  if (directions.length === 0 && standaloneCourses.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">我的学习计划</h1>
        <div className="rounded-xl border bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">还没有学习计划</h3>
          <p className="mb-6 text-gray-500">添加学习方向或课程，开始你的学习之旅</p>
          <Link
            to="/paths"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            选择学习方向 <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的学习计划</h1>
        <Link
          to="/paths"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          添加方向 <Plus className="h-4 w-4" />
        </Link>
      </div>

      {directions.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">学习方向</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((dir) => (
              <div key={dir.id} className="relative">
                <StudyPlanDirectionCard data={dir} />
                <button
                  onClick={() => requestRemoveDirection(dir)}
                  className="absolute right-2 top-2 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {standaloneCourses.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">单独课程</h2>
          <div className="space-y-2">
            {standaloneCourses.map((course) => (
              <StudyPlanCourseCard
                key={course.id}
                data={course}
                onRemove={() => requestRemoveCourse(course)}
              />
            ))}
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          title={confirm.type === "direction" ? "移除学习方向" : "移除课程"}
          message={`确定要从学习计划中移除「${confirm.name}」吗？`}
          warning={getWarning()}
          onConfirm={executeRemove}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
