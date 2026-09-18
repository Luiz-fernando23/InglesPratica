from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from domain.entities.generation import GenerationBatch, GeneratedItem
from domain.repositories.protocols import IGenerationRepository
from infrastructure.database.models import GenerationBatchModel, GeneratedItemModel

def _to_item(m: GeneratedItemModel) -> GeneratedItem:
    return GeneratedItem(id=UUID(m.id), batch_id=UUID(m.batch_id), content_en=m.content_en, content_pt=m.content_pt, order_index=m.order_index)

def _to_batch(m: GenerationBatchModel, include_items: bool = True) -> GenerationBatch:
    items = [_to_item(i) for i in m.items] if include_items and m.items else None
    return GenerationBatch(id=UUID(m.id), user_id=UUID(m.user_id), type=m.type, created_at=m.created_at, items=items)  # type: ignore

class SqlAlchemyGenerationRepository(IGenerationRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_batch(self, user_id: UUID, batch_type: str, items: list[tuple[str, str]]) -> GenerationBatch:
        batch = GenerationBatchModel(user_id=str(user_id), type=batch_type)
        self.db.add(batch)
        await self.db.flush()
        for idx, (en, pt) in enumerate(items):
            item = GeneratedItemModel(batch_id=batch.id, content_en=en, content_pt=pt, order_index=idx)
            self.db.add(item)
        await self.db.commit()
        # reload with items
        res = await self.db.execute(select(GenerationBatchModel).options(selectinload(GenerationBatchModel.items)).where(GenerationBatchModel.id == batch.id))
        model = res.scalar_one()
        return _to_batch(model)

    async def list_batches(self, user_id: UUID, batch_type: Optional[str], limit: int, offset: int) -> tuple[list[GenerationBatch], int]:
        base_q = select(GenerationBatchModel).where(GenerationBatchModel.user_id == str(user_id))
        count_q = select(func.count()).select_from(GenerationBatchModel).where(GenerationBatchModel.user_id == str(user_id))
        if batch_type:
            base_q = base_q.where(GenerationBatchModel.type == batch_type)
            count_q = count_q.where(GenerationBatchModel.type == batch_type)
        total = (await self.db.execute(count_q)).scalar_one()
        base_q = base_q.options(selectinload(GenerationBatchModel.items)).order_by(GenerationBatchModel.created_at.desc()).limit(limit).offset(offset)
        res = await self.db.execute(base_q)
        batches = [_to_batch(m) for m in res.scalars().all()]
        return batches, total

    async def get_batch(self, batch_id: UUID, user_id: UUID) -> Optional[GenerationBatch]:
        res = await self.db.execute(
            select(GenerationBatchModel).options(selectinload(GenerationBatchModel.items)).where(GenerationBatchModel.id == str(batch_id), GenerationBatchModel.user_id == str(user_id))
        )
        m = res.scalar_one_or_none()
        return _to_batch(m) if m else None

    async def get_items_by_batch(self, batch_id: UUID) -> list[GeneratedItem]:
        res = await self.db.execute(select(GeneratedItemModel).where(GeneratedItemModel.batch_id == str(batch_id)).order_by(GeneratedItemModel.order_index))
        return [_to_item(m) for m in res.scalars().all()]

    async def get_seen_contents(self, user_id: UUID, batch_type: str) -> set[str]:
        q = (
            select(GeneratedItemModel.content_en)
            .join(GenerationBatchModel, GenerationBatchModel.id == GeneratedItemModel.batch_id)
            .where(
                GenerationBatchModel.user_id == str(user_id),
                GenerationBatchModel.type == batch_type,
            )
        )
        res = await self.db.execute(q)
        return set(res.scalars().all())
