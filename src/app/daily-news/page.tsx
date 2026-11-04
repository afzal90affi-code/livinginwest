import { client } from "@/lib/sanityClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";
import type { Metadata } from "next";

// Har 60 second me fresh content (force-dynamic ki zaroorat nahi — ISR behtar hai)
export const revalidate = 60;

const SITE = "https://livinginwest.com";

/* ---------- SEO Metadata ---------- */
// NOTE: Title me "| Living In West" NAHI likha — layout ka template khud laga dega
export const metadata: Metadata = {
  title: "Daily Crypto News Archive — Latest Updates",
  description:
    "Daily crypto news archive: latest Bitcoin, Ethereum & altcoin updates, market analysis and price movements — refreshed every day in one place.",
  alternates: { canonical: `${SITE}/daily-news` },
  openGraph: {
    title: "Daily Crypto News Archive | Living In West",
    description:
      "Bitcoin, Ethereum & altcoin daily news and market updates — all in one place.",
    url: `${SITE}/daily-news`,
    siteName: "Living In West",
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
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Daily Crypto News Archive",
    url: `${SITE}/daily-news`,
    itemListElement: news.slice(0, 20).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/blog/${item.slug}`,
      name: item.title,
    })),
  };

  /* ---------- Khabron ko tareekh ke hesab se group karna ---------- */
  const grouped: Record<string, NewsItem[]> = {};
  const undated: NewsItem[] = [];

  news.forEach((item) => {
    if (!item.date) {
      undated.push(item); // tareekh na ho to chhupana nahi — "Other Updates" me dalenge
      return;
    }
    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[formattedDate]) grouped[formattedDate] = [];
    grouped[formattedDate].push(item);
  });

  const sections = Object.entries(grouped);
  if (undated.length > 0) sections.push(["Other Updates", undated]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* JSON-LD script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Page header */}
        <header className="mt-6 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Daily Crypto News Archive
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Bitcoin, Ethereum &amp; altcoin updates, market analysis and price
            movements — refreshed every day in one place.
          </p>
        </header>

        {/* Empty state */}
        {news.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <Newspaper className="w-10 h-10 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No news published yet. Check back soon!
            </p>
          </div>
        )}

        {/* Date-wise sections */}
        {sections.map(([dateLabel, items]) => (
          <section key={dateLabel} className="mb-12">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-5">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {dateLabel}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item._id}
                  className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${item.slug}`}>
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800">
                      {item.mainImageUrl ? (
                        <Image
                          src={item.mainImageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {item.category && (
                        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          {item.category}
                        </span>
                      )}

                      <h3 className="mt-2 font-bold leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>

                      {item.desc && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}