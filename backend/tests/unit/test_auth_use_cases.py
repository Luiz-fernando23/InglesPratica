import pytest
from application.use_cases.auth_use_cases import RegisterUseCase, LoginUseCase
from application.dtos.auth_dto import RegisterInput, LoginInput

class FakeUserRepo:
    def __init__(self):
        self.users = {}
        self._id = "11111111-1111-4111-8111-111111111111"
    async def get_by_email(self, email):
        return self.users.get(email)
    async def get_by_id(self, uid):
        for u in self.users.values():
            if str(u.id) == str(uid):
                return u
        return None
    async def create(self, name, email, password_hash):
        from domain.entities.user import User
        from uuid import UUID
        from datetime import datetime, timezone
        u = User(id=UUID(self._id), name=name, email=email, password_hash=password_hash, created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
        self.users[email]=u
        return u

@pytest.mark.asyncio
async def test_register_success():
    repo=FakeUserRepo()
    uc=RegisterUseCase(repo)
    result=await uc.execute(RegisterInput(name="Teste", email="a@a.com", password="123456"))
    assert result.access_token

@pytest.mark.asyncio
async def test_register_conflict():
    repo=FakeUserRepo()
    uc=RegisterUseCase(repo)
    await uc.execute(RegisterInput(name="Teste", email="a@a.com", password="123456"))
    from core.exceptions import ConflictError
    with pytest.raises(ConflictError):
        await uc.execute(RegisterInput(name="Teste", email="a@a.com", password="123456"))
