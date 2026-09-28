'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { mediaUrl, ghs } from '@/lib/products'

/**
 * THE BASKET.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Prices shown here are the ones the catalogue quoted when each item was
 * added. They are re-read on the server at checkout, and the line at the
 * bottom says so — a total that can change between this page and the payment
 * prompt has to be explained before it changes, not after.
 */
export default function CartPage() {
  const cart = useCart()

  if (!cart.ready) {
    return <main className="wrap py-16"><p className="t-body">Loading your basket…</p></main>
  }

  if (cart.lines.length === 0) {
    return (
      <main className="wrap py-20 text-center">
        <h1 className="font-semibold text-[28px] tracking-[-.02em]">Your basket is empty</h1>
        <p className="t-body mt-2 max-w-[420px] mx-auto">
          Everything you add is kept here until you are ready to pay.
        </p>
        <Link href="/shop" className="btn-dark mt-6 inline-flex">Browse products</Link>
      </main>
    )
  }

  return (
    <main className="wrap py-10 sm:py-14 max-w-[820px]">
      <h1 className="font-semibold text-[28px] sm:text-[32px] tracking-[-.03em]">Your basket</h1>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {cart.lines.map(l => (
          <li key={l.productId} className="flex items-start gap-4 py-4">
            <div className="w-20 h-20 rounded-xl bg-tint overflow-hidden shrink-0">
              {l.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(l.image)} alt="" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link href={`/shop/${l.slug}`} className="font-medium text-ink hover:underline underline-offset-2">
                {l.name}
              </Link>
              <p className="text-[13px] text-ink-2 mt-0.5 tnum">GHS {ghs(l.price)} each</p>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="inline-flex items-center border border-line rounded-full">
                  <button type="button" aria-label={`Fewer ${l.name}`}
                    onClick={() => cart.setQty(l.productId, l.quantity - 1)}
                    className="w-10 h-10 grid place-items-center text-ink-2 hover:text-ink rounded-l-full">
                    −
                  </button>
                  <span className="w-8 text-center text-[14px] tnum" aria-live="polite">{l.quantity}</span>
                  <button type="button" aria-label={`More ${l.name}`}
                    onClick={() => cart.setQty(l.productId, l.quantity + 1)}
                    className="w-10 h-10 grid place-items-center text-ink-2 hover:text-ink rounded-r-full">
                    +
                  </button>
                </div>
                {/* A real tap target, not just a word: it was 18px tall next
                    to 40px quantity controls, which is the one on this row
                    somebody hits by accident. */}
                <button type="button" onClick={() => cart.remove(l.productId)}
                  className="min-h-[40px] px-1 text-[13px] text-ink-3 hover:text-red
                             underline underline-offset-2">
                  Remove
                </button>
              </div>
            </div>

            <p className="text-[15px] font-semibold text-ink tnum shrink-0">
              GHS {ghs(l.price * l.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between mt-6">
        <p className="text-[15px] text-ink-2">Subtotal</p>
        <p className="text-[22px] font-semibold text-ink tnum">GHS {ghs(cart.subtotal)}</p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/checkout" className="btn-dark">Checkout</Link>
        <Link href="/shop" className="btn border border-line text-ink hover:bg-tint">
          Keep shopping
        </Link>
      </div>

      <p className="text-[12px] text-ink-3 mt-6 leading-relaxed">
        Prices are confirmed against the shop when you check out, so what you pay
        is always the current price. Delivery is arranged after payment.
      </p>
    </main>
  )
}
