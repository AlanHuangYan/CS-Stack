import { Link } from "react-router-dom"
import { Course } from "../types"

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="block rounded-xl border border-gray-200 p-5 transition hover:shadow-lg hover:border-blue-300"
    >
      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
      <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[course.difficulty]}`}>
          {DIFFICULTY_LABELS[course.difficulty]}
        </span>
      </div>
      {course.prerequisites.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">前置: {course.prerequisites.join(", ")}</p>
      )}
    </Link>
  )
}
