from uuid import UUID
from domain.repositories.protocols import IGenerationRepository
from domain.entities.generation import GenerationBatch
from infrastructure.external.generator import generate_phrases, generate_words
from core.exceptions import ConflictError

DEFAULT_COUNT = 10
MAX_COUNT = 25

def _sanitize(count: int | None, allow_repeat: bool | None, exclude: list[str] | str | None, level: str | None = None) -> tuple[int, bool, list[str], set[str]]:
    c = DEFAULT_COUNT if count is None else int(count)
    c = max(1, min(MAX_COUNT, c))
    ar = bool(allow_repeat) if allow_repeat is not None else False
    if exclude is None:
        ex: list[str] = []
    elif isinstance(exclude, str):
        ex = [w.strip() for w in exclude.split(",") if w.strip()]
    else:
        ex = [str(w).strip() for w in exclude if str(w).strip()]
    lv: set[str] = {level} if level in ("basic", "intermediate", "advanced") else set()
    return c, ar, ex, lv

class GeneratePhrasesUseCase:
    def __init__(self, gen_repo: IGenerationRepository):
        self.gen_repo = gen_repo

    async def execute(
        self,
        user_id: UUID,
        count: int | None = None,
        allow_repeat: bool | None = None,
        exclude: list[str] | str | None = None,
        level: str | None = None,
    ) -> tuple[GenerationBatch, bool]:
        c, ar, ex, lv = _sanitize(count, allow_repeat, exclude, level)
        seen = await self.gen_repo.get_seen_contents(user_id, "phrase")
        items, exhausted = generate_phrases(c, allow_repeat=ar, exclude=ex, seen=seen, levels=lv)
        if not items:
            raise ConflictError(
                "Sem frases novas disponíveis com esses filtros. Ative 'permitir repetição' ou limpe os filtros."
            )
        batch = await self.gen_repo.create_batch(user_id, "phrase", items)
        return batch, exhausted

class GenerateWordsUseCase:
    def __init__(self, gen_repo: IGenerationRepository):
        self.gen_repo = gen_repo

    async def execute(
        self,
        user_id: UUID,
        count: int | None = None,
        allow_repeat: bool | None = None,
        exclude: list[str] | str | None = None,
        level: str | None = None,
    ) -> tuple[GenerationBatch, bool]:
        c, ar, ex, lv = _sanitize(count, allow_repeat, exclude, level)
        seen = await self.gen_repo.get_seen_contents(user_id, "word")
        items, exhausted = generate_words(c, allow_repeat=ar, exclude=ex, seen=seen, levels=lv)
        if not items:
            raise ConflictError(
                "Sem palavras novas disponíveis com esses filtros. Ative 'permitir repetição' ou limpe os filtros."
            )
        batch = await self.gen_repo.create_batch(user_id, "word", items)
        return batch, exhausted

class GetHistoryUseCase:
    def __init__(self, gen_repo: IGenerationRepository):
        self.gen_repo = gen_repo

    async def execute(self, user_id: UUID, batch_type: str | None, page: int, page_size: int, q: str | None = None):
        limit = page_size
        offset = (page - 1) * page_size
        batches, total = await self.gen_repo.list_batches(user_id, batch_type, limit, offset, q)
        return batches, total

class GetBatchDetailUseCase:
    def __init__(self, gen_repo: IGenerationRepository):
        self.gen_repo = gen_repo

    async def execute(self, user_id: UUID, batch_id: UUID) -> GenerationBatch:
        from core.exceptions import NotFoundError
        batch = await self.gen_repo.get_batch(batch_id, user_id)
        if not batch:
            raise NotFoundError("Lote não encontrado")
        return batch
