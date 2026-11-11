import { useCallback, useMemo, useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonTabla } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Select } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTabla } from '../components/PedidosTabla'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ETIQUETA_ESTADO, type EstadoPedido, type Pedido } from '../types/pedido'

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()
  const usuarios = useUsuarios()
  const nombresClientes = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, u.full_name])),
    [usuarios.data],
  )

  const onCambiarEstado = useCallback(
    (pedido: Pedido, nuevo: EstadoPedido) => {
      if (nuevo === 'CANCELADO') {
        setACancelar(pedido) // pide confirmación: restituye stock
        return
      }
      cambiar.mutate({ id: pedido.id, estado: nuevo })
    },
    [cambiar],
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-albahaca-900">Pedidos</h1>
        <div className="w-56">
          <label htmlFor="filtro-estado" className="mb-1 block text-sm text-stone-600">
            Filtrar por estado
          </label>
          <Select id="filtro-estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}>
            <option value="">Todos</option>
            {(Object.keys(ETIQUETA_ESTADO) as EstadoPedido[]).map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {cambiar.isError && (
        <p className="mb-4 rounded-lg bg-tomate-50 px-4 py-3 text-sm text-tomate-700" role="alert">
          {handleApiError(cambiar.error)}
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonTabla />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <PedidosTabla
          pedidos={pedidos.data.items}
          nombresClientes={nombresClientes}
          onVer={setDetalle}
          onCambiarEstado={onCambiarEstado}
          cambiandoId={cambiar.isPending ? (cambiar.variables?.id ?? null) : null}
        />
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <Modal abierto={aCancelar !== null} titulo={`¿Cancelar el pedido #${aCancelar?.id ?? ''}?`} onCerrar={() => setACancelar(null)} ancho="sm">
        <p className="text-sm text-stone-600">Los productos del pedido vuelven al stock. Un pedido cancelado no admite más cambios.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="borde" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            cargando={cambiar.isPending}
            onClick={() =>
              aCancelar && cambiar.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSettled: () => setACancelar(null) })
            }
          >
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </div>
  )
}
