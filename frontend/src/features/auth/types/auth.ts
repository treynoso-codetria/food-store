export type Rol = 'user' | 'admin'

/** Espejo de UserPublic del backend */
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

/** Espejo de UserCreate */
export interface UsuarioCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MessageResponse {
  message: string
}
