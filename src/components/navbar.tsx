"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, X, Menu, ChevronDown } from 'lucide-react';

const categories = [
  { name: "Food", slug: "food", emoji: "🍔" },
  { name: "Travel", slug: "travel", emoji: "✈️" },
  { name: "Automotive", slug: "automotive", emoji: "🚗" },
  { name: "Finance", slug: "finance", emoji: "💰" },
  { name: "Health", slug: "health", emoji: "🧘" },
  { name: "Entertainment", slug: "entertainment", emoji: "🎬" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=site:livinginwest.com+${encodeURIComponent(searchQuery)}`, '_blank');
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setCatDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0A0A]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={closeMobile}>
  <img 
    src="/logo.jpg" 
    alt="LivingInWest Logo" 
    className="h-8 w-auto rounded-lg object-contain" 
  />
  <span className="font-playfair text-xl font-bold">Living<span className="text-[#6D28D9]">InWest</span></span>
</Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-all">Home</Link>
          
          {/* Categories with Dropdown */}
          <div className="relative">
            <div className="flex items-center">
              <Link href="/categories" className="px-2 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                Categories
              </Link>
              <button 
                onClick={() => setCatDropdown(!catDropdown)} 
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Dropdown Menu */}
            {catDropdown && (
              <>
                {/* Invisible overlay to close dropdown when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setCatDropdown(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.slug} 
                      href={`/category/${cat.slug}`} 
                      onClick={() => setCatDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm text-white/70 hover:text-white">{cat.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <Link href="/categories" onClick={() => setCatDropdown(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm text-[#6D28D9] font-medium">View All Categories</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href="/about" className="px-4 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-all">About</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
            {searchOpen ? <X className="w-4 h-4 text-white/70" /> : <Search className="w-4 h-4 text-white/70" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="border-t border-white/5 bg-[#0A0A0A]/95 backdrop-blur-md px-6 py-4">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-[#6D28D9]/50">
              <Search className="w-4 h-4 text-white/40" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search articles, news, topics..." className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none flex-1" autoFocus />
            </div>
            <button type="submit" className="px-6 py-3 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6]">Search</button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0A0A0A]/95 backdrop-blur-md">
          <div className="px-6 py-4 space-y-1">
            <Link href="/" onClick={closeMobile} className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all">Home</Link>
            
            {/* Mobile Categories Accordion */}
            <div>
              <button onClick={() => setCatDropdown(!catDropdown)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                Categories <ChevronDown className={`w-3 h-3 transition-transform ${catDropdown ? 'rotate-180' : ''}`} />
              </button>
              {catDropdown && (
                <div className="pl-4 space-y-1 mt-1 mb-1">
                  {categories.map((cat) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <span>{cat.emoji}</span>
                      <span className="text-sm text-white/60">{cat.name}</span>
                    </Link>
                  ))}
                  <Link href="/categories" onClick={closeMobile} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <span>🔥</span>
                    <span className="text-sm text-[#6D28D9] font-medium">View All</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/about" onClick={closeMobile} className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all">About</Link>
          </div>
        </div>
      )}
    </nav>
  );
}