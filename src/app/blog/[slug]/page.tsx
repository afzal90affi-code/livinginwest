// No "use client" here! This is a Server Component.
import { client } from "@/lib/sanityClient";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogAudioPlayer from '@/components/BlogAudioPlayer';
import Comments from '../Comments';
import ArticleTracker from '@/components/ArticleTracker';

// Vercel caching issue fix
export const dynamic = 'force-dynamic';

interface BlogData {
  _id: string;
  title: string;
  category?: string | null;
  subCategory?: string | null;
  desc?: string;
  date?: string;
  mainImageUrl?: string;
  img2Url?: string;
  img3Url?: string;
  content1?: string;
  content2?: string;
  content3?: string;
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  
  const blogQuery = `*[_type == "blog" && slug.current == $slug][0] {
    _id, title, category, subCategory, desc, date,
    "mainImageUrl": mainImage.asset->url,
    "img2Url": img2.asset->url,
    "img3Url": img3.asset->url,
    content1, content2, content3
  }`;
  
  const blog: BlogData | null = await client.fetch(blogQuery, { slug: params.slug }, { cache: 'no-store' });

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <p className="text-gray-500 uppercase tracking-widest text-sm">Story not found</p>
      </div>
    );
  }

  // Plain text for audio player
  const fullBlogText = [blog.content1, blog.content2, blog.content3]
    .filter(Boolean)
    .map(c => c?.replace(/<[^>]*>/g, '') || '') // HTML tags hatao for audio
    .join(" ");

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 py-16 md:py-24">
      <ArticleTracker title={blog.title} category={blog.category || "general"} />

      <div className="max-w-4xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-12">
          <Link href={`/category/${blog.category}`} className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {blog.category}
          </Link>
          <span className="text-xs uppercase tracking-widest text-gray-400">
            {blog.date ? new Date(blog.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block px-3 py-1 border border-gray-200 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-6">
            {blog.subCategory || blog.category}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            {blog.title}
          </h1>
          {blog.desc && <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{blog.desc}</p>}
        </div>
        
        {/* Hero Image */}
        {blog.mainImageUrl && (
          <div className="mb-12 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image 
              src={blog.mainImageUrl} 
              alt={blog.title} 
              fill 
              className="object-cover object-top" 
              priority 
            />
          </div>
        )}

        {/* Audio Player */}
        <div className="mb-12 flex justify-center">
          <BlogAudioPlayer title={blog.title} content={fullBlogText} />
        </div>

        {/* Content Part 1 */}
        {blog.content1 && (
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter prose-headings:font-playfair prose-headings:tracking-tight prose-a:text-[#1e3a8a] prose-a:underline prose-img:border prose-img:border-gray-200"
            dangerouslySetInnerHTML={{ __html: blog.content1 }} 
          />
        )}

        {/* Middle Image */}
        {blog.img2Url && (
          <div className="my-16 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image src={blog.img2Url} alt="Article image 2" fill className="object-cover" />
          </div>
        )}

        {/* Content Part 2 */}
        {blog.content2 && (
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter prose-headings:font-playfair prose-headings:tracking-tight prose-a:text-[#1e3a8a] prose-a:underline prose-img:border prose-img:border-gray-200"
            dangerouslySetInnerHTML={{ __html: blog.content2 }} 
          />
        )}

        {/* Ad Space */}
        <div className="my-16 w-full h-24 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">
          Advertisement
        </div>

        {/* Last Image */}
        {blog.img3Url && (
          <div className="my-16 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image src={blog.img3Url} alt="Article image 3" fill className="object-cover" />
          </div>
        )}

        {/* Content Part 3 */}
        {blog.content3 && (
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter prose-headings:font-playfair prose-headings:tracking-tight prose-a:text-[#1e3a8a] prose-a:underline prose-img:border prose-img:border-gray-200"
            dangerouslySetInnerHTML={{ __html: blog.content3 }} 
          />
        )}

        {/* Comments Section */}
        <Comments blogId={blog._id} />

      </div>
    </main>
  );
}