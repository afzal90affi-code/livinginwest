import { client } from "@/lib/sanityClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

const SITE = "https://livinginwest.com";

/* ---------- SEO Metadata ---------- */
export const metadata: Metadata = {
  title: "Daily Crypto News Archive — Latest Updates | LivingInWest",
  description:
    "Daily crypto news archive: Bitcoin, Ethereum aur altcoins ke taza updates, market analysis aur price movement ek jagah, roz update hota hai.",
  alternates: { canonical: `${SITE}/daily-news` },
  openGraph: {
    title: "Daily Crypto News Archive | LivingInWest",
    description:
      "Bitcoin, Ethereum aur altcoins ki daily news aur market updates — sab ek jagah.",
    url: `${SITE}/daily-news`,
    siteName: "LivingInWest",
    type: "website",
  },
};

// Sanity se khabar lene wali query
const query = `*[_type == "blog" && isPublished == true] | order(date desc) {
  _id, title, "slug": slug.current, category, desc, date, "mainImageUrl": img1.asset->url
}`;

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  desc?: string;
  date?: string;
  mainImageUrl?: string;
}

export default async function DailyNewsPage() {
  const news: NewsItem[] = await client.fetch(query);

  /* ---------- JSON-LD: ItemList schema ---------- */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Daily Crypto News Archive',
    url: `${SITE}/daily-news`,
    itemListElement: news.slice(0, 20).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/blog/${item.slug}`,
      name: item.title,
    })),
  };

  // Khabron ko tareekh ke hesab se group karne ka logic
  const groupedNews: Record<string, NewsItem[]> = {};
  news.forEach((item) => {
    if (!item.date) return;
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groupedNews[formattedDate]) {
      groupedNews[formattedDate] = [];
    }
    groupedNews[formattedDate].push(item);
  });

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900">
      {/* JSON-LD script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* ... baqi aapka UI bilkul waise ka waisa — koi tabdeeli nahi ... */}
      </div>
    </main>
  );
}