from collections.abc import Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos activos filtrados y paginados. Devuelve (total, página)."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.nombre, Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, self.session.exec(consulta).all()

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila (SELECT ... FOR UPDATE).

        Si dos clientes compran el último ítem al mismo tiempo, el segundo
        espera a que termine la transacción del primero y ve el stock real.
        """
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()
