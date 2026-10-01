import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ICONS } from '../lib/site'
import { firstImage, money } from '../lib/utils'

export function ServiceCard({ s }: { s: any }) {
  return (
    <article className="card">
      <div className="card-img" style={{ aspectRatio: '16/10' }}>{s.image_url ? <img src={s.image_url} alt={s.title} loading="lazy" /> : <span aria-hidden>{ICONS[s.slug] || '🛡️'}</span>}</div>
      <div className="card-body"><h3>{s.title}</h3><p>{s.short_description}</p>
        <div className="card-actions"><Link className="btn btn-outline btn-sm" to={`/servicios/${s.slug}`}>Ver servicio</Link></div></div>
    </article>
  )
}

export const stockBadge = (p: any) => p.stock <= 0 ? <span className="badge no">Sin stock</span> : <span className="badge ok">Disponible</span>

export function ProductCard({ p }: { p: any }) {
  const { add } = useCart()
  const img = firstImage(p.product_images)
  return (
    <article className="card">
      <Link to={`/productos/${p.slug}`} aria-label={p.name}><div className="card-img">{img ? <img src={img} alt={p.name} loading="lazy" /> : <span aria-hidden>📦</span>}</div></Link>
      <div className="card-body">
        {p.sku && <small style={{ color: 'var(--muted)' }}>Código: {p.sku}</small>}
        <h3>{p.name}</h3>
        <div><span className="price">{money(p.price)}</span>{p.old_price > p.price && <span className="old">{money(p.old_price)}</span>}</div>
        <div>{stockBadge(p)}</div>
        <div className="card-actions">
          <Link className="btn btn-outline btn-sm" to={`/productos/${p.slug}`}>Ver producto</Link>
          <button className="btn btn-primary btn-sm" disabled={p.stock <= 0}
            onClick={() => add({ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), image: img, stock: p.stock })}>Agregar al carrito</button>
        </div>
      </div>
    </article>
  )
}

export function ProjectCard({ p }: { p: any }) {
  const img = firstImage(p.project_images)
  return (
    <article className="card">
      <div className="card-img" style={{ aspectRatio: '4/3' }}>{img ? <img src={img} alt={p.title} loading="lazy" /> : <span aria-hidden>📷</span>}</div>
      <div className="card-body"><h3>{p.title}</h3>
        <p>{[p.city, p.department].filter(Boolean).join(', ')}</p>
        <div className="card-actions"><Link className="btn btn-outline btn-sm" to={`/proyectos/${p.slug}`}>Ver proyecto</Link></div></div>
    </article>
  )
}
