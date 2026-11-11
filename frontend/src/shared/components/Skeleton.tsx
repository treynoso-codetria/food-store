export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-albahaca-100/70 ${className}`} aria-hidden />
}

export function Spinner() {
  return <span className="size-5 animate-spin rounded-full border-2 border-albahaca-600 border-r-transparent" role="status" aria-label="Cargando" />
}

export function SkeletonTabla({ filas = 6 }: { filas?: number }) {
  return (
    <div className="space-y-2" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  )
}
