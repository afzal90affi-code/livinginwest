import type { Metadata } from "next";

const SITE = "https://livinginwest.com";

export const metadata: Metadata = {
  title: "Trading & Finance Guides for Beginners",
  description:
    "Live market charts, currency converter, loan & EMI calculator and beginner-friendly guides for stocks, forex, gold and crypto — free tools on Living In West.",
  alternates: { canonical: `${SITE}/trading-finance` },
};

export default function TradingFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

