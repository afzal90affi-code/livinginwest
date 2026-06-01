"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, where } from "firebase/firestore";

export default function CategoryDetail({ params }: { params: { slug: string } }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), where("category", "==", params.slug));
        const querySnapshot = await getDocs(q);
        const blogsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching category blogs:", error);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-white/80">{categoryName}</span>
        </div>

        <h1 className="font-playfair text-4xl font-bold mb-12">{categoryName} Articles</h1>

        {blogs.length === 0 ? (
          <p className="text-white/40">No blogs found in this category.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link href={`/blog/${blog.id}`} key={blog.id} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all bg-white/[0.02] h-full flex flex-col">
                  <div className="overflow-hidden">
                    <img src={blog.img1 || `https://picsum.photos/seed/blog-${blog.id}/800/500.jpg`} alt={blog.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#6D28D9] transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-white/50 line-clamp-2 mt-auto">{blog.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}