import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about LivingInWest — the premier lifestyle blog covering Food, Travel, Cars, Finance across US, UK & Canada.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition mb-8">← Back to Home</Link>
        
        <h1 className="font-playfair text-5xl font-bold mb-8">About <span className="text-[#6D28D9]">LivingInWest</span></h1>
        
        <div className="space-y-6 text-white/70 text-lg leading-relaxed">
          <p>Welcome to <strong className="text-white">LivingInWest</strong> — your ultimate guide to the Western lifestyle. We cover everything that defines modern living across the <strong className="text-white">United States, United Kingdom, and Canada</strong>.</p>
          <p>From the best Southern BBQ recipes to the latest automotive trends, from budget travel tips to personal finance guides — we bring you authentic, well-researched content that helps you live your best Western life.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl block mb-3">🍔✈️🚗</span>
            <h3 className="font-semibold mb-2">6+ Categories</h3>
            <p className="text-sm text-white/40">Food, Travel, Automotive, Finance, Health, Entertainment</p>
          </div>
          <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl block mb-3">🌍</span>
            <h3 className="font-semibold mb-2">3 Countries</h3>
            <p className="text-sm text-white/40">Covering US, UK & Canada</p>
          </div>
          <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl block mb-3">📝</span>
            <h3 className="font-semibold mb-2">Original Content</h3>
            <p className="text-sm text-white/40">Authentic stories, no copy-paste</p>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-b from-[#6D28D9]/10 to-transparent border border-white/5 rounded-2xl p-8 text-center">
          <h2 className="font-playfair text-2xl font-bold mb-3">Want to Contribute?</h2>
          <p className="text-white/50 mb-6">Have a story idea or want to collaborate? We'd love to hear from you.</p>
          <a href="mailto:hello@livinginwest.com" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D28D9] rounded-full text-sm font-medium hover:bg-[#5B21B6] transition-colors">Contact Us</a>
        </div>
      </div>
    </main>
  );
}