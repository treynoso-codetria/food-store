import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'sm' | 'md' | 'lg'
}

const ANCHOS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

/** Usa <dialog> nativo: foco atrapado, Escape para cerrar y fondo accesible. */
export function Modal({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  // Sincroniza el prop con la API del <dialog> (no obtiene datos)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (abierto && !dialog.open) dialog.showModal()
    if (!abierto && dialog.open) dialog.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      className={`m-auto w-[calc(100%-2rem)] ${ANCHOS[ancho]} rounded-2xl p-0 shadow-2xl backdrop:bg-albahaca-900/40`}
    >
      {abierto && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-albahaca-900">{titulo}</h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="-mt-1 -mr-2 rounded-full p-2 text-stone-500 hover:bg-stone-100"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden>
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
