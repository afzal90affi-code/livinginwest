import { client } from '@/lib/sanityClient';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from "@/lib/sanityImage";
import { ArrowLeft, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AllNewsPage() {
  const blogs = await client.fetch(`*[_type == "blog" && isPublished == true] | order(date desc){
    _id, title, "slug": slug.current, desc, date, category, "mainImage": img1, newsTime
  }`);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="font-playfair text-4xl font-bold mb-10 border-b-2 border-gray-900 pb-4 uppercase">All News & Stories</h1>

        <div className="flex flex-col divide-y divide-gray-100 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {blogs.map((blog: any) => {
            const dateObj = new Date(blog.date);
            const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
            const day = dateObj.getDate();
            const blogImg = blog.mainImage ? urlFor(blog.mainImage).width(400).height(300).url() : null;

            return (
              <Link href={`/blog/${blog.slug}`} key={blog._id} className="group flex items-start gap-5 py-5">
                <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 border-r-2 border-gray-100 pr-4 text-center">
                  <span className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-widest">{month}</span>
                  <span className="text-3xl font-playfair font-bold text-gray-900 leading-none mt-1">{day}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-bold mb-1.5 block">{blog.category}</span>
                  <h3 className="text-lg md:text-xl font-bold leading-snug text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-1 hidden md:block">{blog.desc}</p>
                  {blog.newsTime && (
                    <div className="mt-2 flex items-center text-[10px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3 mr-1.5" /> {blog.newsTime}
                    </div>
                  )}
                </div>
                {blogImg && (
                  <div className="hidden md:block w-28 h-24 relative overflow-hidden bg-gray-100 rounded-md flex-shrink-0">
                    <Image src={blogImg} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="120px" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}