import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { api } from "../api/client"
import { Course } from "../types"
import { CourseCard } from "../components/CourseCard"

const DIFFICULTIES = [
  { value: "", label: "全部" },
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "进阶" },
  { value: "advanced", label: "高级" },
]

const SORTS = [
  { value: "", label: "默认排序" },
  { value: "title", label: "按名称" },
  { value: "difficulty", label: "按难度" },
  { value: "hours", label: "按时长" },
]

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")

  const fetchCourses = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (difficulty) params.difficulty = difficulty
    if (search) params.search = search
    if (sort) params.sort = sort
    api
      .get("/api/courses", { params })
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [difficulty, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">课程库</h1>

      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课程..."
              className="w-full rounded-lg border pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            搜索
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">难度:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => {
                setDifficulty(d.value)
              }}
              className={`rounded-full px-3 py-1 text-sm transition ${
                difficulty === d.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {d.label}
            </button>
          ))}

          <span className="ml-4 text-sm text-gray-600">排序:</span>
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setSort(s.value)
              }}
              className={`rounded-full px-3 py-1 text-sm transition ${
                sort === s.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}

          <span className="ml-auto text-sm text-gray-500">共 {courses.length} 门课程</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">加载中...</div>
      ) : courses.length === 0 ? (
        <div className="flex justify-center py-20 text-gray-400">暂无课程</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
