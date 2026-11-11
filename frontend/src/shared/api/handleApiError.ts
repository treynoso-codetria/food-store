import { isAxiosError } from 'axios'

interface ErrorValidacion {
  loc: (string | number)[]
  msg: string
}

interface CuerpoError {
  detail?: string | ErrorValidacion[]
}

/** Convierte el `detail` de la API en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown, porDefecto = 'Ocurrió un error inesperado. Probá de nuevo.'): string {
  if (!isAxiosError<CuerpoError>(error)) return porDefecto
  if (!error.response) return 'No se pudo conectar con el servidor. Revisá que la API esté corriendo.'

  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    // 422 de FastAPI: lista de errores de validación
    return detail
      .map((e) => {
        const campo = e.loc.filter((parte) => parte !== 'body').join('.')
        return campo ? `${campo}: ${e.msg}` : e.msg
      })
      .join(' · ')
  }
  return porDefecto
}
