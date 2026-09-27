const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * THE SHOP WINDOW.
 *
 * ────────────────────────────────────────────────────────────────────────
 * One read for the whole catalogue, from `shop-catalogue`. That endpoint is
 * public because a shop nobody can look at is not a shop — and it is safe to
 * be public because the function behind it selects published products only and
 * never touches `purchases` or `members`. There is no customer data in the
 * response to leak.
 *
 * Revalidated rather than fetched per request: the catalogue changes when the
 * owner edits it, which is a few times a week, not per visitor.
 */

export interface Plan {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  duration_count: number
  installment_amount: number
  deposit_amount: number
  total_payable: number
  terms: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  summary: string | null
  description: string | null
  specifications: { label: string; value: string }[] | []
  cash_price: number
  category: string | null
  category_slug: string | null
  in_stock: boolean
  media: { kind: 'image' | 'video'; path: string; alt: string | null }[]
  plans: Plan[]
}

export interface Category { id: string; name: string; slug: string; count: number }

export interface Catalogue { categories: Category[]; products: Product[] }

const MEDIA_BASE = `${URL}/storage/v1/object/public/product-media/`
export const mediaUrl = (path: string) => MEDIA_BASE + path

export async function getCatalogue(slug?: string): Promise<Catalogue> {
  if (!URL || !ANON) return { categories: [], products: [] }
  try {
    const res = await fetch(
      `${URL}/functions/v1/shop-catalogue${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`,
      {
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
        next: { revalidate: 300 },
      })
    if (!res.ok) return { categories: [], products: [] }
    return (await res.json()) as Catalogue
  } catch {
    // A shop that 500s because the catalogue is briefly unreachable is worse
    // than a shop that shows nothing and keeps its other pages working.
    return { categories: [], products: [] }
  }
}

/** Money, the way the rest of the site writes it. */
export const ghs = (n: unknown) => {
  const v = Number(n ?? 0)
  return v % 1 === 0
    ? v.toLocaleString('en-GH', { maximumFractionDigits: 0 })
    : v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const EVERY: Record<Plan['frequency'], string> = {
  daily: 'a day', weekly: 'a week', biweekly: 'every 2 weeks', monthly: 'a month',
}

/** "GHS 500 a month for 8 months" — the sentence a shopper actually reads. */
export const planLine = (p: Plan) =>
  `GHS ${ghs(p.installment_amount)} ${EVERY[p.frequency]} for ${p.duration_count}`

/**
 * The cheapest way in, for the card.
 *
 * Derived from the plans rather than divided out of the price: a plan's
 * instalment is set by the owner and is not always total ÷ months.
 */
export function fromPrice(p: Product): Plan | null {
  if (p.plans.length === 0) return null
  return p.plans.reduce((a, b) => (b.installment_amount < a.installment_amount ? b : a))
}
