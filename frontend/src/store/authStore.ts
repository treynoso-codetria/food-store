import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { loginRequest, logoutRequest, meRequest } from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types/auth'
import { registrarSesionInvalida } from '../shared/api/axiosInstance'

/** Lo que se muestra del usuario (nunca el token: ese vive en la cookie HttpOnly). */
export type UsuarioSesion = Pick<Usuario, 'id' | 'username' | 'full_name' | 'email' | 'role'>

interface AuthState {
  usuario: UsuarioSesion | null
  /** true mientras checkSession confirma la sesión contra /auth/me */
  cargando: boolean
  login: (username: string, password: string) => Promise<UsuarioSesion>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

const aSesion = ({ id, username, full_name, email, role }: Usuario): UsuarioSesion => ({
  id,
  username,
  full_name,
  email,
  role,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password) // el backend setea la cookie
        const usuario = aSesion(await meRequest())
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await logoutRequest() // el backend borra la cookie
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          set({ usuario: aSesion(await meRequest()), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiar: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usuario: state.usuario }), // solo el usuario, nunca el token
    },
  ),
)

// Ante un 401 o una cuenta desactivada, el interceptor de Axios limpia la sesión
registrarSesionInvalida(() => useAuthStore.getState().limpiar())
