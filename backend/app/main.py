from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import user, music, examples
from app.core.database import create_db_and_tables
from app.services.music_service import start_worker, task_queue


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时：创建数据库表 + 启动 worker
    create_db_and_tables()
    await start_worker()
    yield
    # 关闭时停止 worker
    task_queue._running = False


app = FastAPI(title="Mofei Music API", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(music.router, prefix="/api/music", tags=["music"])
app.include_router(examples.router, prefix="/api", tags=["examples"])


@app.get("/")
def root():
    return {"message": "Mofei Music API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}