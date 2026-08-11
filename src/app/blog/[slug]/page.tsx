import { Metadata } from 'next'; // Ye import file ke sabse upar add karein
import { client } from "@/lib/sanityClient";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import BlogAudioPlayer from '@/components/BlogAudioPlayer';
import Comments from '../Comments';
import ArticleTracker from '@/components/ArticleTracker';
import { ShareMenu, ShareCardButton } from '@/components/share';
import Slider from '@/components/Slider';
import EmbedBlogButton from '@/components/embeds/EmbedBlogButton';

export const dynamic = 'force-dynamic';

interface BlogData {
  _id: string;
  title: string;
  slug?: { current: string };
  category?: string | null;
  subCategory?: string | null;
  desc?: string;
  date?: string;
  mainImageUrl?: string;
  img2Url?: string;
  img3Url?: string;
  img4Url?: string;
  img5Url?: string;
  img6Url?: string;
  img7Url?: string;
  img8Url?: string;
  img9Url?: string;
  img10Url?: string;
  imgOrientations?: Record<string, string>;
  isPublished?: boolean;
  isMoreStory?: boolean;
  content1?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  content5?: string;
  content6?: string;
  content7?: string;
  content8?: string;
  content9?: string;
  content10?: string;
  writerName?: string;
  writerSocial?: string;
}

