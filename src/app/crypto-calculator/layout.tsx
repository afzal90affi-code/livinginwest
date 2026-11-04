import type { Metadata } from "next";

const SITE = "https://livinginwest.com";

export const metadata: Metadata = {
  title: "Crypto Calculator — Convert & Compare",
  description:
    "Free crypto calculator — convert BTC, ETH, SOL and 15+ coins between each other or 25+ fiat currencies with live rates, cross-rate table and charts.",
  alternates: { canonical: `${SITE}/crypto-calculator` },
};

export default function CryptoCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
