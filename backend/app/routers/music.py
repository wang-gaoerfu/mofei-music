from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import uuid

from app.core.database import get_session
from app.models.database import Music, User
from app.core.auth import get_current_user
from app.services.music_service import task_queue

router = APIRouter()


class CreateMusicRequest(BaseModel):
    prompt: str
    lyrics: Optional[str] = None
    style_tags: list[str] = []


@router.post("/create")
async def create_music(
    req: CreateMusicRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_id = current_user.id

    # 创作免费，不再检查次数

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


@router.get("/list")
def list_musics(
    page: int = 1,
    size: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_id = current_user.id
    offset = (page - 1) * size

    musics = session.exec(
        select(Music)
        .where(Music.user_id == user_id)
        .order_by(Music.created_at.desc())
        .offset(offset)
        .limit(size)
    ).all()

    total = session.scalar(select(func.count()).where(Music.user_id == user_id)) or 0

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
def get_music(
    music_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")

    # 检查音乐是否属于当前用户
    if music.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your music")

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


@router.get("/download/{music_id}")
def download_music(
    music_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")

    # 检查音乐是否发布（只有发布的才能被其他人下载）
    is_owner = music.user_id == current_user.id
    if not is_owner and not music.is_published:
        raise HTTPException(status_code=403, detail="Music not available")

    # 自己是作者 → 免费下载
    if is_owner:
        if not music.local_path:
            raise HTTPException(status_code=404, detail="File not ready")
        from fastapi.responses import FileResponse
        return FileResponse(music.local_path, filename=f"{music.title}.mp3", media_type="audio/mpeg")

    # 他人的音乐 → 检查余额并扣费
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.balance < 1.0:
        raise HTTPException(status_code=400, detail="Balance insufficient, need 1 yuan to download")

    # 扣费
    user.balance -= 1.0

    # 歌曲作者增加收益
    author = session.get(User, music.user_id)
    if author:
        author.total_earnings += 1.0

    # 歌曲下载次数+1
    music.download_count += 1

    session.commit()

    if not music.local_path:
        raise HTTPException(status_code=404, detail="File not ready")

    from fastapi.responses import FileResponse
    return FileResponse(music.local_path, filename=f"{music.title}.mp3", media_type="audio/mpeg")


@router.post("/publish/{music_id}")
def publish_music(
    music_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """将音乐发布到公共曲库"""
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    if music.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your music")
    if music.status != "completed":
        raise HTTPException(status_code=400, detail="Music not ready")

    music.is_published = True
    session.commit()
    return {"message": "Published successfully"}


@router.post("/unpublish/{music_id}")
def unpublish_music(
    music_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """将音乐从公共曲库下架"""
    music = session.exec(select(Music).where(Music.uuid == music_id)).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    if music.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your music")

    music.is_published = False
    session.commit()
    return {"message": "Unpublished successfully"}


@router.get("/public/list")
def list_public_musics(
    page: int = 1,
    size: int = 20,
    session: Session = Depends(get_session)
):
    """公共曲库列表（所有人可访问，无需登录）"""
    offset = (page - 1) * size

    musics = session.exec(
        select(Music)
        .where(Music.is_published == True, Music.status == "completed")
        .order_by(Music.download_count.desc(), Music.created_at.desc())
        .offset(offset)
        .limit(size)
    ).all()

    total = session.scalar(
        select(func.count()).where(Music.is_published == True, Music.status == "completed")
    ) or 0

    # 获取作者信息
    result = []
    for m in musics:
        author = session.get(User, m.user_id)
        result.append({
            "uuid": m.uuid,
            "title": m.title,
            "prompt": m.prompt,
            "style_tags": m.style_tags,
            "audio_url": m.audio_url,
            "download_count": m.download_count,
            "created_at": m.created_at,
            "author_nickname": author.nickname if author else "未知"
        })

    return {"list": result, "total": total, "page": page, "size": size}