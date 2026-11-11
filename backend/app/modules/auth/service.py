"""Registro y autenticación. Usa el modelo y el Unit of Work de usuarios."""
from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """El registro público siempre crea rol "user". 409 si username o email existen."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email.lower(),
                hashed_password=hash_password(data.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT firmado. 401 credenciales incorrectas; 400 cuenta desactivada."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
            return create_access_token(usuario.id or 0, extra={"role": usuario.role})
