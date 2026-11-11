"""Endpoints /auth: registro, login con cookie HttpOnly, logout y perfil.

El JWT viaja SOLO en la cookie `access_token` (HttpOnly: JavaScript no puede
leerla). El cuerpo del login nunca incluye el token.
"""
from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    return service.registrar(data)


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    token = service.login(form.username, form.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, secure=settings.COOKIE_SECURE, samesite="lax")
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(usuario)
