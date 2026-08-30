"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReceiptText, ArrowLeft, Share2, MapPin } from 'lucide-react';

type Slab = [number, number]; // [upto, rate%]
type CountryTax = { name: string; flag: string; cur: string; ex: number; std: number; note: string; slabs: Slab[] };

const TAX_DB: Record<string, CountryTax> = {
  CA: { name: "Canada", flag: "🇨🇦", cur: "C$", ex: 85000, std: 15705, note: "Federal 2024 only — provincial tax alag se lagta hai.", slabs: [[55867, 15], [111733, 20.5], [173205, 26], [246752, 29], [Infinity, 33]] },
  US: { name: "USA", flag: "🇺🇸", cur: "$", ex: 85000, std: 15000, note: "Federal only (2025, single filer) — state tax alag se.", slabs: [[11925, 10], [48475, 12], [103350, 22], [197300, 24], [250525, 32], [626350, 35], [Infinity, 37]] },
  GB: { name: "United Kingdom", flag: "🇬🇧", cur: "£", ex: 45000, std: 12570, note: "England/Wales/NI 2024-25 — Scotland different hai.", slabs: [[50270, 20], [125140, 40], [Infinity, 45]] },
  AU: { name: "Australia", flag: "🇦🇺", cur: "A$", ex: 95000, std: 0, note: "2024-25 resident rates — 2% Medicare levy alag se.", slabs: [[18200, 0], [45000, 16], [135000, 30], [190000, 37], [Infinity, 45]] },
  NZ: { name: "New Zealand", flag: "🇳🇿", cur: "NZ$", ex: 80000, std: 0, note: "2024-25 resident rates.", slabs: [[15600, 10.5], [53500, 17.5], [78100, 30], [180000, 33], [Infinity, 39]] },
  DE: { name: "Germany", flag: "🇩🇪", cur: "€", ex: 60000, std: 0, note: "Approx 2024 progressive rates.", slabs: [[11604, 0], [17005, 14], [66760, 24], [277826, 42], [Infinity, 45]] },
  IE: { name: "Ireland", flag: "🇮🇪", cur: "€", ex: 60000, std: 0, note: "2024 rates.", slabs: [[42000, 20], [Infinity, 40]] },
  AE: { name: "UAE", flag: "🇦🇪", cur: "AED ", ex: 180000, std: 0, note: "🇦🇪 Employment income pe koi income tax NAHI hai!", slabs: [[Infinity, 0]] },
  SA: { name: "Saudi Arabia", flag: "🇸🇦", cur: "SAR ", ex: 180000, std: 0, note: "Employment income pe koi income tax nahi.", slabs: [[Infinity, 0]] },
  PK: { name: "Pakistan", flag: "🇵🇰", cur: "Rs ", ex: 2400000, std: 0, note: "Salaried slabs — Tax Year 2025.", slabs: [[600000, 0], [1200000, 5], [2200000, 15], [3200000, 25], [4100000, 30], [Infinity, 35]] },
  IN: { name: "India", flag: "🇮🇳", cur: "₹", ex: 1200000, std: 75000, note: "New Regime FY 2024-25 (salaried).", slabs: [[300000, 0], [700000, 5], [1000000, 10], [1200000, 15], [1500000, 20], [Infinity, 30]] },
  SG: { name: "Singapore", flag: "🇸🇬", cur: "S$", ex: 70000, std: 0, note: "Resident rates 2024.", slabs: [[20000, 0], [30000, 2], [40000, 3.5], [80000, 7], [120000, 11.5], [160000, 15], [200000, 18], [240000, 19], [280000, 19.5], [320000, 20], [500000, 22], [Infinity, 24]] },
};

function slabTax(inc: number, slabs: Slab[]): number {
  let t = 0, prev = 0;
  for (const [upto, rate] of slabs) {
    if (inc > prev) { t += (Math.min(inc, upto === Infinity ? inc : upto) - prev) * rate / 100; prev = upto; } else break;
  }
  return t;
}
function slabRows(inc: number, slabs: Slab[]) {
  const rows: { from: number; to: number; rate: number; tax: number }[] = [];
  let prev = 0;
  for (const [upto, rate] of slabs) {
    if (inc > prev) {
      const amt = Math.min(inc, upto === Infinity ? inc : upto) - prev;
      rows.push({ from: prev, to: upto, rate, tax: amt * rate / 100 });
      prev = upto;
    } else break;
  }
  return rows;
}

