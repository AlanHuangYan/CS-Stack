import { useState, useEffect } from "react"
import { User, Mail, Calendar, TrendingUp, Award, BookOpen, Key, Eye, EyeOff, CheckCircle } from "lucide-react"
import { api } from "../api/client"
import { useNavigate } from "react-router-dom"

interface UserProfile {
  user_id: string
  username: string
  email?: string
  created_at?: string
  stats: {
    total_xp: number
    streak_days: number
    badges: any[]
    milestones: any[]
    checkin_calendar?: Record<string, boolean>
  }
  progress: Record<string, any>
  selected_directions: string[]
}

const XP_LEVELS = [
  { level: 1, name: "新手", min_xp: 0 },
  { level: 2, name: "学徒", min_xp: 100 },
  { level: 3, name: "初级", min_xp: 300 },
  { level: 4, name: "中级", min_xp: 600 },
  { level: 5, name: "高级", min_xp: 1000 },
  { level: 6, name: "专家", min_xp: 2000 },
  { level: 7, name: "大师", min_xp: 5000 },
]

function formatDate(isoDate: string): string {
  if (!isoDate) return "-"
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return "-"
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login")
      return
    }
    api
      .get("/api/users/me")
      .then((res) => {
        console.log("Profile data:", res.data)
        setProfile(res.data)
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err)
        console.error("Error response:", err.response)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token")
          navigate("/login")
        } else if (err.response?.status === 404) {
          alert("用户不存在，请重新登录")
          localStorage.removeItem("token")
          navigate("/login")
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleChangePassword = async () => {
    setPasswordMsg("")
    setPasswordSuccess(false)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("请填写完整信息")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("两次输入的密码不一致")
      return
    }
    if (newPassword.length < 4) {
      setPasswordMsg("密码长度不能少于 4 位")
      return
    }
    try {
      await api.post("/api/users/me/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      })
      setPasswordSuccess(true)
      setPasswordMsg("密码修改成功")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.detail || "修改失败")
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!profile) return null

  const totalXp = profile.stats?.total_xp || 0
  const streakDays = profile.stats?.streak_days || 0
  const badgeCount = profile.stats?.badges?.length || 0
  const courseCount = Object.keys(profile.progress || {}).length

  let currentLevel = XP_LEVELS[0]
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVELS[i].min_xp) {
      currentLevel = XP_LEVELS[i]
      break
    }
  }

  const createdDate = formatDate(profile.created_at)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 rounded-xl border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-sm text-gray-500">Lv.{currentLevel.level} {currentLevel.name}</p>
          </div>
        </div>

        {profile.email && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Mail className="h-4 w-4" />
            <span>{profile.email}</span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>加入于 {createdDate}</span>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            经验值
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-600">{totalXp}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="h-4 w-4" />
            学习课程
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">{courseCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Award className="h-4 w-4" />
            获得徽章
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{badgeCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            🔥 连续打卡
          </div>
          <p className="mt-1 text-2xl font-bold text-red-600">{streakDays} 天</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="mb-8 rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">修改密码</h3>
        </div>
        <div className="max-w-md space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="当前密码"
              className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新密码"
              className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="确认新密码"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {passwordMsg && (
            <p className={`text-sm ${passwordSuccess ? "text-green-600" : "text-red-500"}`}>
              {passwordSuccess && <CheckCircle className="mr-1 inline h-4 w-4" />}
              {passwordMsg}
            </p>
          )}
          <button
            onClick={handleChangePassword}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            保存修改
          </button>
        </div>
      </div>

      {profile.selected_directions.length > 0 && (
        <div className="mb-8 rounded-xl border bg-white p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">已选方向</h3>
          <div className="flex flex-wrap gap-2">
            {profile.selected_directions.map((d) => (
              <span key={d} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
