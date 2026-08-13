import { Metadata } from 'next';
import { client } from "@/lib/sanityClient";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
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


 // ✅ ULTIMATE FIX: ChatGPT copy-paste ke saare issues yahan automatically fix honge
const cleanQuillHtml = (html: string): string => {
  if (!html) return "";
  
  // 1. <wbr> tags remove karo (ye words ko beech se todte hain)
  let cleanHtml = html.replace(/<wbr\s*\/?>/gi, ' ');

  // 2. ChatGPT ke Non-breaking spaces (&nbsp;) ko normal space banao
  cleanHtml = cleanHtml.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');

  // 3. Zero-width spaces aur soft hyphens (invisible characters) hatao
  cleanHtml = cleanHtml.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

  // 4. Sabhi tags (p, span, div) se word-break aur text-align styles strictly filter karo
  cleanHtml = cleanHtml.replace(/style="([^"]*)"/gi, (match, style) => {
    const cleanStyle = style
      .split(';')
      .map((s: string) => s.trim())
      .filter((prop: string) => !/^(word-break|overflow-wrap|white-space|hyphens|text-align)\s*:/i.test(prop))
      .join('; ');
    return cleanStyle ? `style="${cleanStyle}"` : '';
  });

  // 5. ChatGPT ke <p style="text-align: justify;"> ko class mein convert karo taake mobile par hum ise left kar sakein
  let normalizedHtml = cleanHtml.replace(
    /<p[^>]*class="[^"]*ql-align-justify[^"]*"[^>]*>/gi,
    '<p class="ql-align-justify">'
  );
  normalizedHtml = normalizedHtml.replace(
    /style="([^"]*text-align:\s*justify[^"]*)"/gi,
    'class="ql-align-justify"'
  );

  // 6. Image par Lazy Loading lagayen
  normalizedHtml = normalizedHtml.replace(/<img/gi, '<img loading="lazy" decoding="async"');

  // 7. Sanity Images ko compress karen
  normalizedHtml = normalizedHtml.replace(/src="(https:\/\/cdn\.sanity\.io\/[^"]+)"/g, (match, url) => {
    if (!url.includes('?')) {
      return `src="${url}?w=800&auto=format&q=70"`;
    }
    return match;
  });

  // 8. Image styles ko clean karna
  return normalizedHtml.replace(/(<img[^>]*?)style="([^"]*)"/gi, (match, start, style) => {
    const allowedStyles = style
      .split(';')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .filter((prop: string) => /^(float|width|max-width|margin|display)\s*:/i.test(prop))
      .join('; ');
    return allowedStyles ? `${start}style="${allowedStyles}"` : start;
  });
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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
  const finalTitle = blog.metaTitle || blog.title;
  const finalDesc = blog.metaDesc || blog.desc || "Read the latest insights and stories on Living In West.";
  const keywordsArray = blog.keywords ? blog.keywords.split(',').map(k => k.trim()) : [];

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: keywordsArray,
    alternates: { canonical: `${baseUrl}/blog/${blog.slug}` },
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: `${baseUrl}/blog/${blog.slug}`,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: finalTitle }],
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

  const blog: BlogData | null = await client.fetch(blogQuery, { slug: params.slug }, { next: { revalidate: 60 } });

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
  const catBlogs: BlogData[] = await client.fetch(catBlogsQuery, { cat: blog.category, slug: params.slug }, { next: { revalidate: 60 } });

  const recBlogsQuery = `*[_type == "blog" && slug.current != $slug && coalesce(category->slug.current, category) != $cat && isPublished != false] | order(coalesce(sortOrder, 0) asc) [0...5] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url, writerName, writerSocial
  }`;
  const recBlogs: BlogData[] = await client.fetch(recBlogsQuery, { cat: blog.category, slug: params.slug }, { next: { revalidate: 60 } });

  const moreBlogsQuery = `*[_type == "blog" && slug.current != $slug && isPublished != false] | order(date desc) [0...20] {
    _id, title, "slug": slug.current, category, subCategory, desc, date, "mainImageUrl": img1.asset->url, writerName, writerSocial
  }`;
  const fetchedMoreBlogs: BlogData[] = await client.fetch(moreBlogsQuery, { slug: params.slug }, { next: { revalidate: 60 } });

  const groupedBySubCat: Record<string, BlogData[]> = {};
  fetchedMoreBlogs.forEach(b => {
    const key = b.subCategory || b.category || 'General';
    if (!groupedBySubCat[key]) groupedBySubCat[key] = [];
    groupedBySubCat[key].push(b);
  });

  const moreBlogs: BlogData[] = [];
  let idx = 0;
  let keepGoing = true;
  const maxItems = 8;
  while (keepGoing && moreBlogs.length < maxItems) {
    keepGoing = false;
    for (const key in groupedBySubCat) {
      if (groupedBySubCat[key][idx]) {
        moreBlogs.push(groupedBySubCat[key][idx]);
        keepGoing = true;
        if (moreBlogs.length >= maxItems) break;
      }
    }
    idx++;
  }

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

  const SwipeCard = ({ b, widthClass }: { b: BlogData, widthClass: string }) => {
    const categoryText = b.category && b.subCategory ? `${b.category} - ${b.subCategory}` : b.subCategory || b.category;
    return (
      <div className={`${widthClass} snap-start flex flex-col`}>
        <Link href={`/blog/${b.slug}`} className="group block">
          <div className="relative aspect-[3/2] overflow-hidden bg-gray-50 mb-3 rounded-sm">
            {b.mainImageUrl
              ? <Image src={b.mainImageUrl} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="280px" />
              : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">📝</div>
            }
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#1e3a8a] font-bold mb-1">{categoryText}</p>
          <h4 className="text-[15px] leading-[1.3] font-playfair font-bold text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">{b.title}</h4>
          {b.date && <p className="text-[10px] text-gray-400 mt-1.5">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
        </Link>
        <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Share</span>
          <ShareCardButton title={b.title} url={`/blog/${b.slug}`} />
        </div>
      </div>
    );
  };

  const blogSections: Array<{ content?: string; imageKey: number; imageUrl?: string }> = [];
  for (let i = 1; i <= 10; i++) {
    const blogEntry = blog as BlogData & Record<string, string | undefined>;
    const content = blogEntry[`content${i}`] as string | undefined;
    const imageKey = i + 1;
    const imageUrl = i < 10 ? (blogEntry[`img${imageKey}Url`] as string | undefined) : undefined;

    if (content || imageUrl) {
      blogSections.push({ content, imageKey, imageUrl });
    }
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.desc,
    "image": blog.mainImageUrl,
    "datePublished": blog.date,
    "author": { "@type": "Person", "name": blog.writerName || "Living In West" },
    "publisher": { "@type": "Organization", "name": "Living In West" }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 blog-no-scroll overflow-x-hidden">
      
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
            <h1 className="text-[30px] md:text-[46px] leading-[1.08] font-playfair font-bold tracking-[-0.025em] text-gray-900 mb-5 break-words">
              {blog.title}
            </h1>
            {blog.desc && (
              <p className="text-[14px] md:text-[16px] text-gray-500 leading-[1.7] mb-8 max-w-lg mx-auto break-words">
                {blog.desc}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pb-8 border-b border-gray-100">
              <div className="relative w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
           <Image 
                  src="/logo.jpg" 
                 alt="Living In West" 
                 fill 
                 className="object-cover" 
                  sizes="40px" 
                              />
              </div>
              <div className="text-left">
                {renderAuthor(blog)}
                <p className="text-[11px] text-gray-500">Editorial Team</p>
              </div>
            </div>
          </div>

          {blog.mainImageUrl && (
            <div className={`my-8 md:my-10 ${isVertical('1') ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
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

          <article className="w-full max-w-[760px] mx-auto pt-8 md:pt-10 pb-6 md:pb-8 overflow-hidden">
            
            {blogSections.map((section, index) => (
              <div key={index}>
                {section.content && (
                  <div className="blog-read [&_p]:!mb-3 [&_h2]:!mt-5 [&_h2]:!mb-2 [&_h3]:!mt-4 [&_h3]:!mb-2" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(section.content) }} />
                )}

                {section.imageUrl && (
                  <div className={`my-6 md:my-8 ${isVertical(String(section.imageKey)) ? 'max-w-[420px] mx-auto' : 'w-full max-w-[1000px] mx-auto'}`}>
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

                {((index + 1) % 2 === 0) && (index < blogSections.length - 1) && (
                  <>
                    <div className="flex items-center justify-center my-8 md:my-10">
                      <div className="w-14 h-px bg-gray-300" /><span className="mx-4 text-gray-300 text-[10px]">✦</span><div className="w-14 h-px bg-gray-300" />
                    </div>
                    <div className="my-6 py-4 border-t border-b border-gray-100 flex items-center justify-center">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-mono">[ advertisement ]</span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* ✅ ARTICLE END: Smart Card with Writer & Share */}
            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gray-200"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-mono">End of Article</span>
                <div className="w-12 h-px bg-gray-200"></div>
              </div>

              {/* Writer Info & Share/Embed in a Smart Card */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image 
                        src="/logo.jpg" 
                        alt="Living In West" 
                         fill 
                         className="object-cover" 
                         sizes="40px" 
                       />
                  </div>
                  <div className="text-left">
                    {renderAuthor(blog)}
                    <p className="text-[11px] text-gray-500">Editorial Team</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <EmbedBlogButton slug={blog.slug?.current || params.slug} />
                  <ShareMenu />
                </div>
              </div>

              {/* ✅ COMMENTS SECTION (Immediately Below) */}
              <div className="w-full">
                <Comments blogId={blog._id} />
              </div>
            </div>
          </article>

          {/* ✅ MORE BLOGS (Interleaved by Subcategory) */}
          {moreBlogs.length > 0 && (
            <div className="border-t border-gray-100 bg-white">
              <div className="max-w-[1000px] mx-auto py-12 md:py-16">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold block mb-2">Quick Reads</span>
                    <h2 className="text-[24px] md:text-[32px] font-playfair font-bold text-gray-900 leading-tight">
                      More Blogs
                    </h2>
                  </div>
                </div>
                <Slider>
                  {moreBlogs.map((b) => (
                    <SwipeCard key={b._id} b={b} widthClass="min-w-[260px] max-w-[260px]" />
                  ))}
                </Slider>
              </div>
            </div>
          )}

          {/* ✅ MORE FROM CATEGORY */}
          {catBlogs.length > 0 && (
            <div className="border-t border-gray-100 bg-[#FAFAFA]">
              <div className="max-w-[1000px] mx-auto py-12 md:py-16">
                <div className="flex items-end justify-between mb-6">
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

          {/* ✅ RECOMMENDED BLOGS */}
          {recBlogs.length > 0 && (
            <div className="border-t border-gray-100 bg-white">
              <div className="max-w-[1000px] mx-auto py-12 md:py-16">
                <div className="flex items-end justify-between mb-6">
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
            <div className="max-w-[680px] mx-auto py-6 flex items-center justify-between">
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