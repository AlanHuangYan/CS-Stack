import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle, PlayCircle, Circle } from "lucide-react"

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

export function StudyPlanDirectionCard({ data }: { data: DirectionProgress }) {
  const displayIcon = ICON_MAP[data.icon] || "📚"

  return (
    <div className="relative rounded-xl border bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
            {displayIcon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{data.name}</h3>
            <p className="text-xs text-gray-500">{data.total_courses} 门课程</p>
          </div>
        </div>
        <Link
          to={`/paths/${data.id}`}
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-green-50 p-2">
          <CheckCircle className="mx-auto mb-1 h-4 w-4 text-green-600" />
          <span className="block font-medium text-green-600">{data.completed}</span>
          <span className="text-gray-500">已完成</span>
        </div>
        <div className="rounded-lg bg-blue-50 p-2">
          <PlayCircle className="mx-auto mb-1 h-4 w-4 text-blue-600" />
          <span className="block font-medium text-blue-600">{data.in_progress}</span>
          <span className="text-gray-500">学习中</span>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <Circle className="mx-auto mb-1 h-4 w-4 text-gray-400" />
          <span className="block font-medium text-gray-400">{data.not_started}</span>
          <span className="text-gray-500">未开始</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>进度</span>
          <span>{data.progress_percent}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${data.progress_percent}%` }}
          />
        </div>
      </div>

      <Link
        to={`/paths/${data.id}`}
        className="mt-4 block rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
      >
        进入学习方向
      </Link>
    </div>
  )
}
