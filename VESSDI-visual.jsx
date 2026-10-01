import { useState, useRef, useEffect } from "react";

const LOGO = "data:image/jpeg;base64,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";

const css = `
.v{--navy:#0A2643;--blue:#1F4368;--steel:#537593;--accent:#85A2B5;--bg:#F7F8FA;--text:#17202A;font-family:Inter,system-ui,sans-serif;color:var(--text);background:var(--bg);line-height:1.6}
.v *{box-sizing:border-box}.v h1,.v h2,.v h3{font-family:Montserrat,Inter,sans-serif;color:var(--navy);line-height:1.2;margin:0 0 .5em}
.v .c{max-width:1100px;margin:0 auto;padding:0 20px}.v .b{display:inline-block;padding:11px 20px;border-radius:8px;font-weight:600;font-size:15px;border:2px solid transparent;cursor:pointer;text-decoration:none}
.v .gold{background:var(--accent);color:var(--navy)}.v .wa{background:#1a8f4f;color:#fff}.v .ow{border-color:#fff;color:#fff}.v .on{border-color:var(--navy);color:var(--navy);background:none}
.v header{background:var(--navy);color:#fff;position:sticky;top:0;z-index:50}.v .hd{display:flex;align-items:center;gap:16px;min-height:66px;flex-wrap:wrap}
.v .logo img{height:54px;background:#fff;border-radius:8px;padding:2px;display:block}.v nav{margin-left:auto;display:flex;gap:18px;font-size:15px;color:#dbe4ee;flex-wrap:wrap}
.v .hero{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;padding:72px 0}.v .hero h1{color:#fff;font-size:clamp(32px,5vw,54px);max-width:760px}
.v .hero p{color:#c9d6e3;font-size:18px;max-width:620px}.v .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.v section{padding:52px 0}.v .g{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.v .card{background:#fff;border:1px solid #e1e6ec;border-radius:8px;box-shadow:0 2px 12px rgba(10,38,67,.10);overflow:hidden}
.v .img{aspect-ratio:16/10;background:linear-gradient(135deg,var(--navy),var(--blue));display:flex;align-items:center;justify-content:center;font-size:44px}
.v .bd{padding:16px}.v .bd h3{font-size:18px}.v .bd p{color:#566270;font-size:15px;margin:0 0 10px}
.v .val{border-left:3px solid var(--steel);background:#fff;padding:16px;border-radius:0 8px 8px 0}.v .val p{margin:0;color:#566270;font-size:15px}
.v .price{font:700 20px Montserrat,sans-serif;color:var(--navy)}.v .ok{background:#e1f4e8;color:#14683a;border-radius:99px;padding:2px 10px;font-size:13px;font-weight:600}
.v .band{background:var(--navy);color:#fff;text-align:center}.v .band h2{color:#fff}
.v footer{background:#07141f;color:#b9c5d1;padding:36px 0;font-size:14px}
.v .badge{background:#fff3cd;color:#7a5b00;text-align:center;padding:6px;font-size:13px}
.v .cart{border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:6px 10px}.v .cart b{background:var(--accent);color:var(--navy);border-radius:99px;padding:0 8px;margin-left:4px}

.v button.b{font-family:inherit}.v .sp{height:0}
.v .ph{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;padding:40px 0}.v .ph h1{color:#fff;font-size:clamp(28px,4vw,42px);margin:0}.v .ph p{color:#c9d6e3;margin:6px 0 0}
.v .two{display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start}
.v .panel{background:#fff;border:1px solid #e1e6ec;border-radius:8px;padding:22px;box-shadow:0 2px 12px rgba(10,38,67,.10)}
.v label{display:block;font-weight:600;font-size:14px;margin:10px 0 4px;color:var(--navy)}
.v input,.v select,.v textarea{width:100%;padding:10px 12px;border:1px solid #b9c3ce;border-radius:8px;font:inherit;background:#fff;min-height:42px}
.v textarea{min-height:90px}.v .tb{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}.v .tb>*{flex:1 1 170px}
.v details{background:#fff;border:1px solid #e1e6ec;border-radius:8px;padding:14px 18px;margin-bottom:10px}.v summary{cursor:pointer;font-weight:600;color:var(--navy)}
.v .no{background:#fbe4e2;color:#a3251d;border-radius:99px;padding:2px 10px;font-size:13px;font-weight:600}
.v .cr{display:flex;gap:14px;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e1e6ec;flex-wrap:wrap}
.v ul.l{padding-left:20px;margin:0 0 14px}.v .nav a,.v nav span{cursor:pointer}.v nav span:hover,.v nav .on2{color:var(--accent)}
.v .okb{background:#e1f4e8;color:#14683a;padding:14px;border-radius:8px;margin-top:12px}.v .sm{padding:6px 12px!important;font-size:14px!important}
`;

