"""Endpoints /admin/usuarios (solo admin)."""
from fastapi import APIRouter, Depends

from app.core.deps import solo_admin
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic], dependencies=[Depends(solo_admin)])
def listar_usuarios(service: UsuarioService = Depends(get_usuario_service)) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic, dependencies=[Depends(solo_admin)])
def activar_usuario(usuario_id: int, service: UsuarioService = Depends(get_usuario_service)) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(solo_admin),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    assert admin.id is not None
    return service.desactivar(usuario_id, admin_id=admin.id)
