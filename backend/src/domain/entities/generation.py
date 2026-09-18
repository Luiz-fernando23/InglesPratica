from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID

BatchType = Literal["phrase", "word"]

@dataclass
class GeneratedItem:
    id: UUID
    batch_id: UUID
    content_en: str
    content_pt: str
    order_index: int

@dataclass
class GenerationBatch:
    id: UUID
    user_id: UUID
    type: BatchType
    created_at: datetime
    items: list[GeneratedItem] | None = None
