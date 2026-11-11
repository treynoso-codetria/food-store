import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const BASE =
  'w-full rounded-lg border bg-white px-3 text-sm text-tinta placeholder:text-stone-400 focus:border-albahaca-600 focus:outline-none focus:ring-2 focus:ring-albahaca-100 disabled:bg-stone-50'

const borde = (error?: string) => (error ? 'border-tomate-600' : 'border-stone-300')

interface CampoProps {
  label: string
  htmlFor: string
  error?: string
  ayuda?: string
  children: ReactNode
}

/** Etiqueta + control + mensaje de error o ayuda */
export function Campo({ label, htmlFor, error, ayuda, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-albahaca-900">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-tomate-600" role="alert">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-xs text-stone-500">{ayuda}</p>
      )}
    </div>
  )
}

interface ConError {
  error?: string
}

export function Input({ error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & ConError) {
  return <input aria-invalid={Boolean(error)} className={`${BASE} h-10 ${borde(error)} ${className}`} {...props} />
}

export function Select({ error, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & ConError) {
  return <select aria-invalid={Boolean(error)} className={`${BASE} h-10 ${borde(error)} ${className}`} {...props} />
}

export function Textarea({ error, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & ConError) {
  return <textarea aria-invalid={Boolean(error)} className={`${BASE} py-2 ${borde(error)} ${className}`} {...props} />
}

/** TanStack Form guarda los errores como lista: mostramos el primero */
export function primerError(errores: readonly unknown[]): string | undefined {
  const primero = errores.find((e) => typeof e === 'string')
  return typeof primero === 'string' ? primero : undefined
}
