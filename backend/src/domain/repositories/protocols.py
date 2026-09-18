from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from domain.entities.user import User
from domain.entities.generation import GenerationBatch, GeneratedItem

class IUserRepository(ABC):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]: ...

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> Optional[User]: ...

    @abstractmethod
    async def create(self, name: str, email: str, password_hash: str) -> User: ...

class IGenerationRepository(ABC):
    @abstractmethod
    async def create_batch(self, user_id: UUID, batch_type: str, items: list[tuple[str, str]]) -> GenerationBatch: ...

    @abstractmethod
    async def list_batches(self, user_id: UUID, batch_type: Optional[str], limit: int, offset: int, q: Optional[str] = None) -> tuple[list[GenerationBatch], int]: ...

    @abstractmethod
    async def get_batch(self, batch_id: UUID, user_id: UUID) -> Optional[GenerationBatch]: ...

    @abstractmethod
    async def get_items_by_batch(self, batch_id: UUID) -> list[GeneratedItem]: ...

    @abstractmethod
    async def get_seen_contents(self, user_id: UUID, batch_type: str) -> set[str]: ...
