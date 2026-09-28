'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * THE BASKET.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Ids and quantities, held in this browser. Deliberately NOT prices: the
 * server prices every line from the catalogue at checkout, so a basket edited
 * in devtools buys nothing cheaply. The price kept here is for display only
 * and is refreshed from the catalogue on every page load.
 *
 * localStorage, so somebody who adds a fridge and goes to find their MoMo PIN
 * still has it when they come back. It is per-browser and disposable; nothing
 * here is money.
 */
export interface CartLine {
  productId: string
  name: string
  slug: string
  price: number      // display only — the server re-prices at checkout
  image: string | null
  quantity: number
}

interface CartApi {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (line: Omit<CartLine, 'quantity'>, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  ready: boolean
}

const KEY = 'aw_cart_v1'
const Ctx = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  // Read once on mount. Reading during render would differ between the server
  // pass and the browser, which React reports as a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setLines(JSON.parse(raw) as CartLine[])
    } catch { /* a corrupt basket is an empty basket, not a crash */ }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* private mode */ }
  }, [lines, ready])

  const api = useMemo<CartApi>(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
    ready,
    add: (line, qty = 1) => setLines(prev => {
      const at = prev.findIndex(l => l.productId === line.productId)
      if (at === -1) return [...prev, { ...line, quantity: qty }]
      const next = [...prev]
      next[at] = { ...next[at], quantity: Math.min(next[at].quantity + qty, 50) }
      return next
    }),
    setQty: (productId, qty) => setLines(prev =>
      qty <= 0
        ? prev.filter(l => l.productId !== productId)
        : prev.map(l => l.productId === productId
            ? { ...l, quantity: Math.min(qty, 50) } : l)),
    remove: (productId) => setLines(prev => prev.filter(l => l.productId !== productId)),
    clear: () => setLines([]),
  }), [lines, ready])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useCart(): CartApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}
