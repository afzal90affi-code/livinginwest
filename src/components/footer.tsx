import Link from 'next/link';
import { Camera, MessageCircle, Play, Globe } from 'lucide-react';


export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><span className="text-[#6D28D9] font-bold text-sm">LW</span></div>
            <span className="font-playfair text-xl font-bold">Living<span className="text-[#6D28D9]">InWest</span></span>
          </Link>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><Camera className="w-4 h-4 text-white/60" /></a>
            <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><MessageCircle className="w-4 h-4 text-white/60" /></a>
            <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><Play className="w-4 h-4 text-white/60" /></a>
            <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><Globe className="w-4 h-4 text-white/60" /></a>
          </div>
          <div className="flex items-center md:justify-end gap-6">
            <Link href="/admin" className="text-xs text-white/40 hover:text-[#6D28D9] transition font-medium">Admin Panel</Link>
            <span className="text-xs text-white/30">© 2025 LivingInWest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}