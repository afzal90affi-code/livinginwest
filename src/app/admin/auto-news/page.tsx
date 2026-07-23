"use client";
import { useState } from 'react';

export default function AutoNewsAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("خبریں اور تصاویر بن رہی ہیں... براہ کرم 1 منٹ انتظار کریں۔");
    
    try {
      // ہم یہاں CRON_SECRET مینوئل پاس کر رہے ہیں ٹیسٹنگ کے لیے
      const secret = prompt("Enter CRON SECRET to run:");
      if (!secret) {
        setLoading(false);
        setMessage("Cancelled.");
        return;
      }

      const res = await fetch('/api/auto-news', {
        headers: {
          'Authorization': `Bearer ${secret}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ کامیابی! خبریں آپ کے Sanity ڈیشبورڈ میں ڈرافٹ کے طور پر آ گئی ہیں۔");
      } else {
        setMessage("❌ ایرر: " + data.error);
      }
    } catch (error) {
      setMessage("❌ کچھ غلط ہو گیا۔");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full text-center border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Auto News Generator</h1>
        <p className="text-sm text-gray-500 mb-6">یہ سسٹم USA Gov سے خبریں لے کر AI سے ری رائٹ اور تصویر بنا کر Sanity میں ڈرافٹ کرے گا۔</p>
        
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-[#6D28D9] text-white py-3 rounded-xl font-semibold hover:bg-[#5B21B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "🚀 Generate News Now"}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}