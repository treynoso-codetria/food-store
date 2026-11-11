import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input, primerError } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { AuthCard } from '../components/AuthCard'
import { useRegister } from '../hooks/useRegister'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[A-Za-z0-9_.-]+$/

type CampoRegistro = 'username' | 'full_name' | 'email' | 'password'

const CAMPOS: { name: CampoRegistro; label: string; type: string; autoComplete: string; ayuda?: string; validar: (v: string) => string | undefined }[] = [
  {
    name: 'full_name',
    label: 'Nombre y apellido',
    type: 'text',
    autoComplete: 'name',
    validar: (v) => (v.trim().length < 2 ? 'Ingresá tu nombre (mínimo 2 caracteres)' : undefined),
  },
  {
    name: 'username',
    label: 'Usuario',
    type: 'text',
    autoComplete: 'username',
    ayuda: 'Letras, números, punto, guion o guion bajo.',
    validar: (v) =>
      v.length < 3 ? 'Mínimo 3 caracteres' : !USERNAME_RE.test(v) ? 'Usá solo letras, números, . - _' : undefined,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    validar: (v) => (!EMAIL_RE.test(v) ? 'Ingresá un email válido' : undefined),
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    autoComplete: 'new-password',
    ayuda: 'Mínimo 8 caracteres.',
    validar: (v) => (v.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined),
  },
]

export function RegisterPage() {
  const register = useRegister()
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await register.mutateAsync({ ...value, username: value.username.trim(), full_name: value.full_name.trim() })
        await login(value.username.trim(), value.password) // entra directo después de registrarse
        navigate('/', { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error))
      }
    },
  })

  return (
    <AuthCard titulo="Creá tu cuenta" subtitulo="Te lleva un minuto y después pedís en dos clics.">
      <form
        noValidate
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        {CAMPOS.map((c) => (
          <form.Field key={c.name} name={c.name} validators={{ onChange: ({ value }) => c.validar(value) }}>
            {(field) => (
              <Campo label={c.label} htmlFor={c.name} ayuda={c.ayuda} error={primerError(field.state.meta.errors)}>
                <Input
                  id={c.name}
                  type={c.type}
                  autoComplete={c.autoComplete}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={primerError(field.state.meta.errors)}
                />
              </Campo>
            )}
          </form.Field>
        ))}

        {errorServidor && (
          <p className="rounded-lg bg-tomate-50 px-3 py-2 text-sm text-tomate-700" role="alert">
            {errorServidor}
          </p>
        )}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" tamano="lg" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-albahaca-700 underline-offset-2 hover:underline">
          Ingresá
        </Link>
      </p>
    </AuthCard>
  )
}
