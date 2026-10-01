import { useEffect, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { configured } from '../lib/supabase'

export const Loading = () => <div className="state" role="status"><div className="spin" />Cargando…</div>
export const ErrorBox = ({ text }: { text?: string }) => (
  <div className="state" role="alert"><p>{text || 'Ocurrió un problema. Intenta nuevamente en unos minutos.'}</p></div>
)
export const Empty = ({ text, action }: { text: string; action?: ReactNode }) => <div className="state"><p>{text}</p>{action}</div>

export function Async({ st, children }: { st: { loading: boolean; error: string | null; data: any }; children: (d: any) => ReactNode }) {
  if (st.loading) return <Loading />
  if (st.error || st.data == null) return <ErrorBox text={st.error || undefined} />
  return <>{children(st.data)}</>
}

export function Seo({ title, desc }: { title: string; desc?: string }) {
  useEffect(() => {
    document.title = `${title} | VESSDI`
    if (desc) document.querySelector('meta[name=description]')?.setAttribute('content', desc)
    window.scrollTo(0, 0)
  }, [title, desc])
  return null
}

export const PageHead = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="page-head"><div className="container"><h1 style={{ fontSize: 'clamp(30px,4vw,44px)' }}>{title}</h1>{sub && <p className="lead">{sub}</p>}</div></div>
)

export const SetupWarning = () => configured ? null : (
  <div className="msg err" style={{ borderRadius: 0, textAlign: 'center' }}>
    Falta conectar Supabase: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env (o en Netlify).
  </div>
)

export const CtaBand = ({ title, text }: { title: string; text?: string }) => (
  <section className="cta-band center"><div className="container">
    <h2>{title}</h2>{text && <p className="lead">{text}</p>}
    <div className="btns"><Link className="btn btn-accent" to="/cotizacion">Solicitar cotización</Link><Link className="btn btn-outline-w" to="/servicios">Ver servicios</Link></div>
  </div></section>
)

export const FaqList = ({ items }: { items: any[] }) => (
  <div>{items.map((f) => <details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div>
)
