import { api } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function getProducto(id: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`/productos/${id}`)
  return data
}

export async function createProducto(body: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', body)
  return data
}

export async function updateProducto(id: number, body: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, body)
  return data
}

export async function updateStock(id: number, body: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, body)
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
