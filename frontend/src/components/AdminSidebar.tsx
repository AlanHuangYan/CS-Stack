import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, BookOpen, Settings, LogOut } from "lucide-react"

const MENU_ITEMS = [
  { path: "/admin", label: "仪表板", icon: LayoutDashboard },
  { path: "/admin/users", label: "用户管理", icon: Users },
  { path: "/admin/courses", label: "课程管理", icon: BookOpen },
  { path: "/admin/ai-config", label: "AI 配置", icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    window.location.href = "/admin/login"
  }

  return (
    <div className="flex h-full w-56 flex-col border-r bg-gray-50">
      <div className="border-b p-4">
        <h2 className="font-bold text-gray-800">Admin 后台</h2>
      </div>
      <nav className="flex-1 p-3">
        {MENU_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
        <Link to="/" className="mt-2 block text-center text-xs text-gray-400 hover:text-gray-600">
          返回前台
        </Link>
      </div>
    </div>
  )
}
