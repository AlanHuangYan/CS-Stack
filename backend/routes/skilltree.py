from fastapi import APIRouter, HTTPException
from backend.storage import read_list

router = APIRouter()
DIR_FILE = "directions.json"
DIR_KEY = "directions"
SUB_DIR_FILE = "subdirections.json"
SUB_DIR_KEY = "subdirections"
COURSE_FILE = "courses/index.json"
COURSE_KEY = "courses"


@router.get("/{direction_id}")
def get_skill_tree(direction_id: str):
    directions = read_list(DIR_FILE, DIR_KEY)
    direction = next((d for d in directions if d["id"] == direction_id), None)
    if not direction:
        raise HTTPException(status_code=404, detail="方向不存在")
    
    sub_ids = direction.get("subdirections", [])
    subdirections = read_list(SUB_DIR_FILE, SUB_DIR_KEY)
    courses = read_list(COURSE_FILE, COURSE_KEY)
    
    nodes = []
    
    for sub_id in sub_ids:
        sub = next((s for s in subdirections if s["id"] == sub_id), None)
        if not sub:
            continue
        
        sub_courses = []
        for c in courses:
            if c["id"] in sub.get("courses", []):
                sub_courses.append({
                    "id": c["id"],
                    "title": c["title"],
                    "difficulty": c["difficulty"],
                    "prerequisites": c.get("prerequisites", []),
                })
        
        nodes.append({
            "id": sub_id,
            "name": sub["name"],
            "courses": sub_courses,
        })
    
    return {
        "direction_id": direction_id,
        "direction_name": direction["name"],
        "nodes": nodes,
    }
