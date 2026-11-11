import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: 'resumen', label: 'Resumen' },
  { to: 'pedidos', label: 'Pedidos' },
  { to: 'productos', label: 'Productos' },
  { to: 'categorias', label: 'Categorías' },
  { to: 'usuarios', label: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div className="grid gap-8 md:grid-cols-[180px_1fr]">
      <aside className="min-w-0">
        <h2 className="mb-3 hidden text-sm font-semibold text-stone-500 md:block">Panel de administración</h2>
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Panel">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap md:rounded-lg ${
                  isActive ? 'bg-albahaca-700 text-white' : 'text-albahaca-800 hover:bg-albahaca-50'
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
