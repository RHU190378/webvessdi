import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { money, STATUS_LABEL } from '../lib/utils'
import { Seo, PageHead, Async, Empty, Loading } from '../components/ui'

export function Login() {
  const { user, isAdmin, loading } = useAuth()
  const nav = useNavigate()
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (!loading && user) return <Navigate to={isAdmin ? '/admin' : '/mi-cuenta'} replace />
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) })
    setBusy(false)
    if (error) setErr('Correo o contraseña incorrectos.'); else nav('/mi-cuenta')
  }
  return (<><Seo title="Ingresar" /><PageHead title="Ingresar" /><section className="section"><div className="container" style={{ maxWidth: 440 }}>
    <form className="form panel" onSubmit={submit}>
      <div><label htmlFor="l1">Correo</label><input id="l1" name="email" type="email" required autoComplete="email" /></div>
      <div><label htmlFor="l2">Contraseña</label><input id="l2" name="password" type="password" required autoComplete="current-password" /></div>
      {err && <div className="msg err" role="alert">{err}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      <p style={{ margin: 0 }}>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </form></div></section></>)
}

export function Register() {
  const { user, loading } = useAuth()
  const [err, setErr] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false)
  if (!loading && user) return <Navigate to="/mi-cuenta" replace />
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(''); setInfo(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const { data, error } = await supabase.auth.signUp({ email: String(f.get('email')), password: String(f.get('password')), options: { data: { full_name: String(f.get('name')) } } })
    setBusy(false)
    if (error) setErr(error.message.includes('registered') ? 'Ese correo ya tiene una cuenta.' : 'No pudimos crear tu cuenta. La contraseña debe tener al menos 6 caracteres.')
    else if (!data.session) setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego ingresa.')
  }
  return (<><Seo title="Crear cuenta" /><PageHead title="Crear cuenta" /><section className="section"><div className="container" style={{ maxWidth: 440 }}>
    <form className="form panel" onSubmit={submit}>
      <div><label htmlFor="r1">Nombre completo</label><input id="r1" name="name" required autoComplete="name" /></div>
      <div><label htmlFor="r2">Correo</label><input id="r2" name="email" type="email" required autoComplete="email" /></div>
      <div><label htmlFor="r3">Contraseña (mínimo 6 caracteres)</label><input id="r3" name="password" type="password" minLength={6} required autoComplete="new-password" /></div>
      {err && <div className="msg err" role="alert">{err}</div>}{info && <div className="msg ok" role="status">{info}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</button>
      <p style={{ margin: 0 }}>¿Ya tienes cuenta? <Link to="/login">Ingresar</Link></p>
    </form></div></section></>)
}

export function Account() {
  const { user, profile, signOut, loading } = useAuth()
  const loc = useLocation()
  const st = useAsync(async () => {
    if (!user) return null
    const [orders, quotes] = await Promise.all([
      q(supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })),
      q(supabase.from('quotes').select('*').order('created_at', { ascending: false })),
    ])
    return { orders, quotes }
  }, [user?.id])
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return (<><Seo title="Mi cuenta" /><PageHead title="Mi cuenta" sub={profile?.full_name || user.email} />
    <section className="section"><div className="container">
      <div className="btns" style={{ marginTop: 0, marginBottom: 24 }}>{profile?.role === 'admin' && <Link className="btn btn-primary" to="/admin">Ir al panel</Link>}<button className="btn btn-outline" onClick={signOut}>Cerrar sesión</button></div>
      <Async st={st}>{(d) => (<div className="grid-2">
        <div><h3>Mis pedidos</h3>{d.orders.length === 0 ? <Empty text="Aún no tienes pedidos." /> : d.orders.map((o: any) => (
          <details key={o.id}><summary>Pedido N.º {o.order_number} · {STATUS_LABEL[o.status]} · {money(o.total)}</summary>
            {o.order_items.map((i: any) => <p key={i.id}>{i.quantity} × {i.product_name}</p>)}</details>))}</div>
        <div><h3>Mis cotizaciones</h3>{d.quotes.length === 0 ? <Empty text="Aún no tienes cotizaciones." /> : d.quotes.map((x: any) => (
          <details key={x.id}><summary>{x.service_name || 'Cotización'} · {STATUS_LABEL[x.status]}</summary><p>{x.message}</p></details>))}</div>
      </div>)}</Async>
    </div></section></>)
}
