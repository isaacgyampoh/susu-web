import Link from 'next/link'
import type { SusuGroup } from '@/types'
import { cashoutOf, ghs, isOpen, portionsOf, cheapestEntry } from '@/lib/groups'

/**
 * A group, presented the way a product is.
 *
 * ────────────────────────────────────────────────────────────────────────
 * The figure that matters is what you collect, so it leads. Spots remaining is
 * real scarcity — a group genuinely closes when it fills — so it is stated
 * plainly rather than dressed up.
 *
 * ── THE SMALLER PLACES ──────────────────────────────────────────────────
 *
 * This card used to advertise the full place only. A group asking GHS 288 a day
 * also sells a quarter place at GHS 72, and somebody who could afford the
 * quarter read the card, saw 288, and left. The whole reason portions became
 * configuration rather than a multiplication is that they are a real product;
 * not showing them was turning people away from something we sell.
 *
 * Every figure here is the group's own. A half place is whatever that group
 * says a half place costs and pays — it need not be half of anything — so
 * nothing on this card is multiplied or derived. A group with no portions
 * configured shows the full figures exactly as before.
 */
export default function GroupCard({ g }: { g: SusuGroup }) {
  const cashout = cashoutOf(g)
  const open    = isOpen(g)
  const left    = g.max_members - g.current_members
  const pct     = Math.round((g.current_members / g.max_members) * 100)

  const portions = portionsOf(g)
  const full     = portions.find(p => Number(p.fraction) === 1) ?? null
  const smaller  = portions.filter(p => Number(p.fraction) !== 1)
  const from     = cheapestEntry(g)

  // The full place's own figures where configured; the group's otherwise.
  const headline = full ? Number(full.payout_amount) : cashout
  const fullDay  = full ? Number(full.contribution_amount) : Number(g.contribution_amount)

  return (
    <div className="card p-6 flex flex-col hover:border-ink/25 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="t-h3">{g.name}</h3>
        {open ? (
          <span className="text-[11.5px] font-medium text-ink-2 bg-bg border border-line rounded-md px-2 py-0.5 shrink-0 whitespace-nowrap">
            {left} {left === 1 ? 'spot' : 'spots'} left
          </span>
        ) : (
          <span className="text-[11.5px] font-medium text-ink-3 shrink-0 capitalize">{g.status}</span>
        )}
      </div>

      {g.description && <p className="t-body mt-1.5 line-clamp-2">{g.description}</p>}

      {/* What a full place collects. The aspirational figure, and the honest one. */}
      <div className="mt-6">
        <p className="t-label">You collect</p>
        {headline === null ? (
          <p className="text-[15px] font-medium mt-2">Ask us</p>
        ) : (
          <p className="text-[34px] font-semibold tracking-[-.03em] leading-none tnum mt-2">
            <span className="text-[15px] align-[.45em] mr-0.5 text-ink-3">GHS</span>{ghs(headline)}
          </p>
        )}
        <p className="text-[12.5px] text-ink-2 mt-2">
          for a full place at GHS {ghs(fullDay)} {g.contribution_frequency}
          {g.cycle_days ? ` · ${g.cycle_days}-day turns` : ''}
        </p>
      </div>

      {/* The part that lets somebody in who could not afford a whole slot. */}
      {smaller.length > 0 && (
        <div className="mt-5 pt-5 border-t border-line">
          <p className="t-label">Or take a smaller place</p>
          <dl className="mt-3 space-y-2">
            {smaller.map(p => (
              <div key={p.id} className="flex items-baseline gap-3">
                <dt className="text-[13px] font-medium text-ink w-[58px] shrink-0">{p.label}</dt>
                <dd className="text-[13px] text-ink-2 tnum flex-1 min-w-0 truncate">
                  GHS {ghs(p.contribution_amount)} {g.contribution_frequency}
                </dd>
                <dd className="text-[13px] font-semibold text-accent tnum shrink-0">
                  GHS {ghs(p.payout_amount)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* How full it is — the only honest urgency there is */}
      <div className="mt-5">
        <div className="h-1 bg-bg rounded-full overflow-hidden">
          <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11.5px] text-ink-3 mt-2 tnum">
          {g.current_members} of {g.max_members} members joined
          {from !== null && from < fullDay && (
            <> · from GHS {ghs(from)} {g.contribution_frequency}</>
          )}
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-line">
        {open ? (
          <Link href={`/join/${g.id}`} className="btn-dark w-full">Apply for this group</Link>
        ) : (
          <p className="text-[12.5px] text-ink-3 text-center py-3">
            {g.status === 'full' ? 'This group is full' : 'Cycle in progress'}
          </p>
        )}
      </div>
    </div>
  )
}
