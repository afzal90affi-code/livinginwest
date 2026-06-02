// components/Footer.tsx
import Link from 'next/link';
import { Camera, MessageCircle, Play, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-playfair text-2xl font-bold tracking-wide">Living<span className="text-gray-400">InWest</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">Premium stories and lifestyle updates from around the globe.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/categories" className="text-sm text-gray-300 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/subcategories" className="text-sm text-gray-300 hover:text-white transition-colors">Topics</Link></li>
              <li><Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact-us" className="text-sm text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><Camera className="w-4 h-4 text-gray-400" /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><MessageCircle className="w-4 h-4 text-gray-400" /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><Play className="w-4 h-4 text-gray-400" /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><Globe className="w-4 h-4 text-gray-400" /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600">© 2025 LivingInWest. All rights reserved.</span>
          <span className="text-[10px] text-gray-700 uppercase tracking-widest">Designed with Next.js</span>
        </div>
      </div>
    </footer>
  );
}