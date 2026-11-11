import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-albahaca-100 hover:text-white'
  }`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  const cerrarSesion = async () => {
    await logout()
    setAbierto(false)
    navigate('/login')
  }

  const links = (
    <>
      <NavLink to="/" end className={linkClase} onClick={() => setAbierto(false)}>
        Carta
      </NavLink>
      {usuario && (
        <NavLink to="/mis-pedidos" className={linkClase} onClick={() => setAbierto(false)}>
          Mis pedidos
        </NavLink>
      )}
      {usuario?.role === 'admin' && (
        <NavLink to="/admin" className={linkClase} onClick={() => setAbierto(false)}>
          Panel
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-30 bg-albahaca-700 text-white">
      {/* Franja de toldo */}
      <div className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-mostaza-400)_0_24px,var(--color-albahaca-700)_24px_48px)]" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
          Food<span className="text-mostaza-400">Store</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/carrito"
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-mostaza-400 px-4 text-sm font-semibold text-albahaca-900 hover:bg-mostaza-300"
            aria-label={`Carrito con ${cantidad} productos`}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
              <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.63c.68 0 1.27.46 1.45 1.11l.28 1.05h12.14a.75.75 0 0 1 .72.96l-1.73 6a.75.75 0 0 1-.72.54H6.47l.35 1.3h9.43a.75.75 0 0 1 0 1.5H6.25a.75.75 0 0 1-.72-.56L3.38 2.5H1.75A.75.75 0 0 1 1 1.75ZM6 17a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
            <span>{cantidad}</span>
          </Link>

          {usuario ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold">{usuario.full_name}</p>
                <p className="text-xs text-albahaca-200">{usuario.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
              <Button variante="fantasma" tamano="sm" className="text-white hover:bg-white/10" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10 md:inline-flex">
              Ingresar
            </Link>
          )}

          <button
            type="button"
            className="rounded-full p-2 hover:bg-white/10 md:hidden"
            aria-expanded={abierto}
            aria-label="Menú"
            onClick={() => setAbierto((v) => !v)}
          >
            <svg viewBox="0 0 20 20" className="size-6" fill="currentColor" aria-hidden>
              <path d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5A.75.75 0 0 1 2.75 9h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.75Zm0 5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
            </svg>
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden" aria-label="Principal móvil">
          {links}
          {usuario ? (
            <>
              <p className="px-3 pt-2 text-sm text-albahaca-200">
                {usuario.full_name} · {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
              </p>
              <button type="button" onClick={cerrarSesion} className="rounded-full px-3 py-1.5 text-left text-sm font-medium text-albahaca-100">
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClase} onClick={() => setAbierto(false)}>
              Ingresar
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
