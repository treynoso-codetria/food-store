"""Carga inicial idempotente: se puede correr muchas veces sin duplicar nada.

    python -m app.db.seed

Crea el admin (admin / Admin1234!), un cliente de prueba (cliente / Cliente1234!),
categorías y productos con stock. Si algo ya existe (por username o nombre),
lo deja como está.
"""
from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Marta Ríos", "email": "admin@foodstore.com", "password": "Admin1234!", "role": "admin"},
    {"username": "cliente", "full_name": "Cliente de Prueba", "email": "cliente@foodstore.com", "password": "Cliente1234!", "role": "user"},
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra, de molde y especiales"),
    ("Hamburguesas", "Hamburguesas de carne, pollo y veggie"),
    ("Empanadas", "Empanadas al horno y fritas"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para el final"),
]


def _img(texto: str, fondo: str) -> str:
    return f"https://placehold.co/600x400/{fondo}/FFFFFF/png?text={texto.replace(' ', '+')}&font=montserrat"


# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y orégano", 9500, 25),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas, ajo y albahaca", 11200, 20),
    ("Pizzas", "Pizza Fugazzeta", "Rellena de muzzarella con cebolla", 12500, 15),
    ("Hamburguesas", "Hamburguesa Clásica", "Medallón 180 g, lechuga, tomate y cheddar", 8900, 30),
    ("Hamburguesas", "Hamburguesa Doble Bacon", "Doble medallón, cheddar y panceta crocante", 12900, 20),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de garbanzos, rúcula y alioli", 9300, 12),
    ("Empanadas", "Empanada de Carne Cortada a Cuchillo", "Carne, cebolla, huevo y aceituna", 1500, 120),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 100),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso con salsa blanca", 1400, 80),
    ("Bebidas", "Gaseosa Cola 1,5 L", "Botella retornable", 3200, 60),
    ("Bebidas", "Agua sin Gas 500 ml", "Agua mineral", 1500, 80),
    ("Bebidas", "Cerveza Rubia 1 L", "Cerveza artesanal", 5200, 40),
    ("Postres", "Flan Casero con Dulce de Leche", "Flan de huevo con dulce de leche", 4200, 18),
    ("Postres", "Tiramisú", "Bizcochos, café, mascarpone y cacao", 5600, 10),
]

COLORES = {"Pizzas": "C2410C", "Hamburguesas": "92400E", "Empanadas": "B45309", "Bebidas": "0E7490", "Postres": "9D174D"}


def seed(session: Session) -> None:
    for u in USUARIOS:
        if session.exec(select(Usuario).where(Usuario.username == u["username"])).first() is None:
            session.add(
                Usuario(
                    username=u["username"],
                    full_name=u["full_name"],
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                )
            )
            print(f"  + usuario {u['username']} ({u['role']})")

    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            print(f"  + categoría {nombre}")
        categorias[nombre] = categoria

    for cat, nombre, descripcion, precio, stock in PRODUCTOS:
        categoria = categorias[cat]
        existe = session.exec(
            select(Producto).where(Producto.nombre == nombre, Producto.categoria_id == categoria.id)
        ).first()
        if existe is None:
            session.add(
                Producto(
                    categoria_id=categoria.id or 0,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_img(nombre, COLORES[cat]),
                    stock=stock,
                )
            )
            print(f"  + producto {nombre}")


def main() -> None:
    create_all_tables()
    with session_factory() as session:
        seed(session)
        session.commit()
    print("Seed completo. Admin: admin / Admin1234!  ·  Cliente: cliente / Cliente1234!")


if __name__ == "__main__":
    main()
