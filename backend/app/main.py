from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user, music, examples
from app.core.database import create_db_and_tables

app = FastAPI(title="Mofei Music API", version="1.0.0")

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


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"message": "Mofei Music API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}