from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.exceptions import AppException, app_exception_handler
from core.logging import setup_logging
from presentation.api.v1.auth_router import router as auth_router
from presentation.api.v1.generation_router import router as gen_router
from presentation.api.v1.history_router import router as hist_router
from presentation.api.v1.progress_router import fav_router, progress_router
from infrastructure.database.base import engine
from infrastructure.database.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    # create tables if not exists (for sqlite dev; in prod use alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Inglês na Mão API", version="0.1.0", lifespan=lifespan)

app.add_exception_handler(AppException, app_exception_handler)  # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(gen_router, prefix="/api/v1")
app.include_router(hist_router, prefix="/api/v1")
app.include_router(fav_router, prefix="/api/v1")
app.include_router(progress_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Inglês na Mão API - see /docs"}
