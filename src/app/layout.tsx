import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from "@/components/footer";
import Navbar from '@/components/navbar';


export const metadata: Metadata = {
  title: {
    default: 'LivingInWest — US, UK & Canada Lifestyle Blog',
    template: '%s | LivingInWest',
  },
  description: 'Discover the best of Western lifestyle — Food, Travel, Cars, Finance, Health, and Entertainment across US, UK & Canada.',
  keywords: ['lifestyle blog', 'USA lifestyle', 'UK lifestyle', 'Canada lifestyle', 'food blog', 'travel blog', 'automotive', 'finance', 'health', 'entertainment'],
  authors: [{ name: 'LivingInWest' }],
  openGraph: {
    title: 'LivingInWest — US, UK & Canada Lifestyle Blog',
    description: 'Discover the best of Western lifestyle — Food, Travel, Cars, Finance, and more.',
    url: 'https://livinginwest.com',
    siteName: 'LivingInWest',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivingInWest — Western Lifestyle Blog',
    description: 'Food, Travel, Cars, Finance — everything Western lifestyle.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body className="bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}