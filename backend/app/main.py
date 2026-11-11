"""Aplicación FastAPI: CORS con credenciales y routers bajo /api/v1."""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_all_tables()  # crea las tablas que falten al iniciar
    yield


app = FastAPI(
    title="Food Store API",
    description="TPI Programación 4 — Sistema de pedidos de comida. "
    "Para probar endpoints protegidos: POST /api/v1/auth/token (el navegador guarda la cookie) "
    "o el botón Authorize.",
    version="1.0.0",
    lifespan=lifespan,
)

# allow_credentials=True permite que el navegador mande la cookie desde el frontend.
# Con credenciales, el origen NO puede ser "*": se lista explícitamente.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {"status": "ok", "docs": "/docs", "redoc": "/redoc"}
