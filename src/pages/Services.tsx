import { Link, useParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { ICONS, waLink } from '../lib/site'
import { useC } from '../contexts/ContentContext'
import { Async, Seo, PageHead, CtaBand, FaqList, Empty } from '../components/ui'
import { ServiceCard, ProjectCard } from '../components/Cards'

export function Services() {
  const c = useC()
  const st = useAsync(() => q(supabase.from('services').select('*').eq('active', true).order('sort_order')), [])
  return (<>
    <Seo title="Servicios de seguridad y tecnología" desc="Videovigilancia, alarmas, incendios, cableado estructurado, servidores, firewall, control de acceso y mantenimiento informático en Bolivia." />
    <PageHead title={c('services.title')} sub={c('services.sub')} />
    <section className="section"><div className="container"><Async st={st}>{(d) => d.length ? <div className="grid">{d.map((s: any) => <ServiceCard key={s.id} s={s} />)}</div> : <Empty text="Pronto publicaremos nuestros servicios." />}</Async></div></section>
    <CtaBand title="¿No sabes qué servicio necesitas?" text="Cuéntanos tu necesidad y te orientamos." />
  </>)
}

const List = ({ title, items }: { title: string; items?: string[] }) => items && items.length ? (<><h3>{title}</h3><ul className="list">{items.map((i) => <li key={i}>{i}</li>)}</ul></>) : null

export function ServiceDetail() {
  const { slug } = useParams()
  const st = useAsync(async () => {
    const s = await q(supabase.from('services').select('*').eq('slug', slug).eq('active', true).maybeSingle())
    if (!s) return null
    const [faqs, projects] = await Promise.all([
      q(supabase.from('faqs').select('*').eq('active', true).eq('service_slug', slug).order('sort_order')),
      q(supabase.from('projects').select('*, project_images(url,sort_order)').eq('published', true).eq('service_id', s.id).limit(3)),
    ])
    return { s, faqs, projects }
  }, [slug])
  return (<Async st={st}>{({ s, faqs, projects }) => (<>
    <Seo title={s.title} desc={s.short_description} />
    <PageHead title={s.title} sub={s.short_description} />
    <section className="section"><div className="container grid-2">
      <div>
        <p style={{ fontSize: 18 }}>{s.description}</p>
        {s.problem && <><h3>Problema que resuelve</h3><p>{s.problem}</p></>}
        <List title="Beneficios" items={s.benefits} /><List title="Características" items={s.features} /><List title="Aplicaciones" items={s.applications} />
        <div className="btns">
          <Link className="btn btn-accent" to={`/cotizacion?servicio=${encodeURIComponent(s.title)}`}>Solicitar cotización</Link>
          <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(`Hola, VESSDI. Estoy interesado en el servicio de ${s.title}. Quisiera solicitar una cotización.`)}>Consultar por WhatsApp</a>
        </div>
      </div>
      <div className="card"><div className="card-img" style={{ aspectRatio: '4/3' }}>{s.image_url ? <img src={s.image_url} alt={s.title} /> : <span aria-hidden>{ICONS[s.slug] || '🛡️'}</span>}</div></div>
    </div></section>
    {projects.length > 0 && <section className="section alt"><div className="container"><h2>Proyectos relacionados</h2><div className="grid">{projects.map((p: any) => <ProjectCard key={p.id} p={p} />)}</div></div></section>}
    {faqs.length > 0 && <section className="section"><div className="container" style={{ maxWidth: 800 }}><h2>Preguntas frecuentes</h2><FaqList items={faqs} /></div></section>}
  </>)}</Async>)
}
