import { useState, useEffect } from "react"
import { api } from "../api/client"
import { DirectionCard } from "../components/DirectionCard"

interface PathInfo {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  course_count: number
}

const CATEGORIES = [
  { label: "全部", value: "" },
  { label: "开发", value: "dev" },
  { label: "AI/数据", value: "ai" },
  { label: "基础", value: "base" },
]

const CATEGORY_MAP: Record<string, string[]> = {
  dev: ["frontend", "backend", "mobile", "dev-tools"],
  ai: ["ai-agent", "llm", "ml", "data-mining", "cv", "nlp"],
  base: ["programming-languages", "algo", "infra", "ops", "testing", "security", "bigdata", "multimedia"],
}

export function DirectionPicker() {
  const [paths, setPaths] = useState<PathInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.get("/api/paths/").then((res) => setPaths(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = paths.filter((p) => {
    if (category && !CATEGORY_MAP[category]?.includes(p.id)) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.name_en.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">选择学习方向</h1>
      <p className="mb-6 text-gray-500">选择你想学习的方向，自动生成学习路径</p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索方向..."
            className="rounded-lg border px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">加载中...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <DirectionCard
              key={p.id}
              id={p.id}
              name={p.name}
              nameEn={p.name_en}
              icon={p.icon}
              description={p.description}
              courseCount={p.course_count}
            />
          ))}
        </div>
      )}
    </div>
  )
}
