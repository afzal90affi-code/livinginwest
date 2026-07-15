"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HorizontalSliderProps {
  children: React.ReactNode
  title?: string
  viewAllLink?: string
  viewAllText?: string
}

export default function HorizontalSlider({ children, title, viewAllLink, viewAllText = "View All" }: HorizontalSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        el.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      {(title || viewAllLink) && (
        <div className="flex items-end justify-between mb-10">
          {title && (
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#1e3a8a] font-semibold block mb-2">Explore</span>
              <h2 className="text-[24px] md:text-[32px] font-playfair font-bold text-gray-900 leading-tight">
                {title}
              </h2>
            </div>
          )}
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#1e3a8a] hover:text-black transition-colors font-medium pb-1"
            >
              {viewAllText} <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div className="relative group/slider-container">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white/80 to-transparent flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full border border-gray-200 bg-white/90 flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Scrollable Area */}
        <div
          ref={scrollRef}
          className="flex gap-6 md:gap-8 overflow-x-auto pb-4 pl-2 pr-12 snap-x-mandatory scroll-smooth scrollbar-hide"
        >
          {children}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white/80 to-transparent flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full border border-gray-200 bg-white/90 flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* Mobile View All Link */}
      {viewAllLink && (
        <a
          href={viewAllLink}
          className="md:hidden flex items-center justify-center gap-1.5 mt-6 py-3 border border-gray-200 rounded-xl text-[11px] uppercase tracking-[0.15em] text-[#1e2e8a] hover:bg-gray-50 transition-colors font-medium mx-5"
        >
          {viewAllText} <ChevronRight className="w-3.5 h-3.5" />
        </a>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}