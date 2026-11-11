"""Gestión de usuarios por el admin: listar, activar y desactivar.

Activar y desactivar son idempotentes: responden 200 aunque el estado no cambie.
"""
from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False, admin_id=None)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=True, admin_id=admin_id)

    def _cambiar_estado(self, usuario_id: int, disabled: bool, admin_id: int | None) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if disabled and usuario.id == admin_id:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propia cuenta")
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
