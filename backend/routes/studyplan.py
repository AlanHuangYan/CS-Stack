from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.storage import write_user, read_list

router = APIRouter()

DIR_FILE = "directions.json"
SUB_DIR_FILE = "subdirections.json"
COURSE_FILE = "courses/index.json"


@router.get("/me")
def get_study_plan(user: dict = Depends(get_current_user)):
    plan = user.get("study_plan", {"directions": [], "courses": []})
    progress = user.get("progress", {})

    result = {
        "directions": [],
        "standalone_courses": [],
    }

    directions = read_list(DIR_FILE, "directions")
    subdirections = read_list(SUB_DIR_FILE, "subdirections")
    all_courses = read_list(COURSE_FILE, "courses")

    for dir_id in plan.get("directions", []):
        direction = next((d for d in directions if d["id"] == dir_id), None)
        if not direction:
            continue

        dir_course_ids = set()
        for sub_id in direction.get("subdirections", []):
            sub = next((s for s in subdirections if s["id"] == sub_id), None)
            if sub:
                dir_course_ids.update(sub.get("courses", []))

        total = len(dir_course_ids)
        completed = 0
        in_progress = 0
        not_started = 0

        for cid in dir_course_ids:
            p = progress.get(cid, {})
            status = p.get("status", "not_started")
            if status == "completed":
                completed += 1
            elif status == "in_progress":
                in_progress += 1
            else:
                not_started += 1

        result["directions"].append({
            "id": dir_id,
            "name": direction.get("name", dir_id),
            "icon": direction.get("icon", "📚"),
            "total_courses": total,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": not_started,
            "progress_percent": round((completed / total * 100) if total > 0 else 0),
        })

    for cid in plan.get("courses", []):
        course = next((c for c in all_courses if c["id"] == cid), None)
        if not course:
            continue
        p = progress.get(cid, {})
        status = p.get("status", "not_started")

        result["standalone_courses"].append({
            "id": cid,
            "title": course.get("title", cid),
            "difficulty": course.get("difficulty", "beginner"),
            "status": status,
        })

    return result


@router.post("/me/direction/{direction_id}")
def add_direction(direction_id: str, user: dict = Depends(get_current_user)):
    directions = read_list(DIR_FILE, "directions")
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")

    if "study_plan" not in user:
        user["study_plan"] = {"directions": [], "courses": []}

    if direction_id not in user["study_plan"]["directions"]:
        user["study_plan"]["directions"].append(direction_id)
        all_course_ids = set()
        subs = read_list(SUB_DIR_FILE, "subdirections")
        for sub_id in direction.get("subdirections", []):
            sub = next((s for s in subs if s["id"] == sub_id), None)
            if sub:
                all_course_ids.update(sub.get("courses", []))
        user["study_plan"]["courses"] = [
            c for c in user["study_plan"]["courses"] if c not in all_course_ids
        ]

    write_user(user["user_id"], user)
    return {"message": "方向已加入学习计划"}


@router.delete("/me/direction/{direction_id}")
def remove_direction(direction_id: str, user: dict = Depends(get_current_user)):
    if "study_plan" not in user:
        return {"message": "方向不在学习计划中"}

    user["study_plan"]["directions"] = [
        d for d in user["study_plan"]["directions"] if d != direction_id
    ]
    write_user(user["user_id"], user)
    return {"message": "方向已从学习计划中移除"}


@router.post("/me/course/{course_id}")
def add_course(course_id: str, user: dict = Depends(get_current_user)):
    if "study_plan" not in user:
        user["study_plan"] = {"directions": [], "courses": []}

    if course_id not in user["study_plan"]["courses"]:
        user["study_plan"]["courses"].append(course_id)

    write_user(user["user_id"], user)
    return {"message": "课程已加入学习计划"}


@router.delete("/me/course/{course_id}")
def remove_course(course_id: str, user: dict = Depends(get_current_user)):
    if "study_plan" not in user:
        return {"message": "课程不在学习计划中"}

    user["study_plan"]["courses"] = [
        c for c in user["study_plan"]["courses"] if c != course_id
    ]
    write_user(user["user_id"], user)
    return {"message": "课程已从学习计划中移除"}
