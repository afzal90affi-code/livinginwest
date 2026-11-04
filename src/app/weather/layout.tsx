import type { Metadata } from "next";

const SITE = "https://livinginwest.com";

export const metadata: Metadata = {
  title: "US Weather — Live Forecasts by City",
  description:
    "Current weather and forecasts for major US cities — temperature, conditions and weekly outlook in one place.",
  alternates: { canonical: `${SITE}/weather` },
};

export default function WeatherLayout({ children }: { children: React.ReactNode }) {
  return children;
}