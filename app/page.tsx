import Link from 'next/link'
import { SITE, RULES, waLink } from '@/lib/site'
import { getOpenGroups, isOpen } from '@/lib/groups'
import GroupCard from '@/components/group-card'

const STEPS = [
  { n: '01', t: 'Pick a group',     d: 'Each group has a daily amount, a size, and a cycle length. Pick the one that matches what you can genuinely pay every day.' },
  { n: '02', t: 'Apply',            d: 'Send your details and your Ghana Card, and pay the registration fee.' },
  { n: '03', t: 'Get your slot',    d: 'Once approved, the system assigns your position in the rotation. You are told your exact collection date up front.' },
  { n: '04', t: 'Pay every day',    d: 'Pay through your portal before 6:00 PM. Every payment is recorded against your name the moment it lands.' },
  { n: '05', t: 'Collect your day', d: 'On your date the whole pot is yours. Then you keep paying until every member has collected.' },
]

// Groups come from the console, so this page changes when you create one there.
export const revalidate = 60

export default async function Home() {
  const groups = await getOpenGroups()
  const open   = groups.filter(isOpen)
  const closed = groups.filter(g => !isOpen(g))

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <picture>
          <source srcSet="/cover.webp" type="image/webp" />
          <img src="/cover.jpg" alt="" fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/70 to-ink" />

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
            <Link href="#groups" className="btn bg-white text-ink hover:bg-white/90">
              {open.length > 0 ? `See ${open.length} open ${open.length === 1 ? 'group' : 'groups'}` : 'See groups'}
            </Link>
            <Link href="/#how" className="btn border border-white/25 text-white hover:bg-white/10">How it works</Link>
          </div>
        </div>
      </section>

      {/* The groups themselves — the product, live from the console */}
      <section id="groups" className="border-b border-line scroll-mt-16">
        <div className="wrap py-16 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-9">
            <div>
              <h2 className="t-h2">Open groups</h2>
              <p className="t-lead mt-3 max-w-[480px]">
                Pick what you can pay every single day — not what you hope to pay.
              </p>
            </div>
            {open.length > 0 && (
              <Link href="/plans" className="text-[14px] font-medium text-ink-2 hover:text-ink transition-colors">
                All groups
              </Link>
            )}
          </div>

          {open.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="t-h3">No groups are open right now</p>
              <p className="t-body mt-2 max-w-[400px] mx-auto">
                Groups open as cycles complete. Message us and we will tell you the
                moment the next one starts.
              </p>
              <a href={waLink()} className="btn-dark mt-6">Ask on WhatsApp</a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {open.slice(0, 6).map(g => <GroupCard key={g.id} g={g} />)}
            </div>
          )}

          {closed.length > 0 && open.length > 0 && (
            <p className="t-body mt-8">
              {closed.length} other {closed.length === 1 ? 'group is' : 'groups are'} full or already
              running. <Link href="/plans" className="text-ink font-medium underline underline-offset-4">See all</Link>
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-line scroll-mt-16">
        <div className="wrap py-16 sm:py-20">
          <h2 className="t-h2 max-w-[520px]">How it works</h2>
          <p className="t-lead mt-4 max-w-[560px]">
            Susu has been around for generations but we&apos;ve modernized the experience.
          </p>
          <p className="t-lead mt-3 max-w-[560px]">
            With Abbie Wealth Susu, every payment, transaction, position, and cash-out
            date is securely recorded and available for you to view anytime through
            your personal dashboard.
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

      {/* Trust */}
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

      {/* Rules */}
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
            <Link href="#groups" className="btn-dark">See open groups</Link>
            <a href={waLink()} className="btn-line">Ask a question</a>
          </div>
        </div>
      </section>
    </>
  )
}
