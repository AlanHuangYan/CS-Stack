import { useEffect, useState } from 'react'
import api from '../api/client'
import type { Direction } from '../types'

export default function Home() {
  const [directions, setDirections] = useState<Direction[]>([])

  useEffect(() => {
    api.get('/directions/').then((res) => setDirections(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">CS-Stack</h1>
          <p className="mt-2 text-gray-600">计算机科学学习路径平台</p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-4">专业方向</h2>
        {directions.length === 0 ? (
          <p className="text-gray-500">暂无方向数据</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((d) => (
              <div key={d.id} className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium">{d.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{d.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
