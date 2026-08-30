import { client } from "@/lib/sanityClient";

// 👇 Aapke page.tsx wale same fields use kiye
interface BlogData {
  _id: string;
  title?: string;
  slug?: string;
  desc?: string;
  mainImage?: { asset?: { _ref: string; url?: string }; url?: string };
  date?: string;
}

const BLOGS_QUERY = `*[_type == "blog"] | order(_createdAt desc) [0...30] {
  _id, 
  title, 
  "slug": slug.current, 
  desc, 
  "mainImage": img1, 
  date
}`;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const SITE_URL = "https://livinginwest.com";

  let blogs: BlogData[] = [];
  try {
    blogs = await client.fetch(BLOGS_QUERY, {}, { next: { revalidate: 3600 } }); // 1 hour cache
  } catch {
    blogs = [];
  }

  const items = blogs
    .map((b) => {
      const link = `${SITE_URL}/blog/${b.slug ?? ""}`;
      const title = escapeXml(b.title ?? "Untitled");
      const desc = escapeXml(b.desc ?? "");
      const pubDate = b.date
        ? new Date(b.date).toUTCString()
        : new Date().toUTCString();
      const image = b.mainImage?.url
        ? `<enclosure url="${escapeXml(b.mainImage.url)}" type="image/jpeg" length="0"/>`
        : "";

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      ${image}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Living In West</title>
    <link>${SITE_URL}</link>
    <description>News for immigrants living in USA, Canada, UK &amp; Europe — immigration, economy, lifestyle &amp; world news.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}