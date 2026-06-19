"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cloud, Clock } from 'lucide-react';
import { urlFor } from "@/lib/sanityImage";

export default function HomeContent({ initialCategories, initialBlogs }: { initialCategories: any[], initialBlogs: any[] }) {
  const [nyTime, setNyTime] = useState("");
  const [weather, setWeather] = useState({ temp: "--", condition: "" });
  const [externalNews, setExternalNews] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // 👇 INDESTRUCTIBLE SLUG EXTRACTOR
  const categories = initialCategories.map((c: any) => {
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
      img: c.image ? urlFor(c.image).width(600).height(800).url() : `https://picsum.photos/seed/cat-${catSlug}/600/800.jpg` 
    };
  });

  const blogs = initialBlogs.map((b: any) => {
    const blogSlug = b.slug || "";
    return { 
      id: b._id, 
      title: b.title || "Untitled", 
      slug: blogSlug, 
      category: b.categoryName || "general", 
      desc: b.desc || '', 
      img: b.mainImage ? urlFor(b.mainImage).width(800).height(1000).auto('format').url() : `https://picsum.photos/seed/blog-${b._id}/800/1000.jpg`, 
      date: b.date ? new Date(b.date).toLocaleDateString() : "", 
      isFeatured: b.isFeatured === true,
      isEditorsPick: b.isEditorsPick === true,
      isMoreStory: b.isMoreStory === true 
    };
  });

  // 🛠️ BUG FIX: Crash Protection if no featured post is selected in Sanity
  const featuredFilter = blogs.filter((b: any) => b.isFeatured);
  const heroNews = featuredFilter.length > 0 ? featuredFilter : blogs.slice(0, 3);

  const editorPicks = blogs.filter((b: any) => b.isEditorsPick);
  const editorLeft = editorPicks.length > 0 ? editorPicks[0] : (blogs.length > 3 ? blogs[3] : null);
  const editorRight = editorPicks.length > 1 ? editorPicks.slice(1, 3) : blogs.slice(4, 6);
  const moreStories = blogs.filter((b: any) => b.isMoreStory).length > 0 ? blogs.filter((b: any) => b.isMoreStory) : blogs.slice(0, 6);
  
  const catRow1 = categories.slice(0, 2); 
  const catRow2 = categories.slice(2, 5); 
  const catRow3 = categories.slice(5, 9); 

  // --- EFFECTS ---
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
        if (data.articles) setExternalNews(data.articles.map((a: any, i: number) => ({ id: `ext-${i}`, title: a.title, slug: a.url, category: a.source?.name || "World", desc: a.description, img: a.image, date: a.publishedAt?.split('T')[0] })));
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

      {/* 💰 AD SLOT 1: HIGH PAYING TOP LEADERBOARD (Above the fold) */}
      <div className="max-w-7xl mx-auto px-6 my-4">
        <div className="w-full min-h-[90px] bg-gray-50 border border-gray-200/60 flex items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase">
          [Advertisement - Top Leaderboard Banner]
        </div>
      </div>

      {/* ===== HERO SLIDER ===== */}
      {heroNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-6 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
              {heroNews.map((hero, index) => (
                <div key={hero.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <Link href={`/blog/${hero.slug}`} className="block w-full h-full group">
                   <Image src={hero.img} alt={hero.title} fill className="object-contain group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 50vw" priority={index === 0} />
                  </Link>
                </div>
              ))}
            </div>
            <div className="relative flex flex-col justify-center min-h-[300px]">
              {heroNews.map((hero, index) => (
                <div key={hero.id} className={`transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 flex flex-col justify-center pointer-events-none'}`}>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-4">{hero.category}</span>
                  <Link href={`/blog/${hero.slug}`}>
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-[0.9] tracking-tight hover:text-gray-600 transition-colors">{hero.title}</h1>
                  </Link>
                  <p className="text-gray-500 text-base md:text-lg mt-6 leading-relaxed line-clamp-2">{hero.desc}</p>
                  {hero.date && <p className="text-xs text-gray-400 mt-3">{hero.date}</p>}
                  <Link href={`/blog/${hero.slug}`} className="mt-6 group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold hover:text-gray-600 transition-colors w-fit">Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" /></Link>
                </div>
              ))}
              {heroNews.length > 1 && (
                <div className="flex items-center gap-2 mt-8">
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
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">Editor's Pick</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {editorLeft && (
              <Link href={`/blog/${editorLeft.slug}`} className="md:col-span-7 group block">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative mb-4">
                  <Image src={editorLeft.img} alt={editorLeft.title} fill className="object-contain group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 60vw" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{editorLeft.category}</span>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">{editorLeft.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{editorLeft.desc}</p>
              </Link>
            )}
            <div className="md:col-span-5 flex flex-col justify-between gap-6">
              <div className="grid grid-rows-2 gap-6">
                {editorRight.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100 relative mb-4">
                      <Image src={blog.img} alt={blog.title} fill className="object-contain group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 40vw" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                    <h3 className="font-playfair text-xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">{blog.title}</h3>
                  </Link>
                ))}
              </div>
              
              {/* 💰 AD SLOT 2: IN-CONTENT INLINE ADS (High conversion rate) */}
              <div className="w-full min-h-[120px] bg-gray-50 border border-gray-200/60 flex items-center justify-center text-[10px] text-gray-400 tracking-widest uppercase mt-4">
                [Advertisement - In-Feed Banner]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOPICS ===== */}
      <section className="py-16 bg-[#FAFAFA] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-10 border-b border-gray-200 pb-4 text-center">Explore Topics</h2>
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4 md:gap-6 w-full">
              {catRow1.map((cat) => (
                <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[48%] md:w-[40%] lg:w-[30%]">
                  <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="30vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white z-20"><h3 className="font-playfair text-xl md:text-2xl font-bold tracking-tight">{cat.name}</h3></div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center gap-4 md:gap-6 w-full">
              {catRow2.map((cat) => (
                <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[30%] md:w-[25%] lg:w-[20%]">
                  <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="20vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                </Link>
              ))}
            </div>
            {catRow3.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mt-4">
                {catRow3.map((cat) => (
                  <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image src={cat.img} alt={cat.name} fill className="object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" sizes="25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== MORE STORIES ===== */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">More Stories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {moreStories.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                  <Image src={blog.img} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 33vw" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                <h3 className="font-playfair text-lg font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORLD NEWS WITH FIXES ===== */}
      <section className="py-16 bg-[#FAFAFA] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">World News</h2>
          {externalNews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">Add GNEWS API Key in .env.local to load news.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {externalNews.map((news) => (
                <a href={news.slug} key={news.id} target="_blank" rel="noopener noreferrer" className="group block border-b border-gray-100 pb-4">
                  {/* 🛠️ Fixed Layout Shift with relative Next.js Image wrapper style */}
                  <div className="aspect-video overflow-hidden mb-3 bg-gray-100 relative">
                    <Image 
                      src={news.img || "/fallback-news.jpg"} 
                      alt={news.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{news.category}</span>
                  <h3 className="font-playfair text-lg font-bold mt-1 leading-tight text-gray-900 group-hover:text-gray-600 line-clamp-2">{news.title}</h3>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}