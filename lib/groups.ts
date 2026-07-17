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
  g.status === 'open' && g.current_members < g.max_members

/**
 * What a member collects: the pot. Nothing else.
 *
 * The registration fee is the operator's commission. It was being added here,
 * so the site told applicants they would collect money that was never theirs.
 * It must never appear in a member-facing figure.
 */
export const cashoutOf = (g: SusuGroup) =>
  Number(g.cashout_amount ?? g.contribution_amount * g.max_members * g.cycle_days)

export const ghs = (n: unknown) =>
  Number(n ?? 0).toLocaleString('en-GH', { maximumFractionDigits: 0 })
