import { Link, useNavigate } from 'react-router-dom'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { ImagenProducto } from '../../../shared/components/ImagenProducto'
import { Button } from '../../../shared/ui/Button'
import { formatPrecio } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-8 text-4xl font-extrabold text-albahaca-900">Tu carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Elegí algo de la carta y aparece acá."
          accion={
            <Link to="/" className="inline-flex h-10 items-center rounded-full bg-albahaca-700 px-5 text-sm font-semibold text-white hover:bg-albahaca-800">
              Ver la carta
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h1 className="text-4xl font-extrabold text-albahaca-900">Tu carrito</h1>
          <Button variante="fantasma" tamano="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>
        <ul className="divide-y divide-albahaca-100 rounded-2xl border border-albahaca-100 bg-white">
          {items.map((item) => (
            <li key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <ImagenProducto src={item.imagen_url} alt={item.nombre} className="size-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-albahaca-900">{item.nombre}</p>
                <p className="text-sm text-stone-600">{formatPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center rounded-full border border-albahaca-200" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <button type="button" className="size-9 rounded-full text-lg font-semibold text-albahaca-700 hover:bg-albahaca-50" aria-label="Restar uno" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                  −
                </button>
                <span className="w-8 text-center font-semibold tabular-nums">{item.cantidad}</span>
                <button
                  type="button"
                  className="size-9 rounded-full text-lg font-semibold text-albahaca-700 hover:bg-albahaca-50 disabled:opacity-30"
                  aria-label="Sumar uno"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-semibold tabular-nums">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
              <button type="button" className="text-sm text-tomate-600 hover:underline" onClick={() => quitar(item.producto_id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl bg-albahaca-700 p-6 text-white lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-albahaca-100">Total</h2>
        <p className="font-display text-5xl font-extrabold">{formatPrecio(total)}</p>
        <p className="mt-2 text-sm text-albahaca-200">El pago es en efectivo o por transferencia al recibir el pedido.</p>
        <Button variante="acento" tamano="lg" className="mt-6 w-full" onClick={() => navigate('/checkout')}>
          {usuario ? 'Confirmar pedido' : 'Ingresar para confirmar'}
        </Button>
      </aside>
    </div>
  )
}
