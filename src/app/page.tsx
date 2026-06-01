"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Cloud, Clock, Newspaper, Camera, MessageCircle, Play, Globe } from 'lucide-react';
import { db } from "@/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [nyTime, setNyTime] = useState("");
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading..." });
  const [currentSlide, setCurrentSlide] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [heroNews, setHeroNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const catsData = catSnap.docs.map(d => {
          const data = d.data();
          return { id: d.id, name: data.name, slug: data.slug, emoji: data.emoji, img: data.image || `https://picsum.photos/seed/cat-${data.slug}/300/400.jpg` };
        });
        setCategories(catsData);

        const blogSnap = await getDocs(collection(db, "blogs"));
        const blogsData = blogSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, title: data.title, slug: d.id, category: data.category,
            desc: data.desc || (data.content ? data.content.substring(0, 100) + '...' : ''),
            img: data.img1 || `https://picsum.photos/seed/blog-${d.id}/800/500.jpg`,
            date: data.date, isFeatured: data.isFeatured || false
          };
        });
        setBlogs(blogsData);

        const featuredBlogs = blogsData.filter(b => b.isFeatured).map(b => ({
          ...b, tag: b.isFeatured ? "⭐ FEATURED" : "📰 NEW", img: b.img.replace("/800/500", "/1400/700") 
        }));
        setHeroNews(featuredBlogs);
      } catch (error) { console.error("Error fetching data from Firebase:", error); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setNyTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true");
        const data = await res.json();
        const tempF = Math.round((data.current_weather.temperature * 9/5) + 32);
        setWeather({ temp: `${tempF}°F`, condition: tempF > 60 ? "Sunny" : "Cold" });
      } catch { setWeather({ temp: "45°F", condition: "Cloudy" }); }
    };
    fetchWeather();

    if (heroNews.length > 0) {
      const slideInterval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % heroNews.length); }, 5000);
      return () => { clearInterval(timeInterval); clearInterval(slideInterval); };
    }
    return () => { clearInterval(timeInterval); };
  }, [heroNews]);

  return (
    <main className="min-h-screen">
      {/* ===== TOP INFO BAR ===== */}
      <div className="bg-[#050505] border-b border-white/5 py-2 text-xs text-white/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#6D28D9]" /> NY: <strong className="text-white/80">{nyTime}</strong></span>
            <span className="flex items-center gap-1.5"><Cloud className="w-3 h-3 text-[#4ADE80]" /> <strong className="text-white/80">{weather.temp} {weather.condition}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-3 h-3 text-red-400" />
            <span className="text-red-400 font-bold">LIVE:</span>
            <span className="truncate max-w-[300px] md:max-w-none">{heroNews.length > 0 ? heroNews[currentSlide].title : "Welcome to Living In West"}</span>
          </div>
        </div>
      </div>

      {/* ===== HERO NEWS SLIDER ===== */}
      {heroNews.length > 0 && (
        <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-[#050505]">
          {heroNews.map((news, index) => (
            <div key={news.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={news.img} alt={news.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-4xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase animate-pulse">{news.tag}</span>
                    <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full uppercase">{news.category}</span>
                  </div>
                  <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 drop-shadow-lg">{news.title}</h1>
                  <p className="text-white/70 text-sm md:text-lg max-w-2xl mb-6">{news.desc}</p>
                  <Link href={`/blog/${news.slug}`}>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A0A0A] text-sm font-semibold rounded-full hover:bg-white/90 transition-colors">
                      Read Full Story <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-6 right-8 md:right-16 flex items-center gap-2 z-20">
            {heroNews.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ===== CATEGORIES GRID ===== */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-4xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.id} className="relative rounded-2xl overflow-hidden aspect-[3/4] group border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                <img src={cat.img} className="absolute inset-0 w-full h-full object-cover brightness-[0.95] group-hover:scale-110 group-hover:brightness-[0.65] transition-all duration-700" alt={cat.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <span className="text-3xl block mb-2">{cat.emoji}</span>
                  <h3 className="text-sm font-semibold">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST BLOGS (CATEGORY STYLE CARDS) ===== */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-4xl font-bold mb-12">Latest Articles</h2>
          
          {blogs.length === 0 ? (
            <p className="text-center text-white/40">No blogs found. Add some from the Admin Panel!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {blogs.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id} className="relative rounded-2xl overflow-hidden aspect-[3/4] group border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                  {/* Image with Dark Overlay & Hover Effects */}
                  <img src={blog.img} className="absolute inset-0 w-full h-full object-cover brightness-[0.95] group-hover:scale-110 group-hover:brightness-[0.95] transition-all duration-700" alt={blog.title} />
                  
                  {/* Gradient Overlay from Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
                  
                  {/* Blog Content at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-[#6D28D9]/30 text-white text-[10px] font-bold rounded-full uppercase backdrop-blur-sm">{blog.category}</span>
                      <span className="text-[10px] text-white/40">{blog.date}</span>
                    </div>
                    <h3 className="font-semibold text-base leading-snug line-clamp-3 group-hover:text-[#6D28D9] transition-colors">{blog.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}