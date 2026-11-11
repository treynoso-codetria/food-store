import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-7xl font-extrabold text-mostaza-400">403</p>
      <h1 className="mt-4 text-3xl font-bold text-albahaca-900">Esta sección es solo para administradores</h1>
      <p className="mt-3 text-stone-600">Tu cuenta no tiene permiso para ver esta página.</p>
      <Link
        to="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-albahaca-700 px-6 font-semibold text-white hover:bg-albahaca-800"
      >
        Volver a la carta
      </Link>
    </div>
  )
}
