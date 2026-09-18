from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from domain.entities.user import User
from domain.repositories.protocols import IUserRepository
from infrastructure.database.models import UserModel

def _to_entity(m: UserModel) -> User:
    return User(
        id=UUID(m.id),
        name=m.name,
        email=m.email,
        password_hash=m.password_hash,
        created_at=m.created_at,
        updated_at=m.updated_at,
    )

class SqlAlchemyUserRepository(IUserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        res = await self.db.execute(select(UserModel).where(UserModel.email == email))
        row = res.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        res = await self.db.execute(select(UserModel).where(UserModel.id == str(user_id)))
        row = res.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def create(self, name: str, email: str, password_hash: str) -> User:
        model = UserModel(name=name, email=email, password_hash=password_hash)
        self.db.add(model)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(model)
        return _to_entity(model)
