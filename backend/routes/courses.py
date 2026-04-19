from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models import Course
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "courses/index.json"
KEY = "courses"


@router.get("/", response_model=list[Course])
def list_courses(
    direction: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
):
    """获取课程列表，支持按方向和难度筛选。"""
    courses = read_list(FILE, KEY)
    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]
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
