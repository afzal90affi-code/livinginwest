import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Living In West',
  description: 'Learn more about Living In West, our mission, and our team.',
};

export default function AboutUs() {
  return (
    <div className="bg-white py-20 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4 text-gray-900">About Us</h1>
        
        <div className="prose prose-lg prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p>Welcome to <strong className="text-gray-900">Living In West</strong> — your premium destination for lifestyle, travel, food, and financial insights tailored for the modern reader.</p>
          
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p>Our mission is to bridge the gap between quality journalism and everyday lifestyle. We believe that staying informed about the world, managing finances, exploring new cuisines, and traveling shouldn't be separate experiences—they are all part of living a rich, fulfilling life.</p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">What We Cover</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900">Food:</strong> From local hidden gems to international recipes.</li>
            <li><strong className="text-gray-900">Travel:</strong> Budget tips, luxury getaways, and cultural guides.</li>
            <li><strong className="text-gray-900">Automotive:</strong> Latest car launches, reviews, and road trips.</li>
            <li><strong className="text-gray-900">Finance:</strong> Crypto updates, saving tips, and market trends.</li>
          </ul>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">Our Team</h2>
          <p>We are a small, passionate team of writers, researchers, and creatives based in the USA, UK, and Canada, dedicated to bringing you the best stories every day.</p>
        </div>
      </div>
    </div>
  );
}