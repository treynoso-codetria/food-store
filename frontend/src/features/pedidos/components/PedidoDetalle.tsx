import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { ETIQUETA_PAGO, type Pedido } from '../types/pedido'

/** Líneas del pedido con la copia de nombre y precio del momento de la compra (RN-05). */
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="text-stone-500">Estado</dt>
          <dd className="mt-1">
            <BadgeEstado estado={pedido.estado} />
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Creado</dt>
          <dd className="mt-1 font-medium">{formatFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Pago</dt>
          <dd className="mt-1 font-medium">{ETIQUETA_PAGO[pedido.forma_pago]}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Actualizado</dt>
          <dd className="mt-1 font-medium">{formatFecha(pedido.updated_at)}</dd>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <dt className="text-stone-500">Entrega en</dt>
          <dd className="mt-1 font-medium">{pedido.direccion_entrega}</dd>
        </div>
        {pedido.notas && (
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-stone-500">Notas</dt>
            <dd className="mt-1">{pedido.notas}</dd>
          </div>
        )}
      </dl>
      <table className="w-full">
        <thead className="text-left text-stone-500">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((l) => (
            <tr key={l.producto_id}>
              <td className="py-2">{l.nombre_producto}</td>
              <td className="py-2 text-right tabular-nums">{formatPrecio(l.precio_unitario)}</td>
              <td className="py-2 text-right tabular-nums">{l.cantidad}</td>
              <td className="py-2 text-right tabular-nums">{formatPrecio(l.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-albahaca-200 font-bold">
            <td className="pt-3" colSpan={3}>
              Total
            </td>
            <td className="pt-3 text-right tabular-nums">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
