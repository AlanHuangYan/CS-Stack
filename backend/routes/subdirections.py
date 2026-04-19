from fastapi import APIRouter, HTTPException
from backend.models import SubDirection
from backend.storage import read_list, write_list, append_item, delete_item

router = APIRouter()
FILE = "subdirections.json"
KEY = "subdirections"


@router.get("/", response_model=list[SubDirection])
def list_subdirections():
    """获取所有子方向。"""
    return read_list(FILE, KEY)


@router.get("/{subdirection_id}", response_model=SubDirection)
def get_subdirection(subdirection_id: str):
    """获取单个子方向详情。"""
    items = read_list(FILE, KEY)
    for item in items:
        if item["id"] == subdirection_id:
            return item
    raise HTTPException(status_code=404, detail="子方向不存在")


@router.post("/", response_model=SubDirection, status_code=201)
def create_subdirection(subdirection: SubDirection):
    """创建新子方向。"""
    append_item(FILE, KEY, subdirection.model_dump())
    return subdirection


@router.put("/{subdirection_id}", response_model=SubDirection)
def update_subdirection(subdirection_id: str, subdirection: SubDirection):
    """更新子方向信息。"""
    if subdirection.id != subdirection_id:
        raise HTTPException(status_code=400, detail="ID 不匹配")
    append_item(FILE, KEY, subdirection.model_dump())
    return subdirection


@router.delete("/{subdirection_id}", status_code=204)
def delete_subdirection(subdirection_id: str):
    """删除子方向。"""
    if not delete_item(FILE, KEY, subdirection_id):
        raise HTTPException(status_code=404, detail="子方向不存在")
