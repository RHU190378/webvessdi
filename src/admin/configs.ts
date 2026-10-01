import type { Cfg } from './CrudPage'
import { money } from '../lib/utils'

export const productsCfg: Cfg = {
  table: 'products', title: 'Productos', order: 'created_at', asc: false, slugFrom: 'name',
  cols: [{ key: 'sku', label: 'Código' }, { key: 'name', label: 'Nombre' }, { key: 'price', label: 'Precio', fmt: (v) => money(v) },
    { key: 'stock', label: 'Stock', fmt: (v, r) => (v <= r.min_stock ? `⚠ ${v}` : v) }, { key: 'active', label: 'Activo' }, { key: 'featured', label: 'Destacado' }],
  fields: [
    { key: 'name', label: 'Nombre', required: true }, { key: 'sku', label: 'Código / SKU' },
    { key: 'slug', label: 'Dirección web (slug)', help: 'Déjalo vacío para generarlo automáticamente.' },
    { key: 'category_id', label: 'Categoría', type: 'fk', table: 'categories', labelKey: 'name' },
    { key: 'description', label: 'Descripción', type: 'textarea' }, { key: 'features', label: 'Características', type: 'lines' },
    { key: 'price', label: 'Precio (Bs)', type: 'number', required: true }, { key: 'old_price', label: 'Precio anterior (opcional)', type: 'number', nullable: true },
    { key: 'stock', label: 'Stock', type: 'number' }, { key: 'min_stock', label: 'Stock mínimo', type: 'number' },
    { key: 'active', label: 'Activo (visible en la tienda)', type: 'checkbox' }, { key: 'featured', label: 'Producto destacado', type: 'checkbox' },
  ],
  gallery: { table: 'product_images', fk: 'product_id', bucket: 'product-images' },
}
export const categoriesCfg: Cfg = {
  table: 'categories', title: 'Categorías', order: 'sort_order', slugFrom: 'name',
  cols: [{ key: 'name', label: 'Nombre' }, { key: 'slug', label: 'Slug' }, { key: 'sort_order', label: 'Orden' }, { key: 'active', label: 'Activa' }],
  fields: [{ key: 'name', label: 'Nombre', required: true }, { key: 'slug', label: 'Dirección web (slug)' }, { key: 'description', label: 'Descripción', type: 'textarea' },
    { key: 'sort_order', label: 'Orden', type: 'number' }, { key: 'active', label: 'Activa', type: 'checkbox' }],
}
export const servicesCfg: Cfg = {
  table: 'services', title: 'Servicios', order: 'sort_order', slugFrom: 'title',
  cols: [{ key: 'title', label: 'Servicio' }, { key: 'sort_order', label: 'Orden' }, { key: 'active', label: 'Activo' }],
  fields: [{ key: 'title', label: 'Nombre', required: true }, { key: 'slug', label: 'Dirección web (slug)', help: 'No lo cambies en los servicios existentes.' },
    { key: 'short_description', label: 'Descripción breve', type: 'textarea' }, { key: 'description', label: 'Descripción', type: 'textarea' },
    { key: 'problem', label: 'Problema que resuelve', type: 'textarea' }, { key: 'benefits', label: 'Beneficios', type: 'lines' },
    { key: 'features', label: 'Características', type: 'lines' }, { key: 'applications', label: 'Aplicaciones', type: 'lines' },
    { key: 'image_url', label: 'Imagen principal', type: 'image', bucket: 'service-images' }, { key: 'sort_order', label: 'Orden', type: 'number' },
    { key: 'active', label: 'Activo', type: 'checkbox' }],
}
export const projectsCfg: Cfg = {
  table: 'projects', title: 'Proyectos', order: 'created_at', asc: false, slugFrom: 'title',
  cols: [{ key: 'title', label: 'Título' }, { key: 'city', label: 'Ciudad' }, { key: 'project_date', label: 'Fecha' }, { key: 'published', label: 'Publicado' }],
  fields: [{ key: 'title', label: 'Título', required: true }, { key: 'slug', label: 'Dirección web (slug)' },
    { key: 'service_id', label: 'Servicio relacionado', type: 'fk', table: 'services', labelKey: 'title' },
    { key: 'city', label: 'Ciudad' }, { key: 'department', label: 'Departamento' }, { key: 'project_date', label: 'Fecha', type: 'date' },
    { key: 'description', label: 'Descripción', type: 'textarea' }, { key: 'work_done', label: 'Trabajo realizado', type: 'textarea' },
    { key: 'equipment', label: 'Equipos utilizados', type: 'textarea' }, { key: 'published', label: 'Publicado (visible en la web)', type: 'checkbox' }],
  gallery: { table: 'project_images', fk: 'project_id', bucket: 'project-images' },
}
export const testimonialsCfg: Cfg = {
  table: 'testimonials', title: 'Testimonios', order: 'created_at', asc: false,
  cols: [{ key: 'author', label: 'Autor' }, { key: 'content', label: 'Testimonio' }, { key: 'active', label: 'Activo' }],
  fields: [{ key: 'author', label: 'Autor', required: true }, { key: 'role_company', label: 'Cargo / empresa' },
    { key: 'content', label: 'Testimonio', type: 'textarea', required: true }, { key: 'active', label: 'Activo', type: 'checkbox' }],
}
export const faqsCfg: Cfg = {
  table: 'faqs', title: 'Preguntas frecuentes', order: 'sort_order',
  cols: [{ key: 'question', label: 'Pregunta' }, { key: 'service_slug', label: 'Servicio' }, { key: 'active', label: 'Activa' }],
  fields: [{ key: 'question', label: 'Pregunta', required: true }, { key: 'answer', label: 'Respuesta', type: 'textarea', required: true },
    { key: 'service_slug', label: 'Slug del servicio (opcional)', help: 'Ej.: video-vigilancia. Vacío = pregunta general.' },
    { key: 'sort_order', label: 'Orden', type: 'number' }, { key: 'active', label: 'Activa', type: 'checkbox' }],
}
