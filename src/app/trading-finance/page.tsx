"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanityClient';
import { urlFor } from "@/lib/sanityImage";
import { ArrowRight, TrendingUp, DollarSign, Globe, Calculator, Coins } from 'lucide-react';
import { ShareCardButton } from '@/components/share';

// --- TradingView Graph Widget ---
const TradingViewWidget = ({ symbol, name, dateRange = "3M" }: { symbol: string, name: string, dateRange?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol, width: "100%", height: "100%", locale: "en",
      dateRange: dateRange, // ✅ یہاں گراف کا ٹائم سیٹ ہوگا (3M یا 1M)
      colorTheme: "light", isTransparent: true, autosize: true,
    });
    containerRef.current.appendChild(script);
  }, [symbol, dateRange]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm text-gray-500 font-medium mb-2">{name}</h3>
      <div className="h-[200px] w-full" ref={containerRef}></div>
    </div>
  );
};

// --- TradingView Ticker Tape ---
const TickerTape = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:TSX", title: "TSX" },
        { proName: "FOREXCOM:UKX", title: "FTSE 100" },
        { proName: "INDEX:SSEC", title: "Shanghai" },
        { proName: "TVC:GOLD", title: "Gold" },
        { proName: "TVC:SILVER", title: "Silver" },
        { proName: "FX_IDC:USDCAD", title: "USD/CAD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
      ],
      colorTheme: "light", displayMode: "adaptive", locale: "en"
    });
    containerRef.current.appendChild(script);
  }, []);
  return <div className="tradingview-widget-container" ref={containerRef}></div>;
};

// --- TradingView Forex Cross Rates ---
const ForexCrossRates = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%", height: "100%", currencies: ["USD", "EUR", "GBP", "CAD", "CNY", "PKR", "INR"],
      isTransparent: true, colorTheme: "light", locale: "en"
    });
    containerRef.current.appendChild(script);
  }, []);
  return <div className="h-[400px] w-full" ref={containerRef}></div>;
};

// --- TradingView Metals News Timeline ---
const MetalsNewsTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "symbol", symbol: "TVC:GOLD", // گولڈ اور دوسری معدنیات کی لائیو نیوز
      colorTheme: "light", isTransparent: true, displayMode: "regular",
      width: "100%", height: "100%", locale: "en"
    });
    containerRef.current.appendChild(script);
  }, []);
  return <div className="h-[500px] w-full" ref={containerRef}></div>;
};

// --- Currency Calculator ---
const CurrencyCalculator = () => {
  const [rates, setRates] = useState<any>(null);
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [result, setResult] = useState(0);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => { if (data.rates) setRates(data.rates); });
  }, []);

  useEffect(() => {
    if (rates) {
      const usdAmount = amount / rates[from];
      const converted = usdAmount * rates[to];
      setResult(converted);
    }
  }, [amount, from, to, rates]);

  const currencies = rates ? Object.keys(rates) : ["USD", "PKR", "EUR", "GBP", "CAD", "CNY"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" /> Currency Converter
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs text-gray-500 font-medium">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500">{amount} {from} =</p>
        <p className="text-2xl font-bold text-blue-600">{result.toFixed(2)} {to}</p>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function TradingFinancePage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const query = `*[_type == "blog" && category == "Trading & Finance" && isPublished == true] | order(date desc)[0...6] {
          _id, title, slug, desc, date, subcategory, "imgUrl": img1.asset->url
        }`;
        const result = await client.fetch(query);
        setNews(result);
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Trading & Finance</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Live global market charts, metals & minerals rates, currency converters, and AI-Powered financial news.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <TickerTape />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        <div className="flex-1 space-y-16">
          
          {/* 1. Global Minerals & Metals (Monthly Graph) */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-amber-600 pb-2 flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-600" /> Precious & Industrial Minerals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* dateRange="1M" کا مطلب ہے 1 مہینے کا گراف */}
              <TradingViewWidget symbol="TVC:GOLD" name="Gold (XAU/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:SILVER" name="Silver (XAG/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:COPPER" name="Copper (Industrial) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:PLATINUM" name="Platinum (XPT/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:PALLADIUM" name="Palladium (XPD/USD) - 1 Month" dateRange="1M" />
            </div>
          </section>

          {/* 2. Metals & Minerals Live News */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-gray-900 pb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-gray-900" /> Metals & Minerals Live News
            </h2>
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <MetalsNewsTimeline />
            </div>
          </section>

          {/* 3. USA Market */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-600 pb-2 flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span> USA Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:SPXUSD" name="S&P 500 Index" />
              <TradingViewWidget symbol="NASDAQ:AAPL" name="Apple Inc. (AAPL)" />
            </div>
          </section>

          {/* 4. Canada Market */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-red-600 pb-2 flex items-center gap-2">
              <span className="text-2xl">🇨🇦</span> Canada Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:TSX" name="S&P/TSX Composite" />
              <TradingViewWidget symbol="NYSE:SHOP" name="Shopify Inc. (SHOP)" />
            </div>
          </section>

          {/* 5. UK Market */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-purple-600 pb-2 flex items-center gap-2">
              <span className="text-2xl">🇬🇧</span> UK Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:UKX" name="FTSE 100 Index" />
              <TradingViewWidget symbol="LSE:BARC" name="Barclays PLC (BARC)" />
            </div>
          </section>

          {/* 6. China Market */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-600 pb-2 flex items-center gap-2">
              <span className="text-2xl">🇨🇳</span> China Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="INDEX:SSEC" name="Shanghai Composite" />
              <TradingViewWidget symbol="HKEX:0700" name="Tencent Holdings" />
            </div>
          </section>

          {/* 7. Global Exchange Rates */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-green-600 pb-2 flex items-center gap-2">
              <Globe className="w-6 h-6 text-green-600" /> Global Exchange Rates
            </h2>
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <ForexCrossRates />
            </div>
          </section>

          {/* 8. Currency Calculator */}
          <section>
            <CurrencyCalculator />
          </section>

          {/* 9. AI Sanity News */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-900 pb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-900" /> AI Generated Financial News
            </h2>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading news...</div>
            ) : news.length === 0 ? (
              <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-dashed">
                No financial news published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.map((blog: any) => (
                  <div key={blog._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.imgUrl && (
                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                          <Image src={blog.imgUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            {blog.subcategory || 'Finance'}
                          </div>
                        </div>
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <Link href={`/blog/${blog.slug}`}>
                        <h3 className="font-playfair text-xl font-bold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-1">{blog.desc}</p>
                      </Link>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Link href={`/blog/${blog.slug}`} className="flex items-center text-blue-600 text-sm font-semibold">
                          Read More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[30%] space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Market Trends
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-gray-600"><span>USD/EUR</span><span className="font-bold text-green-600">▲ 0.92</span></li>
              <li className="flex justify-between text-gray-600"><span>GBP/USD</span><span className="font-bold text-red-600">▼ 1.27</span></li>
              <li className="flex justify-between text-gray-600"><span>USD/CAD</span><span className="font-bold text-green-600">▲ 1.36</span></li>
              <li className="flex justify-between text-gray-600"><span>Gold (oz)</span><span className="font-bold text-green-600">▲ 2300</span></li>
              <li className="flex justify-between text-gray-600"><span>Silver (oz)</span><span className="font-bold text-green-600">▲ 27.5</span></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}