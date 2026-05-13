from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_session
from app.models.database import User
from app.core.config import settings
from jose import jwt

router = APIRouter()


class RegisterRequest(BaseModel):
    openid: str
    nickname: str = ""


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now().timestamp() + settings.access_token_expire_minutes * 60
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


@router.post("/register", response_model=LoginResponse)
def register(req: RegisterRequest, session: Session = Depends(get_session)):
    # 检查是否已注册
    user = session.exec(select(User).where(User.openid == req.openid)).first()
    if user:
        # 已注册，直接登录
        token = create_access_token({"sub": str(user.id), "openid": user.openid})
        return LoginResponse(
            access_token=token,
            user={
                "id": user.id,
                "nickname": user.nickname,
                "free_count": user.free_count,
                "balance": user.balance
            }
        )

    # 新用户注册
    user = User(
        openid=req.openid,
        nickname=req.nickname or "用户",
        free_count=3,  # 注册送3次
        balance=0
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token({"sub": str(user.id), "openid": user.openid})
    return LoginResponse(
        access_token=token,
        user={
            "id": user.id,
            "nickname": user.nickname,
            "free_count": user.free_count,
            "balance": user.balance
        }
    )


@router.get("/info")
def get_user_info(session: Session = Depends(get_session)):
    # TODO: 从 token 获取 user_id
    return {"message": "需要认证"}