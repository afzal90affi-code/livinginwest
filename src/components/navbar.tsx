"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const utilityLinks = [
    { name: "All Categories", href: "/categories" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact", href: "/contact-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // URL mein query bhej rahe hain
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(""); // Search box clear kar diya
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

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      
      {/* LINE 1: Logo & Search */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-b border-gray-100">
        
        <button onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }} className="lg:hidden text-gray-900">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <Image 
            src="/logo.jpg" 
            alt="Living In West Logo" 
            width={36} 
            height={36} 
            className="rounded-sm object-cover"
            priority 
          />
          <span className="font-playfair text-xl md:text-2xl font-bold tracking-[0.05em]">
            <span className="text-[#1e3a8a]">LIVING IN</span> <span className="text-gray-900">WEST</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative flex items-center">
              <input 
                id="search-query"
                name="q"
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH STORIES..." 
                className="w-48 lg:w-64 pl-4 pr-10 py-2 bg-[#FAFAFA] border border-gray-200 text-xs uppercase tracking-[0.15em] text-gray-700 focus:outline-none focus:border-gray-900 focus:bg-white transition-colors placeholder:text-gray-400"
              />
              {/* Ab Search icon ek button ban gaya hai */}
              <button type="submit" aria-label="Search" className="absolute right-3 text-gray-400 hover:text-gray-900 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <button onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileOpen(false); }} className="md:hidden text-gray-900">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input 
              id="search-query-mobile" 
              name="q" 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="SEARCH STORIES..." 
              className="w-full pl-4 pr-10 py-3 bg-[#FAFAFA] border border-gray-200 text-xs uppercase tracking-widest focus:outline-none focus:border-gray-900" 
              autoFocus 
            />
            {/* Mobile search button */}
            <button type="submit" aria-label="Search" className="absolute right-3 text-gray-400 hover:text-gray-900">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* LINE 2: Category Slider */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-10">

            <button
              onClick={() => scroll('left')}
              className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-sm border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all mr-2 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : ''}`}
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
                  className="flex-shrink-0 px-5 h-10 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors font-semibold whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-sm border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all ml-2 ${!canScrollRight ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>
      </div>

      {/* LINE 3: Utility Links */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 h-8">
          {utilityLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-700 transition-colors font-medium">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 shadow-lg absolute top-16 left-0 right-0 z-40 h-[calc(100vh-4rem)] overflow-y-auto pb-24">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-2 mb-1">Categories</p>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-gray-700 font-semibold py-2 border-b border-gray-50">
                {cat.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Quick Links</p>
              {utilityLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-gray-500 font-medium py-2 block border-b border-gray-50">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}