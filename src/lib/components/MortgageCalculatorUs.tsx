"use client";
// components/MortgageCalculatorUs.tsx
import { useEffect, useMemo, useState } from "react";

interface Props { currentRate: number; rateAsOf: string; isLive: boolean; }

const US_STATES: [string, number][] = [
  ["Alabama", 0.40], ["Alaska", 1.19], ["Arizona", 0.62], ["Arkansas", 0.62],
  ["California", 0.71], ["Colorado", 0.51], ["Connecticut", 2.00], ["Delaware", 0.57],
  ["Florida", 0.80], ["Georgia", 0.92], ["Hawaii", 0.29], ["Idaho", 0.70],
  ["Illinois", 2.08], ["Indiana", 0.85], ["Iowa", 1.49], ["Kansas", 1.39],
  ["Kentucky", 0.90], ["Louisiana", 0.55], ["Maine", 1.28], ["Maryland", 1.09],
  ["Massachusetts", 1.15], ["Michigan", 1.34], ["Minnesota", 1.10], ["Mississippi", 0.76],
  ["Missouri", 1.00], ["Montana", 0.88], ["Nebraska", 1.64], ["Nevada", 0.55],
  ["New Hampshire", 1.77], ["New Jersey", 2.23], ["New Mexico", 0.79], ["New York", 1.54],
  ["North Carolina", 0.82], ["North Dakota", 0.99], ["Ohio", 1.55], ["Oklahoma", 0.87],
  ["Oregon", 0.90], ["Pennsylvania", 1.50], ["Rhode Island", 1.54], ["South Carolina", 0.53],
  ["South Dakota", 1.27], ["Tennessee", 0.71], ["Texas", 1.67], ["Utah", 0.57],
  ["Vermont", 1.61], ["Virginia", 0.81], ["Washington", 0.90], ["West Virginia", 0.57],
  ["Wisconsin", 1.43], ["Wyoming", 0.61], ["Washington DC", 0.59],
]; // ⚠️ Approximate effective rates — edit yearly if needed, users can override

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const pi = (loan: number, rate: number, years: number) => {
  const r = rate / 100 / 12, n = years * 12;
  return r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n));
};

function amort(loan: number, rate: number, years: number, extra: number) {
  const r = rate / 100 / 12, n = years * 12, base = pi(loan, rate, years);
  let bal = loan, m = 0, interestTotal = 0, yInt = 0, yPrin = 0;
  const yearly: { y: number; bal: number; int: number; prin: number }[] = [];
  while (bal > 0.01 && m < n + 600) {
    const int = bal * r;
    let prin = base + extra - int;
    if (prin > bal) prin = bal;
    bal -= prin; yInt += int; yPrin += prin; interestTotal += int; m++;
    if (m % 12 === 0 || bal <= 0.01) {
      yearly.push({ y: Math.ceil(m / 12), bal: Math.max(bal, 0), int: yInt, prin: yPrin });
      yInt = 0; yPrin = 0;
    }
  }
  return { base, months: m, interestTotal, yearly };
}

