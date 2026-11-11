import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelarPedido } from '../api/pedidos'
import { pedidosKeys } from './usePedidos'

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pedidosKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
