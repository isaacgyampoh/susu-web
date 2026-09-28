'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { mediaUrl, type Product } from '@/lib/products'

/**
 * Adding something to the basket.
 *
 * The button changes to "Added" for a moment rather than opening the basket:
 * most people want to keep browsing, and a shop that interrupts you every time
 * you pick something up is a shop you leave with one item.
 */
export default function AddToCart({ p, full }: { p: Product; full?: boolean }) {
  const cart = useCart()
  const [added, setAdded] = useState(false)

  if (!p.in_stock) {
    return (
      <button type="button" disabled
        className={`btn border border-line text-ink-3 cursor-not-allowed ${full ? 'w-full' : 'btn-sm'}`}>
        Out of stock
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        cart.add({
          productId: p.id, name: p.name, slug: p.slug,
          price: p.cash_price,
          image: p.media.find(m => m.kind === 'image')?.path ?? null,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 1600)
      }}
      className={`btn-dark ${full ? 'w-full' : 'btn-sm'}`}
      aria-live="polite"
    >
      {added ? 'Added to basket' : 'Add to basket'}
    </button>
  )
}
