import { client } from "@/lib/sanityClient";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default async function SearchPage({ searchParams }: { searchParams: any }) {
  const resolvedParams = await Promise.resolve(searchParams);
  const query = resolvedParams?.q || "";

  const fetchSearchResults = async () => {
    if (!query) return [];
    try {
      // Aapke schema ke hisaab se img1Url fetch kiya gaya hai
      const sanityQuery = `*[_type == "blog" && (title match "*${query}*" || desc match "*${query}*")] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
        "categoryName": coalesce(category->name, category),
        desc,
        "img1Url": coalesce(img1.asset->url, img1),
        date
      }`;
      return await client.fetch(sanityQuery);
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  };

  const results = await fetchSearchResults();

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Search Header */}
        <div className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900">
            Search Results
          </h1>
          <p className="text-gray-500 mt-3 text-sm">
            {results.length > 0 
              ? <>Showing <span className="font-bold text-gray-900">{results.length}</span> results for: <span className="font-bold text-gray-900">"{query}"</span></>
              : <>No results found for: <span className="font-bold text-gray-900">"{query}"</span></>
            }
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg bg-white">
            <h2 className="text-xl font-bold text-gray-700">No articles found</h2>
            <p className="text-gray-500 mt-2">Try searching with a different keyword.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:underline">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Homepage
            </Link>
          </div>
        ) : (
          /* Editorial Blog List Layout */
          <div className="flex flex-col gap-10 md:gap-12">
            {results.map((blog: any) => (
              <Link href={`/blog/${blog.slug}`} key={blog._id} className="group flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* Image Section */}
                <div className="w-full md:w-72 lg:w-80 shrink-0">
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative rounded-sm">
                    <Image 
                      src={blog.img1Url || `https://picsum.photos/seed/${blog._id}/800/500.jpg`} 
                      alt={blog.title || "Blog Image"} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      sizes="(max-width: 768px) 100vw, 320px" 
                    />
                  </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    {blog.categoryName || "General"} {blog.date && `• ${new Date(blog.date).toLocaleDateString()}`}
                  </span>
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-900 group-hover:underline underline-offset-4 decoration-1">
                    {blog.title}
                  </h3>
                  {blog.desc && (
                    <p className="text-gray-600 mt-3 line-clamp-3 leading-relaxed text-base">
                      {blog.desc}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                    Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}