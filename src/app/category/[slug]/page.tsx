import Link from 'next/link';
import Image from 'next/image';
import { client } from "@/lib/sanityClient";
import { urlFor } from "@/lib/sanityImage";
import { ShareCardButton } from '@/components/share';
import type { Metadata } from 'next';
import { Clock } from 'lucide-react';
import MarketTicker from '@/components/MarketTicker'; // ✅ مارکیٹ ٹککر امپورٹ کریں

export const dynamic = 'force-dynamic';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  emoji?: string;
  description?: string;
  metaTitle?: string;
  metaDesc?: string;
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

// ===== SEO METADATA FUNCTION =====
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryData(params.slug);

  if (!category) {
    return {
      title: "Category Not Found | Living In West",
      description: "The category you are looking for does not exist.",
    };
  }

  const title = category.metaTitle || `${category.name} News, Articles & Guides | Living In West`;
  const description = category.metaDesc || `Explore all articles and guides about ${category.name.toLowerCase()}. Stay updated with the latest insights on Living In West.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/category/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Category ka data fetch karna
async function getCategoryData(slug: string): Promise<CategoryData | null> {
  const category = await client.fetch(`*[_type == "category" && slug.current == $slug][0]{
    _id, name, "slug": slug.current, emoji, description, metaTitle, metaDesc
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

// Us category ke blogs fetch karna (Case-Insensitive Query)
async function getBlogsByCategory(slug: string): Promise<BlogData[]> {
  const blogs = await client.fetch(`*[_type == "blog" && isPublished == true && lower(category) == lower($slug)] | order(date desc){
    _id, title, "slug": slug.current, "categoryName": category, desc, "mainImage": img1, date, author, readTime
  }`, { slug });
  return blogs;
}

// Date formatter function
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
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
    <div className="min-h-screen bg-white">
      
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          {/* Title & Description */}
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight border-b-4 border-blue-600 inline-block pb-2">
              {category.name}
            </h1>
            <p className="mt-5 text-gray-500 text-lg max-w-2xl">
              Explore all articles and guides about {category.name.toLowerCase()}.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              {blogs.length} Articles
            </div>
            {subcategories.length > 0 && (
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                {subcategories.length} Topics
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">

        {/* ===== SUBCATEGORIES SECTION (Stylish Pills) ===== */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5 px-6 md:px-0">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                Browse Topics
              </h2>
              <div className="h-px flex-1 ml-4 bg-gray-200"></div>
            </div>
            
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap">
              {subcategories.map((sub: SubcategoryData) => {
                const subImg = sub.image ? urlFor(sub.image).width(80).height(80).url() : null;
                
                return (
                  <Link 
                    href={`/subcategories/${sub.slug}`} 
                    key={sub._id} 
                    className="group flex items-center gap-2.5 bg-white border border-gray-200 hover:border-gray-900 rounded-full pl-4 pr-3 py-2 transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    {/* Image ya Dot Indicator */}
                    {subImg ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-200">
                        <Image 
                          src={subImg} 
                          alt={sub.name} 
                          width={24} 
                          height={24} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 transition-colors group-hover:bg-gray-900"></div>
                    )}
                    
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap transition-colors">
                      {sub.name}
                    </span>

                    {/* Arrow Icon */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2.5}
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
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Latest Articles
            </h2>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-500 text-lg font-semibold">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {blogs.map((blog: BlogData) => {
                const blogImg = blog.mainImage ? urlFor(blog.mainImage).width(600).height(600).url() : null;
                
                return (
                  <div key={blog._id} className="group flex flex-col">
                    
                    {/* Image Section */}
                    <Link href={`/blog/${blog.slug}`} className="block">
                      <div className="relative overflow-hidden bg-gray-100 aspect-square mb-4">
                        {blogImg ? (
                          <Image 
                            src={blogImg} 
                            alt={blog.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100"></div>
                        )}
                      </div>
                    </Link>

                    {/* Content Section */}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-blue-600">
                          {blog.categoryName}
                        </span>
                        {blog.readTime && (
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3 h-3" />
                            {blog.readTime} min read
                          </span>
                        )}
                      </div>

                      <Link href={`/blog/${blog.slug}`}>
                        <h3 className="font-playfair text-xl md:text-2xl font-bold leading-tight text-gray-900 group-hover:underline underline-offset-4 decoration-1 transition-all">
                          {blog.title}
                        </h3>
                      </Link>

                      {blog.desc && (
                        <p className="text-gray-500 mt-3 text-sm leading-relaxed line-clamp-2">
                          {blog.desc}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                          {blog.date && formatDate(blog.date)}
                        </span>
                        <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== BOTTOM CTA ===== */}
        {blogs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm mb-5 font-medium">You've reached the end of {category.name} articles.</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-gray-700 transition-colors uppercase tracking-widest"
            >
              Back to All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}