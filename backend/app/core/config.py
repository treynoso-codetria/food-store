"""Configuración de la aplicación leída del archivo .env con pydantic-settings.

Cada atributo de Settings se completa con la variable de entorno del mismo
nombre. Si falta una obligatoria (sin valor por defecto), la API no arranca y
el error dice cuál falta: es mejor fallar al iniciar que en medio de un pedido.
"""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Nombre de la cookie HttpOnly donde viaja el JWT
COOKIE_NAME = "access_token"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Uno o varios orígenes separados por coma
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    # En producción (HTTPS) la cookie tiene que ser Secure
    COOKIE_SECURE: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  (los valores vienen del .env)


settings = get_settings()
