import { CheckCircle2, Circle, Target } from "lucide-react"
import { CourseKnowledgePoints } from "../types"

const SECTIONS = [
  {
    key: "core" as const,
    label: "核心 (20%)",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: Target,
  },
  {
    key: "important" as const,
    label: "重点 (20%)",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: CheckCircle2,
  },
  {
    key: "extended" as const,
    label: "扩展 (60%)",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: Circle,
  },
]

export function KnowledgePointSection({
  points,
  completed,
  onToggle,
}: {
  points: CourseKnowledgePoints
  completed: string[]
  onToggle: (name: string) => void
}) {
  return (
    <div className="space-y-6">
      {SECTIONS.map(({ key, label, color, bg, border, icon: Icon }) => {
        const items = points[key]
        if (items.length === 0) return null
        return (
          <div key={key} className={`rounded-lg border ${border} ${bg} p-4`}>
            <h4 className={`mb-3 font-semibold ${color}`}>
              <Icon className="mr-1 inline h-4 w-4" />
              {label}
            </h4>
            <ul className="space-y-2">
              {items.map((kp) => {
                const isCompleted = completed.includes(kp.name)
                return (
                  <li
                    key={kp.name}
                    className={`flex cursor-pointer items-start gap-2 rounded-md p-2 transition hover:bg-white/60 ${isCompleted ? "opacity-60" : ""}`}
                    onClick={() => onToggle(kp.name)}
                  >
                    <span className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </span>
                    <div>
                      <span className={`font-medium ${isCompleted ? "line-through" : ""}`}>{kp.name}</span>
                      {kp.description && <p className="text-sm text-gray-500">{kp.description}</p>}
                      {kp.exercise && (
                        <p className="mt-1 text-xs text-blue-600 font-medium">{kp.exercise}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
