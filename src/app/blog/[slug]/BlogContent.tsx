// src/app/blog/[slug]/BlogContent.tsx
'use client';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  // 1. Pehle images par Lazy Loading lagayen
  let processedContent = content.replace(/<img/gi, '<img loading="lazy" decoding="async"');

  // 2. Sanity images ko compress karen (Agar image Sanity CDN se hai)
  processedContent = processedContent.replace(
    /src="(https:\/\/cdn\.sanity\.io\/[^"]+)"/g,
    (match, url) => {
      // Agar URL mein pehle se ? (query params) nahi hain toh compression lagao
      if (!url.includes('?')) {
        return `src="${url}?w=800&auto=format&q=70"`; // 800px width aur 70% quality
      }
      return match;
    }
  );

  // 3. (Purana logic) Agar koi local file reference hai toh usko bhi handle karein
  processedContent = processedContent.replace(
    /src="([^\"]+)"/g,
    (match, src) => {
      if (src.includes('file-') || src.includes('image-')) {
        try {
          return `src="${src}"`;
        } catch {
          return match;
        }
      }
      return match;
    }
  );

  return (
    <div 
      className="blog-read"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}