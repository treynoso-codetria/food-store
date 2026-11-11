"""Unit of Work base.

Agrupa todas las operaciones de un caso de uso en UNA transacción:

    with self.uow as uow:
        producto = uow.productos.get_by_id(1)
        producto.stock -= 2
        uow.pedidos.add(pedido)

- __enter__: abre la sesión y crea los repositorios del módulo.
- __exit__ : commit si el bloque terminó bien; rollback si hubo una excepción
             (y la deja propagar para que el Router la traduzca a HTTP); close
             siempre.

Es el ÚNICO lugar donde se llama a session.commit(). Ningún Service ni Router
lo hace.
"""
from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work se usa dentro de un bloque `with`")
        return self._session

    def _crear_repositorios(self, session: Session) -> None:
        """Cada módulo la redefine para exponer sus repositorios sobre la sesión."""

    def __enter__(self) -> Self:
        self._session = self._session_factory()
        self._crear_repositorios(self._session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> bool:
        session = self.session
        try:
            if exc_type is None:
                session.commit()
            else:
                session.rollback()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
            self._session = None
        return False  # nunca se traga la excepción
