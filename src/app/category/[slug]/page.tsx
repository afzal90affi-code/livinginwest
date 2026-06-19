import Link from 'next/link';
import Image from 'next/image';
import { client } from "@/lib/sanityClient";
import { urlFor } from "@/lib/sanityImage";

// Category ka data fetch karna
async function getCategoryData(slug: string) {
  const category = await client.fetch(`*[_type == "category" && slug.current == $slug][0]{
    _id, name, "slug": slug.current, emoji
  }`, { slug });
  return category;
}

// Us category ke andar ki subcategories fetch karna
async function getSubcategories(slug: string) {
  const subcats = await client.fetch(`*[_type == "subcategory" && parentId == $slug] | order(name asc){
    _id, name, "slug": slug.current, emoji, image
  }`, { slug });
  return subcats;
}

// Us category ke blogs fetch karna
async function getBlogsByCategory(slug: string) {
  const blogs = await client.fetch(`*[_type == "blog" && category == $slug] | order(date desc){
    _id, title, "slug": slug.current, "categoryName": category, desc, "mainImage": img1, date
  }`, { slug });
  return blogs;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryData(params.slug);
  const subcategories = await getSubcategories(params.slug);
  const blogs = await getBlogsByCategory(params.slug);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-500">Category not found</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 block">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Category Title */}
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">
          {category.emoji} {category.name}
        </h1>
        <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">
          All articles in {category.name}
        </p>

        {/* ===== SUBCATEGORIES SECTION (Compact Row Style) ===== */}
        {subcategories.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {subcategories.map((sub: any) => {
                const subImg = sub.image ? urlFor(sub.image).width(100).height(100).url() : null;
                
                return (
                  <Link 
                    href={`/subcategories/${sub.slug}`} 
                    key={sub._id} 
                    className="group flex-shrink-0 flex items-center gap-2.5 bg-white border border-gray-200 hover:border-[#6D28D9]/50 rounded-full px-4 py-2 transition-all shadow-sm hover:shadow-md"
                  >
                    {/* Agar image hai toh dikhao, warna kuch mat dikhao */}
                    {subImg && (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={subImg} alt={sub.name} width={28} height={28} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    {/* Subcategory Ka Naam */}
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#6D28D9] whitespace-nowrap transition-colors">
                      {sub.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== BLOGS LIST ===== */}
        {blogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-white">
            <p className="text-gray-500">No blogs found in this category.</p>
            <Link href="/" className="text-sm text-[#6D28D9] hover:underline mt-4 inline-block">Back to Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog: any) => {
              const blogImg = blog.mainImage ? urlFor(blog.mainImage).width(800).height(1000).url() : null;
              
              return (
                <Link href={`/blog/${blog.slug}`} key={blog._id} className="group block">
                  <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100 relative">
                    {blogImg ? (
                      <Image src={blogImg} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.categoryName}</span>
                  <h3 className="font-playfair text-xl font-bold mt-2 leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.desc}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}