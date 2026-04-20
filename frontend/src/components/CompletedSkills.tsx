import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Award } from "lucide-react"
import { api } from "../api/client"

interface CompletedCourse {
  id: string
  title: string
  difficulty: string
}

interface CompletedDirection {
  id: string
  name: string
  icon: string
  courses: CompletedCourse[]
}

interface CompletedData {
  directions: CompletedDirection[]
  total_completed: number
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

const ICON_MAP: Record<string, string> = {
  layout: "🖥️",
  server: "⚙️",
  code: "💻",
  wrench: "🔧",
  smartphone: "📱",
  database: "🗃️",
  bot: "🤖",
  brain: "🧠",
  cpu: "🔬",
  cloud: "☁️",
  "bar-chart-3": "📊",
  eye: "👁️",
  settings: "🛠️",
  "git-branch": "🌳",
  "check-square": "✅",
  "message-square": "💬",
  shield: "🛡️",
  video: "🎬",
}

export function CompletedSkills() {
  const [data, setData] = useState<CompletedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/api/studyplan/me/completed")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 text-center text-gray-400">加载中...</div>
  
  if (!data || data.directions.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">已掌握的技能</h3>
        <div className="py-8 text-center text-gray-400">
          <Award className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>还没有完成任何课程</p>
          <p className="mt-1 text-sm">完成课程后，这里会展示你掌握的技能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">已掌握的技能</h3>
        <span className="text-sm text-gray-500">共 {data.total_completed} 门课程</span>
      </div>
      
      <div className="space-y-6">
        {data.directions.map((direction) => (
          <div key={direction.id}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">{ICON_MAP[direction.icon] || "📚"}</span>
              <h4 className="font-medium text-gray-800">{direction.name}</h4>
              <span className="text-xs text-gray-400">({direction.courses.length} 门)</span>
            </div>
            
            <div className="ml-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {direction.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className={`rounded-lg border p-2.5 text-sm transition hover:shadow-sm ${DIFFICULTY_COLORS[course.difficulty]}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-medium truncate">{course.title}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-75">
                    {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
