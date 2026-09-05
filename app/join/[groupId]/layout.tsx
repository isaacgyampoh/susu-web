import type { Metadata } from 'next'
import { getOpenGroups, cashoutOf, ghs, portionsOf, cheapestEntry } from '@/lib/groups'

/**
 * PER-GROUP METADATA FOR A SHARED LINK.
 *
 * ────────────────────────────────────────────────────────────────────────
 * This is how groups actually spread: somebody joins, likes it, and forwards
 * their group's link on WhatsApp. Until now that link carried the site's
 * generic card — "Abbie Wealth Susu, save daily" — so the one thing the
 * recipient wanted to know, which group and what it pays, was not in the
 * preview.
 *
 * A layout rather than converting the page: `app/join/[groupId]/page.tsx` is a
 * client component because the form needs state, and a client component cannot
 * export metadata. A server layout wrapping it can, and the page itself does
 * not change at all.
 *
 * ── EVERY FIGURE IS THE GROUP'S OWN ─────────────────────────────────────
 *
 * The cash-out and the entry price come from the configured portions, through
 * the same helpers the card uses. Nothing here multiplies a fraction, and a
 * group whose payout the administrator has not set says so rather than having
 * one invented for the share card.
 */
export async function generateMetadata(
  { params }: { params: { groupId: string } },
): Promise<Metadata> {
  // Reuses the cached feed the rest of the site reads, so this adds no request.
  const groups = await getOpenGroups().catch(() => [])
  const g = groups.find(x => x.id === params.groupId)

  if (!g) return { title: 'Join a group' }

  const full    = portionsOf(g).find(p => Number(p.fraction) === 1)
  const collect = full ? Number(full.payout_amount) : cashoutOf(g)
  const from    = cheapestEntry(g) ?? Number(g.contribution_amount ?? 0)
  const left    = Math.max(0, (g.max_members ?? 0) - (g.current_members ?? 0))

  const title = collect === null
    ? `Join ${g.name}`
    : `${g.name} — collect GHS ${ghs(collect)}`

  const description = [
    collect === null ? null : `Collect GHS ${ghs(collect)} on your day.`,
    from ? `Places from GHS ${ghs(from)} ${g.contribution_frequency}.` : null,
    left > 0 ? `${left} ${left === 1 ? 'spot' : 'spots'} left.` : 'This group is full.',
    'Every payment recorded, every date known in advance.',
  ].filter(Boolean).join(' ')

  return {
    title,
    description,
    // The card image stays the product's, not a per-group render: a generated
    // image per group would need somewhere to render and cache it, and the
    // words above already carry what a recipient needs to decide.
    openGraph: { title, description, type: 'website', images: ['/og.jpg'] },
    twitter:   { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  }
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
