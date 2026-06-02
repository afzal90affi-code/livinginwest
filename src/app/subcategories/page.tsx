"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";

export default function SubCategoriesPage() {
  const [catList, setCatList] = useState<any[]>([]);
  const [subCatList, setSubCatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCatList(catSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));

        const subSnap = await getDocs(collection(db, "subcategories"));
        setSubCatList(subSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      } catch (error: any) {
        console.error("Error fetching subcategories:", error);
        setFetchError(error.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-white/40 mb-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-white/80">Sub-Categories</span>
        </div>

        {/* Page Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold tracking-tight">Explore Topics</h1>
          <p className="text-white/40 mt-2 md:mt-3 text-sm md:text-base max-w-xl">Dive deep into specific niches and find exactly what you're looking for.</p>
        </div>

        {/* Error Display */}
        {fetchError && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            <h2 className="text-xl font-bold mb-2">🚨 Error</h2>
            <p className="text-sm">{fetchError}</p>
          </div>
        )}

        {/* Main Content */}
        {!fetchError && catList.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] rounded-2xl border border-white/5">
            <span className="text-5xl block mb-4">🚀</span>
            <p className="text-white/40">No categories found. Add them from Admin Panel.</p>
          </div>
        ) : (
          catList.map(cat => {
            const filteredSubs = subCatList.filter(sub => sub.parentId === cat.id);
            if (filteredSubs.length === 0) return null;

            return (
              <section key={cat.id} className="mb-16 last:mb-0">
                
                {/* Category Section Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl">{cat.emoji}</span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{cat.name}</h2>
                  </div>
                  <Link href={`/category/${cat.slug}`} className="text-xs md:text-sm font-medium text-white/50 hover:text-[#6D28D9] transition-colors flex items-center gap-1 group">
                    View All 
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Modern Bento-Style Sub-category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredSubs.map(sub => (
                    <Link href={`/category/${cat.slug}?sub=${sub.slug}`} key={sub.id} className="group block">
                      <div className="relative bg-[#131313] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#6D28D9]/50 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(109,40,217,0.15)] h-full flex flex-col">
                        
                        {/* Visual Top Area with Glow Effect */}
                        <div className="relative h-28 md:h-36 bg-gradient-to-br from-white/[0.02] to-transparent flex items-center justify-center overflow-hidden border-b border-white/[0.04]">
                          
                          {/* Decorative Glowing Orbs (Modern UI Trend) */}
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#6D28D9]/10 rounded-full blur-3xl group-hover:bg-[#6D28D9]/30 transition-all duration-500 pointer-events-none"></div>
                          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none"></div>
                          
                          {sub.image ? (
                            <img 
                              src={sub.image} 
                              alt={sub.name} 
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 relative z-10" 
                              loading="lazy" 
                            />
                          ) : (
                            <span className="text-5xl md:text-6xl opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-lg relative z-10">
                              {sub.emoji}
                            </span>
                          )}
                        </div>

                        {/* Text Content Area */}
                        <div className="p-4 md:p-5 bg-[#0F0F0F] flex-1 flex flex-col justify-center">
                          <h3 className="font-bold text-sm md:text-base text-white/90 group-hover:text-white transition-colors">
                            {sub.name}
                          </h3>
                          {sub.desc && (
                            <p className="text-[10px] md:text-xs text-white/30 mt-1.5 line-clamp-2 leading-relaxed">
                              {sub.desc}
                            </p>
                          )}
                        </div>
                        
                      </div>
                    </Link>
                  ))}
                </div>

              </section>
            );
          })
        )}
      </div>
    </main>
  );
}