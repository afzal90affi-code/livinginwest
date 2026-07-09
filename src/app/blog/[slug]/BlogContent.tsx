// src/app/blog/[slug]/BlogContent.tsx
'use client';

import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  // Quill ke image URLs ko process karo (Sanity images ko proper URL me convert)
  const processedContent = content.replace(
    /src="([^\"]+)"/g,
    (match, src) => {
      // Agar Sanity image hai toh urlFor use karo
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
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}