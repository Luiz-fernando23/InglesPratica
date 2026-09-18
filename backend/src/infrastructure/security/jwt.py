from datetime import datetime, timedelta, timezone
from uuid import UUID
from jose import jwt, JWTError
from core.config import settings
from core.exceptions import UnauthorizedError

def _create_token(subject: str, expires_minutes: int, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def create_access_token(user_id: UUID) -> str:
    return _create_token(str(user_id), settings.jwt_access_token_expire_minutes, "access")

def create_refresh_token(user_id: UUID) -> str:
    return _create_token(str(user_id), settings.jwt_refresh_token_expire_minutes, "refresh")

def decode_token(token: str, expected_type: str = "access") -> UUID:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != expected_type:
            raise UnauthorizedError("Tipo de token inválido")
        sub = payload.get("sub")
        if not sub:
            raise UnauthorizedError("Token inválido")
        return UUID(sub)
    except JWTError as e:
        raise UnauthorizedError("Token inválido ou expirado") from e
