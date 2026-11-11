"""Motor de base de datos, creación de tablas y fábrica de sesiones."""
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False porque FastAPI atiende en varios hilos
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True, connect_args=_connect_args)


def import_models() -> None:
    """Importa todos los modelos para que SQLAlchemy registre tablas y relaciones.

    Las relaciones se declaran con strings ("Pedido", "Producto"...) para evitar
    imports circulares; SQLAlchemy las resuelve cuando todos los modelos están
    cargados, por eso este import centralizado.
    """
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401


def create_all_tables() -> None:
    import_models()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Sesión nueva. expire_on_commit=False: los objetos siguen legibles tras el commit."""
    return Session(engine, expire_on_commit=False)


def get_session() -> Generator[Session, None, None]:
    """Dependencia de FastAPI para lecturas simples (la usa get_current_user)."""
    with session_factory() as session:
        yield session
