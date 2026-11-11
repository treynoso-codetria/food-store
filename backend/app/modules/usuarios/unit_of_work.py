from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    usuarios: UsuarioRepository

    def _crear_repositorios(self, session: Session) -> None:
        self.usuarios = UsuarioRepository(session)
