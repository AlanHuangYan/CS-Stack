import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { api } from "../api/client"

interface CourseNode {
  id: string
  title: string
  difficulty: string
  core_kp: number
  important_kp: number
  extended_kp: number
  prerequisites: string[]
}

interface SubNode {
  id: string
  name: string
  courses: CourseNode[]
  total_kp: number
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

export function SkillTree({ directionId }: { directionId: string }) {
  const [data, setData] = useState<SkillTreeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/api/skilltree/${directionId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [directionId])

  if (loading || !data) return null

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{data.direction_name} — 技能树</h2>
      
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
              <span className="text-xs text-gray-400">{node.total_kp} 知识点</span>
            </div>
            
            <div className="mt-3 ml-11 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {node.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className={`rounded-lg border p-3 text-sm transition hover:shadow-sm ${DIFFICULTY_COLORS[course.difficulty]}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-75">
                    {course.core_kp}核心 · {course.important_kp}重点
                  </div>
                </Link>
              ))}
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
