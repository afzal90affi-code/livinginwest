"use client";
import { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';

export default function SubscribePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // چیک کریں کہ آیا صارف نے پہلے ہی سبسکرائب تو نہیں کیا یا پاپ اپ بند تو نہیں کیا
    const hasSeenPopup = localStorage.getItem('hasSeenSubscribePopup');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // 3 سیکنڈ بعد پاپ اپ کھلے گا

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // 7 دن کے لیے localStorage میں سیو کر دیا جائے گا تاکہ بار بار نہ کھلے
    localStorage.setItem('hasSeenSubscribePopup', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Subscribed successfully! Welcome aboard.");
        setTimeout(() => handleClose(), 2000); // 2 سیکنڈ بعد خود بند ہو جائے گا
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Something went wrong.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        
        {/* بند کرنے والا بٹن */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ڈیزائن والا حصہ */}
        <div className="bg-gradient-to-br from-[#6D28D9] to-[#1e3a8a] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscribe to Newsletter</h2>
          <p className="text-white/80 text-sm">Get the latest news and updates directly in your inbox.</p>
        </div>

        {/* فارم والا حصہ */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email address" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" 
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-6 py-3 bg-[#6D28D9] rounded-lg text-sm font-bold text-white hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
            >
              {loading ? "Subscribing..." : "Subscribe Now"}
            </button>
          </form>
          
          {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
          
          <button 
            onClick={handleClose}
            className="mt-4 text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-widest w-full text-center"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}