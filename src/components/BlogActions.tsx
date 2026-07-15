"use client"

import { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck, Link2, Check } from "lucide-react"

export default function BlogActions({ title, slug }: { title: string; slug: string }) {
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const blogUrl = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : ""

  useEffect(() => {
    const savedBlogs = JSON.parse(localStorage.getItem("savedBlogs") || "[]")
    if (savedBlogs.includes(slug)) {
      setIsSaved(true)
    }
  }, [slug])

  const handleSave = () => {
    let savedBlogs = JSON.parse(localStorage.getItem("savedBlogs") || "[]")
    if (isSaved) {
      savedBlogs = savedBlogs.filter((s: string) => s !== slug)
    } else {
      savedBlogs.push(slug)
    }
    localStorage.setItem("savedBlogs", JSON.stringify(savedBlogs))
    setIsSaved(!isSaved)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(blogUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedUrl = encodeURIComponent(blogUrl)
  const encodedText = encodeURIComponent(`${title} | Living In West`)

  return (
    <div className="border border-gray-100 rounded-lg px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 my-8">
      
      <button
        onClick={handleSave}
        className={`flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 ${
          isSaved 
            ? "text-[#1e3a8a] hover:text-blue-700" 
            : "text-gray-400 hover:text-gray-900"
        }`}
      >
        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {isSaved ? "Saved" : "Save Story"}
      </button>

      <div className="flex items-center gap-1">
        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-mono mr-2 hidden sm:block">Share</span>
        
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
          title="Share on Facebook"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12zm-11 0c0-5.995 4.875-10.895 10.895-10.895s10.895 4.9 10.895 10.895-4.9 10.895-10.895 10.895zm.982-4.698h-2.115c-.404-.918-.925-1.735-1.56-2.437l-2.177-2.167c-.487-.487-1.04-.742-1.674-.742-.59 0-1.137.217-1.534.614l-3.656 3.656c-.533.534-1.25.834-2.002.834s-1.47-.3-2.002-.834l-3.656-3.656c-.397-.397-.614-.944-.614-1.534 0-.634.255-1.187.742-1.674l2.177-2.177c.702-.635 1.52-1.156 2.437-1.56.702-.404 1.52-.925 1.56-2.437v-2.115c2.66 0 4.818-2.157 4.818-4.818s-2.157-4.818-4.818-4.818h-2.115z"/></svg>
        </a>

        {/* X (Twitter) */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all"
          title="Share on X (Twitter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
          title="Share on WhatsApp"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-1.134-.457-.457-1.286-.574-1.818-.278-.533.062-1.19.223-1.718.355-.528.132-1.03.16-1.545.083-.515-.077-1.04.078-1.558.003-.518.084-1.03.22-1.545.355-.528.132-1.03.16-1.545.083-.515-.077-1.04.078-1.558.003-.518.084-1.03.22-1.545.355zm-3.485-9.796c-1.266-1.266-3.34-1.266-4.606 0s-3.34 1.266-4.606 1.266-1.266 1.266-1.266 3.34 0 4.606 1.266 1.266 3.34 1.266 4.606 0s3.34-1.266 4.606-1.266 1.266-1.266 1.266-3.34 0-4.606z"/></svg>
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
          title="Share on LinkedIn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-1.685-.137-2.035-.421-.676-1.428-.997-2.968-.997-2.968 0-1.543.634-2.035 1.007-.508 1.19.028 2.822-.028 3.965v5.569H3.554v-11.954h4.597v1.684h.061c.862 0 1.156-.504 1.266-1.117.028-.14.136-1.17.136-1.168V5.592c0-.745.134-1.17.136-1.168 0-.613.404-1.117 1.266-1.117h3.554v-1.761c0-5.665 4.063-10.289 9.07-10.289 5.007 0 9.07 4.624 9.07 10.289v1.761h4.597c.862 0 1.156.504 1.266 1.117.028.14.136 1.17.136 1.168v11.954h-3.554z"/></svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
          title="Copy Link"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
        </button>
      </div>
    </div>
  )
}