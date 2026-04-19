from fastapi import APIRouter, HTTPException, Depends
from backend.auth import get_current_user
from backend.storage import read_user, write_user

router = APIRouter()

XP_RULES = {
    "knowledge_completed": 10,
    "course_completed_beginner": 50,
    "course_completed_intermediate": 100,
    "course_completed_advanced": 200,
    "first_login": 5,
    "streak_7_days": 100,
    "streak_30_days": 500,
}

BADGES = {
    "first_course": {"name": "初次学习", "description": "完成第一门课程", "icon": "🎓"},
    "knowledge_10": {"name": "知识点达人", "description": "掌握 10 个知识点", "icon": "📚"},
    "knowledge_50": {"name": "知识渊博", "description": "掌握 50 个知识点", "icon": "🎯"},
    "week_warrior": {"name": "七日战士", "description": "连续打卡 7 天", "icon": "🔥"},
    "month_master": {"name": "月度达人", "description": "连续打卡 30 天", "icon": "👑"},
    "beginner_done": {"name": "入门达成", "description": "完成所有入门课程", "icon": "🌱"},
    "advanced_done": {"name": "高级达成", "description": "完成所有高级课程", "icon": "🏆"},
    "xp_1000": {"name": "经验值千", "description": "累计 1000 经验值", "icon": "⭐"},
    "xp_5000": {"name": "经验值五千", "description": "累计 5000 经验值", "icon": "💫"},
}


def _award_badge_if_missing(user: dict, badge_id: str) -> bool:
    stats = user.get("stats", {})
    badges = stats.get("badges", [])
    
    for b in badges:
        if isinstance(b, dict) and b.get("badge_id") == badge_id:
            return False
    
    badge_def = BADGES.get(badge_id, {})
    from datetime import datetime, timezone
    new_badge = {
        "badge_id": badge_id,
        "name": badge_def.get("name", badge_id),
        "description": badge_def.get("description", ""),
        "icon": badge_def.get("icon", "🏅"),
        "awarded_at": datetime.now(timezone.utc).isoformat(),
    }
    
    badges.append(new_badge)
    stats["badges"] = badges
    user["stats"] = stats
    return True


def _add_xp(user: dict, xp: int, action: str) -> int:
    stats = user.get("stats", {})
    stats["total_xp"] = stats.get("total_xp", 0) + xp
    user["stats"] = stats
    return stats["total_xp"]


def check_achievements(user: dict, course_id: str, new_kp_count: int) -> list[dict]:
    stats = user.get("stats", {})
    progress = user.get("progress", {})
    new_badges_awarded = []
    
    total_kp_completed = sum(
        len(p.get("completed_knowledge", [])) for p in progress.values()
    )
    
    if total_kp_completed >= 1 and new_kp_count > 0:
        if _award_badge_if_missing(user, "first_course"):
            new_badges_awarded.append(BADGES["first_course"])
    
    if total_kp_completed >= 10:
        if _award_badge_if_missing(user, "knowledge_10"):
            new_badges_awarded.append(BADGES["knowledge_10"])
    
    if total_kp_completed >= 50:
        if _award_badge_if_missing(user, "knowledge_50"):
            new_badges_awarded.append(BADGES["knowledge_50"])
    
    if stats.get("streak_days", 0) >= 7:
        if _award_badge_if_missing(user, "week_warrior"):
            new_badges_awarded.append(BADGES["week_warrior"])
    
    if stats.get("streak_days", 0) >= 30:
        if _award_badge_if_missing(user, "month_master"):
            new_badges_awarded.append(BADGES["month_master"])
    
    total_xp = stats.get("total_xp", 0)
    if total_xp >= 1000:
        if _award_badge_if_missing(user, "xp_1000"):
            new_badges_awarded.append(BADGES["xp_1000"])
    
    if total_xp >= 5000:
        if _award_badge_if_missing(user, "xp_5000"):
            new_badges_awarded.append(BADGES["xp_5000"])
    
    return new_badges_awarded


@router.get("/me")
def get_xp_info(user: dict = Depends(get_current_user)):
    stats = user.get("stats", {})
    return {
        "total_xp": stats.get("total_xp", 0),
        "badges": stats.get("badges", []),
        "milestones": stats.get("milestones", []),
        "streak_days": stats.get("streak_days", 0),
    }


@router.post("/me/award-kp")
def award_knowledge_points(count: int = 1, user: dict = Depends(get_current_user)):
    xp_earned = count * XP_RULES["knowledge_completed"]
    new_total = _add_xp(user, xp_earned, f"knowledge_completed x{count}")
    
    new_badges = check_achievements(user, "", count)
    user_obj = read_user(user["user_id"])
    if user_obj:
        user_obj["stats"] = user["stats"]
        write_user(user["user_id"], user_obj)
    
    return {
        "xp_earned": xp_earned,
        "total_xp": new_total,
        "new_badges": new_badges,
    }
