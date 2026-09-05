import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

/*
 * The canonical host, and deliberately the www one.
 *
 * The apex 308-redirects here, so pointing metadataBase at the apex made every
 * absolute URL in the head — og:image, og:url, the canonical link — resolve
 * through a redirect. Crawlers mostly follow one, but WhatsApp's is unreliable
 * about it for og:image specifically, and WhatsApp is how this link travels.
 * Naming the host that actually answers 200 removes the hop entirely.
 */
const url = 'https://www.abbiewealthsusu.com'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: 'Abbie Wealth Susu — Save daily, collect on your day',
    template: '%s · Abbie Wealth Susu',
  },
  description:
    'Abbie Wealth Susu — a trusted rotating savings group in Ghana. Contribute daily, collect the whole pot on your assigned day. Every payment recorded, every date known in advance.',
  keywords: ['susu', 'rotating savings', 'Ghana', 'daily contribution', 'community savings', 'esusu'],
  /*
   * ── THE SHARE CARD ──────────────────────────────────────────────────────
   * There was no og:image at all, while twitter.card was already declared
   * summary_large_image — a card type that REQUIRES one. So every share of
   * this link rendered as a bare URL with no picture.
   *
   * That matters more here than it would elsewhere. This site is passed around
   * on WhatsApp, and a savings product arriving as an unadorned link is exactly
   * what a scam looks like. The card carries the same photograph and dark field
   * as the two portals, so the preview looks like the thing it opens.
   */
  openGraph: {
    type: 'website', locale: 'en_GH', url, siteName: 'Abbie Wealth Susu',
    title: 'Abbie Wealth Susu — Save daily, collect on your day',
    description: 'Contribute daily, collect the whole pot on your assigned day. Run on a proper ledger.',
    images: [{
      url: '/og.jpg', width: 1200, height: 630,
      alt: 'Abbie Wealth Susu — save daily, collect on your day',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abbie Wealth Susu — Save daily, collect on your day',
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#101012',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={GeistSans.variable}>
      <body className="flex flex-col min-h-[100dvh]">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
