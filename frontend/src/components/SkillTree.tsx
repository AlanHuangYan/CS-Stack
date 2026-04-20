import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Plus, Check, Shield } from "lucide-react"
import { api } from "../api/client"

interface CourseNode {
  id: string
  title: string
  difficulty: string
  prerequisites: string[]
}

interface SubNode {
  id: string
  name: string
  courses: CourseNode[]
}

interface SkillTreeData {
  direction_id: string
  direction_name: string
  nodes: SubNode[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

interface SkillTreeProps {
  directionId: string
  directionInPlan?: boolean
  onToggleDirectionPlan?: () => void
}

export function SkillTree({ directionId, directionInPlan = false, onToggleDirectionPlan }: SkillTreeProps) {
  const [data, setData] = useState<SkillTreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [standaloneCourses, setStandaloneCourses] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      api.get(`/api/skilltree/${directionId}`),
      api.get("/api/studyplan/me"),
    ])
      .then(([treeRes, planRes]) => {
        setData(treeRes.data)
        const plan = planRes.data
        const courseIds = new Set<string>()
        if (treeRes.data?.nodes) {
          treeRes.data.nodes.forEach((node: SubNode) => {
            node.courses.forEach((course: CourseNode) => {
              if (plan.standalone_courses?.some((c: any) => c.id === course.id)) {
                courseIds.add(course.id)
              }
            })
          })
        }
        setStandaloneCourses(courseIds)
      })
      .finally(() => setLoading(false))
  }, [directionId])

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

  if (loading || !data) return null

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{data.direction_name} - 技能树</h2>
      
      <div className="space-y-6">
        {data.nodes.map((node, idx) => (
          <div key={node.id} className="relative">
            {idx > 0 && (
              <div className="absolute -top-6 left-6 h-6 w-0.5 bg-gray-300" />
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="font-medium text-gray-800">{node.name}</h3>
            </div>
            
            <div className="mt-3 ml-11 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {node.courses.map((course) => {
                const isInherited = directionInPlan
                const isStandalone = standaloneCourses.has(course.id)
                const isInPlan = isInherited || isStandalone

                return (
                  <div
                    key={course.id}
                    className={`rounded-lg border p-3 text-sm transition hover:shadow-sm ${DIFFICULTY_COLORS[course.difficulty]}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex items-center gap-2 hover:opacity-80"
                      >
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">{course.title}</span>
                      </Link>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs opacity-75">
                        {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                      </span>
                      <div className="flex items-center gap-1">
                        {isInherited && (
                          <span className="text-xs text-green-600" title="随方向加入计划">
                            <Shield className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <button
                          onClick={() => !isInherited && toggleCoursePlan(course.id)}
                          disabled={isInherited}
                          className={`rounded p-1 text-xs transition ${
                            isInherited
                              ? "cursor-not-allowed text-green-600"
                              : isStandalone
                                ? "text-green-600 hover:bg-green-200"
                                : "opacity-60 hover:opacity-100 hover:bg-white/50"
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
              {node.courses.length === 0 && (
                <p className="text-sm text-gray-400">暂无课程</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
