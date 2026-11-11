from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    """PUT con actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
