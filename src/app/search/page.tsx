import { client } from "@/lib/sanityClient";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default async function SearchPage({ searchParams }: { searchParams: any }) {
  const resolvedParams = await Promise.resolve(searchParams);
  const query = resolvedParams?.q || "";

  // ✅ Security fix: GROQ injection se bachne ke liye quotes escape karo
  const safeQuery = query.replace(/["\\]/g, "");

  const fetchSearchResults = async () => {
    if (!query) return [];
    try {
      // ✅ writerName bhi fetch kar rahe hain ab
      const sanityQuery = `*[_type == "blog" && (title match "*${safeQuery}*" || desc match "*${safeQuery}*")] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
        "categoryName": coalesce(category->name, category),
        desc,
        "img1Url": coalesce(img1.asset->url, img1),
        date,
        writerName,
        writerSocial
      }`;
      return await client.fetch(sanityQuery);
    } catch (error) {
      console.error("Search fetch error:", error);
      return [];
    }
  };

  const results = await fetchSearchResults();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 py-12 md:py-20 transition-colors">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Search Header */}
        <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Search Results
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            {results.length > 0 
              ? <>Showing <span className="font-bold text-gray-900 dark:text-gray-100">{results.length}</span> results for: <span className="font-bold text-gray-900 dark:text-gray-100">"{query}"</span></>
              : <>No results found for: <span className="font-bold text-gray-900 dark:text-gray-100">"{query}"</span></>
            }
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">No articles found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try searching with a different keyword.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:underline">
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
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900 relative rounded-sm">
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
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-widest font-bold mb-2">
                    <span className="text-gray-400 dark:text-gray-500">
                      {blog.categoryName || "General"}
                    </span>
                    {blog.date && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          {new Date(blog.date).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {blog.writerName && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          By {blog.writerName}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 group-hover:underline underline-offset-4 decoration-1">
                    {blog.title}
                  </h3>
                  {blog.desc && (
                    <p className="text-gray-600 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed text-base">
                      {blog.desc}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
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