"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Bitcoin, ArrowLeft, Share2, RefreshCw, ArrowUpDown, Coins, TrendingUp, AlertCircle, Repeat } from 'lucide-react';

// ================= CONFIG =================
const CRYPTOS = [
  { id: 'bitcoin', sym: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', sym: 'ETH', name: 'Ethereum' },
  { id: 'tether', sym: 'USDT', name: 'Tether' },
  { id: 'usd-coin', sym: 'USDC', name: 'USD Coin' },
  { id: 'binancecoin', sym: 'BNB', name: 'BNB' },
  { id: 'solana', sym: 'SOL', name: 'Solana' },
  { id: 'ripple', sym: 'XRP', name: 'XRP' },
  { id: 'cardano', sym: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', sym: 'DOGE', name: 'Dogecoin' },
  { id: 'tron', sym: 'TRX', name: 'TRON' },
  { id: 'polkadot', sym: 'DOT', name: 'Polkadot' },
  { id: 'litecoin', sym: 'LTC', name: 'Litecoin' },
  { id: 'bitcoin-cash', sym: 'BCH', name: 'Bitcoin Cash' },
  { id: 'shiba-inu', sym: 'SHIB', name: 'Shiba Inu' },
  { id: 'avalanche-2', sym: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', sym: 'LINK', name: 'Chainlink' },
  { id: 'the-open-network', sym: 'TON', name: 'Toncoin' },
  { id: 'polygon-ecosystem-token', sym: 'POL', name: 'Polygon' },
];

const CRYPTO_IDS = new Set(CRYPTOS.map(c => c.id));
const SYM_OF: Record<string, string> = {};
CRYPTOS.forEach(c => { SYM_OF[c.id] = c.sym; });

const PRIORITY_FIAT = ['USD','PKR','INR','EUR','GBP','CAD','AUD','AED','SAR','QAR','KWD','CNY','JPY','CHF','NZD','SGD','TRY','BDT','LKR','NPR','MYR','ZAR','NGN','EGP','BRL','OMR','BHD'];

const TV_MAP: Record<string, string> = {
  bitcoin: 'BITSTAMP:BTCUSD', ethereum: 'BITSTAMP:ETHUSD', binancecoin: 'BINANCE:BNBUSDT',
  solana: 'BINANCE:SOLUSDT', ripple: 'BITSTAMP:XRPUSD', dogecoin: 'BINANCE:DOGEUSDT',
  cardano: 'BINANCE:ADAUSDT', litecoin: 'BITSTAMP:LTCUSD', 'bitcoin-cash': 'BITSTAMP:BCHUSD',
  'avalanche-2': 'BINANCE:AVAXUSDT', chainlink: 'BINANCE:LINKUSDT', polkadot: 'BINANCE:DOTUSDT',
  tron: 'BINANCE:TRXUSDT', 'shiba-inu': 'BINANCE:SHIBUSDT', 'the-open-network': 'BINANCE:TONUSDT',
};

// 🆕 Crypto ↔ Crypto + Crypto ↔ Fiat quick pairs
const QUICK_PAIRS = [
  { label: 'BTC → ETH', f: 'bitcoin', t: 'ethereum', hot: true },
  { label: 'ETH → BTC', f: 'ethereum', t: 'bitcoin', hot: true },
  { label: 'BTC → SOL', f: 'bitcoin', t: 'solana', hot: true },
  { label: 'SOL → ETH', f: 'solana', t: 'ethereum', hot: true },
  { label: 'USDT → BTC', f: 'tether', t: 'bitcoin', hot: false },
  { label: 'ETH → BNB', f: 'ethereum', t: 'binancecoin', hot: false },
  { label: 'BTC → USD', f: 'bitcoin', t: 'USD', hot: false },
  { label: 'BTC → PKR', f: 'bitcoin', t: 'PKR', hot: false },
  { label: 'ETH → INR', f: 'ethereum', t: 'INR', hot: false },
];

// 🆕 Cross-rates matrix mein kaunse cryptos dikhane hain
const CROSS_LIST = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'dogecoin', 'cardano', 'tron'];

type CryptoPrice = { usd: number; chg: number };

function fmtNum(v: number): string {
  if (v === 0) return '0';
  if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (v >= 1) return v.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (v >= 0.01) return v.toFixed(5);
  if (v >= 0.0001) return v.toFixed(7);
  return v.toFixed(8);
}

// --- TradingView Mini Chart ---
const TVChart = ({ symbol }: { symbol: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    s.async = true;
    s.innerHTML = JSON.stringify({
      symbol, width: '100%', height: '100%', locale: 'en',
      dateRange: '1M', colorTheme: 'light', isTransparent: true, autosize: true,
    });
    ref.current.appendChild(s);
  }, [symbol]);
  return <div className="h-[240px] w-full" ref={ref}></div>;
};

// ================= MAIN PAGE =================
export default function CryptoCalculatorPage() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [crypto, setCrypto] = useState<Record<string, CryptoPrice>>({});
  const [cryptoErr, setCryptoErr] = useState(false);
  const [updated, setUpdated] = useState('');
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('bitcoin');
  const [to, setTo] = useState('ethereum'); // 🆕 Default ab crypto-to-crypto hai!

  // ---- Data Loading ----
  const loadFiat = useCallback(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d.rates) setRates(d.rates); })
      .catch(() => {});
  }, []);

  const loadCrypto = useCallback(() => {
    const ids = CRYPTOS.map(c => c.id).join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then(r => { if (!r.ok) throw new Error('rate limit'); return r.json(); })
      .then(d => {
        const p: Record<string, CryptoPrice> = {};
        CRYPTOS.forEach(c => {
          if (d[c.id] && d[c.id].usd) p[c.id] = { usd: d[c.id].usd, chg: d[c.id].usd_24h_change || 0 };
        });
        setCrypto(p);
        setCryptoErr(false);
        setUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => setCryptoErr(true));
  }, []);

  useEffect(() => {
    loadFiat();
    loadCrypto();
    const t = setInterval(loadCrypto, 60000);
    return () => clearInterval(t);
  }, [loadFiat, loadCrypto]);

  // ---- Conversion Logic (sab USD ke through) ----
  const priceUSD = useCallback((asset: string): number | null => {
    if (CRYPTO_IDS.has(asset)) return crypto[asset] ? crypto[asset].usd : null;
    if (asset === 'USD') return 1;
    if (rates && typeof rates[asset] === 'number') return 1 / rates[asset];
    return null;
  }, [crypto, rates]);

  const amt = parseFloat(amount) || 0;
  const fromPrice = priceUSD(from);
  const toPrice = priceUSD(to);
  const result = fromPrice != null && toPrice != null && amt > 0 ? (amt * fromPrice) / toPrice : null;
  const oneFrom = fromPrice != null && toPrice != null ? fromPrice / toPrice : null;
  const oneTo = fromPrice != null && toPrice != null ? toPrice / fromPrice : null;
  const fromUsdValue = fromPrice != null ? amt * fromPrice : null;

  const isCryptoFrom = CRYPTO_IDS.has(from);
  const isCryptoTo = CRYPTO_IDS.has(to);
  const bothCrypto = isCryptoFrom && isCryptoTo;

  const labelOf = (a: string) => (CRYPTO_IDS.has(a) ? SYM_OF[a] : a);

  // ---- Fiat dropdown list ----
  const fiatList = useMemo(() => {
    if (!rates) return PRIORITY_FIAT;
    const avail = Object.keys(rates);
    const pri = PRIORITY_FIAT.filter(f => f === 'USD' || avail.includes(f));
    const rest = avail.filter(k => !PRIORITY_FIAT.includes(k)).sort();
    return Array.from(new Set(['USD', ...pri, ...rest]));
  }, [rates]);

  const swap = () => { setFrom(to); setTo(from); };

  // 🆕 Live prices table mein click → "From" set ho jaye
  const pickFrom = (id: string) => {
    setFrom(id);
    if (id === to) setTo(from); // same ho toh swap kar do
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Crypto Converter - Living In West', url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const chartSymbol = isCryptoFrom && TV_MAP[from] ? TV_MAP[from] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="bg-gray-900 dark:bg-black text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <Link href="/trading-finance" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Trading & Finance
          </Link>
          <div className="flex items-center gap-3">
            <Bitcoin className="w-9 h-9 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Crypto & Currency Converter</h1>
          </div>
          <p className="text-gray-400 mt-2">BTC ↔ ETH ↔ SOL — crypto se crypto, crypto se fiat, sab live convert karein.</p>
          <button onClick={handleShare} className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors">
            <Share2 className="w-4 h-4" /> Share This Page
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ===== Converter Card ===== */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
              <Repeat className="w-5 h-5 text-amber-500" /> Crypto ↔ Crypto ↔ Fiat
            </h3>

            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-amber-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" />

            <div className="grid grid-cols-1 gap-3 mt-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">From</label>
                <select value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-amber-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <optgroup label="🪙 Crypto">
                    {CRYPTOS.map(c => <option key={c.id} value={c.id}>{c.sym} — {c.name}</option>)}
                  </optgroup>
                  <optgroup label="💵 Fiat Currencies">
                    {fiatList.map(f => <option key={f} value={f}>{f}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="flex justify-center">
                <button onClick={swap} title="Swap"
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 transition-colors">
                  <ArrowUpDown className="w-4 h-4" /> Swap
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">To</label>
                <select value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-amber-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <optgroup label="🪙 Crypto">
                    {CRYPTOS.map(c => <option key={c.id} value={c.id}>{c.sym} — {c.name}</option>)}
                  </optgroup>
                  <optgroup label="💵 Fiat Currencies">
                    {fiatList.map(f => <option key={f} value={f}>{f}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="mt-5 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
              {bothCrypto && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-0.5 mb-2">Crypto → Crypto</span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{fmtNum(amt)} {labelOf(from)} =</p>
              <p className="text-2xl font-bold text-amber-500 break-all">
                {result != null ? `${fmtNum(result)} ${labelOf(to)}` : 'Loading rates…'}
              </p>
              {fromUsdValue != null && fromPrice != null && !bothCrypto && isCryptoFrom && (
                <p className="text-xs text-gray-500 mt-1">≈ ${fmtNum(fromUsdValue)} USD value</p>
              )}
             {oneFrom != null && oneTo != null && (
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
               1 {labelOf(from)} = {fmtNum(oneFrom)} {labelOf(to)} &nbsp;·&nbsp; 1 {labelOf(to)} = {fmtNum(oneTo)} {labelOf(from)}
             </p>
                 )}
            </div>

            {/* Quick Pairs — Crypto pairs pehle */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_PAIRS.map(q => (
                <button key={q.label} onClick={() => { setFrom(q.f); setTo(q.t); }}
                  className={`text-xs font-semibold rounded-full px-3 py-1.5 transition-colors ${
                    q.hot
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                      : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-gray-600'
                  }`}>
                  {q.label}
                </button>
              ))}
            </div>

            {/* Refresh + Updated */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>{updated && `Updated: ${updated}`}</span>
              <button onClick={() => { loadFiat(); loadCrypto(); }}
                className="flex items-center gap-1.5 font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* ===== Live Prices Card (click-to-select) ===== */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-1 border-b dark:border-gray-700 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5 text-green-600" /> Live Crypto Prices (USD)
            </h3>
            <p className="text-[11px] text-gray-400 mb-2">💡 Kisi bhi coin pe click karo — wo "From" mein set ho jayega</p>
            {cryptoErr ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">Rates load nahi hui (rate limit). Thodi dair baad try karein.</p>
                <button onClick={loadCrypto} className="text-xs font-bold text-amber-600 border border-amber-200 rounded-full px-4 py-2">Retry</button>
              </div>
            ) : Object.keys(crypto).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading prices…</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {CRYPTOS.map(c => crypto[c.id] ? (
                    <tr key={c.id}
                      onClick={() => pickFrom(c.id)}
                      className={`border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer transition-colors ${
                        from === c.id ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}>
                      <td className="py-2.5">
                        <span className="font-bold text-gray-900 dark:text-white">{c.sym}</span>
                        <span className="text-xs text-gray-400 ml-2">{c.name}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-gray-700 dark:text-gray-200">
                        ${fmtNum(crypto[c.id].usd)}
                      </td>
                      <td className={`py-2.5 text-right font-mono font-medium ${crypto[c.id].chg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto[c.id].chg >= 0 ? '▲' : '▼'} {Math.abs(crypto[c.id].chg).toFixed(2)}%
                      </td>
                    </tr>
                  ) : null)}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ===== 🆕 Crypto ↔ Crypto Cross Rates Matrix ===== */}
        {Object.keys(crypto).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Coins className="w-5 h-5 text-amber-500" /> Crypto Cross Rates — Sab Aik Dusre Mein
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">Row coin 1 = cell value Column coin. Kisi cell pe click karo — converter mein set ho jayega.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-4 py-2.5 text-left text-gray-500 dark:text-gray-400 font-semibold">1 Coin →</th>
                    {CROSS_LIST.map(id => (
                      <th key={id} className="px-3 py-2.5 text-center font-bold text-gray-700 dark:text-gray-200">{SYM_OF[id]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CROSS_LIST.map(rowId => {
                    const rowPrice = crypto[rowId]?.usd;
                    return (
                      <tr key={rowId} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">{SYM_OF[rowId]}</td>
                        {CROSS_LIST.map(colId => {
                          const colPrice = crypto[colId]?.usd;
                          if (rowId === colId) return <td key={colId} className="px-3 py-2.5 text-center text-gray-300 dark:text-gray-600">—</td>;
                          if (!rowPrice || !colPrice) return <td key={colId} className="px-3 py-2.5 text-center text-gray-300">…</td>;
                          const val = rowPrice / colPrice;
                          return (
                            <td key={colId}
                              onClick={() => { setFrom(rowId); setTo(colId); }}
                              className="px-3 py-2.5 text-center font-mono text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors">
                              {fmtNum(val)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== Chart (selected crypto) ===== */}
        {chartSymbol && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{labelOf(from)} Chart — Last 1 Month</h3>
            <TVChart symbol={chartSymbol} />
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          ⚠️ Live rates (CoinGecko + ExchangeRate-API) — approximate hain. Trading se pehle exchange pe confirm karein.
        </p>
      </div>
    </div>
  );
}