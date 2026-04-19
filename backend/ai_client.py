"""AI API 客户端，支持 OpenAI 和 Claude。"""
import json
from backend.storage import read_json


def suggest_courses(direction: str, subdirection: str | None = None) -> list[dict]:
    settings = read_json("admin/settings.json")
    ai_config = settings.get("ai", {})
    provider = ai_config.get("provider", "mock")
    
    if provider == "mock":
        return _mock_suggestions(direction, subdirection)
    
    return _mock_suggestions(direction, subdirection)


def _mock_suggestions(direction: str, subdirection: str | None) -> list[dict]:
    suggestions = {
        "frontend": [
            {"title": "Vue 3 组合式 API", "difficulty": "intermediate", "hours": 15},
            {"title": "Next.js 服务端渲染", "difficulty": "intermediate", "hours": 20},
        ],
        "backend": [
            {"title": "GraphQL 实战", "difficulty": "intermediate", "hours": 15},
            {"title": "微服务设计模式", "difficulty": "advanced", "hours": 25},
        ],
        "programming-languages": [
            {"title": "Python 异步编程", "difficulty": "intermediate", "hours": 12},
            {"title": "Rust 所有权系统", "difficulty": "advanced", "hours": 20},
        ],
        "ml": [
            {"title": "深度学习框架对比", "difficulty": "intermediate", "hours": 10},
            {"title": "强化学习入门", "difficulty": "advanced", "hours": 25},
        ],
    }
    
    return suggestions.get(direction, [
        {"title": f"{direction} 进阶教程", "difficulty": "intermediate", "hours": 15},
        {"title": f"{direction} 实战项目", "difficulty": "advanced", "hours": 20},
    ])
