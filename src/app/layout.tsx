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

// ✅ FINAL METADATA — "Life in the USA" umbrella (news + lifestyle + housing sab iske andar)
export const metadata: Metadata = {
  // Absolute URLs ke liye zaroori — OG images/canonical proper absolute banenge
  metadataBase: new URL("https://livinginwest.com"),

  // Template: har page ka title "Page Title | Living In West" ban jayega
  title: {
    default: "Living In West — USA News, Lifestyle & Living Guide",
    template: "%s | Living In West",
  },

  // Umbrella description — Google site ko "America living guide" ke tor pe classify karega
  description:
    "Your complete guide to life in the USA — latest news, lifestyle, travel, jobs, housing & state-by-state living guides. Everything about living, working and thriving in America.",

  // Explicit robots — 100% clear ke index karna hai
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large", // Google Images mein bade previews — free traffic
      "max-snippet": -1,
    },
  },

  

  // Site-wide OpenGraph defaults
  openGraph: {
    type: "website",
    siteName: "Living In West",
    url: "https://livinginwest.com",
  },
  twitter: { card: "summary_large_image" },

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
  // Nav fetch pe revalidate — har request pe Sanity call nahi, 1 ghanta cache
  const navCategories = await client.fetch(
    NAV_CATEGORIES_QUERY,
    {},
    { next: { revalidate: 3600 } }
  ); 

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="p:domain_verify" content="9f262a508100adb89995932d1afb3e0a"/>
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
          id="pinterest-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e){if(!window.pintrk){window.pintrk=function()
              {window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
              var n=window.pintrk;n.queue=[],n.version="3.0";
              var t=document.createElement("script");t.async=!0,t.src=e;
              var r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              
              pintrk('load', '2612759657883'); 
              pintrk('page');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt="" src="https://ct.pinterest.com/v3/?event=init&tid=2612759657883&noscript=1" />
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