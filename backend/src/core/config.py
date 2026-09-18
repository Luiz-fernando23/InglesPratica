from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Ingles na Mao"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./ingles.db"
    # For Postgres: postgresql+asyncpg://user:password@db:5432/ingles
    jwt_secret_key: str = "change-me-super-secret-key-please-change-in-prod-32chars"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    vapid_private_key: str = ""
    vapid_public_key: str = ""
    vapid_subject: str = "mailto:voce@exemplo.com"
    static_dir: str = "/app/static"  # onde o Dockerfile.prod coloca o build do frontend

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def database_url_async(self) -> str:
        """Normaliza URLs de provedores (postgres://) para o driver asyncpg."""
        url = self.database_url
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        return url

settings = Settings()
