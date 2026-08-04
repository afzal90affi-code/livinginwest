"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, ImageOff, Mail } from 'lucide-react';
import { urlFor } from "@/lib/sanityImage";
import { ShareCardButton } from '@/components/share';

export const dynamic = 'force-dynamic';

// 👇 Types define kiye
interface Category {
  _id: string;
  name: string;
  slug?: string | { current: string };
  emoji?: string;
  image?: { asset?: { _ref: string; url?: string }; url?: string };
}

interface Blog {
  _id: string;
  title?: string;
  slug?: string;
  categoryName?: any; 
  category?: any;
  desc?: string;
  mainImage?: { asset?: { _ref: string; url?: string }; url?: string };
  date?: string;
  newsTime?: string; 
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isMoreStory?: boolean;
  writerName?: string;
  writerSocial?: string;
  heroVideoUrl?: string;
}

interface MappedCategory {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  img: string;
}

interface MappedBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  desc: string;
  img: string;
  date: string;
  timestamp: number;
  newsTime: string; 
  isFeatured: boolean;
  isEditorsPick: boolean;
  isMoreStory: boolean;
  writerName: string;
  writerSocial: string;
  heroVideoUrl: string;
}

export default function HomeContent({ initialCategories, initialBlogs }: { initialCategories: Category[], initialBlogs: Blog[] }) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [subEmail, setSubEmail] = useState(""); // ✅ Subscribe کے لیے اسٹیٹ
  
  const categories: MappedCategory[] = initialCategories.map((c: Category) => {
    let catSlug = 'category';
    if (typeof c.slug === 'string') catSlug = c.slug;
    else if (typeof c.slug === 'object' && c.slug !== null && c.slug.current) catSlug = c.slug.current;
    else if (c.name) catSlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return { id: c._id, name: c.name, slug: catSlug, emoji: c.emoji, img: c.image ? urlFor(c.image).width(600).height(800).url() : "" };
  });

  const blogs: MappedBlog[] = initialBlogs.map((b: Blog) => {
    const blogSlug = b.slug || "";
    const blogDate = b.date ? new Date(b.date) : new Date(0); 
    let blogCat = "general";
    const catField = b.categoryName || b.category;
    if (typeof catField === 'string') blogCat = catField;
    else if (Array.isArray(catField) && catField.length > 0) blogCat = catField.map(c => typeof c === 'string' ? c : (c?.name || c?.title || c?.current || "")).join(', ');
    else if (catField && typeof catField === 'object') blogCat = catField.name || catField.title || catField.current || "general";

    return { 
      id: b._id, title: b.title || "Untitled", slug: blogSlug, category: blogCat.trim(), desc: b.desc || '', 
      img: b.mainImage ? urlFor(b.mainImage).width(800).height(1000).auto('format').url() : "", 
      date: b.date ? blogDate.toLocaleDateString() : "", timestamp: blogDate.getTime(), newsTime: b.newsTime || "", 
      isFeatured: b.isFeatured === true, isEditorsPick: b.isEditorsPick === true, isMoreStory: b.isMoreStory === true,
      writerName: b.writerName || "", 
      writerSocial: b.writerSocial || "", 
      heroVideoUrl: b.heroVideoUrl || ""
    };
  });

  const renderAuthor = (blog: MappedBlog) => {
    if (!blog.writerName) return null;
    if (blog.writerSocial) {
      return (
        <a href={blog.writerSocial} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-[#6D28D9] hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
          By {blog.writerName}
        </a>
      );
    }
    return <span className="font-semibold text-gray-900">By {blog.writerName}</span>;
  };

  const featuredFilter = blogs.filter((b: MappedBlog) => b.isFeatured);
  const heroNews = featuredFilter.length > 0 ? featuredFilter : blogs.slice(0, 3);

  const editorPicks = blogs.filter((b: MappedBlog) => b.isEditorsPick);
  const editorLeft = editorPicks[0] || null;
  const editorRight = editorPicks.slice(1, 3);
  
  const moreStories = blogs.filter((b: MappedBlog) => b.isMoreStory).length > 0 ? blogs.filter((b: MappedBlog) => b.isMoreStory).slice(0, 12) : blogs.slice(0, 12);
  
  const catRow1 = categories.slice(0, 2); 
  const catRow2 = categories.slice(2, 5); 
  const catRow3 = categories.slice(5, 9); 

  useEffect(() => {
    if (heroNews.length <= 1) { setCurrentHeroIndex(0); return; }
    const interval = setInterval(() => { setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroNews.length); }, 5000); 
    return () => clearInterval(interval);
  }, [heroNews.length]);

  // ✅ Subscribe فارم سبمٹ ہینڈلر
  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!subEmail) return alert("Please enter a valid email");
    // یہاں آپ بیکینڈ پر ای میل بھیجنے کا کوڈ لگا سکتے ہیں
    alert("Subscribed successfully! 🎉");
    setSubEmail("");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* AD SLOT 1 */}
      <div className="max-w-7xl mx-auto px-6 my-4">
        <div className="w-full min-h-[90px] bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase">
          [Advertisement - Top Leaderboard Banner]
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-[82%] py-4 space-y-12 md:space-y-16">
          
          {/* ===== SUBSCRIBE BAR (Single Line - Weekly Update) ===== */}
