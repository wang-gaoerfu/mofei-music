from fastapi import APIRouter

router = APIRouter()

EXAMPLES = [
    {
        "id": "1",
        "category": "主歌",
        "name": "阳光运动",
        "prompt": "轻快的节拍，充满活力的电子音乐，适合运动时听",
        "tags": ["欢快", "电子", "运动"],
        "icon": "💪"
    },
    {
        "id": "2",
        "category": "主歌",
        "name": "深夜思考",
        "prompt": "安静的钢琴独奏，适合深夜独处时聆听",
        "tags": ["安静", "钢琴", "独处"],
        "icon": "🌙"
    },
    {
        "id": "3",
        "category": "副歌",
        "name": "情感高潮",
        "prompt": "弦乐与电子结合，情绪递进，适合副歌部分",
        "tags": ["情感", "弦乐", "递进"],
        "icon": "🔥"
    },
    {
        "id": "4",
        "category": "副歌",
        "name": "爆发释放",
        "prompt": "摇滚风格，鼓点强劲，适合情绪爆发",
        "tags": ["摇滚", "强烈", "爆发"],
        "icon": "⚡"
    },
    {
        "id": "5",
        "category": "情绪",
        "name": "治愈温暖",
        "prompt": "温柔的吉他与人声，治愈心灵",
        "tags": ["治愈", "温暖", "吉他"],
        "icon": "🌻"
    },
    {
        "id": "6",
        "category": "情绪",
        "name": "孤独沉思",
        "prompt": "低沉的贝斯与合成器，营造孤独氛围",
        "tags": ["孤独", "低沉", "电子"],
        "icon": "🎭"
    },
    {
        "id": "7",
        "category": "风格",
        "name": "国风古韵",
        "prompt": "古筝与笛子，典雅悠扬",
        "tags": ["国风", "古筝", "典雅"],
        "icon": "🏯"
    },
    {
        "id": "8",
        "category": "风格",
        "name": "流行R&B",
        "prompt": "慵懒的R&B节拍，现代感十足",
        "tags": ["R&B", "流行", "慵懒"],
        "icon": "🎷"
    }
]

CATEGORIES = ["主歌", "副歌", "情绪", "风格"]


@router.get("/examples")
def get_examples():
    result = []
    for cat in CATEGORIES:
        examples = [e for e in EXAMPLES if e["category"] == cat]
        result.append({"name": cat, "examples": examples})
    return {"categories": result}