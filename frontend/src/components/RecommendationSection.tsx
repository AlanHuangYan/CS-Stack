import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { api } from "../api/client"
import { Course } from "../types"
import { CourseCard } from "../components/CourseCard"

export function RecommendationSection({ directionId, title }: { directionId: string; title: string }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/api/courses/recommendations/${directionId}`)
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }, [directionId])

  if (loading) return null
  if (courses.length === 0) return null

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
