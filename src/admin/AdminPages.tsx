import { FormEvent, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase, q, SUPABASE_URL, SUPABASE_KEY } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../contexts/AuthContext'
import { money, STATUS_LABEL } from '../lib/utils'
import { Async } from '../components/ui'

const count = async (t: string, f?: (b: any) => any) => {
  let b = supabase.from(t).select('*', { count: 'exact', head: true }); if (f) b = f(b)
  const { count: c } = await b; return c || 0
}

export function Dashboard() {
  const st = useAsync(async () => ({
    pedidos: await count('orders', (b) => b.eq('status', 'pendiente')),
    cotizaciones: await count('quotes', (b) => b.eq('status', 'nueva')),
    mensajes: await count('contact_messages', (b) => b.eq('is_read', false)),
    productos: await count('products'),
    bajo: (await q(supabase.from('products').select('name,stock,min_stock').eq('active', true))).filter((p: any) => p.stock <= p.min_stock),
  }), [])
  return (<div><h1>Resumen</h1><Async st={st}>{(d) => (<>
    <div className="stats"><div className="stat"><b>{d.pedidos}</b>Pedidos pendientes</div><div className="stat"><b>{d.cotizaciones}</b>Cotizaciones nuevas</div>
      <div className="stat"><b>{d.mensajes}</b>Mensajes sin leer</div><div className="stat"><b>{d.productos}</b>Productos</div></div>
    {d.bajo.length > 0 && <div className="panel"><h3>Stock bajo</h3><ul className="list">{d.bajo.map((p: any) => <li key={p.name}>{p.name}: {p.stock} (mínimo {p.min_stock})</li>)}</ul></div>}
  </>)}</Async></div>)
}

function StatusSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return <select aria-label="Estado" value={value} onChange={(e) => onChange(e.target.value)} style={{ minWidth: 150 }}>{options.map((o) => <option key={o} value={o}>{STATUS_LABEL[o]}</option>)}</select>
}

export function Orders() {
  const [n, setN] = useState(0)
  const st = useAsync(() => q(supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })), [n])
  const upd = async (id: string, status: string) => { const { error } = await supabase.from('orders').update({ status }).eq('id', id); if (error) alert('No se pudo actualizar.'); setN(n + 1) }
  return (<div><h1>Pedidos</h1><Async st={st}>{(d) => d.length === 0 ? <div className="state">Aún no hay pedidos.</div> : d.map((o: any) => (
    <details key={o.id}><summary>N.º {o.order_number} · {o.first_name} {o.last_name} · {money(o.total)} · {STATUS_LABEL[o.status]} · {new Date(o.created_at).toLocaleDateString('es-BO')}</summary>
      <p>Tel: {o.phone} · WhatsApp: {o.whatsapp || '-'} · {o.email || 'sin correo'}<br />{o.department}, {o.city} · {o.address}{o.company ? ` · ${o.company}` : ''}</p>
      {o.notes && <p>Observaciones: {o.notes}</p>}
      <ul className="list">{o.order_items.map((i: any) => <li key={i.id}>{i.quantity} × {i.product_name} ({i.sku || 's/c'}) — {money(i.subtotal)}</li>)}</ul>
      <StatusSelect value={o.status} options={['pendiente', 'confirmado', 'en_proceso', 'entregado', 'cancelado']} onChange={(v) => upd(o.id, v)} /></details>))}</Async></div>)
}

export function Quotes() {
  const [n, setN] = useState(0)
  const st = useAsync(() => q(supabase.from('quotes').select('*, quote_items(*)').order('created_at', { ascending: false })), [n])
  const upd = async (id: string, patch: any) => { const { error } = await supabase.from('quotes').update(patch).eq('id', id); if (error) alert('No se pudo guardar.'); else setN(n + 1) }
  const open = async (path: string) => { const { data } = await supabase.storage.from('quote-attachments').createSignedUrl(path, 300); if (data) window.open(data.signedUrl, '_blank') }
  return (<div><h1>Cotizaciones</h1><Async st={st}>{(d) => d.length === 0 ? <div className="state">Aún no hay cotizaciones.</div> : d.map((x: any) => (
    <details key={x.id}><summary>{x.full_name} · {x.service_name || 'Sin servicio'} · {STATUS_LABEL[x.status]} · {new Date(x.created_at).toLocaleDateString('es-BO')}</summary>
      <p>{x.company ? `${x.company} · ` : ''}Tel: {x.phone} · WhatsApp: {x.whatsapp || '-'} · {x.email || 'sin correo'}<br />{x.department}, {x.city}</p>
      <p><b>Necesidad:</b> {x.message}</p>{x.budget && <p>Presupuesto: {x.budget}</p>}{x.products_interest && <p>Productos de interés: {x.products_interest}</p>}
      {x.quote_items.length > 0 && <ul className="list">{x.quote_items.map((i: any) => <li key={i.id}>{i.quantity} × {i.product_name}</li>)}</ul>}
      {x.attachment_path && <p><button className="btn btn-outline btn-sm" onClick={() => open(x.attachment_path)}>Ver archivo adjunto</button></p>}
      <StatusSelect value={x.status} options={['nueva', 'en_revision', 'cotizada', 'cerrada', 'descartada']} onChange={(v) => upd(x.id, { status: v })} />
      <form onSubmit={(e) => { e.preventDefault(); upd(x.id, { admin_notes: String(new FormData(e.currentTarget).get('n')) }) }} style={{ marginTop: 10 }}>
        <label htmlFor={`n${x.id}`}>Observaciones internas</label><textarea id={`n${x.id}`} name="n" defaultValue={x.admin_notes || ''} /><button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Guardar observaciones</button></form></details>))}</Async></div>)
}