const cleanQuillHtml = (html: string): string => {
  if (!html) return "";
  let normalizedHtml = html.replace(
    /style="([^"]*text-align:\s*(left|center|right|justify)[^"]*)"/gi,
    (_match, style: string, align: string) => `class="ql-align-${align.toLowerCase()}" style="${style}"`
  );

  return normalizedHtml.replace(/(<img[^>]*?)style="([^"]*)"/gi, (match, start, style) => {
    const allowedStyles = style
      .split(';')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .filter((prop: string) => /^(float|text-align|width|max-width|margin|display)\s*:/i.test(prop))
      .join('; ');
    return allowedStyles ? `${start}style="${allowedStyles}"` : start;
  });
};
// ✅ 1. GENERATE METADATA FUNCTION (Updated for Admin SEO Panel)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Ab hum metaTitle, metaDesc aur keywords bhi fetch kar rahe hain
  const query = `*[_type == "blog" && slug.current == $slug][0] {
    title, desc, metaTitle, metaDesc, keywords,
    "mainImageUrl": img1.asset->url, 
    "slug": slug.current
  }`;
  
  const blog: { 
    title?: string; 
    desc?: string; 
    metaTitle?: string;
    metaDesc?: string;
    keywords?: string;
    mainImageUrl?: string; 
    slug?: string 
  } | null = await client.fetch(query, { slug: params.slug });

  if (!blog) {
    return {
      title: "Blog Not Found | Living In West",
      description: "The article you are looking for does not exist.",
    };
  }

  const baseUrl = "https://livinginwest.com";
  const ogImageUrl = blog.mainImageUrl || `${baseUrl}/default-og-image.jpg`;

  // Agar admin se meta title diya hai toh wo, warna default title
  const finalTitle = blog.metaTitle || blog.title;
  
  // Agar admin se meta desc diya hai toh wo, warna default desc
  const finalDesc = blog.metaDesc || blog.desc || "Read the latest insights and stories on Living In West.";

  // Keywords ko array mein convert kar rahe hain (comma separated se)
  const keywordsArray = blog.keywords ? blog.keywords.split(',').map(k => k.trim()) : [];

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: keywordsArray, // Ye keywords search engines ke liye hain
    alternates: {
      canonical: `${baseUrl}/blog/${blog.slug}`,
    },
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: `${baseUrl}/blog/${blog.slug}`,
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const blogQuery = `*[_type == "blog" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, category, subCategory, desc, date,
    "mainImageUrl": img1.asset->url,
    "img2Url": img2.asset->url,
    "img3Url": img3.asset->url,
    "img4Url": img4.asset->url,
    "img5Url": img5.asset->url,
    "img6Url": img6.asset->url,
    "img7Url": img7.asset->url,
    "img8Url": img8.asset->url,
    "img9Url": img9.asset->url,
    "img10Url": img10.asset->url,
    imgOrientations, isPublished,
    content1, content2, content3, content4, content5, content6,
    content7, content8, content9, content10,
    writerName, writerSocial
  }`;

  const blog: BlogData | null = await client.fetch(blogQuery, { slug: params.slug }, { cache: 'no-store' });

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="font-playfair text-6xl font-light text-gray-200 mb-4">404</p>
          <p className="text-gray-400 uppercase tracking-[0.3em] text-[11px]">Story not found</p>
          <Link href="/" className="inline-block mt-6 text-[11px] uppercase tracking-[0.2em] text-[#1e3a8a] hover:text-black transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const catBlogsQuery = `*[_type == "blog" && coalesce(category->slug.current, category) == $cat && slug.current != $slug && isPublished != false] | order(coalesce(sortOrder, 0) asc) [0...5] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url, writerName, writerSocial
  }`;
  const catBlogs: BlogData[] = await client.fetch(catBlogsQuery, { cat: blog.category, slug: params.slug }, { cache: 'no-store' });

  const recBlogsQuery = `*[_type == "blog" && slug.current != $slug && coalesce(category->slug.current, category) != $cat && isPublished != false] | order(coalesce(sortOrder, 0) asc) [0...5] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url, writerName, writerSocial
  }`;
  const recBlogs: BlogData[] = await client.fetch(recBlogsQuery, { cat: blog.category, slug: params.slug }, { cache: 'no-store' });

  const shortStoriesQuery = `*[_type == "blog" && isMoreStory == true && slug.current != $slug && isPublished != false] | order(date desc) [0...4] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url, writerName, writerSocial
  }`;
  const shortStories: BlogData[] = await client.fetch(shortStoriesQuery, { slug: params.slug }, { cache: 'no-store' });

  const fullBlogText = [
    blog.content1, blog.content2, blog.content3, blog.content4, 
    blog.content5, blog.content6, blog.content7, blog.content8, 
    blog.content9, blog.content10
  ]
    .filter(Boolean)
    .map(c => cleanQuillHtml(c || '').replace(/<[^>]*>/g, '').trim())
    .filter(t => t.length > 0)
    .join(" ");

  const isVertical = (key: string) => blog.imgOrientations?.[key] === 'vertical';

  const renderAuthor = (b: BlogData) => {
    const name = b.writerName || "Living In West";
    if (b.writerSocial) {
      return (
        <a 
          href={b.writerSocial} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold text-gray-900 hover:text-[#6D28D9] hover:underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          By {name}
        </a>
      );
    }
    return <span className="font-semibold text-gray-900">By {name}</span>;
  };

  const SwipeCard = ({ b, widthClass }: { b: BlogData, widthClass: string }) => (
    <div className={`${widthClass} snap-start flex flex-col`}>
      <Link href={`/blog/${b.slug}`} className="group block">
        <div className="relative aspect-[3/2] overflow-hidden bg-gray-50 mb-3 rounded-sm">
          {b.mainImageUrl
            ? <Image src={b.mainImageUrl} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="280px" />
            : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">📝</div>
          }
        </div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#1e3a8a] font-bold mb-1">{b.subCategory || b.category}</p>
        <h4 className="text-[15px] leading-[1.3] font-playfair font-bold text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">{b.title}</h4>
        {b.date && <p className="text-[10px] text-gray-400 mt-1.5">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
      </Link>
      <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-2">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Share</span>
        <ShareCardButton title={b.title} />
      </div>
    </div>
  );

  // Dynamic Blog Parts Array
  const blogSections = [];
  for (let i = 1; i <= 10; i++) {
    const content = (blog as any)[`content${i}`] as string | undefined;
    const imageKey = i + 1;
    const imageUrl = i < 10 ? (blog as any)[`img${imageKey}Url`] as string | undefined : undefined;
    
    if (content || imageUrl) {
      blogSections.push({ content, imageKey, imageUrl });
    }
  }

  // ✅ 2. SCHEMA MARKUP FOR GOOGLE (JSON-LD)
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.desc,
    "image": blog.mainImageUrl,
    "datePublished": blog.date,
    "author": {
      "@type": "Person",
      "name": blog.writerName || "Living In West"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Living In West"
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 blog-no-scroll">
      
      {/* ✅ SCHEMA RENDERING */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <ArticleTracker title={blog.title} category={blog.category || "general"} />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4 md:px-6">
        <div className="w-full lg:w-[85%] py-4">

          <div className="border-b border-gray-100">
            <div className="max-w-[680px] mx-auto py-4 flex items-center justify-between">
              <Link href={`/category/${blog.category}`} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-[#1e3a8a] transition-colors">
                <ArrowLeft className="w-3 h-3" />
                {blog.category}
              </Link>
              {blog.date && (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-300">
                  <Calendar className="w-3 h-3" />
                  {new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <div className="max-w-[680px] mx-auto pt-10 md:pt-14 text-center">
            <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold mb-5">
              {blog.subCategory || blog.category}
            </span>
            <h1 className="text-[30px] md:text-[46px] leading-[1.08] font-playfair font-bold tracking-[-0.025em] text-gray-900 mb-5">
              {blog.title}
            </h1>
            {blog.desc && (
              <p className="text-[14px] md:text-[16px] text-gray-500 leading-[1.7] mb-8 max-w-lg mx-auto">
                {blog.desc}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pb-8 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">LW</span>
              </div>
              <div className="text-left">
                {renderAuthor(blog)}
                <p className="text-[11px] text-gray-500">Editorial Team</p>
              </div>
            </div>
          </div>

          {blog.mainImageUrl && (
            <div className={`my-10 md:my-14 ${isVertical('1') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
              <div className={`relative overflow-hidden bg-gray-50 ${isVertical('1') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                <Image 
                  src={blog.mainImageUrl} 
                  alt={blog.title} 
                  fill 
                  className="object-cover" 
                  priority 
                  sizes={isVertical('1') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} 
                />
                <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">00</div>
              </div>
            </div>
          )}

          <div className="max-w-[680px] mx-auto pt-6 md:pt-10">
            <BlogAudioPlayer title={blog.title} content={fullBlogText} />
          </div>

          <article className="w-full max-w-[760px] mx-auto pt-10 md:pt-14 pb-10 md:pb-20">
            
            {/* DYNAMIC BLOG CONTENT LOOP */}
            {blogSections.map((section, index) => (
              <div key={index}>
                {section.content && (
                  <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(section.content) }} />
                )}

                {section.imageUrl && (
                  <div className={`my-10 md:my-14 ${isVertical(String(section.imageKey)) ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                    <div className={`relative overflow-hidden bg-gray-50 ${isVertical(String(section.imageKey)) ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                      <Image 
                        src={section.imageUrl} 
                        alt="" 
                        fill 
                        className="object-cover" 
                        sizes={isVertical(String(section.imageKey)) ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} 
                      />
                      <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">
                        {String(section.imageKey - 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ad Block & Divider - Sirf tabhi render hoga jab agla part maujood ho */}
                {((index + 1) % 2 === 0) && (index < blogSections.length - 1) && (
                  <>
                    <div className="flex items-center justify-center my-12 md:my-16">
                      <div className="w-14 h-px bg-gray-300" /><span className="mx-4 text-gray-300 text-[10px]">✦</span><div className="w-14 h-px bg-gray-300" />
                    </div>
                    <div className="my-8 py-5 border-t border-b border-gray-100 flex items-center justify-center">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-mono">[ advertisement ]</span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* ARTICLE END & SHARE */}
            <div className="mt-16 md:mt-24 flex flex-col items-center">
              <div className="w-10 h-px bg-gray-300 mb-5" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-mono mb-8">— end —</p>
              <ShareMenu />

              {/* ✅ Embed Blog Button Added Here */}
              <EmbedBlogButton slug={blog.slug?.current || params.slug} />

              <div className="mt-12 md:mt-16 flex flex-col items-center text-center border-t border-gray-100 pt-10 w-full max-w-md">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-3">
                  <span className="text-white text-sm font-bold">LW</span>
                </div>
                <div className="text-[13px] font-semibold text-gray-900">
                  {renderAuthor(blog)}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Editorial Team</p>
              </div>
            </div>
          </article>

          <div className="border-t border-gray-100 bg-[#FAFAFA]">
            <div className="max-w-[680px] mx-auto py-12 md:py-16">
              <Comments blogId={blog._id} />
            </div>
          </div>

          {shortStories.length > 0 && (
            <div className="border-t border-gray-100 bg-white">
              <div className="max-w-[1000px] mx-auto py-14 md:py-20">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold block mb-2">Quick Reads</span>
                    <h2 className="text-[24px] md:text-[32px] font-playfair font-bold text-gray-900 leading-tight">
                      Short Stories
                    </h2>
                  </div>
                </div>
                <Slider>
                  {shortStories.map((b) => (
                    <SwipeCard key={b._id} b={b} widthClass="min-w-[260px] max-w-[260px]" />
                  ))}
                </Slider>
              </div>
            </div>
          )}

          {catBlogs.length > 0 && (
            <div className="border-t border-gray-100 bg-[#FAFAFA]">
              <div className="max-w-[1000px] mx-auto py-14 md:py-20">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold block mb-2">More Stories</span>
                    <h2 className="text-[24px] md:text-[32px] font-playfair font-bold text-gray-900 leading-tight">
                      More from {blog.category}
                    </h2>
                  </div>
                </div>
                <Slider>
                  {catBlogs.map((b) => (
                    <SwipeCard key={b._id} b={b} widthClass="min-w-[280px] max-w-[280px]" />
                  ))}
                </Slider>
              </div>
            </div>
          )}

          {recBlogs.length > 0 && (
            <div className="border-t border-gray-100 bg-white">
              <div className="max-w-[1000px] mx-auto py-14 md:py-20">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold block mb-2">Explore</span>
                    <h2 className="text-[24px] md:text-[32px] font-playfair font-bold text-gray-900 leading-tight">
                      Recommended for You
                    </h2>
                  </div>
                </div>
                <Slider>
                  {recBlogs.map((b) => (
                    <SwipeCard key={b._id} b={b} widthClass="min-w-[280px] max-w-[280px]" />
                  ))}
                </Slider>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-[680px] mx-auto py-8 flex items-center justify-between">
              <Link href="/" className="text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#1e3a8a] transition-colors">
                ← Back to Home
              </Link>
              <p className="text-[10px] text-gray-300 font-mono">LIVING IN WEST © {new Date().getFullYear()}</p>
            </div>
          </div>

        </div>

        <aside className="hidden lg:block w-[15%] py-4">
          <div className="sticky top-20 flex flex-col gap-6">
            <div className="w-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded">[ Article Ad 160x600 ]</div>
            </div>
            <div className="w-full min-h-[250px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded">[ Article Ad 300x250 ]</div>
            </div>
          </div>
        </aside>

      </div>

    </main>
  );
}