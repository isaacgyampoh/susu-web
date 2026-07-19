'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { callFunction } from '@/lib/supabase'
import type { SusuGroup } from '@/types'
import { RULES, SITE, waLink } from '@/lib/site'

const ghs = (n: any) => Number(n ?? 0).toLocaleString('en-GH', { maximumFractionDigits: 0 })

export default function Join() {
  const { groupId }  = useParams<{ groupId: string }>()
  const params       = useSearchParams()
  const [groups, setGroups] = useState<SusuGroup[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [slotsFor, setSlotsFor] = useState<Record<string, number>>({})
  const [fracFor, setFracFor]   = useState<Record<string, number>>({})
  const [loading, setL]   = useState(true)
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')
  const [done, setDone]   = useState(false)

  const [agreed, setAgreed] = useState<boolean[]>(new Array(RULES.length).fill(false))

  const [f, setF] = useState({
    full_name: '', phone: '', email: '', date_of_birth: '', occupation: '',
    residential_address: '', ghana_card_number: '',
    mobile_money_number: '', mobile_money_provider: 'MTN',
  })
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (params.get('ref')?.startsWith('KYC-')) { setDone(true); setL(false); return }
    callFunction<{ groups: SusuGroup[] }>('groups-public').then(({ data }) => {
      const open = (data?.groups ?? []).filter(g => g.current_members < g.max_members)
      setGroups(open)
      // The group whose card they clicked arrives pre-ticked
      if (open.some(g => g.id === groupId)) setPicked(new Set([groupId]))
      setL(false)
    })
  }, [groupId, params])

  const toggle = (id: string) =>
    setPicked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const chosen   = groups.filter(g => picked.has(g.id))
  const slotOf   = (id: string) => slotsFor[id] || 1
  const fracOf   = (id: string) => fracFor[id] ?? 1
  const fracLbl  = (id: string) => fracOf(id) === 0.25 ? 'quarter' : fracOf(id) === 0.5 ? 'half' : 'full'
  const totalReg = chosen.reduce((s, g) => s + Number(g.registration_fee || 0) * slotOf(g.id) * fracOf(g.id), 0)
  const totalSlots = chosen.reduce((s, g) => s + slotOf(g.id), 0)
  const allAgreed = agreed.every(Boolean)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (chosen.length === 0) { setErr('Tick at least one group to join.'); return }
    if (!allAgreed) { setErr('Please tick every rule to continue.'); return }
    setBusy(true); setErr('')

    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => v && fd.append(k, v))
    fd.append('selected_groups', JSON.stringify(chosen.map(g => ({ id: g.id, slots: slotsFor[g.id] || 1, fraction: fracFor[g.id] ?? 1 }))))
    fd.append('selected_group_ids', chosen.map(g => g.id).join(','))

    const { data, error } = await callFunction<{ paystack?: { authorization_url: string } }>(
      'kyc-submit', { method: 'POST', body: fd }
    )
    setBusy(false)
    if (error) { setErr(error); return }
    if (data?.paystack?.authorization_url) { window.location.href = data.paystack.authorization_url; return }
    setDone(true)
  }

  if (loading) return <div className="wrap py-20"><p className="t-body">Loading…</p></div>

  if (done) return (
    <div className="wrap py-20 max-w-[520px]">
      <h1 className="t-h2">Application received</h1>
      <p className="t-lead mt-4">
        We will review your details, usually within 24 hours.
      </p>
      <p className="t-lead mt-4">
        If you are approved we will send you a <strong className="text-ink font-medium">WhatsApp
        message</strong> on {f.phone || 'the number you gave us'} containing your
        private portal link, your member ID and your passcode. That link is how
        you sign in — it is not on this website, and it is yours alone. Keep your
        passcode private.
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/" className="btn-dark">Back to home</Link>
        <a href={waLink()} className="btn-line">Message us</a>
      </div>
    </div>
  )

  if (groups.length === 0) return (
    <div className="wrap py-20 max-w-[520px]">
      <h1 className="t-h2">No groups are open right now</h1>
      <p className="t-lead mt-3">They may have filled up and closed. Check back soon, or message us.</p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/plans" className="btn-dark">See groups</Link>
        <a href={waLink()} className="btn-line">Message us</a>
      </div>
    </div>
  )

  return (
    <div className="wrap py-14 sm:py-16 max-w-[720px]">
      <Link href="/plans" className="text-[13.5px] font-medium text-ink-2 hover:text-ink transition-colors">
        Back to groups
      </Link>

      {/* What they're committing to, restated before they commit.
          One group reads like a plan; several read like a portfolio. */}
      <div className="card p-6 mt-5 bg-ink border-ink text-white">
        <p className="text-[12px] font-medium text-white/50">
          {chosen.length > 1 ? `Applying to ${chosen.length} groups` : 'Applying to'}
        </p>
        {chosen.length === 0 ? (
          <h1 className="text-[24px] font-semibold tracking-[-.02em] mt-1">Choose your group below</h1>
        ) : chosen.length === 1 ? (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-.02em] mt-1">{chosen[0].name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6">
              {[
                ['You pay',      `GHS ${ghs(Number(chosen[0].contribution_amount) * slotOf(chosen[0].id) * fracOf(chosen[0].id))}`, slotOf(chosen[0].id) > 1 || fracOf(chosen[0].id) < 1 ? `every day · ${slotOf(chosen[0].id)} ${fracLbl(chosen[0].id)} slot${slotOf(chosen[0].id) > 1 ? 's' : ''}` : 'every day'],
                ['Deadline',     (chosen[0].payment_deadline ?? '18:00').slice(0, 5), 'daily'],
                ['Registration', `GHS ${ghs(Number(chosen[0].registration_fee) * slotOf(chosen[0].id) * fracOf(chosen[0].id))}`, 'one-time, non-refundable'],
                ['You collect',  chosen[0].cashout_amount == null ? 'Ask us' : `GHS ${ghs(Number(chosen[0].cashout_amount) * fracOf(chosen[0].id))}`, slotOf(chosen[0].id) > 1 ? `per slot · ${slotOf(chosen[0].id)} payout turns` : 'on your date'],
              ].map(([k, v, s]) => (
                <div key={k as string}>
                  <p className="text-[11.5px] text-white/45">{k}</p>
                  <p className="text-[17px] font-semibold tnum mt-1">{v}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mt-3 divide-y divide-white/10">
              {chosen.map(g => (
                <div key={g.id} className="py-3 flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-semibold">{g.name}{slotOf(g.id) > 1 || fracOf(g.id) < 1 ? ` × ${slotOf(g.id)} ${fracLbl(g.id)} slot${slotOf(g.id) > 1 ? 's' : ''}` : ''}</p>
                  <p className="text-[12.5px] text-white/60 tnum text-right">
                    pay GHS {ghs(Number(g.contribution_amount) * slotOf(g.id) * fracOf(g.id))} daily → collect{' '}
                    {g.cashout_amount == null ? 'ask us' : `GHS ${ghs(Number(g.cashout_amount) * fracOf(g.id))}`}{slotOf(g.id) > 1 ? ` × ${slotOf(g.id)}` : ''}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/15 flex items-baseline justify-between">
              <p className="text-[12px] text-white/50">Registration total — one-time, non-refundable</p>
              <p className="text-[17px] font-semibold tnum">GHS {ghs(totalReg)}</p>
            </div>
          </>
        )}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-8">
        {err && <p className="text-[13.5px] text-red bg-red-50 border border-red/25 rounded-xl px-4 py-3">{err}</p>}

        {/* You can join more than one group. Each has its own contributions
            and its own payout day. */}
        <section>
          <h2 className="t-h3 mb-1">Your group{groups.length > 1 ? 's' : ''}</h2>
          <p className="t-body mb-4">
            Tick every group you want to join, and take more than one slot in a group if you want multiple payout turns. Each slot runs separately with its own payout.
          </p>
          <div className="space-y-2.5">
            {groups.map(g => {
              const on = picked.has(g.id)
              const spots = g.max_members - g.current_members
              return (
                <label key={g.id}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    on ? 'border-ink bg-bg' : 'border-line hover:border-ink/40'}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(g.id)}
                    className="mt-1 w-4 h-4 accent-ink shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[14.5px] font-semibold">{g.name}</span>
                      <span className="text-[12px] text-ink-3 shrink-0">{spots} spot{spots === 1 ? '' : 's'} left</span>
                    </span>
                    <span className="block text-[13px] text-ink-2 mt-0.5 tnum">
                      Pay GHS {ghs(g.contribution_amount)} daily · collect{' '}
                      {g.cashout_amount == null ? 'ask us' : `GHS ${ghs(g.cashout_amount)}`} · registration GHS {ghs(g.registration_fee)}
                    </span>
                    {on && (
                      <span className="flex items-center gap-2 mt-2.5 flex-wrap" onClick={e => e.preventDefault()}>
                        <span className="text-[12.5px] text-ink-2 w-full">Slot size — a half slot pays half the daily amount and collects half the cashout:</span>
                        {([[0.25, '¼ Quarter'], [0.5, '½ Half'], [1, 'Full']] as [number, string][]).map(([f, lbl]) => (
                          <button key={f} type="button"
                            onClick={e => { e.stopPropagation(); setFracFor(prev => ({ ...prev, [g.id]: f })) }}
                            className={`px-3 h-9 rounded-lg text-[13px] font-semibold transition-colors ${
                              fracOf(g.id) === f ? 'bg-ink text-white' : 'border border-line text-ink-2 hover:border-ink/40'}`}>
                            {lbl}
                          </button>
                        ))}
                        <span className="text-[12.5px] text-ink-2 w-full mt-1">How many slots?</span>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button"
                            onClick={e => { e.stopPropagation(); setSlotsFor(prev => ({ ...prev, [g.id]: n })) }}
                            disabled={g.current_members + n > g.max_members}
                            className={`w-9 h-9 rounded-lg text-[14px] font-semibold transition-colors disabled:opacity-30 ${
                              slotOf(g.id) === n ? 'bg-ink text-white' : 'border border-line text-ink-2 hover:border-ink/40'}`}>
                            {n}
                          </button>
                        ))}
                        <span className="text-[11.5px] text-ink-3 w-full">
                          Each slot is its own plan — its own daily payment and its own payout turn.
                        </span>
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="t-h3 mb-4">Your details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="in-lbl">Full name — exactly as on your Ghana Card</label>
              <input className="in" required value={f.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div>
              <label className="in-lbl">Phone number</label>
              <input className="in tnum" type="tel" required inputMode="tel"
                value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="024 000 0000" />
            </div>
            <div>
              <label className="in-lbl">Date of birth</label>
              <input className="in" type="date" required value={f.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div>
              <label className="in-lbl">Ghana Card number</label>
              <input className="in" required value={f.ghana_card_number}
                onChange={e => set('ghana_card_number', e.target.value)} placeholder="GHA-XXXXXXXXX-X" />
            </div>
            <div>
              <label className="in-lbl">Occupation</label>
              <input className="in" required value={f.occupation} onChange={e => set('occupation', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="in-lbl">Residential address</label>
              <input className="in" required value={f.residential_address} onChange={e => set('residential_address', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="in-lbl">Email <span className="font-normal text-ink-3">— optional</span></label>
              <input className="in" type="email" value={f.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="t-h3 mb-1">Mobile money</h2>
          <p className="t-body mb-4">Where your cashout is sent on your day.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="in-lbl">Provider</label>
              <select className="in" value={f.mobile_money_provider} onChange={e => set('mobile_money_provider', e.target.value)}>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AirtelTigo">AirtelTigo Money</option>
              </select>
            </div>
            <div>
              <label className="in-lbl">Number</label>
              <input className="in tnum" type="tel" required inputMode="tel"
                value={f.mobile_money_number} onChange={e => set('mobile_money_number', e.target.value)} placeholder="024 000 0000" />
            </div>
          </div>
        </section>

        {/* Every rule ticked individually. A single blanket checkbox is how people
            end up saying they never agreed to anything. */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <h2 className="t-h3">The rules</h2>
            <button type="button" onClick={() => setAgreed(new Array(RULES.length).fill(true))}
              className="text-[12.5px] font-medium text-ink-2 hover:text-ink transition-colors">Tick all</button>
          </div>
          <p className="t-body mb-4">Tick each one. You are agreeing to each separately.</p>

          <div className="divide-y divide-line border-y border-line">
            {RULES.map(({ r, hard }, i) => (
              <label key={r} className="flex gap-3 py-3.5 cursor-pointer">
                <input type="checkbox" checked={agreed[i]}
                  onChange={() => setAgreed(a => { const n = [...a]; n[i] = !n[i]; return n })}
                  className="mt-1 w-4 h-4 accent-ink shrink-0" />
                <span className="text-[14px] leading-relaxed">
                  {r}{hard && <span className="text-red font-medium"> ·  strictly enforced</span>}
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <button type="submit" disabled={busy || !allAgreed || chosen.length === 0} className="btn-dark w-full">
            {busy ? 'Submitting…'
              : chosen.length === 0 ? 'Tick at least one group to continue'
              : !allAgreed ? 'Tick every rule to continue'
              : totalReg > 0
                ? `Apply for ${totalSlots} slot${totalSlots > 1 ? 's' : ''} and pay GHS ${ghs(totalReg)} registration`
                : `Apply for ${totalSlots} slot${totalSlots > 1 ? 's' : ''}`}
          </button>
          <p className="text-[12.5px] text-ink-3 mt-3 text-center">
            The registration fee is not refunded. It is returned to you inside your cashout on your day.
          </p>
        </div>
      </form>
    </div>
  )
}
