import Link from 'next/link';
import Image from 'next/image';
import { client } from "@/lib/sanityClient";
import { urlFor } from "@/lib/sanityImage";

export const dynamic = 'force-dynamic';

// 👇 Types define kiye
interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  emoji?: string;
  description?: string;
}

interface SubcategoryData {
  _id: string;
  name: string;
  slug: string;
  emoji?: string;
  image?: { asset?: { _ref: string; url?: string }; url?: string };
}

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  categoryName: string;
  desc?: string;
  mainImage?: { asset?: { _ref: string; url?: string }; url?: string };
  date?: string;
  author?: string;
  readTime?: string;
}

// Category ka data fetch karna
async function getCategoryData(slug: string): Promise<CategoryData | null> {
  const category = await client.fetch(`*[_type == "category" && slug.current == $slug][0]{
    _id, name, "slug": slug.current, emoji, description
  }`, { slug });
  return category;
}

// Us category ke andar ki subcategories fetch karna
async function getSubcategories(slug: string): Promise<SubcategoryData[]> {
  const subcats = await client.fetch(`*[_type == "subcategory" && parentId == $slug] | order(name asc){
    _id, name, "slug": slug.current, emoji, image
  }`, { slug });
  return subcats;
}

// Us category ke blogs fetch karna
async function getBlogsByCategory(slug: string): Promise<BlogData[]> {
  const blogs = await client.fetch(`*[_type == "blog" && category == $slug] | order(date desc){
    _id, title, "slug": slug.current, "categoryName": category, desc, "mainImage": img1, date, author, readTime
  }`, { slug });
  return blogs;
}

// Date formatter function
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryData(params.slug);
  const subcategories = await getSubcategories(params.slug);
  const blogs = await getBlogsByCategory(params.slug);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-gray-300">404</h1>
          <p className="text-gray-500 text-lg mb-6">Category not found</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">{category.name}</span>
          </nav>

          {/* Title & Description */}
          <div className="flex items-start gap-4">
            {category.emoji && (
              <span className="text-5xl md:text-6xl leading-none mt-1">{category.emoji}</span>
            )}
            <div>
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                {category.name}
              </h1>
              <p className="mt-3 text-gray-500 text-lg max-w-2xl">
                Explore all articles and guides about {category.name.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6D28D9]"></div>
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{blogs.length}</span> Articles
              </span>
            </div>
            {subcategories.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-300"></div>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{subcategories.length}</span> Subcategories
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">

        {/* ===== SUBCATEGORIES SECTION ===== */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Browse Topics
              </h2>
              <div className="h-px flex-1 ml-4 bg-gray-100"></div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {subcategories.map((sub: SubcategoryData) => {
                const subImg = sub.image ? urlFor(sub.image).width(80).height(80).url() : null;
                
                return (
                  <Link 
                    href={`/subcategories/${sub.slug}`} 
                    key={sub._id} 
                    className="group flex items-center gap-3 bg-white border border-gray-200 hover:border-[#6D28D9]/40 rounded-xl px-4 py-3 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#6D28D9]/5"
                  >
                    {/* Image ya Emoji */}
                    {subImg ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100">
                        <Image 
                          src={subImg} 
                          alt={sub.name} 
                          width={36} 
                          height={36} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : sub.emoji ? (
                      <span className="text-xl flex-shrink-0">{sub.emoji}</span>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#6D28D9] text-xs font-bold">
                          {sub.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Subcategory Name */}
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#6D28D9] whitespace-nowrap transition-colors">
                      {sub.name}
                    </span>

                    {/* Arrow */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-4 text-gray-300 group-hover:text-[#6D28D9] group-hover:translate-x-0.5 transition-all" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== BLOGS SECTION ===== */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Latest Articles
            </h2>
            <div className="h-px flex-1 ml-4 bg-gray-100"></div>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No articles found</p>
              <p className="text-gray-300 text-sm mt-1">Check back later for new content</p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-medium text-[#6D28D9] border border-[#6D28D9]/20 rounded-full hover:bg-[#6D28D9] hover:text-white transition-all"
              >
                Explore Other Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogs.map((blog: BlogData, index: number) => {
                const blogImg = blog.mainImage ? urlFor(blog.mainImage).width(600).height(800).url() : null;
                const isFeatured = index === 0;
                
                return (
                  <Link 
                    href={`/blog/${blog.slug}`} 
                    key={blog._id} 
                    className={`group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 ${
                      isFeatured ? 'sm:col-span-2 lg:col-span-2' : ''
                    }`}
                  >
                    {/* Image Section */}
                    <div className={`relative overflow-hidden bg-gray-100 ${
                      isFeatured ? 'aspect-[16/9]' : 'aspect-[4/5]'
                    }`}>
                      {blogImg ? (
                        <Image 
                          src={blogImg} 
                          alt={blog.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.15em] font-bold text-gray-700 rounded-full">
                          {blog.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 md:p-6">
                      {/* Meta Info */}
                      <div className="flex items-center gap-3 mb-3">
                        {blog.date && (
                          <span className="text-xs text-gray-400">
                            {formatDate(blog.date)}
                          </span>
                        )}
                        {blog.readTime && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs text-gray-400">
                              {blog.readTime} read
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`font-playfair font-bold text-gray-900 group-hover:text-[#6D28D9] transition-colors duration-300 leading-tight ${
                        isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
                      }`}>
                        {blog.title}
                      </h3>

                      {/* Description */}
                      {blog.desc && (
                        <p className={`text-gray-500 mt-2 leading-relaxed ${
                          isFeatured ? 'text-base line-clamp-2' : 'text-sm line-clamp-2'
                        }`}>
                          {blog.desc}
                        </p>
                      )}

                      {/* Read More */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                        <span className="text-sm font-semibold text-[#6D28D9] group-hover:gap-3 transition-all duration-300">
                          Read Article
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-4 h-4 text-[#6D28D9] group-hover:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== BOTTOM CTA ===== */}
        {blogs.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-sm mb-4">End of articles in {category.name}</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}