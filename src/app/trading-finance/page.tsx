"use client";
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, TrendingUp, DollarSign, Globe, Calculator, Coins, Share2, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';

// --- Market Data for Table ---
const marketData = [
  { region: 'United States', category: 'Index', name: 'S&P 500', actual: '4.6810', chg: '0.064', pchg: '0.06%', isUp: true },
  { region: 'Japan', category: 'Index', name: 'Nikkei 225', actual: '32.5', chg: '0.044', pchg: '-0.04%', isUp: false },
  { region: 'United States', category: 'Commodity', name: 'Gold', actual: '2.015', chg: '0.012', pchg: '0.60%', isUp: true },
  { region: 'Global', category: 'Crypto', name: 'Bitcoin', actual: '61,500', chg: '1.200', pchg: '1.98%', isUp: true },
  { region: 'Europe', category: 'Forex', name: 'EUR/USD', actual: '1.0850', chg: '0.002', pchg: '0.18%', isUp: true },
  { region: 'United States', category: 'Stocks', name: 'AAPL', actual: '175.40', chg: '1.200', pchg: '-0.68%', isUp: false },
];

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
      dateRange: dateRange,
      colorTheme: "light", isTransparent: true, autosize: true,
    });
    containerRef.current.appendChild(script);
  }, [symbol, dateRange]);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{name}</h3>
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
      feedMode: "symbol", symbol: "TVC:GOLD",
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
        <Calculator className="w-5 h-5 text-blue-600" /> Currency Converter
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{amount} {from} =</p>
        <p className="text-2xl font-bold text-blue-600">{result.toFixed(2)} {to}</p>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function TradingFinancePage() {
  // پورے پیج کو شیئر کرنے کا فنکشن
  const handleSharePage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Trading & Finance - Living In West',
        text: 'Check out live global market charts, rates, and financial news!',
        url: window.location.href,
      }).catch((err) => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // کسی خاص سیکشن (Single Item) کو شیئر کرنے کا فنکشن
  const handleShareItem = (itemName: string) => {
    const shareData = {
      title: `${itemName} - Living In West`,
      text: `Check out live ${itemName} data and charts at Living In West!`,
      url: window.location.href, 
    };
    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log(err));
    } else {
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert(`Link for ${itemName} copied to clipboard!`);
    }
  };

  // سیکشن ہیڈر اور شیئر بٹن والا ری-یوزایبل کمپوننٹ
  const SectionHeader = ({ icon, title, color, itemName }: { icon: React.ReactNode, title: string, color: string, itemName: string }) => (
    <div className={`flex items-center justify-between border-b-2 ${color} pb-2 mb-6`}>
      <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
        {icon} {title}
      </h2>
      <button 
        onClick={() => handleShareItem(itemName)} 
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-full transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* ہیرو سیکشن */}
      <div className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Trading & Finance</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            Live global market charts, metals & minerals rates, currency converters, and financial news.
          </p>
          
          {/* پورا پیج شیئر کرنے کا بٹن */}
          <button 
            onClick={handleSharePage} 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share This Page
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TickerTape />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        <div className="flex-1 space-y-16">
          
          {/* 0. Global Markets Overview Table (Naya Add Kiya Gaya Hai) */}
          <section>
            <SectionHeader icon={<BarChart2 className="w-6 h-6 text-indigo-600" />} title="Global Markets Overview" color="border-indigo-600" itemName="Global Markets Overview" />
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Country/Region</th>
                    <th scope="col" className="px-6 py-3 font-medium">Category</th>
                    <th scope="col" className="px-6 py-3 font-medium">Name</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Actual</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Chg</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">%Chg</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.isUp ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {item.region}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-200">{item.actual}</td>
                      <td className={`px-6 py-4 text-right font-mono font-medium ${item.isUp ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {item.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {item.chg}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-medium ${item.isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {item.pchg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 1. Global Minerals & Metals */}
          <section>
            <SectionHeader icon={<Coins className="w-6 h-6 text-amber-600" />} title="Precious & Industrial Minerals" color="border-amber-600" itemName="Precious & Industrial Minerals" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="TVC:GOLD" name="Gold (XAU/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:SILVER" name="Silver (XAG/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:COPPER" name="Copper (Industrial) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:PLATINUM" name="Platinum (XPT/USD) - 1 Month" dateRange="1M" />
              <TradingViewWidget symbol="TVC:PALLADIUM" name="Palladium (XPD/USD) - 1 Month" dateRange="1M" />
            </div>
          </section>

          {/* 2. Metals & Minerals Live News */}
          <section>
            <SectionHeader icon={<TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />} title="Metals & Minerals Live News" color="border-gray-900 dark:border-white" itemName="Metals & Minerals Live News" />
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <MetalsNewsTimeline />
            </div>
          </section>

          {/* 3. USA Market */}
          <section>
            <SectionHeader icon={<span className="text-2xl">🇺🇸</span>} title="USA Markets" color="border-blue-600" itemName="USA Markets" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:SPXUSD" name="S&P 500 Index" />
              <TradingViewWidget symbol="NASDAQ:AAPL" name="Apple Inc. (AAPL)" />
            </div>
          </section>

          {/* 4. Canada Market */}
          <section>
            <SectionHeader icon={<span className="text-2xl">🇨🇦</span>} title="Canada Markets" color="border-red-600" itemName="Canada Markets" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:TSX" name="S&P/TSX Composite" />
              <TradingViewWidget symbol="NYSE:SHOP" name="Shopify Inc. (SHOP)" />
            </div>
          </section>

          {/* 5. UK Market */}
          <section>
            <SectionHeader icon={<span className="text-2xl">🇬🇧</span>} title="UK Markets" color="border-purple-600" itemName="UK Markets" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="FOREXCOM:UKX" name="FTSE 100 Index" />
              <TradingViewWidget symbol="LSE:BARC" name="Barclays PLC (BARC)" />
            </div>
          </section>

          {/* 6. China Market */}
          <section>
            <SectionHeader icon={<span className="text-2xl">🇨🇳</span>} title="China Markets" color="border-yellow-600" itemName="China Markets" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradingViewWidget symbol="INDEX:SSEC" name="Shanghai Composite" />
              <TradingViewWidget symbol="HKEX:0700" name="Tencent Holdings" />
            </div>
          </section>

          {/* 7. Global Exchange Rates */}
          <section>
            <SectionHeader icon={<Globe className="w-6 h-6 text-green-600" />} title="Global Exchange Rates" color="border-green-600" itemName="Global Exchange Rates" />
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <ForexCrossRates />
            </div>
          </section>

          {/* 8. Currency Calculator */}
          <section>
            <SectionHeader icon={<Calculator className="w-5 h-5 text-blue-600" />} title="Currency Converter" color="border-blue-600" itemName="Currency Converter" />
            <CurrencyCalculator />
          </section>

        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[30%] space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
            <h3 className="text-lg font-bold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
              <DollarSign className="w-5 h-5 text-green-600" /> Market Trends
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex justify-between"><span>USD/EUR</span><span className="font-bold text-green-600">▲ 0.92</span></li>
              <li className="flex justify-between"><span>GBP/USD</span><span className="font-bold text-red-600">▼ 1.27</span></li>
              <li className="flex justify-between"><span>USD/CAD</span><span className="font-bold text-green-600">▲ 1.36</span></li>
              <li className="flex justify-between"><span>Gold (oz)</span><span className="font-bold text-green-600">▲ 2300</span></li>
              <li className="flex justify-between"><span>Silver (oz)</span><span className="font-bold text-green-600">▲ 27.5</span></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}