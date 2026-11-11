const precio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export const formatPrecio = (valor: number): string => precio.format(valor)
export const formatFecha = (iso: string): string => fecha.format(new Date(iso))
