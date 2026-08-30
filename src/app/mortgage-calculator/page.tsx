"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Share2 } from 'lucide-react';

const CURRENCIES = ["C$", "$", "£", "€", "₹", "₨"];

function Field({ label, value, min, max, step, onChange, prefix, suffix, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; prefix?: string; suffix?: string; display?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-bold text-blue-600">{prefix}{display ?? value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-600 cursor-pointer" />
      <div className="flex gap-2 mt-2">
        {prefix && <span className="flex items-center justify-center bg-blue-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 font-bold text-sm text-gray-700 dark:text-gray-300">{prefix}</span>}
        <input type="number" value={value} min={min} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500" />
        {suffix && <span className="flex items-center justify-center bg-blue-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-3 font-bold text-sm text-gray-700 dark:text-gray-300">{suffix}</span>}
      </div>
    </div>
  );
}

export default function MortgageCalculatorPage() {
  const [cur, setCur] = useState(CURRENCIES[0]);
  const [price, setPrice] = useState(500000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(25);

  const loan = Math.max(0, price * (1 - down / 100));
  const n = years * 12;
  const r = rate / 100 / 12;
  const monthly = n > 0 ? (r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
  const total = monthly * n;
  const interest = total - loan;
  const pPct = total > 0 ? (loan / total) * 100 : 0;

  const fmt = (v: number) => cur + Math.round(v).toLocaleString();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Mortgage Calculator - Living In West', url: window.location.href }).catch(() => {});
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
            <Home className="w-9 h-9 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Mortgage Calculator</h1>
          </div>
          <p className="text-gray-400 mt-2">Apni monthly payment, total interest aur loan cost calculate karein.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Currency</label>
              <select value={cur} onChange={(e) => setCur(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Home Price" value={price} min={50000} max={5000000} step={5000}
              onChange={setPrice} prefix={cur} display={price.toLocaleString()} />
            <Field label="Down Payment" value={down} min={0} max={75} step={1}
              onChange={setDown} suffix="%" />
            <Field label="Interest Rate (Annual)" value={rate} min={0.5} max={15} step={0.05}
              onChange={setRate} suffix="%" display={rate.toFixed(2)} />
            <Field label="Loan Term" value={years} min={1} max={40} step={1}
              onChange={setYears} suffix="yrs" />
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-6">
            <div className="text-center w-full">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Monthly Payment</p>
              <p className="text-4xl font-extrabold text-blue-600 mt-1">{fmt(monthly)}</p>
            </div>
            <div className="relative w-44 h-44 rounded-full flex-shrink-0"
              style={{ background: `conic-gradient(#2563eb 0% ${pPct}%, #f59e0b ${pPct}% 100%)` }}>
              <div className="absolute inset-9 rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{pPct.toFixed(0)}%</span>
                <span className="text-[10px] uppercase text-gray-500">Principal</span>
              </div>
            </div>
            <div className="flex gap-5 text-xs text-gray-600 dark:text-gray-400">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5"></span>Principal <b>{pPct.toFixed(1)}%</b></span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>Interest <b>{(100 - pPct).toFixed(1)}%</b></span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Loan</p>
                <p className="text-sm font-bold mt-1">{fmt(loan)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Interest</p>
                <p className="text-sm font-bold mt-1">{fmt(interest)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Total</p>
                <p className="text-sm font-bold mt-1">{fmt(total)}</p>
              </div>
            </div>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-full transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
