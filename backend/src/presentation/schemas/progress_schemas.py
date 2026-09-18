from pydantic import BaseModel, Field
from datetime import datetime

class FavoriteRequest(BaseModel):
    content_en: str = Field(min_length=1, max_length=1000)
    content_pt: str = Field(min_length=1, max_length=1000)
    kind: str = Field(default="word", pattern="^(word|phrase)$")

class FavoriteResponse(BaseModel):
    id: str
    content_en: str
    content_pt: str
    kind: str
    created_at: datetime

class FavoritesListResponse(BaseModel):
    total: int
    items: list[FavoriteResponse]

class BulkFavoriteItem(BaseModel):
    content_en: str = Field(min_length=1, max_length=1000)
    content_pt: str = Field(min_length=1, max_length=1000)
    kind: str = Field(default="word", pattern="^(word|phrase)$")

class BulkFavoriteRequest(BaseModel):
    items: list[BulkFavoriteItem] = Field(min_length=1, max_length=200)

class BulkFavoriteResponse(BaseModel):
    added: int
    skipped: int
    items: list[FavoriteResponse]

class DayCount(BaseModel):
    date: str
    batches: int
    items: int

class StatsResponse(BaseModel):
    total_batches: int
    total_items: int
    total_favorites: int
    current_streak_days: int
    best_streak_days: int
    last_7_days: list[DayCount]

class DailyResponse(BaseModel):
    date: str
    word_en: str
    word_pt: str
    phrase_en: str
    phrase_pt: str
    already_seen_word: bool
    already_seen_phrase: bool
