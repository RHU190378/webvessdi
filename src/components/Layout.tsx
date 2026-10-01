import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { SetupWarning, Loading } from './ui'
import { useAuth } from '../contexts/AuthContext'
import { waLink } from '../lib/site'

export function PublicLayout() {
  return (<><SetupWarning /><Header /><main><Outlet /></main><Footer />
    <a className="wa-float" href={waLink('Hola, VESSDI. Quisiera información sobre sus servicios.')} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">💬</a></>)
}

export function RequireAdmin() {
  const { user, isAdmin, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (!isAdmin) return <div className="state"><h2>Acceso no autorizado</h2><p>Tu cuenta no tiene permisos de administración.</p></div>
  return <Outlet />
}
