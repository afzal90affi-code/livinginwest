"use client";
import { useState, useEffect } from 'react';
import { Share2, Link2, MessageCircle, Globe } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path></svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
);

// Bada Share button (Blog k end wala)
export function ShareMenu() {
  const [url, setUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setUrl(window.location.href); }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const shareLinks = [
    { name: 'Facebook', icon: <FacebookIcon />, url: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { name: 'X (Twitter)', icon: <XIcon />, url: `https://twitter.com/intent/tweet?url=${url}` },
    { name: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, url: `https://wa.me/?text=${url}` },
  ];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-gray-700 transition-colors">
        <Share2 className="w-4 h-4" /> Share
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 flex flex-col gap-1">
          {shareLinks.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg">
              {s.icon} {s.name}
            </a>
          ))}
          <button onClick={nativeShare} className="flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
            <Globe className="w-4 h-4" /> Instagram / TikTok
          </button>
          <div className="h-px bg-gray-100 my-1"></div>
          <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left">
            <Link2 className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}

// Chhota Share button ke liye Props define kiye hain
interface ShareCardButtonProps {
  title: string;
  url?: string;
}

// Chhota Share button (Hero, Editors Pick, Category Blogs wala)
export function ShareCardButton({ title, url }: ShareCardButtonProps) {
  const handleShare = async () => {
    const shareUrl = url ? `${window.location.origin}${url}` : window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (error) {
        // User cancelled share, do nothing
      }
    } else {
      // Fallback for desktop: Copy link
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <button onClick={handleShare} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold">
      <Share2 className="w-3 h-3" /> Share
    </button>
  );
}