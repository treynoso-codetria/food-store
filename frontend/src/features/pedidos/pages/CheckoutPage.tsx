import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  const confirmar = async (datos: DatosCheckout) => {
    setError(null)
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      })
      vaciar()
      navigate('/mis-pedidos', { replace: true, state: { creado: pedido.id } })
    } catch (e) {
      // p. ej. "Stock insuficiente para 'Tiramisú': hay 2, se pidieron 3"
      setError(handleApiError(e))
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="max-w-xl">
        <h1 className="mb-2 text-4xl font-extrabold text-albahaca-900">Confirmá tu pedido</h1>
        <p className="mb-8 text-stone-600">Decinos dónde lo llevamos y cómo vas a pagar.</p>
        {error && (
          <p className="mb-5 rounded-lg bg-tomate-50 px-4 py-3 text-sm text-tomate-700" role="alert">
            {error}
          </p>
        )}
        <CheckoutForm onConfirmar={confirmar} />
      </div>

      <aside className="h-fit rounded-2xl border border-albahaca-100 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-albahaca-900">Tu pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between gap-3">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span className="tabular-nums">{formatPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-albahaca-100 pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrecio(total)}</span>
        </div>
      </aside>
    </div>
  )
}
