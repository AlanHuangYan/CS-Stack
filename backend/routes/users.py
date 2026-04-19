import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from backend.models import User, UserCreate, UserLogin, Token, CourseProgress, ChangePasswordRequest
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.storage import read_json, write_user, read_all_users, write_all_users

logger = logging.getLogger("cs_stack")

router = APIRouter()


def _find_user_by_username(username: str) -> dict | None:
    for user in read_all_users():
        if user.get("username") == username:
            return user
    return None


@router.post("/register", response_model=User, status_code=201)
def register(user_data: UserCreate):
    logger.info("Register request for username: %s", user_data.username)
    try:
        if _find_user_by_username(user_data.username):
            logger.warning("Username already exists: %s", user_data.username)
            raise HTTPException(status_code=400, detail="用户名已存在")

        import re
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", user_data.email):
            raise HTTPException(status_code=400, detail="邮箱格式不正确")

        user_id = str(uuid.uuid4())[:8]
        hashed = get_password_hash(user_data.password)

        user = {
            "user_id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "selected_directions": [],
            "progress": {},
            "stats": {
                "total_xp": 0,
                "streak_days": 0,
                "badges": [],
                "milestones": [],
                "checkin_calendar": {}
            }
        }
        write_user(user_id, user)
        logger.info("User registered successfully: %s (id=%s)", user_data.username, user_id)
        result = dict(user)
        result.pop("password_hash")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Registration failed for user %s: %s", user_data.username, e)
        raise HTTPException(status_code=500, detail="注册失败")


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    logger.info("Login request for username: %s", credentials.username)
    user = _find_user_by_username(credentials.username)
    if user is None:
        logger.warning("User not found: %s", credentials.username)
        raise HTTPException(status_code=404, detail="用户不存在")
    if user.get("disabled"):
        logger.warning("Disabled user attempted login: %s", credentials.username)
        raise HTTPException(status_code=403, detail="账号已被禁用，请联系管理员")
    if not verify_password(credentials.password, user["password_hash"]):
        logger.warning("Wrong password for user: %s", credentials.username)
        raise HTTPException(status_code=401, detail="密码错误")
    token = create_access_token({"sub": user["user_id"]})
    logger.info("Login successful for user: %s", credentials.username)
    return Token(access_token=token)


@router.post("/me/change-password")
def change_password(req: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    logger.info("Password change request for user: %s", user.get("username"))
    if not verify_password(req.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="原密码错误")
    new_hash = get_password_hash(req.new_password)
    user_obj = read_user(user["user_id"])
    if user_obj:
        user_obj["password_hash"] = new_hash
        write_user(user["user_id"], user_obj)
        logger.info("Password changed successfully for user: %s", user.get("username"))
    return {"message": "密码已修改"}


@router.get("/me", response_model=User)
def get_me(user: dict = Depends(get_current_user)):
    result = dict(user)
    result.pop("password_hash", None)
    # Ensure learning_preferences is included
    if "learning_preferences" not in result:
        result["learning_preferences"] = {}
    return result


@router.put("/me/directions")
def update_directions(directions: list[str], user: dict = Depends(get_current_user)):
    user["selected_directions"] = directions
    write_user(user["user_id"], user)
    return {"message": "方向已更新", "directions": directions}


@router.post("/me/preferences")
def save_preferences(
    prefs: dict,
    user: dict = Depends(get_current_user),
):
    skill_level = prefs.get("skill_level")
    learning_goal = prefs.get("learning_goal")
    selected_directions = prefs.get("selected_directions", [])
    
    if "learning_preferences" not in user:
        user["learning_preferences"] = {}
    
    user["learning_preferences"]["skill_level"] = skill_level
    user["learning_preferences"]["learning_goal"] = learning_goal
    user["selected_directions"] = selected_directions
    
    write_user(user["user_id"], user)
    return {"message": "偏好已保存", "directions": selected_directions}


@router.get("/me/progress")
def get_progress(user: dict = Depends(get_current_user)):
    return user.get("progress", {})


@router.put("/me/progress/{course_id}")
def update_progress(course_id: str, progress: CourseProgress, user: dict = Depends(get_current_user)):
    if "progress" not in user:
        user["progress"] = {}
    user["progress"][course_id] = progress.model_dump()
    write_user(user["user_id"], user)
    return {"message": "进度已更新", "course_id": course_id, "progress": progress}


@router.get("/me/stats")
def get_stats(user: dict = Depends(get_current_user)):
    return user.get("stats", {})


@router.post("/me/checkin")
def checkin(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    stats = user.get("stats", {})
    checkin_calendar = stats.get("checkin_calendar", {})

    if today in checkin_calendar:
        raise HTTPException(status_code=400, detail="今日已打卡")

    checkin_calendar[today] = True
    stats["checkin_calendar"] = checkin_calendar

    streak = 1
    prev_date = datetime.now(timezone.utc)
    dates = sorted(checkin_calendar.keys(), reverse=True)
    for i, date_str in enumerate(dates[1:], 1):
        prev_date = prev_date.replace(day=prev_date.day - 1)
        if date_str == prev_date.strftime("%Y-%m-%d"):
            streak += 1
        else:
            break

    stats["streak_days"] = streak
    user["stats"] = stats
    write_user(user["user_id"], user)
    logger.info("Checkin successful for user %s, streak: %d", user.get("username"), streak)
    return {"message": "打卡成功", "streak_days": streak, "today": today}


@router.get("/me/checkin/calendar")
def get_checkin_calendar(user: dict = Depends(get_current_user)):
    stats = user.get("stats", {})
    return {"checkin_calendar": stats.get("checkin_calendar", {}), "streak_days": stats.get("streak_days", 0)}
