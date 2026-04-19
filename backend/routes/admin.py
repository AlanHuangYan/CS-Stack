from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from backend.models import Course
from backend.auth import require_admin
from backend.storage import read_list, write_list, append_item, delete_item, read_json, write_json, read_all_users, write_all_users, read_user, write_user

router = APIRouter()
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"
ADMIN_SETTINGS_FILE = "admin/settings.json"


@router.get("/courses", response_model=list[Course])
def admin_list_courses(
    search: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    _admin: dict = Depends(require_admin),
):
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    if search:
        search_lower = search.lower()
        courses = [c for c in courses if search_lower in c["title"].lower()]
    
    if difficulty:
        courses = [c for c in courses if c.get("difficulty") == difficulty]
    
    return courses


@router.post("/courses", response_model=Course, status_code=201)
def admin_create_course(course: Course, _admin: dict = Depends(require_admin)):
    append_item(COURSE_FILE, COURSE_KEY, course.model_dump())
    return course


@router.put("/courses/{course_id}", response_model=Course)
def admin_update_course(course_id: str, course: Course, _admin: dict = Depends(require_admin)):
    if course.id != course_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(COURSE_FILE, COURSE_KEY, course.model_dump())
    return course


@router.delete("/courses/{course_id}", status_code=204)
def admin_delete_course(course_id: str, _admin: dict = Depends(require_admin)):
    if not delete_item(COURSE_FILE, COURSE_KEY, course_id):
        raise HTTPException(status_code=404, detail="课程不存在")


@router.get("/ai/config")
def get_ai_config(_admin: dict = Depends(require_admin)):
    settings = read_json(ADMIN_SETTINGS_FILE)
    return settings.get("ai", {})


@router.post("/ai/config")
def update_ai_config(config: dict, _admin: dict = Depends(require_admin)):
    settings = read_json(ADMIN_SETTINGS_FILE)
    settings["ai"] = config
    write_json(ADMIN_SETTINGS_FILE, settings)
    return {"message": "配置已更新"}


@router.post("/ai/discover")
def discover_courses(
    direction: str = Query(..., description="目标方向"),
    subdirection: Optional[str] = Query(None, description="子方向"),
    _admin: dict = Depends(require_admin),
):
    from backend.ai_client import suggest_courses
    
    suggestions = suggest_courses(direction, subdirection)
    return {"suggestions": suggestions}


@router.get("/stats")
def get_admin_stats(_admin: dict = Depends(require_admin)):
    courses = read_list(COURSE_FILE, COURSE_KEY)
    directions = read_list("directions.json", "directions")
    subdirections = read_list("subdirections.json", "subdirections")
    
    difficulty_counts = {}
    for c in courses:
        d = c.get("difficulty", "unknown")
        difficulty_counts[d] = difficulty_counts.get(d, 0) + 1
    
    return {
        "total_courses": len(courses),
        "total_directions": len(directions),
        "total_subdirections": len(subdirections),
        "by_difficulty": difficulty_counts,
    }


def _mask_password(user: dict) -> dict:
    result = dict(user)
    result["password_hash"] = "***" if result.get("password_hash") else ""
    return result


@router.get("/users")
def admin_list_users(_admin: dict = Depends(require_admin)):
    users = read_all_users()
    return [_mask_password(u) for u in users]


@router.post("/users/{user_id}/disable")
def admin_disable_user(user_id: str, _admin: dict = Depends(require_admin)):
    user = read_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user.get("username") == "admin":
        raise HTTPException(status_code=400, detail="不能禁用自己的账号")
    user["disabled"] = True
    write_user(user_id, user)
    return {"message": "用户已禁用"}


@router.post("/users/{user_id}/enable")
def admin_enable_user(user_id: str, _admin: dict = Depends(require_admin)):
    user = read_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    user["disabled"] = False
    write_user(user_id, user)
    return {"message": "用户已启用"}


@router.delete("/users/{user_id}", status_code=204)
def admin_delete_user(user_id: str, _admin: dict = Depends(require_admin)):
    user = read_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user.get("username") == "admin":
        raise HTTPException(status_code=400, detail="不能删除自己的账号")
    users = [u for u in read_all_users() if u.get("user_id") != user_id]
    write_all_users(users)
    return None
