import { MetadataRoute } from 'next'
import { client } from '@/lib/sanityClient'

export const revalidate = 900; // 15 minutes cache

const SITE = 'https://livinginwest.com'

interface SitemapData {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs: SitemapData[] = await client.fetch(
    `*[_type == "blog" && isPublished == true] | order(_updatedAt desc){"slug": slug.current, _updatedAt}`
  )

  const categories: SitemapData[] = await client.fetch(
    `*[_type == "category"]{"slug": slug.current, _updatedAt}`
  )

  const blogEntries = blogs.map((b: SitemapData) => ({
    url: `${SITE}/blog/${b.slug}`,
    lastModified: new Date(b._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const catEntries = categories.map((c: SitemapData) => ({
    url: `${SITE}/category/${c.slug}`,
    lastModified: new Date(c._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // ✅ TOOL PAGES — money pages, high priority
  const toolEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/mortgage-calculator`,    changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/crypto-calculator`,      changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/income-tax-calculator`,  changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/trading-finance`,        changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE}/weather`,                changeFrequency: 'daily',   priority: 0.5 },
  ]

  // ✅ STATIC/TRUST PAGES — low priority
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/categories`,      changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE}/about-us`,        changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/contact-us`,      changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/privacy-policy`,  changeFrequency: 'yearly',  priority: 0.3 },
  ]

  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE}/daily-news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...toolEntries,
    ...blogEntries,
    ...catEntries,
    ...staticEntries,
  ]
}