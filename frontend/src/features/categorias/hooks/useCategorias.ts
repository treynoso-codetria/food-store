import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { CategoriaCreate } from '../types/categoria'

export const categoriasKeys = {
  all: ['categorias'] as const,
}

export function useCategorias() {
  return useQuery({ queryKey: categoriasKeys.all, queryFn: getCategorias })
}

export function useGuardarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: CategoriaCreate }) =>
      id ? updateCategoria(id, body) : createCategoria(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.all })
      // los productos muestran el nombre de su categoría
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: categoriasKeys.all }),
  })
}
