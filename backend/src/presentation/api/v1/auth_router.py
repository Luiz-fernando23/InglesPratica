from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from presentation.schemas.auth_schemas import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse
from application.use_cases.auth_use_cases import RegisterUseCase, LoginUseCase, RefreshUseCase
from application.dtos.auth_dto import RegisterInput, LoginInput
from infrastructure.database.base import get_db
from infrastructure.repositories.user_repo import SqlAlchemyUserRepository

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    uc = RegisterUseCase(repo)
    result = await uc.execute(RegisterInput(name=body.name, email=body.email, password=body.password))
    return TokenResponse(access_token=result.access_token, refresh_token=result.refresh_token)

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    uc = LoginUseCase(repo)
    result = await uc.execute(LoginInput(email=body.email, password=body.password))
    return TokenResponse(access_token=result.access_token, refresh_token=result.refresh_token)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    uc = RefreshUseCase(repo)
    result = await uc.execute(body.refresh_token)
    return TokenResponse(access_token=result.access_token, refresh_token=result.refresh_token)
