import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonTabla } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { formatFecha } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const cambiar = useCambiarEstadoUsuario()
  const yo = useAuthStore((s) => s.usuario)
  const enCurso = cambiar.isPending ? cambiar.variables?.id : undefined

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario', cell: ({ row }) => <span className="font-semibold">{row.original.username}</span> },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Rol', cell: ({ row }) => (row.original.role === 'admin' ? 'Administrador' : 'Cliente') },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="rounded-full bg-tomate-50 px-2.5 py-0.5 text-xs font-semibold text-tomate-700">Desactivado</span>
          ) : (
            <span className="rounded-full bg-albahaca-50 px-2.5 py-0.5 text-xs font-semibold text-albahaca-700">Activo</span>
          ),
      },
      { accessorKey: 'created_at', header: 'Alta', cell: ({ row }) => formatFecha(row.original.created_at) },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          if (u.id === yo?.id) return <span className="text-xs text-stone-500">Tu cuenta</span> // no se desactiva a sí mismo
          return u.disabled ? (
            <Button tamano="sm" cargando={enCurso === u.id} onClick={() => cambiar.mutate({ id: u.id, activar: true })}>
              Activar
            </Button>
          ) : (
            <Button variante="borde" tamano="sm" className="text-tomate-700" cargando={enCurso === u.id} onClick={() => cambiar.mutate({ id: u.id, activar: false })}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [yo?.id, cambiar, enCurso],
  )

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-albahaca-900">Usuarios</h1>
      {cambiar.isError && (
        <p className="mb-4 rounded-lg bg-tomate-50 px-4 py-3 text-sm text-tomate-700" role="alert">
          {handleApiError(cambiar.error)}
        </p>
      )}
      {usuarios.isPending ? (
        <SkeletonTabla />
      ) : usuarios.isError ? (
        <EstadoError error={usuarios.error} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} />
      )}
    </div>
  )
}
