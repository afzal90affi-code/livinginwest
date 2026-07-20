// components/Footer.tsx
import Link from 'next/link';

// 🛠️ Custom SVG Icons for Social Media (lucide-react me ab nahi hain)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-playfair text-2xl font-bold tracking-wide">Living<span className="text-gray-400">InWest</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">Premium stories and lifestyle updates from around the globe.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/categories" className="text-sm text-gray-300 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/subcategories" className="text-sm text-gray-300 hover:text-white transition-colors">Topics</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact-us" className="text-sm text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              {/* Instagram Link */}
              <a 
                href="https://instagram.com/living.in.west" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-gray-400" />
              </a>
              
              {/* Facebook Link */}
              <a 
                href="https://www.facebook.com/livinginwest?mibextid=ZbWKwL" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <FacebookIcon className="w-4 h-4 text-gray-400" />
              </a>

              {/* Twitter Link */}
              <a 
                href="https://twitter.com/livinginwest" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <TwitterIcon className="w-4 h-4 text-gray-400" />
              </a>

              {/* YouTube Link */}
              <a 
                href="https://youtube.com/@livinginwest" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <YoutubeIcon className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600">© 2025 LivingInWest. All rights reserved.</span>
          <span className="text-[10px] text-gray-700 uppercase tracking-widest">Designed with Next.js</span>
        </div>
      </div>
    </footer>
  );
}