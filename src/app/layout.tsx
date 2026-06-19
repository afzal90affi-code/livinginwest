import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar"; 
import Footer from "@/components/footer"; 
import { client } from "@/lib/sanityClient"; 

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Living In West - Premium Lifestyle & News",
  description: "Explore the latest in lifestyle, travel, food, automotive, and world news.",
};

// 👇 [0...6] LAGA DO, YE SIRF 6 CATEGORIES LAAYEGA
const NAV_CATEGORIES_QUERY = `*[_type == "category"] | order(_createdAt asc) [0...6] {
  name, "slug": slug.current
}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navCategories = await client.fetch(NAV_CATEGORIES_QUERY); 

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} bg-[#FAFAFA] text-gray-900 antialiased`}>
        <Navbar categories={navCategories} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}