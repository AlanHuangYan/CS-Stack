import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Target, Plus, Check, Play } from "lucide-react"
import { api } from "../api/client"
import { SkillTree } from "../components/SkillTree"

interface PathItem {
  subdirection_id: string
  subdirection_name: string
  course_id: string
  course_title: string
  difficulty: string
  prerequisites: string[]
}

interface LearningPathData {
  direction_id: string
  direction_name: string
  total_courses: number
  items: PathItem[]
}

export function LearningPath() {
  const { id } = useParams()
  const [pathData, setPathData] = useState<LearningPathData | null>(null)
  const [loading, setLoading] = useState(true)
  const [directionInPlan, setDirectionInPlan] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/api/paths/${id}`),
      api.get("/api/studyplan/me"),
    ])
      .then(([pathRes, planRes]) => {
        setPathData(pathRes.data)
        const plan = planRes.data
        setDirectionInPlan(plan.directions?.some((d: any) => d.id === id) || false)
      })
      .finally(() => setLoading(false))
  }, [id])

  const toggleDirectionPlan = () => {
    if (!id) return
    const method = directionInPlan ? "delete" : "post"
    api[method](`/api/studyplan/me/direction/${id}`)
      .then(() => {
        setDirectionInPlan(!directionInPlan)
      })
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!pathData) return <div className="flex justify-center py-20 text-gray-400">方向不存在</div>

  const firstCourseId = pathData.items[0]?.course_id

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/paths" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> 返回方向列表
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pathData.direction_name}</h1>
          <div className="mt-3 flex gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {pathData.total_courses} 门课程
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" /> {new Set(pathData.items.map(i => i.subdirection_id)).size} 个模块
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleDirectionPlan}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              directionInPlan
                ? "border border-green-300 bg-green-50 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {directionInPlan ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {directionInPlan ? "整个方向已在计划中" : "整个方向加入计划"}
          </button>
          {firstCourseId && (
            <Link
              to={`/courses/${firstCourseId}`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <Play className="h-4 w-4" /> 开始学习
            </Link>
          )}
        </div>
      </div>

      <SkillTree 
        directionId={pathData.direction_id} 
        directionInPlan={directionInPlan}
        onToggleDirectionPlan={toggleDirectionPlan}
      />
    </div>
  )
}
