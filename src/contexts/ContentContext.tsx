import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { DEF } from '../lib/contentDefaults'
import { SITE } from '../lib/site'

type Ctx = { get: (k: string) => string; reload: () => Promise<void> }
const CC = createContext<Ctx>({ get: (k) => DEF[k] ?? '', reload: async () => {} })
export const useContent = () => useContext(CC)
export const useC = () => useContext(CC).get

export function ContentProvider({ children }: { children: ReactNode }) {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  const reload = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_content').select('key,value')
      if (!error && data) setVals(Object.fromEntries(data.map((r: any) => [r.key, r.value ?? ''])))
    } catch { /* se usan los textos por defecto */ }
    setReady(true)
  }, [])
  useEffect(() => { reload() }, [reload])

  const get = (k: string) => (k in vals ? vals[k] : DEF[k] ?? '')

  // Mantiene al día los datos globales usados en enlaces (teléfono, WhatsApp, dirección)
  SITE.phone = get('site.phone')
  SITE.waNumber = get('site.whatsapp').replace(/\D/g, '')
  SITE.address = get('site.address')
  SITE.country = get('site.country')
  SITE.defaultMsg = get('site.wa_default_msg')

  if (!ready) return <div className="state" role="status"><div className="spin" />Cargando…</div>
  return <CC.Provider value={{ get, reload }}>{children}</CC.Provider>
}
