"""Reglas de categorías: nombre único y baja lógica.

Una categoría dada de baja se trata como inexistente (404) pero conserva su
nombre: no se puede crear otra con el mismo nombre.
"""
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ── Excepciones de dominio (el Router las traduce a HTTP) ──────────────────
class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = data.nombre.strip()
            if uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado(nombre)
            categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nombre)
                if existente and existente.id != categoria.id:
                    raise NombreDuplicado(nombre)
                cambios["nombre"] = nombre
            elif "nombre" in cambios:
                del cambios["nombre"]  # el nombre es obligatorio: null no lo borra
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = False. No oculta sus productos."""
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _get_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria
