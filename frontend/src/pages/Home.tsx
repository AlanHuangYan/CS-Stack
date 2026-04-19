import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Code2, Brain, Zap, Shield } from "lucide-react"
import { api } from "../api/client"
import { DirectionCard } from "../components/DirectionCard"
import { AuthenticatedHome } from "./AuthenticatedHome"

interface PathInfo {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  course_count: number
}

const FEATURED = ["frontend", "backend", "programming-languages", "ml", "ai-agent", "security"]

const FEATURES = [
  { icon: Code2, title: "80/20 法则", description: "聚焦 20% 核心知识点，掌握 80% 技能" },
  { icon: Brain, title: "智能推荐", description: "根据你的兴趣推荐最佳学习路径" },
  { icon: Zap, title: "经验激励", description: "打卡、升级、徽章，让学习更有趣" },
  { icon: Shield, title: "体系化学习", description: "从入门到高级的完整知识体系" },
]

export function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [paths, setPaths] = useState<PathInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api
        .get("/api/users/me")
        .then(() => {
          setIsLoggedIn(true)
        })
        .catch(() => {
          localStorage.removeItem("token")
          setIsLoggedIn(false)
        })
        .finally(() => {
          setAuthChecked(true)
          setLoading(false)
        })
    } else {
      setAuthChecked(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      api.get("/api/paths/").then((res) => setPaths(res.data)).finally(() => setLoading(false))
    }
  }, [isLoggedIn])

  if (!authChecked) {
    return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  }

  if (isLoggedIn) {
    return <AuthenticatedHome />
  }

  const featured = paths.filter((p) => FEATURED.includes(p.id))

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <img src="/logo.png" alt="CS-Stack" className="h-20 w-20 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            CS-Stack
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            计算机科学学习路径平台 — 用最聪明的方式学习编程，让每一个知识点都有价值。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/paths"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl"
            >
              开始学习 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              浏览课程
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center rounded-xl border bg-white p-6 text-center transition hover:shadow-md">
                <f.icon className="h-8 w-8 text-blue-600" />
                <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Directions */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">热门学习方向</h2>
            <Link to="/paths" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              查看全部 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10 text-gray-400">加载中...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <DirectionCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  nameEn={p.name_en}
                  icon={p.icon}
                  description={p.description}
                  courseCount={p.course_count}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold">准备好开始了吗？</h2>
          <p className="mt-3 text-gray-400">选择一个方向，生成你的专属学习路径</p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition hover:bg-blue-700"
          >
            免费注册 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
