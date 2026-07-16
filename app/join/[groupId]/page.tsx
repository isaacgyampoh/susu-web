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
  const [group, setGroup] = useState<SusuGroup | null>(null)
  const [loading, setL]   = useState(true)
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')
  const [done, setDone]   = useState(false)

  const [front, setFront] = useState<File | null>(null)
  const [back, setBack]   = useState<File | null>(null)
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
      setGroup(data?.groups?.find(g => g.id === groupId) ?? null); setL(false)
    })
  }, [groupId, params])

  const allAgreed = agreed.every(Boolean)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!allAgreed) { setErr('Please tick every rule to continue.'); return }
    if (!front || !back) { setErr('Please upload both sides of your Ghana Card.'); return }
    setBusy(true); setErr('')

    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => v && fd.append(k, v))
    fd.append('selected_group_id', groupId)
    fd.append('ghana_card_front', front)
    fd.append('ghana_card_back', back)

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
        We will review your details and your Ghana Card, usually within 24 hours.
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

  if (!group) return (
    <div className="wrap py-20 max-w-[520px]">
      <h1 className="t-h2">Group not found</h1>
      <p className="t-lead mt-3">It may have filled up and closed.</p>
      <Link href="/plans" className="btn-dark mt-8">See open groups</Link>
    </div>
  )

  const cashout = Number(group.cashout_amount ?? group.contribution_amount * group.max_members * group.cycle_days)
  const total   = cashout + Number(group.registration_fee ?? 0)
  const field   = 'in'

  return (
    <div className="wrap py-14 sm:py-16 max-w-[720px]">
      <Link href="/plans" className="text-[13.5px] font-medium text-ink-2 hover:text-ink transition-colors">
        Back to groups
      </Link>

      {/* What they're committing to, restated before they commit */}
      <div className="card p-6 mt-5 bg-ink border-ink text-white">
        <p className="text-[12px] font-medium text-white/50">Applying to</p>
        <h1 className="text-[24px] font-semibold tracking-[-.02em] mt-1">{group.name}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6">
          {[
            ['You pay',     `GHS ${ghs(group.contribution_amount)}`, 'every day'],
            ['Deadline',    (group.payment_deadline ?? '18:00').slice(0, 5), 'daily'],
            ['Registration', `GHS ${ghs(group.registration_fee)}`, 'returned on your day'],
            ['You collect', `GHS ${ghs(total)}`, 'on your date'],
          ].map(([k, v, s]) => (
            <div key={k}>
              <p className="text-[11.5px] text-white/45">{k}</p>
              <p className="text-[17px] font-semibold tnum mt-1">{v}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-8">
        {err && <p className="text-[13.5px] text-red bg-red-50 border border-red/25 rounded-xl px-4 py-3">{err}</p>}

        <section>
          <h2 className="t-h3 mb-4">Your details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="in-lbl">Full name — exactly as on your Ghana Card</label>
              <input className={field} required value={f.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div>
              <label className="in-lbl">Phone number</label>
              <input className={`${field} tnum`} type="tel" required inputMode="tel"
                value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="024 000 0000" />
            </div>
            <div>
              <label className="in-lbl">Date of birth</label>
              <input className={field} type="date" required value={f.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div>
              <label className="in-lbl">Ghana Card number</label>
              <input className={field} required value={f.ghana_card_number}
                onChange={e => set('ghana_card_number', e.target.value)} placeholder="GHA-XXXXXXXXX-X" />
            </div>
            <div>
              <label className="in-lbl">Occupation</label>
              <input className={field} required value={f.occupation} onChange={e => set('occupation', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="in-lbl">Residential address</label>
              <input className={field} required value={f.residential_address} onChange={e => set('residential_address', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="in-lbl">Email <span className="font-normal text-ink-3">— optional</span></label>
              <input className={field} type="email" value={f.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="t-h3 mb-1">Ghana Card</h2>
          <p className="t-body mb-4">A clear photo of both sides. We use this to verify who you are.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Front', front, setFront], ['Back', back, setBack]].map(([label, file, setter]: any) => (
              <label key={label} className="border border-dashed border-line rounded-xl h-28 grid place-items-center cursor-pointer hover:border-ink transition-colors bg-bg px-4">
                {file
                  ? <span className="text-[13px] font-medium text-center break-all">{file.name}</span>
                  : <span className="text-[13.5px] text-ink-3">Upload {label.toLowerCase()}</span>}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setter(e.target.files?.[0] ?? null)} />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="t-h3 mb-1">Mobile money</h2>
          <p className="t-body mb-4">Where your cashout is sent on your day.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="in-lbl">Provider</label>
              <select className={field} value={f.mobile_money_provider} onChange={e => set('mobile_money_provider', e.target.value)}>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AirtelTigo">AirtelTigo Money</option>
              </select>
            </div>
            <div>
              <label className="in-lbl">Number</label>
              <input className={`${field} tnum`} type="tel" required inputMode="tel"
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
          <button type="submit" disabled={busy || !allAgreed} className="btn-dark w-full">
            {busy ? 'Submitting…'
              : !allAgreed ? 'Tick every rule to continue'
              : `Apply and pay GHS ${ghs(group.registration_fee)} registration`}
          </button>
          <p className="text-[12.5px] text-ink-3 mt-3 text-center">
            The registration fee is not refunded. It is returned to you inside your cashout on your day.
          </p>
        </div>
      </form>
    </div>
  )
}
