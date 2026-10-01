import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useCart } from '../contexts/CartContext'
import { waLink } from '../lib/site'
import { money } from '../lib/utils'
import { Async, Seo, PageHead, Empty, Loading, ErrorBox } from '../components/ui'
import { ProductCard, stockBadge } from '../components/Cards'

const PER = 12

export function Products() {
  const { slug } = useParams()
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(0)
  const cats = useAsync(() => q(supabase.from('categories').select('*').eq('active', true).order('sort_order')), [])
  const res = useAsync(async () => {
    let cid: string | null = null
    if (slug) {
      const c = await q(supabase.from('categories').select('id').eq('slug', slug).maybeSingle())
      if (!c) return { rows: [], total: 0 }
      cid = c.id
    }
    let qb = supabase.from('products').select('*, product_images(url,sort_order)', { count: 'exact' }).eq('active', true)
    if (cid) qb = qb.eq('category_id', cid)
    if (term) qb = qb.or(`name.ilike.%${term.replace(/[%,()]/g, ' ')}%,sku.ilike.%${term.replace(/[%,()]/g, ' ')}%`)
    if (sort === 'price_asc') qb = qb.order('price', { ascending: true })
    else if (sort === 'price_desc') qb = qb.order('price', { ascending: false })
    else if (sort === 'name') qb = qb.order('name')
    else qb = qb.order('featured', { ascending: false }).order('created_at', { ascending: false })
    const { data, count, error } = await qb.range(page * PER, page * PER + PER - 1)
    if (error) throw error
    return { rows: data || [], total: count || 0 }
  }, [slug, term, sort, page])
  useEffect(() => setPage(0), [slug, term, sort])

  return (<>
    <Seo title="Productos de seguridad y tecnología" desc="Catálogo de equipos de seguridad, videovigilancia, redes y control de acceso." />
    <PageHead title="Productos" sub="Equipos para tus proyectos de seguridad y tecnología." />
    <section className="section"><div className="container">
      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); setTerm(search.trim()) }} role="search">
        <div><label htmlFor="s1" className="sr">Buscar</label><input id="s1" type="search" placeholder="Buscar por nombre o código" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div><label htmlFor="s2" className="sr">Categoría</label>
          <select id="s2" value={slug || ''} onChange={(e) => nav(e.target.value ? `/categorias/${e.target.value}` : '/productos')}>
            <option value="">Todas las categorías</option>{(cats.data || []).map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
        <div><label htmlFor="s3" className="sr">Ordenar</label>
          <select id="s3" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Destacados</option><option value="price_asc">Menor precio</option><option value="price_desc">Mayor precio</option><option value="name">Nombre</option></select></div>
        <button className="btn btn-primary">Buscar</button>
      </form>
      {res.loading ? <Loading /> : res.error || !res.data ? <ErrorBox text={res.error || undefined} /> :
        res.data.rows.length === 0 ? <Empty text="No encontramos productos con esos criterios." action={<Link className="btn btn-outline" to="/cotizacion">Solicitar cotización</Link>} /> : (<>
          <div className="grid">{res.data.rows.map((p: any) => <ProductCard key={p.id} p={p} />)}</div>
          {res.data.total > PER && <div className="pager">
            <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
            <span>Página {page + 1} de {Math.ceil(res.data.total / PER)}</span>
            <button className="btn btn-outline btn-sm" disabled={(page + 1) * PER >= res.data.total} onClick={() => setPage(page + 1)}>Siguiente</button></div>}
        </>)}
    </div></section>
  </>)
}

export function ProductDetail() {
  const { slug } = useParams()
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [idx, setIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const st = useAsync(async () => {
    const p = await q(supabase.from('products').select('*, product_images(url,sort_order), categories(name,slug)').eq('slug', slug).eq('active', true).maybeSingle())
    if (!p) return null
    const rel = p.category_id ? await q(supabase.from('products').select('*, product_images(url,sort_order)').eq('active', true).eq('category_id', p.category_id).neq('id', p.id).limit(4)) : []
    return { p, rel }
  }, [slug])
  return (<Async st={st}>{({ p, rel }) => {
    const imgs = [...(p.product_images || [])].sort((a: any, b: any) => a.sort_order - b.sort_order)
    return (<>
      <Seo title={p.name} desc={(p.description || '').slice(0, 155)} />
      <section className="section"><div className="container grid-2">
        <div>
          <div className="gallery-main">{imgs[idx] ? <img src={imgs[idx].url} alt={p.name} /> : <div className="card-img" style={{ height: '100%' }}>📦</div>}</div>
          {imgs.length > 1 && <div className="thumbs">{imgs.map((im: any, i: number) => <button key={im.url} aria-label={`Ver imagen ${i + 1}`} aria-current={i === idx} onClick={() => setIdx(i)}><img src={im.url} alt="" /></button>)}</div>}
        </div>
        <div>
          {p.categories && <Link to={`/categorias/${p.categories.slug}`}>{p.categories.name}</Link>}
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)' }}>{p.name}</h1>
          {p.sku && <p style={{ color: 'var(--muted)' }}>Código: {p.sku}</p>}
          <p><span className="price" style={{ fontSize: 30 }}>{money(p.price)}</span>{p.old_price > p.price && <span className="old">{money(p.old_price)}</span>}</p>
          <p>{stockBadge(p)}</p>
          {p.description && <p>{p.description}</p>}
          {p.features?.length > 0 && <><h3>Características</h3><ul className="list">{p.features.map((f: string) => <li key={f}>{f}</li>)}</ul></>}
          {p.stock > 0 && <div className="qty" style={{ marginBottom: 12 }}><label htmlFor="pq" style={{ margin: 0 }}>Cantidad</label>
            <input id="pq" type="number" min={1} max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))} /></div>}
          <div className="btns" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" disabled={p.stock <= 0} onClick={() => { add({ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), image: imgs[0]?.url || null, stock: p.stock }, qty); setAdded(true) }}>Agregar al carrito</button>
            <Link className="btn btn-accent" to={`/cotizacion?producto=${encodeURIComponent(p.name)}`}>Solicitar cotización</Link>
            <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(`Hola, VESSDI. Estoy interesado en el producto ${p.name}. Quisiera obtener más información.`)}>Consultar por WhatsApp</a>
          </div>
          {added && <p className="msg ok" role="status" style={{ marginTop: 14 }}>Producto agregado. <Link to="/carrito">Ver carrito</Link></p>}
        </div>
      </div></section>
      {rel.length > 0 && <section className="section alt"><div className="container"><h2>Productos relacionados</h2><div className="grid">{rel.map((r: any) => <ProductCard key={r.id} p={r} />)}</div></div></section>}
    </>)
  }}</Async>)
}
