import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonTabla } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type Edicion = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria } | null

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const guardar = useGuardarCategoria()
  const eliminar = useEliminarCategoria()
  const [edicion, setEdicion] = useState<Edicion>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const cerrar = () => {
    setEdicion(null)
    guardar.reset()
  }

  const onGuardar = async (body: CategoriaCreate) => {
    try {
      await guardar.mutateAsync({ id: edicion?.modo === 'editar' ? edicion.categoria.id : undefined, body })
      cerrar()
    } catch {
      // el error se muestra desde guardar.error
    }
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span> },
      { accessorKey: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="borde" tamano="sm" onClick={() => setEdicion({ modo: 'editar', categoria: row.original })}>
              Editar
            </Button>
            <Button variante="fantasma" tamano="sm" className="text-tomate-700" onClick={() => setAEliminar(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-albahaca-900">Categorías</h1>
        <Button onClick={() => setEdicion({ modo: 'crear' })}>Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <SkeletonTabla />
      ) : categorias.isError ? (
        <EstadoError error={categorias.error} onReintentar={() => void categorias.refetch()} />
      ) : (
        <DataTable data={categorias.data} columns={columnas} vacio="Todavía no hay categorías. Creá la primera." />
      )}

      <Modal abierto={edicion !== null} titulo={edicion?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'} onCerrar={cerrar}>
        {edicion && (
          <CategoriaForm
            inicial={edicion.modo === 'editar' ? edicion.categoria : undefined}
            onGuardar={onGuardar}
            onCancelar={cerrar}
            error={guardar.isError ? handleApiError(guardar.error) : null}
          />
        )}
      </Modal>

      <Modal abierto={aEliminar !== null} titulo={`¿Dar de baja "${aEliminar?.nombre ?? ''}"?`} onCerrar={() => setAEliminar(null)} ancho="sm">
        <p className="text-sm text-stone-600">
          La categoría deja de aparecer en la carta. Sus productos siguen visibles: si querés retirarlos, dalos de baja también. El nombre no se puede reutilizar.
        </p>
        {eliminar.isError && <p className="mt-3 text-sm text-tomate-700">{handleApiError(eliminar.error)}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="borde" onClick={() => setAEliminar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            cargando={eliminar.isPending}
            onClick={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
          >
            Dar de baja
          </Button>
        </div>
      </Modal>
    </div>
  )
}
