// components/ArticleTracker.tsx
"use client";
import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  category: string;
}

export default function ArticleTracker({ title, category }: Props) {
  const tracked = useRef<Record<number, boolean>>({});

  useEffect(() => {
    const milestones = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      
      const percent = Math.round((scrollTop / docHeight) * 100);

      milestones.forEach((m) => {
        if (percent >= m && !tracked.current[m]) {
          tracked.current[m] = true;
          
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag("event", "article_read", {
              event_category: "engagement",
              event_label: title,
              article_category: category,
              read_percent: m,
            });
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [title, category]);

  return null;
}