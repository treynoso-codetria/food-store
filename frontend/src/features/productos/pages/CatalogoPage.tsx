import { useState } from 'react'

import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useDebounce } from '../../../shared/utils/useDebounce'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 9

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [pagina, setPagina] = useState(0)
  const search = useDebounce(busqueda.trim())

  const categorias = useCategorias()
  // skip = página × limit: la paginación la hace el servidor
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0)
  }

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / POR_PAGINA) : 0
  const chip = (activo: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors md:w-full md:rounded-lg md:text-left ${
      activo ? 'bg-albahaca-700 text-white' : 'text-albahaca-800 hover:bg-albahaca-50'
    }`

  return (
    <div>
      <section className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_minmax(0,380px)]">
        <h1 className="font-display text-5xl leading-[0.95] font-extrabold text-albahaca-900 sm:text-6xl md:text-7xl">
          ¿Qué pedimos hoy?
        </h1>
        <div>
          <label htmlFor="buscar" className="mb-2 block text-sm font-medium text-stone-600">
            Buscá en la carta
          </label>
          <div className="relative">
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-albahaca-600" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.33 3.33a.75.75 0 1 1-1.06 1.06l-3.33-3.33A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              id="buscar"
              type="search"
              placeholder="Pizza, empanada, flan…"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(0)
              }}
              className="h-14 w-full rounded-full border-2 border-albahaca-700 bg-white pr-5 pl-12 text-base focus:ring-4 focus:ring-mostaza-300 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <aside className="min-w-0">
          <h2 className="mb-3 hidden text-sm font-semibold text-stone-500 md:block">Categorías</h2>
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0" aria-label="Categorías">
            <button type="button" className={chip(categoriaId === undefined)} onClick={() => elegirCategoria(undefined)}>
              Toda la carta
            </button>
            {categorias.isPending
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9 w-28 shrink-0 md:w-full" />)
              : categorias.data?.map((c) => (
                  <button key={c.id} type="button" className={chip(categoriaId === c.id)} onClick={() => elegirCategoria(c.id)}>
                    {c.nombre}
                  </button>
                ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {productos.isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-albahaca-100 bg-white">
                  <Skeleton className="aspect-[3/2] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-4 h-8 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : productos.isError ? (
            <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
          ) : productos.data.items.length === 0 ? (
            <EstadoVacio
              titulo={search ? `No encontramos "${search}"` : 'Todavía no hay productos en esta categoría'}
              descripcion="Probá con otra palabra o mirá toda la carta."
              accion={
                <Button
                  variante="borde"
                  onClick={() => {
                    setBusqueda('')
                    elegirCategoria(undefined)
                  }}
                >
                  Ver toda la carta
                </Button>
              }
            />
          ) : (
            <>
              <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}>
                {productos.data.items.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={productos.data.total} onCambiar={setPagina} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
