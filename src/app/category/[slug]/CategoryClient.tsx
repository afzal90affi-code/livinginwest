"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from "@/lib/sanityImage";
import { ShareCardButton } from '@/components/share';
import { Clock, LayoutGrid, List } from 'lucide-react';

interface Props {
  category: any;
  subcategories: any[];
  blogs: any[];
}

export default function CategoryClient({ category, subcategories, blogs }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderBlogCard = (blog: any) => {
    const blogImg = blog.mainImage ? urlFor(blog.mainImage).width(600).height(600).url() : null;
    return (
      <div key={blog._id} className="group flex flex-col">
        <Link href={`/blog/${blog.slug}`} className="block">
          {/* Grid میں Square Image، List میں Rectangle */}
          <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4 ${viewMode === 'grid' ? 'aspect-square' : 'aspect-video'}`}>
            {blogImg ? <Image src={blogImg} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="w-full h-full bg-gray-100 dark:bg-gray-700"></div>}
          </div>
        </Link>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-widest font-bold">
            <span className="text-blue-600 dark:text-blue-400">{blog.categoryName}</span>
            {blog.readTime && <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500"><Clock className="w-3 h-3" />{blog.readTime} min read</span>}
          </div>
          <Link href={`/blog/${blog.slug}`}>
            <h3 className="font-playfair text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white group-hover:underline underline-offset-4 decoration-1 transition-all">{blog.title}</h3>
          </Link>
          {blog.desc && <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm leading-relaxed line-clamp-2">{blog.desc}</p>}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{formatDate(blog.date)}</span>
            <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
          <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight border-b-4 border-blue-600 inline-block pb-2">
                {category.name}
              </h1>
              <p className="mt-5 text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                Explore all articles and guides about {category.name.toLowerCase()}.
              </p>
            </div>

            {/* صرف گرڈ/لسٹ بٹن (ڈارک موڈ نیوی بار میں ہے) */}
            <div className="flex items-center gap-4">
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-full p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              {blogs.length} Articles
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">

        {/* ===== SUBCATEGORIES PILLS ===== */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide md:flex-wrap">
              {subcategories.map((sub: any) => {
                const subImg = sub.image ? urlFor(sub.image).width(80).height(80).url() : null;
                return (
                  <Link href={`/subcategories/${sub.slug}`} key={sub._id} className="group flex items-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white rounded-full pl-4 pr-3 py-2 transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0">
                    {subImg ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-600">
                        <Image src={subImg} alt={sub.name} width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white whitespace-nowrap transition-colors">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== BLOGS SECTION ===== */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No articles found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back later for new content</p>
          </div>
        ) : (
          // Grid View (3 Columns) or List View (2 Columns wider)
          <div className={`grid gap-x-8 gap-y-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {blogs.map((blog: any) => renderBlogCard(blog))}
          </div>
        )}

        {/* ===== BOTTOM CTA ===== */}
        {blogs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 font-medium">You've reached the end of {category.name} articles.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors uppercase tracking-widest">
              Back to All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}