import { FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useAsync } from '../hooks/useAsync'
import { DEPARTMENTS, waLink } from '../lib/site'

export function QuoteForm({ fromCart = false }: { fromCart?: boolean }) {
  const [sp] = useSearchParams()
  const { user, profile } = useAuth()
  const { items } = useCart()
  const services = useAsync(async () => (await supabase.from('services').select('title').eq('active', true).order('sort_order')).data || [], [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const cartText = fromCart ? items.map((i) => `${i.qty} x ${i.name}`).join(', ') : ''

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const id = crypto.randomUUID()
    try {
      const g = (k: string) => String(f.get(k) || '').trim() || null
      const { error } = await supabase.from('quotes').insert({
        id, user_id: user?.id ?? null, full_name: g('full_name'), company: g('company'), phone: g('phone'), whatsapp: g('whatsapp'),
        email: g('email'), city: g('city'), department: g('department'), service_name: g('service_name'),
        products_interest: g('products_interest'), message: g('message'), budget: g('budget'), accepted_contact: true,
      })
      if (error) throw error
      if (fromCart && items.length) await supabase.from('quote_items').insert(items.map((i) => ({ quote_id: id, product_id: i.id, product_name: i.name, quantity: i.qty })))
      setDone(String(f.get('service_name') || ''))
    } catch (ex: any) {
      console.error(ex)
      setErr('No pudimos enviar tu solicitud. Revisa los datos e intenta nuevamente.')
    }
    setBusy(false)
  }

  if (done !== null) return (
    <div className="panel center" role="status"><h3>¡Solicitud recibida!</h3>
      <p>VESSDI recibió tu solicitud de cotización y te contactará a la brevedad.</p>
      <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(`Hola, VESSDI. Acabo de enviar una solicitud de cotización${done ? ' para ' + done : ''}. Quisiera continuar por aquí.`)}>Continuar por WhatsApp</a></div>
  )

  return (
    <form className="form panel" onSubmit={submit}>
      <div className="row">
        <div><label htmlFor="q1">Nombre completo *</label><input id="q1" name="full_name" required defaultValue={profile?.full_name || ''} autoComplete="name" /></div>
        <div><label htmlFor="q2">Empresa</label><input id="q2" name="company" autoComplete="organization" /></div>
      </div>
      <div className="row">
        <div><label htmlFor="q3">Teléfono *</label><input id="q3" name="phone" type="tel" required autoComplete="tel" /></div>
        <div><label htmlFor="q4">WhatsApp</label><input id="q4" name="whatsapp" type="tel" /></div>
      </div>
      <div><label htmlFor="q5">Correo electrónico</label><input id="q5" name="email" type="email" defaultValue={user?.email || ''} autoComplete="email" /></div>
      <div className="row">
        <div><label htmlFor="q6">Departamento</label><select id="q6" name="department" defaultValue=""><option value="">Selecciona…</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div><label htmlFor="q7">Ciudad</label><input id="q7" name="city" /></div>
      </div>
      <div><label htmlFor="q8">Servicio solicitado</label>
        <select id="q8" name="service_name" defaultValue={sp.get('servicio') || ''}><option value="">Selecciona…</option>
          {(services.data || []).map((s: any) => <option key={s.title}>{s.title}</option>)}<option>Compra de productos</option><option>Otro</option></select></div>
      <div><label htmlFor="q9">Productos de interés</label><input id="q9" name="products_interest" defaultValue={cartText || sp.get('producto') || ''} /></div>
      <div><label htmlFor="q10">Cuéntanos tu necesidad *</label><textarea id="q10" name="message" required /></div>
      <div><label htmlFor="q11">Presupuesto aproximado (opcional)</label><input id="q11" name="budget" placeholder="Ej.: Bs 5.000" /></div>
      <div className="check"><label><input type="checkbox" required />Acepto que VESSDI me contacte para responder esta solicitud. *</label></div>
      {err && <div className="msg err" role="alert">{err}</div>}
      <button className="btn btn-accent" disabled={busy}>{busy ? 'Enviando…' : 'Solicitar cotización'}</button>
    </form>
  )
}

export function ContactForm() {
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.from('contact_messages').insert({
      name: String(f.get('name')).trim(), email: String(f.get('email') || '').trim() || null,
      phone: String(f.get('phone') || '').trim() || null, message: String(f.get('message')).trim(),
    })
    setBusy(false)
    if (error) { console.error(error); setErr('No pudimos enviar tu mensaje. Intenta nuevamente.'); return }
    setOk(true)
  }
  if (ok) return <div className="panel msg ok" role="status">Mensaje enviado. VESSDI te responderá pronto.</div>
  return (
    <form className="form panel" onSubmit={submit}>
      <div><label htmlFor="c1">Nombre *</label><input id="c1" name="name" required /></div>
      <div className="row"><div><label htmlFor="c2">Correo</label><input id="c2" name="email" type="email" /></div>
        <div><label htmlFor="c3">Teléfono</label><input id="c3" name="phone" type="tel" /></div></div>
      <div><label htmlFor="c4">Mensaje *</label><textarea id="c4" name="message" required /></div>
      {err && <div className="msg err" role="alert">{err}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Enviando…' : 'Enviar mensaje'}</button>
    </form>
  )
}