export default function MortgageCalculatorUs({ currentRate, rateAsOf, isLive }: Props) {
  const [mode, setMode] = useState<"payment" | "afford">("payment");
  const [price, setPrice] = useState(400000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(currentRate);
  const [term, setTerm] = useState(30);
  const [taxPct, setTaxPct] = useState(1.1);
  const [insYear, setInsYear] = useState(1800);
  const [pmiRate, setPmiRate] = useState(0.6);
  const [hoa, setHoa] = useState(0);
  const [extra, setExtra] = useState(0);
  const [income, setIncome] = useState(80000);
  const [debts, setDebts] = useState(500);
  const [dti, setDti] = useState(36);
  const [stateName, setStateName] = useState("");
  const [showSched, setShowSched] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live rate ko ek baar sync karo (user badal sakta hai)
  useEffect(() => setRate(currentRate), [currentRate]);

  // Share link ke liye URL params
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const map: Record<string, (v: number) => void> = {
      price: setPrice, down: setDownPct, rate: setRate, tax: setTaxPct,
      income: setIncome, extra: setExtra,
    };
    let applied = false;
    Object.entries(map).forEach(([k, setter]) => {
      const v = q.get(k);
      if (v && !isNaN(+v)) { setter(+v); applied = true; }
    });
    if (applied) setPrice(p => p); // values already set
  }, []);

  const copyLink = () => {
    const q = new URLSearchParams({
      price: String(price), down: String(downPct), rate: String(rate),
      tax: String(taxPct), extra: String(extra),
    });
    navigator.clipboard.writeText(`${window.location.origin}/mortgage-calculator?${q}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const pay = useMemo(() => {
    const loan = price * (1 - downPct / 100);
    const base = amort(loan, rate, term, 0);
    const wExtra = amort(loan, rate, term, extra);
    const pmiM = downPct < 20 ? loan * (pmiRate / 100) / 12 : 0;
    const taxM = price * (taxPct / 100) / 12, insM = insYear / 12;
    const payoff = new Date(); payoff.setMonth(payoff.getMonth() + wExtra.months);
    return { loan, pmiM, taxM, insM, base, wExtra, payoff,
      total: wExtra.base + pmiM + taxM + insM + hoa,
      saved: base.interestTotal - wExtra.interestTotal,
      monthsSaved: base.months - wExtra.months };
  }, [price, downPct, rate, term, taxPct, insYear, pmiRate, hoa, extra]);

  const afford = useMemo(() => {
    const maxPay = (income / 12) * (dti / 100) - debts;
    const costAt = (p: number) => {
      const loan = p * (1 - downPct / 100);
      const pmiM = downPct < 20 ? loan * (pmiRate / 100) / 12 : 0;
      return pi(loan, rate, term) + p * (taxPct / 100) / 12 + insYear / 12 + pmiM + hoa;
    };
    if (maxPay <= 0) return { maxPrice: 0, maxPay, loan: 0 };
    let lo = 0, hi = 5_000_000;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      costAt(mid) <= maxPay ? (lo = mid) : (hi = mid);
    }
    return { maxPrice: lo, maxPay, loan: lo * (1 - downPct / 100) };
  }, [income, debts, dti, downPct, rate, term, taxPct, insYear, pmiRate, hoa]);

  const Num = ({ label, value, onChange, prefix, suffix, step }: {
    label: string; value: number; onChange: (v: number) => void;
    prefix?: string; suffix?: string; step?: number;
  }) => (
    <label className="block">
      <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</span>
      <div className="flex items-center border border-gray-200 rounded-lg bg-white focus-within:border-indigo-500">
        {prefix && <span className="pl-2.5 text-gray-400 text-sm">{prefix}</span>}
        <input type="number" step={step ?? 1} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-2 text-sm outline-none rounded-lg" />
        {suffix && <span className="pr-2.5 text-gray-400 text-xs">{suffix}</span>}
      </div>
    </label>
  );

  const donutSegs = [
    { label: "Principal & Interest", v: pay.wExtra.base, c: "#4f46e5" },
    { label: "Property Tax", v: pay.taxM, c: "#f59e0b" },
    { label: "Insurance", v: pay.insM, c: "#10b981" },
    { label: "PMI", v: pay.pmiM, c: "#ef4444" },
    { label: "HOA", v: hoa, c: "#8b5cf6" },
  ].filter(s => s.v > 0);
  const totalSeg = donutSegs.reduce((s, x) => s + x.v, 0) || 1;
  const C = 2 * Math.PI * 70; let off = 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm space-y-5">

      {/* 🟢 LIVE RATE BADGE */}
      <div className={`rounded-xl p-3 text-sm font-medium flex items-center justify-between flex-wrap gap-2 ${isLive ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-amber-50 text-amber-900 border border-amber-200"}`}>
        <span>
          {isLive ? "🟢 Live rate: " : "🟡 Estimated rate: "}
          <strong>{rate}%</strong> (30-yr fixed, {rateAsOf}) — {isLive ? "auto-updated weekly" : "set your lender's rate below"}
        </span>
        <button onClick={copyLink} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          {copied ? "✅ Copied!" : "🔗 Share this calculation"}
        </button>
      </div>

      <div className="flex gap-2">
        {(["payment", "afford"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {m === "payment" ? "💰 Monthly Payment" : "🏠 How Much Can I Afford"}
          </button>
        ))}
      </div>

      {mode === "payment" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Num label="Home Price" value={price} onChange={setPrice} prefix="$" step={1000} />
            <Num label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" step={0.5} />
            <Num label="Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.1} />
            <Num label="Loan Term" value={term} onChange={setTerm} suffix="yrs" />
            <Num label="Property Tax" value={taxPct} onChange={setTaxPct} suffix="%/yr" step={0.05} />
            <Num label="Home Insurance" value={insYear} onChange={setInsYear} prefix="$" suffix="/yr" step={100} />
            <Num label="PMI Rate" value={pmiRate} onChange={setPmiRate} suffix="%/yr" step={0.1} />
            <Num label="Extra Payment" value={extra} onChange={setExtra} prefix="$" suffix="/mo" step={50} />
          </div>

          {/* 🗺️ STATE TAX PRESET */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-semibold">Quick fill — State property tax:</span>
            <select value={stateName}
              onChange={e => {
                setStateName(e.target.value);
                const s = US_STATES.find(([n]) => n === e.target.value);
                if (s) setTaxPct(s[1]);
              }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500">
              <option value="">Select state (approx. rates)</option>
              {US_STATES.map(([n, r]) => <option key={n} value={n}>{n} — {r}%</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div className="flex items-center gap-5 flex-wrap">
              <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0">
                {donutSegs.map(s => {
                  const frac = s.v / totalSeg;
                  const el = <circle key={s.label} cx="90" cy="90" r="70" fill="none" stroke={s.c}
                    strokeWidth="26" strokeDasharray={`${frac * C} ${C - frac * C}`} strokeDashoffset={-off}
                    transform="rotate(-90 90 90)" />;
                  off += frac * C; return el;
                })}
                <text x="90" y="88" textAnchor="middle" className="fill-gray-900 font-bold" fontSize="17">{money(totalSeg)}</text>
                <text x="90" y="105" textAnchor="middle" className="fill-gray-400" fontSize="9">PER MONTH</text>
              </svg>
              <ul className="space-y-1.5 text-xs">
                {donutSegs.map(s => (
                  <li key={s.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: s.c }} />
                    <span className="text-gray-600 w-32">{s.label}</span>
                    <span className="font-semibold text-gray-900">{money(s.v)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Loan Amount</p>
                <p className="text-lg font-bold text-gray-900">{money(pay.loan)}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3.5">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wide font-semibold">Total Monthly (PITI)</p>
                <p className="text-2xl font-bold text-indigo-700">{money(pay.total)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Total Interest</p>
                <p className="text-lg font-bold text-gray-900">{money(pay.wExtra.interestTotal)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Payoff Date</p>
                <p className="text-lg font-bold text-gray-900">{pay.payoff.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </div>

          {extra > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
              💡 Extra <strong>{money(extra)}/mo</strong> saves <strong>{money(pay.saved)}</strong> in interest
              and pays off <strong>{pay.monthsSaved} months</strong> (~{(pay.monthsSaved / 12).toFixed(1)} yrs) earlier.
            </div>
          )}

          <button onClick={() => setShowSched(!showSched)} className="text-xs font-semibold text-indigo-600 hover:underline">
            {showSched ? "▲ Hide" : "▼ Show"} Year-by-Year Amortization Schedule
          </button>
          {showSched && (
            <div className="overflow-x-auto border rounded-xl max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-gray-500">
                    <th className="p-2.5">Year</th><th className="p-2.5">Principal Paid</th>
                    <th className="p-2.5">Interest Paid</th><th className="p-2.5">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {pay.wExtra.yearly.map(r => (
                    <tr key={r.y} className="border-t border-gray-100">
                      <td className="p-2.5 font-semibold">{r.y}</td>
                      <td className="p-2.5">{money(r.prin)}</td>
                      <td className="p-2.5">{money(r.int)}</td>
                      <td className="p-2.5">{money(r.bal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode === "afford" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Num label="Annual Income" value={income} onChange={setIncome} prefix="$" step={1000} />
            <Num label="Monthly Debts" value={debts} onChange={setDebts} prefix="$" suffix="/mo" step={50} />
            <Num label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" step={0.5} />
            <Num label="Max DTI" value={dti} onChange={setDti} suffix="%" step={1} />
            <Num label="Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.1} />
            <Num label="Loan Term" value={term} onChange={setTerm} suffix="yrs" />
            <Num label="Property Tax" value={taxPct} onChange={setTaxPct} suffix="%/yr" step={0.05} />
            <Num label="Insurance" value={insYear} onChange={setInsYear} prefix="$" suffix="/yr" step={100} />
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">You Can Likely Afford a Home Up To</p>
            <p className="text-4xl font-bold text-indigo-700 mt-1">{money(afford.maxPrice)}</p>
            <p className="text-xs text-gray-500 mt-2">
              {dti}% DTI · {money(afford.maxPay)}/mo budget · {money(afford.loan)} loan at {rate}%
            </p>
          </div>
          <p className="text-[11px] text-gray-400">
            Most US lenders allow 36–43% DTI. This is an estimate — your lender&apos;s number may differ.
          </p>
        </>
      )}
    </div>
  );
}