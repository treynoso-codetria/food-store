"""Repositorio genérico: acceso a datos de una tabla, sin reglas de negocio."""
from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """CRUD mínimo. Cada módulo hereda y agrega sus consultas propias.

    `add` hace flush (no commit): manda el INSERT/UPDATE para que el objeto
    tenga id, pero la transacción la cierra el Unit of Work.
    """

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
