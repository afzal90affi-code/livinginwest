import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Living In West',
  description: 'Learn how Living In West handles your data and privacy.',
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-white py-20 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4 text-gray-900">Privacy Policy</h1>
        
        <div className="prose prose-lg prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p><em>Last updated: January 2025</em></p>
          
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include your name, email address, and any other information you choose to provide.</p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and improve our services, to send you newsletters and updates, and to protect the rights and property of Living In West.</p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">3. Google AdSense & Cookies</h2>
          <p>We use Google AdSense to display ads. Google and its partners may use cookies to serve ads based on your prior visits to our website. You can opt out of personalized advertising by visiting Google Ads Settings.</p>

          <h2 className="font-playfair text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
        </div>
      </div>
    </div>
  );
}