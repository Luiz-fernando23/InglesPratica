from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)

class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Não autorizado"):
        super().__init__(401, detail)

class NotFoundError(AppException):
    def __init__(self, detail: str = "Recurso não encontrado"):
        super().__init__(404, detail)

class ConflictError(AppException):
    def __init__(self, detail: str = "Conflito"):
        super().__init__(409, detail)

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
