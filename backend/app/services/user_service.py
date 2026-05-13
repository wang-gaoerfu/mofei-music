"""用户相关业务逻辑"""
from sqlmodel import Session, select
from app.models.database import User
from app.core.config import settings


def get_user_by_openid(session: Session, openid: str) -> User | None:
    return session.exec(select(User).where(User.openid == openid)).first()


def get_user_by_id(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)