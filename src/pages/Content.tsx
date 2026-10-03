import { Link, useParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { SITE, waLink } from '../lib/site'
import { useC } from '../contexts/ContentContext'
import { Async, Seo, PageHead, CtaBand, Empty, FaqList } from '../components/ui'
import { ProjectCard } from '../components/Cards'
import { ContactForm, QuoteForm } from '../components/Forms'
import { useState } from 'react'

export function Projects() {
  const c = useC()
  const st = useAsync(() => q(supabase.from('projects').select('*, project_images(url,sort_order)').eq('published', true).order('project_date', { ascending: false })), [])
  return (<>
    <Seo title="Proyectos realizados" desc="Trabajos realizados por VESSDI en Bolivia." />
    <PageHead title={c('projects.title')} sub={c('projects.sub')} />
    <section className="section"><div className="container"><Async st={st}>{(d) => d.length ? <div className="grid">{d.map((p: any) => <ProjectCard key={p.id} p={p} />)}</div> : <Empty text="Pronto publicaremos nuestros proyectos." />}</Async></div></section>
    <CtaBand title="¿Tienes un proyecto en mente?" text="Cuéntanos tu necesidad y preparamos una propuesta." />
  </>)
}

export function ProjectDetail() {
  const { slug } = useParams()
  const [idx, setIdx] = useState(0)
  const st = useAsync(() => q(supabase.from('projects').select('*, project_images(url,sort_order), services(title,slug)').eq('slug', slug).eq('published', true).maybeSingle()), [slug])
  return (<Async st={st}>{(p) => {
    const imgs = [...(p.project_images || [])].sort((a: any, b: any) => a.sort_order - b.sort_order)
    return (<>
      <Seo title={p.title} desc={(p.description || '').slice(0, 155)} /><PageHead title={p.title} sub={[p.city, p.department].filter(Boolean).join(', ')} />
      <section className="section"><div className="container grid-2">
        <div>{imgs.length ? (<><div className="gallery-main"><img src={imgs[idx].url} alt={p.title} /></div>
          {imgs.length > 1 && <div className="thumbs">{imgs.map((im: any, i: number) => <button key={im.url} aria-label={`Ver foto ${i + 1}`} aria-current={i === idx} onClick={() => setIdx(i)}><img src={im.url} alt="" /></button>)}</div>}</>) : <div className="gallery-main card-img">📷</div>}</div>
        <div>
          {p.services && <p><Link to={`/servicios/${p.services.slug}`}>{p.services.title}</Link></p>}
          {p.project_date && <p style={{ color: 'var(--muted)' }}>{new Date(p.project_date + 'T00:00:00').toLocaleDateString('es-BO', { year: 'numeric', month: 'long' })}</p>}
          {p.description && <p>{p.description}</p>}
          {p.work_done && <><h3>Trabajo realizado</h3><p>{p.work_done}</p></>}
          {p.equipment && <><h3>Equipos utilizados</h3><p>{p.equipment}</p></>}
          <div className="btns"><Link className="btn btn-accent" to="/cotizacion">Solicitar cotización</Link></div>
        </div>
      </div></section></>)
  }}</Async>)
}

export function About() {
  const c = useC()
  const secs = ['who', 'what', 'diff', 'cover', 'commit']
  return (<>
    <Seo title="Nosotros" desc="VESSDI: venta de equipos y sistemas de seguridad digital e informática en Bolivia." /><PageHead title="Nosotros" sub={c('about.subtitle')} />
    <section className="section"><div className="container" style={{ maxWidth: 800 }}>
      {c('about.image') && <img src={c('about.image')} alt="VESSDI" style={{ width: '100%', borderRadius: 8, marginBottom: 24 }} />}
      {secs.map((k) => c(`about.${k}.title`) || c(`about.${k}.text`) ? <div key={k}><h2>{c(`about.${k}.title`)}</h2><p style={{ whiteSpace: 'pre-line' }}>{c(`about.${k}.text`)}</p></div> : null)}
    </div></section>
    <CtaBand title="Conversemos sobre tu proyecto" />
  </>)
}

export function Contact() {
  const c = useC()
  return (<>
    <Seo title="Contacto" desc="Contacta a VESSDI por teléfono, WhatsApp o formulario." /><PageHead title={c('contact.title')} sub={c('contact.sub')} />
    <section className="section"><div className="container grid-2">
      <div className="panel"><h3>Datos de contacto</h3>
        <p>Teléfono: <a href={`tel:${SITE.phone}`}>{SITE.phone}</a></p><p>WhatsApp: {SITE.phone}</p><p>Dirección: {SITE.address}, {SITE.country}</p><p>Cobertura: todo Bolivia</p>
        <div className="btns"><a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(SITE.defaultMsg)}>Escribir por WhatsApp</a></div>
        <h3 style={{ marginTop: 28 }}>Envíanos un mensaje</h3><ContactForm /></div>
      <div><h3>Solicitar cotización</h3><QuoteForm /></div>
    </div></section>
  </>)
}

export function Faq() {
  const c = useC()
  const st = useAsync(() => q(supabase.from('faqs').select('*').eq('active', true).order('sort_order')), [])
  return (<>
    <Seo title="Preguntas frecuentes" /><PageHead title={c('faq.title')} />
    <section className="section"><div className="container" style={{ maxWidth: 800 }}><Async st={st}>{(d) => d.length ? <FaqList items={d} /> : <Empty text="Pronto publicaremos las preguntas frecuentes." action={<Link className="btn btn-outline" to="/contacto">Contáctanos</Link>} />}</Async></div></section>
  </>)
}

export function Legal({ title, k }: { title: string; k: string }) {
  const c = useC()
  return (<><Seo title={title} /><PageHead title={title} /><section className="section"><div className="container" style={{ maxWidth: 800 }}>
    {c(k).split(/\n\s*\n/).map((p, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}
  </div></section></>)
}

export const NotFound = () => (<><Seo title="Página no encontrada" /><section className="section"><div className="container"><Empty text="La página que buscas no existe." action={<Link className="btn btn-primary" to="/">Ir al inicio</Link>} /></div></section></>)
