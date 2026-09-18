from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from uuid import UUID
from core.exceptions import UnauthorizedError
from infrastructure.security.jwt import decode_token
from infrastructure.database.base import get_db
from infrastructure.repositories.user_repo import SqlAlchemyUserRepository
from domain.entities.user import User

async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Token não fornecido")
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token, expected_type="access")
    repo = SqlAlchemyUserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedError("Usuário não encontrado")
    return user
