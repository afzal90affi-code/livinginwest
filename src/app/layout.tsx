import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar"; 
import Footer from "@/components/footer"; 
import { client } from "@/lib/sanityClient"; 
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script"; // 🌍 Google Translate Script ke liye add kiya

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Living In West - Premium Lifestyle & News",
  description: "Explore the latest in lifestyle, travel, food, automotive, and world news.",
  icons: {
    icon: "/favicon.ico",
  },
};

const NAV_CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) {
  name, "slug": slug.current
}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await client.fetch(NAV_CATEGORIES_QUERY); 

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} bg-[#FAFAFA] text-gray-900 antialiased`}>
        
        {/* 🌍 Google Translate Hidden Widget & Scripts */}
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,es,fr,ur,ar,hi',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>

        <Navbar categories={navCategories} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}