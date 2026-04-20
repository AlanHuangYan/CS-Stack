from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pathlib import Path
from backend.models import Course
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "courses/index.json"
KEY = "courses"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
DIR_FILE = "directions.json"
DIR_KEY = "directions"


def _get_direction_subdirections(direction_id: str) -> set[str]:
    directions = read_list(DIR_FILE, DIR_KEY)
    for d in directions:
        if d["id"] == direction_id:
            return set(d.get("subdirections", []))
    return set()


def _get_subdirection_courses(subdirection_id: str) -> set[str]:
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    for s in subdirections:
        if s["id"] == subdirection_id:
            return set(s.get("courses", []))
    return set()


@router.get("/", response_model=list[Course])
def list_courses(
    direction: Optional[str] = Query(None),
    subdirection: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
):
    """获取课程列表，支持按方向、子方向、难度、关键词筛选和排序。"""
    courses = read_list(FILE, KEY)

    if subdirection:
        allowed = _get_subdirection_courses(subdirection)
        if allowed:
            courses = [c for c in courses if c["id"] in allowed]

    if direction:
        allowed_subs = _get_direction_subdirections(direction)
        course_ids = set()
        for sub_id in allowed_subs:
            course_ids.update(_get_subdirection_courses(sub_id))
        if course_ids:
            courses = [c for c in courses if c["id"] in course_ids]

    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]

    if search:
        search_lower = search.lower()
        courses = [
            c for c in courses
            if search_lower in c["title"].lower()
        ]

    if sort == "title":
        courses.sort(key=lambda c: c["title"])
    elif sort == "difficulty":
        difficulty_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
        courses.sort(key=lambda c: difficulty_order.get(c.get("difficulty", ""), 0))

    return courses


@router.get("/{course_id}", response_model=Course)
def get_course(course_id: str):
    """获取课程详情。"""
    courses = read_list(FILE, KEY)
    for c in courses:
        if c["id"] == course_id:
            return c
    raise HTTPException(status_code=404, detail="课程不存在")


@router.post("/", response_model=Course, status_code=201)
def create_course(course: Course):
    """创建新课程。"""
    append_item(FILE, KEY, course.model_dump())
    return course


@router.put("/{course_id}", response_model=Course)
def update_course(course_id: str, course: Course):
    """更新课程信息。"""
    if course.id != course_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, course.model_dump())
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: str):
    """删除课程。"""
    if not delete_item(FILE, KEY, course_id):
        raise HTTPException(status_code=404, detail="课程不存在")


@router.get("/recommendations/{direction_id}", response_model=list[Course])
def get_recommendations(direction_id: str, limit: int = Query(6, ge=1, le=20)):
    """根据方向推荐课程。"""
    courses = read_list(FILE, KEY)
    
    allowed_subs = _get_direction_subdirections(direction_id)
    course_ids = set()
    for sub_id in allowed_subs:
        course_ids.update(_get_subdirection_courses(sub_id))
    
    recommended = [c for c in courses if c["id"] in course_ids]
    return recommended[:limit]


@router.get("/{course_id}/content")
def get_course_content(course_id: str):
    """获取课程 Markdown 内容。"""
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    directions = read_list(DIR_FILE, DIR_KEY)

    direction_id = None
    for sub in subdirections:
        if course_id in sub.get("courses", []):
            direction_id = sub.get("directions", [None])[0]
            break

    if not direction_id:
        raise HTTPException(status_code=404, detail="课程所属方向未找到")

    base_dir = Path(__file__).resolve().parent.parent.parent / "data" / "courses"
    md_path = base_dir / direction_id / f"{course_id}.md"

    if not md_path.exists():
        raise HTTPException(status_code=404, detail="课程内容文件不存在")

    return {"content": md_path.read_text(encoding="utf-8")}
