import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types/pedido'

export const pedidosKeys = {
  all: ['pedidos'] as const,
  list: (filtros: FiltrosPedidos) => ['pedidos', 'list', filtros] as const,
  resumen: ['pedidos', 'resumen'] as const,
}

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKeys.list(filtros),
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}
