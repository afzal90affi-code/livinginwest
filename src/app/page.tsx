import HomeContent from '@/components/HomeContent';
import { client } from "@/lib/sanityClient"; 

// 👇 Types define kiye
interface CategoryData {
  _id: string;
  name: string;
  slug?: string;
  emoji?: string;
  image?: { asset?: { _ref: string; url?: string }; url?: string };
}

interface BlogData {
  _id: string;
  title?: string;
  slug?: string;
  categoryName?: string;
  subcategoryName?: string;
  desc?: string;
  mainImage?: { asset?: { _ref: string; url?: string }; url?: string };
  date?: string;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isMoreStory?: boolean;
}

// 👇 Google Search Meta Data
export const metadata = {
  title: "Living In West - Premium Lifestyle & News",
  description: "Explore the latest in lifestyle, travel, food, automotive, and world news.",
  alternates: {
    canonical: "/", // 👈 SEO: homepage ka canonical URL
  },
};

// 👇 FIXED: "slug": slug.current se object ki jagah direct string aayega
const CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) {
  _id, 
  name, 
  "slug": slug.current, 
  emoji, 
  image
}`;

// ✅ FIXED: [0...20] se [0...100] — ab saari posts (65) fetch hongi,
// isliye FINANCE jaisi categories me saare posts homepage par dikhenge
const BLOGS_QUERY = `*[_type == "blog"] | order(_createdAt desc) [0...100] {
  _id, 
  title, 
  "slug": slug.current, 
  "categoryName": category, 
  "subcategoryName": subCategory, 
  desc, 
  "mainImage": img1, 
  date, 
  isFeatured, 
  isEditorsPick, 
  isMoreStory
}`;

// 👇 Har 60 second mein data auto-update hoga (ISR)
export const revalidate = 60; 

export default async function Page() {
  // 🆕 DONO FETCHES SATH MEIN (parallel) + CACHE OPTIONS
  const [catDataRaw, blogDataRaw] = await Promise.all([
    client.fetch(CATEGORIES_QUERY, {}, { next: { revalidate: 60 } }),
    client.fetch(BLOGS_QUERY, {}, { next: { revalidate: 60 } }),
  ]);

  const catData: CategoryData[] = catDataRaw;
  const blogData: BlogData[] = blogDataRaw;

  return (
    <>
      {/* 👇 JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ 
          "@context": "https://schema.org", 
          "@type": "WebSite", 
          "name": "Living In West", 
          "url": "https://livinginwest.com" 
        })}}
      />
      
      <HomeContent initialCategories={catData} initialBlogs={blogData} />
    </>
  );
}