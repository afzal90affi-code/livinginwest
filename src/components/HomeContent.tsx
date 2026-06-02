"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Cloud, Clock } from 'lucide-react';
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, limit } from "firebase/firestore";

export default function HomeContent() {
  const [nyTime, setNyTime] = useState("");
  const [weather, setWeather] = useState({ temp: "--", condition: "" });

  const [categories, setCategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [heroNews, setHeroNews] = useState<any[]>([]);
  const [externalNews, setExternalNews] = useState<any[]>([]);

  // --- SLIDER STATE ---
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(d => ({ id: d.id, name: d.data().name, slug: d.data().slug, emoji: d.data().emoji, img: d.data().image || `https://picsum.photos/seed/cat-${d.data().slug}/600/800.jpg` })));

        const blogSnap = await getDocs(query(collection(db, "blogs"), limit(9))); 
        const blogsData = blogSnap.docs.map(d => {
          const data = d.data();
          return { id: d.id, title: data.title || "Untitled", slug: d.id, category: data.category || "general", desc: data.desc || (data.content1 ? String(data.content1).substring(0, 100) + '...' : ''), img: data.img1 || `https://picsum.photos/seed/blog-${d.id}/800/1000.jpg`, date: data.date || "", isFeatured: data.isFeatured === true };
        });
        setBlogs(blogsData);
        setHeroNews(blogsData.filter(b => b.isFeatured).length > 0 ? blogsData.filter(b => b.isFeatured) : blogsData.length > 0 ? [blogsData[0]] : []);
      } catch (error) { console.error(error); }
    };
    fetchData();
    
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
  }, []);

  // --- AUTO SLIDE EFFECT ---
  useEffect(() => {
    if (heroNews.length <= 1) {
      setCurrentHeroIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroNews.length);
    }, 5000); // 5000ms = 5 seconds (Change to 2000 for 2 seconds)
    return () => clearInterval(interval);
  }, [heroNews]);

  useEffect(() => {
    const updateTime = () => setNyTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    const fetchWeather = async () => {
      try { const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true"); const data = await res.json(); const tempF = Math.round((data.current_weather.temperature * 9/5) + 32); setWeather({ temp: `${tempF}°F`, condition: tempF > 60 ? "Sunny" : "Cold" }); } catch { setWeather({ temp: "45°F", condition: "" }); }
    };
    fetchWeather();
    return () => clearInterval(interval);
  }, []);

  const editorLeft = blogs.length > 1 ? blogs[1] : null;
  const editorRight = blogs.length > 2 ? blogs.slice(2, 4) : [];
  const moreStories = blogs.length > 4 ? blogs.slice(4, 9) : [];
  
  const catRow1 = categories.slice(0, 2); 
  const catRow2 = categories.slice(2, 5); 
  const catRow3 = categories.slice(5, 9); 

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      
      {/* Minimal Info Bar */}
      <div className="bg-white border-b border-gray-200 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> NY: <strong className="text-gray-800 ml-1">{nyTime}</strong></span>
          <span className="flex items-center gap-1.5"><Cloud className="w-3 h-3" /> <strong className="text-gray-800 ml-1">{weather.temp} {weather.condition}</strong></span>
        </div>
      </div>

      {/* ===== HALF-HALF HERO SLIDER SECTION ===== */}
      {heroNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left: Image Slider */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
              {heroNews.map((hero, index) => (
                <div key={hero.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <Link href={`/blog/${hero.slug}`} className="block w-full h-full group">
                    <img src={hero.img} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Right: Text Slider */}
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
              
              {/* Slide Dots (Indicators) */}
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

      {/* ===== EDITOR'S PICK (1 Left, 2 Right Stacked) ===== */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">Editor's Pick</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {editorLeft && (
              <Link href={`/blog/${editorLeft.slug}`} className="md:col-span-7 group block">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative mb-4">
                  <img src={editorLeft.img} alt={editorLeft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="px-5 py-2 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Read More</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{editorLeft.category}</span>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">{editorLeft.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{editorLeft.desc}</p>
                {editorLeft.date && <p className="text-xs text-gray-400 mt-2">{editorLeft.date}</p>}
              </Link>
            )}
            <div className="md:col-span-5 grid grid-rows-2 gap-6 md:gap-8">
              {editorRight.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100 relative mb-4">
                    <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="px-5 py-2 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Read More</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                  <h3 className="font-playfair text-xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">{blog.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.desc}</p>
                  {blog.date && <p className="text-xs text-gray-400 mt-2">{blog.date}</p>}
                </Link>
              ))}
            </div>
          </div>
          <div className="my-12 w-full h-24 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">Ad Space - 728x90</div>
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
                  <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" alt={cat.name} loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white"><h3 className="font-playfair text-xl md:text-2xl font-bold tracking-tight">{cat.name}</h3></div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-4 md:gap-6 w-full">
              {catRow2.map((cat) => (
                <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100 w-[30%] md:w-[25%] lg:w-[20%]">
                  <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" alt={cat.name} loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                </Link>
              ))}
            </div>

            {catRow3.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mt-4">
                {catRow3.map((cat) => (
                  <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 brightness-90 group-hover:brightness-100 transition-all duration-500" alt={cat.name} loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white"><h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* More Stories Grid */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">More Stories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {moreStories.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                  <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Read More</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.category}</span>
                <h3 className="font-playfair text-lg font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.desc}</p>
                {blog.date && <p className="text-xs text-gray-400 mt-2">{blog.date}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* World News */}
      <section className="py-16 bg-[#FAFAFA] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">World News</h2>
          {externalNews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">Add GNEWS API Key in .env.local to load news.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {externalNews.map((news) => (
                <a href={news.slug} key={news.id} target="_blank" rel="noopener noreferrer" className="group block border-b border-gray-100 pb-4">
                  <div className="aspect-video overflow-hidden mb-3 bg-gray-100"><img src={news.img} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" /></div>
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