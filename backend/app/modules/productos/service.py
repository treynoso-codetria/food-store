"""Reglas de productos: categoría válida, stock y disponibilidad, baja lógica."""
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ── Excepciones de dominio ─────────────────────────────────────────────────
class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada o dada de baja")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._get_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            # exclude_unset: solo lo que vino en el cuerpo; exclude_none: null no pisa obligatorios
            cambios = data.model_dump(exclude_unset=True)
            for campo in ("nombre", "precio_base", "stock", "disponible", "categoria_id"):
                if campo in cambios and cambios[campo] is None:
                    del cambios[campo]
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _get_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(producto_id)
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
