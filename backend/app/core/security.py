"""Hash de contraseñas con bcrypt y firma/validación de JWT con python-jose."""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# passlib 1.7.4 necesita bcrypt 4.0.1 (con bcrypt 5 falla): ambas versiones fijadas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | int, extra: dict[str, Any] | None = None) -> str:
    """Firma un JWT con `sub` (id del usuario) y `exp` (vencimiento)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": str(subject), "exp": expire, **(extra or {})}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Valida firma y vencimiento. Lanza jose.JWTError si el token no sirve."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
