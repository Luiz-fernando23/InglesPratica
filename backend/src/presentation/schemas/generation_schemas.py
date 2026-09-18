from pydantic import BaseModel, Field
from datetime import datetime

class GeneratedItemResponse(BaseModel):
    id: str
    content_en: str
    content_pt: str
    order_index: int

class GenerateRequest(BaseModel):
    count: int = Field(default=10, ge=1, le=25)
    allow_repeat: bool = False
    exclude: list[str] | None = None
    level: str | None = Field(default=None, pattern="^(basic|intermediate|advanced)$")

class GenerationBatchResponse(BaseModel):
    id: str
    type: str
    created_at: datetime
    items: list[GeneratedItemResponse]
    exhausted: bool = False

class HistoryPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[GenerationBatchResponse]
