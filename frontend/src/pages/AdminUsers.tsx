import { useState, useEffect } from "react"
import { Users, Ban, CheckCircle, Trash2, RefreshCw } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"

interface AdminUser {
  user_id: string
  username: string
  email?: string
  created_at: string
  disabled: boolean
  stats?: {
    total_xp: number
    streak_days: number
  }
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => {
    setLoading(true)
    api
      .get("/api/admin/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDisable = (userId: string) => {
    api.post(`/api/admin/users/${userId}/disable`).then(() => fetchUsers())
  }

  const handleEnable = (userId: string) => {
    api.post(`/api/admin/users/${userId}/enable`).then(() => fetchUsers())
  }

  const handleDelete = (userId: string) => {
    if (!confirm("确定删除此用户？此操作不可恢复。")) return
    api.delete(`/api/admin/users/${userId}`).then(() => fetchUsers())
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">用户管理</h1>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm transition hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">加载中...</div>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">用户名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">邮箱</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">经验值</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">注册日期</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className={`border-b hover:bg-gray-50 ${u.disabled ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                        {u.username}
                        {u.disabled && <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">已禁用</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={u.disabled ? "text-red-600" : "text-green-600"}>
                        {u.disabled ? "禁用" : "正常"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.stats?.total_xp ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("zh-CN") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.disabled ? (
                          <button
                            onClick={() => handleEnable(u.user_id)}
                            className="text-green-600 hover:text-green-800"
                            title="启用"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisable(u.user_id)}
                            className="text-orange-600 hover:text-orange-800"
                            title="禁用"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {u.username !== "admin" && (
                          <button
                            onClick={() => handleDelete(u.user_id)}
                            className="text-red-600 hover:text-red-800"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
