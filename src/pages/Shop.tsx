import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { DEPARTMENTS, waLink } from '../lib/site'
import { money } from '../lib/utils'
import { Seo, PageHead, Empty } from '../components/ui'
import { QuoteForm } from '../components/Forms'

export function Cart() {
  const { items, total, setQty, remove, clear } = useCart()
  return (<>
    <Seo title="Carrito" /><PageHead title="Carrito de compras" />
    <section className="section"><div className="container">
      {items.length === 0 ? <Empty text="Tu carrito está vacío." action={<Link className="btn btn-primary" to="/productos">Ver productos</Link>} /> : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}>
          <div className="panel" style={{ gridColumn: 'span 1' }}>
            {items.map((i) => (
              <div className="cart-row" key={i.id}>
                {i.image ? <img src={i.image} alt={i.name} /> : <div className="ph" />}
                <div><Link to={`/productos/${i.slug}`}><b>{i.name}</b></Link><div>{money(i.price)}</div>
                  <div className="qty"><label htmlFor={`q${i.id}`} className="sr">Cantidad</label>
                    <input id={`q${i.id}`} type="number" min={1} max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, Number(e.target.value) || 1)} />
                    <button className="btn btn-outline btn-sm" onClick={() => remove(i.id)}>Eliminar</button></div></div>
                <b>{money(i.price * i.qty)}</b>
              </div>))}
            <div className="btns"><button className="btn btn-outline btn-sm" onClick={clear}>Vaciar carrito</button><Link className="btn btn-outline btn-sm" to="/productos">Continuar comprando</Link></div>
          </div>
          <div className="panel"><h3>Resumen</h3>
            <p>Subtotal: <b>{money(total)}</b></p><p>Total: <b className="price">{money(total)}</b></p>
            <div className="btns" style={{ flexDirection: 'column' }}>
              <Link className="btn btn-primary" to="/checkout">Solicitar pedido</Link>
              <Link className="btn btn-accent" to="/cotizacion?carrito=1">Solicitar cotización</Link></div>
          </div>
        </div>)}
    </div></section>
  </>)
}

export function Checkout() {
  const { items, total, clear } = useCart()
  const { user, profile } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [order, setOrder] = useState<number | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(''); setBusy(true)
    const f = Object.fromEntries(new FormData(e.currentTarget).entries())
    const { data, error } = await supabase.rpc('create_order', { p_customer: f, p_items: items.map((i) => ({ product_id: i.id, quantity: i.qty })) })
    setBusy(false)
    if (error) {
      console.error(error)
      setErr(error.message?.includes('sin_stock') ? 'Uno de los productos ya no tiene stock suficiente. Revisa tu carrito.'
        : error.message?.includes('producto_no_disponible') ? 'Uno de los productos ya no está disponible. Revisa tu carrito.'
        : 'No pudimos registrar tu pedido. Revisa los datos e intenta nuevamente.')
      return
    }
    clear(); setOrder(data.order_number)
  }

  if (order !== null) return (<><Seo title="Pedido creado" /><section className="section"><div className="container center" style={{ maxWidth: 640 }}>
    <div className="panel" role="status"><h2>¡Pedido registrado!</h2><p>Tu pedido <b>N.º {order}</b> quedó pendiente. VESSDI coordinará contigo el pago y la entrega.</p>
      <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(`Hola, VESSDI. Acabo de realizar el pedido N.º ${order}. Quisiera coordinar el pago y la entrega.`)}>Coordinar por WhatsApp</a></div></div></section></>)

  if (items.length === 0) return (<><Seo title="Pedido" /><PageHead title="Finalizar pedido" /><section className="section"><div className="container"><Empty text="Tu carrito está vacío." action={<Link className="btn btn-primary" to="/productos">Ver productos</Link>} /></div></section></>)

  const [first, ...rest] = (profile?.full_name || '').split(' ')
  return (<>
    <Seo title="Finalizar pedido" /><PageHead title="Finalizar pedido" sub="Tu pedido quedará pendiente y coordinaremos el pago y la entrega contigo." />
    <section className="section"><div className="container grid-2">
      <form className="form panel" onSubmit={submit}>
        <div className="row"><div><label htmlFor="k1">Nombre *</label><input id="k1" name="first_name" required defaultValue={first} /></div>
          <div><label htmlFor="k2">Apellido</label><input id="k2" name="last_name" defaultValue={rest.join(' ')} /></div></div>
        <div><label htmlFor="k3">Empresa (opcional)</label><input id="k3" name="company" /></div>
        <div className="row"><div><label htmlFor="k4">Teléfono *</label><input id="k4" name="phone" type="tel" required /></div>
          <div><label htmlFor="k5">WhatsApp</label><input id="k5" name="whatsapp" type="tel" /></div></div>
        <div><label htmlFor="k6">Correo</label><input id="k6" name="email" type="email" defaultValue={user?.email || ''} /></div>
        <div className="row"><div><label htmlFor="k7">Departamento *</label><select id="k7" name="department" required defaultValue=""><option value="" disabled>Selecciona…</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label htmlFor="k8">Ciudad *</label><input id="k8" name="city" required /></div></div>
        <div><label htmlFor="k9">Dirección *</label><input id="k9" name="address" required /></div>
        <div><label htmlFor="k10">Observaciones</label><textarea id="k10" name="notes" /></div>
        {err && <div className="msg err" role="alert">{err}</div>}
        <button className="btn btn-accent" disabled={busy}>{busy ? 'Enviando…' : 'Confirmar pedido'}</button>
      </form>
      <div className="panel"><h3>Resumen</h3>
        {items.map((i) => <p key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{i.qty} × {i.name}</span><b>{money(i.qty * i.price)}</b></p>)}
        <hr /><p>Subtotal: <b>{money(total)}</b></p><p>Total: <b className="price">{money(total)}</b></p>
        <small style={{ color: 'var(--muted)' }}>El total final se confirma con los precios vigentes al registrar el pedido.</small></div>
    </div></section>
  </>)
}

export function Quote() {
  const fromCart = new URLSearchParams(window.location.search).get('carrito') === '1'
  return (<>
    <Seo title="Solicitar cotización" desc="Cuéntanos qué necesitas y VESSDI preparará una propuesta." />
    <PageHead title="Solicitar cotización" sub="Cuéntanos qué necesitas y nuestro equipo preparará una propuesta de acuerdo con tu proyecto." />
    <section className="section"><div className="container" style={{ maxWidth: 800 }}><QuoteForm fromCart={fromCart} /></div></section>
  </>)
}
