"""Endpoints /pedidos. Traduce las excepciones de dominio a códigos HTTP."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, solo_admin
from app.modules.pedidos.schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoError,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _http(e: Exception) -> HTTPException:
    """Excepción de dominio → HTTPException con el código de la especificación."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


_ERRORES = (PedidoError, PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(data, usuario)
    except _ERRORES as e:
        raise _http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


# Se declara ANTES de /{pedido_id} para que "resumen" no se tome como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(solo_admin)])
def resumen_pedidos(service: PedidoService = Depends(get_pedido_service)) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except _ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[Depends(solo_admin)])
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data)
    except _ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except _ERRORES as e:
        raise _http(e)
