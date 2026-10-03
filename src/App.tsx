import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout, RequireAdmin } from './components/Layout'
import { Loading } from './components/ui'
import Home from './pages/Home'
import { Services, ServiceDetail } from './pages/Services'
import { Products, ProductDetail } from './pages/Products'
import { Cart, Checkout, Quote } from './pages/Shop'
import { Projects, ProjectDetail, About, Contact, Faq, Legal, NotFound } from './pages/Content'
import { Login, Account } from './pages/Account'

const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const CrudPage = lazy(() => import('./admin/CrudPage'))
const ProductsAdmin = lazy(() => import('./admin/ProductsExcel'))
const ContentAdmin = lazy(() => import('./admin/ContentAdmin'))
const AdminPages = () => import('./admin/AdminPages')
const Dashboard = lazy(() => AdminPages().then((m) => ({ default: m.Dashboard })))
const Orders = lazy(() => AdminPages().then((m) => ({ default: m.Orders })))
const Quotes = lazy(() => AdminPages().then((m) => ({ default: m.Quotes })))
const Clients = lazy(() => AdminPages().then((m) => ({ default: m.Clients })))
const Users = lazy(() => AdminPages().then((m) => ({ default: m.Users })))
import * as C from './admin/configs'

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="servicios" element={<Services />} />
          <Route path="servicios/:slug" element={<ServiceDetail />} />
          <Route path="productos" element={<Products />} />
          <Route path="productos/:slug" element={<ProductDetail />} />
          <Route path="categorias/:slug" element={<Products />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="cotizacion" element={<Quote />} />
          <Route path="proyectos" element={<Projects />} />
          <Route path="proyectos/:slug" element={<ProjectDetail />} />
          <Route path="nosotros" element={<About />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Navigate to="/login" replace />} />
          <Route path="mi-cuenta" element={<Account />} />
          <Route path="politica-privacidad" element={<Legal title="Política de privacidad" k="legal.privacy" />} />
          <Route path="terminos-condiciones" element={<Legal title="Términos y condiciones" k="legal.terms" />} />
          <Route path="politica-ventas" element={<Legal title="Política de ventas" k="legal.sales" />} />
          <Route path="politica-devoluciones" element={<Legal title="Política de devoluciones" k="legal.returns" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<ProductsAdmin />} />
            <Route path="categorias" element={<CrudPage cfg={C.categoriesCfg} />} />
            <Route path="servicios" element={<CrudPage cfg={C.servicesCfg} />} />
            <Route path="proyectos" element={<CrudPage cfg={C.projectsCfg} />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="cotizaciones" element={<Quotes />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="testimonios" element={<CrudPage cfg={C.testimonialsCfg} />} />
            <Route path="faq" element={<CrudPage cfg={C.faqsCfg} />} />
            <Route path="contenido" element={<ContentAdmin />} />
            <Route path="usuarios" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
