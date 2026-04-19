import { Link } from "react-router-dom"
import { PlayCircle, CheckCircle, Circle, X } from "lucide-react"

const STATUS_CONFIG: Record<string, { icon: typeof PlayCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-600", label: "已完成" },
  in_progress: { icon: PlayCircle, color: "text-blue-600", label: "学习中" },
  not_started: { icon: Circle, color: "text-gray-400", label: "未开始" },
}

interface StandaloneCourse {
  id: string
  title: string
  difficulty: string
  status: string
}

export function StudyPlanCourseCard({ data, onRemove }: { data: StandaloneCourse; onRemove: () => void }) {
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.not_started
  const Icon = config.icon

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
  }

  const difficultyLabels: Record<string, string> = {
    beginner: "入门",
    intermediate: "中级",
    advanced: "高级",
  }

  return (
    <Link
      to={`/courses/${data.id}`}
      className="group flex items-center justify-between rounded-lg border bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <div>
          <span className="font-medium text-gray-900 group-hover:text-blue-600">{data.title}</span>
          <span className="ml-2 text-xs text-gray-400">{difficultyLabels[data.difficulty]}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${config.color}`}>{config.label}</span>
        <button
          onClick={handleRemove}
          className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Link>
  )
}
