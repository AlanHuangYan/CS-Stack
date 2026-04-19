import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"
import { Course } from "../types"

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchCourses = () => {
    setLoading(true)
    api
      .get("/api/admin/courses", { params: search ? { search } : {} })
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = (id: string) => {
    if (!confirm("确定删除此课程？")) return
    api.delete(`/api/admin/courses/${id}`).then(() => fetchCourses())
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">课程管理</h1>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> 添加课程
          </button>
        </div>

        <div className="mb-4 flex gap-2">
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
            onClick={fetchCourses}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm transition hover:bg-gray-200"
          >
            搜索
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">加载中...</div>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">标题</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">难度</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">{DIFFICULTY_LABELS[c.difficulty]}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
