from fastapi import APIRouter, HTTPException
from backend.models import Direction
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "directions.json"
KEY = "directions"


@router.get("/", response_model=list[Direction])
def list_directions():
    """获取所有专业方向。"""
    return read_list(FILE, KEY)


@router.get("/{direction_id}", response_model=Direction)
def get_direction(direction_id: str):
    """获取单个方向详情。"""
    directions = read_list(FILE, KEY)
    for d in directions:
        if d["id"] == direction_id:
            return d
    raise HTTPException(status_code=404, detail="方向不存在")


@router.post("/", response_model=Direction, status_code=201)
def create_direction(direction: Direction):
    """创建新方向。"""
    append_item(FILE, KEY, direction.model_dump())
    return direction


@router.put("/{direction_id}", response_model=Direction)
def update_direction(direction_id: str, direction: Direction):
    """更新方向信息。"""
    if direction.id != direction_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, direction.model_dump())
    return direction


@router.delete("/{direction_id}", status_code=204)
def delete_direction(direction_id: str):
    """删除方向。"""
    if not delete_item(FILE, KEY, direction_id):
        raise HTTPException(status_code=404, detail="方向不存在")
