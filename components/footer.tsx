import Link from 'next/link'
import { SITE } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="wrap py-12">
        <div className="flex flex-wrap gap-10 justify-between">
          <div className="max-w-[300px]">
            <p className="text-[17px] font-semibold tracking-[-.02em]">{SITE.name}</p>
            <p className="t-body mt-2">{SITE.tagline}</p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <div>
              <p className="t-label mb-3">{SITE.name}</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/#how"  className="text-[14px] text-ink-2 hover:text-ink transition-colors">How it works</Link>
                <Link href="/plans" className="text-[14px] text-ink-2 hover:text-ink transition-colors">Open groups</Link>
                <Link href="/rules" className="text-[14px] text-ink-2 hover:text-ink transition-colors">Rules</Link>
              </div>
            </div>
            <div>
              <p className="t-label mb-3">Contact</p>
              <div className="flex flex-col gap-2.5">
                <a href={`https://wa.me/${SITE.whatsapp}`} className="text-[14px] text-ink-2 hover:text-ink transition-colors">WhatsApp</a>
                <a href={`mailto:${SITE.email}`} className="text-[14px] text-ink-2 hover:text-ink transition-colors">Email</a>
                <a href={SITE.memberUrl} className="text-[14px] text-ink-2 hover:text-ink transition-colors">Member sign in</a>
                <a href={SITE.consoleUrl} className="text-[14px] text-ink-2 hover:text-ink transition-colors">Admin sign in</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-line flex flex-wrap gap-3 justify-between">
          <p className="text-[12.5px] text-ink-3">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="text-[12.5px] text-ink-3">Contributions close 6:00 PM daily. Late payments are flagged.</p>
        </div>
      </div>
    </footer>
  )
}
