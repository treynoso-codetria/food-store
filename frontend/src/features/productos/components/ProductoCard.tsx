import { ImagenProducto } from '../../../shared/components/ImagenProducto'
import { Button } from '../../../shared/ui/Button'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStock = producto.stock === 0
  const vendible = producto.disponible && !sinStock
  const tope = enCarrito >= producto.stock

  let aviso: string | null = null
  if (!producto.disponible) aviso = 'No disponible hoy'
  else if (sinStock) aviso = 'Sin stock'
  else if (producto.stock <= 5) aviso = `Quedan ${producto.stock}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-albahaca-100 bg-white">
      <div className="relative">
        <ImagenProducto src={producto.imagen_url} alt={producto.nombre} className={`aspect-[3/2] w-full ${vendible ? '' : 'grayscale'}`} />
        {aviso && (
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${vendible ? 'bg-mostaza-400 text-albahaca-900' : 'bg-white/95 text-tomate-700'}`}>
            {aviso}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-albahaca-600">{producto.categoria.nombre}</p>
        <h3 className="mt-0.5 text-lg leading-snug font-bold text-albahaca-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="font-display text-2xl font-bold text-tinta">{formatPrecio(producto.precio_base)}</p>
          <Button
            variante={enCarrito > 0 ? 'borde' : 'primario'}
            tamano="sm"
            disabled={!vendible || tope}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
              })
            }
          >
            {enCarrito > 0 ? `En el carrito (${enCarrito})` : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </article>
  )
}
