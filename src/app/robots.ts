import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/', '/admin'], // 👈 agar ye routes exist karte hain
    },
    sitemap: 'https://livinginwest.com/sitemap.xml',
  }
}