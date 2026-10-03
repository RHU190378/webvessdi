import { Link } from 'react-router-dom'
import { SITE, waLink } from '../lib/site'
import { useC } from '../contexts/ContentContext'

const svc: [string, string][] = [['video-vigilancia', 'Video vigilancia'], ['incendios', 'Incendios'], ['cableado-estructurado', 'Cableado estructurado'], ['servidores', 'Servidores'], ['firewall', 'Firewall'], ['mantenimiento-computacion', 'Mantenimiento'], ['control-acceso', 'Control de acceso'], ['alarmas', 'Alarmas'], ['paneles-solares', 'Paneles solares']]

export default function Footer() {
  const c = useC()
  return (
    <footer className="ftr"><div className="container">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))' }}>
        <div><Link to="/" className="logo" style={{ marginBottom: 12 }}><img src={c('site.logo') || '/logo.png'} alt="VESSDI" width="126" height="84" /></Link>
          <p style={{ whiteSpace: 'pre-line' }}>{c('site.footer_text')}</p></div>
        <div><h4>Servicios</h4>{svc.map(([s, t]) => <Link key={s} to={`/servicios/${s}`}>{t}</Link>)}</div>
        <div><h4>Empresa</h4><Link to="/nosotros">Nosotros</Link><Link to="/proyectos">Proyectos</Link><Link to="/contacto">Contacto</Link><Link to="/faq">Preguntas frecuentes</Link></div>
        <div><h4>Contacto</h4><a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
          <a href={waLink(SITE.defaultMsg)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <span>{SITE.address}</span><br /><span>{SITE.country}</span></div>
      </div>
      <div className="ftr-bottom"><span>{c('site.copyright')}</span>
        <div><Link to="/politica-privacidad">Política de privacidad</Link><Link to="/terminos-condiciones">Términos y condiciones</Link><Link to="/politica-ventas">Política de ventas</Link><Link to="/politica-devoluciones">Devoluciones</Link></div></div>
    </div></footer>
  )
}