export default function IncomeTaxCalculatorPage() {
  const [code, setCode] = useState("CA");
  const [income, setIncome] = useState(85000);
  const [detectMsg, setDetectMsg] = useState("⏳ Detecting your country…");

  // Country auto-detect (IP se)
  useEffect(() => {
    let done = false;
    const finish = (cc: string | null) => {
      if (done || !cc) return;
      done = true;
      if (TAX_DB[cc]) {
        setCode(cc); setIncome(TAX_DB[cc].ex);
        setDetectMsg(`📍 Auto-detected: ${TAX_DB[cc].flag} ${TAX_DB[cc].name} — rates loaded ✅`);
      } else {
        setDetectMsg("⚠️ Country detect hui lekin iske rates available nahi — manually select karein");
      }
    };
    const timer = setTimeout(() => { if (!done) { done = true; setDetectMsg("⚠️ Detect fail — manually select karein"); } }, 7000);
    fetch("https://ipapi.co/json/").then(r => r.json()).then(d => { clearTimeout(timer); finish(d.country_code || d.country); })
      .catch(() => fetch("https://ipwho.is/").then(r => r.json()).then(d => { clearTimeout(timer); finish(d.country_code); })
        .catch(() => { clearTimeout(timer); if (!done) { done = true; setDetectMsg("⚠️ Detect fail — manually select karein"); } }));
  }, []);

  const c = TAX_DB[code];
  const taxable = Math.max(0, income - c.std);
  const tax = slabTax(taxable, c.slabs);
  const keep = income - tax;
  const govPct = income > 0 ? (tax / income) * 100 : 0;
  const fmt = (v: number) => c.cur + Math.round(v).toLocaleString();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Income Tax Calculator - Living In West', url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="bg-gray-900 dark:bg-black text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <Link href="/trading-finance" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Trading & Finance
          </Link>
          <div className="flex items-center gap-3">
            <ReceiptText className="w-9 h-9 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Income Tax Calculator</h1>
          </div>
          <p className="text-gray-400 mt-2">Country-wise tax rates — kitni kamai, kitni government gayi, kitni saving hui.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2 mb-5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {detectMsg}
            </div>
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Country</label>
              <select value={code}
                onChange={(e) => { setCode(e.target.value); setIncome(TAX_DB[e.target.value].ex); }}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500">
                {Object.entries(TAX_DB).map(([k, v]) => <option key={k} value={k}>{v.flag} {v.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900 border-l-2 border-green-500 px-3 py-2 rounded">{c.note}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Annual Income (Gross)</label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center bg-green-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 font-bold text-sm min-w-[52px]">{c.cur}</span>
                <input type="number" value={income} min={0}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500" />
              </div>
              {c.std > 0 && <p className="text-xs text-gray-500 mt-2">💡 Standard deduction ({fmt(c.std)}) automatic included hai.</p>}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-5">
            <div className="text-center w-full">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">You Keep (Yearly)</p>
              <p className="text-3xl md:text-4xl font-extrabold text-green-600 mt-1">{fmt(keep)}</p>
              <p className="text-sm font-semibold text-red-500 mt-1">Government takes: {fmt(tax)} ({govPct.toFixed(1)}%)</p>
            </div>
            <div className="relative w-40 h-40 rounded-full flex-shrink-0"
              style={{ background: `conic-gradient(#ef4444 0% ${govPct}%, #10b981 ${govPct}% 100%)` }}>
              <div className="absolute inset-8 rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{(100 - govPct).toFixed(1)}%</span>
                <span className="text-[10px] uppercase text-gray-500">You keep</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Taxable</p>
                <p className="text-sm font-bold mt-1">{fmt(taxable)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Monthly In-Hand</p>
                <p className="text-sm font-bold mt-1">{fmt(keep / 12)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Eff. Rate</p>
                <p className="text-sm font-bold mt-1">{govPct.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slab Breakdown Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold">Tax Breakdown</h3>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-green-600 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-full transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-6 py-3 text-gray-600 dark:text-gray-300">Gross Annual Income</td>
                <td className="px-6 py-3 text-right font-semibold">{fmt(income)}</td>
              </tr>
              {c.std > 0 && (
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">Standard Deduction</td>
                  <td className="px-6 py-3 text-right font-semibold">− {fmt(c.std)}</td>
                </tr>
              )}
              {slabRows(taxable, c.slabs).map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {fmt(row.from)} – {row.to === Infinity ? "above" : fmt(row.to)} <span className="text-gray-400">@ {row.rate}%</span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold">{fmt(row.tax)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white">
                <td className="px-6 py-3 font-bold">Total Tax → Government</td>
                <td className="px-6 py-3 text-right font-extrabold">{fmt(tax)}</td>
              </tr>
              <tr className="bg-green-600 text-white">
                <td className="px-6 py-3 font-bold">You Take Home (Yearly)</td>
                <td className="px-6 py-3 text-right font-extrabold">{fmt(keep)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">⚠️ Rates approximate hain (2024-25) — filing se pehle official tax authority se verify karein.</p>
      </div>
    </div>
  );
}