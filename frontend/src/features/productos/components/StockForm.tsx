import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Campo, Input, primerError } from '../../../shared/ui/Input'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardar: (body: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
  error?: string | null
}

export function StockForm({ producto, onGuardar, onCancelar, error }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
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
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value)
            return value.trim() === '' || !Number.isInteger(n) || n < 0 ? 'El stock es un entero mayor o igual a 0' : undefined
          },
        }}
      >
        {(field) => (
          <Campo label="Unidades en stock" htmlFor="stock" error={primerError(field.state.meta.errors)}>
            <Input id="stock" type="number" min={0} step={1} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} error={primerError(field.state.meta.errors)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-3 text-sm font-medium text-albahaca-900">
            <input type="checkbox" className="size-5 accent-albahaca-700" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
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
              Guardar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
