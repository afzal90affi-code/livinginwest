
"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, ChevronLeft, ChevronRight, Globe, Check, CloudSun, TrendingUp } from 'lucide-react'; // ✅ TrendingUp add kiya
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  categories: { name: string; slug: string }[];
}

export default function Navbar({ categories }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  // 🌍 Language State & Config
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const langRef = useRef<HTMLDivElement>(null);
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ur', label: 'اردو' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const utilityLinks = [
    { name: "All Categories", href: "/categories" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact", href: "/contact-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const updateScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      return () => el.removeEventListener('scroll', updateScrollState);
    }
  }, [categories]);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const current = trackRef.current.scrollLeft;
    const itemWidth = trackRef.current.firstElementChild?.clientWidth || 140;
    const showCount = Math.floor(trackRef.current.clientWidth / itemWidth);
    const newPos = dir === 'left'
      ? Math.max(0, current - itemWidth * showCount)
      : current + itemWidth * showCount;
    trackRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
  };

  const handleLanguageChange = (code: string, label: string) => {
    setSelectedLang(label);
    setLangOpen(false);
    const host = window.location.hostname;
    document.cookie = `googtrans=/en/${code};path=/;domain=${host}`;
    document.cookie = `googtrans=/en/${code};path=/;domain=.${host}`;
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700 transition-colors duration-300">
      
      {/* LINE 1: Logo & Search */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        
        <button onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }} className="lg:hidden text-gray-900 dark:text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <Image 
            src="/livinginwest-logo.png" 
            alt="Living In West Logo" 
            width={150} 
            height={58} 
            className="h-12 w-auto object-contain"
            priority 
          />
        </Link>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative flex items-center">
              <input 
                id="search-query"
                name="q"
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH STORIES..." 
                className="w-48 lg:w-64 pl-4 pr-10 py-2 bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs uppercase tracking-[0.15em] text-gray-700 dark:text-gray-200 focus:outline-none focus:border-gray-900 dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-xs uppercase tracking-[0.15em] font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden md:inline">{selectedLang}</span>
            </button>
            
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50">
                <ul className="py-1">
                  {languages.map((lang) => (
                    <li key={lang.code}>
                      <button
                        onClick={() => handleLanguageChange(lang.code, lang.label)}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {lang.label}
                        {selectedLang === lang.label && <Check className="w-3 h-3 text-green-600" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <ThemeToggle />

          <button onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileOpen(false); }} className="md:hidden text-gray-900 dark:text-white">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input 
              id="search-query-mobile" 
              name="q" 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="SEARCH STORIES..." 
              className="w-full pl-4 pr-10 py-3 bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs uppercase tracking-widest focus:outline-none focus:border-gray-900 dark:focus:border-white text-gray-700 dark:text-white" 
              autoFocus 
            />
            <button type="submit" aria-label="Search" className="absolute right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* LINE 2: Category Slider (Desktop) */}
      <div className="hidden lg:block border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-10">
            <button
              onClick={() => scroll('left')}
              className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-sm border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-all mr-2 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              ref={trackRef}
              className="flex-1 flex items-center overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex-shrink-0 px-5 h-10 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-semibold whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-sm border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-all ml-2 ${!canScrollRight ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LINE 3: Utility Links (Desktop) */}
      <div className="hidden lg:block bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 h-8">
          {utilityLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-5 shadow-lg absolute top-16 left-0 right-0 z-40 max-h-[80vh] overflow-y-auto pb-6">
          
          {/* 🌟 Horizontal Swiping Categories for Mobile */}
          <div className="mb-6">
            <div className="px-6 mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Categories</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  className={`w-6 h-6 flex items-center justify-center rounded-sm border border-gray-200 dark:border-gray-700 text-gray-400 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className={`w-6 h-6 flex items-center justify-center rounded-sm border border-gray-200 dark:border-gray-700 text-gray-400 ${!canScrollRight ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div
              ref={trackRef} 
              className="flex gap-3 overflow-x-auto px-6 pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-[0.15em] font-semibold rounded-full whitespace-nowrap hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links List */}
          <div className="px-6 border-t border-gray-200 dark:border-gray-700 pt-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-2">Quick Links</p>
            <div className="flex flex-col gap-1">
              {utilityLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-medium py-2.5 border-b border-gray-50 dark:border-gray-800">
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* ✅ WEATHER & MARKETS BUTTONS */}
            <div className="mt-6 flex flex-col gap-3">
              <Link 
                href="/weather" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <CloudSun className="w-5 h-5" />
                Check Weather & Forecast
              </Link>

              {/* ✅ MARKETS BUTTON ADD KIYA HAI */}
              <Link 
                href="/trading-finance" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold shadow-md hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <TrendingUp className="w-5 h-5 text-green-400" />
                View Live Markets
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}