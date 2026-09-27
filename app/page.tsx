import Link from 'next/link'
import { SITE, RULES, waLink } from '@/lib/site'
import { getOpenGroups, isOpen } from '@/lib/groups'
import GroupCard from '@/components/group-card'
import ProductCard from '@/components/product-card'
import { getCatalogue } from '@/lib/products'

/* A real sequence, so the numbering earns its place: each step only happens
   after the one before it. */
const STEPS = [
  { n: '01', t: 'Choose a product',  d: 'Browse what is in stock and open the one you want. Every price is on the page, including what the plan costs in total.' },
  { n: '02', t: 'Pick a payment plan', d: 'Each product has plans of different lengths. Pick the payment you can genuinely make — a longer plan means a smaller payment.' },
  { n: '03', t: 'Open your account', d: 'Your name and phone number. You get a portal where your purchase and its payment dates are waiting.' },
  { n: '04', t: 'Pay it down',       d: 'Pay from your phone whenever a payment is due. Every cedi is recorded against that purchase the moment it lands, and you can see the balance fall.' },
  { n: '05', t: 'Collect it',        d: 'When the balance reaches zero the product is yours. We contact you to arrange collection.' },
]

// Groups come from the console, so this page changes when you create one there.
export const revalidate = 60

export default async function Home() {
  const { products } = await getCatalogue()
  const featured = products.slice(0, 6)
  const groups = await getOpenGroups()
  const open   = groups.filter(isOpen)
  const closed = groups.filter(g => !isOpen(g))

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        {/*
          The same two members, on the same dark field, as both portals and the
          share card. Somebody who applies here and later signs in should not
          feel they have arrived somewhere else.

          `cover.jpg` — an abstract pattern — was here before the photograph
          existed. The scrim runs left-to-right rather than top-to-bottom,
          because the subject sits on the right and the type on the left; a
          vertical wash would grey out the faces it is meant to leave alone.

          Inset from the right edge, not flush to it: flush, the viewport
          boundary sliced down his shoulder and he read as cut off — the same
          mistake the sign-in screen made before it was measured.

          Kept on phones at a smaller height rather than hidden. Most of this
          site's traffic is a phone, and hiding the only photograph there leaves
          the weakest version of the page to the people most likely to see it.
        */}
        <picture>
          <source srcSet="/brand-collection.webp" type="image/webp" />
          <img src="/brand-collection.png" alt="" fetchPriority="high"
            className="absolute bottom-0 right-[2%] sm:right-[4%] w-auto object-contain
                       h-[46%] sm:h-[80%] lg:h-[88%]" />
        </picture>
        {/* One scrim, left to right. A second bottom-up fade was here briefly
            and greyed out the lower half of the photograph — his shirt turned
            to mud — to protect text that does not sit there. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20 sm:to-transparent" />

        <div className="wrap relative py-24 sm:py-32">
          <p className="text-[13px] font-medium text-white/50 mb-6">Pay bit by bit · Ghana</p>

          {/*
            The headline changed with the business. It used to sell the susu,
            because that was the only thing anyone could do here; the shop is
            now the way in, and the rotations are something the owner places
            people into herself.
          */}
          <h1 className="t-hero text-white max-w-[760px]">
            Get what you need.
            <br />
            Pay bit by bit.
          </h1>

          <p className="t-lead !text-white/65 mt-6 max-w-[520px]">
            Fridges, televisions, blenders and more. Choose what you want, pick a
            payment plan that fits what you earn, and pay it down over time. When
            the last payment lands, it is yours.
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link href="/shop" className="btn bg-white text-ink hover:bg-white/90">
              Browse products
            </Link>
            <Link href="/#how" className="btn border border-white/25 text-white hover:bg-white/10">How it works</Link>
          </div>
        </div>
      </section>

      {/* The groups themselves — the product, live from the console */}
      {/*
        Products first. This is what the business now sells to people arriving
        cold, and burying it under the rotations would be arranging the page
        around the older business rather than the current one.
      */}
      {featured.length > 0 && (
        <section id="shop" className="border-b border-line scroll-mt-16">
          <div className="wrap py-16 sm:py-20">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-9">
              <div>
                <h2 className="t-h2">What you can buy</h2>
                <p className="t-lead mt-3 max-w-[480px]">
                  Pay over weeks or months. The full price and the plan total are
                  on every product — nothing is added later.
                </p>
              </div>
              <Link href="/shop" className="text-[14px] font-medium text-ink-2 hover:text-ink transition-colors">
                All products →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/*
        The rotations stay, and stay honest: they are still running and still
        the larger balance on the books. What changed is that joining one is a
        conversation with the owner now, not a form — so this section shows
        what is running and points at WhatsApp rather than at an application.
      */}
      <section id="groups" className="border-b border-line scroll-mt-16">
        <div className="wrap py-16 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-9">
            <div>
              <h2 className="t-h2">Susu groups</h2>
              <p className="t-lead mt-3 max-w-[480px]">
                We still run daily rotations — everyone pays the same amount and
                collects the whole pot on their day. Message us to join one.
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
