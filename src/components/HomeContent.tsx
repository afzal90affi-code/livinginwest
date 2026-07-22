"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cloud, Clock, ImageOff } from 'lucide-react';
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
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isMoreStory?: boolean;
  writerName?: string;     // ✅ Writer Name Added
  writerSocial?: string;   // ✅ Writer Social Added
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
  isFeatured: boolean;
  isEditorsPick: boolean;
  isMoreStory: boolean;
  writerName: string;      // ✅ Writer Name Added
  writerSocial: string;    // ✅ Writer Social Added
}

interface ExternalNews {
  id: string;
  title: string;
  slug: string;
  category: string;
  desc?: string;
  img?: string;
  date?: string;
}

interface GNewsArticle {
  title: string;
  url: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
}


export default function HomeContent({ initialCategories, initialBlogs }: { initialCategories: Category[], initialBlogs: Blog[] }) {
  const [nyTime, setNyTime] = useState("");
  const [weather, setWeather] = useState({ temp: "--", condition: "" });
  const [externalNews, setExternalNews] = useState<ExternalNews[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const categories: MappedCategory[] = initialCategories.map((c: Category) => {
    let catSlug = 'category';
    if (typeof c.slug === 'string') {
      catSlug = c.slug;
    } 
    else if (typeof c.slug === 'object' && c.slug !== null && c.slug.current) {
      catSlug = c.slug.current;
    } 
    else if (c.name) {
      catSlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    return { 
      id: c._id, 
      name: c.name, 
      slug: catSlug, 
      emoji: c.emoji, 
      img: c.image ? urlFor(c.image).width(600).height(800).url() : "" 
    };
  });

  const blogs: MappedBlog[] = initialBlogs.map((b: Blog) => {
    const blogSlug = b.slug || "";
    const blogDate = b.date ? new Date(b.date) : new Date(0); 
    
    let blogCat = "general";
    const catField = b.categoryName || b.category;
    
    if (typeof catField === 'string') {
      blogCat = catField;
    } else if (Array.isArray(catField) && catField.length > 0) {
      blogCat = catField.map(c => typeof c === 'string' ? c : (c?.name || c?.title || c?.current || "")).join(', ');
    } else if (catField && typeof catField === 'object') {
      blogCat = catField.name || catField.title || catField.current || "general";
    }

    return { 
      id: b._id, 
      title: b.title || "Untitled", 
      slug: blogSlug, 
      category: blogCat.trim(), 
      desc: b.desc || '', 
      img: b.mainImage ? urlFor(b.mainImage).width(800).height(1000).auto('format').url() : "", 
      date: b.date ? blogDate.toLocaleDateString() : "", 
      timestamp: blogDate.getTime(), 
      isFeatured: b.isFeatured === true,
      isEditorsPick: b.isEditorsPick === true,
      isMoreStory: b.isMoreStory === true,
      // ✅ Mapping Writer details
      writerName: b.writerName || "Staff Writer",
      writerSocial: b.writerSocial || ""
    };
  });

  // ✅ Helper function for Author Link
  const renderAuthor = (blog: MappedBlog) => {
    if (blog.writerSocial) {
      return (
        <a 
          href={blog.writerSocial} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold text-gray-900 hover:text-[#6D28D9] hover:underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          By {blog.writerName}
        </a>
      );
    }
    return <span className="font-semibold text-gray-900">By {blog.writerName}</span>;
  };

  const featuredFilter = blogs.filter((b: MappedBlog) => b.isFeatured);
  const heroNews = featuredFilter.length > 0 ? featuredFilter : blogs.slice(0, 3);

  const editorPicks = blogs.filter((b: MappedBlog) => b.isEditorsPick);
  const editorLeft = editorPicks.length > 0 ? editorPicks[0] : (blogs.length > 3 ? blogs[3] : null);
  const editorRight = editorPicks.length > 1 ? editorPicks.slice(1, 3) : blogs.slice(4, 6);
  
  // 🛠️ More Stories mein ab 12 blogs dikhenge
  const moreStories = blogs.filter((b: MappedBlog) => b.isMoreStory).length > 0 ? blogs.filter((b: MappedBlog) => b.isMoreStory).slice(0, 12) : blogs.slice(0, 12);
  
  const catRow1 = categories.slice(0, 2); 
  const catRow2 = categories.slice(2, 5); 
  const catRow3 = categories.slice(5, 9); 

  useEffect(() => {
    if (heroNews.length <= 1) { setCurrentHeroIndex(0); return; }
    const interval = setInterval(() => { setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroNews.length); }, 5000); 
    return () => clearInterval(interval);
  }, [heroNews.length]);

  useEffect(() => {
    const updateTime = () => setNyTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const fetchWeather = async () => {
      try { 
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true"); 
        const data = await res.json(); 
        const tempF = Math.round((data.current_weather.temperature * 9/5) + 32); 
        setWeather({ temp: `${tempF}°F`, condition: tempF > 60 ? "Sunny" : "Cold" }); 
      } catch { 
        setWeather({ temp: "45°F", condition: "" }); 
      }
    };
    fetchWeather();
    
    const fetchNews = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
      if (!apiKey) return;
      try {
        const res = await fetch(`https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&max=6&apikey=${apiKey}`);
        const data = await res.json();
        if (data.articles) setExternalNews(data.articles.map((a: GNewsArticle, i: number) => ({ id: `ext-${i}`, title: a.title, slug: a.url, category: a.source?.name || "World", desc: a.description, img: a.image, date: a.publishedAt?.split('T')[0] })));
      } catch (error) { console.error(error); }
    };
    fetchNews();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      
      {/* Minimal Info Bar */}
      <div className="bg-white border-b border-gray-200 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> NY: <strong className="text-gray-800 ml-1">{nyTime}</strong></span>
          <span className="flex items-center gap-1.5"><Cloud className="w-3 h-3" /> <strong className="text-gray-800 ml-1">{weather.temp} {weather.condition}</strong></span>
        </div>
      </div>

      {/* AD SLOT 1 (Top Full Width Leaderboard) */}
      <div className="max-w-7xl mx-auto px-6 my-4">
        <div className="w-full min-h-[90px] bg-gray-50 border border-gray-200/60 flex items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase">
          [Advertisement - Top Leaderboard Banner]
        </div>
      </div>

      {/* ===== MAIN LAYOUT: 82% Content + 18% Sticky Sidebar Ads ===== */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        
        {/* --- MAIN CONTENT (82%) --- */}
        <div className="w-full lg:w-[82%] py-4 space-y-12 md:space-y-16">
          
          {/* ===== HERO SLIDER ===== */}
          {heroNews.length > 0 && (
            <section className="py-4 md:py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
                
                <div className="relative aspect-square md:aspect-[16/10] overflow-hidden bg-gray-100 border border-gray-100 rounded-lg shadow-sm">
                  {heroNews.map((hero, index) => (
                    <div key={hero.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                      <Link href={`/blog/${hero.slug}`} className="block w-full h-full group">
                       {hero.img ? (
                         <Image 
                           src={hero.img} 
                           alt={hero.title} 
                           fill 
                           className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                           sizes="(max-width: 768px) 100vw, 40vw" 
                           priority={index === 0} 
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>
                       )}
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="relative flex flex-col justify-center min-h-[200px]">
                  {heroNews.map((hero, index) => (
                    <div key={hero.id} className={`transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 flex flex-col justify-center pointer-events-none'}`}>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">{hero.category}</span>
                      <Link href={`/blog/${hero.slug}`}>
                        <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-[0.9] tracking-tight hover:text-gray-600 transition-colors">{hero.title}</h1>
                      </Link>
                      <p className="text-gray-500 text-sm md:text-base mt-4 leading-relaxed line-clamp-2">{hero.desc}</p>
                      {hero.date && <p className="text-xs text-gray-400 mt-2">{hero.date}</p>}
                      
                      <div className="mt-5 flex items-center gap-6">
                        <Link href={`/blog/${hero.slug}`} className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold hover:text-gray-600 transition-colors w-fit">Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" /></Link>
                        <ShareCardButton title={hero.title} url={`/blog/${hero.slug}`} />
                      </div>
                    </div>
                  ))}
                  {heroNews.length > 1 && (
                    <div className="flex items-center gap-2 mt-6">
                      {heroNews.map((_, index) => (
                        <button key={index} onClick={() => setCurrentHeroIndex(index)} className={`h-1 rounded-full transition-all duration-300 ${index === currentHeroIndex ? 'bg-gray-900 w-8' : 'bg-gray-300 w-4 hover:bg-gray-400'}`}></button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
          
          {/* ===== EDITOR'S PICK ===== */}
          <section className="py-12 md:py-16 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="px-6 md:px-10">
              <div className="flex items-center justify-between mb-8 border-b-2 border-gray-900 pb-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase">Editor&apos;s Pick</h2>
                <span className="hidden md:block text-xs text-gray-500 uppercase tracking-widest font-semibold">Curated Insights</span>
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
                    <h3 className="font-playfair text-3xl md:text-4xl font-bold leading-tight text-gray-900 group-hover:underline underline-offset-4 decoration-2">{editorLeft.title}</h3>
                    <p className="text-base text-gray-600 mt-3 line-clamp-2 leading-relaxed">{editorLeft.desc}</p>
                    
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {/* ✅ Writer Name Dynamic Link */}
                        {renderAuthor(editorLeft)}
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="z-10">
                        <ShareCardButton title={editorLeft.title} url={`/blog/${editorLeft.slug}`} />
                      </div>
                    </div>
                  </Link>
                )}

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
              </div>
            </div>
          </section>

          {/* ===== TOPICS / CATEGORIES ===== */}
          <section className="py-16">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-10 border-b border-gray-200 pb-4 text-center">Explore Topics</h2>
              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center gap-4 md:gap-6 w-full">
                  {catRow1.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[48%] md:w-[40%] lg:w-[30%]">
                      {cat.img ? (
                        <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="30vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white z-20"><h3 className="font-playfair text-xl md:text-2xl font-bold tracking-tight">{cat.name}</h3></div>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-center gap-4 md:gap-6 w-full">
                  {catRow2.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[30%] md:w-[25%] lg:w-[20%]">
                      {cat.img ? (
                        <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="20vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                    </Link>
                  ))}
                </div>
                {catRow3.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mt-4">
                    {catRow3.map((cat) => (
                      <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100">
                        {cat.img ? (
                          <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="25vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>
                        )}
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

                      {/* DESKTOP LAYOUT (Grid) */}
                      <div className="hidden lg:grid grid-cols-12 gap-10 lg:gap-12">
                        {mainBlog ? (
                          <div className="col-span-7 group block">
                            <Link href={`/blog/${mainBlog.slug}`}>
                              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative mb-5">
                                {mainBlog.img ? (
                                  <Image src={mainBlog.img} alt={mainBlog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" sizes="(max-width: 1024px) 100vw, 50vw" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>
                                )}
                              </div>
                              <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-900 group-hover:underline underline-offset-4 decoration-2">
                                {mainBlog.title}
                              </h3>
                              <p className="text-base text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                                {mainBlog.desc}
                              </p>
                            </Link>
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                {/* ✅ Writer Name Dynamic Link */}
                                {renderAuthor(mainBlog)}
                                <span>•</span>
                                <span>{mainBlog.date}</span>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <ShareCardButton title={mainBlog.title} url={`/blog/${mainBlog.slug}`} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="col-span-7 group block">
                            <div className="aspect-[16/10] overflow-hidden bg-gray-50 border border-dashed border-gray-300 relative mb-5 flex items-center justify-center text-gray-400 text-sm">
                              No articles published yet.
                            </div>
                            <h3 className="font-playfair text-2xl md:text-3xl font-bold leading-tight text-gray-400">
                              Coming Soon
                            </h3>
                          </div>
                        )}

                        <div className="col-span-5 flex flex-col gap-6 divide-y divide-gray-100">
                          {sideBlogs.length > 0 ? sideBlogs.map((blog) => (
                            <div key={blog.id} className="group flex gap-4 pt-6 first:pt-0">
                              <Link href={`/blog/${blog.slug}`} className="w-28 md:w-32 h-24 md:h-28 shrink-0 overflow-hidden bg-gray-100 relative">
                                {blog.img ? (
                                  <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" sizes="128px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-6 h-6" /></div>
                                )}
                              </Link>
                              <div className="flex-1 flex flex-col justify-center">
                                <Link href={`/blog/${blog.slug}`}>
                                  <h3 className="font-playfair text-lg md:text-xl font-bold leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-3">
                                    {blog.title}
                                  </h3>
                                </Link>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
                                    {blog.date}
                                  </span>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs uppercase tracking-widest">
                              More stories coming soon.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MOBILE LAYOUT (Premium Swipeable Cards Style) */}
                      <div className="lg:hidden flex overflow-x-auto gap-5 pb-4 custom-scrollbar -mx-6 px-6 snap-x snap-mandatory">
                        {catBlogs.map((blog) => (
                          <div key={blog.id} className="w-[80%] min-w-[80%] snap-center flex-shrink-0 group">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
                              <Link href={`/blog/${blog.slug}`} className="block">
                                <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                                  {blog.img ? (
                                    <Image 
                                      src={blog.img} 
                                      alt={blog.title} 
                                      fill 
                                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                      sizes="80vw" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>
                                  )}
                                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-sm">
                                    {blog.category}
                                  </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4">
                                  <h3 className="font-playfair text-lg font-bold leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                                    {blog.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{blog.desc}</p>
                                </div>
                              </Link>
                              
                              {/* Footer with Date & Share */}
                              <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-50 mt-auto">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{blog.date}</span>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                                </div>
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

          {/* ===== MORE STORIES (Increased to 12 items) ===== */}
          <section className="py-16">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">More Stories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {moreStories.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                    <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                      {blog.img ? (
                        <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                    <h3 className="font-playfair text-lg font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.desc}</p>
                    
                    <div className="mt-2 border-t border-gray-100 pt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-gray-500">{renderAuthor(blog)}</span>
                      <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </div>
        {/* --- END MAIN CONTENT --- */}


        {/* --- SIDEBAR ADS AREA (18%) --- */}
        <aside className="hidden lg:block w-[18%] py-4">
          {/* Sticky wrapper so ads stay in view while scrolling */}
          <div className="sticky top-4 flex flex-col gap-6">
            
            {/* Ad Slot 2 (Sidebar 1) */}
            <div className="w-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded">[ Sidebar Ad 300x600 ]</div>
            </div>

            {/* Ad Slot 3 (Sidebar 2) */}
            <div className="w-full min-h-[250px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase py-4">
              <span className="mb-2 text-gray-300 text-[8px]">Advertisement</span>
              <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded">[ Sidebar Ad 300x250 ]</div>
            </div>

          </div>
        </aside>
        {/* --- END SIDEBAR ADS --- */}

      </div>
      {/* ===== END MAIN LAYOUT WRAPPER ===== */}

    </div>
  );
}