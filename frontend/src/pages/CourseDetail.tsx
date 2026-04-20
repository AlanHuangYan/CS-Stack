import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { api } from "../api/client"
import { Course } from "../types"
import "highlight.js/styles/github.css"

const LANGUAGE_LABELS: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  python: "Python",
  py: "Python",
  bash: "Bash",
  shell: "Shell",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
}

const markdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="mb-6 mt-8 border-b pb-3 text-2xl font-bold text-gray-900 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="mb-4 mt-8 border-b pb-2 text-xl font-bold text-gray-900 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800 first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="mb-2 mt-4 text-base font-semibold text-gray-800" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-4 text-gray-600 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-gray-600" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-600" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm leading-relaxed" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-gray-800" {...props}>{children}</strong>
  ),
  code: ({ className, children, ...props }: any) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-pink-600" {...props}>
          {children}
        </code>
      )
    }
    const langMatch = className?.match(/language-(\w+)/)
    const lang = langMatch ? langMatch[1] : ""
    const langLabel = LANGUAGE_LABELS[lang] || lang.toUpperCase()
    
    return (
      <div className="relative mb-4">
        {langLabel && (
          <div className="absolute right-2 top-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
            {langLabel}
          </div>
        )}
        <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm max-h-96" {...props}>
          <code className={className}>{children}</code>
        </pre>
      </div>
    )
  },
  pre: ({ children }: any) => {
    return <>{children}</>
  },
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="mb-4 border-l-4 border-blue-200 bg-blue-50 py-2 pl-4 text-sm text-gray-600" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-50" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-gray-200 bg-white" {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr {...props}>{children}</tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-gray-600" {...props}>{children}</td>
  ),
  a: ({ children, href, ...props }: any) => (
    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  hr: () => (
    <hr className="my-6 border-gray-200" />
  ),
}

export function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<{ status: string }>({ status: "not_started" })
  const token = localStorage.getItem("token")

  const fetchCourse = () => {
    setLoading(true)
    api
      .get(`/api/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }

  const fetchContent = () => {
    api
      .get(`/api/courses/${id}/content`)
      .then((res) => setContent(res.data.content))
      .catch(() => setContent(null))
  }

  const fetchProgress = () => {
    if (!token) return
    api
      .get("/api/users/me/progress")
      .then((res) => {
        const p = res.data[id!]
        if (p) setProgress({ status: p.status })
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchCourse()
    fetchContent()
    fetchProgress()
  }, [id, token])

  const handleStatusChange = (status: string) => {
    const newProgress = { status }
    setProgress(newProgress)
    if (token) {
      api.put(`/api/users/me/progress/${id}`, newProgress).catch(() => {})
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">加载中...</div>
  if (!course) return <div className="flex justify-center py-20 text-gray-400">课程不存在</div>

  const STATUS_LABELS: Record<string, string> = {
    not_started: "未开始",
    in_progress: "学习中",
    completed: "已完成",
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>难度: {course.difficulty}</span>
        </div>
        {course.prerequisites.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">前置课程: {course.prerequisites.join(", ")}</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-gray-700">学习状态</h3>
        <div className="flex gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                progress.status === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!token && <p className="mt-2 text-xs text-orange-500">请先登录以保存进度</p>}
      </div>

      {content && (
        <div className="rounded-lg border bg-white p-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}

      {course.resources.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-medium text-gray-700">学习资源</h3>
          <ul className="space-y-2">
            {course.resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {r.title || r.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
