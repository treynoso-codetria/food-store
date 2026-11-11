import type { ReactNode } from 'react'

export function AuthCard({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-4xl font-extrabold text-albahaca-900">{titulo}</h1>
      <p className="mt-2 mb-8 text-stone-600">{subtitulo}</p>
      <div className="rounded-2xl border border-albahaca-100 bg-white p-6 sm:p-8">{children}</div>
    </div>
  )
}
