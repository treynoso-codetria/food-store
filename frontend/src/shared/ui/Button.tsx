import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'acento' | 'borde' | 'fantasma' | 'peligro'
type Tamano = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-albahaca-700 text-white hover:bg-albahaca-800',
  acento: 'bg-mostaza-400 text-albahaca-900 hover:bg-mostaza-300',
  borde: 'border border-albahaca-200 bg-white text-albahaca-800 hover:bg-albahaca-50',
  fantasma: 'text-albahaca-800 hover:bg-albahaca-50',
  peligro: 'bg-tomate-600 text-white hover:bg-tomate-700',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  )
}
