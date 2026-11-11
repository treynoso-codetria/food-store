import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'
import { pedidosKeys } from './usePedidos'

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pedidosKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['productos'] }) // cancelar restituye stock
    },
  })
}
