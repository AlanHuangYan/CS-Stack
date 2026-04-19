import json
import os
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent.parent / "data"


def _ensure_dir(file_path: Path) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)


def read_json(file_name: str) -> Any:
    file_path = DATA_DIR / file_name
    if not file_path.exists():
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(file_name: str, data: Any) -> None:
    file_path = DATA_DIR / file_name
    _ensure_dir(file_path)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_list(file_name: str, key: str) -> list:
    data = read_json(file_name)
    if data is None:
        return []
    return data.get(key, [])


def write_list(file_name: str, key: str, items: list) -> None:
    data = read_json(file_name) or {}
    data[key] = items
    write_json(file_name, data)


def append_item(file_name: str, key: str, item: dict, id_field: str = "id") -> None:
    items = read_list(file_name, key)
    for i, existing in enumerate(items):
        if existing.get(id_field) == item.get(id_field):
            items[i] = item
            write_list(file_name, key, items)
            return
    items.append(item)
    write_list(file_name, key, items)


def delete_item(file_name: str, key: str, item_id: str, id_field: str = "id") -> bool:
    items = read_list(file_name, key)
    new_items = [i for i in items if i.get(id_field) != item_id]
    if len(new_items) == len(items):
        return False
    write_list(file_name, key, new_items)
    return True


def read_user(user_id: str) -> dict | None:
    return read_json(f"users/{user_id}.json")


def write_user(user_id: str, data: dict) -> None:
    write_json(f"users/{user_id}.json", data)
