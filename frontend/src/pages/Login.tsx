import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User as UserIcon } from "lucide-react"
import { api } from "../api/client"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/api/users/login", { username, password })
      localStorage.setItem("token", res.data.access_token)
      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.detail || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <UserIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">登录</h1>
        <p className="mt-1 text-sm text-gray-500">欢迎回来，请登录你的账号</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4 rounded-xl border p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="输入用户名"
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
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          立即注册
        </Link>
      </p>
    </div>
  )
}
