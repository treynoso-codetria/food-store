import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Campo, Input, Select, Textarea, primerError } from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  onGuardar: (body: ProductoCreate) => Promise<void>
  onCancelar: () => void
  error?: string | null
}

interface Valores {
  nombre: string
  descripcion: string
  precio_base: string
  imagen_url: string
  stock: string
  disponible: boolean
  categoria_id: string
}

const esNumero = (v: string) => v.trim() !== '' && !Number.isNaN(Number(v))

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar, error }: ProductoFormProps) {
  const defaultValues: Valores = {
    nombre: inicial?.nombre ?? '',
    descripcion: inicial?.descripcion ?? '',
    precio_base: inicial ? String(inicial.precio_base) : '',
    imagen_url: inicial?.imagen_url ?? '',
    stock: inicial ? String(inicial.stock) : '0',
    disponible: inicial?.disponible ?? true,
    categoria_id: inicial ? String(inicial.categoria_id) : '',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
  })

  return (
    <form
      noValidate
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="sm:col-span-2">
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : undefined) }}
        >
          {(field) => (
            <Campo label="Nombre" htmlFor="prod-nombre" error={primerError(field.state.meta.errors)}>
              <Input id="prod-nombre" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={primerError(field.state.meta.errors)} />
            </Campo>
          )}
        </form.Field>
      </div>

      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (!value ? 'Elegí una categoría' : undefined) }}>
        {(field) => (
          <Campo label="Categoría" htmlFor="prod-cat" error={primerError(field.state.meta.errors)}>
            <Select id="prod-cat" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={primerError(field.state.meta.errors)}>
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="precio_base"
        validators={{ onChange: ({ value }) => (!esNumero(value) || Number(value) < 0 ? 'Ingresá un precio mayor o igual a 0' : undefined) }}
      >
        {(field) => (
          <Campo label="Precio" htmlFor="prod-precio" error={primerError(field.state.meta.errors)}>
            <Input id="prod-precio" type="number" min={0} step="0.01" inputMode="decimal" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={primerError(field.state.meta.errors)} />
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => (!esNumero(value) || Number(value) < 0 || !Number.isInteger(Number(value)) ? 'El stock es un entero mayor o igual a 0' : undefined),
        }}
      >
        {(field) => (
          <Campo label="Stock" htmlFor="prod-stock" error={primerError(field.state.meta.errors)}>
            <Input id="prod-stock" type="number" min={0} step={1} inputMode="numeric" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={primerError(field.state.meta.errors)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-albahaca-900">
            <input type="checkbox" className="size-5 accent-albahaca-700" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="sm:col-span-2">
        <form.Field name="imagen_url">
          {(field) => (
            <Campo label="URL de la imagen (opcional)" htmlFor="prod-img">
              <Input id="prod-img" type="url" placeholder="https://…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>

      <div className="sm:col-span-2">
        <form.Field name="descripcion">
          {(field) => (
            <Campo label="Descripción (opcional)" htmlFor="prod-desc">
              <Textarea id="prod-desc" rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>

      {error && (
        <p className="rounded-lg bg-tomate-50 px-3 py-2 text-sm text-tomate-700 sm:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variante="borde" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              {inicial ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
