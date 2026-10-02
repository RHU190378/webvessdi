import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import CrudPage from './CrudPage'
import { productsCfg } from './configs'

const HEADERS = ['Código (SKU)', 'Nombre', 'Slug', 'Categoría', 'Descripción', 'Características', 'Precio', 'Precio anterior', 'Stock', 'Stock mínimo', 'Activo', 'Destacado', 'Imágenes']
const norm = (s: any) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
const KEYMAP: Record<string, string> = {
  codigosku: 'sku', codigo: 'sku', sku: 'sku', nombre: 'name', producto: 'name', name: 'name', slug: 'slug', categoria: 'category',
  descripcion: 'description', caracteristicas: 'features', precio: 'price', precioanterior: 'old_price', stock: 'stock',
  stockminimo: 'min_stock', activo: 'active', destacado: 'featured', imagenes: 'images', imagen: 'images',
}
const toNum = (v: any): number | null => {
  if (v === '' || v == null) return null
  if (typeof v === 'number') return isFinite(v) ? v : NaN
  let s = String(v).replace(/[^0-9.,-]/g, '')
  if (!s) return NaN
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number(s)
  return isFinite(n) ? n : NaN
}
// null = vacío, undefined = valor no reconocido
const toBool = (v: any): boolean | null | undefined => {
  const s = norm(v)
  if (!s) return null
  if (['si', 's', 'yes', 'y', '1', 'true', 'x', 'verdadero'].includes(s)) return true
  if (['no', 'n', '0', 'false', 'falso'].includes(s)) return false
  return undefined
}
const splitList = (v: any) => String(v ?? '').split(/[|\n]+/).map((s) => s.trim()).filter(Boolean)

async function all(table: string): Promise<any[]> {
  const out: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('id').range(from, from + 999)
    if (error) throw error
    out.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return out
}

function setWidths(ws: any) {
  ws['!cols'] = [14, 34, 24, 20, 50, 40, 12, 14, 10, 12, 10, 12, 60].map((wch) => ({ wch }))
}

async function download(rows: any[][], name: string, withHelp = true) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows])
  setWidths(ws)
  XLSX.utils.book_append_sheet(wb, ws, 'Productos')
  if (withHelp) {
    const help = [
      ['INSTRUCCIONES'],
      ['• Una fila = un producto. No cambies los títulos de la fila 1.'],
      ['• Código (SKU): si ya existe un producto con ese código, se ACTUALIZA; si no existe, se CREA. Sin código, se compara por Slug o Nombre.'],
      ['• Nombre es obligatorio. Slug es la dirección web; si lo dejas vacío se genera solo.'],
      ['• Categoría: escribe el nombre. Si no existe, se crea automáticamente.'],
      ['• Características: sepáralas con el signo | (barra vertical). Ej.: Resolución 2MP | Visión nocturna'],
      ['• Precio, Precio anterior: solo números. Stock y Stock mínimo: números enteros.'],
      ['• Activo y Destacado: escribe SI o NO. Vacío = se mantiene lo actual (en productos nuevos: Activo = SI, Destacado = NO).'],
      ['• Imágenes: direcciones web (https://...) separadas por |. Las imágenes nuevas se agregan; nunca se borran las existentes. Para subir fotos desde tu computadora usa Editar > Fotografías.'],
      ['• Si quitas una columna completa, esa propiedad no se modifica.'],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(help), 'Instrucciones')
  }
  XLSX.writeFile(wb, name)
}

async function exportProducts() {
  const [prods, cats, imgs] = await Promise.all([all('products'), all('categories'), all('product_images')])
  const cmap: Record<string, string> = Object.fromEntries(cats.map((c) => [c.id, c.name]))
  const imap: Record<string, string[]> = {}
  imgs.sort((a, b) => a.sort_order - b.sort_order).forEach((i) => { (imap[i.product_id] ||= []).push(i.url) })
  const rows = prods.sort((a, b) => String(a.name).localeCompare(String(b.name))).map((p) => [
    p.sku ?? '', p.name, p.slug, cmap[p.category_id] ?? '', p.description ?? '', (p.features || []).join(' | '),
    Number(p.price), p.old_price == null ? '' : Number(p.old_price), p.stock, p.min_stock, p.active ? 'SI' : 'NO', p.featured ? 'SI' : 'NO', (imap[p.id] || []).join(' | '),
  ])
  await download(rows, `productos-vessdi-${new Date().toISOString().slice(0, 10)}.xlsx`, false)
  return rows.length
}

type Plan = { items: any[]; errors: string[]; newCats: Map<string, string>; catSlugs: string[]; imgByProd: Record<string, string[]> }

