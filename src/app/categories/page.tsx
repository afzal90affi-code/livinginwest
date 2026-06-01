import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all lifestyle categories on LivingInWest - Food, Travel, Automotive, Finance, Health, Entertainment.',
};

const categories = [
  { id: 1, name: "Food & Recipes", slug: "food", emoji: "🍔", img: "https://picsum.photos/seed/cat-food/600/400.jpg", count: 142 },
  { id: 2, name: "Travel", slug: "travel", emoji: "✈️", img: "https://picsum.photos/seed/cat-travel/600/400.jpg", count: 198 },
  { id: 3, name: "Automotive", slug: "automotive", emoji: "🚗", img: "https://picsum.photos/seed/cat-cars/600/400.jpg", count: 75 },
  { id: 4, name: "Finance", slug: "finance", emoji: "💰", img: "https://picsum.photos/seed/cat-finance/600/400.jpg", count: 64 },
  { id: 5, name: "Health & Wellness", slug: "health", emoji: "🧘", img: "https://picsum.photos/seed/cat-health/600/400.jpg", count: 89 },
  { id: 6, name: "Entertainment", slug: "entertainment", emoji: "🎬", img: "https://picsum.photos/seed/cat-movie/600/400.jpg", count: 121 },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition mb-8">← Back to Home</Link>
        
        <div className="text-center mb-16">
          <h1 className="font-playfair text-5xl font-bold">All Categories</h1>
          <p className="text-white/50 mt-4">Explore our complete collection of lifestyle topics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link href={`/category/${cat.slug}`} key={cat.id} className="group cursor-pointer">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/5 hover:border-white/20 transition-all">
                <img src={cat.img} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-110 group-hover:brightness-[0.5] transition-all duration-700" alt={cat.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{cat.emoji}</span>
                    <h2 className="text-xl font-bold">{cat.name}</h2>
                  </div>
                  <p className="text-sm text-white/40">{cat.count} Articles</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}