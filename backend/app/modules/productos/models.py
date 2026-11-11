"""Modelo de tabla Producto."""
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(index=True, max_length=150)
    descripcion: str | None = Field(default=None)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)  # baja lógica

    # Categoria 1:N Producto
    categoria: "Categoria" = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
