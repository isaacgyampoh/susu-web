'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { callFunction } from '@/lib/supabase'
import type { SusuGroup } from '@/types'
import { SITE } from '@/lib/site'

const ghs = (n: any) => Number(n ?? 0).toLocaleString('en-GH', { maximumFractionDigits: 0 })

export default function Plans() {
  const [groups, setGroups] = useState<SusuGroup[]>([])
  const [loading, setL]     = useState(true)
  const [err, setErr]       = useState('')

  useEffect(() => {
    callFunction<{ groups: SusuGroup[] }>('groups-public')
      .then(({ data, error }) => { if (error) setErr(error); else setGroups(data?.groups ?? []) })
      .finally(() => setL(false))
  }, [])

  const open = groups.filter(g => g.status === 'open' && g.current_members < g.max_members)
  const shut = groups.filter(g => !(g.status === 'open' && g.current_members < g.max_members))

  return (
    <div className="wrap py-14 sm:py-20">
      <h1 className="t-h2">Open groups</h1>
      <p className="t-lead mt-3 max-w-[520px]">
        Each group sets its own daily amount, size and cycle. Pick what you can pay
        every single day — not what you hope to pay.
      </p>

      {loading && <p className="t-body mt-12">Loading groups…</p>}
      {err && <p className="text-[14px] text-red mt-12">{err}</p>}

      {!loading && !err && groups.length === 0 && (
        <div className="card p-10 mt-10 text-center">
          <p className="t-h3">No groups are open right now</p>
          <p className="t-body mt-2 max-w-[380px] mx-auto">
            Groups open as cycles complete. Message us and we will tell you when the next one starts.
          </p>
          <a href={`https://wa.me/${SITE.whatsapp}`} className="btn-dark btn-sm mt-6">Ask on WhatsApp</a>
        </div>
      )}

      {open.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {open.map(g => {
            const left    = g.max_members - g.current_members
            const cashout = Number(g.cashout_amount ?? g.contribution_amount * g.max_members * g.cycle_days)
            const total   = cashout + Number(g.registration_fee ?? 0)
            return (
              <div key={g.id} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="t-h3">{g.name}</h2>
                  <span className="text-[11.5px] font-medium text-ink-2 bg-bg border border-line rounded-md px-2 py-0.5 shrink-0">
                    {left} left
                  </span>
                </div>
                {g.description && <p className="t-body mt-1.5">{g.description}</p>}

                <div className="mt-5 pt-5 border-t border-line">
                  <p className="t-label">You collect</p>
                  <p className="text-[30px] font-semibold tracking-[-.03em] leading-none tnum mt-2">
                    <span className="text-[14px] align-[.45em] mr-0.5 text-ink-3">GHS</span>{ghs(total)}
                  </p>
                  <p className="text-[12px] text-ink-3 mt-2">includes GHS {ghs(g.registration_fee)} registration fee back</p>
                </div>

                <table className="w-full mt-5">
                  <tbody className="divide-y divide-line border-t border-line">
                    <tr><td className="py-2.5 text-[13px] text-ink-2">Daily</td>
                        <td className="py-2.5 text-right text-[13.5px] font-medium tnum">GHS {ghs(g.contribution_amount)}</td></tr>
                    <tr><td className="py-2.5 text-[13px] text-ink-2">Members</td>
                        <td className="py-2.5 text-right text-[13.5px] font-medium tnum">{g.max_members}</td></tr>
                    <tr><td className="py-2.5 text-[13px] text-ink-2">Each turn</td>
                        <td className="py-2.5 text-right text-[13.5px] font-medium tnum">{g.cycle_days} days</td></tr>
                    <tr><td className="py-2.5 text-[13px] text-ink-2">Deadline</td>
                        <td className="py-2.5 text-right text-[13.5px] font-medium tnum">{(g.payment_deadline ?? '18:00').slice(0,5)}</td></tr>
                  </tbody>
                </table>

                <Link href={`/join/${g.id}`} className="btn-dark mt-6">Apply for this group</Link>
              </div>
            )
          })}
        </div>
      )}

      {shut.length > 0 && (
        <div className="mt-14">
          <p className="t-label mb-4">Closed — full or already running</p>
          <div className="divide-y divide-line border-y border-line">
            {shut.map(g => (
              <div key={g.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium">{g.name}</p>
                  <p className="text-[12.5px] text-ink-3 tnum">
                    GHS {ghs(g.contribution_amount)} {g.contribution_frequency} · {g.current_members}/{g.max_members} members
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
