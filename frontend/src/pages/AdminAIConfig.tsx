import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import { api } from "../api/client"
import { AdminSidebar } from "../components/AdminSidebar"

export function AdminAIConfig() {
  const [config, setConfig] = useState({
    provider: "mock",
    openai_api_key: "",
    openai_model: "gpt-4",
    claude_api_key: "",
    claude_model: "claude-3-sonnet",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get("/api/admin/ai/config").then((res) => setConfig({ ...config, ...res.data }))
  }, [])

  const handleSave = () => {
    api.post("/api/admin/ai/config", config).then(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">AI 配置</h1>

        <div className="max-w-lg space-y-4 rounded-xl border bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">AI 提供商</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="mock">模拟（Mock）</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <input
              type="password"
              value={config.openai_api_key}
              onChange={(e) => setConfig({ ...config, openai_api_key: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI 模型</label>
            <input
              type="text"
              value={config.openai_model}
              onChange={(e) => setConfig({ ...config, openai_model: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Claude API Key</label>
            <input
              type="password"
              value={config.claude_api_key}
              onChange={(e) => setConfig({ ...config, claude_api_key: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="sk-ant-..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Claude 模型</label>
            <input
              type="text"
              value={config.claude_model}
              onChange={(e) => setConfig({ ...config, claude_model: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {saved ? "已保存" : "保存配置"}
          </button>
        </div>
      </div>
    </div>
  )
}
