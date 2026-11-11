import { useQuery } from '@tanstack/react-query'

import { getResumenPedidos } from '../api/pedidos'
import { pedidosKeys } from './usePedidos'

export function useResumenPedidos() {
  return useQuery({ queryKey: pedidosKeys.resumen, queryFn: getResumenPedidos })
}
