import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const items: [string, string][] = [['/admin', 'Resumen'], ['/admin/productos', 'Productos'], ['/admin/categorias', 'Categorías'], ['/admin/servicios', 'Servicios'], ['/admin/proyectos', 'Proyectos'],
  ['/admin/pedidos', 'Pedidos'], ['/admin/cotizaciones', 'Cotizaciones'], ['/admin/clientes', 'Clientes'], ['/admin/testimonios', 'Testimonios'], ['/admin/faq', 'Preguntas frecuentes'], ['/admin/contenido', 'Contenido del sitio'], ['/admin/usuarios', 'Usuarios']]

export default function AdminLayout() {
  const { signOut } = useAuth()
  return (<div className="adm"><aside className="adm-side" aria-label="Administración">
    <Link to="/" className="logo" style={{ padding: '4px 12px 12px' }}><img src="/logo.png" alt="VESSDI - ir al sitio" /></Link>
    {items.map(([to, t]) => <NavLink key={to} to={to} end={to === '/admin'}>{t}</NavLink>)}
    <a href="#salir" onClick={(e) => { e.preventDefault(); signOut() }}>Cerrar sesión</a></aside>
    <main className="adm-main"><Outlet /></main></div>)
}
