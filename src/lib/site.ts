// Datos públicos de la empresa (no son claves). Edítalos aquí si cambian.
export const SITE = {
  name: 'VESSDI',
  fullName: 'Venta de Equipos y Sistemas de Seguridad Digital e Informática',
  phone: '76015484',
  waNumber: '59176015484', // 591 = código de Bolivia
  address: 'Barrio Las Américas, c/ Perú c/9',
  country: 'Bolivia',
}
export const waLink = (msg: string) => `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`
export const DEPARTMENTS = ['La Paz','Cochabamba','Santa Cruz','Oruro','Potosí','Chuquisaca','Tarija','Beni','Pando']
export const ICONS: Record<string, string> = {
  'video-vigilancia': '📹', incendios: '🔥', 'cableado-estructurado': '🔌', servidores: '🖥️',
  firewall: '🛡️', 'mantenimiento-computacion': '🔧', 'control-acceso': '🔐', alarmas: '🚨', 'paneles-solares': '☀️',
}
