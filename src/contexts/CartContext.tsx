import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = { id: string; slug: string; name: string; price: number; image: string | null; qty: number; stock: number }
type Ctx = {
  items: CartItem[]; count: number; total: number
  add: (i: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}
const CartCtx = createContext<Ctx>(null as any)
export const useCart = () => useContext(CartCtx)
const KEY = 'vessdi_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* sin almacenamiento */ } }, [items])

  const add: Ctx['add'] = (i, qty = 1) => setItems((cur) => {
    const f = cur.find((x) => x.id === i.id)
    if (f) return cur.map((x) => x.id === i.id ? { ...x, qty: Math.min(x.qty + qty, Math.max(i.stock, 1)) } : x)
    return [...cur, { ...i, qty: Math.min(qty, Math.max(i.stock, 1)) }]
  })
  const setQty = (id: string, qty: number) => setItems((cur) => cur.map((x) => x.id === id ? { ...x, qty: Math.max(1, Math.min(qty, Math.max(x.stock, 1))) } : x))
  const remove = (id: string) => setItems((cur) => cur.filter((x) => x.id !== id))
  const clear = () => setItems([])
  const count = items.reduce((s, x) => s + x.qty, 0)
  const total = items.reduce((s, x) => s + x.qty * x.price, 0)
  return <CartCtx.Provider value={{ items, count, total, add, setQty, remove, clear }}>{children}</CartCtx.Provider>
}
