import { MetadataRoute } from 'next'
import { client } from '@/lib/sanityClient'
import { submitToIndexNow } from '@/lib/indexnow'

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

  /* ---------- IndexNow auto-ping ----------
     Sirf woh URLs jo pichle 24 hours mein update hue —
     har 15 min mein poori site ping karna spam hota hai,
     IndexNow key block ho sakti hai. */

  try {
    const DAY = 24 * 60 * 60 * 1000;
    const freshUrls = [...blogEntries, ...catEntries]
      .filter((e) => {
        const t = e.lastModified instanceof Date ? e.lastModified.getTime() : 0;
        return Date.now() - t < DAY;
      })
      .map((e) => e.url);

    // Static main pages sirf ek fresh URL ke saath bhejo (har ping mein sath chalengi)
    if (freshUrls.length > 0) {
      await submitToIndexNow([SITE, `${SITE}/daily-news`, ...freshUrls]);
    }
  } catch {
    /* IndexNow fail ho toh bhi sitemap normal return ho — site pe asar nahi */
  }

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