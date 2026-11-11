import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonTabla } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const location = useLocation()
  const recienCreado = (location.state as { creado?: number } | null)?.creado

  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = () => {
    if (!aCancelar) return
    cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-4xl font-extrabold text-albahaca-900">Mis pedidos</h1>
      <p className="mb-8 text-stone-600">Podés cancelar un pedido mientras esté pendiente.</p>

      {recienCreado && (
        <p className="mb-6 rounded-xl bg-albahaca-50 px-4 py-3 text-sm font-medium text-albahaca-800" role="status">
          Recibimos tu pedido #{recienCreado}. Te avisamos cuando empiece a prepararse.
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonTabla filas={4} />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes uno, lo vas a ver acá con su estado."
          accion={
            <Link to="/" className="inline-flex h-10 items-center rounded-full bg-albahaca-700 px-5 text-sm font-semibold text-white">
              Ver la carta
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {pedidos.data.items.map((p) => {
              const expandido = abierto === p.id
              return (
                <li key={p.id} className="rounded-2xl border border-albahaca-100 bg-white">
                  <button
                    type="button"
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left"
                    aria-expanded={expandido}
                    onClick={() => setAbierto(expandido ? null : p.id)}
                  >
                    <span className="font-display text-lg font-bold text-albahaca-900">#{p.id}</span>
                    <BadgeEstado estado={p.estado} />
                    <span className="text-sm text-stone-500">{formatFecha(p.created_at)}</span>
                    <span className="ml-auto font-semibold tabular-nums">{formatPrecio(p.total)}</span>
                    <svg viewBox="0 0 20 20" className={`size-5 text-albahaca-600 transition-transform ${expandido ? 'rotate-180' : ''}`} fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandido && (
                    <div className="border-t border-albahaca-100 p-4">
                      <PedidoDetalle pedido={p} />
                      {p.estado === 'PENDIENTE' && (
                        <div className="mt-4 flex justify-end">
                          <Button variante="peligro" tamano="sm" onClick={() => setACancelar(p)}>
                            Cancelar pedido
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(pedidos.data.total / POR_PAGINA)} total={pedidos.data.total} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={aCancelar !== null} titulo={`¿Cancelar el pedido #${aCancelar?.id ?? ''}?`} onCerrar={() => setACancelar(null)} ancho="sm">
        <p className="text-sm text-stone-600">El pedido se cancela y los productos vuelven al stock. No se puede deshacer.</p>
        {cancelar.isError && <p className="mt-3 text-sm text-tomate-700">{handleApiError(cancelar.error)}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="borde" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button variante="peligro" cargando={cancelar.isPending} onClick={confirmarCancelacion}>
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </div>
  )
}
