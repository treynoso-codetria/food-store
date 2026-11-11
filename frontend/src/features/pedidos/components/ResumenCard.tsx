interface ResumenCardProps {
  titulo: string
  valor: string | number
  destacado?: boolean
}

export function ResumenCard({ titulo, valor, destacado = false }: ResumenCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${destacado ? 'bg-albahaca-700 text-white' : 'border border-albahaca-100 bg-white'}`}>
      <p className={`text-sm ${destacado ? 'text-albahaca-100' : 'text-stone-600'}`}>{titulo}</p>
      <p className={`mt-1 font-display text-4xl font-extrabold tabular-nums ${destacado ? '' : 'text-albahaca-900'}`}>{valor}</p>
    </div>
  )
}
