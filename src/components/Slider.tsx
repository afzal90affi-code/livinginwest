"use client";
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Slider({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.8; // 80% width scroll karega
    trackRef.current.scrollBy({ 
      left: dir === 'left' ? -amount : amount, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <div className="flex items-center justify-end mb-6 gap-2">
        <button 
          onClick={() => scroll('left')} 
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => scroll('right')} 
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Track */}
      <div 
        ref={trackRef} 
        className="flex overflow-x-auto gap-6 md:gap-8 pb-4 snap-x snap-mandatory scrollbar-hide"
      >
        {children}
      </div>
    </div>
  );
}