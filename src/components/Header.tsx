import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { SITE, waLink } from '../lib/site'
import { useC } from '../contexts/ContentContext'

const links = [['/', 'Inicio'], ['/servicios', 'Servicios'], ['/productos', 'Productos'], ['/proyectos', 'Proyectos'], ['/nosotros', 'Nosotros'], ['/contacto', 'Contacto']]

export default function Header() {
  const c = useC()
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, isAdmin } = useAuth()
  const close = () => setOpen(false)
  return (
    <header className="hdr"><div className="container hdr-in">
      <Link to="/" className="logo" aria-label="VESSDI - Inicio"><img src={c('site.logo') || '/logo.png'} alt="VESSDI - Venta de Equipos y Sistemas de Seguridad Digital e Informática" width="81" height="54" /></Link>
      <nav className={'nav' + (open ? ' open' : '')} aria-label="Principal">
        {links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} onClick={close}>{t}</NavLink>)}
        <Link className="btn btn-accent btn-sm" to="/cotizacion" onClick={close}>Solicitar cotización</Link>
        <Link className="acct" to={user ? (isAdmin ? '/admin' : '/mi-cuenta') : '/login'} onClick={close}>{user ? (isAdmin ? 'Panel' : 'Mi cuenta') : 'Ingresar'}</Link>
      </nav>
      <div className="hdr-actions">
        <a className="btn btn-wa btn-sm" href={waLink(SITE.defaultMsg)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <Link to="/carrito" className="cart" aria-label={`Carrito, ${count} productos`}>🛒<b>{count}</b></Link>
        <button className="burger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
      </div>
    </div></header>
  )
}