async function buildPlan(rows: any[]): Promise<Plan> {
  const [prods, cats, imgs] = await Promise.all([all('products'), all('categories'), all('product_images')])
  const bySku = new Map<string, any>(), bySlug = new Map<string, any>()
  prods.forEach((p) => { if (p.sku) bySku.set(p.sku.toLowerCase(), p); bySlug.set(p.slug, p) })
  const catByKey = new Map<string, any>(cats.map((c) => [norm(c.name), c]))
  const usedSlug = new Map<string, string>(prods.map((p) => [p.slug, p.id]))
  const imgByProd: Record<string, string[]> = {}
  imgs.forEach((i) => { (imgByProd[i.product_id] ||= []).push(i.url) })
  const errors: string[] = [], items: any[] = [], seen = new Set<string>()
  const newCats = new Map<string, string>()

  rows.forEach((r, i) => {
    const line = i + 2
    if (Object.values(r).every((v) => String(v).trim() === '')) return
    const err = (m: string) => { errors.push(`Fila ${line}: ${m}`) }
    const name = String(r.name ?? '').trim()
    if (!name) return err('falta el nombre.')
    const sku = String(r.sku ?? '').trim()
    const slugIn = slugify(String(r.slug ?? ''))
    let ex: any = sku ? bySku.get(sku.toLowerCase()) : undefined
    if (!ex) { const c = bySlug.get(slugIn || slugify(name)); if (c && (!sku || !c.sku)) ex = c }
    const key = ex ? ex.id : 'new:' + (sku.toLowerCase() || slugify(name))
    if (seen.has(key)) return err('el producto está repetido en el archivo (mismo código o nombre).')
    seen.add(key)

    const pr = 'price' in r ? toNum(r.price) : null
    if (Number.isNaN(pr) || (pr != null && pr < 0)) return err('el precio no es válido.')
    const op = 'old_price' in r ? toNum(r.old_price) : undefined
    if (Number.isNaN(op) || (op != null && op < 0)) return err('el precio anterior no es válido.')
    const st = 'stock' in r ? toNum(r.stock) : null
    const ms = 'min_stock' in r ? toNum(r.min_stock) : null
    if (Number.isNaN(st) || (st != null && st < 0) || Number.isNaN(ms) || (ms != null && ms < 0)) return err('el stock no es válido.')
    const act = 'active' in r ? toBool(r.active) : null
    const fea = 'featured' in r ? toBool(r.featured) : null
    if (act === undefined || fea === undefined) return err('"Activo" y "Destacado" deben ser SI o NO.')

    let category_id: any = ex?.category_id ?? null
    if ('category' in r) {
      const cn = String(r.category ?? '').trim()
      if (!cn) category_id = null
      else {
        const c = catByKey.get(norm(cn))
        if (c) category_id = c.id
        else { if (!newCats.has(norm(cn))) newCats.set(norm(cn), cn); category_id = 'cat:' + norm(cn) }
      }
    }
    const id = ex?.id ?? crypto.randomUUID()
    let slug = slugIn || ex?.slug || slugify(name)
    if (!slug) return err('no se pudo generar la dirección web (slug).')
    const base = slug; let n = 2
    while (usedSlug.has(slug) && usedSlug.get(slug) !== id) slug = `${base}-${n++}`
    usedSlug.set(slug, id)

    let images: string[] = []
    if ('images' in r) {
      const all = splitList(r.images)
      images = all.filter((u) => /^https?:\/\//i.test(u))
      if (all.length !== images.length) errors.push(`Fila ${line}: se ignoraron imágenes que no son direcciones https://.`)
    }
    items.push({
      isNew: !ex, images,
      payload: {
        id, sku: 'sku' in r ? sku || null : ex?.sku ?? null, name, slug, category_id,
        description: 'description' in r ? String(r.description ?? '').trim() || null : ex?.description ?? null,
        features: 'features' in r ? splitList(r.features) : ex?.features ?? [],
        price: pr ?? (ex ? Number(ex.price) : 0), old_price: op !== undefined ? op : ex?.old_price ?? null,
        stock: st != null ? Math.round(st) : ex?.stock ?? 0, min_stock: ms != null ? Math.round(ms) : ex?.min_stock ?? 0,
        active: act ?? ex?.active ?? true, featured: fea ?? ex?.featured ?? false,
      },
    })
  })
  return { items, errors, newCats, catSlugs: cats.map((c) => c.slug), imgByProd }
}

async function applyPlan(plan: Plan) {
  const errors = [...plan.errors]
  const catId = new Map<string, string>()
  if (plan.newCats.size) {
    const used = new Set(plan.catSlugs)
    const rows = [...plan.newCats].map(([k, name]) => {
      const base = slugify(name) || 'categoria'; let s = base, n = 2
      while (used.has(s)) s = `${base}-${n++}`
      used.add(s); const id = crypto.randomUUID(); catId.set(k, id)
      return { id, name, slug: s, active: true, sort_order: 0 }
    })
    const { error } = await supabase.from('categories').insert(rows)
    if (error) throw error
  }
  plan.items.forEach((it) => { const c = it.payload.category_id; if (typeof c === 'string' && c.startsWith('cat:')) it.payload.category_id = catId.get(c.slice(4)) ?? null })

  const failed = new Set<string>()
  for (let i = 0; i < plan.items.length; i += 100) {
    const chunk = plan.items.slice(i, i + 100)
    const { error } = await supabase.from('products').upsert(chunk.map((c) => c.payload), { onConflict: 'id' })
    if (error) {
      console.error(error)
      chunk.forEach((c) => failed.add(c.payload.id))
      errors.push(`No se pudieron guardar las filas del bloque ${i + 1}–${i + chunk.length} del archivo (posible código o slug duplicado).`)
    }
  }
  const imgRows: any[] = []
  plan.items.filter((it) => !failed.has(it.payload.id) && it.images.length).forEach((it) => {
    const have = plan.imgByProd[it.payload.id] || []
    const add = [...new Set<string>(it.images)].filter((u) => !have.includes(u))
    add.forEach((url, k) => imgRows.push({ product_id: it.payload.id, url, sort_order: have.length + k }))
  })
  for (let i = 0; i < imgRows.length; i += 200) {
    const { error } = await supabase.from('product_images').insert(imgRows.slice(i, i + 200))
    if (error) { console.error(error); errors.push('No se pudieron guardar algunas imágenes.') }
  }
  const ok = plan.items.filter((it) => !failed.has(it.payload.id))
  return { created: ok.filter((i) => i.isNew).length, updated: ok.filter((i) => !i.isNew).length, errors }
}

export default function ProductsAdmin() {
  const [k, setK] = useState(0)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: string; s: string; list?: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const run = async (fn: () => Promise<void>) => {
    setMsg(null); setBusy(true)
    try { await fn() } catch (e: any) { console.error(e); setMsg({ t: 'err', s: e?.userMessage || 'No se pudo completar la operación. Revisa el archivo e intenta nuevamente.' }) }
    setBusy(false)
  }
  const onFile = (file?: File | null) => file && run(async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const raw: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
    const rows = raw.map((r) => { const o: any = {}; Object.entries(r).forEach(([key, v]) => { const m = KEYMAP[norm(key)]; if (m) o[m] = v }); return o })
    if (!rows.some((r) => 'name' in r)) throw { userMessage: 'No encontré la columna "Nombre". Usa la plantilla o un archivo exportado desde aquí.' }
    const plan = await buildPlan(rows)
    if (!plan.items.length) { setMsg({ t: 'err', s: 'No hay filas válidas para importar.', list: plan.errors.slice(0, 20) }); return }
    const nNew = plan.items.filter((i) => i.isNew).length
    const text = `Se crearán ${nNew} productos y se actualizarán ${plan.items.length - nNew}.` +
      (plan.newCats.size ? ` Se crearán ${plan.newCats.size} categorías nuevas.` : '') +
      (plan.errors.length ? ` ${plan.errors.length} avisos/errores (esas filas se omiten).` : '') + ' ¿Continuar?'
    if (!confirm(text)) return
    const res = await applyPlan(plan)
    setMsg({ t: res.errors.length ? 'info' : 'ok', s: `Listo: ${res.created} creados, ${res.updated} actualizados.${res.errors.length ? ` Avisos: ${res.errors.length}.` : ''}`, list: res.errors.slice(0, 20) })
    setK((x) => x + 1)
  }).finally(() => { if (fileRef.current) fileRef.current.value = '' })

  return (
    <div>
      <div className="panel" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18 }}>Excel: exportar e importar productos</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Descarga la plantilla, llena tu lista y súbela. Los productos con el mismo código (SKU) se actualizan; los nuevos se crean.</p>
        <div className="btns" style={{ marginTop: 0 }}>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => run(async () => { const n = await exportProducts(); setMsg({ t: 'ok', s: `Se exportaron ${n} productos.` }) })}>Exportar a Excel</button>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => run(async () => { await download([], 'plantilla-productos-vessdi.xlsx') })}>Descargar plantilla</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Procesando…' : 'Importar desde Excel'}</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden aria-label="Archivo de Excel" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {msg && <div className={`msg ${msg.t}`} role="status" style={{ marginTop: 12 }}>{msg.s}{msg.list && msg.list.length > 0 && <ul className="list" style={{ margin: '8px 0 0' }}>{msg.list.map((l) => <li key={l}>{l}</li>)}</ul>}</div>}
      </div>
      <CrudPage key={k} cfg={productsCfg} />
    </div>
  )
}
