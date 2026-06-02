"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const mainNavLinks = [
    { name: "Food", href: "/category/food" },
    { name: "Travel", href: "/category/travel" },
    { name: "Automotive", href: "/category/automotive" },
    { name: "Finance", href: "/category/finance" },
    { name: "Health", href: "/category/health" },
    { name: "Entertainment", href: "/category/entertainment" },
  ];

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

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      
      {/* LINE 1: Logo & Search */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-b border-gray-100">
        
        {/* Left: Hamburger (Mobile) */}
        <button onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }} className="lg:hidden text-gray-900">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Center/Left: Logo & Brand Name */}
        <Link href="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          
          {/* Logo Image - Make sure logo.jpg is in /public folder */}
          <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-sm object-cover" />
          
          {/* Brand Text with Dark Blue "LIVING IN" */}
          <span className="font-playfair text-xl md:text-2xl font-bold tracking-[0.05em]">
            <span className="text-[#1e3a8a]">LIVING IN</span> <span className="text-gray-900">WEST</span>
          </span>
        </Link>

        {/* Right: Desktop Search Bar & Mobile Search Icon */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH STORIES..." 
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-[#FAFAFA] border border-gray-200 text-xs uppercase tracking-[0.15em] text-gray-700 focus:outline-none focus:border-gray-900 focus:bg-white transition-colors placeholder:text-gray-400"
              />
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
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SEARCH STORIES..." className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 text-xs uppercase tracking-widest focus:outline-none focus:border-gray-900" autoFocus />
          </form>
        </div>
      )}

      {/* LINE 2: Main Categories (Slightly Larger Text - text-xs) */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 h-10">
          {mainNavLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors font-semibold">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* LINE 3: Utility Links (Slightly Larger Text - text-[11px]) */}
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
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 shadow-lg absolute top-16 left-0 right-0 z-40 h-screen">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-2 mb-1">Categories</p>
            {mainNavLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-gray-700 font-semibold py-2 border-b border-gray-50">
                {link.name}
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