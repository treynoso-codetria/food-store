import { Link } from 'react-router-dom'

import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-albahaca-900">Resumen del negocio</h1>
      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ResumenCard titulo="Ingresos de pedidos entregados" valor={formatPrecio(resumen.data.ingresos_entregados)} destacado />
            <ResumenCard titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResumenCard titulo="Pendientes" valor={resumen.data.pendientes} />
            <ResumenCard titulo="En preparación" valor={resumen.data.en_preparacion} />
            <ResumenCard titulo="Entregados" valor={resumen.data.entregados} />
            <ResumenCard titulo="Cancelados" valor={resumen.data.cancelados} />
          </div>
          {resumen.data.pendientes > 0 && (
            <Link to="/admin/pedidos" className="mt-6 inline-flex text-sm font-semibold text-albahaca-700 hover:underline">
              Atender {resumen.data.pendientes} {resumen.data.pendientes === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
            </Link>
          )}
        </>
      )}
    </div>
  )
}
