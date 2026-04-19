import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"
import { api } from "../api/client"

export function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem("admin_token")) {
      navigate("/admin")
    }
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post("/api/users/login", { username, password })
      const token = res.data.access_token
      await api.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.setItem("admin_token", token)
      navigate("/admin")
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败")
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Shield className="h-6 w-6 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin 登录</h1>
        <p className="mt-1 text-sm text-gray-500">请输入管理员账号进入管理后台</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4 rounded-xl border p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="输入管理员用户名"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="输入密码"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-gray-800 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          登录管理后台
        </button>
      </form>
    </div>
  )
}
