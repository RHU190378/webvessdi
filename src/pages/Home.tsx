import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { SITE, waLink } from '../lib/site'
import { useC } from '../contexts/ContentContext'
import { Async, Seo, FaqList, CtaBand } from '../components/ui'
import { ServiceCard, ProductCard, ProjectCard } from '../components/Cards'

const pre = { whiteSpace: 'pre-line' } as const

export default function Home() {
  const c = useC()
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

  const heroImg = c('home.hero.image')
  const heroStyle = heroImg ? { backgroundImage: `linear-gradient(135deg,rgba(10,38,67,.88),rgba(31,67,104,.82)),url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined
  const n = (count: number) => Array.from({ length: count }, (_, i) => i + 1)

  return (
    <>
      <Seo title={c('seo.home.title')} desc={c('seo.home.desc')} />
      <section className="hero" style={heroStyle}><div className="container">
        <h1 style={{ maxWidth: 820 }}>{c('home.hero.title')}</h1>
        <p className="lead" style={{ maxWidth: 680, ...pre }}>{c('home.hero.subtitle')}</p>
        <div className="btns">
          <Link className="btn btn-accent" to="/cotizacion">{c('home.hero.btn_quote')}</Link>
          <Link className="btn btn-outline-w" to="/servicios">{c('home.hero.btn_services')}</Link>
          <a className="btn btn-wa" href={waLink(SITE.defaultMsg)} target="_blank" rel="noopener noreferrer">{c('home.hero.btn_wa')}</a>
        </div>
      </div></section>

      <section className="section"><div className="container">
        <h2 className="center">{c('home.values.title')}</h2>
        <div className="grid" style={{ marginTop: 28 }}>{n(4).map((i) => <div className="value" key={i}><h3>{c(`home.value${i}.title`)}</h3><p style={pre}>{c(`home.value${i}.text`)}</p></div>)}</div>
      </div></section>

      <Async st={st}>{(d) => (<>
        <section className="section alt"><div className="container">
          <h2 className="center">{c('home.services.title')}</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.services.map((s: any) => <ServiceCard key={s.id} s={s} />)}</div>
        </div></section>

        {d.products.length > 0 && <section className="section"><div className="container">
          <h2 className="center">{c('home.products.title')}</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.products.map((p: any) => <ProductCard key={p.id} p={p} />)}</div>
          <div className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/productos">Ver todos los productos</Link></div>
        </div></section>}

        <section className="section alt"><div className="container">
          <h2 className="center">{c('home.why.title')}</h2>
          <div className="grid" style={{ marginTop: 28 }}>{n(6).map((i) => <div className="value" key={i}><h3>{c(`home.why${i}.title`)}</h3><p style={pre}>{c(`home.why${i}.text`)}</p></div>)}</div>
        </div></section>

        {d.projects.length > 0 && <section className="section"><div className="container">
          <h2 className="center">{c('home.projects.title')}</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.projects.map((p: any) => <ProjectCard key={p.id} p={p} />)}</div>
          <div className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/proyectos">Ver todos los proyectos</Link></div>
        </div></section>}

        {d.testimonials.length > 0 && <section className="section alt"><div className="container">
          <h2 className="center">Lo que dicen nuestros clientes</h2>
          <div className="grid" style={{ marginTop: 28 }}>{d.testimonials.map((t: any) => (
            <blockquote key={t.id} className="value" style={{ margin: 0 }}><p>“{t.content}”</p><b>{t.author}</b>{t.role_company && <div style={{ color: 'var(--muted)' }}>{t.role_company}</div>}</blockquote>))}</div>
        </div></section>}

        <section className="section"><div className="container">
          <h2 className="center">{c('home.process.title')}</h2>
          <div className="steps" style={{ marginTop: 28 }}>{n(5).map((i) => c(`home.step${i}`) ? <div className="step" key={i}><b>{c(`home.step${i}`)}</b></div> : null)}</div>
        </div></section>

        <section className="cta-band center"><div className="container">
          <h2>{c('home.cta.title')}</h2>
          <p className="lead" style={pre}>{c('home.cta.text')}</p>
          <div className="btns"><Link className="btn btn-accent" to="/cotizacion">Solicitar cotización</Link></div>
        </div></section>

        <section className="section alt center"><div className="container">
          <h2>{c('home.wa.title')}</h2><p className="lead" style={pre}>{c('home.wa.text')}</p>
          <div className="btns"><a className="btn btn-wa" href={waLink(SITE.defaultMsg)} target="_blank" rel="noopener noreferrer">{c('home.wa.btn')}</a></div>
        </div></section>

        {d.faqs.length > 0 && <section className="section"><div className="container" style={{ maxWidth: 800 }}>
          <h2 className="center">{c('home.faq.title')}</h2><FaqList items={d.faqs} />
          <div className="btns" style={{ justifyContent: 'center' }}><Link className="btn btn-outline" to="/faq">Ver preguntas frecuentes</Link></div>
        </div></section>}
      </>)}</Async>

      <CtaBand title={c('home.final.title')} text={c('home.final.text')} />
    </>
  )
}
