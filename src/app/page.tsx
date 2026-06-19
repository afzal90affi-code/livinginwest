import HomeContent from '@/components/HomeContent';
import { client } from "@/lib/sanityClient"; 

// 👇 Google Search Meta Data
export const metadata = {
  title: "Living In West - Premium Lifestyle & News",
  description: "Explore the latest in lifestyle, travel, food, automotive, and world news.",
};

// 👇 FIXED: "slug": slug.current se object ki jagah direct string aayega
const CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) {
  _id, 
  name, 
  "slug": slug.current, 
  emoji, 
  image
}`;

// 👇 FIXED: "slug": slug.current se object ki jagah direct string aayega
const BLOGS_QUERY = `*[_type == "blog"] | order(_createdAt desc) [0...20] {
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
  const catDataRaw = await client.fetch(CATEGORIES_QUERY);
  const blogDataRaw = await client.fetch(BLOGS_QUERY);

  // Ab slug pehle se string hai, koi convert karne ki zaroorat nahi
  const catData = catDataRaw.map((c: any) => ({
    ...c,
  }));

  const blogData = blogDataRaw.map((b: any) => ({
    ...b,
  }));

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
