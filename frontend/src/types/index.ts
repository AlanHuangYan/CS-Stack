export interface Direction {
  id: string
  name: string
  name_en: string
  icon: string
  description: string
  subdirections: string[]
}

export interface SubDirection {
  id: string
  name: string
  directions: string[]
  courses: string[]
}

export interface KnowledgePoint {
  name: string
  description: string
  exercise: string
}

export interface CourseKnowledgePoints {
  core: KnowledgePoint[]
  important: KnowledgePoint[]
  extended: KnowledgePoint[]
}

export interface Resource {
  type: string
  url: string
  title: string
}

export interface Course {
  id: string
  title: string
  difficulty: string
  estimated_hours: number
  prerequisites: string[]
  knowledge_points: CourseKnowledgePoints
  resources: Resource[]
}

export interface CourseProgress {
  status: string
  completed_knowledge: string[]
}

export interface UserStats {
  total_xp: number
  streak_days: number
  badges: string[]
  milestones: string[]
}

export interface User {
  user_id: string
  username: string
  selected_directions: string[]
  progress: Record<string, CourseProgress>
  stats: UserStats
}
