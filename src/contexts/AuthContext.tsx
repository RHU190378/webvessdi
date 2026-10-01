import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

type Ctx = { user: any; profile: any; isAdmin: boolean; loading: boolean; signOut: () => Promise<void>; refresh: () => Promise<void> }
const AuthCtx = createContext<Ctx>(null as any)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u: any) => {
    if (!u) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setUser(data.session?.user ?? null)
      await loadProfile(data.session?.user)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      setTimeout(() => loadProfile(session?.user), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthCtx.Provider value={{
      user, profile, isAdmin: profile?.role === 'admin', loading,
      signOut: async () => { await supabase.auth.signOut() },
      refresh: () => loadProfile(user),
    }}>{children}</AuthCtx.Provider>
  )
}
