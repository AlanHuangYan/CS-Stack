import { Link } from "react-router-dom"
import { ChevronRight, BookOpen } from "lucide-react"

interface DirectionCardProps {
  id: string
  name: string
  nameEn: string
  icon: string
  description: string
  courseCount: number
}

const iconMap: Record<string, string> = {
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

export function DirectionCard({ id, name, nameEn, icon, description, courseCount }: DirectionCardProps) {
  return (
    <Link
      to={`/paths/${id}`}
      className="group block rounded-xl border border-gray-200 p-5 transition hover:shadow-lg hover:border-blue-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
          {iconMap[icon] || "📚"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{name}</h3>
              <p className="text-xs text-gray-400">{nameEn}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{courseCount} 门课程</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
