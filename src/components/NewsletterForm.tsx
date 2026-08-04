"use client";
import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        setMessage("✅ Subscribed successfully!");
        setEmail("");
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 text-white p-8 rounded-2xl text-center my-12">
      <Mail className="w-10 h-10 mx-auto mb-4 text-[#6D28D9]" />
      <h3 className="text-2xl font-bold mb-2">Subscribe to our Newsletter</h3>
      <p className="text-gray-400 mb-6 text-sm">Get the latest news and updates directly in your inbox.</p>
      
      <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter your email" 
          required
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm outline-none focus:border-[#6D28D9]" 
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-3 bg-[#6D28D9] rounded-lg text-sm font-bold hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
    </div>
  );
}