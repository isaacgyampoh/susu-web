import Link from 'next/link'
import type { SusuGroup } from '@/types'
import { cashoutOf, ghs, isOpen } from '@/lib/groups'

/**
 * A group, presented the way a product is.
 *
 * The figure that matters is what you collect, so it leads. What you pay is
 * secondary and sits underneath. Spots remaining is real scarcity — a group
 * genuinely closes when it fills — so it is stated plainly rather than dressed
 * up.
 */
export default function GroupCard({ g }: { g: SusuGroup }) {
  const cashout = cashoutOf(g)
  const open = isOpen(g)
  const left = g.max_members - g.current_members
  const pct  = Math.round((g.current_members / g.max_members) * 100)

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

      <div className="mt-6">
        <p className="t-label">You collect</p>
        {cashout === null ? (
          <p className="text-[15px] font-medium mt-2">Ask us</p>
        ) : (
          <p className="text-[34px] font-semibold tracking-[-.03em] leading-none tnum mt-2">
            <span className="text-[15px] align-[.45em] mr-0.5 text-ink-3">GHS</span>{ghs(cashout)}
          </p>
        )}
        <p className="text-[12.5px] text-ink-2 mt-2">
          Pay GHS {ghs(g.contribution_amount)} {g.contribution_frequency} · {g.cycle_days}-day turns
        </p>
      </div>

      {/* How full it is — the only honest urgency there is */}
      <div className="mt-5">
        <div className="h-1 bg-bg rounded-full overflow-hidden">
          <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11.5px] text-ink-3 mt-2 tnum">
          {g.current_members} of {g.max_members} members joined
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
