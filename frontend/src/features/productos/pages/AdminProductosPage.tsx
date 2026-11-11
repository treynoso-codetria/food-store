import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { ImagenProducto } from '../../../shared/components/ImagenProducto'
import { SkeletonTabla } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { formatPrecio } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarStock, useEliminarProducto, useGuardarProducto, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

export function AdminProductosPage() {
  const [busqueda, setBusqueda] = useState('')
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const guardar = useGuardarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    guardar.reset()
    stock.reset()
    eliminar.reset()
  }

  const onGuardar = async (body: ProductoCreate) => {
    try {
      await guardar.mutateAsync({ id: dialogo?.tipo === 'editar' ? dialogo.producto.id : undefined, body })
      cerrar()
    } catch {
      /* se muestra guardar.error */
    }
  }

  const onGuardarStock = async (body: ProductoStockUpdate) => {
    if (dialogo?.tipo !== 'stock') return
    try {
      await stock.mutateAsync({ id: dialogo.producto.id, body })
      cerrar()
    } catch {
      /* se muestra stock.error */
    }
  }

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ImagenProducto src={row.original.imagen_url} alt={row.original.nombre} className="size-10 shrink-0 rounded-lg text-base" />
            <span className="font-semibold">{row.original.nombre}</span>
          </div>
        ),
      },
      { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
      { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => <span className="tabular-nums">{formatPrecio(row.original.precio_base)}</span> },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => <span className={`tabular-nums ${row.original.stock === 0 ? 'font-semibold text-tomate-700' : ''}`}>{row.original.stock}</span>,
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) => (row.original.disponible ? 'Sí' : <span className="text-tomate-700">No</span>),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="borde" tamano="sm" onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button variante="borde" tamano="sm" onClick={() => setDialogo({ tipo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button variante="fantasma" tamano="sm" className="text-tomate-700" onClick={() => setDialogo({ tipo: 'eliminar', producto: row.original })}>
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const items = productos.data?.items ?? []
    return q ? items.filter((p) => p.nombre.toLowerCase().includes(q)) : items
  }, [productos.data, busqueda])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-albahaca-900">Productos</h1>
        <div className="flex flex-wrap gap-2">
          <Input type="search" placeholder="Filtrar por nombre" aria-label="Filtrar por nombre" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-56" />
          <Button onClick={() => setDialogo({ tipo: 'crear' })} disabled={!categorias.data?.length}>
            Nuevo producto
          </Button>
        </div>
      </div>

      {productos.isPending ? (
        <SkeletonTabla />
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : (
        <DataTable data={filtrados} columns={columnas} vacio="No hay productos que coincidan" />
      )}

      <Modal abierto={dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar'} titulo={dialogo?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'} onCerrar={cerrar} ancho="lg">
        {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
          <ProductoForm
            inicial={dialogo.tipo === 'editar' ? dialogo.producto : undefined}
            categorias={categorias.data ?? []}
            onGuardar={onGuardar}
            onCancelar={cerrar}
            error={guardar.isError ? handleApiError(guardar.error) : null}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'stock'} titulo={`Stock de ${dialogo?.tipo === 'stock' ? dialogo.producto.nombre : ''}`} onCerrar={cerrar} ancho="sm">
        {dialogo?.tipo === 'stock' && (
          <StockForm producto={dialogo.producto} onGuardar={onGuardarStock} onCancelar={cerrar} error={stock.isError ? handleApiError(stock.error) : null} />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'eliminar'} titulo={`¿Dar de baja "${dialogo?.tipo === 'eliminar' ? dialogo.producto.nombre : ''}"?`} onCerrar={cerrar} ancho="sm">
        <p className="text-sm text-stone-600">El producto deja de verse en la carta. Los pedidos que ya lo incluyen no cambian.</p>
        {eliminar.isError && <p className="mt-3 text-sm text-tomate-700">{handleApiError(eliminar.error)}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="borde" onClick={cerrar}>
            Volver
          </Button>
          <Button
            variante="peligro"
            cargando={eliminar.isPending}
            onClick={() => dialogo?.tipo === 'eliminar' && eliminar.mutate(dialogo.producto.id, { onSuccess: cerrar })}
          >
            Dar de baja
          </Button>
        </div>
      </Modal>
    </div>
  )
}
