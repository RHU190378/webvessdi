import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cleanName, slugify, uploadFile } from '../lib/utils'
import { Loading } from '../components/ui'

export type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'lines' | 'image' | 'date' | 'fk'; options?: string[][]; table?: string; labelKey?: string; required?: boolean; bucket?: string; nullable?: boolean; help?: string }
export type Cfg = { table: string; title: string; order: string; asc?: boolean; cols: { key: string; label: string; fmt?: (v: any, r: any) => any }[]; fields: Field[]; gallery?: { table: string; fk: string; bucket: string }; slugFrom?: string }

function Gallery({ g, id }: { g: NonNullable<Cfg['gallery']>; id: string }) {
  const [items, setItems] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const load = async () => { const { data } = await supabase.from(g.table).select('*').eq(g.fk, id).order('sort_order'); setItems(data || []) }
  useEffect(() => { load() }, [id])
  const add = async (files: FileList | null) => {
    if (!files) return
    setBusy(true)
    try {
      let n = items.length
      for (const f of Array.from(files)) {
        const url = await uploadFile(g.bucket, `${id}/${Date.now()}-${cleanName(f.name)}`, f)
        const { error } = await supabase.from(g.table).insert({ [g.fk]: id, url, sort_order: n++ })
        if (error) throw error
      }
    } catch (e) { console.error(e); alert('No se pudo subir una imagen. Verifica que el bucket exista en Supabase.') }
    setBusy(false); load()
  }
  const del = async (i: any) => { if (confirm('¿Quitar esta imagen?')) { await supabase.from(g.table).delete().eq('id', i.id); load() } }
  return (
    <div><label>Fotografías</label>
      <div className="thumb-row">{items.map((i) => <div key={i.id}><img src={i.url} alt="" /><button type="button" className="btn btn-danger btn-sm" aria-label="Quitar imagen" onClick={() => del(i)}>✕</button></div>)}</div>
      <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => add(e.target.files)} />{busy && <small>Subiendo…</small>}
    </div>
  )
}

