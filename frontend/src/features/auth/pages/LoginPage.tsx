import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input, primerError } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { AuthCard } from '../components/AuthCard'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const desde = (location.state as { from?: string } | null)?.from

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        const usuario = await login(value.username.trim(), value.password)
        navigate(desde ?? (usuario.role === 'admin' ? '/admin' : '/'), { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error))
      }
    },
  })

  return (
    <AuthCard titulo="Ingresá a tu cuenta" subtitulo="Para confirmar pedidos y seguir su estado.">
      <form
        noValidate
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu usuario' : undefined) }}
        >
          {(field) => (
            <Campo label="Usuario" htmlFor={field.name} error={primerError(field.state.meta.errors)}>
              <Input
                id={field.name}
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
        >
          {(field) => (
            <Campo label="Contraseña" htmlFor={field.name} error={primerError(field.state.meta.errors)}>
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            </Campo>
          )}
        </form.Field>

        {errorServidor && (
          <p className="rounded-lg bg-tomate-50 px-3 py-2 text-sm text-tomate-700" role="alert">
            {errorServidor}
          </p>
        )}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" tamano="lg" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-albahaca-700 underline-offset-2 hover:underline">
          Creá una
        </Link>
      </p>
    </AuthCard>
  )
}
