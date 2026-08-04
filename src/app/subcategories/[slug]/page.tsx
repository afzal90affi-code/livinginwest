import { client } from "@/lib/sanityClient";
import type { Metadata } from 'next';
import MarketTicker from '@/components/MarketTicker';
import CategoryClient from '@/app/category/[slug]/CategoryClient'; // ✅ پرانا والا کلائنٹ کمپوننٹ استعمال کریں گے

export const dynamic = 'force-dynamic';

interface SubcategoryData {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
}

// ===== SEO METADATA =====
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const subcat = await getSubcategoryData(params.slug);
  if (!subcat) return { title: "Topic Not Found | Living In West" };
  
  const title = `${subcat.name} News & Articles | Living In West`;
  const description = `Explore all articles about ${subcat.name} on Living In West.`;
  return { title, description };
}

// سب کیٹیگری کا ڈیٹا لائیں
async function getSubcategoryData(slug: string): Promise<SubcategoryData | null> {
  const subcat = await client.fetch(`*[_type == "subcategory" && slug.current == $slug][0]{
    _id, name, "slug": slug.current, parentId
  }`, { slug });
  return subcat;
}

// سب کیٹیگری کے بلاگز لائیں
async function getBlogsBySubcategory(matchList: string[]) {
  const blogs = await client.fetch(
    `*[_type == "blog" && isPublished == true && (
      lower(coalesce(subCategory, "")) in $matchList || 
      lower(coalesce(category, "")) in $matchList
    )] | order(date desc){
      _id, title, "slug": slug.current, "categoryName": category, desc, "mainImage": img1, date, readTime, "subCat": subCategory
    }`, 
    { matchList },
    { cache: 'no-store' }
  );
  return blogs;
}

export default async function SubcategoryPage({ params }: { params: { slug: string } }) {
  const subcategory = await getSubcategoryData(params.slug);
  
  let blogs: any[] = [];
  if (subcategory) {
    const matchList = [
      subcategory.slug.toLowerCase(),
      subcategory.name.toLowerCase()
    ];
    blogs = await getBlogsBySubcategory(matchList);
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-gray-300">404</h1>
          <p className="text-gray-500 text-lg mb-6">Topic not found</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <>
    
      {/* ✅ یہاں ہم CategoryClient کو دوبارہ استعمال کر رہے ہیں */}
      <CategoryClient 
        category={subcategory} // سب کیٹیگری کو category کی جگہ پاس کر دیا
        subcategories={[]} // سب کیٹیگری کے اندر مزید پلیز نہیں چاہئیں
        blogs={blogs} 
      />
    </>
  );
}