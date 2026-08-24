import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar"; 
import Footer from "@/components/footer"; 
import { client } from "@/lib/sanityClient"; 
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script"; // 🌍 Google Translate & Pinterest Script ke liye
import MarketTicker from "@/components/MarketTicker"; // ✅ MarketTicker import kiya
import WeatherTimeBar from "@/components/WeatherTimeBar"; // ✅ WeatherTimeBar import kiya

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Living In West - Premium Lifestyle & News",
  description: "Explore the latest in lifestyle, travel, food, automotive, and world news at Living In West. Your premium guide to living, working, and thriving in the western world.",
  icons: {
    icon: "/livinginwest-logo.png",
    shortcut: "/livinginwest-logo.png",
    apple: "/livinginwest-logo.png",
  },
};

const NAV_CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) {
  name, "slug": slug.current
}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await client.fetch(NAV_CATEGORIES_QUERY); 

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* ✅ Dark Mode Script (Flash se bachne ke liye) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* 📌 PINTEREST ANALYTICS TAG (Head ke andar) */}
        <Script
          id="549770726508"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e){if(!window.pintrk){window.pintrk=function()
              {window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
              var n=window.pintrk;n.queue=[],n.version="3.0";
              var t=document.createElement("script");t.async=!0,t.src=e;
              var r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              
              pintrk('load', '549770726508'); // ⚠️ Yahan apni Pinterest Tag ID dalein
              pintrk('page');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt="" src="https://ct.pinterest.com/v3/?event=init&tid=YOUR_TAG_ID&noscript=1" />
        </noscript>
      </head>
      
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white antialiased transition-colors duration-300`}>
        
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

        {/* ✅ MarketTicker (Top most) */}
        <MarketTicker />

        {/* Navbar */}
        <Navbar categories={navCategories} />

        {/* ✅ WeatherTimeBar (Navbar ke neeche, scroll par hat jayega) */}
        <WeatherTimeBar />

        <main className="min-h-screen">{children}</main>
        <Footer />
        
        {/* ✅ Google Analytics */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />

        {/* 📌 PINTEREST SAVE BUTTON (Body ke end mein for fast loading) */}
        <Script 
          src="https://assets.pinterest.com/js/pinit.js" 
          strategy="lazyOnload"
          async
          defer
        />
      </body>
    </html>
  );
}