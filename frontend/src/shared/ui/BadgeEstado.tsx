import { ETIQUETA_ESTADO, type EstadoPedido } from '../../features/pedidos/types/pedido'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-mostaza-100 text-mostaza-600 ring-mostaza-300',
  EN_PREPARACION: 'bg-sky-50 text-sky-800 ring-sky-200',
  ENTREGADO: 'bg-albahaca-50 text-albahaca-700 ring-albahaca-200',
  CANCELADO: 'bg-tomate-50 text-tomate-700 ring-tomate-600/30',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${COLORES[estado]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}
