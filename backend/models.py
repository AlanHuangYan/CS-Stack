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


class UserStats(BaseModel):
    total_xp: int = 0
    streak_days: int = 0
    badges: list[str] = []
    milestones: list[str] = []


class UserPreferences(BaseModel):
    skill_level: Optional[str] = None
    learning_goal: Optional[str] = None


class User(BaseModel):
    user_id: str
    username: str
    email: Optional[str] = None
    created_at: Optional[str] = None
    selected_directions: list[str] = []
    learning_preferences: Optional[UserPreferences] = None
    progress: dict[str, CourseProgress] = {}
    stats: UserStats = Field(default_factory=UserStats)


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
