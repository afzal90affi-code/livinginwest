"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ============================================================
   TradingView live widgets — every number on this page comes
   from TradingView / ER-API in real time. No hardcoded prices.
   ============================================================ */

const TV_SCRIPTS = {
  tickerTape: "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
  miniChart: "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js",
  crossRates: "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js",
  timeline: "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
};

const TradingViewWidget = memo(function TradingViewWidget({
  script,
  config,
  height,
}: {
  script: string;
  config: Record<string, unknown>;
  height: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.width = "100%";
    widget.style.height = "100%";
    el.appendChild(widget);

    const scriptTag = document.createElement("script");
    scriptTag.src = script;
    scriptTag.type = "text/javascript";
    scriptTag.async = true;
    scriptTag.innerHTML = JSON.stringify(config);
    el.appendChild(scriptTag);

    return () => {
      el.innerHTML = "";
    };
  }, [script, config]);

  return (
    <div
      ref={ref}
      className="tradingview-widget-container overflow-hidden rounded-xl border border-slate-200 bg-white"
      style={{ height, width: "100%" }}
    />
  );
});

function miniChartConfig(symbol: string): Record<string, unknown> {
  return {
    symbol,
    width: "100%",
    height: "100%",
    locale: "en",
    dateRange: "12M",
    colorTheme: "light",
    isTransparent: true,
    autosize: true,
    chartOnly: false,
  };
}