export function Clients() {
  const [n, setN] = useState(0)
  const st = useAsync(async () => ({
    msgs: await q(supabase.from('contact_messages').select('*').order('created_at', { ascending: false })),
    users: await q(supabase.from('profiles').select('*').eq('role', 'cliente').order('created_at', { ascending: false })),
  }), [n])
  const read = async (id: string) => { await supabase.from('contact_messages').update({ is_read: true }).eq('id', id); setN(n + 1) }
  return (<div><h1>Clientes y contactos</h1><Async st={st}>{({ msgs, users }) => (<>
    <h3>Mensajes de contacto</h3>{msgs.length === 0 ? <div className="state">Sin mensajes.</div> : msgs.map((m: any) => (
      <details key={m.id}><summary>{m.is_read ? '' : '● '}{m.name} · {new Date(m.created_at).toLocaleDateString('es-BO')}</summary>
        <p>{m.message}</p><p>{m.phone || ''} {m.email || ''}</p>{!m.is_read && <button className="btn btn-outline btn-sm" onClick={() => read(m.id)}>Marcar como leído</button>}</details>))}
    <h3 style={{ marginTop: 28 }}>Clientes registrados</h3>
    <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th></tr></thead><tbody>
      {users.map((u: any) => <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>{new Date(u.created_at).toLocaleDateString('es-BO')}</td></tr>)}</tbody></table></div>
  </>)}</Async></div>)
}

export function Users() {
  const { user } = useAuth()
  const [n, setN] = useState(0)
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; s: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const st = useAsync(() => q(supabase.from('profiles').select('*').order('created_at', { ascending: false })), [n])

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg(null); setBusy(true)
    const form = e.currentTarget
    const f = new FormData(form)
    // Cliente aparte que NO toca tu sesión de administrador
    const tmp = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data, error } = await tmp.auth.signUp({ email: String(f.get('email')), password: String(f.get('password')), options: { data: { full_name: String(f.get('name')) } } })
    if (error || !data.user) { setBusy(false); setMsg({ t: 'err', s: error?.message.includes('registered') ? 'Ese correo ya existe.' : 'No se pudo crear el usuario. La contraseña debe tener al menos 6 caracteres.' }); return }
    await supabase.from('profiles').update({ full_name: String(f.get('name')), role: String(f.get('role')) }).eq('id', data.user.id)
    setBusy(false); form.reset(); setN(n + 1)
    setMsg({ t: 'ok', s: 'Usuario creado. Ya puede ingresar con su correo y contraseña.' })
  }
  const setRole = async (id: string, role: string) => { const { error } = await supabase.from('profiles').update({ role }).eq('id', id); if (error) alert('No se pudo cambiar.'); setN(n + 1) }

  return (<div><h1>Usuarios</h1>
    <form className="form panel" onSubmit={create} style={{ marginBottom: 24 }}><h3>Crear usuario</h3>
      <div className="row"><div><label htmlFor="u1">Nombre</label><input id="u1" name="name" required /></div><div><label htmlFor="u2">Correo</label><input id="u2" name="email" type="email" required /></div></div>
      <div className="row"><div><label htmlFor="u3">Contraseña (mín. 6)</label><input id="u3" name="password" type="text" minLength={6} required /></div>
        <div><label htmlFor="u4">Rol</label><select id="u4" name="role" defaultValue="admin"><option value="admin">Administrador</option><option value="cliente">Cliente / empleado sin acceso al panel</option></select></div></div>
      {msg && <div className={`msg ${msg.t}`} role="status">{msg.s}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Creando…' : 'Crear usuario'}</button></form>
    <Async st={st}>{(d) => <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>
      {d.map((u: any) => <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>
        <select aria-label="Rol" value={u.role} disabled={u.id === user?.id} onChange={(e) => setRole(u.id, e.target.value)}><option value="admin">Administrador</option><option value="cliente">Cliente</option></select></td></tr>)}</tbody></table></div>}</Async></div>)
}
