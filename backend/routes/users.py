import uuid
import os
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.models import User, UserCreate, UserLogin, Token, CourseProgress
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.storage import read_json, write_user

router = APIRouter()
DATA_USERS_DIR = Path(__file__).parent.parent.parent / "data" / "users"


def _find_user_by_username(username: str) -> dict | None:
    for fname in os.listdir(DATA_USERS_DIR):
        if not fname.endswith(".json"):
            continue
        with open(DATA_USERS_DIR / fname, "r", encoding="utf-8") as f:
            user = json.load(f)
        if user.get("username") == username:
            return user
    return None


@router.post("/register", response_model=User, status_code=201)
def register(user_data: UserCreate):
    """用户注册。"""
    if _find_user_by_username(user_data.username):
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    user_id = str(uuid.uuid4())[:8]
    hashed = get_password_hash(user_data.password)
    
    user = {
        "user_id": user_id,
        "username": user_data.username,
        "password_hash": hashed,
        "created_at": datetime.utcnow().isoformat(),
        "selected_directions": [],
        "progress": {},
        "stats": {
            "total_xp": 0,
            "streak_days": 0,
            "badges": [],
            "milestones": []
        }
    }
    write_user(user_id, user)
    user.pop("password_hash")
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    """用户登录，返回 JWT token。"""
    user = _find_user_by_username(credentials.username)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="密码错误")
    token = create_access_token({"sub": user["user_id"]})
    return Token(access_token=token)


@router.get("/me", response_model=User)
def get_me(user: dict = Depends(get_current_user)):
    """获取当前用户信息。"""
    user.pop("password_hash", None)
    return user


@router.put("/me/directions")
def update_directions(directions: list[str], user: dict = Depends(get_current_user)):
    """更新用户选择的学习方向。"""
    user["selected_directions"] = directions
    write_user(user["user_id"], user)
    return {"message": "方向已更新", "directions": directions}


@router.get("/me/progress")
def get_progress(user: dict = Depends(get_current_user)):
    """获取用户学习进度。"""
    return user.get("progress", {})


@router.put("/me/progress/{course_id}")
def update_progress(course_id: str, progress: CourseProgress, user: dict = Depends(get_current_user)):
    """更新课程学习进度。"""
    if "progress" not in user:
        user["progress"] = {}
    user["progress"][course_id] = progress.model_dump()
    write_user(user["user_id"], user)
    return {"message": "进度已更新", "course_id": course_id, "progress": progress}


@router.get("/me/stats")
def get_stats(user: dict = Depends(get_current_user)):
    """获取用户统计信息。"""
    return user.get("stats", {})
