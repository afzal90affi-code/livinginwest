"use client";
import { useState } from 'react';
import { Code2, Check, Copy } from 'lucide-react';

export default function EmbedBlogButton({ slug }: { slug: string }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://livinginwest.com';
  const embedCode = `<iframe src="${domain}/blog/${slug}" width="100%" height="600" style="border:none;overflow:hidden;" scrolling="no" frameborder="0"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 w-full max-w-md mx-auto text-center">
      <button
        onClick={() => setShowCode(!showCode)}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 hover:text-[#1e3a8a] transition-colors"
      >
        <Code2 className="w-4 h-4" />
        Embed this Story
      </button>
      {showCode && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-left">
          <textarea 
            readOnly 
            value={embedCode} 
            className="w-full h-24 bg-transparent text-xs text-gray-600 resize-none focus:outline-none font-mono" 
          />
          <button 
            onClick={handleCopy} 
            className="mt-2 w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      )}
    </div>
  );
}