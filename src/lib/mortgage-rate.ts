// lib/mortgage-rate.ts
// Freddie Mac 30-Year Fixed Rate via FRED (MORTGAGE30US — weekly series)

export interface RateInfo {
  rate: number;
  asOf: string | null;      // "2026-01-15"
  formattedDate: string;    // "January 15, 2026"
  isLive: boolean;          // true = API se aayi, false = fallback
}

const FALLBACK_RATE = Number(process.env.NEXT_PUBLIC_DEFAULT_MORTGAGE_RATE || 6.5);

export async function getUsMortgageRate(): Promise<RateInfo> {
  const key = process.env.FRED_API_KEY;
  if (key) {
    try {
      const res = await fetch(
        `https://api.stlouisfed.org/fred/series/observations` +
        `?series_id=MORTGAGE30US&api_key=${key}&file_type=json` +
        `&sort_order=desc&limit=4`,
        { next: { revalidate: 86400 } } // daily refresh — rate weekly aata hai
      );
      if (res.ok) {
        const data = await res.json();
        // Latest VALID observation dhundo ("." = missing value hota hai)
        for (const obs of data.observations || []) {
          if (obs.value && obs.value !== "." && !isNaN(parseFloat(obs.value))) {
            const d = new Date(obs.date + "T00:00:00");
            return {
              rate: parseFloat(obs.value),
              asOf: obs.date,
              formattedDate: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              isLive: true,
            };
          }
        }
      }
    } catch { /* fallback neeche */ }
  }
  return {
    rate: FALLBACK_RATE,
    asOf: null,
    formattedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    isLive: false,
  };
}
