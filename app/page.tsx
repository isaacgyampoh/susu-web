import Link from 'next/link'
import { SITE, RULES } from '@/lib/site'

const STEPS = [
  { n: '01', t: 'Pick a group',     d: 'Each group has a daily amount, a size, and a cycle length. Pick the one that matches what you can genuinely pay every day.' },
  { n: '02', t: 'Apply',            d: 'Send your details and your Ghana Card, and pay the registration fee. Your fee comes back to you inside your cashout.' },
  { n: '03', t: 'Get your slot',    d: 'Once approved, the system assigns your position in the rotation. You are told your exact collection date up front.' },
  { n: '04', t: 'Pay every day',    d: 'Pay through your portal before 6:00 PM. Every payment is recorded against your name the moment it lands.' },
  { n: '05', t: 'Collect your day', d: 'On your date the whole pot is yours, plus your registration fee back. Then you keep paying until every member has collected.' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <picture>
          <source srcSet="/cover.webp" type="image/webp" />
          <img src="/cover.jpg" alt="" fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/45 to-ink/75" />

        <div className="wrap relative py-24 sm:py-32">
          <p className="text-[13px] font-medium text-white/50 mb-6">Rotating savings · Ghana</p>

          <h1 className="t-hero text-white max-w-[760px]">
            Save daily.
            <br />
            Collect on your day.
          </h1>

          <p className="t-lead !text-white/65 mt-6 max-w-[520px]">
            Everyone in the group pays the same amount every day. One member collects
            the whole pot on their turn — and everyone knows their date before the
            first cedi is paid.
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link href="/plans" className="btn bg-white text-ink hover:bg-white/90">See open groups</Link>
            <Link href="/#how" className="btn border border-white/25 text-white hover:bg-white/10">How it works</Link>
          </div>
        </div>
      </section>

      {/* The arithmetic, stated plainly. This is the whole product. */}
      <section className="border-b border-line">
        <div className="wrap py-16 sm:py-20">
          <p className="t-label mb-8">A cycle, in numbers</p>

          <div className="grid sm:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden border border-line">
            {[
              { k: 'You pay',       v: 'GHS 55', s: 'every day, before 6:00 PM' },
              { k: 'Group size',    v: '11',     s: 'one member collects per turn' },
              { k: 'Each turn',     v: '30 days', s: 'then the next member collects' },
            ].map(({ k, v, s }) => (
              <div key={k} className="bg-surface p-7">
                <p className="t-label">{k}</p>
                <p className="text-[38px] font-semibold tracking-[-.03em] leading-none tnum mt-3">{v}</p>
                <p className="text-[13px] text-ink-3 mt-2.5">{s}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-ink text-white p-7 sm:p-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[12px] font-medium text-white/50">On your day you collect</p>
              <p className="text-[13px] text-white/60 mt-2.5 max-w-[340px]">
                The full pot, plus the GHS 110 registration fee returned to you.
              </p>
            </div>
            <p className="text-[46px] sm:text-[56px] font-semibold tracking-[-.04em] leading-none tnum">
              <span className="text-[20px] align-[.45em] mr-1 text-white/50">GHS</span>16,540
            </p>
          </div>

          <p className="text-[12.5px] text-ink-3 mt-4 max-w-[560px]">
            Figures shown are an example. Each group sets its own amount, size and
            cycle — the exact numbers for every open group are on the groups page.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-line scroll-mt-16">
        <div className="wrap py-16 sm:py-20">
          <h2 className="t-h2 max-w-[520px]">How it works</h2>
          <p className="t-lead mt-4 max-w-[520px]">
            Susu is old. What is new here is the record: every payment, every date,
            every position, written down and visible to you.
          </p>

          <div className="mt-12 divide-y divide-line border-y border-line">
            {STEPS.map(({ n, t, d }) => (
              <div key={n} className="py-7 grid sm:grid-cols-[64px_1fr] gap-3 sm:gap-8">
                <p className="text-[13px] font-medium text-ink-3 tnum pt-0.5">{n}</p>
                <div className="max-w-[620px]">
                  <h3 className="t-h3">{t}</h3>
                  <p className="t-body mt-1.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust — the honest objection, answered */}
      <section className="border-b border-line bg-bg">
        <div className="wrap py-16 sm:py-20">
          <h2 className="t-h2 max-w-[520px]">Why people trust it</h2>

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            {[
              { t: 'Your date is fixed up front', d: 'Your position and collection date are set when the group starts, not decided later. Nobody can move you down the queue.' },
              { t: 'Every payment is recorded',   d: 'Each contribution is written against your name with a timestamp and a reference. You can see your whole history any time.' },
              { t: 'Late is late for everyone',   d: 'The 6:00 PM deadline is enforced by the system, not by a person. The same rule applies to every member of every group.' },
            ].map(({ t, d }) => (
              <div key={t} className="card p-6">
                <h3 className="t-h3">{t}</h3>
                <p className="t-body mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules — surfaced, not buried */}
      <section className="border-b border-line">
        <div className="wrap py-16 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <h2 className="t-h2">Read the rules first</h2>
            <Link href="/rules" className="text-[14px] font-medium text-ink-2 hover:text-ink transition-colors">
              Full rules and regulations
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-px">
            {RULES.slice(0, 6).map(({ r, hard }) => (
              <div key={r} className="py-4 border-b border-line flex gap-3">
                <span className={`text-[12px] font-medium tnum shrink-0 ${hard ? 'text-red' : 'text-ink-3'}`}>
                  {hard ? '!' : '·'}
                </span>
                <p className="text-[14px] leading-relaxed">{r}</p>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-ink-2 mt-8 max-w-[560px]">
            We would rather you did not join than join and default. Defaulting
            forfeits your slot, and the registration fee is not returned.
          </p>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="wrap py-16 sm:py-24 text-center">
          <h2 className="t-h2 max-w-[520px] mx-auto">Ready to join a group?</h2>
          <p className="t-lead mt-4 max-w-[460px] mx-auto">
            Open groups fill on a first-come basis. Once a group is full, the
            rotation starts and it closes to new members.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-9">
            <Link href="/plans" className="btn-dark">See open groups</Link>
            <a href={`https://wa.me/${SITE.whatsapp}`} className="btn-line">Ask a question</a>
          </div>
        </div>
      </section>
    </>
  )
}
