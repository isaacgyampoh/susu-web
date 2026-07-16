'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SITE } from '@/lib/site'

const LINKS = [
  { href: '/#how',   label: 'How it works' },
  { href: '/plans',  label: 'Groups' },
  { href: '/rules',  label: 'Rules' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur border-b border-line">
      <div className="wrap h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-[17px] font-semibold tracking-[-.02em]">{SITE.name}</Link>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className="text-[14px] font-medium text-ink-2 hover:text-ink transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a href={SITE.consoleUrl} className="text-[14px] font-medium text-ink-2 hover:text-ink transition-colors mr-3">
            Sign in
          </a>
          <Link href="/plans" className="btn-dark btn-sm">Join a group</Link>
        </div>

        <button onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
          className="md:hidden -mr-1 w-10 h-10 rounded-lg grid place-items-center active:bg-bg transition-colors">
          <span className="flex flex-col gap-[4.5px] w-[18px]">
            <span className={`h-[1.5px] w-full bg-ink rounded-full transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`h-[1.5px] w-full bg-ink rounded-full transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-[1.5px] w-full bg-ink rounded-full transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-surface animate-fade-in">
          <div className="wrap py-4 flex flex-col">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="py-3 text-[15px] font-medium">{label}</Link>
            ))}
            <a href={SITE.consoleUrl} className="py-3 text-[15px] font-medium text-ink-2">Sign in</a>
            <Link href="/plans" className="btn-dark mt-3">Join a group</Link>
          </div>
        </div>
      )}
    </header>
  )
}
