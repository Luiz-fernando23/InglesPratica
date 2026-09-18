from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from presentation.dependencies.auth import get_current_user
from presentation.schemas.progress_schemas import (
    FavoriteRequest,
    FavoriteResponse,
    FavoritesListResponse,
    BulkFavoriteRequest,
    BulkFavoriteResponse,
    StatsResponse,
    DailyResponse,
)
from application.use_cases.progress_use_cases import (
    FavoritesService,
    ProgressService,
    delete_favorite_by_content,
)
from infrastructure.database.base import get_db
from domain.entities.user import User

fav_router = APIRouter(prefix="/favorites", tags=["favorites"])
progress_router = APIRouter(prefix="/progress", tags=["progress"])


def _to_fav(f):
    return FavoriteResponse(
        id=str(f.id), content_en=f.content_en, content_pt=f.content_pt,
        kind=f.kind, created_at=f.created_at,
    )


@fav_router.post("", response_model=FavoriteResponse, status_code=201)
async def add_favorite(
    body: FavoriteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = FavoritesService(db)
    fav = await svc.add(user, body.content_en, body.content_pt, body.kind)
    return _to_fav(fav)


@fav_router.get("", response_model=FavoritesListResponse)
async def list_favorites(
    kind: str | None = Query(None, pattern="^(word|phrase)$"),
    limit: int = Query(100, ge=1, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = FavoritesService(db)
    items, total = await svc.list(user, kind, limit)
    return FavoritesListResponse(total=total, items=[_to_fav(f) for f in items])


@fav_router.post("/bulk", response_model=BulkFavoriteResponse, status_code=201)
async def bulk_add_favorites(
    body: BulkFavoriteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = FavoritesService(db)
    added: list = []
    skipped = 0
    for it in body.items:
        try:
            fav = await svc.add(user, it.content_en, it.content_pt, it.kind)
            added.append(_to_fav(fav))
        except Exception:
            skipped += 1
    return BulkFavoriteResponse(added=len(added), skipped=skipped, items=added)


@fav_router.delete("/by-content", status_code=204)
async def remove_favorite_by_content(
    content_en: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_favorite_by_content(db, user, content_en)
    return None


@fav_router.delete("/{fav_id}", status_code=204)
async def remove_favorite(
    fav_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = FavoritesService(db)
    await svc.remove(user, fav_id)
    return None


@progress_router.get("/stats", response_model=StatsResponse)
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ProgressService(db)
    return StatsResponse(**await svc.stats(user.id))


@progress_router.get("/daily", response_model=DailyResponse)
async def get_daily(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ProgressService(db)
    return DailyResponse(**await svc.daily(user.id))
