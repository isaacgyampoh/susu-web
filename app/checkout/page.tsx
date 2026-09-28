'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { ghs } from '@/lib/products'
import { callFunction } from '@/lib/supabase'

/**
 * CHECKOUT.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Name, phone, where it is going, and the number to charge. No account: a shop
 * that demands a password before it will take money takes less money, and
 * there is nothing here a customer would come back to log into.
 *
 * ── THIS SCREEN NEVER DECIDES THAT A PAYMENT SUCCEEDED ──────────────────
 *
 * It sends ids and quantities, gets back a prompt, and says "approve it on
 * your phone". The order becomes paid when NaloPay confirms it to the server.
 * A success screen driven by this component would be a receipt written by the
 * person who owes the money.
 */
export default function CheckoutPage() {
  const cart = useCart()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ order: string; message: string } | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)

    const { data, error } = await callFunction<{ order: string; message: string }>(
      'shop-order', {
        method: 'POST',
        body: {
          items: cart.lines.map(l => ({ product_id: l.productId, quantity: l.quantity })),
          full_name: f.get('full_name'),
          phone: f.get('phone'),
          email: f.get('email') || null,
          address: f.get('address') || null,
          note: f.get('note') || null,
          momo: f.get('momo') || f.get('phone'),
          network: f.get('network'),
        },
      })

    setBusy(false)
    if (error) { setErr(error); return }
    // The basket has become an order; keeping it would let somebody pay twice.
    cart.clear()
    setDone(data ?? null)
  }

  if (done) {
    return (
      <main className="wrap py-20 max-w-[560px] text-center">
        <h1 className="font-semibold text-[28px] tracking-[-.02em]">Check your phone</h1>
        <p className="t-body mt-3">{done.message}</p>
        <p className="text-[13px] text-ink-2 mt-4 tnum">Order {done.order}</p>
        <p className="text-[13px] text-ink-3 mt-6 leading-relaxed">
          Once the payment goes through we will call you to arrange collection or
          delivery. Keep this order number.
        </p>
        <Link href="/shop" className="btn-dark mt-7 inline-flex">Keep shopping</Link>
      </main>
    )
  }

  if (cart.ready && cart.lines.length === 0) {
    return (
      <main className="wrap py-20 text-center">
        <h1 className="font-semibold text-[26px] tracking-[-.02em]">Nothing to check out</h1>
        <Link href="/shop" className="btn-dark mt-6 inline-flex">Browse products</Link>
      </main>
    )
  }

  return (
    <main className="wrap py-10 sm:py-14 max-w-[880px]">
      <h1 className="font-semibold text-[28px] sm:text-[32px] tracking-[-.03em]">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] mt-7">
        <form onSubmit={submit} className="space-y-4">
          {err && (
            <p role="alert" className="text-[13.5px] text-red bg-red-50 border border-red/25 rounded-xl px-4 py-3">
              {err}
            </p>
          )}

          <fieldset className="space-y-4">
            <legend className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-1">
              Your details
            </legend>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Full name</span>
              <input name="full_name" required autoComplete="name" className="in mt-1.5" />
            </label>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Phone</span>
              <input name="phone" required inputMode="tel" autoComplete="tel"
                     placeholder="024 000 0000" className="in mt-1.5" />
            </label>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Email <span className="text-ink-3">(optional)</span></span>
              <input name="email" type="email" autoComplete="email" className="in mt-1.5" />
            </label>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Delivery address or pickup note</span>
              <textarea name="address" rows={2} className="in mt-1.5 h-auto py-2"
                        placeholder="Where should we deliver, or will you collect?" />
            </label>
          </fieldset>

          <fieldset className="space-y-4 pt-2">
            <legend className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-1">
              Payment
            </legend>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Mobile money number to charge</span>
              <input name="momo" inputMode="tel" className="in mt-1.5"
                     placeholder="Leave empty to use the number above" />
            </label>
            <label className="block">
              <span className="text-[14px] font-medium text-ink-2">Network</span>
              <select name="network" className="in mt-1.5" defaultValue="MTN">
                <option value="MTN">MTN</option>
                <option value="VODAFONE">Telecel / Vodafone</option>
                <option value="AIRTELTIGO">AirtelTigo</option>
              </select>
            </label>
          </fieldset>

          <button type="submit" disabled={busy} className="btn-dark w-full mt-2">
            {busy ? 'Starting payment…' : `Pay GHS ${ghs(cart.subtotal)}`}
          </button>
          <p className="text-[12px] text-ink-3 leading-relaxed">
            You will get a prompt on your phone to approve the payment. Your
            order is confirmed once that payment goes through.
          </p>
        </form>

        <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3">
            Your order
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {cart.lines.map(l => (
              <li key={l.productId} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-[14px] text-ink min-w-0 truncate">
                  {l.name}{l.quantity > 1 && <span className="text-ink-3"> × {l.quantity}</span>}
                </span>
                <span className="text-[14px] text-ink tnum shrink-0">
                  GHS {ghs(l.price * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-line">
            <span className="text-[14px] font-medium text-ink">Total</span>
            <span className="text-[19px] font-semibold text-ink tnum">GHS {ghs(cart.subtotal)}</span>
          </div>
          <Link href="/cart" className="block text-[13px] text-ink-2 hover:text-ink mt-4 underline underline-offset-2">
            Edit basket
          </Link>
        </aside>
      </div>
    </main>
  )
}
