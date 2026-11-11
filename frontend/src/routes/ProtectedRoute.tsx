import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import type { Rol } from '../features/auth/types/auth'
import { Spinner } from '../shared/components/Skeleton'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  /** Si se indica, además de sesión exige uno de estos roles */
  roles?: Rol[]
}

/**
 * Sin sesión → /login (recordando a dónde quería ir). Sin el rol → /unauthorized.
 * Es solo experiencia de usuario: la protección real la hace require_role en el backend.
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-albahaca-700">
        <Spinner /> Verificando tu sesión…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}
