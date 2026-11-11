import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-albahaca-200 px-6 py-14 text-center">
      <svg viewBox="0 0 48 48" className="mb-4 size-12 text-albahaca-200" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 22h36M10 22c0 9 6 16 14 16s14-7 14-16" strokeLinecap="round" />
        <path d="M18 14c0-3 2-4 2-6M26 14c0-3 2-4 2-6" strokeLinecap="round" />
      </svg>
      <h3 className="text-lg font-semibold text-albahaca-900">{titulo}</h3>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-stone-600">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
