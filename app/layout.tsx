import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

const url = 'https://abbiewealthsusu.com'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: 'Abbie Wealth Susu — Save daily, collect on your day',
    template: '%s · Abbie Wealth Susu',
  },
  description:
    'Abbie Wealth Susu — a trusted rotating savings group in Ghana. Contribute daily, collect the whole pot on your assigned day. Every payment recorded, every date known in advance.',
  keywords: ['susu', 'rotating savings', 'Ghana', 'daily contribution', 'community savings', 'esusu'],
  openGraph: {
    type: 'website', locale: 'en_GH', url, siteName: 'Abbie Wealth Susu',
    title: 'Abbie Wealth Susu — Save daily, collect on your day',
    description: 'Contribute daily, collect the whole pot on your assigned day. Run on a proper ledger.',
  },
  twitter: { card: 'summary_large_image', title: 'Abbie Wealth Susu — Save daily, collect on your day' },
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
