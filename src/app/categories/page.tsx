import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from "@/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";

export const metadata: Metadata = {
  title: 'All Categories - Living In West',
  description: 'Browse all lifestyle categories on Living In West.',
};

export default async function CategoriesPage() {
  let catList: any[] = [];
  let blogCounts: Record<string, number> = {};

  try {
    const catSnap = await getDocs(collection(db, "categories"));
    catList = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    const blogSnap = await getDocs(collection(db, "blogs"));
    const blogs = blogSnap.docs.map(d => d.data() as any);
    
    blogs.forEach(blog => {
      if (blog.category) {
        blogCounts[blog.category] = (blogCounts[blog.category] || 0) + 1;
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold tracking-tight">All Categories</h1>
          <p className="text-gray-500 mt-4 text-sm md:text-base max-w-xl mx-auto">Explore our complete collection of lifestyle topics and stories.</p>
        </div>

        {catList.length === 0 ? (
          <p className="text-center text-gray-400">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catList.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.id} className="group block relative aspect-[4/3] overflow-hidden bg-gray-100 border border-gray-200/50 hover:border-gray-900 transition-colors">
                <img 
                  src={cat.image || `https://picsum.photos/seed/cat-${cat.slug}/800/600.jpg`} 
                  className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-[0.4] group-hover:scale-105 transition-all duration-700" 
                  alt={cat.name} 
                  loading="lazy" 
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-2">{blogCounts[cat.slug] || 0} Stories</span>
                  <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">{cat.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}