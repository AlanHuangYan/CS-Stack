import { useState, useEffect } from "react"
import { Calendar, CheckCircle2, Flame } from "lucide-react"
import { api } from "../api/client"

export function DailyCheckin() {
  const [checkinCalendar, setCheckinCalendar] = useState<Record<string, boolean>>({})
  const [streakDays, setStreakDays] = useState(0)
  const [todayChecked, setTodayChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [message, setMessage] = useState("")

  const fetchCalendar = () => {
    api
      .get("/api/users/me/checkin/calendar")
      .then((res) => {
        setCheckinCalendar(res.data.checkin_calendar || {})
        setStreakDays(res.data.streak_days || 0)
        const today = new Date().toISOString().split("T")[0]
        setTodayChecked(!!res.data.checkin_calendar?.[today])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCalendar()
  }, [])

  const handleCheckin = () => {
    setCheckinLoading(true)
    api
      .post("/api/users/me/checkin")
      .then((res) => {
        setStreakDays(res.data.streak_days)
        setTodayChecked(true)
        setMessage(`打卡成功！连续打卡 ${res.data.streak_days} 天`)
        setTimeout(() => setMessage(""), 3000)
      })
      .catch((err) => {
        setMessage(err.response?.data?.detail || "打卡失败")
        setTimeout(() => setMessage(""), 3000)
      })
      .finally(() => setCheckinLoading(false))
  }

  const getDaysInMonth = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDay, year, month }
  }

  const { daysInMonth, firstDay, year, month } = getDaysInMonth()
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

  const renderCalendarDays = () => {
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isChecked = checkinCalendar[dateStr]
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      days.push(
        <div
          key={day}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
            isChecked
              ? "bg-green-500 text-white"
              : isToday
              ? "bg-blue-100 text-blue-600 font-medium"
              : "text-gray-700"
          }`}
        >
          {isChecked && <CheckCircle2 className="h-4 w-4" />}
          {!isChecked && day}
        </div>
      )
    }
    return days
  }

  if (loading) return <div className="p-4 text-center text-gray-400">加载中...</div>

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">打卡日历</h3>
        <div className="flex items-center gap-2 text-orange-500">
          <Flame className="h-5 w-5" />
          <span className="font-medium">{streakDays} 天</span>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">
            {year}年 {monthNames[month]}
          </span>
        </div>
        <button
          onClick={handleCheckin}
          disabled={todayChecked || checkinLoading}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            todayChecked
              ? "bg-green-100 text-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50`}
        >
          {todayChecked ? "已打卡" : checkinLoading ? "打卡中..." : "打卡"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${message.includes("成功") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div key={day} className="flex h-8 items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}
