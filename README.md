# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)

Aplicación web fullstack para un negocio de comidas: los clientes recorren la carta, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Repositorio:** <https://github.com/treynoso-codetria/food-store>
- **Video de demostración:** <https://youtu.be/1_ovreFFDCM>

| Capa | Stack |
|---|---|
| Backend | Python 3.11–3.13 · FastAPI · SQLModel · PostgreSQL · JWT en cookie HttpOnly · Unit of Work |
| Frontend | React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS 4 · TanStack Query / Form / Table · Zustand · Axios · React Router 7 |

---

## Requisitos

- **Python** 3.11, 3.12 o 3.13
- **Node.js** 20.19 o superior y **pnpm** 9 o superior (`npm install -g pnpm`)
- **Docker Desktop** (para PostgreSQL). Alternativa sin Docker: SQLite, ver más abajo.

## Instalación y ejecución

Los pasos se corren desde la raíz del proyecto, en tres terminales.

### 1. Base de datos (Docker)

```bash
docker compose up -d
docker compose ps          # esperar a que "foodstore-db" figure como healthy
```

Levanta PostgreSQL 16 en `localhost:5433`: usuario `foodstore`, contraseña `foodstore` y base `foodstore_db`. Usa el puerto 5433 para no chocar con otro Postgres que tengas en el 5432.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate              # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                  # Windows: copy .env.example .env
python -m app.db.seed                 # crea tablas, usuarios, categorías y productos
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación interactiva: <http://localhost:8000/docs> y <http://localhost:8000/redoc>

El seed es **idempotente**: si lo corrés varias veces, no duplica nada.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build        # verifica los tipos (tsc) y compila
pnpm dev
```

App: <http://localhost:5173>

## Usuarios del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin1234!` |
| Cliente | `cliente` | `Cliente1234!` |

Además, el seed carga 5 categorías y 14 productos con stock.

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql+psycopg2://foodstore:foodstore@localhost:5433/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vencimiento del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (varios separados por coma) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo detrás de HTTPS | `false` |

**Sin Docker:** con `DATABASE_URL=sqlite:///./foodstore.db` todo funciona igual con un archivo local.

### `frontend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Abrí el frontend en `localhost` y no en `127.0.0.1`. La cookie de sesión pertenece al sitio `localhost`, y el origen tiene que coincidir con `FRONTEND_ORIGIN`.

---

## Arquitectura

### Backend: capas por dominio

```
backend/app/
├── main.py                 FastAPI, CORS con credenciales, routers bajo /api/v1
├── core/
│   ├── config.py           Settings (pydantic-settings, lee .env)
│   ├── database.py         engine, create_all_tables, session_factory
│   ├── security.py         hash bcrypt, create_access_token, decode_access_token
│   ├── deps.py             get_current_user, get_current_active_user, require_role
│   ├── unit_of_work.py     UnitOfWork: commit / rollback / close en __exit__
│   └── base_repository.py  BaseRepository[T]: get_by_id, get_all, add, delete
├── modules/
│   ├── auth/               router · service · schemas (usa el modelo Usuario)
│   ├── usuarios/           models · schemas · repository · unit_of_work · service · router
│   ├── categorias/         ídem
│   ├── productos/          ídem
│   └── pedidos/            ídem: RN-01 a RN-06 y máquina de estados
└── db/seed.py
```

Las dependencias van en un solo sentido: **Router → Service → Unit of Work → Repository → Model**.

- **Router:** valida el cuerpo con schemas, resuelve la sesión y el rol con `Depends`, llama al Service y traduce las excepciones de dominio a `HTTPException`.
- **Service:** aplica las reglas de negocio. Abre `with self.uow as uow:` y devuelve el schema de salida **dentro** del bloque.
- **Unit of Work:** es el **único** lugar donde se llama a `commit()`. Si algo falla dentro del bloque, hace rollback: en un pedido con stock insuficiente no se guarda nada, tampoco el descuento de los ítems anteriores.
- **Repository:** solo consultas (`select`), sin reglas de negocio.

### Reglas de negocio de pedidos

| Regla | Dónde vive |
|---|---|
| RN-01 Crear pedido: sin repetidos; producto activo, disponible y con stock; descuento y copia de nombre y precio en la misma transacción | `PedidoService.crear` + `ProductoRepository.get_for_update` (`SELECT … FOR UPDATE`) |
| RN-02 Transiciones válidas | diccionario `TRANSICIONES` en `pedidos/service.py` |
| RN-03 Cancelar restituye stock | `PedidoService._aplicar_transicion` |
| RN-04 El cliente ve y cancela solo lo suyo (y solo en PENDIENTE) | `PedidoService.obtener` / `cancelar` |
| RN-05 Líneas y total inmutables | no existe endpoint de edición ni de borrado de pedidos |
| RN-06 Forma de pago y dirección | `PedidoCreate` (enum `FormaPago`, `Field(min_length=5, max_length=200)`) |

### Autenticación

1. `POST /auth/token` (formulario OAuth2) responde `{"message": "Login exitoso"}` y setea la cookie **HttpOnly** `access_token`. El token nunca viaja en el cuerpo.
2. Axios usa `withCredentials: true`, así que el navegador adjunta la cookie solo. El frontend nunca lee ni guarda el token.
3. `get_current_user` (401), `get_current_active_user` (400 si la cuenta está desactivada) y `require_role(["admin"])` (403) protegen cada endpoint.

### Frontend: organizado por features

```
frontend/src/
├── shared/      api/ (axiosInstance, handleApiError, queryClient) · ui/ · components/ · layout/
├── features/    auth · categorias · productos · usuarios · pedidos
│                └── cada una con pages/ components/ hooks/ api/ types/
├── store/       authStore (sesión) y cartStore (carrito), ambos con Zustand + persist
├── routes/      AppRouter y ProtectedRoute
├── App.tsx      llama a checkSession al montar
└── main.tsx     QueryClientProvider
```

- **Estado del servidor** (catálogo, pedidos, usuarios, resumen): TanStack Query, con `queryKey` descriptivas e `invalidateQueries` en cada mutación.
- **Estado del cliente** (sesión y carrito): Zustand. `authStore` persiste solo el usuario (`partialize`), nunca el token.
- **Interceptor de Axios:** ante un 401, o un 400 "Cuenta de usuario desactivada", limpia la sesión, y `ProtectedRoute` redirige a `/login`.
- **Rutas protegidas:** `ProtectedRoute` redirige sin sesión a `/login` y sin el rol a `/unauthorized`. Es solo experiencia de usuario: la protección real está en el backend.

## Endpoints

Todos bajo `/api/v1`. La documentación completa está en `/docs`.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET · POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos?skip&limit&search&categoria_id&disponible` · `/productos/{id}` | Público |
| POST · PUT · PATCH · DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | admin |
| POST · GET | `/pedidos` · `/pedidos/{id}` | Sesión (dueño o admin) |
| GET | `/pedidos/resumen` | admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

## Entrega

El `.zip` se arma **sin** `node_modules/`, `venv/` ni archivos `.env`. El `.gitignore` de la raíz ya los excluye del repositorio.
