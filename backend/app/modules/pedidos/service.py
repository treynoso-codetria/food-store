"""Reglas de negocio de pedidos (RN-01 a RN-06).

Todo caso de uso abre `with self.uow as uow:` y devuelve el schema de salida
DENTRO del bloque. Si se lanza cualquier excepción, el Unit of Work hace
rollback: no queda ni el pedido a medias ni el stock descontado.
"""
from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

# ── Máquina de estados (RN-02) ─────────────────────────────────────────────
# Estado actual -> estados a los que puede pasar. Los terminales no tienen salida.
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


# ── Excepciones de dominio (el Router las traduce a HTTP) ──────────────────
class PedidoError(Exception):
    """Base: cualquier regla de negocio violada → 400."""


class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado o inactivo")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(PedidoError):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(PedidoError):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(PedidoError):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock}, se pidieron {pedido}")


class TransicionInvalida(PedidoError):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"Transición inválida: {actual} → {nuevo}")


class PedidoNoCancelable(PedidoError):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se pueden cancelar pedidos en PENDIENTE (estado actual: {estado})")


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ── RN-01: creación transaccional ──────────────────────────────────────
    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        assert usuario.id is not None
        with self.uow as uow:
            # 1. Ningún producto repetido
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            # 2. Pedido en PENDIENTE con total 0
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=(data.notas or "").strip() or None,
                    total=0,
                )
            )

            # 3. Por cada ítem: validar, descontar stock y crear la línea con la copia de nombre y precio
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            # 4. Total = suma de subtotales (fijo desde acá, RN-05)
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)

            # 5. Schema de salida dentro del bloque
            return PedidoRead.model_validate(pedido)

    # ── Lecturas (RN-04) ───────────────────────────────────────────────────
    def listar(self, usuario: Usuario, estado: EstadoPedido | None, skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(
                filtro_usuario, estado.value if estado else None, skip, limit
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_visible(uow, pedido_id, usuario)
            return PedidoRead.model_validate(pedido)

    # ── RN-02 + RN-03: cambio de estado por el admin ───────────────────────
    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            self._aplicar_transicion(uow, pedido, data.estado)
            return PedidoRead.model_validate(pedido)

    # ── RN-03 + RN-04: cancelación por el dueño ────────────────────────────
    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable(pedido.estado)
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ── Resumen del panel ──────────────────────────────────────────────────
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(EstadoPedido.ENTREGADO.value), 2),
            )

    # ── Helpers ────────────────────────────────────────────────────────────
    @staticmethod
    def _get_visible(uow: PedidoUnitOfWork, pedido_id: int, usuario: Usuario) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno()
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        """Valida contra TRANSICIONES antes de tocar nada; si cancela, restituye stock (RN-03)."""
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual.value, nuevo.value)

        if nuevo == EstadoPedido.CANCELADO:
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:  # se restituye aunque el producto esté dado de baja
                    producto.stock += linea.cantidad

        pedido.estado = nuevo.value
        pedido.updated_at = _ahora()
        uow.pedidos.add(pedido)
