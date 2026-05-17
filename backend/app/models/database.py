from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    openid: str = Field(index=True, unique=True)
    nickname: str = ""
    free_count: int = Field(default=0)  # 创作次数已废弃，免费创作
    balance: float = Field(default=0.0)  # 下载余额（充值）
    total_earnings: float = Field(default=0.0)  # 总收益（别人下载你的歌）
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Music(SQLModel, table=True):
    __tablename__ = "musics"
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: str = Field(index=True, unique=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = ""
    prompt: str = ""
    lyrics: Optional[str] = None
    style_tags: str = "[]"  # JSON 数组
    status: str = "generating"  # generating/completed/failed
    audio_url: str = ""
    local_path: str = ""
    model: str = "music-2.6"
    is_published: bool = Field(default=False)  # 是否发布到公共曲库
    download_count: int = Field(default=0)  # 下载次数
    error: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


class Recharge(SQLModel, table=True):
    __tablename__ = "recharges"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    amount: int = 0  # 充值次数
    price: float = 0.0  # 支付金额
    status: str = "pending"  # pending/completed/refunded
    transaction_id: str = ""
    created_at: datetime = Field(default_factory=datetime.now)