const WA = "https://wa.me/59176015484?text=";
const enc = (s) => WA + encodeURIComponent(s);

const SERVICES = [
  ["video-vigilancia","📹","Video vigilancia / CCTV","Sistemas de cámaras para monitorear y proteger tus instalaciones.","Instalación y configuración de sistemas de videovigilancia CCTV para hogares, comercios y empresas.",["Monitoreo de tus espacios","Registro de video para consulta","Instalación profesional"],["Hogares","Comercios","Oficinas"]],
  ["incendios","🔥","Detección de incendios","Sistemas para detectar riesgos y alertar a tiempo.","Instalación de sistemas de detección y alarma contra incendios adaptados a cada espacio.",["Alerta temprana","Protección de personas y bienes","Instalación profesional"],["Oficinas","Comercios","Edificios"]],
  ["cableado-estructurado","🔌","Cableado estructurado","Infraestructura de red ordenada y preparada para crecer.","Diseño e instalación de cableado estructurado para redes de datos y comunicaciones.",["Red ordenada","Fácil mantenimiento","Base para ampliaciones"],["Oficinas","Comercios","Instituciones"]],
  ["servidores","🖥️","Servidores","Servidores configurados según las necesidades de tu negocio.","Instalación y configuración de servidores para almacenar, compartir y proteger información.",["Información centralizada","Configuración a medida","Soporte en la puesta en marcha"],["Empresas","Oficinas","Instituciones"]],
  ["firewall","🛡️","Firewall","Protección para la red y la información de tu organización.","Configuración de firewall y soluciones de seguridad de red.",["Mayor control de la red","Protección de la información","Configuración profesional"],["Empresas","Oficinas","Instituciones"]],
  ["mantenimiento","🔧","Mantenimiento informático","Mantenimiento y reparación de equipos de computación.","Mantenimiento y reparación para mantener tus equipos en buen funcionamiento.",["Equipos en mejor estado","Menos interrupciones","Atención profesional"],["Hogares","Comercios","Oficinas"]],
  ["control-acceso","🔐","Control de acceso","Control de quién entra y cuándo, en tus instalaciones.","Instalación de sistemas de control de acceso para restringir y registrar el ingreso.",["Ingreso controlado","Registro de accesos","Instalación profesional"],["Oficinas","Comercios","Instituciones"]],
  ["alarmas","🚨","Alarmas de seguridad","Sistemas de alarma para proteger tu propiedad.","Instalación de sistemas de alarmas de seguridad para hogares, comercios y empresas.",["Aviso ante intrusiones","Disuasión","Instalación profesional"],["Hogares","Comercios","Oficinas"]],
  ["paneles-solares","☀️","Paneles solares","Dimensionamiento e instalación de paneles solares según tu consumo.","Dimensionamiento e instalación de paneles solares adecuados a tu necesidad de energía.",["Sistema dimensionado a tu necesidad","Instalación profesional","Alternativa de generación de energía"],["Hogares","Comercios","Empresas"]],
];
const CATS = ["Videovigilancia","Redes","Control de acceso","Alarmas"];
const PRODUCTS = Array.from({ length: 8 }, (_, k) => ({ id: k + 1, name: `Producto de ejemplo ${k + 1}`, cat: CATS[k % 4], price: 100 * (k + 1), stock: k === 5 ? 0 : 10, sku: `EJ-00${k + 1}` }));
const FAQS = [["¿Atienden en todo Bolivia?","Sí, VESSDI atiende proyectos en todo el país."],["¿Cómo solicito una cotización?","Completa el formulario de cotización o escríbenos por WhatsApp."],["¿Cómo compro un producto?","Agrégalo al carrito y finaliza tu pedido; coordinaremos el pago y la entrega contigo."]];
const STEPS = ["Cuéntanos tu necesidad","Analizamos tu proyecto","Preparamos una propuesta","Instalamos y configuramos","Entregamos y damos seguimiento"];
const VALUES = ["Trabajo eficiente","Servicio garantizado","Soluciones profesionales","Atención en toda Bolivia"];
const bs = (n) => `Bs ${n.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`;

