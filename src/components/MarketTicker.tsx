"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link'; // ✅ لنک کے لیے امپورٹ
import { ArrowRight } from 'lucide-react'; // ✅ آئیکن کے لیے امپورٹ

const countries = [
  { code: 'US', currency: 'USD', flag: '🇺🇸', name: 'USA' },
  { code: 'EU', currency: 'EUR', flag: '🇪🇺', name: 'Europe' },
  { code: 'GB', currency: 'GBP', flag: '🇬🇧', name: 'UK' },
  { code: 'CN', currency: 'CNY', flag: '🇨🇳', name: 'China' },
  { code: 'CA', currency: 'CAD', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', currency: 'AUD', flag: '🇦🇺', name: 'Australia' },
  { code: 'PK', currency: 'PKR', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'IN', currency: 'INR', flag: '🇮🇳', name: 'India' },
  { code: 'AE', currency: 'AED', flag: '🇦🇪', name: 'UAE' },
  { code: 'SA', currency: 'SAR', flag: '🇸🇦', name: 'Saudi Arabia' },
];

const marketData = [
  { symbol: 'BTC', name: 'Bitcoin', priceUSD: 65000, change: 2.5 },
  { symbol: 'ETH', name: 'Ethereum', priceUSD: 3500, change: -1.2 },
  { symbol: 'AAPL', name: 'Apple', priceUSD: 170, change: 0.8 },
  { symbol: 'TSLA', name: 'Tesla', priceUSD: 250, change: -3.1 },
  { symbol: 'GOLD', name: 'Gold (oz)', priceUSD: 2300, change: 0.5 },
  { symbol: 'XAG', name: 'Silver (oz)', priceUSD: 27.5, change: 1.2 }, 
  { symbol: 'OIL', name: 'Crude Oil', priceUSD: 78.5, change: -0.5 }, 
  { symbol: 'SPX', name: 'S&P 500', priceUSD: 5200, change: 0.4 },    
];

export default function MarketTicker() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [exchangeRates, setExchangeRates] = useState<any>({});
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setExchangeRates(data.rates);
          setLoadingRates(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch exchange rates:", err);
        setLoadingRates(false);
      });
  }, []);

  const convertPrice = (usdPrice: number) => {
    if (selectedCountry.currency === 'USD') return usdPrice.toFixed(2);
    const rate = exchangeRates[selectedCountry.currency];
    if (rate) {
      return (usdPrice * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return usdPrice.toFixed(2); 
  };

  const currencySymbol = (currency: string) => {
    const symbols: any = { 
      USD: '$', EUR: '€', GBP: '£', CNY: '¥ ', CAD: 'C$ ', AUD: 'A$ ', PKR: 'Rs ', INR: '₹', AED: 'AED ', SAR: 'SAR ' 
    };
    return symbols[currency] || '';
  };

  return (
    <div className="bg-gray-900 text-white py-3 overflow-hidden border-b border-gray-800">
      <style>
        {`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-animation {
            animation: tickerScroll 25s linear infinite;
          }
          .ticker-animation:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 sm:gap-6">
        
        {/* 🌍 Country Selector */}
        <div className="flex-shrink-0 relative z-10">
          <select 
            value={selectedCountry.code}
            onChange={(e) => {
              const country = countries.find(c => c.code === e.target.value);
              if (country) setSelectedCountry(country);
            }}
            className="bg-gray-800 text-white text-sm rounded-md py-1 pl-2 pr-8 border border-gray-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.currency}
              </option>
            ))}
          </select>
        </div>

        {/* 📊 Scrolling Market Data */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 whitespace-nowrap ticker-animation cursor-pointer">
            {[...marketData, ...marketData].map((item, index) => {
              const isUp = item.change >= 0;
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-gray-300">{item.symbol}</span>
                  <span className="text-white font-medium">
                    {currencySymbol(selectedCountry.currency)}{convertPrice(item.priceUSD)}
                  </span>
                  <span className={`text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                    {isUp ? '▲' : '▼'} {Math.abs(item.change)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ یہاں دائیں جانب بٹن اضافہ کیا گیا ہے */}
        <Link href="/trading-finance" className="hidden sm:flex items-center gap-1 flex-shrink-0 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">
          View Market <ArrowRight className="w-3 h-3" />
        </Link>

      </div>

      {loadingRates && (
        <div className="text-center text-[10px] text-gray-500 mt-1">
          Fetching live exchange rates...
        </div>
      )}
    </div>
  );
}