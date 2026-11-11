import axios, { AxiosError } from 'axios'

/**
 * Cliente HTTP único.
 * withCredentials: el navegador adjunta la cookie HttpOnly `access_token` en cada
 * petición. El frontend nunca lee ni guarda el token.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// El authStore registra acá qué hacer cuando la sesión deja de valer.
// Se usa un callback para no crear un import circular axiosInstance ↔ authStore.
let onSesionInvalida: (() => void) | null = null

export function registrarSesionInvalida(handler: () => void): void {
  onSesionInvalida = handler
}

const RUTAS_SIN_INTERCEPTOR = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail
    const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'
    const sesionVencida = status === 401 && !RUTAS_SIN_INTERCEPTOR.some((ruta) => url.endsWith(ruta))

    // Limpia la sesión; ProtectedRoute redirige a /login al quedar sin usuario
    if ((sesionVencida || cuentaDesactivada) && onSesionInvalida) {
      onSesionInvalida()
    }
    return Promise.reject(error)
  },
)
