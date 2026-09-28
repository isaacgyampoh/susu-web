'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { getCatalogue, ghs, planLine, type Product, type Plan } from '@/lib/products'
import { callFunction } from '@/lib/supabase'

/**
 * ASKING TO PAY GRADUALLY.
 *
 * ────────────────────────────────────────────────────────────────────────
 * This is a request, not a purchase, and the page says so in plain words
 * throughout. Nothing is owed when it is sent and no money is taken here: the
 * collector calls to agree the terms, because extending credit to somebody is
 * a judgement about that person rather than a form submission.
 *
 * Being honest about that up front is also the kind thing to do — a customer
 * who thinks they have bought a fridge and then gets a phone call asking
 * questions has been misled by the screen, not by the person calling.
 */
export default function RequestPage() {
  const { slug } = useParams<{ slug: string }>()
  const params = useSearchParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState<{ reference: string; message: string } | null>(null)

  useEffect(() => {
    getCatalogue(slug).then(({ products }) => {
      setProduct(products[0] ?? null); setLoading(false)
    })
  }, [slug])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)
    const { data, error } = await callFunction<{ reference: string; message: string }>(
      'shop-request', {
        method: 'POST',
        body: {
          plan_id: f.get('plan_id'),
          full_name: f.get('full_name'),
          phone: f.get('phone'),
          whatsapp: f.get('whatsapp') || null,
          email: f.get('email') || null,
          address: f.get('address') || null,
          quantity: Number(f.get('quantity') || 1),
          note: f.get('note') || null,
        },
      })
    setBusy(false)
    if (error) { setErr(error); return }
    setSent(data ?? null)
  }

  if (loading) return <main className="wrap py-16"><p className="t-body">Loading…</p></main>

  if (!product) {
    return (
      <main className="wrap py-20 text-center">
        <h1 className="font-semibold text-[26px] tracking-[-.02em]">Product not found</h1>
        <Link href="/shop" className="btn-dark mt-6 inline-flex">Browse products</Link>
      </main>
    )
  }

  if (sent) {
    return (
      <main className="wrap py-20 max-w-[560px] text-center">
        <h1 className="font-semibold text-[28px] tracking-[-.02em]">Request received</h1>
        <p className="t-body mt-3">{sent.message}</p>
        <p className="text-[13px] text-ink-2 mt-4 tnum">Reference {sent.reference}</p>
        <p className="text-[13px] text-ink-3 mt-6 leading-relaxed">
          Nothing is owed yet. We will call you to agree the deposit and the
          payment dates, and the arrangement starts from there.
        </p>
        <Link href="/shop" className="btn-dark mt-7 inline-flex">Keep browsing</Link>
      </main>
    )
  }

  if (product.plans.length === 0) {
    return (
      <main className="wrap py-20 text-center max-w-[520px]">
        <h1 className="font-semibold text-[26px] tracking-[-.02em]">
          No payment plans for this one yet
        </h1>
        <p className="t-body mt-3">Message us and we will work something out.</p>
        <Link href={`/shop/${product.slug}`} className="btn-dark mt-6 inline-flex">
          Back to the product
        </Link>
      </main>
    )
  }

  const preferred = params.get('plan')

  return (
    <main className="wrap py-10 sm:py-14 max-w-[720px]">
      <Link href={`/shop/${product.slug}`} className="text-[13px] text-ink-2 hover:text-ink">
        ← {product.name}
      </Link>

      <h1 className="font-semibold text-[28px] sm:text-[32px] tracking-[-.03em] mt-4">
        Ask to pay gradually
      </h1>
      <p className="t-body mt-3 max-w-[520px]">
        Send us your details and we will call you to agree a deposit and the
        payment dates. <strong className="text-ink font-medium">Nothing is owed
        until you have spoken to us</strong>, and no payment is taken on this page.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {err && (
          <p role="alert" className="text-[13.5px] text-red bg-red-50 border border-red/25 rounded-xl px-4 py-3">
            {err}
          </p>
        )}

        <fieldset>
          <legend className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-2">
            Which plan suits you
          </legend>
          <div className="space-y-2">
            {product.plans.map((pl: Plan, i: number) => (
              <label key={pl.id}
                className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 cursor-pointer
                           has-[:checked]:border-ink/40 has-[:checked]:bg-tint">
                <input type="radio" name="plan_id" value={pl.id} required
                       defaultChecked={preferred ? pl.id === preferred : i === 0}
                       className="mt-1 w-4 h-4 accent-green" />
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{pl.name}</span>
                  <span className="block text-[14px] text-ink-2 tnum mt-0.5">{planLine(pl)}</span>
                  <span className="block text-[13px] text-ink-3 tnum mt-0.5">
                    Total GHS {ghs(pl.total_payable)}
                    {pl.deposit_amount > 0 && ` · deposit around GHS ${ghs(pl.deposit_amount)}`}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-[12px] text-ink-3 mt-2 leading-relaxed">
            These are the usual terms. The final deposit and dates are agreed on
            the phone and may differ.
          </p>
        </fieldset>

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
          <span className="text-[14px] font-medium text-ink-2">
            WhatsApp <span className="text-ink-3">(if different)</span>
          </span>
          <input name="whatsapp" inputMode="tel" className="in mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[14px] font-medium text-ink-2">
            Email <span className="text-ink-3">(optional)</span>
          </span>
          <input name="email" type="email" autoComplete="email" className="in mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[14px] font-medium text-ink-2">Where you live</span>
          <input name="address" className="in mt-1.5" placeholder="Area or town" />
        </label>
        <label className="block">
          <span className="text-[14px] font-medium text-ink-2">How many</span>
          <input name="quantity" type="number" min={1} max={10} defaultValue={1}
                 className="in mt-1.5 max-w-[120px]" />
        </label>
        <label className="block">
          <span className="text-[14px] font-medium text-ink-2">
            Anything we should know <span className="text-ink-3">(optional)</span>
          </span>
          <textarea name="note" rows={3} className="in mt-1.5 h-auto py-2"
                    placeholder="How much you can put down, when you get paid, anything else" />
        </label>

        <button type="submit" disabled={busy} className="btn-dark w-full">
          {busy ? 'Sending…' : 'Send request'}
        </button>
      </form>
    </main>
  )
}
