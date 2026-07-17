import type { Metadata } from 'next'
import Link from 'next/link'
import { getOpenGroups, isOpen } from '@/lib/groups'
import GroupCard from '@/components/group-card'
import { waLink } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Open groups',
  description: 'Susu groups currently open to new members. Each sets its own daily amount, size and cycle.',
}

export const revalidate = 60

export default async function Plans() {
  const groups = await getOpenGroups()
  const open   = groups.filter(isOpen)
  const closed = groups.filter(g => !isOpen(g))

  return (
    <div className="wrap py-14 sm:py-20">
      <h1 className="t-h2">Groups</h1>
      <p className="t-lead mt-3 max-w-[520px]">
        Each group sets its own daily amount, size and cycle. Pick what you can pay
        every single day — not what you hope to pay.
      </p>

      {open.length === 0 && closed.length === 0 && (
        <div className="card p-12 mt-10 text-center">
          <p className="t-h3">No groups yet</p>
          <p className="t-body mt-2 max-w-[400px] mx-auto">
            Message us and we will tell you the moment the next one opens.
          </p>
          <a href={waLink()} className="btn-dark mt-6">Ask on WhatsApp</a>
        </div>
      )}

      {open.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {open.map(g => <GroupCard key={g.id} g={g} />)}
        </div>
      )}

      {open.length === 0 && closed.length > 0 && (
        <div className="card p-12 mt-10 text-center">
          <p className="t-h3">Nothing open at the moment</p>
          <p className="t-body mt-2 max-w-[420px] mx-auto">
            Every group is currently full or mid-cycle. New ones open as cycles
            complete.
          </p>
          <a href={waLink()} className="btn-dark mt-6">Tell me when one opens</a>
        </div>
      )}

      {closed.length > 0 && (
        <div className="mt-14">
          <p className="t-label mb-4">Full or already running</p>
          <div className="divide-y divide-line border-y border-line">
            {closed.map(g => (
              <div key={g.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium">{g.name}</p>
                  <p className="text-[12.5px] text-ink-3 tnum">
                    GHS {Number(g.contribution_amount).toLocaleString('en-GH')} {g.contribution_frequency} · {g.current_members}/{g.max_members} members
                  </p>
                </div>
                <span className="text-[12px] font-medium text-ink-3 capitalize shrink-0">{g.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
