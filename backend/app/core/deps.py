"""Dependencias de sesión y rol: get_current_user, get_current_active_user y require_role.

La protección real vive acá, en el backend: aunque el frontend oculte un botón,
cada endpoint protegido vuelve a validar la cookie y el rol.
"""
from collections.abc import Callable, Iterable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlmodel import Session

from app.core.config import COOKIE_NAME
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token de la cookie HttpOnly `access_token`.

    Hereda de OAuth2PasswordBearer para que /docs muestre el candado y el
    formulario de login. Si no hay cookie, acepta `Authorization: Bearer`
    (clientes que no son navegadores). El frontend nunca lee el token.
    """

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(COOKIE_NAME)
        if token:
            return token
        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token", auto_error=False)


def _no_autenticado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """Valida firma y vencimiento del JWT y carga el usuario del `sub`. 401 si no."""
    if not token:
        raise _no_autenticado()
    try:
        payload = decode_access_token(token)
        usuario_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError, TypeError):
        raise _no_autenticado()

    usuario = session.get(Usuario, usuario_id)
    if usuario is None:
        raise _no_autenticado()
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Además de un token válido, exige que la cuenta no esté desactivada. 400 si lo está."""
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return usuario


def require_role(roles: Iterable[str]) -> Callable[[Usuario], Usuario]:
    """Fábrica de dependencias: deja pasar solo si el rol del usuario está permitido. 403 si no.

        @router.post("", dependencies=[Depends(require_role(["admin"]))])
    """
    permitidos = set(roles)

    def verificar(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in permitidos:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para realizar esta acción")
        return usuario

    return verificar


# Atajo usado en los routers
solo_admin = require_role(["admin"])
