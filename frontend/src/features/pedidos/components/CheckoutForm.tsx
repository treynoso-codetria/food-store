import { useForm } from '@tanstack/react-form'

import { Button } from '../../../shared/ui/Button'
import { Campo, Select, Textarea, primerError } from '../../../shared/ui/Input'
import { ETIQUETA_PAGO, type FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>
  deshabilitado?: boolean
}

export function CheckoutForm({ onConfirmar, deshabilitado = false }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as DatosCheckout,
    onSubmit: async ({ value }) => onConfirmar(value),
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
      {/* RN-06: dirección de 5 a 200 caracteres */}
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo label="Dirección de entrega" htmlFor={field.name} error={primerError(field.state.meta.errors)} ayuda="Calle, número, piso y depto.">
            <Textarea
              id={field.name}
              rows={2}
              autoComplete="street-address"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta.errors)}
            />
          </Campo>
        )}
      </form.Field>

      {/* RN-06: forma de pago EFECTIVO o TRANSFERENCIA */}
      <form.Field name="forma_pago">
        {(field) => (
          <Campo label="Forma de pago" htmlFor={field.name}>
            <Select id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}>
              {(Object.keys(ETIQUETA_PAGO) as FormaPago[]).map((fp) => (
                <option key={fp} value={fp}>
                  {ETIQUETA_PAGO[fp]}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Campo label="Notas (opcional)" htmlFor={field.name} error={primerError(field.state.meta.errors)} ayuda="Por ejemplo: tocar timbre B, sin cebolla.">
            <Textarea
              id={field.name}
              rows={2}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta.errors)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" variante="acento" tamano="lg" className="w-full" disabled={!canSubmit || deshabilitado} cargando={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
