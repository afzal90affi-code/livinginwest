import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityImage';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  emoji?: string;
  image?: object;
  blogCount?: number;
}

export const metadata: Metadata = {
  title: 'All Categories - Living In West',
  description: 'Browse all lifestyle categories on Living In West.',
};

export const dynamic = 'force-dynamic';

const CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) {
  _id,
  name,
  "slug": slug.current,
  emoji,
  image
}`;

export default async function CategoriesPage() {
  let catList: CategoryItem[] = [];

  try {
    catList = await client.fetch(CATEGORIES_QUERY);
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
          <p className="text-center text-gray-400">No categories found. Add them from Sanity Studio.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catList.map((cat: CategoryItem) => {
              const imgUrl = cat.image 
                ? urlFor(cat.image).width(800).height(600).auto('format').url() 
                : `https://picsum.photos/seed/cat-${cat.slug}/800/600.jpg`;

              return (
                <Link href={`/category/${cat.slug}`} key={cat._id} className="group block relative aspect-[4/3] overflow-hidden bg-gray-100 border border-gray-200/50 hover:border-gray-900 transition-colors">
                  <Image 
                    src={imgUrl} 
                    alt={cat.name}
                    fill
                    className="object-cover brightness-[0.8] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-2">
                      {cat.blogCount || 0} Stories
                    </span>
                    <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">{cat.name}</h2>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}