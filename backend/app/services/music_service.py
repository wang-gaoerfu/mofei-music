import asyncio
import aiofiles
import urllib.request
from datetime import datetime
from pathlib import Path

from sqlmodel import Session, select
from app.models.database import Music, User
from app.core.config import settings
from music_studio.providers import get_api_client
from music_studio.providers.minimax import MiniMaxProvider


class MusicTaskQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self._running = False

    async def put(self, task: dict):
        await self.queue.put(task)

    async def process(self):
        self._running = True
        while self._running:
            task = await self.queue.get()
            try:
                await self._generate_music(task)
            except Exception as e:
                print(f"Task failed: {e}")

    async def _generate_music(self, task: dict):
        music_uuid = task["uuid"]
        prompt = task["prompt"]
        lyrics = task.get("lyrics")

        # 调用 MiniMax API
        api_key = settings.minimax_api_key
        if not api_key:
            self._update_music_status(music_uuid, "failed", error="API key not configured")
            return

        client = MiniMaxProvider(api_key)
        try:
            resp = client.music_generation(
                model=settings.music_model,
                prompt=prompt,
                lyrics=lyrics,
            )
            client.raise_on_error(resp)
        except Exception as e:
            self._update_music_status(music_uuid, "failed", error=str(e))
            return

        audio_url = resp.get("data", {}).get("audio", "")
        if not audio_url:
            self._update_music_status(music_uuid, "failed", error="No audio URL returned")
            return

        # 下载音频
        local_path = await self._download_audio(music_uuid, audio_url)

        # 更新状态
        self._update_music_status(music_uuid, "completed", audio_url=audio_url, local_path=local_path)

    async def _download_audio(self, music_uuid: str, audio_url: str) -> str:
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
        local_file = settings.storage_dir / f"{music_uuid}.mp3"

        req = urllib.request.Request(audio_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()

        async with aiofiles.open(local_file, 'wb') as f:
            await f.write(data)

        return str(local_file)

    def _update_music_status(self, uuid: str, status: str, audio_url: str = "", local_path: str = "", error: str = ""):
        from app.core.database import engine
        with Session(engine) as session:
            music = session.exec(select(Music).where(Music.uuid == uuid)).first()
            if music:
                music.status = status
                if audio_url:
                    music.audio_url = audio_url
                if local_path:
                    music.local_path = local_path
                if error:
                    music.error = error
                if status == "completed":
                    music.completed_at = datetime.now()
                session.commit()


# 全局任务队列
task_queue = MusicTaskQueue()


async def start_worker():
    asyncio.create_task(task_queue.process())