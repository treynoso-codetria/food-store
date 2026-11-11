"""Modelos de tabla Pedido y DetallePedido.

DetallePedido COPIA nombre_producto y precio_unitario del producto al crear el
pedido (RN-05): si mañana cambia el precio, el pedido histórico no cambia.
Los pedidos no se borran: se cancelan.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", index=True, max_length=20)
    forma_pago: str = Field(max_length=20)  # EFECTIVO | TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    # Usuario 1:N Pedido
    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido (composición: las líneas pertenecen al pedido)
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "DetallePedido.id"},
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    # Pedido 1:N DetallePedido
    pedido: "Pedido" = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: "Producto" = Relationship(back_populates="detalles")
