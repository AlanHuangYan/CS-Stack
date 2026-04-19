from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.storage import read_list

router = APIRouter()
DIR_FILE = "directions.json"
DIR_KEY = "directions"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"


def _get_courses_for_subdirection(sub_id: str) -> list[dict]:
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    sub = next((s for s in subdirections if s["id"] == sub_id), None)
    if not sub:
        return []
    
    course_ids = set(sub.get("courses", []))
    return [c for c in courses if c["id"] in course_ids]


def _get_difficulty_label(d: str) -> str:
    return {"beginner": "入门", "intermediate": "进阶", "advanced": "高级"}.get(d, d)


@router.get("/{direction_id}")
def get_learning_path(direction_id: str):
    directions = read_list(DIR_FILE, DIR_KEY)
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")
    
    sub_ids = direction.get("subdirections", [])
    path_items = []
    
    for sub_id in sub_ids:
        subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
        sub = next((s for s in subdirections if s["id"] == sub_id), None)
        if not sub:
            continue
        
        courses = _get_courses_for_subdirection(sub_id)
        
        for course in courses:
            kp_count = (
                len(course.get("knowledge_points", {}).get("core", []))
                + len(course.get("knowledge_points", {}).get("important", []))
                + len(course.get("knowledge_points", {}).get("extended", []))
            )
            
            path_items.append({
                "subdirection_id": sub_id,
                "subdirection_name": sub["name"],
                "course_id": course["id"],
                "course_title": course["title"],
                "difficulty": _get_difficulty_label(course.get("difficulty", "")),
                "knowledge_points": kp_count,
                "prerequisites": course.get("prerequisites", []),
            })
    
    return {
        "direction_id": direction_id,
        "direction_name": direction["name"],
        "total_courses": len(path_items),
        "items": path_items,
    }


@router.get("/")
def list_paths():
    directions = read_list(DIR_FILE, DIR_KEY)
    result = []
    
    for d in directions:
        sub_ids = d.get("subdirections", [])
        total_courses = 0
        for sub_id in sub_ids:
            total_courses += len(_get_courses_for_subdirection(sub_id))
        
        result.append({
            "id": d["id"],
            "name": d["name"],
            "name_en": d["name_en"],
            "icon": d["icon"],
            "description": d["description"],
            "course_count": total_courses,
        })
    
    return result
