import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createPedido } from '../api/pedidos'
import { pedidosKeys } from './usePedidos'

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pedidosKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['productos'] }) // cambió el stock
    },
  })
}
