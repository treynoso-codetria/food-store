import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number // empieza en 0
  totalPaginas: number
  total: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, total, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm" aria-label="Paginación">
      <span className="text-stone-600">
        Página {pagina + 1} de {totalPaginas} · {total} resultados
      </span>
      <div className="flex gap-2">
        <Button variante="borde" tamano="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </Button>
        <Button variante="borde" tamano="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
