import { supabase } from './supabase'

export const money = (n: number | string | null | undefined) =>
  `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const slugify = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const firstImage = (imgs?: any[]) =>
  imgs && imgs.length ? [...imgs].sort((a, b) => a.sort_order - b.sort_order)[0].url : null

export const cleanName = (n: string) => n.replace(/[^a-zA-Z0-9._-]/g, '_')

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmado: 'Confirmado', en_proceso: 'En proceso', entregado: 'Entregado', cancelado: 'Cancelado',
  nueva: 'Nueva', en_revision: 'En revisión', cotizada: 'Cotizada', cerrada: 'Cerrada', descartada: 'Descartada',
}
