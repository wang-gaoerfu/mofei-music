from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # API 配置
    minimax_api_key: str = ""
    minimax_base_url: str = "https://api.minimaxi.com/anthropic"
    music_model: str = "music-2.6"

    # JWT 配置
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7天

    # 数据库
    database_url: str = "sqlite:///./music_creator.db"

    # 文件存储
    storage_dir: Path = Path(__file__).parent.parent / "storage" / "musics"

    # 服务器
    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()