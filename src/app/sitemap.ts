import { MetadataRoute } from 'next'
import { client } from '@/lib/sanityClient'

interface SitemapData {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs: SitemapData[] = await client.fetch(`*[_type == "blog"]{"slug": slug.current, _updatedAt}`)
  const categories: SitemapData[] = await client.fetch(`*[_type == "category"]{"slug": slug.current, _updatedAt}`)

  const blogEntries = blogs.map((b: SitemapData) => ({
    url: `https://livinginwest.com/blog/${b.slug}`,
    lastModified: new Date(b._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const catEntries = categories.map((c: SitemapData) => ({
    url: `https://livinginwest.com/category/${c.slug}`,
    lastModified: new Date(c._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: 'https://livinginwest.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,   // 👈 as const add kiya
      priority: 1,
    },
    {
      url: 'https://livinginwest.com/daily-news',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,   // 👈 as const add kiya
      priority: 0.9,
    },
    ...blogEntries,
    ...catEntries,
  ]
}