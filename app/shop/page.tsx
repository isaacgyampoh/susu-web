import type { Metadata } from 'next'
import { getCatalogue } from '@/lib/products'
import ProductCard from '@/components/product-card'
import { waNumber } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Shop — pay bit by bit',
  description:
    'Fridges, televisions, blenders and more. Choose what you need, pick a payment plan, and pay gradually until it is yours.',
}

/**
 * THE CATALOGUE.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Grouped by category rather than one long grid: somebody who came for a
 * fridge should not scroll past eleven blenders, and a flat list of everything
 * is what a search page is for.
 *
 * A server component — the catalogue is the same for everybody and there is
 * nothing here to personalise, so it renders once and is cached.
 */
export default async function ShopPage() {
  const { products, categories } = await getCatalogue()

  const used = categories.filter(c => products.some(p => p.category_slug === c.slug))
  const uncategorised = products.filter(p => !p.category_slug)

  return (
    <main className="px-5 sm:px-8 py-12 sm:py-16 max-w-[1180px] mx-auto">
      <header className="max-w-[620px]">
        <h1 className="font-semibold text-[32px] sm:text-[40px] tracking-[-.03em] leading-[1.05]">
          Get what you need. Pay bit by bit.
        </h1>
        <p className="text-[15px] sm:text-base text-ink-2 mt-3 leading-relaxed">
          Choose a product, pick a payment plan that fits what you earn, and pay
          it down over time. When the last payment lands, it is yours to collect.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-line bg-white p-8 text-center">
          <p className="font-semibold text-ink">Nothing listed just yet</p>
          <p className="text-[14px] text-ink-2 mt-1.5 leading-relaxed max-w-[420px] mx-auto">
            We are putting the catalogue together. Message us on WhatsApp and we
            will tell you what is available right now.
          </p>
          <a href={`https://wa.me/${waNumber()}`} className="btn-dark btn-sm mt-5 inline-flex">
            Ask on WhatsApp
          </a>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {used.map(c => (
            <section key={c.id} aria-labelledby={`cat-${c.slug}`}>
              <h2 id={`cat-${c.slug}`}
                  className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-4">
                {c.name}
              </h2>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter(p => p.category_slug === c.slug)
                         .map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            </section>
          ))}

          {uncategorised.length > 0 && (
            <section aria-labelledby="cat-other">
              <h2 id="cat-other"
                  className="text-[13px] font-medium uppercase tracking-[.08em] text-ink-3 mb-4">
                More
              </h2>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorised.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
