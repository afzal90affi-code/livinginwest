// app/mortgage-calculator/page.tsx
import type { Metadata } from "next";
import MortgageCalculatorUs from "@/lib/components/MortgageCalculatorUs";
import { getUsMortgageRate } from "@/lib/mortgage-rate";
export const revalidate = 86400; // har 24 ghante par page refresh (rate update)

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const pi = (loan: number, r: number, years: number) => {
  const m = r / 100 / 12, n = years * 12;
  return m === 0 ? loan / n : (loan * m) / (1 - Math.pow(1 + m, -n));
};

// ✅ AUTO METADATA — year + rate khud update
export async function generateMetadata(): Promise<Metadata> {
  const { rate } = await getUsMortgageRate();
  const year = new Date().getFullYear();
  return {
    title: `USA Mortgage Calculator — PITI With Taxes, Insurance & PMI (${year})`,
    description: `Free US mortgage calculator at today's ${rate}% 30-year fixed rate. See the true monthly payment with property tax, home insurance, PMI & HOA — plus how much extra payments save.`,
    alternates: { canonical: "/mortgage-calculator" },
  };
}

export default async function MortgageCalculatorPage() {
  const rateInfo = await getUsMortgageRate();
  const year = new Date().getFullYear();
  const { rate, formattedDate, isLive } = rateInfo;

  // Auto-calculated example (rate change par content khud badalta hai)
  const exLoan = 320000; // $400k home, 20% down
  const exPI = pi(exLoan, rate, 30);
  const exTax = (400000 * 0.011) / 12, exIns = 1800 / 12;
  const exTotal = exPI + exTax + exIns;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `USA Mortgage Calculator ${year}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    url: "https://livinginvest.com/mortgage-calculator",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `Calculate US mortgage payments with property tax, insurance, PMI and HOA. Uses the current ${rate}% 30-year fixed rate.`,
    areaServed: { "@type": "Country", name: "United States" },
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        USA Mortgage Calculator — PITI With Taxes, Insurance &amp; PMI ({year})
      </h1>
      <p className="text-gray-500 mt-2 text-sm">
        Last updated: {formattedDate} · Current 30-year fixed rate: <strong>{rate}%</strong>{" "}
        {isLive ? "(Freddie Mac weekly survey, auto-updated)" : "(estimate — edit field below)"}
      </p>

      <p className="text-gray-700 mt-5 leading-relaxed">
        A mortgage payment in the United States is almost never just principal and interest.
        Lenders quote a <strong>PITI</strong> number — Principal, Interest, Taxes and Insurance —
        and if your down payment is under 20%, <strong>PMI</strong> is added on top. This calculator
        uses the current national 30-year fixed rate of <strong>{rate}%</strong> and lets you
        adjust every US-specific cost: property tax (which varies dramatically by state),
        home insurance, HOA fees and extra monthly payments.
      </p>

      {/* ✅ CALCULATOR — live rate prop ke saath */}
      <div className="my-8">
        <MortgageCalculatorUs currentRate={rate} rateAsOf={rateInfo.formattedDate} isLive={isLive} />
      </div>

      {/* AUTO-UPDATING EXAMPLE SECTION */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        Example: $400,000 Home at Today&apos;s {rate}% Rate
      </h2>
      <p className="text-gray-700 mt-3 leading-relaxed">
        With 20% down ({money(80000)}), a {money(400000)} home leaves a {money(exLoan)} loan.
        At the current {rate}% 30-year fixed rate, principal and interest come to about{" "}
        <strong>{money(exPI)}/month</strong>. Add typical property tax (~1.1%) and insurance
        (~{money(exIns)}/mo) and the real monthly cost is roughly <strong>{money(exTotal)}</strong> —
        that&apos;s PITI, and it&apos;s the number that actually hits your bank account.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">What Is PITI?</h2>
      <p className="text-gray-700 mt-3 leading-relaxed">
        <strong>Principal</strong> is what you borrowed. <strong>Interest</strong> is the lender&apos;s
        charge. <strong>Taxes</strong> are property taxes — from roughly 0.3% in Hawaii to over 2.2%
        in New Jersey. <strong>Insurance</strong> covers homeowners insurance, and PMI (Private
        Mortgage Insurance) applies to most US loans with less than 20% down. US lenders typically
        escrow taxes and insurance, so your single monthly payment includes all of it.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">When Does PMI Go Away?</h2>
      <p className="text-gray-700 mt-3 leading-relaxed">
        On conventional loans, PMI automatically cancels once your balance reaches 78% of the
        home&apos;s original value, and you can request removal at 80%. That&apos;s why the calculator
        stops charging PMI once your equity passes 20% — a detail many online tools miss.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">How Much Do Extra Payments Save?</h2>
      <p className="text-gray-700 mt-3 leading-relaxed">
        Add any amount in the &quot;Extra Payment&quot; field. Even {money(100)}/month extra on a{" "}
        {money(exLoan)} loan at {rate}% typically cuts several years off the loan and saves tens of
        thousands in interest — the calculator shows your exact savings and new payoff date.
      </p>

      {/* AUTO-FAQ */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">FAQ</h2>
      <div className="space-y-5 mt-4 text-gray-700">
        <div>
          <h3 className="font-semibold">What is the current US mortgage rate?</h3>
          <p className="mt-1 text-sm">
            The national average 30-year fixed rate is <strong>{rate}%</strong> as of {formattedDate}
            {isLive ? ", from Freddie Mac&apos;s Primary Mortgage Market Survey (auto-updated weekly)." : ". Verify with your lender — rates vary by credit score and location."}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Does this work outside the United States?</h3>
          <p className="mt-1 text-sm">
            This tool is designed for US loans — 30-year fixed, escrowed taxes, PMI rules. Canadian
            mortgages work differently (5-year terms with semi-annual compounding) and need a
            separate calculator.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Is &quot;EMI&quot; the same as a monthly mortgage payment?</h3>
          <p className="mt-1 text-sm">
            The math is identical — Indian borrowers say EMI, US lenders say monthly payment or PITI.
            But US mortgages add property tax and insurance, so the PITI number is what matters here.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">How accurate are the state property tax presets?</h3>
          <p className="mt-1 text-sm">
            They&apos;re approximate state-level effective rates. Your county and city can differ
            significantly — the field is editable, so enter your local rate for exact results.
          </p>
        </div>
      </div>
    </article>
  );
}
