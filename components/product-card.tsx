import Link from 'next/link'
import { mediaUrl, ghs, planLine, fromPrice, type Product } from '@/lib/products'

/**
 * ONE PRODUCT, ON A SHELF.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Two numbers, and they do different jobs. The cash price is what the thing
 * costs; the instalment is what it costs to START. Most people scanning this
 * page are deciding whether they can afford to begin, so the instalment is the
 * one set in the heavier type — but the full price sits beside it, because a
 * shop that hides the total is a shop people stop trusting once they notice.
 */
export default function ProductCard({ p }: { p: Product }) {
  const cheapest = fromPrice(p)
  const image = p.media.find(m => m.kind === 'image')

  return (
    <Link
      href={`/shop/${p.slug}`}
      className="group block rounded-2xl border border-line bg-white overflow-hidden
                 transition-shadow hover:shadow-md focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-ink/30"
    >
      <div className="aspect-[4/3] bg-tint overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(image.path)}
            alt={image.alt ?? p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300
                       group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid place-items-center w-full h-full text-xs text-ink-3">
            No photo yet
          </span>
        )}
      </div>

      <div className="p-4">
        {p.category && (
          <p className="text-[11px] font-medium uppercase tracking-[.07em] text-ink-3">
            {p.category}
          </p>
        )}
        <h3 className="font-semibold text-[15px] text-ink mt-1 leading-snug">{p.name}</h3>
        {p.summary && (
          <p className="text-[13px] text-ink-2 mt-1 leading-relaxed line-clamp-2">{p.summary}</p>
        )}

        <div className="mt-3 pt-3 border-t border-line">
          {cheapest ? (
            <>
              <p className="text-[15px] font-semibold text-ink tnum">
                {planLine(cheapest)}
              </p>
              <p className="text-[12px] text-ink-3 mt-0.5 tnum">
                Cash price GHS {ghs(p.cash_price)}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-ink-2">Ask us about payment plans</p>
          )}
        </div>

        {/* Said plainly rather than by greying the card out, which reads as a
            rendering fault rather than as a fact about stock. */}
        {!p.in_stock && (
          <p className="text-[12px] text-ink-3 mt-2">Out of stock — ask us when it is back</p>
        )}
      </div>
    </Link>
  )
}
