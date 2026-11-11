import { api } from '../../../shared/api/axiosInstance'
import type { MessageResponse, Usuario, UsuarioCreate } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<MessageResponse> {
  // OAuth2 exige formulario (application/x-www-form-urlencoded), no JSON
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<MessageResponse>('/auth/token', form)
  return data
}

export async function logoutRequest(): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>('/auth/logout')
  return data
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function registerRequest(body: UsuarioCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', body)
  return data
}
