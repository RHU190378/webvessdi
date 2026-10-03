import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useContent } from '../contexts/ContentContext'
import { DEFAULTS, SECTIONS } from '../lib/contentDefaults'
import { cleanName, uploadFile } from '../lib/utils'

export default function ContentAdmin() {
  const { get, reload } = useContent()
  const [sec, setSec] = useState(SECTIONS[0])
  const [form, setForm] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: string; s: string } | null>(null)

  const val = (k: string) => (k in form ? form[k] : get(k))
  const set = (k: string, v: string) => { setMsg(null); setForm((f) => ({ ...f, [k]: v })) }
  const pending = DEFAULTS.filter((d) => d.key in form && form[d.key] !== get(d.key))

  async function save() {
    setBusy(true); setMsg(null)
    const { error } = await supabase.from('site_content').upsert(pending.map((d) => ({ key: d.key, value: form[d.key] })), { onConflict: 'key' })
    if (error) {
      console.error(error)
      setMsg({ t: 'err', s: 'No se pudo guardar. Verifica que ejecutaste el SQL 04 en Supabase y que tu sesión es de administrador.' })
    } else {
      await reload(); setForm({}); setMsg({ t: 'ok', s: 'Cambios guardados. Ya se ven en el sitio.' })
    }
    setBusy(false)
  }
  async function onImage(k: string, file?: File) {
    if (!file) return
    try { set(k, await uploadFile('site-images', `content/${k}-${Date.now()}-${cleanName(file.name)}`, file)) }
    catch (e) { console.error(e); setMsg({ t: 'err', s: 'No se pudo subir la imagen. Verifica que exista el bucket "site-images" en Supabase.' }) }
  }

  return (
    <div>
      <h1>Contenido del sitio</h1>
      <p style={{ color: 'var(--muted)' }}>Edita los textos e imágenes de la web. Los servicios, productos, proyectos, testimonios y preguntas frecuentes se editan en sus propias secciones.</p>
      <div className="btns" style={{ marginTop: 8, marginBottom: 20 }}>
        {SECTIONS.map((s) => <button key={s} className={`btn btn-sm ${s === sec ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSec(s)}>{s}</button>)}
      </div>
      <div className="panel form">
        {DEFAULTS.filter((d) => d.section === sec).map((d) => {
          const id = `c_${d.key}`, v = val(d.key)
          return (
            <div key={d.key}>
              <label htmlFor={id}>{d.label}</label>
              {d.type === 'textarea' ? <textarea id={id} rows={4} value={v} onChange={(e) => set(d.key, e.target.value)} />
                : d.type === 'image' ? (<div>
                  {v && <img src={v} alt="" style={{ maxWidth: 220, maxHeight: 120, objectFit: 'contain', background: '#eef2f6', borderRadius: 8, marginBottom: 6 }} />}
                  <input id={id} type="file" accept="image/*" onChange={(e) => onImage(d.key, e.target.files?.[0])} />
                  {v && <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={() => set(d.key, '')}>Quitar imagen</button>}
                </div>)
                : <input id={id} value={v} onChange={(e) => set(d.key, e.target.value)} />}
              {v !== d.value && <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={() => set(d.key, d.value)}>Restaurar texto original</button>}
            </div>
          )
        })}
        {msg && <div className={`msg ${msg.t}`} role="status">{msg.s}</div>}
        <div className="btns" style={{ marginTop: 0 }}>
          <button className="btn btn-primary" disabled={busy || pending.length === 0} onClick={save}>{busy ? 'Guardando…' : `Guardar cambios${pending.length ? ` (${pending.length})` : ''}`}</button>
          {pending.length > 0 && <button className="btn btn-outline" onClick={() => setForm({})}>Descartar cambios</button>}
        </div>
      </div>
    </div>
  )
}
