import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalogue, mediaUrl, ghs, planLine, type Plan } from '@/lib/products'
import { waNumber } from '@/lib/site'
import AddToCart from '@/components/add-to-cart'

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const { products } = await getCatalogue(params.slug)
  const p = products[0]
  if (!p) return { title: 'Product' }

  const cheapest = p.plans.length
    ? p.plans.reduce((a, b) => (b.installment_amount < a.installment_amount ? b : a))
    : null

  const title = `${p.name} — GHS ${ghs(p.cash_price)}`
  const description = [
    p.summary,
    cheapest ? `Pay ${planLine(cheapest)}.` : null,
    'Pay bit by bit and collect it when you finish.',
  ].filter(Boolean).join(' ')

  return { title, description, openGraph: { title, description, type: 'website' } }
}

/**
 * ONE PRODUCT, AND HOW TO PAY FOR IT.
 *
 * ────────────────────────────────────────────────────────────────────────
 * The plans are the point of this page. Somebody has already decided they want
 * the fridge; what they are working out here is whether GHS 400 a month is
 * something they can hold for ten months. So each plan states the payment, the
 * term and the total — including the total, because the difference between the
 * cash price and the instalment total is real and hiding it is how a shop
 * loses somebody's trust at the worst possible moment.
 *
 * Choosing a plan hands off to the portal, which is where accounts and money
 * live. This site shows and explains; it does not take payments.
 */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { products } = await getCatalogue(params.slug)
  const p = products[0]
  if (!p) notFound()

  const images = p.media.filter(m => m.kind === 'image')
  const videos = p.media.filter(m => m.kind === 'video')
  const specs = Array.isArray(p.specifications) ? p.specifications : []

  return (
    <main className="px-5 sm:px-8 py-10 sm:py-14 max-w-[1080px] mx-auto">
      <Link href="/shop" className="text-[13px] text-ink-2 hover:text-ink">← All products</Link>

      <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 mt-5">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-tint">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(images[0].path)} alt={images[0].alt ?? p.name}
                   className="w-full h-full object-cover" />
            ) : (
              <span className="grid place-items-center w-full h-full text-xs text-ink-3">
                No photo yet
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.slice(1, 5).map((m, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-tint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(m.path)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {videos.map((v, i) => (
            <video key={i} controls preload="none" playsInline
                   className="w-full rounded-2xl mt-3 bg-ink"
                   src={mediaUrl(v.path)} />
          ))}
        </div>

        {/* The decision */}
        <div>
          {p.category && (
            <p className="text-[11px] font-medium uppercase tracking-[.08em] text-ink-3">
              {p.category}
            </p>
          )}
          <h1 className="font-semibold text-[28px] sm:text-[34px] tracking-[-.03em] leading-[1.1] mt-1">
            {p.name}
          </h1>
          {p.summary && (
            <p className="text-[15px] text-ink-2 mt-2.5 leading-relaxed">{p.summary}</p>
          )}

          <p className="text-[15px] text-ink mt-4 tnum">
            <span className="text-ink-3">Cash price</span>{' '}
            <span className="font-semibold">GHS {ghs(p.cash_price)}</span>
          </p>

          {/* Buying outright is the straightforward path, so it comes first
              and needs no explanation. Paying gradually is below, with the
              terms, because it is the one that involves a conversation. */}
          <div className="mt-4">
            <AddToCart p={p} full />
          </div>

          {!p.in_stock && (
            <p className="text-[13px] text-ink-2 mt-3 rounded-xl bg-tint px-3 py-2.5">
              This one is out of stock at the moment. Message us and we will let
              you know when it is back.
            </p>
          )}

          <section aria-labelledby="plans" className="mt-7">
            <h2 id="plans" className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-1">
              Or pay gradually
            </h2>
            <p className="text-[13px] text-ink-2 mb-3 leading-relaxed">
              Send a request and we will call you to agree a deposit and the
              dates. Nothing is owed until you have spoken to us.
            </p>

            {p.plans.length === 0 ? (
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Message us and we will work out a plan that suits you.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {p.plans.map((pl: Plan) => (
                  <li key={pl.id}
                      className="rounded-xl border border-line bg-white p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="font-semibold text-[15px] text-ink">{pl.name}</p>
                      <p className="text-[13px] text-ink-3 tnum">
                        Total GHS {ghs(pl.total_payable)}
                      </p>
                    </div>
                    <p className="text-[17px] font-semibold text-ink tnum mt-1">
                      {planLine(pl)}
                    </p>
                    {pl.deposit_amount > 0 && (
                      <p className="text-[13px] text-ink-2 mt-1 tnum">
                        GHS {ghs(pl.deposit_amount)} deposit to start
                      </p>
                    )}
                    {pl.terms && (
                      <p className="text-[12px] text-ink-3 mt-1.5 leading-relaxed">{pl.terms}</p>
                    )}
                    <Link
                      href={`/shop/${p.slug}/request?plan=${pl.id}`}
                      className="btn border border-line text-ink hover:bg-tint btn-sm w-full mt-3 inline-flex justify-center"
                    >
                      Ask about this plan
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {p.description && (
            <section className="mt-8">
              <h2 className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-2">
                About this product
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            </section>
          )}

          {specs.length > 0 && (
            <section className="mt-7">
              <h2 className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-2">
                Specifications
              </h2>
              <dl className="divide-y divide-line border-t border-line">
                {specs.map((s, i) => (
                  <div key={i} className="flex items-baseline gap-4 py-2">
                    <dt className="text-[13px] text-ink-3 w-[40%] shrink-0">{s.label}</dt>
                    <dd className="text-[13px] text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <p className="text-[12px] text-ink-3 mt-8 leading-relaxed">
            Questions before you start?{' '}
            <a href={`https://wa.me/${waNumber()}`}
               className="underline underline-offset-2 hover:text-ink">
              Message us on WhatsApp
            </a>.
          </p>
        </div>
      </div>
    </main>
  )
}
