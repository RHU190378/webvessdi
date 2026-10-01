import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { waLink } from '../lib/site'
import { Async, Seo, FaqList, CtaBand } from '../components/ui'
import { ServiceCard, ProductCard, ProjectCard } from '../components/Cards'

const values = [
  ['Trabajo eficiente', 'Planificamos y ejecutamos cada instalación de forma ordenada.'],
  ['Servicio garantizado', 'Respaldamos nuestro trabajo. Consulta las condiciones con nuestro equipo.'],
  ['Soluciones profesionales', 'Instalación y configuración a cargo de personal especializado.'],
  ['Atención en toda Bolivia', 'Atendemos proyectos en todo el país.'],
]
const why = [
  ['Instalación profesional', 'Equipos instalados y configurados correctamente.'],
  ['Trabajo eficiente', 'Procesos claros para cumplir lo acordado.'],
  ['Soluciones personalizadas', 'Cada proyecto se adapta a tu espacio y necesidad.'],
  ['Atención en Bolivia', 'Cobertura nacional para hogares, comercios y empresas.'],
  ['Soporte y mantenimiento', 'Acompañamiento después de la instalación.'],
  ['Equipos y tecnología', 'Catálogo de equipos para tus proyectos de seguridad.'],
]
const steps = ['Cuéntanos tu necesidad', 'Analizamos tu proyecto', 'Preparamos una propuesta', 'Instalamos y configuramos', 'Entregamos y damos seguimiento']

export default function Home() {
  const st = useAsync(async () => {
    const [services, products, projects, faqs, testimonials] = await Promise.all([
      q(supabase.from('services').select('*').eq('active', true).order('sort_order')),
      q(supabase.from('products').select('*, product_images(url,sort_order)').eq('active', true).eq('featured', true).limit(4)),
      q(supabase.from('projects').select('*, project_images(url,sort_order)').eq('published', true).order('project_date', { ascending: false }).limit(3)),
      q(supabase.from('faqs').select('*').eq('active', true).is('service_slug', null).order('sort_order').limit(5)),
      q(supabase.from('testimonials').select('*').eq('active', true).limit(3)),
    ])
    return { services, products, projects, faqs, testimonials }
  }, [])

  return (
    <>
      <Seo title="Seguridad digital e informática en Bolivia" desc="Instalación de videovigilancia, alarmas, incendios, cableado estructurado, servidores, firewall y control de acceso en toda Bolivia." />
      <section className="hero"><div className="container">
        <h1 style={{ maxWidth: 820 }}>Seguridad y tecnología para proteger lo que más importa</h1>
        <p className="lead" style={{ maxWidth: 680 }}>Instalamos soluciones de videovigilancia, seguridad, redes e infraestructura tecnológica para hogares, comercios y empresas en toda Bolivia.</p>
        <div className="btns">
          <Link className="btn btn-accent" to="/cotizacion">Solicitar cotización</Link>
          <Link className="btn btn-outline-w" to="/servicios">Ver nuestros servicios</Link>
          <a className="btn btn-wa" href={waLink('Hola, VESSDI. Quisiera información sobre sus servicios.')} target="_blank" rel="noopener noreferrer">Hablar por WhatsApp</a>
        </div>
      </div></section>

      <section className="section"><div className="container">
        <h2 className="center">Soluciones de seguridad pensadas para tu tranquilidad</h2>
        <div className="grid" style={{ marginTop: 28 }}>{values.map(([t, d]) => <div className="value" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div></section>

      <Async st={st}>{(d) => (<>
        <section className="section alt"><div className="container">
          <h2 className="center">Soluciones integrales de seguridad y tecnología</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.services.map((s: any) => <ServiceCard key={s.id} s={s} />)}</div>
        </div></section>

        {d.products.length > 0 && <section className="section"><div className="container">
          <h2 className="center">Equipos para tus proyectos de seguridad</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.products.map((p: any) => <ProductCard key={p.id} p={p} />)}</div>
          <div className="btns center" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/productos">Ver todos los productos</Link></div>
        </div></section>}

        <section className="section alt"><div className="container">
          <h2 className="center">Una solución profesional para cada necesidad</h2>
          <div className="grid" style={{ marginTop: 28 }}>{why.map(([t, x]) => <div className="value" key={t}><h3>{t}</h3><p>{x}</p></div>)}</div>
        </div></section>

        {d.projects.length > 0 && <section className="section"><div className="container">
          <h2 className="center">Proyectos realizados</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.projects.map((p: any) => <ProjectCard key={p.id} p={p} />)}</div>
          <div className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/proyectos">Ver todos los proyectos</Link></div>
        </div></section>}

        {d.testimonials.length > 0 && <section className="section alt"><div className="container">
          <h2 className="center">Lo que dicen nuestros clientes</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.testimonials.map((t: any) => (
            <blockquote key={t.id} className="value" style={{ margin: 0 }}><p>“{t.content}”</p><b>{t.author}</b>{t.role_company && <div style={{ color: 'var(--muted)' }}>{t.role_company}</div>}</blockquote>))}</div>
        </div></section>}

        <section className="section"><div className="container">
          <h2 className="center">Así trabajamos</h2>
          <div className="steps" style={{ marginTop: 28 }}>{steps.map((s) => <div className="step" key={s}><b>{s}</b></div>)}</div>
        </div></section>

        <section className="cta-band center"><div className="container">
          <h2>¿Necesitas una solución de seguridad?</h2>
          <p className="lead">Cuéntanos qué necesitas y nuestro equipo preparará una propuesta de acuerdo con tu proyecto.</p>
          <div className="btns"><Link className="btn btn-accent" to="/cotizacion">Solicitar cotización</Link></div>
        </div></section>

        <section className="section alt center"><div className="container">
          <h2>¿Tienes una consulta?</h2><p className="lead">Habla directamente con VESSDI.</p>
          <div className="btns"><a className="btn btn-wa" href={waLink('Hola, VESSDI. Quisiera información sobre sus servicios.')} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a></div>
        </div></section>

        {d.faqs.length > 0 && <section className="section"><div className="container" style={{ maxWidth: 800 }}>
          <h2 className="center">Preguntas frecuentes</h2><FaqList items={d.faqs} />
          <div className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/faq">Ver preguntas frecuentes</Link></div>
        </div></section>}
      </>)}</Async>

      <CtaBand title="Protege tu propiedad con una solución adecuada" text="Desde sistemas de videovigilancia hasta infraestructura tecnológica, VESSDI ofrece soluciones para tus necesidades de seguridad y tecnología." />
    </>
  )
}
