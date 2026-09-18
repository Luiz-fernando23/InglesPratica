from domain.repositories.protocols import IUserRepository
from application.dtos.auth_dto import RegisterInput, LoginInput, TokenOutput
from infrastructure.security.password import hash_password, verify_password
from infrastructure.security.jwt import create_access_token, create_refresh_token, decode_token
from core.exceptions import ConflictError, UnauthorizedError

class RegisterUseCase:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def execute(self, data: RegisterInput) -> TokenOutput:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictError("Email já cadastrado")
        user = await self.user_repo.create(data.name, data.email, hash_password(data.password))
        return TokenOutput(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))

class LoginUseCase:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def execute(self, data: LoginInput) -> TokenOutput:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Credenciais inválidas")
        return TokenOutput(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))

class RefreshUseCase:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def execute(self, refresh_token: str) -> TokenOutput:
        user_id = decode_token(refresh_token, expected_type="refresh")
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedError("Usuário não encontrado")
        return TokenOutput(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))
