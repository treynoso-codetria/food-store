import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-tomate-600/30 bg-tomate-50 p-5 text-tomate-700" role="alert">
      <p className="font-semibold">No pudimos cargar los datos</p>
      <p className="text-sm">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="borde" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
