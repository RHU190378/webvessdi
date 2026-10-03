// Lista de TODOS los textos e imágenes editables del sitio (Admin > Contenido del sitio).
// "value" es el texto por defecto si todavía no se editó en el panel.
export type CField = { key: string; label: string; section: string; type: 'text' | 'textarea' | 'image'; value: string }

export const SECTIONS = ['Datos generales', 'Inicio', 'Nosotros', 'Encabezados de páginas', 'Páginas legales', 'SEO (Google)']
const G = SECTIONS[0], H = SECTIONS[1], N = SECTIONS[2], P = SECTIONS[3], L = SECTIONS[4], S = SECTIONS[5]
const f = (section: string, key: string, label: string, value: string, type: CField['type'] = 'text'): CField => ({ section, key, label, value, type })

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
const provisional = 'Contenido provisional: pendiente de revisión y aprobación del propietario de VESSDI. Aquí se publicará el texto definitivo.'

export const DEFAULTS: CField[] = [
  f(G, 'site.logo', 'Logo (cabecera y pie de página)', '/logo.png', 'image'),
  f(G, 'site.phone', 'Teléfono que se muestra', '76015484'),
  f(G, 'site.whatsapp', 'WhatsApp con código de país (solo números, ej.: 59176015484)', '59176015484'),
  f(G, 'site.wa_default_msg', 'Mensaje inicial de WhatsApp', 'Hola, VESSDI. Quisiera información sobre sus servicios.'),
  f(G, 'site.address', 'Dirección', 'Barrio Las Américas, c/ Perú c/9'),
  f(G, 'site.country', 'País', 'Bolivia'),
  f(G, 'site.footer_text', 'Texto del pie de página', 'Soluciones de seguridad digital e informática para hogares, comercios y empresas.', 'textarea'),
  f(G, 'notify.email', 'Correo que recibe las cotizaciones y mensajes de contacto', 'rene_hoyos@hotmail.com'),
  f(G, 'site.copyright', 'Derechos reservados (pie de página)', '© VESSDI. Todos los derechos reservados.'),

  f(H, 'home.hero.image', 'Imagen de fondo del banner principal (opcional)', '', 'image'),
  f(H, 'home.hero.title', 'Banner: título', 'Seguridad y tecnología para proteger lo que más importa'),
  f(H, 'home.hero.subtitle', 'Banner: subtítulo', 'Instalamos soluciones de videovigilancia, seguridad, redes e infraestructura tecnológica para hogares, comercios y empresas en toda Bolivia.', 'textarea'),
  f(H, 'home.hero.btn_quote', 'Banner: botón 1', 'Solicitar cotización'),
  f(H, 'home.hero.btn_services', 'Banner: botón 2', 'Ver nuestros servicios'),
  f(H, 'home.hero.btn_wa', 'Banner: botón 3', 'Hablar por WhatsApp'),
  f(H, 'home.values.title', 'Confianza: título', 'Soluciones de seguridad pensadas para tu tranquilidad'),
  ...values.flatMap(([t, x], i) => [f(H, `home.value${i + 1}.title`, `Confianza ${i + 1}: título`, t), f(H, `home.value${i + 1}.text`, `Confianza ${i + 1}: texto`, x, 'textarea')]),
  f(H, 'home.services.title', 'Servicios: título', 'Soluciones integrales de seguridad y tecnología'),
  f(H, 'home.products.title', 'Productos destacados: título', 'Equipos para tus proyectos de seguridad'),
  f(H, 'home.why.title', '¿Por qué VESSDI?: título', 'Una solución profesional para cada necesidad'),
  ...why.flatMap(([t, x], i) => [f(H, `home.why${i + 1}.title`, `Beneficio ${i + 1}: título`, t), f(H, `home.why${i + 1}.text`, `Beneficio ${i + 1}: texto`, x, 'textarea')]),
  f(H, 'home.projects.title', 'Proyectos: título', 'Proyectos realizados'),
  f(H, 'home.process.title', 'Proceso de trabajo: título', 'Así trabajamos'),
  ...steps.map((s, i) => f(H, `home.step${i + 1}`, `Paso ${i + 1}`, s)),
  f(H, 'home.cta.title', 'Cotización: título', '¿Necesitas una solución de seguridad?'),
  f(H, 'home.cta.text', 'Cotización: texto', 'Cuéntanos qué necesitas y nuestro equipo preparará una propuesta de acuerdo con tu proyecto.', 'textarea'),
  f(H, 'home.wa.title', 'WhatsApp: título', '¿Tienes una consulta?'),
  f(H, 'home.wa.text', 'WhatsApp: texto', 'Habla directamente con VESSDI.'),
  f(H, 'home.wa.btn', 'WhatsApp: botón', 'Escribir por WhatsApp'),
  f(H, 'home.faq.title', 'Preguntas frecuentes: título', 'Preguntas frecuentes'),
  f(H, 'home.final.title', 'Cierre: título', 'Protege tu propiedad con una solución adecuada'),
  f(H, 'home.final.text', 'Cierre: texto', 'Desde sistemas de videovigilancia hasta infraestructura tecnológica, VESSDI ofrece soluciones para tus necesidades de seguridad y tecnología.', 'textarea'),

  f(N, 'about.subtitle', 'Subtítulo de la página', 'Venta de Equipos y Sistemas de Seguridad Digital e Informática'),
  f(N, 'about.image', 'Imagen de la página (opcional)', '', 'image'),
  f(N, 'about.who.title', 'Sección 1: título', 'Quiénes somos'),
  f(N, 'about.who.text', 'Sección 1: texto', 'VESSDI es una empresa boliviana dedicada a la instalación de equipos y sistemas de seguridad digital e informática.', 'textarea'),
  f(N, 'about.what.title', 'Sección 2: título', 'Qué hacemos'),
  f(N, 'about.what.text', 'Sección 2: texto', 'Instalamos y configuramos sistemas de videovigilancia, detección y alarma contra incendios, alarmas de seguridad, control de acceso, cableado estructurado, servidores y firewall, dimensionamiento e instalación de paneles solares, y brindamos mantenimiento y reparación de equipos de computación.', 'textarea'),
  f(N, 'about.diff.title', 'Sección 3: título', 'Nuestro diferencial'),
  f(N, 'about.diff.text', 'Sección 3: texto', 'Trabajo eficiente y garantizado.', 'textarea'),
  f(N, 'about.cover.title', 'Sección 4: título', 'Cobertura nacional'),
  f(N, 'about.cover.text', 'Sección 4: texto', 'Atendemos proyectos en todo Bolivia, para personas, comercios, oficinas e instituciones.', 'textarea'),
  f(N, 'about.commit.title', 'Sección 5: título', 'Compromiso con el cliente'),
  f(N, 'about.commit.text', 'Sección 5: texto', 'Analizamos tu necesidad, preparamos una propuesta acorde a tu proyecto y te acompañamos hasta la entrega.', 'textarea'),

  f(P, 'services.title', 'Servicios: título', 'Servicios de seguridad y tecnología'),
  f(P, 'services.sub', 'Servicios: subtítulo', 'Soluciones profesionales para proteger, conectar y mantener tu infraestructura.'),
  f(P, 'products.title', 'Productos: título', 'Productos'),
  f(P, 'products.sub', 'Productos: subtítulo', 'Equipos para tus proyectos de seguridad y tecnología.'),
  f(P, 'projects.title', 'Proyectos: título', 'Proyectos'),
  f(P, 'projects.sub', 'Proyectos: subtítulo', 'Trabajos realizados por VESSDI.'),
  f(P, 'faq.title', 'Preguntas frecuentes: título', 'Preguntas frecuentes'),
  f(P, 'contact.title', 'Contacto: título', 'Contacto'),
  f(P, 'contact.sub', 'Contacto: subtítulo', 'Escríbenos y te responderemos a la brevedad.'),
  f(P, 'quote.title', 'Cotización: título', 'Solicitar cotización'),
  f(P, 'quote.sub', 'Cotización: subtítulo', 'Cuéntanos qué necesitas y nuestro equipo preparará una propuesta de acuerdo con tu proyecto.'),

  f(L, 'legal.privacy', 'Política de privacidad', provisional, 'textarea'),
  f(L, 'legal.terms', 'Términos y condiciones', provisional, 'textarea'),
  f(L, 'legal.sales', 'Política de ventas', provisional, 'textarea'),
  f(L, 'legal.returns', 'Política de devoluciones', provisional, 'textarea'),

  f(S, 'seo.home.title', 'Título en Google (inicio)', 'Seguridad digital e informática en Bolivia'),
  f(S, 'seo.home.desc', 'Descripción en Google (inicio)', 'Instalación de videovigilancia, alarmas, incendios, cableado estructurado, servidores, firewall, control de acceso y paneles solares en toda Bolivia.', 'textarea'),
]

export const DEF: Record<string, string> = Object.fromEntries(DEFAULTS.map((d) => [d.key, d.value]))
