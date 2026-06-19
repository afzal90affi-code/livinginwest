import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Sab search engines (Google, Bing, etc.) ko allow karo
      allow: '/',     // Poori site scan karne do
    },
    sitemap: 'https://livinginwest.com/sitemap.xml', // 👈 Apni domain daalo
  }
}