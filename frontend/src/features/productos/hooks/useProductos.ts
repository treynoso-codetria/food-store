import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate } from '../types/producto'

export const productosKeys = {
  all: ['productos'] as const,
  list: (filtros: FiltrosProductos) => ['productos', filtros] as const,
}

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la página anterior mientras carga la nueva
  })
}

export function useGuardarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: ProductoCreate }) =>
      id ? updateProducto(id, body) : createProducto(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  })
}

export function useActualizarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductoStockUpdate }) => updateStock(id, body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  })
}

export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  })
}
