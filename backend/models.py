from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class KnowledgePoint(BaseModel):
    name: str
    description: str = ""
    exercise: str = ""


class CourseKnowledgePoints(BaseModel):
    core: list[KnowledgePoint] = []
    important: list[KnowledgePoint] = []
    extended: list[KnowledgePoint] = []


class Resource(BaseModel):
    type: str
    url: str
    title: str = ""


class Course(BaseModel):
    id: str
    title: str
    difficulty: str = "beginner"
    estimated_hours: int = 10
    prerequisites: list[str] = []
    knowledge_points: CourseKnowledgePoints = Field(default_factory=CourseKnowledgePoints)
    resources: list[Resource] = []


class Direction(BaseModel):
    id: str
    name: str
    name_en: str = ""
    icon: str = ""
    description: str = ""
    subdirections: list[str] = []


class SubDirection(BaseModel):
    id: str
    name: str
    directions: list[str] = []
    courses: list[str] = []


class CourseProgress(BaseModel):
    status: str = "not_started"
    completed_knowledge: list[str] = []
    started_at: str = ""
    hours_spent: int = 0


class UserStats(BaseModel):
    total_xp: int = 0
    streak_days: int = 0
    badges: list[str] = []
    milestones: list[str] = []


class User(BaseModel):
    user_id: str
    username: str
    selected_directions: list[str] = []
    progress: dict[str, CourseProgress] = {}
    stats: UserStats = Field(default_factory=UserStats)


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
