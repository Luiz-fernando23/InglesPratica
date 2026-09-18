from uuid import UUID
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.exc import IntegrityError
from domain.entities.user import User
from infrastructure.database.models import (
    FavoriteModel,
    GenerationBatchModel,
    GeneratedItemModel,
)
from core.exceptions import ConflictError, NotFoundError
import hashlib


def _day_key(d: date) -> int:
    h = hashlib.sha256(f"ingles-na-mao-{d.isoformat()}".encode()).hexdigest()
    return int(h, 16)


class FavoritesService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, user: User, content_en: str, content_pt: str, kind: str):
        fav = FavoriteModel(
            user_id=str(user.id),
            content_en=content_en.strip(),
            content_pt=content_pt.strip(),
            kind=kind,
        )
        self.db.add(fav)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise ConflictError("Este item já está nos favoritos")
        await self.db.refresh(fav)
        return fav

    async def list(self, user: User, kind: str | None = None, limit: int = 100) -> tuple[list[FavoriteModel], int]:
        q = select(FavoriteModel).where(FavoriteModel.user_id == str(user.id))
        cq = select(func.count()).select_from(FavoriteModel).where(FavoriteModel.user_id == str(user.id))
        if kind:
            q = q.where(FavoriteModel.kind == kind)
            cq = cq.where(FavoriteModel.kind == kind)
        total = (await self.db.execute(cq)).scalar_one()
        q = q.order_by(FavoriteModel.created_at.desc()).limit(min(limit, 500))
        res = await self.db.execute(q)
        return list(res.scalars().all()), total

    async def remove(self, user: User, fav_id: str):
        res = await self.db.execute(
            select(FavoriteModel).where(
                FavoriteModel.id == fav_id,
                FavoriteModel.user_id == str(user.id),
            )
        )
        fav = res.scalar_one_or_none()
        if not fav:
            raise NotFoundError("Favorito não encontrado")
        await self.db.delete(fav)
        await self.db.commit()


class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def stats(self, user_id: UUID) -> dict:
        uid = str(user_id)
        total_batches = (await self.db.execute(
            select(func.count()).select_from(GenerationBatchModel).where(GenerationBatchModel.user_id == uid)
        )).scalar_one()
        total_items = (await self.db.execute(
            select(func.count()).select_from(GeneratedItemModel)
            .join(GenerationBatchModel, GenerationBatchModel.id == GeneratedItemModel.batch_id)
            .where(GenerationBatchModel.user_id == uid)
        )).scalar_one()
        total_favs = (await self.db.execute(
            select(func.count()).select_from(FavoriteModel).where(FavoriteModel.user_id == uid)
        )).scalar_one()

        # Dias distintos com atividade (batches) — funciona em SQLite e Postgres
        res = await self.db.execute(
            select(GenerationBatchModel.created_at).where(GenerationBatchModel.user_id == uid)
        )
        days: set[date] = set()
        for (ts,) in res.all():
            if isinstance(ts, datetime):
                d = ts.date() if ts.tzinfo is None else ts.astimezone(timezone.utc).date()
                days.add(d)
            elif isinstance(ts, date):
                days.add(ts)

        today = datetime.now(timezone.utc).date()
        streak = 0
        d = today
        # permite "hoje ainda sem estudo" sem quebrar o streak
        if d not in days:
            d = d - timedelta(days=1)
        while d in days:
            streak += 1
            d = d - timedelta(days=1)

        best = 0
        if days:
            ordered = sorted(days)
            run = 1
            best = 1
            for i in range(1, len(ordered)):
                if (ordered[i] - ordered[i - 1]).days == 1:
                    run += 1
                    best = max(best, run)
                else:
                    run = 1

        last7 = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            nxt = day + timedelta(days=1)
            bq = await self.db.execute(
                select(func.count()).select_from(GenerationBatchModel).where(
                    GenerationBatchModel.user_id == uid,
                    GenerationBatchModel.created_at >= datetime(day.year, day.month, day.day, tzinfo=timezone.utc),
                    GenerationBatchModel.created_at < datetime(nxt.year, nxt.month, nxt.day, tzinfo=timezone.utc),
                )
            )
            iq = await self.db.execute(
                select(func.count()).select_from(GeneratedItemModel)
                .join(GenerationBatchModel, GenerationBatchModel.id == GeneratedItemModel.batch_id)
                .where(
                    GenerationBatchModel.user_id == uid,
                    GenerationBatchModel.created_at >= datetime(day.year, day.month, day.day, tzinfo=timezone.utc),
                    GenerationBatchModel.created_at < datetime(nxt.year, nxt.month, nxt.day, tzinfo=timezone.utc),
                )
            )
            last7.append({"date": day.isoformat(), "batches": bq.scalar_one(), "items": iq.scalar_one()})

        return {
            "total_batches": total_batches,
            "total_items": total_items,
            "total_favorites": total_favs,
            "current_streak_days": streak,
            "best_streak_days": best,
            "last_7_days": last7,
        }

    async def daily(self, user_id: UUID) -> dict:
        from infrastructure.external.generator import PHRASES, WORDS

        today = datetime.now(timezone.utc).date()
        key = _day_key(today)
        word = WORDS[key % len(WORDS)]
        phrase = PHRASES[(key // len(WORDS)) % len(PHRASES)]

        seen_res = await self.db.execute(
            select(GeneratedItemModel.content_en)
            .join(GenerationBatchModel, GenerationBatchModel.id == GeneratedItemModel.batch_id)
            .where(GenerationBatchModel.user_id == str(user_id))
        )
        seen = set(seen_res.scalars().all())
        return {
            "date": today.isoformat(),
            "word_en": word[0],
            "word_pt": word[1],
            "phrase_en": phrase[0],
            "phrase_pt": phrase[1],
            "already_seen_word": word[0] in seen,
            "already_seen_phrase": phrase[0] in seen,
        }


async def delete_favorite_by_content(db: AsyncSession, user: User, content_en: str):
    res = await db.execute(
        select(FavoriteModel).where(
            FavoriteModel.user_id == str(user.id),
            func.lower(FavoriteModel.content_en) == content_en.strip().lower(),
        )
    )
    fav = res.scalar_one_or_none()
    if not fav:
        raise NotFoundError("Favorito não encontrado")
    await db.execute(delete(FavoriteModel).where(FavoriteModel.id == fav.id))
    await db.commit()
