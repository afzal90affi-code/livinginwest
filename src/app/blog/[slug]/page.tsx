import { client } from "@/lib/sanityClient";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import BlogAudioPlayer from '@/components/BlogAudioPlayer';
import Comments from '../Comments';
import ArticleTracker from '@/components/ArticleTracker';
import { ShareMenu, ShareCardButton } from '@/components/share';
import Slider from '@/components/Slider'; // 🌟 Slider Component Import kiya

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
  imgOrientations?: Record<string, string>;
  isPublished?: boolean;
  isMoreStory?: boolean;
  content1?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  content5?: string;
  content6?: string;
}

// ===== QUILL IMAGE FIX =====
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

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const blogQuery = `*[_type == "blog" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, category, subCategory, desc, date,
    "mainImageUrl": img1.asset->url,
    "img2Url": img2.asset->url,
    "img3Url": img3.asset->url,
    "img4Url": img4.asset->url,
    "img5Url": img5.asset->url,
    "img6Url": img6.asset->url,
    imgOrientations, isPublished,
    content1, content2, content3, content4, content5, content6
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

  // Fetch Same Category Blogs
  const catBlogsQuery = `*[_type == "blog" && coalesce(category->slug.current, category) == $cat && slug.current != $slug && isPublished != false] | order(coalesce(sortOrder, 0) asc) [0...5] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url
  }`;
  const catBlogs: BlogData[] = await client.fetch(catBlogsQuery, { cat: blog.category, slug: params.slug }, { cache: 'no-store' });

  // Fetch Recommended Blogs (Different Category)
  const recBlogsQuery = `*[_type == "blog" && slug.current != $slug && coalesce(category->slug.current, category) != $cat && isPublished != false] | order(coalesce(sortOrder, 0) asc) [0...5] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url
  }`;
  const recBlogs: BlogData[] = await client.fetch(recBlogsQuery, { cat: blog.category, slug: params.slug }, { cache: 'no-store' });

  // Fetch Short Stories (isMoreStory == true)
  const shortStoriesQuery = `*[_type == "blog" && isMoreStory == true && slug.current != $slug && isPublished != false] | order(date desc) [0...4] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url
  }`;
  const shortStories: BlogData[] = await client.fetch(shortStoriesQuery, { slug: params.slug }, { cache: 'no-store' });

  const fullBlogText = [blog.content1, blog.content2, blog.content3, blog.content4, blog.content5, blog.content6]
    .filter(Boolean)
    .map(c => cleanQuillHtml(c || '').replace(/<[^>]*>/g, '').trim())
    .filter(t => t.length > 0)
    .join(" ");

  const isVertical = (key: string) => blog.imgOrientations?.[key] === 'vertical';

  // ===== REUSABLE SWIPEABLE CARD =====
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

  return (
    <main className="min-h-screen bg-white text-gray-900 blog-no-scroll">
      <ArticleTracker title={blog.title} category={blog.category || "general"} />

      {/* ===== MAIN LAYOUT WRAPPER: 85% Blog + 15% Ads ===== */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4 md:px-6">
        
        {/* --- BLOG CONTENT AREA (85%) --- */}
        <div className="w-full lg:w-[85%] py-4">

          {/* ===== TOP NAV ===== */}
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

          {/* ===== HEADER ===== */}
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
                <p className="text-[13px] font-semibold text-gray-900">By Living In West</p>
                <p className="text-[11px] text-gray-500">Editorial Team</p>
              </div>
            </div>
          </div>

          {/* ===== HERO IMAGE (Updated to w-full to stay in 85% boundry) ===== */}
          {blog.mainImageUrl && (
            <div className="w-full my-10 md:my-14">
              <div className="relative w-full max-w-[1000px] mx-auto aspect-[3/2] overflow-hidden bg-gray-50">
                <Image src={blog.mainImageUrl} alt={blog.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 85vw" />
              </div>
            </div>
          )}

          {/* ===== AUDIO ===== */}
          <div className="max-w-[680px] mx-auto pt-6 md:pt-10">
            <BlogAudioPlayer title={blog.title} content={fullBlogText} />
          </div>

          {/* ===== ARTICLE BODY ===== */}
          <article className="w-full max-w-[760px] mx-auto pt-10 md:pt-14 pb-10 md:pb-20">
            {blog.content1 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content1) }} />}
            
            {/* img2 - w-full se image sirf 85% area me hi badi aayegi */}
            {blog.img2Url && (
              <div className={`my-10 md:my-14 ${isVertical('2') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                <div className={`relative overflow-hidden bg-gray-50 ${isVertical('2') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                  <Image src={blog.img2Url} alt="" fill className="object-cover" sizes={isVertical('2') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} />
                  <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">01</div>
                </div>
              </div>
            )}

            {blog.content2 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content2) }} />}

            <div className="flex items-center justify-center my-12 md:my-16">
              <div className="w-14 h-px bg-gray-300" /><span className="mx-4 text-gray-300 text-[10px]">✦</span><div className="w-14 h-px bg-gray-300" />
            </div>
            <div className="my-8 py-5 border-t border-b border-gray-100 flex items-center justify-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-mono">[ advertisement ]</span>
            </div>

            {/* img3 */}
            {blog.img3Url && (
              <div className={`my-10 md:my-14 ${isVertical('3') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                <div className={`relative overflow-hidden bg-gray-50 ${isVertical('3') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                  <Image src={blog.img3Url} alt="" fill className="object-cover" sizes={isVertical('3') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} />
                  <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">02</div>
                </div>
              </div>
            )}

            {blog.content3 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content3) }} />}

            {/* img4 */}
            {blog.img4Url && (
              <div className={`my-10 md:my-14 ${isVertical('4') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                <div className={`relative overflow-hidden bg-gray-50 ${isVertical('4') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                  <Image src={blog.img4Url} alt="" fill className="object-cover" sizes={isVertical('4') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} />
                  <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">03</div>
                </div>
              </div>
            )}

            {blog.content4 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content4) }} />}

            <div className="flex items-center justify-center my-12 md:my-16">
              <div className="w-14 h-px bg-gray-300" /><span className="mx-4 text-gray-300 text-[10px]">✦</span><div className="w-14 h-px bg-gray-300" />
            </div>
            <div className="my-8 py-5 border-t border-b border-gray-100 flex items-center justify-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-mono">[ advertisement ]</span>
            </div>

            {/* img5 */}
            {blog.img5Url && (
              <div className={`my-10 md:my-14 ${isVertical('5') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                <div className={`relative overflow-hidden bg-gray-50 ${isVertical('5') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                  <Image src={blog.img5Url} alt="" fill className="object-cover" sizes={isVertical('5') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} />
                  <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">04</div>
                </div>
              </div>
            )}

            {blog.content5 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content5) }} />}

            {/* img6 */}
            {blog.img6Url && (
              <div className={`my-10 md:my-14 ${isVertical('6') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
                <div className={`relative overflow-hidden bg-gray-50 ${isVertical('6') ? 'aspect-[4/5]' : 'aspect-[3/2]'}`}>
                  <Image src={blog.img6Url} alt="" fill className="object-cover" sizes={isVertical('6') ? "(max-width: 768px) 100vw, 420px" : "(max-width: 1024px) 100vw, 85vw"} />
                  <div className="absolute bottom-3 right-4 text-gray-300 font-mono text-[10px] uppercase tracking-[0.3em]">05</div>
                </div>
              </div>
            )}

            {blog.content6 && <div className="blog-read" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(blog.content6) }} />}

            {/* ARTICLE END & SHARE */}
            <div className="mt-16 md:mt-24 flex flex-col items-center">
              <div className="w-10 h-px bg-gray-300 mb-5" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-mono mb-8">— end —</p>
              <ShareMenu />
            </div>
          </article>

          {/* ===== COMMENTS SECTION ===== */}
          <div className="border-t border-gray-100 bg-[#FAFAFA]">
            <div className="max-w-[680px] mx-auto py-12 md:py-16">
              <Comments blogId={blog._id} />
            </div>
          </div>

          {/* ===== SHORT STORIES (With Slider Buttons) ===== */}
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

          {/* ===== MORE FROM [CATEGORY] (With Slider Buttons) ===== */}
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

          {/* ===== RECOMMENDED FOR YOU (With Slider Buttons) ===== */}
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

          {/* ===== FOOTER MINI ===== */}
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-[680px] mx-auto py-8 flex items-center justify-between">
              <Link href="/" className="text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#1e3a8a] transition-colors">
                ← Back to Home
              </Link>
              <p className="text-[10px] text-gray-300 font-mono">LIVING IN WEST © {new Date().getFullYear()}</p>
            </div>
          </div>

        </div>
        {/* --- END BLOG CONTENT AREA --- */}


        {/* --- SIDEBAR ADS AREA (15%) --- */}
        <aside className="hidden lg:block w-[15%] py-4">
          <div className="sticky top-20 flex flex-col gap-6">
            
            {/* Ad Slot 1 */}
            <div className="w-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded">[ Article Ad 160x600 ]</div>
            </div>

            {/* Ad Slot 2 */}
            <div className="w-full min-h-[250px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded">[ Article Ad 300x250 ]</div>
            </div>

          </div>
        </aside>
        {/* --- END SIDEBAR ADS --- */}

      </div>
      {/* ===== END MAIN LAYOUT WRAPPER ===== */}

    </main>
  );
}