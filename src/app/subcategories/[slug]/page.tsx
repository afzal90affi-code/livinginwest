import Link from 'next/link';
import Image from 'next/image';
import { client } from "@/lib/sanityClient";
import { urlFor } from "@/lib/sanityImage";

// 👇 Type define kiya
interface SubcategoryBlog {
  _id: string;
  title: string;
  slug: string;
  categoryName: string;
  subcategoryName: string;
  desc?: string;
  mainImage?: { asset?: { _ref: string; url?: string }; url?: string };
  date?: string;
}

// Subcategory ka data fetch karna (Fallback queries ke saath)
async function getSubcategoryData(slug: string) {
  const subcategory = await client.fetch(`*[_type == "subcategory" && (slug.current == $slug || _id == $slug)][0]{
    _id, name, "slug": coalesce(slug.current, _id), parentId
  }`, { slug });
  return subcategory;
}

// Us subcategory ke blogs fetch karna
async function getBlogsBySubcategory(slug: string): Promise<SubcategoryBlog[]> {
  const blogs = await client.fetch(`*[_type == "blog" && subCategory == $slug] | order(date desc){
    _id, 
    title, 
    "slug": slug.current, 
    "categoryName": category, 
    "subcategoryName": subCategory, 
    desc, 
    "mainImage": img1, 
    date
  }`, { slug });
  return blogs;
}

export default async function SubcategoryPage({ params }: { params: { slug: string } }) {
  const subcategory = await getSubcategoryData(params.slug);
  const blogs = await getBlogsBySubcategory(params.slug);

  // Agar subcategory nahi mili
  if (!subcategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-500 mb-2">Sub-category not found in Sanity Database.</p>
          <p className="text-xs text-gray-400 mb-6">URL Slug: <strong>{params.slug}</strong></p>
          <Link href="/" className="text-[#6D28D9] hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">
          {subcategory.name}
        </h1>
        <p className="text-gray-500 mb-10 border-b border-gray-200 pb-4">
          All articles in {subcategory.name}
        </p>

        {blogs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-white">
            <p className="text-gray-500 mb-2">No blogs found in this sub-category.</p>
            <p className="text-xs text-gray-400 mb-4">
              Make sure you selected this subcategory while creating a blog in Admin Panel.
            </p>
            <Link href="/" className="text-sm text-[#6D28D9] hover:underline">Back to Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog: SubcategoryBlog) => {
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
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{blog.categoryName} / {blog.subcategoryName}</span>
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