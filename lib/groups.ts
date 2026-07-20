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
