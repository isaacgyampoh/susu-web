import type { Metadata } from 'next'
import Link from 'next/link'
import { RULES, SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Rules and regulations',
  description: 'The rules every Susu member agrees to before joining a group. Read them before you apply.',
}

export default function Rules() {
  return (
    <div className="wrap py-14 sm:py-20 max-w-[720px]">
      <h1 className="t-h2">Rules and regulations</h1>
      <p className="t-lead mt-3">
        These apply to every member of every group. By applying, you agree to all
        of them. There are no exceptions and no side arrangements.
      </p>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {RULES.map(({ r, hard }, i) => (
          <div key={r} className="py-5 flex gap-4">
            <span className="text-[12.5px] font-medium text-ink-3 tnum shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <p className="text-[15px] leading-relaxed">{r}</p>
              {hard && <p className="text-[12px] text-red font-medium mt-1">Strictly enforced</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-10 border-red/30 bg-red-50">
        <h2 className="t-h3">Before you apply</h2>
        <p className="text-[14px] leading-relaxed text-ink-2 mt-2">
          A susu only works because every member pays every day. If you miss
          payments, someone else's collection date is at risk — not just yours.
          That is why defaulting forfeits your slot and the registration fee is
          not returned. If you are not certain you can pay every day for the full
          cycle, please do not apply.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-10">
        <Link href="/plans" className="btn-dark">I understand — show me the groups</Link>
        <a href={`https://wa.me/${SITE.whatsapp}`} className="btn-line">Ask a question first</a>
      </div>
    </div>
  )
}
