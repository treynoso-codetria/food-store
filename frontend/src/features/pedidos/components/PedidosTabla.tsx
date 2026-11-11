import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { ETIQUETA_PAGO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: '',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

interface PedidosTablaProps {
  pedidos: Pedido[]
  onVer: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
  cambiandoId: number | null
  /** usuario_id → nombre, para mostrar quién hizo el pedido */
  nombresClientes: Map<number, string>
}

export function PedidosTabla({ pedidos, onVer, onCambiarEstado, cambiandoId, nombresClientes }: PedidosTablaProps) {
  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: 'N°', cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span> },
      { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => <span className="whitespace-nowrap">{formatFecha(row.original.created_at)}</span> },
      { accessorKey: 'usuario_id', header: 'Cliente', cell: ({ row }) => nombresClientes.get(row.original.usuario_id) ?? `Usuario ${row.original.usuario_id}` },
      { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      { accessorKey: 'forma_pago', header: 'Pago', cell: ({ row }) => ETIQUETA_PAGO[row.original.forma_pago] },
      { accessorKey: 'total', header: 'Total', cell: ({ row }) => <span className="tabular-nums">{formatPrecio(row.original.total)}</span> },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button variante="fantasma" tamano="sm" onClick={() => onVer(p)}>
                Ver
              </Button>
              {TRANSICIONES[p.estado].map((estado) => (
                <Button
                  key={estado}
                  tamano="sm"
                  variante={estado === 'CANCELADO' ? 'borde' : 'primario'}
                  className={estado === 'CANCELADO' ? 'text-tomate-700' : ''}
                  disabled={cambiandoId === p.id}
                  onClick={() => onCambiarEstado(p, estado)}
                >
                  {ACCION[estado]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [onVer, onCambiarEstado, cambiandoId, nombresClientes],
  )

  return <DataTable data={pedidos} columns={columnas} vacio="No hay pedidos con este estado" />
}
