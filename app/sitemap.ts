import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // The www host, because the apex 308-redirects to it. A sitemap of URLs that
  // all redirect makes a crawler take an extra hop for every page and splits
  // the signal across two hostnames. Same reason metadataBase names www.
  const base = 'https://www.abbiewealthsusu.com'
  return [
    { url: base,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/plans`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/rules`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