export default function CrudPage({ cfg }: { cfg: Cfg }) {
  const [rows, setRows] = useState<any[] | null>(null)
  const [form, setForm] = useState<any | null>(null)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [fk, setFk] = useState<Record<string, any[]>>({})

  const load = async () => {
    const { data, error } = await supabase.from(cfg.table).select('*').order(cfg.order, { ascending: cfg.asc ?? true })
    if (error) { console.error(error); setErr('No se pudo cargar la lista.'); return }
    setRows(data || [])
  }
  useEffect(() => {
    setRows(null); setForm(null); setErr('')
    load()
    cfg.fields.filter((f) => f.type === 'fk').forEach(async (f) => {
      const { data } = await supabase.from(f.table!).select(`id,${f.labelKey}`).order(f.labelKey!)
      setFk((o) => ({ ...o, [f.key]: data || [] }))
    })
  }, [cfg.table])

  const openNew = () => {
    const base: any = { __new: true, id: crypto.randomUUID() }
    cfg.fields.forEach((f) => { base[f.key] = f.type === 'checkbox' ? (f.key === 'active') : f.type === 'number' ? (f.nullable ? '' : 0) : '' })
    setSaved(false); setErr(''); setForm(base)
  }
  const openEdit = (r: any) => {
    const v: any = { ...r }
    cfg.fields.forEach((f) => { if (f.type === 'lines') v[f.key] = (r[f.key] || []).join('\n'); if (v[f.key] == null) v[f.key] = f.type === 'checkbox' ? false : '' })
    setSaved(false); setErr(''); setForm(v)
  }

  async function save(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    const p: any = {}
    cfg.fields.forEach((f) => {
      let v = form[f.key]
      if (f.type === 'lines') v = String(v || '').split('\n').map((s) => s.trim()).filter(Boolean)
      else if (f.type === 'number') v = v === '' || v == null ? (f.nullable ? null : 0) : Number(v)
      else if (f.type === 'checkbox') v = !!v
      else if (f.key === 'slug') v = slugify(v || form[cfg.slugFrom || 'name'] || form.title || '')
      else if (v === '' && f.type !== 'textarea') v = null
      p[f.key] = v
    })
    const res = form.__new ? await supabase.from(cfg.table).insert({ id: form.id, ...p }) : await supabase.from(cfg.table).update(p).eq('id', form.id)
    setBusy(false)
    if (res.error) { console.error(res.error); setErr(res.error.code === '23505' ? 'Ya existe un registro con ese código o nombre de URL (slug).' : 'No se pudo guardar. Revisa los datos.'); return }
    setForm({ ...form, __new: false, slug: p.slug ?? form.slug }); setSaved(true); load()
  }
  const del = async (r: any) => {
    if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from(cfg.table).delete().eq('id', r.id)
    if (error) alert('No se pudo eliminar.'); else load()
  }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  if (form) return (
    <div><h1>{form.__new ? 'Nuevo' : 'Editar'} · {cfg.title}</h1>
      <form className="form panel" onSubmit={save}>
        {cfg.fields.map((f) => {
          const id = `f_${f.key}`
          const lab = <label htmlFor={id}>{f.label}{f.required ? ' *' : ''}</label>
          if (f.type === 'checkbox') return <div className="check" key={f.key}><label><input id={id} type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} />{f.label}</label></div>
          if (f.type === 'textarea' || f.type === 'lines') return <div key={f.key}>{lab}<textarea id={id} required={f.required} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />{f.type === 'lines' && <small>Escribe un elemento por línea.</small>}</div>
          if (f.type === 'select') return <div key={f.key}>{lab}<select id={id} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>{f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          if (f.type === 'fk') return <div key={f.key}>{lab}<select id={id} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}><option value="">— Ninguno —</option>{(fk[f.key] || []).map((o) => <option key={o.id} value={o.id}>{o[f.labelKey!]}</option>)}</select></div>
          if (f.type === 'image') return <div key={f.key}>{lab}{form[f.key] && <img src={form[f.key]} alt="" style={{ width: 160, borderRadius: 8, margin: '6px 0' }} />}
            <input id={id} type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { set(f.key, await uploadFile(f.bucket!, `${form.id}/${Date.now()}-${cleanName(file.name)}`, file)) } catch { alert('No se pudo subir la imagen. Verifica que el bucket exista.') } }} /></div>
          return <div key={f.key}>{lab}<input id={id} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} step={f.type === 'number' ? 'any' : undefined} required={f.required} value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />{f.help && <small>{f.help}</small>}</div>
        })}
        {cfg.gallery && (form.__new ? <div className="msg info">Guarda primero para poder agregar fotografías.</div> : <Gallery g={cfg.gallery} id={form.id} />)}
        {err && <div className="msg err" role="alert">{err}</div>}{saved && <div className="msg ok" role="status">Guardado correctamente.</div>}
        <div className="btns" style={{ marginTop: 0 }}><button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button><button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Volver a la lista</button></div>
      </form></div>
  )

  return (
    <div><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><h1>{cfg.title}</h1><button className="btn btn-accent" onClick={openNew}>+ Nuevo</button></div>
      {err && <div className="msg err">{err}</div>}
      {!rows ? <Loading /> : rows.length === 0 ? <div className="state">Aún no hay registros.</div> : (
        <div className="table-wrap"><table><thead><tr>{cfg.cols.map((c) => <th key={c.key}>{c.label}</th>)}<th>Acciones</th></tr></thead><tbody>
          {rows.map((r) => <tr key={r.id}>{cfg.cols.map((c) => <td key={c.key}>{c.fmt ? c.fmt(r[c.key], r) : typeof r[c.key] === 'boolean' ? (r[c.key] ? 'Sí' : 'No') : String(r[c.key] ?? '')}</td>)}
            <td style={{ whiteSpace: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Editar</button> <button className="btn btn-danger btn-sm" onClick={() => del(r)}>Eliminar</button></td></tr>)}
        </tbody></table></div>)}
    </div>
  )
}
