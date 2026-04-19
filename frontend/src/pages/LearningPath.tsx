import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Target, Plus, Check, Play, Shield } from "lucide-react"
import { api } from "../api/client"
import { SkillTree } from "../components/SkillTree"

interface PathItem {
  subdirection_id: string
  subdirection_name: string
  course_id: string
  course_title: string
  difficulty: string
  knowledge_points: number
  prerequisites: string[]
}

interface LearningPathData {
  direction_id: string
  direction_name: string
  total_courses: number
  total_hours: number
  items: PathItem[]
}

export function LearningPath() {
  const { id } = useParams()
  const [pathData, setPathData] = useState<LearningPathData | null>(null)
  const [loading, setLoading] = useState(true)
  const [directionInPlan, setDirectionInPlan] = useState(false)
  const [standaloneCourses, setStandaloneCourses] = useState<Set<string>>(new Set())

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
        const courseIds = new Set<string>()
        if (pathRes.data?.items) {
          pathRes.data.items.forEach((item: PathItem) => {
            if (plan.standalone_courses?.some((c: any) => c.id === item.course_id)) {
              courseIds.add(item.course_id)
            }
          })
        }
        setStandaloneCourses(courseIds)
      })
      .finally(() => setLoading(false))
  }, [id])

  const toggleDirectionPlan = () => {
    if (!id) return
    const method = directionInPlan ? "delete" : "post"
    api[method](`/api/studyplan/me/direction/${id}`)
      .then(() => {
        setDirectionInPlan(!directionInPlan)
        if (!directionInPlan) {
          setStandaloneCourses(new Set())
        }
      })
  }

  const toggleCoursePlan = (courseId: string) => {
    const isAdded = standaloneCourses.has(courseId)
    const method = isAdded ? "delete" : "post"
    api[method](`/api/studyplan/me/course/${courseId}`)
      .then(() => {
        if (isAdded) {
          setStandaloneCourses((prev) => {
            const next = new Set(prev)
            next.delete(courseId)
            return next
          })
        } else {
          setStandaloneCourses((prev) => new Set([...prev, courseId]))
        }
      })
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!pathData) return <div className="flex justify-center py-20 text-gray-400">方向不存在</div>

  const itemsBySub: Record<string, PathItem[]> = {}
  for (const item of pathData.items) {
    if (!itemsBySub[item.subdirection_id]) {
      itemsBySub[item.subdirection_id] = []
    }
    itemsBySub[item.subdirection_id].push(item)
  }

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
              <Target className="h-4 w-4" /> {Object.keys(itemsBySub).length} 个模块
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

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">学习路径</h2>
        {Object.entries(itemsBySub).map(([subId, items]) => (
          <div key={subId} className="mb-6">
            <h3 className="mb-3 font-medium text-gray-700">{items[0].subdirection_name}</h3>
            <div className="space-y-2">
              {items.map((item) => {
                const isInherited = directionInPlan
                const isStandalone = standaloneCourses.has(item.course_id)
                const isInPlan = isInherited || isStandalone

                return (
                  <div
                    key={item.course_id}
                    className="flex items-center justify-between rounded-lg border p-4 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/courses/${item.course_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.course_title}
                      </Link>
                      <span className="text-xs text-gray-400">{item.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{item.knowledge_points} 知识点</span>
                      <div className="flex items-center gap-1">
                        {isInherited && (
                          <span className="text-xs text-green-500" aria-label="随方向加入计划">
                            <Shield className="h-4 w-4" />
                          </span>
                        )}
                        <button
                          onClick={() => !isInherited && toggleCoursePlan(item.course_id)}
                          disabled={isInherited}
                          className={`rounded-lg p-1.5 text-xs transition ${
                            isInherited
                              ? "cursor-not-allowed text-green-500"
                              : isStandalone
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          }`}
                          title={
                            isInherited
                              ? "随方向加入计划，不可单独移除"
                              : isStandalone
                                ? "从学习计划中移除"
                                : "加入学习计划"
                          }
                        >
                          {isInPlan ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <SkillTree directionId={pathData.direction_id} />
    </div>
  )
}
