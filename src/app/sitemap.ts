import { MetadataRoute } from 'next'
import { client } from '@/lib/sanityClient'

export const revalidate = 900; // 15 minutes cache

const SITE = 'https://livinginwest.com'

interface SitemapData {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // isPublished == true — sirf live posts
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
    ...blogEntries,
    ...catEntries,
  ]
}