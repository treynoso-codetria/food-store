import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Campo, Input, Textarea, primerError } from '../../../shared/ui/Input'
import type { Categoria, CategoriaCreate } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  onGuardar: (body: CategoriaCreate) => Promise<void>
  onCancelar: () => void
  error?: string | null
}

export function CategoriaForm({ inicial, onGuardar, onCancelar, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: async ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 2 || largo > 100 ? 'El nombre debe tener entre 2 y 100 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <Campo label="Nombre" htmlFor="cat-nombre" error={primerError(field.state.meta.errors)}>
            <Input
              id="cat-nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta.errors)}
            />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Campo label="Descripción (opcional)" htmlFor="cat-desc">
            <Textarea id="cat-desc" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      {error && (
        <p className="rounded-lg bg-tomate-50 px-3 py-2 text-sm text-tomate-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variante="borde" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              {inicial ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
