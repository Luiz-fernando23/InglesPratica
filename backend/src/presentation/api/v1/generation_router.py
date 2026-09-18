from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from presentation.dependencies.auth import get_current_user
from presentation.schemas.generation_schemas import (
    GenerationBatchResponse,
    GeneratedItemResponse,
    GenerateRequest,
)
from application.use_cases.generation_use_cases import GeneratePhrasesUseCase, GenerateWordsUseCase
from infrastructure.database.base import get_db
from infrastructure.repositories.generation_repo import SqlAlchemyGenerationRepository
from domain.entities.user import User

router = APIRouter(prefix="/generation", tags=["generation"])

def _to_response(batch, exhausted: bool = False):
    return GenerationBatchResponse(
        id=str(batch.id),
        type=batch.type,
        created_at=batch.created_at,
        items=[GeneratedItemResponse(id=str(i.id), content_en=i.content_en, content_pt=i.content_pt, order_index=i.order_index) for i in (batch.items or [])],
        exhausted=exhausted,
    )

@router.post("/phrases", response_model=GenerationBatchResponse)
async def generate_phrases(
    body: GenerateRequest | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = SqlAlchemyGenerationRepository(db)
    uc = GeneratePhrasesUseCase(repo)
    opts = body or GenerateRequest()
    batch, exhausted = await uc.execute(user.id, count=opts.count, allow_repeat=opts.allow_repeat, exclude=opts.exclude)
    return _to_response(batch, exhausted)

@router.post("/words", response_model=GenerationBatchResponse)
async def generate_words(
    body: GenerateRequest | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = SqlAlchemyGenerationRepository(db)
    uc = GenerateWordsUseCase(repo)
    opts = body or GenerateRequest()
    batch, exhausted = await uc.execute(user.id, count=opts.count, allow_repeat=opts.allow_repeat, exclude=opts.exclude)
    return _to_response(batch, exhausted)
