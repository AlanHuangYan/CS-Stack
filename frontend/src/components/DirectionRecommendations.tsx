import { Link } from "react-router-dom"
import { ArrowRight, Compass, Plus } from "lucide-react"
import { api } from "../api/client"
import { useState, useEffect } from "react"

interface PathInfo {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  course_count: number
}

interface DirectionRecommendationsProps {
  selectedDirections: string[]
}

export function DirectionRecommendations({ selectedDirections }: DirectionRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PathInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedDirections.length === 0) return

    api
      .get("/api/paths/")
      .then((res) => {
        const allPaths: PathInfo[] = res.data
        const recommended = allPaths.filter((p) => selectedDirections.includes(p.id))
        setRecommendations(recommended.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [selectedDirections])

  if (selectedDirections.length === 0) {
    return (
      <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">选择学习方向</h3>
        </div>
        <p className="mb-4 text-gray-600">选择一个或多个学习方向，生成你的专属学习路径</p>
        <Link
          to="/paths"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          选择方向 <Plus className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  if (loading) return null

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">我的学习方向</h3>
        </div>
        <Link to="/paths" className="text-sm text-blue-600 hover:underline">
          浏览全部
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.map((path) => (
          <Link
            key={path.id}
            to={`/paths/${path.id}`}
            className="group flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              {path.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{path.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{path.description}</p>
              <p className="mt-1 text-xs text-gray-400">{path.course_count} 门课程</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:text-blue-600" />
          </Link>
        ))}
      </div>
    </div>
  )
}
