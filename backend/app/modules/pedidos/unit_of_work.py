from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos sobre la MISMA sesión.

    Así el descuento de stock y la creación del pedido viajan en una sola
    transacción: o se guardan las dos cosas o ninguna.
    """

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _crear_repositorios(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)
