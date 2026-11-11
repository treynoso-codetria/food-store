import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

import { Paginacion } from './Paginacion'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  tamanoPagina?: number
  vacio?: string
}

/** Tabla con TanStack Table: ordenamiento y paginación del lado del cliente. */
export function DataTable<T>({ data, columns, tamanoPagina = 10, vacio = 'No hay registros' }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: tamanoPagina } },
  })

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-albahaca-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-albahaca-50 text-albahaca-800">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const ordenable = header.column.getCanSort()
                  const orden = header.column.getIsSorted()
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold" aria-sort={orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined}>
                      {header.isPlaceholder ? null : ordenable ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:underline">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-xs text-albahaca-600" aria-hidden>
                            {orden === 'asc' ? '▲' : orden === 'desc' ? '▼' : ''}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-stone-500">
                  {vacio}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={table.getState().pagination.pageIndex}
        totalPaginas={table.getPageCount()}
        total={data.length}
        onCambiar={(p) => table.setPageIndex(p)}
      />
    </div>
  )
}
