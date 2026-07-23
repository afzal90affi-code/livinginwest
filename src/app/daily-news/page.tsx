import { client } from "@/lib/sanityClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

// Sanity سے خبریں لانے والا کوئری
const query = `*[_type == "blog" && isPublished != false] | order(date desc) {
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

  // خبروں کو تاریخ کے حساب سے گروپ کرنے کا لاجک
  const groupedNews: Record<string, NewsItem[]> = {};
  news.forEach((item) => {
    if (!item.date) return;
    // تاریخ کو خوبصورت فارمیٹ میں بدلیں (جیسے: "October 24, 2023")
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!groupedNews[formattedDate]) {
      groupedNews[formattedDate] = [];
    }
    groupedNews[formattedDate].push(item);
  });

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10 border-b-2 border-gray-900 pb-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">Daily News Archive</h1>
          <Link href="/" className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
        </div>

        {/* خبریں تاریخ کے حساب سے پرنٹ کریں */}
        <div className="space-y-12">
          {Object.entries(groupedNews).map(([date, articles]) => (
            <div key={date}>
              
              {/* Date Heading */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">{date}</h2>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Articles of that date */}
              <div className="flex flex-col gap-6">
                {articles.map((article) => (
                  <Link href={`/blog/${article.slug}`} key={article._id} className="group grid grid-cols-1 md:grid-cols-4 gap-6 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
                    
                    {/* Image */}
                    <div className="relative aspect-video md:aspect-square overflow-hidden bg-gray-100 rounded-lg md:col-span-1">
                      {article.mainImageUrl ? (
                        <Image src={article.mainImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3 flex flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-bold mb-2">{article.category}</span>
                      <h3 className="text-xl md:text-2xl font-playfair font-bold leading-tight text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.desc}</p>
                    </div>

                  </Link>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}