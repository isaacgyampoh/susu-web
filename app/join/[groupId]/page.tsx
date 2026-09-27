'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { callFunction } from '@/lib/supabase'
import type { SusuGroup } from '@/types'
import { RULES, waLink } from '@/lib/site'
import { portionsOf, placeOf } from '@/lib/groups'

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
  // The registration total an applicant is about to owe. Was
  // registration_fee x slots x fraction; the fee for a place is whatever the
  // group set for that place.
  const totalReg = chosen.reduce(
    (sum, g) => sum + placeOf(g, fracOf(g.id)).registration * slotOf(g.id), 0)
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

    /*
     * The applicant is handed straight to the registration payment page.
     *
     * This used to look for `data.paystack.authorization_url` — a provider
     * removed from the platform long ago. `kyc-submit` never returns that, so
     * the branch was dead and every applicant fell through to "Application
     * received" having paid nothing. Meanwhile the submit button promised
     * "... and pay GHS X registration".
     *
     * `payment_url` carries a capability token that is returned exactly once
     * and is not recoverable, so it is followed immediately. An SMS carries the
     * same link for anyone who closes the tab.
     */
    const { data, error } = await callFunction<{
      kyc_id: string; fee: number; fee_paid: boolean
      payment_url: string | null; payment_link_expires_at: string | null
    }>('kyc-submit', { method: 'POST', body: fd })
    setBusy(false)
    if (error) { setErr(error); return }
    if (data?.payment_url) { window.location.href = data.payment_url; return }
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
              {/*
                ── THE NUMBERS AN APPLICANT COMMITS TO ────────────────────
                All three of these used to be a multiplication:
                contribution x slots x fraction, registration x slots x
                fraction, cashout x fraction. That was right when a fraction
                decided the money and is wrong now — a group states what each
                place costs and pays, and a half need not be half.

                This is the screen where somebody agrees to pay daily for
                months. Showing a figure derived by the browser rather than the
                one the group actually set is the last place to do it, so each
                comes from the chosen portion. Only the SLOT COUNT is multiplied
                here, because taking three places genuinely costs three times
                one place.
              */}
              {(() => {
                const gsel = chosen[0]
                const n    = slotOf(gsel.id)
                const { pay, registration: reg, collect: get } = placeOf(gsel, fracOf(gsel.id))
                return [
                ['You pay',      `GHS ${ghs(pay * n)}`, n > 1 || fracOf(gsel.id) < 1 ? `every day · ${n} ${fracLbl(gsel.id)} slot${n > 1 ? 's' : ''}` : 'every day'],
                ['Deadline',     (gsel.payment_deadline ?? '18:00').slice(0, 5), 'daily'],
                ['Registration', `GHS ${ghs(reg * n)}`, 'one-time, non-refundable'],
                ['You collect',  get == null ? 'Ask us' : `GHS ${ghs(get)}`, n > 1 ? `per slot · ${n} payout turns` : 'on your date'],
              ]})().map(([k, v, s]) => (
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
                    pay GHS {ghs(placeOf(g, fracOf(g.id)).pay * slotOf(g.id))} daily → collect{' '}
                    {placeOf(g, fracOf(g.id)).collect == null
                      ? 'ask us'
                      : `GHS ${ghs(placeOf(g, fracOf(g.id)).collect!)}`}{slotOf(g.id) > 1 ? ` × ${slotOf(g.id)}` : ''}
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

      {/*
        ── JOINING IS A CONVERSATION NOW ──────────────────────────────────────
        This page used to carry the whole application: identity, Ghana Card
        photographs, group selection, registration fee. The owner places people
        into rotations herself now, so a self-service form here would create
        applications nobody is waiting for and collect ID the business did not
        ask for.

        The route stays, because these links are already shared on WhatsApp and
        a dead one is worse than a redirected one. What it does is show the
        group honestly and hand the reader to the person who can actually place
        them.
      */}
      <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="t-h3">To join this group, message us</h2>
        <p className="t-body mt-2 max-w-[520px]">
          Places in a rotation are arranged personally, so we can check the
          group still has room and that the daily amount suits you. Send us a
          message and we will set you up and send your portal details.
        </p>
        <a href={waLink()} className="btn-dark mt-6 inline-flex">Message us on WhatsApp</a>

        <p className="text-[13px] text-ink-2 mt-8 pt-6 border-t border-line leading-relaxed">
          Looking to buy something and pay for it gradually instead?{' '}
          <Link href="/shop" className="text-ink font-medium underline underline-offset-4">
            Browse the products
          </Link>{' '}
          — that you can start yourself, right now.
        </p>
      </div>
    </div>
  )
}