<section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-lg overflow-hidden">
  <div className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
    
    {/* ٹیکسٹ والا حصہ */}
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <Mail className="w-5 h-5 text-gray-300 flex-shrink-0" />
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold">Weekly Updates</span>
        <span className="text-xs text-gray-400 hidden md:inline">— Get the latest directly to your inbox.</span>
      </div>
    </div>

    {/* ان پٹ اور بٹن والا حصہ */}
    <form onSubmit={handleSubSubmit} className="flex w-full sm:w-auto items-center gap-2">
      <input 
        type="email" 
        value={subEmail} 
        onChange={(e) => setSubEmail(e.target.value)} 
        placeholder="Enter your email address" 
        required
        className="px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-white/30 w-full sm:w-64 bg-white/10 text-white placeholder-gray-400 border border-white/20" 
      />
      <button 
        type="submit" 
        className="bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
      >
        Subscribe
      </button>
    </form>

  </div>
</section>

          {/* ===== DAILY UPDATES ===== */}
          <section className="py-4 md:py-8">
            <div className="flex items-center justify-between mb-6 border-b-2 border-gray-900 dark:border-gray-700 pb-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">Daily Updates</h2>
              <Link href="/news" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest font-semibold flex items-center gap-1 transition-colors">
                View All News <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {blogs.slice(0, 5).map((blog) => {
                const dateObj = new Date(blog.timestamp);
                const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const day = dateObj.getDate();

                return (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex items-start gap-5 py-5">
                    <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 border-r-2 border-gray-100 dark:border-gray-800 pr-4 text-center">
                      <span className="text-[10px] font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-widest">{month}</span>
                      <span className="text-3xl font-playfair font-bold text-gray-900 dark:text-white leading-none mt-1">{day}</span>
                      {blog.newsTime && <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">{blog.newsTime.split(',')[1]}</span>}
                    </div>

                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-bold mb-1.5 block">{blog.category}</span>
                      <h3 className="text-lg md:text-xl font-bold leading-snug text-gray-900 dark:text-white group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-1 hidden md:block">{blog.desc}</p>
                    </div>

                    {blog.img && (
                      <div className="hidden md:block w-28 h-24 relative overflow-hidden bg-gray-100 rounded-md flex-shrink-0">
                        <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="120px" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
          
          {/* ===== DISCOUNTS & DEALS SECTION ===== */}
          {blogs.filter(b => b.category === 'Discounts & Offers').length > 0 && (
            <section className="py-4 md:py-8">
              <div className="flex items-center justify-between mb-6 border-b-2 border-gray-900 dark:border-gray-700 pb-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">Discounts & Deals</h2>
                <Link href="/category/Discounts%20%26%20Offers" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest font-semibold flex items-center gap-1 transition-colors">
                  View All Deals <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.filter(b => b.category === 'Discounts & Offers').slice(0, 4).map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                    {blog.img && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="300px" />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Deal</div>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold leading-snug text-gray-900 dark:text-white group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 flex-1">{blog.desc}</p>
                      {blog.newsTime && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          <Clock className="w-3 h-3 mr-1.5" /> {blog.newsTime}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== EDITOR'S PICK (صرف منتخب شدہ خبریں آئیں گی) ===== */}
          {editorPicks.length > 0 && (
            <section className="py-12 md:py-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
              <div className="px-6 md:px-10">
                <div className="flex items-center justify-between mb-8 border-b-2 border-gray-900 dark:border-gray-700 pb-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">Editor&apos;s Pick</h2>
                  <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">Curated Insights</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
                  {editorLeft && (
                    <Link href={`/blog/${editorLeft.slug}`} className="lg:col-span-7 group block">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative mb-5">
                        {editorLeft.img ? (
                          <Image src={editorLeft.img} alt={editorLeft.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" sizes="(max-width: 1024px) 100vw, 50vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>
                        )}
                      </div>
                      <span className="text-[11px] uppercase tracking-widest text-red-600 font-bold mb-2 inline-block">{editorLeft.category}</span>
                      <h3 className="font-playfair text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white group-hover:underline underline-offset-4 decoration-2">{editorLeft.title}</h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">{editorLeft.desc}</p>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {renderAuthor(editorLeft)}
                          {editorLeft.writerName && <span>•</span>}
                          <span>5 min read</span>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="z-10">
                          <ShareCardButton title={editorLeft.title} url={`/blog/${editorLeft.slug}`} />
                        </div>
                      </div>
                    </Link>
                  )}

                  {editorRight.length > 0 && (
                    <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                      <div className="flex flex-col gap-6 divide-y divide-gray-100">
                        {editorRight.map((blog) => (
                          <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex gap-4 pt-6 first:pt-0">
                            <div className="w-28 md:w-32 h-24 md:h-28 shrink-0 overflow-hidden bg-gray-100 relative">
                              {blog.img ? (
                                <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" sizes="128px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-6 h-6" /></div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <span className="text-[10px] uppercase tracking-widest text-red-600 font-bold mb-1">{blog.category}</span>
                              <h3 className="font-playfair text-lg md:text-xl font-bold leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-3">{blog.title}</h3>
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ===== TOPICS / CATEGORIES ===== */}
          <section className="py-16">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-10 border-b border-gray-200 pb-4 text-center">Explore Topics</h2>
              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center gap-4 md:gap-6 w-full">
                  {catRow1.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[48%] md:w-[40%] lg:w-[30%]">
                      {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="30vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white z-20"><h3 className="font-playfair text-xl md:text-2xl font-bold tracking-tight">{cat.name}</h3></div>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-center gap-4 md:gap-6 w-full">
                  {catRow2.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[30%] md:w-[25%] lg:w-[20%]">
                      {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="20vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                    </Link>
                  ))}
                </div>
                {catRow3.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mt-4">
                    {catRow3.map((cat) => (
                      <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100">
                        {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="25vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===== ALL CATEGORY-WISE BLOGS ===== */}
          <section className="py-12 md:py-16 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="px-6 md:px-10">
              <div className="flex flex-col gap-16 md:gap-24">
                {categories.map((cat) => {
                  const catBlogs = blogs
                    .filter(b => {
                      const blogCat = b.category.toLowerCase().trim();
                      const catName = cat.name.toLowerCase().trim();
                      const catSlug = cat.slug.toLowerCase().trim();
                      return blogCat === catName || blogCat === catSlug || blogCat.includes(catName) || blogCat.includes(catSlug);
                    })
                    .sort((a, b) => b.timestamp - a.timestamp);
                  
                  if (catBlogs.length === 0) return null;

                  const mainBlog = catBlogs[0];
                  const sideBlogs = catBlogs.slice(1, 4);

                  return (
                    <div key={cat.id} className="category-block">
                      <div className="flex items-center justify-between mb-8 border-b-2 border-gray-900 pb-3">
                        <Link href={`/category/${cat.slug}`} className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase hover:text-[#6D28D9] transition-colors">
                          {cat.name}
                        </Link>
                        <Link href={`/category/${cat.slug}`} className="text-xs text-gray-500 hover:text-gray-900 uppercase tracking-widest font-semibold flex items-center gap-1 transition-colors">
                          View All <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="hidden lg:grid grid-cols-12 gap-10 lg:gap-12">
                        {mainBlog ? (
                          <div className="col-span-7 group block">
                            <Link href={`/blog/${mainBlog.slug}`}>
                              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative mb-5">
                                {mainBlog.img ? <Image src={mainBlog.img} alt={mainBlog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" sizes="(max-width: 1024px) 100vw, 50vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                              </div>
                              <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-900 group-hover:underline underline-offset-4 decoration-2">{mainBlog.title}</h3>
                              <p className="text-base text-gray-600 mt-3 line-clamp-2 leading-relaxed">{mainBlog.desc}</p>
                            </Link>
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                {renderAuthor(mainBlog)}
                                {mainBlog.writerName && <span>•</span>}
                                <span>{mainBlog.date}</span>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <ShareCardButton title={mainBlog.title} url={`/blog/${mainBlog.slug}`} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="col-span-7 group block">
                            <div className="aspect-[16/10] overflow-hidden bg-gray-50 border border-dashed border-gray-300 relative mb-5 flex items-center justify-center text-gray-400 text-sm">No articles published yet.</div>
                            <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-400">Coming Soon</h3>
                          </div>
                        )}

                        <div className="col-span-5 flex flex-col gap-6 divide-y divide-gray-100">
                          {sideBlogs.length > 0 ? sideBlogs.map((blog) => (
                            <div key={blog.id} className="group flex gap-4 pt-6 first:pt-0">
                              <Link href={`/blog/${blog.slug}`} className="w-28 md:w-32 h-24 md:h-28 shrink-0 overflow-hidden bg-gray-100 relative">
                                {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" sizes="128px" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-6 h-6" /></div>}
                              </Link>
                              <div className="flex-1 flex flex-col justify-center">
                                <Link href={`/blog/${blog.slug}`}>
                                  <h3 className="font-playfair text-lg md:text-xl font-bold leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-3">{blog.title}</h3>
                                </Link>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">{blog.date}</span>
                                  <div onClick={(e) => e.stopPropagation()}><ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} /></div>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs uppercase tracking-widest">More stories coming soon.</div>
                          )}
                        </div>
                      </div>

                      <div className="lg:hidden flex overflow-x-auto gap-5 pb-4 custom-scrollbar -mx-6 px-6 snap-x snap-mandatory">
                        {catBlogs.map((blog) => (
                          <div key={blog.id} className="w-[80%] min-w-[80%] snap-center flex-shrink-0 group">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
                              <Link href={`/blog/${blog.slug}`} className="block">
                                <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                                  {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="80vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-sm">{blog.category}</div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-playfair text-lg font-bold leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{blog.desc}</p>
                                </div>
                              </Link>
                              <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-50 mt-auto">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{blog.date}</span>
                                <div onClick={(e) => e.stopPropagation()}><ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} /></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ===== MORE STORIES ===== */}
          <section className="py-16">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">More Stories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {moreStories.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                    <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                      {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                    <h3 className="font-playfair text-lg font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.desc}</p>
                    
                    <div className="mt-2 border-t border-gray-100 pt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      {renderAuthor(blog)}
                      <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* --- SIDEBAR ADS --- */}
        <aside className="hidden lg:block w-[18%] py-4">
          <div className="sticky top-4 flex flex-col gap-6">
            <div className="w-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded">[ Sidebar Ad 300x600 ]</div>
            </div>
            <div className="w-full min-h-[250px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded">[ Sidebar Ad 300x250 ]</div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}