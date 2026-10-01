import { useEffect, useState } from 'react'

export function useAsync<T = any>(fn: () => Promise<T>, deps: any[] = []) {
  const [st, set] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null })
  useEffect(() => {
    let ok = true
    set((s) => ({ ...s, loading: true, error: null }))
    fn().then((d) => ok && set({ data: d, loading: false, error: null }))
      .catch((e) => { console.error(e); ok && set({ data: null, loading: false, error: 'No se pudo cargar la información. Intenta nuevamente en unos minutos.' }) })
    return () => { ok = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return st
}
