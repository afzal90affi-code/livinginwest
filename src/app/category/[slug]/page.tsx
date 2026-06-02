import { Metadata } from 'next';
import Link from 'next/link';
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, where } from "firebase/firestore";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return { title: `${categoryName} - Living In West`, description: `Browse the latest ${categoryName} articles.` };
}

export default async function CategoryDetail({ params, searchParams }: { params: { slug: string }, searchParams: { sub?: string } }) {
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  const activeSub = searchParams.sub || null;

  let subCats: any[] = [];
  let blogs: any[] = [];

  try {
    const subCatQuery = query(collection(db, "subcategories"), where("parentId", "==", params.slug));
    const subCatSnap = await getDocs(subCatQuery);
    subCats = subCatSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    let q;
    if (activeSub) {
      q = query(collection(db, "blogs"), where("category", "==", params.slug), where("subCategory", "==", activeSub));
    } else {
      q = query(collection(db, "blogs"), where("category", "==", params.slug));
    }
    const querySnapshot = await getDocs(q);
    blogs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));

  } catch (error) { console.error(error); }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-gray-900">Categories</Link>
          <span>/</span>
          <span className="text-gray-800">{categoryName}</span>
        </div>

        <h1 className="font-playfair text-4xl md:text-6xl font-bold tracking-tight mb-10 border-b border-gray-200 pb-6">
          <span className="text-[#1e3a8a]">{categoryName}</span>
        </h1>

        {/* Subcategory Pills */}
        {subCats.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Link href={`/category/${params.slug}`} className={`px-4 py-2 border text-xs uppercase tracking-widest font-semibold transition-colors ${!activeSub ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}>
              All
            </Link>
            {subCats.map((sub) => (
              <Link key={sub.id} href={`/category/${params.slug}?sub=${sub.slug}`} className={`px-4 py-2 border text-xs uppercase tracking-widest font-semibold transition-colors ${activeSub === sub.slug ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}>
                {sub.emoji} {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Blogs Grid - FIXED IMAGE CUTTING ISSUE */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200">
            <p className="text-gray-500 text-sm uppercase tracking-widest">No stories found in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link href={`/blog/${blog.id}`} key={blog.id} className="group block bg-white border border-gray-200/50 hover:border-gray-900 transition-colors overflow-hidden">
                
                {/* IMAGE CONTAINER - Removed forced aspect ratio so full image shows */}
                <div className="w-full bg-gray-50 overflow-hidden">
                  <img 
                    src={blog.img1 || `https://picsum.photos/seed/blog-${blog.id}/800/500.jpg`} 
                    alt={blog.title} 
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy" 
                  />
                </div>
                
                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{blog.subCategory || blog.category}</span>
                  <h3 className="font-playfair text-xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{blog.desc}</p>
                  {blog.date && <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">{blog.date}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}