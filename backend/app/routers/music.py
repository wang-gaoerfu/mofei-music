from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.core.database import get_session
from app.models.database import Music, User
from app.services.music_service import task_queue

router = APIRouter()


class CreateMusicRequest(BaseModel):
    prompt: str
    lyrics: Optional[str] = None
    style_tags: list[str] = []


@router.post("/create")
async def create_music(req: CreateMusicRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    # TODO: 获取实际 user_id（从 token 解析）
    user_id = 1  # 临时硬编码，后续从认证获取

    # 检查次数
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.free_count <= 0 and user.balance <= 0:
        raise HTTPException(status_code=400, detail="No credit remaining")

    # 扣减次数
    if user.free_count > 0:
        user.free_count -= 1
    else:
        user.balance -= 1
    session.commit()

    # 创建音乐记录
    music_uuid = str(uuid.uuid4())
    music = Music(
        uuid=music_uuid,
        user_id=user_id,
        title=req.prompt[:50],
        prompt=req.prompt,
        lyrics=req.lyrics,
        style_tags=str(req.style_tags),
        status="generating"
    )
    session.add(music)
    session.commit()

    # 加入任务队列
    await task_queue.put({
        "uuid": music_uuid,
        "prompt": req.prompt,
        "lyrics": req.lyrics
    })

    return {"task_id": music_uuid, "status": "generating"}


@router.get("/status/{task_id}")
def get_music_status(task_id: str, session: Session = Depends(get_session)):
    music = session.exec(select(Music).where(Music.uuid == task_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")

    return {
        "task_id": music.uuid,
        "status": music.status,
        "audio_url": music.audio_url if music.status == "completed" else None,
        "error": music.error if music.status == "failed" else None
    }


@router.get("/{music_id}")
def get_music(music_id: str, session: Session = Depends(get_session)):
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")

    return {
        "uuid": music.uuid,
        "title": music.title,
        "prompt": music.prompt,
        "lyrics": music.lyrics,
        "style_tags": music.style_tags,
        "status": music.status,
        "audio_url": music.audio_url,
        "local_path": music.local_path,
        "created_at": music.created_at
    }


@router.get("/list")
def list_musics(page: int = 1, size: int = 20, session: Session = Depends(get_session)):
    # TODO: user_id 从 token 获取
    user_id = 1
    offset = (page - 1) * size

    musics = session.exec(
        select(Music)
        .where(Music.user_id == user_id)
        .order_by(Music.created_at.desc())
        .offset(offset)
        .limit(size)
    ).all()

    total = session.exec(
        select(Music).where(Music.user_id == user_id)
    ).count()

    return {
        "list": [
            {
                "uuid": m.uuid,
                "title": m.title,
                "status": m.status,
                "audio_url": m.audio_url,
                "created_at": m.created_at
            }
            for m in musics
        ],
        "total": total,
        "page": page,
        "size": size
    }


@router.get("/download/{music_id}")
def download_music(music_id: str, session: Session = Depends(get_session)):
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")

    if not music.local_path:
        raise HTTPException(status_code=404, detail="File not ready")

    from fastapi.responses import FileResponse
    return FileResponse(music.local_path, filename=f"{music.title}.mp3", media_type="audio/mpeg")