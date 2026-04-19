import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react"
import { Logo } from "./components/Logo"
import { api } from "./api/client"
import { Home } from "./pages/Home"
import { CourseList } from "./pages/CourseList"
import { CourseDetail } from "./pages/CourseDetail"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Progress } from "./pages/Progress"
import { DirectionPicker } from "./pages/DirectionPicker"
import { LearningPath } from "./pages/LearningPath"
import { MyStudyPlan } from "./pages/MyStudyPlan"
import { Dashboard } from "./pages/Dashboard"
import { Profile } from "./pages/Profile"
import { AdminLogin } from "./pages/AdminLogin"
import { AdminDashboard } from "./pages/AdminDashboard"
import { AdminUsers } from "./pages/AdminUsers"
import { AdminCourses } from "./pages/AdminCourses"
import { AdminAIConfig } from "./pages/AdminAIConfig"

function AdminGuard() {
  if (!localStorage.getItem("admin_token")) {
    return <AdminLogin />
  }
  return (
    <Routes>
      <Route path="" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="courses" element={<AdminCourses />} />
      <Route path="ai-config" element={<AdminAIConfig />} />
    </Routes>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.get("/api/users/me").then((res) => {
        if (res.data.username === "admin") {
          setIsAdmin(true)
        }
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("admin_token")
    setOpen(false)
    navigate("/")
  }

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (token) {
      localStorage.setItem("admin_token", token)
    }
    setOpen(false)
    navigate("/admin")
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
      >
        <User className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white py-1 shadow-lg z-50">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            个人资料
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            仪表板
          </Link>
          {isAdmin && (
            <a
              href="/admin"
              onClick={handleAdminClick}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Shield className="h-4 w-4" />
              Admin 后台
            </a>
          )}
          <div className="my-1 border-t" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  )
}

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"))
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-bold text-gray-900">CS-Stack</span>
        </Link>
        
        <Link to="/paths" className="text-sm text-gray-600 hover:text-gray-900">
          学习方向
        </Link>
        <Link to="/my-plan" className="text-sm text-gray-600 hover:text-gray-900">
          我的学习计划
        </Link>
        <Link to="/courses" className="text-sm text-gray-600 hover:text-gray-900">
          课程库
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/paths" element={<DirectionPicker />} />
        <Route path="/paths/:id" element={<LearningPath />} />
        <Route path="/my-plan" element={<MyStudyPlan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminGuard />} />
      </Routes>
    </BrowserRouter>
  )
}