export default function VessdiVisual() {
  const [pg, setPg] = useState({ n: "home" });
  const [cart, setCart] = useState({});
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sent, setSent] = useState("");
  const top = useRef(null);
  const go = (n, a) => { setPg({ n, a }); setMenu(false); setSent(""); };
  useEffect(() => { top.current && top.current.scrollIntoView({ block: "start" }); }, [pg]);

  const count = Object.values(cart).reduce((s, x) => s + x, 0);
  const total = Object.entries(cart).reduce((s, [id, x]) => s + x * PRODUCTS[id - 1].price, 0);
  const add = (id) => setCart((c) => ({ ...c, [id]: Math.min((c[id] || 0) + 1, PRODUCTS[id - 1].stock) }));

  const Btn = ({ to, a, cls = "gold", children, sm }) => <button className={`b ${cls}${sm ? " sm" : ""}`} onClick={() => go(to, a)}>{children}</button>;
  const Wa = ({ msg, children = "Hablar por WhatsApp" }) => <a className="b wa" href={enc(msg)} target="_blank" rel="noopener noreferrer">{children}</a>;
  const Head = ({ t, s }) => <div className="ph"><div className="c"><h1>{t}</h1>{s && <p>{s}</p>}</div></div>;
  const Cta = ({ t, p }) => (
    <section className="band"><div className="c"><h2>{t}</h2>{p && <p style={{ color: "#c9d6e3" }}>{p}</p>}
      <div className="row" style={{ justifyContent: "center" }}><Btn to="cotizacion">Solicitar cotización</Btn><Btn to="servicios" cls="ow">Ver servicios</Btn></div></div></section>
  );
  const SCard = ({ s }) => (
    <div className="card"><div className="img">{s[1]}</div><div className="bd"><h3>{s[2]}</h3><p>{s[3]}</p><Btn to="servicio" a={s[0]} cls="on" sm>Ver servicio</Btn></div></div>
  );
  const PCard = ({ p }) => (
    <div className="card"><div className="img" style={{ aspectRatio: "1/1" }}>📦</div><div className="bd">
      <small style={{ color: "#566270" }}>Código: {p.sku}</small><h3>{p.name}</h3><div className="price">{bs(p.price)}</div>
      <p>{p.stock > 0 ? <span className="ok">Disponible</span> : <span className="no">Sin stock</span>}</p>
      <Btn to="producto" a={p.id} cls="on" sm>Ver producto</Btn>{" "}
      <button className="b gold sm" disabled={p.stock <= 0} style={p.stock <= 0 ? { opacity: .5 } : {}} onClick={() => add(p.id)}>Agregar</button></div></div>
  );
  const Form = ({ kind, children, label }) => (
    <form className="panel" onSubmit={(e) => { e.preventDefault(); setSent(kind); }}>
      {children}<button className="b gold" style={{ marginTop: 14 }}>{label}</button>
      {sent === kind && <div className="okb" role="status">Simulación: aquí se enviaría la solicitud a VESSDI.</div>}
    </form>
  );

  let body = null;
  if (pg.n === "home") body = (<>
    <div className="hero"><div className="c">
      <h1>Seguridad y tecnología para proteger lo que más importa</h1>
      <p>Instalamos soluciones de videovigilancia, seguridad, redes e infraestructura tecnológica para hogares, comercios y empresas en toda Bolivia.</p>
      <div className="row"><Btn to="cotizacion">Solicitar cotización</Btn><Btn to="servicios" cls="ow">Ver nuestros servicios</Btn><Wa msg="Hola, VESSDI. Quisiera información sobre sus servicios." /></div></div></div>
    <section><div className="c"><h2 style={{ textAlign: "center" }}>Soluciones de seguridad pensadas para tu tranquilidad</h2>
      <div className="g" style={{ marginTop: 24 }}>{VALUES.map((v) => <div className="val" key={v}><h3 style={{ fontSize: 18 }}>{v}</h3><p>Texto descriptivo provisional.</p></div>)}</div></div></section>
    <section style={{ background: "#fff" }}><div className="c"><h2 style={{ textAlign: "center" }}>Soluciones integrales de seguridad y tecnología</h2>
      <div className="g" style={{ marginTop: 24 }}>{SERVICES.map((s) => <SCard key={s[0]} s={s} />)}</div></div></section>
    <section><div className="c"><h2 style={{ textAlign: "center" }}>Equipos para tus proyectos de seguridad</h2>
      <div className="g" style={{ marginTop: 24 }}>{PRODUCTS.slice(0, 4).map((p) => <PCard key={p.id} p={p} />)}</div>
      <div className="row" style={{ justifyContent: "center" }}><Btn to="productos" cls="on">Ver todos los productos</Btn></div></div></section>
    <section style={{ background: "#fff" }}><div className="c"><h2 style={{ textAlign: "center" }}>Así trabajamos</h2>
      <div className="g" style={{ marginTop: 24 }}>{STEPS.map((s, i) => <div className="card" key={s}><div className="bd"><div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 8 }}>{i + 1}</div><b>{s}</b></div></div>)}</div></div></section>
    <Cta t="¿Necesitas una solución de seguridad?" p="Cuéntanos qué necesitas y nuestro equipo preparará una propuesta de acuerdo con tu proyecto." />
  </>);

  if (pg.n === "servicios") body = (<><Head t="Servicios de seguridad y tecnología" s="Soluciones profesionales para proteger, conectar y mantener tu infraestructura." />
    <section><div className="c"><div className="g">{SERVICES.map((s) => <SCard key={s[0]} s={s} />)}</div></div></section><Cta t="¿No sabes qué servicio necesitas?" p="Cuéntanos tu necesidad y te orientamos." /></>);

  if (pg.n === "servicio") { const s = SERVICES.find((x) => x[0] === pg.a); body = (<><Head t={s[2]} s={s[3]} />
    <section><div className="c two"><div><p style={{ fontSize: 18 }}>{s[4]}</p><h3>Beneficios</h3><ul className="l">{s[5].map((b) => <li key={b}>{b}</li>)}</ul>
      <h3>Aplicaciones</h3><ul className="l">{s[6].map((b) => <li key={b}>{b}</li>)}</ul>
      <div className="row"><Btn to="cotizacion">Solicitar cotización</Btn><Wa msg={`Hola, VESSDI. Estoy interesado en el servicio de ${s[2]}. Quisiera solicitar una cotización.`}>Consultar por WhatsApp</Wa></div></div>
      <div className="card"><div className="img" style={{ aspectRatio: "4/3", fontSize: 72 }}>{s[1]}</div></div></div></section>
    <section style={{ background: "#fff" }}><div className="c"><Btn to="servicios" cls="on">← Todos los servicios</Btn></div></section></>); }

  if (pg.n === "productos") {
    const list = PRODUCTS.filter((p) => (!cat || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
    body = (<><Head t="Productos" s="Equipos para tus proyectos de seguridad y tecnología (datos de ejemplo)." />
      <section><div className="c"><div className="tb"><input aria-label="Buscar" placeholder="Buscar por nombre" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Categoría" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas las categorías</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
        {list.length ? <div className="g">{list.map((p) => <PCard key={p.id} p={p} />)}</div> : <p style={{ textAlign: "center" }}>No encontramos productos con esos criterios.</p>}</div></section></>);
  }

  if (pg.n === "producto") { const p = PRODUCTS[pg.a - 1]; body = (<><Head t={p.name} s={`${p.cat} · Código ${p.sku}`} />
    <section><div className="c two"><div className="card"><div className="img" style={{ aspectRatio: "4/3", fontSize: 72 }}>📦</div></div>
      <div><div className="price" style={{ fontSize: 30 }}>{bs(p.price)}</div><p>{p.stock > 0 ? <span className="ok">Disponible</span> : <span className="no">Sin stock</span>}</p>
        <p>Descripción de ejemplo del producto. Aquí irá la descripción real que cargues en el panel.</p>
        <div className="row"><button className="b gold" disabled={p.stock <= 0} onClick={() => { add(p.id); go("carrito"); }}>Agregar al carrito</button><Btn to="cotizacion" cls="on">Solicitar cotización</Btn>
          <Wa msg={`Hola, VESSDI. Estoy interesado en el producto ${p.name}. Quisiera obtener más información.`}>Consultar por WhatsApp</Wa></div></div></div></section></>); }

  if (pg.n === "carrito") body = (<><Head t="Carrito de compras" /><section><div className="c">
    {count === 0 ? <div style={{ textAlign: "center" }}><p>Tu carrito está vacío.</p><Btn to="productos">Ver productos</Btn></div> : (
      <div className="panel">{Object.entries(cart).filter(([, x]) => x > 0).map(([id, x]) => (
        <div className="cr" key={id}><div><b>{PRODUCTS[id - 1].name}</b><div>{bs(PRODUCTS[id - 1].price)}</div></div>
          <div><button className="b on sm" aria-label="Menos" onClick={() => setCart((c) => ({ ...c, [id]: c[id] - 1 }))}>−</button> <b style={{ margin: "0 8px" }}>{x}</b> <button className="b on sm" aria-label="Más" onClick={() => add(+id)}>+</button></div>
          <b>{bs(x * PRODUCTS[id - 1].price)}</b></div>))}
        <p style={{ marginTop: 14 }}>Total: <span className="price">{bs(total)}</span></p>
        <div className="row"><Btn to="checkout">Solicitar pedido</Btn><Btn to="productos" cls="on">Continuar comprando</Btn><button className="b on" onClick={() => setCart({})}>Vaciar carrito</button></div></div>)}</div></section></>);

  if (pg.n === "checkout") body = (<><Head t="Finalizar pedido" s="Tu pedido quedará pendiente y coordinaremos el pago y la entrega contigo." /><section><div className="c" style={{ maxWidth: 640 }}>
    <Form kind="co" label="Confirmar pedido"><label>Nombre *</label><input required /><label>Teléfono *</label><input required type="tel" /><label>Departamento *</label><select required defaultValue=""><option value="" disabled>Selecciona…</option>{["La Paz","Cochabamba","Santa Cruz","Oruro","Potosí","Chuquisaca","Tarija","Beni","Pando"].map((d) => <option key={d}>{d}</option>)}</select><label>Dirección *</label><input required /><p style={{ marginTop: 12 }}>Total: <b>{bs(total)}</b></p></Form></div></section></>);

  if (pg.n === "cotizacion") body = (<><Head t="Solicitar cotización" s="Cuéntanos qué necesitas y nuestro equipo preparará una propuesta." /><section><div className="c" style={{ maxWidth: 720 }}>
    <Form kind="qt" label="Solicitar cotización"><label>Nombre completo *</label><input required /><label>Teléfono *</label><input required type="tel" /><label>Servicio solicitado</label><select defaultValue=""><option value="">Selecciona…</option>{SERVICES.map((s) => <option key={s[0]}>{s[2]}</option>)}</select><label>Cuéntanos tu necesidad *</label><textarea required /></Form></div></section></>);

  if (pg.n === "proyectos") body = (<><Head t="Proyectos" s="Aquí se mostrarán los trabajos reales de VESSDI (ejemplos de diseño)." /><section><div className="c"><div className="g">
    {[1, 2, 3].map((k) => <div className="card" key={k}><div className="img" style={{ aspectRatio: "4/3" }}>📷</div><div className="bd"><h3>Proyecto de ejemplo {k}</h3><p>Ciudad, Departamento</p></div></div>)}</div></div></section>
    <Cta t="¿Tienes un proyecto en mente?" p="Cuéntanos tu necesidad y preparamos una propuesta." /></>);

  if (pg.n === "nosotros") body = (<><Head t="Nosotros" s="Venta de Equipos y Sistemas de Seguridad Digital e Informática" /><section><div className="c" style={{ maxWidth: 780 }}>
    <h2>Quiénes somos</h2><p>VESSDI es una empresa boliviana dedicada a la instalación de equipos y sistemas de seguridad digital e informática.</p>
    <h2>Nuestro diferencial</h2><p>Trabajo eficiente y garantizado.</p><h2>Cobertura nacional</h2><p>Atendemos proyectos en todo Bolivia.</p></div></section><Cta t="Conversemos sobre tu proyecto" /></>);

  if (pg.n === "contacto") body = (<><Head t="Contacto" s="Escríbenos y te responderemos a la brevedad." /><section><div className="c two">
    <div className="panel"><h3>Datos de contacto</h3><p>Teléfono: 76015484</p><p>WhatsApp: 76015484</p><p>Barrio Las Américas, c/ Perú c/9, Bolivia</p><p>Cobertura: todo Bolivia</p><Wa msg="Hola, VESSDI. Quisiera información sobre sus servicios.">Escribir por WhatsApp</Wa></div>
    <Form kind="ct" label="Enviar mensaje"><h3>Envíanos un mensaje</h3><label>Nombre *</label><input required /><label>Correo</label><input type="email" /><label>Mensaje *</label><textarea required /></Form></div></section></>);

  if (pg.n === "faq") body = (<><Head t="Preguntas frecuentes" /><section><div className="c" style={{ maxWidth: 780 }}>{FAQS.map(([a, b]) => <details key={a}><summary>{a}</summary><p>{b}</p></details>)}</div></section></>);

  const links = [["home", "Inicio"], ["servicios", "Servicios"], ["productos", "Productos"], ["proyectos", "Proyectos"], ["nosotros", "Nosotros"], ["contacto", "Contacto"], ["faq", "FAQ"]];
  const active = pg.n === "servicio" ? "servicios" : pg.n === "producto" ? "productos" : pg.n;

  return (
    <div className="v">
      <style>{css}</style>
      <div ref={top} className="sp" />
      <div className="badge">Vista previa navegable · productos, precios y proyectos de ejemplo, no reales</div>
      <header><div className="c hd">
        <button onClick={() => go("home")} aria-label="Inicio" style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}><div className="logo"><img src={LOGO} alt="VESSDI" /></div></button>
        <nav style={{ display: menu || true ? "flex" : "none" }}>{links.map(([k, t]) => <span key={k} className={active === k ? "on2" : ""} onClick={() => go(k)} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go(k)}>{t}</span>)}</nav>
        <button className="b gold sm" onClick={() => go("cotizacion")}>Solicitar cotización</button>
        <span className="cart" style={{ cursor: "pointer" }} onClick={() => go("carrito")} role="link" tabIndex={0} aria-label="Carrito">🛒<b>{count}</b></span>
      </div></header>
      {body}
      <footer><div className="c">
        <div className="logo"><img src={LOGO} alt="VESSDI" style={{ height: 80 }} /></div>
        <p>Soluciones de seguridad digital e informática para hogares, comercios y empresas.</p>
        <p>76015484 · Barrio Las Américas, c/ Perú c/9 · Bolivia</p><p>© VESSDI. Todos los derechos reservados.</p>
      </div></footer>
    </div>
  );
}
