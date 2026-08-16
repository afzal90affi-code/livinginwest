import type { Metadata } from 'next';
import ContactForm from './ContactForm'; // ✅ Client Component import kiya

export const metadata: Metadata = {
  title: 'Contact Us - Living In West',
  description: 'Get in touch with the Living In West team. Reach out for general inquiries, advertising, guest posts, and technical support.',
};

export default function ContactUs() {
  return (
    <div className="bg-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          
          {/* Left: Info & Emails */}
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-6 border-b border-gray-200 pb-4 text-gray-900">Get In Touch</h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">We usually respond within 24 hours. Please choose the relevant department below to ensure a faster response to your inquiry.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Contact Email Card */}
              <div className="bg-[#FAFAFA] p-6 border border-gray-200 rounded-sm hover:border-[#6D28D9] hover:shadow-sm transition-all">
                <span className="text-2xl">✉️</span>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-3 mb-1">General Inquiries</h3>
                <a href="mailto:contact@livinginwest.com" className="text-gray-900 font-medium hover:text-[#6D28D9] transition-colors break-all">contact@livinginwest.com</a>
              </div>

              {/* Ads Email Card */}
              <div className="bg-[#FAFAFA] p-6 border border-gray-200 rounded-sm hover:border-[#6D28D9] hover:shadow-sm transition-all">
                <span className="text-2xl">📢</span>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-3 mb-1">Advertising</h3>
                <a href="mailto:ads@livinginwest.com" className="text-gray-900 font-medium hover:text-[#6D28D9] transition-colors break-all">ads@livinginwest.com</a>
              </div>

              {/* Guest Post Email Card */}
              <div className="bg-[#FAFAFA] p-6 border border-gray-200 rounded-sm hover:border-[#6D28D9] hover:shadow-sm transition-all">
                <span className="text-2xl">✍️</span>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-3 mb-1">Guest Posts</h3>
                <a href="mailto:guest@livinginwest.com" className="text-gray-900 font-medium hover:text-[#6D28D9] transition-colors break-all">guest@livinginwest.com</a>
              </div>

              {/* Support Email Card */}
              <div className="bg-[#FAFAFA] p-6 border border-gray-200 rounded-sm hover:border-[#6D28D9] hover:shadow-sm transition-all">
                <span className="text-2xl">🛠️</span>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-3 mb-1">Technical Support</h3>
                <a href="mailto:support@livinginwest.com" className="text-gray-900 font-medium hover:text-[#6D28D9] transition-colors break-all">support@livinginwest.com</a>
              </div>

            </div>
          </div>

          {/* Right: Professional Contact Form (Imported) */}
          <ContactForm />

        </div>
      </div>
    </div>
  );
}