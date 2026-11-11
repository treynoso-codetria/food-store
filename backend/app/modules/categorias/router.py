"""Endpoints /categorias. Lecturas públicas; escrituras solo admin."""
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import solo_admin
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(solo_admin)])
def crear_categoria(data: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[Depends(solo_admin)])
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(solo_admin)])
def eliminar_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
