from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from presentation.dependencies.auth import get_current_user
from presentation.schemas.generation_schemas import HistoryPaginatedResponse, GenerationBatchResponse, GeneratedItemResponse
from application.use_cases.generation_use_cases import GetHistoryUseCase, GetBatchDetailUseCase
from infrastructure.database.base import get_db
from infrastructure.repositories.generation_repo import SqlAlchemyGenerationRepository
from domain.entities.user import User

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=HistoryPaginatedResponse)
async def list_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    type: str | None = Query(None, pattern="^(phrase|word)$"),
    q: str | None = Query(None, max_length=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = SqlAlchemyGenerationRepository(db)
    uc = GetHistoryUseCase(repo)
    batches, total = await uc.execute(user.id, type, page, page_size, q)
    items = [
        GenerationBatchResponse(
            id=str(b.id),
            type=b.type,
            created_at=b.created_at,
            items=[GeneratedItemResponse(id=str(i.id), content_en=i.content_en, content_pt=i.content_pt, order_index=i.order_index) for i in (b.items or [])],
        )
        for b in batches
    ]
    return HistoryPaginatedResponse(total=total, page=page, page_size=page_size, items=items)

@router.get("/{batch_id}", response_model=GenerationBatchResponse)
async def get_batch(batch_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyGenerationRepository(db)
    uc = GetBatchDetailUseCase(repo)
    batch = await uc.execute(user.id, batch_id)
    return GenerationBatchResponse(
        id=str(batch.id),
        type=batch.type,
        created_at=batch.created_at,
        items=[GeneratedItemResponse(id=str(i.id), content_en=i.content_en, content_pt=i.content_pt, order_index=i.order_index) for i in (batch.items or [])],
    )
