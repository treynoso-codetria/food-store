import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // No reintenta errores del cliente (4xx): reintentar un 404 o 403 no cambia nada
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response && error.response.status < 500) return false
        return failureCount < 2
      },
    },
  },
})