const TICKER_TAPE_CONFIG: Record<string, unknown> = {
  symbols: [
    { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
    { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
    { proName: "TVC:DJI", title: "Dow Jones" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
    { proName: "TVC:GOLD", title: "Gold" },
    { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
    { proName: "FX_IDC:USDPKR", title: "USD/PKR" },
  ],
  showSymbolLogo: true,
  colorTheme: "light",
  isTransparent: true,
  displayMode: "adaptive",
  locale: "en",
};

const CROSS_RATES_CONFIG: Record<string, unknown> = {
  width: "100%",
  height: "100%",
  currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "CNY", "INR", "PKR"],
  isTransparent: true,
  colorTheme: "light",
  locale: "en",
  origin: "https://www.tradingview.com",
};

const NEWS_CONFIG: Record<string, unknown> = {
  feedMode: "market",
  market: "forex",
  width: "100%",
  height: "100%",
  colorTheme: "light",
  isTransparent: true,
  displayMode: "regular",
  locale: "en",
};

const MARKET_CHARTS: { label: string; caption: string; config: Record<string, unknown> }[] = [
  { label: "S&P 500", caption: "US large-cap stock index", config: miniChartConfig("FOREXCOM:SPXUSD") },
  { label: "Bitcoin", caption: "BTC / USD, 24/7 market", config: miniChartConfig("BITSTAMP:BTCUSD") },
  { label: "Gold", caption: "Spot gold (XAU/USD)", config: miniChartConfig("TVC:GOLD") },
];

/* ============================================================
   Currency converter — live reference rates from open ER-API
   (exchangerate-api.com). Updated once per day; the API's own
   timestamp is shown to the user.
   ============================================================ */

const CURRENCIES: { code: string; name: string }[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "VND", name: "Vietnamese Dong" },
];

const POPULAR_PAIRS: [string, string][] = [
  ["USD", "PKR"],
  ["USD", "INR"],
  ["USD", "PHP"],
  ["USD", "MXN"],
  ["USD", "EUR"],
  ["USD", "NGN"],
];

function formatMoney(value: number, code: string): string {
  const digits = value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

function formatRate(value: number): string {
  const digits = value >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function CurrencyCalculator() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [updated, setUpdated] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const loadRates = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data: {
        result?: string;
        rates?: Record<string, number>;
        time_last_update_utc?: string;
      } = await res.json();

      if (data.result === "success" && data.rates) {
        setRates(data.rates);
        const ts = new Date(data.time_last_update_utc || "");
        setUpdated(
          Number.isNaN(ts.getTime())
            ? String(data.time_last_update_utc || "")
            : `${ts.toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })} UTC`
        );
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const amountNum = parseFloat(amount);
  const validAmount = Number.isFinite(amountNum) && amountNum >= 0;

  const fromRate = rates ? rates[from] : undefined;
  const toRate = rates ? rates[to] : undefined;
  const converted =
    validAmount && fromRate && toRate ? (amountNum / fromRate) * toRate : null;
  const unitRate = fromRate && toRate ? toRate / fromRate : null;

  const selectClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {status === "loading" && (
        <div className="flex items-center gap-3 py-6 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading live exchange rates…
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Could not load exchange rates. Check your connection and try again.</span>
          <button
            onClick={loadRates}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {status === "ready" && rates && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cc-amount" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </label>
              <input
                id="cc-amount"
                type="number"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="cc-from" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                From
              </label>
              <select id="cc-from" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cc-to" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                To
              </label>
              <select id="cc-to" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={swap}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-50"
                aria-label="Swap currencies"
              >
                ⇅ Swap currencies
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Popular:</span>
            {POPULAR_PAIRS.map(([f, t]) => (
              <button
                key={`${f}-${t}`}
                onClick={() => {
                  setFrom(f);
                  setTo(t);
                }}
                className={`rounded-full border px-3 py-1 transition ${
                  from === f && to === t
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {f} → {t}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Converted amount</p>
            <p className="mt-1 break-words text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {converted !== null ? formatMoney(converted, to) : "—"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {unitRate !== null ? `1 ${from} = ${formatRate(unitRate)} ${to}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">Rates updated: {updated}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Loan / EMI calculator — pure client-side math
   (standard amortization formula), no API, no fake data.
   ============================================================ */

const TERM_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30];

function LoanCalculator() {
  const [amount, setAmount] = useState("25000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("5");

  const p = parseFloat(amount);
  const apr = parseFloat(rate);
  const n = (parseInt(years, 10) || 0) * 12;
  const r = (Number.isFinite(apr) && apr > 0 ? apr : 0) / 100 / 12;

  let monthly: number | null = null;
  if (Number.isFinite(p) && p > 0 && n > 0 && Number.isFinite(apr) && apr >= 0) {
    monthly = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPaid = monthly !== null ? monthly * n : null;
  const totalInterest = totalPaid !== null ? totalPaid - p : null;

  const usd0 = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);
  const usd2 = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label htmlFor="loan-amount" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Loan amount ($)
          </label>
          <input
            id="loan-amount"
            type="number"
            min="0"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label htmlFor="loan-rate" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Annual interest rate (% APR)
          </label>
          <input
            id="loan-rate"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label htmlFor="loan-years" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Loan term
          </label>
          <select
            id="loan-years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-blue-500"
          >
            {TERM_OPTIONS.map((y) => (
              <option key={y} value={String(y)}>
                {y} {y === 1 ? "year" : "years"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 rounded-xl bg-slate-50 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Estimated monthly payment</p>
          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {monthly !== null ? usd2(monthly) : "—"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Total interest</p>
            <p className="mt-0.5 font-bold text-slate-800">
              {totalInterest !== null ? usd0(totalInterest) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Total to repay</p>
            <p className="mt-0.5 font-bold text-slate-800">
              {totalPaid !== null ? usd0(totalPaid) : "—"}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Standard amortization estimate. Actual payments can differ due to fees, insurance, taxes or a variable rate.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Static content (honest, no invented numbers)
   ============================================================ */

const GUIDES: { title: string; body: string }[] = [
  {
    title: "Stocks",
    body: "A share of stock is a small ownership stake in a company. Most US beginners start with broad index funds — such as funds that track the S&P 500 — instead of picking individual companies.",
  },
  {
    title: "Forex (Currency Trading)",
    body: "Forex is the market where currencies are exchanged — the largest financial market in the world. Rates move with interest rates, inflation and trade flows, and they matter every time you send money abroad.",
  },
  {
    title: "Gold",
    body: "Gold has been a store of value for centuries. Many investors keep a small portion of their portfolio in gold to diversify, because it is often seen as a safe-haven asset during uncertain times.",
  },
  {
    title: "Crypto",
    body: "Crypto assets like Bitcoin trade 24/7 and can move sharply in both directions. If you are starting out, learn first, invest only what you can afford to lose, and use our free crypto calculator to convert between coins.",
  },
];

const TOOLS: { href: string; title: string; desc: string }[] = [
  {
    href: "/crypto-calculator",
    title: "Crypto Calculator",
    desc: "Convert BTC, ETH, SOL and 15+ coins between each other or 25+ fiat currencies with live rates.",
  },
  {
    href: "/income-tax-calculator",
    title: "US Income Tax Calculator",
    desc: "Estimate your 2026 federal income tax, tax brackets and take-home pay in minutes.",
  },
  {
    href: "/daily-news",
    title: "Daily Crypto News",
    desc: "The latest crypto headlines and market updates, refreshed throughout the day.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where does the market data on this page come from?",
    a: "Charts, ticker prices and news come from embedded TradingView widgets and update live during market hours. Currency conversion rates come from the open ER-API reference rates, which are published once per day.",
  },
  {
    q: "How often are the exchange rates updated?",
    a: "The currency converter uses ER-API reference rates, which update once per day. The exact update time is shown under the converter result. TradingView charts and news update in real time.",
  },
  {
    q: "Is the loan calculator accurate?",
    a: "It uses the standard amortization formula, so the math is exact for a fixed-rate loan. Your actual payment may differ because of fees, insurance, taxes or a variable interest rate — always confirm the final numbers with your lender.",
  },
  {
    q: "Is this financial advice?",
    a: "No. Everything on this page is for information and education only. Markets involve risk, and past performance does not guarantee future results. Speak to a licensed financial advisor before making investment decisions.",
  },
];

/* ============================================================
   Page
   ============================================================ */

export default function TradingFinancePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Live market ticker strip */}
      <div className="border-b border-slate-200 bg-white py-2">
        <div className="mx-auto max-w-6xl px-4">
          <TradingViewWidget script={TV_SCRIPTS.tickerTape} config={TICKER_TAPE_CONFIG} height="46px" />
        </div>
      </div>

      <header className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:pt-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Live Markets · Tools · Guides
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Trading &amp; Finance Hub
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          Track live markets, convert currencies at today&apos;s rates and estimate loan payments —
          free, beginner-friendly tools for managing your money in the US.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {["Live market data", "20+ currencies", "Loan & EMI calculator", "No sign-up needed"].map((b) => (
            <span key={b} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
              {b}
            </span>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-4 pb-16">
        {/* Market snapshot — live charts */}
        <section aria-labelledby="market-snapshot">
          <h2 id="market-snapshot" className="text-xl font-bold sm:text-2xl">
            Market Snapshot
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Live 12-month charts for the S&amp;P 500, Bitcoin and Gold — streamed from TradingView.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {MARKET_CHARTS.map((c) => (
              <div key={c.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{c.label}</h3>
                  <span className="text-right text-xs text-slate-500">{c.caption}</span>
                </div>
                <div className="mt-2">
                  <TradingViewWidget script={TV_SCRIPTS.miniChart} config={c.config} height="220px" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Currency converter — live API */}
        <section aria-labelledby="currency-converter">
          <h2 id="currency-converter" className="text-xl font-bold sm:text-2xl">
            Currency Converter
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Live reference rates for 20+ currencies, updated daily — handy for remittances, travel
            budgeting and price checks.
          </p>
          <div className="mt-4">
            <CurrencyCalculator />
          </div>
        </section>

        {/* Loan / EMI calculator — real math */}
        <section aria-labelledby="loan-calculator">
          <h2 id="loan-calculator" className="text-xl font-bold sm:text-2xl">
            Loan &amp; EMI Calculator
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Estimate the monthly payment for a personal loan, auto loan or mortgage using the
            standard amortization formula.
          </p>
          <div className="mt-4">
            <LoanCalculator />
          </div>
        </section>

        {/* Forex cross rates — live */}
        <section aria-labelledby="forex-cross-rates">
          <h2 id="forex-cross-rates" className="text-xl font-bold sm:text-2xl">
            Forex Cross Rates
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Live currency-to-currency matrix. Each cell shows how much one unit of the row currency
            is worth in the column currency.
          </p>
          <div className="mt-4">
            <TradingViewWidget script={TV_SCRIPTS.crossRates} config={CROSS_RATES_CONFIG} height="420px" />
          </div>
        </section>

        {/* Market news — live */}
        <section aria-labelledby="market-news">
          <h2 id="market-news" className="text-xl font-bold sm:text-2xl">
            Market News
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The latest forex and macro headlines from TradingView — updated automatically throughout
            the day.
          </p>
          <div className="mt-4">
            <TradingViewWidget script={TV_SCRIPTS.timeline} config={NEWS_CONFIG} height="450px" />
          </div>
        </section>

        {/* Beginner guides */}
        <section aria-labelledby="beginner-guides">
          <h2 id="beginner-guides" className="text-xl font-bold sm:text-2xl">
            Beginner Guides
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {GUIDES.map((g) => (
              <article key={g.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-blue-700">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Internal tool links */}
        <section aria-labelledby="more-tools">
          <h2 id="more-tools" className="text-xl font-bold sm:text-2xl">
            More Free Tools
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
              >
                <h3 className="font-semibold text-blue-700 group-hover:underline">{t.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{t.desc}</p>
                <span className="mt-3 inline-block text-sm font-medium text-blue-600">Open tool →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-bold sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer list-none font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="float-right text-slate-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Disclaimer</p>
          <p className="mt-1 leading-relaxed">
            This page is for information and education only — it is not financial, investment, tax
            or legal advice. Market charts and news are provided by TradingView; reference exchange
            rates are provided by the open ER-API service (updated daily). Trading involves risk.
            Always verify rates and terms with your bank, broker or lender before acting.
          </p>
        </aside>
      </main>

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
