import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Application pages are per-group and transient — no value in the index
      disallow: ['/join/'],
    },
    sitemap: 'https://susu-web.vercel.app/sitemap.xml',
  }
}
