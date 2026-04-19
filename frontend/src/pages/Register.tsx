import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api/client"

export function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("请输入用户名")
      return
    }

    if (!validateEmail(email)) {
      setError("请输入有效的邮箱地址")
      return
    }

    if (password.length < 6) {
      setError("密码至少需要 6 位")
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    setLoading(true)
    try {
      await api.post("/api/users/register", { username, email, password })
      const res = await api.post("/api/users/login", { username, password })
      localStorage.setItem("token", res.data.access_token)
      navigate("/progress")
    } catch (err: any) {
      setError(err.response?.data?.detail || "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">注册</h1>
      <form onSubmit={handleRegister} className="space-y-4 rounded-xl border p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="example@email.com"
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
            placeholder="至少 6 位密码"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="再次输入密码"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
        <p className="text-center text-sm text-gray-600">
          已有账号？{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            立即登录
          </Link>
        </p>
      </form>
    </div>
  )
}
