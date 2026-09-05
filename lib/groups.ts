import type { SusuGroup } from '@/types'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Fetched on the server, not in the browser.
 *
 * These are the product. They should be in the HTML when Google reads it, and
 * on screen before a phone on a slow connection has run any JavaScript.
 * Revalidated every minute, so a group created in the console shows up here
 * within a minute without a redeploy.
 */
export async function getOpenGroups(): Promise<SusuGroup[]> {
  if (!URL || !ANON) return []
  try {
    const res = await fetch(`${URL}/functions/v1/groups-public`, {
      headers: { apikey: ANON },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const { groups } = await res.json()
    return (groups ?? []) as SusuGroup[]
  } catch {
    // A marketing page must never 500 because the API blinked
    return []
  }
}

export const isOpen = (g: SusuGroup) =>
  // Joinable = the admin shows it (server-side toggle) and spots remain.
  // Status no longer gates it: an ACTIVE group keeps recruiting until full.
  ['open', 'full', 'active'].includes(g.status) && g.current_members < g.max_members

/**
 * What a member collects: exactly what the admin set. Never a calculation.
 *
 * This used to fall back to contribution x members x cycle_days when no cashout
 * was set — a number this site invented, which is not what anyone is being paid.
 * The admin decides the cashout in the console; every figure shown here is that
 * value and nothing else.
 *
 * Returns null when it has not been set. A group with no cashout is not finished,
 * and inventing a figure for it is how members get told the wrong number.
 */
export const cashoutOf = (g: SusuGroup): number | null =>
  g.cashout_amount == null ? null : Number(g.cashout_amount)

/** Only advertise groups whose payout the admin has actually decided. */
export const isAdvertisable = (g: SusuGroup) => cashoutOf(g) !== null

/**
 * Money, shown honestly.
 *
 * This rounded to whole cedis, so a GHS 10.90 contribution was advertised as
 * "GHS 11" — a price the member does not pay, overstated by 10 pesewas a day.
 * Whole amounts stay clean; anything with pesewas shows them.
 */
export const ghs = (n: unknown) => {
  const v = Number(n ?? 0)
  return v % 1 === 0
    ? v.toLocaleString('en-GH', { maximumFractionDigits: 0 })
    : v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}


/**
 * The places a group sells, cheapest last, as the administrator configured them.
 *
 * Nothing is derived here. A half place is whatever the group says a half place
 * costs and pays — it does not have to be half of anything, which is the whole
 * reason portions stopped being a multiplication.
 *
 * Returns [] for a group with none configured, and the card then shows only the
 * full figures rather than inventing smaller ones.
 */
export const portionsOf = (g: SusuGroup) =>
  (g.group_portions ?? [])
    .filter(p => Number(p.contribution_amount) > 0)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)

/** The cheapest way in. What a card should lead with for someone deciding. */
export const cheapestEntry = (g: SusuGroup): number | null => {
  const ps = portionsOf(g)
  if (ps.length === 0) return null
  return Math.min(...ps.map(p => Number(p.contribution_amount)))
}


/**
 * What ONE place in a group costs and pays, at a given size.
 *
 * The single place the site resolves this. It was worked out inline in four
 * different spots on the join page — the picker, the review panel, the total
 * registration fee and the multi-group summary — each multiplying by the
 * fraction, which stopped being true when portions became configuration.
 * Four copies of a rule is how three of them end up wrong.
 *
 * Falls back to the old multiplication for a group with no portions, which is
 * exactly what the server does, so the two never disagree.
 */
export function placeOf(g: SusuGroup, fraction: number) {
  const p = portionsOf(g).find(x => Number(x.fraction) === fraction)
  if (p) {
    return {
      pay: Number(p.contribution_amount),
      registration: Number(p.registration_fee),
      collect: Number(p.payout_amount),
      label: p.label,
      configured: true,
    }
  }
  const cash = cashoutOf(g)
  return {
    pay: Number(g.contribution_amount ?? 0) * fraction,
    registration: Number(g.registration_fee ?? 0) * fraction,
    collect: cash === null ? null : cash * fraction,
    label: fraction === 1 ? 'Full' : fraction === 0.5 ? 'Half' : 'Quarter',
    configured: false,
  }
}
