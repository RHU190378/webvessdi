// Envía un aviso por correo con el servicio gratuito FormSubmit (no necesita servidor propio).
// La solicitud YA queda guardada en Supabase; el correo es un aviso adicional.
// "to" puede ser el correo o el código alias que entrega FormSubmit.
export function notifyEmail(to: string, subject: string, fields: Record<string, string | null | undefined>, replyTo?: string | null) {
  const dest = (to || '').trim()
  if (!dest || /\s/.test(dest) || (!dest.includes('@') && dest.length < 10)) return
  const body: Record<string, string> = { _subject: subject, _template: 'table', _captcha: 'false' }
  if (replyTo && replyTo.includes('@')) body.email = replyTo
  Object.entries(fields).forEach(([k, v]) => { if (v) body[k] = String(v) })
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10000)
  fetch(`https://formsubmit.co/ajax/${encodeURIComponent(dest)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal,
  }).catch((e) => console.warn('No se pudo enviar el aviso por correo', e)).finally(() => clearTimeout(timer))
}
