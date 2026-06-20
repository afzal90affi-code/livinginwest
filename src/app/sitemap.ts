import { MetadataRoute } from 'next'
import { client } from '@/lib/sanityClient'

// 👇 Type define kiya (any hata diya)
interface SitemapData {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sanity se sirf slugs aur update time fetch karo
  const blogs: SitemapData[] = await client.fetch(`*[_type == "blog"]{"slug": slug.current, _updatedAt}`)
  const categories: SitemapData[] = await client.fetch(`*[_type == "category"]{"slug": slug.current, _updatedAt}`)

  // Blog URLs banao
  const blogEntries = blogs.map((b: SitemapData) => ({
    url: `https://livinginwest.com/blog/${b.slug}`, // 👈 Apni domain daalo
    lastModified: new Date(b._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category URLs banao
  const catEntries = categories.map((c: SitemapData) => ({
    url: `https://livinginwest.com/category/${c.slug}`, // 👈 Apni domain daalo
    lastModified: new Date(c._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: 'https://livinginwest.com', // 👈 Apni domain daalo
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogEntries,
    ...catEntries,
  ]
}