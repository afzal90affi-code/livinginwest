"use client";
import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Yahan aap EmailJS ya Firebase logic add kar sakte hain email bhejne ke liye
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200">
        <span className="text-4xl block mb-4">✅</span>
        <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm">Thank you for reaching out. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Your Name</label>
        <input type="text" required className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors text-gray-900" placeholder="John Doe" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Email Address</label>
        <input type="email" required className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors text-gray-900" placeholder="john@example.com" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Message</label>
        <textarea rows={5} required className="w-full px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none text-gray-900" placeholder="Write your message here..."></textarea>
      </div>
      <button type="submit" className="w-full bg-gray-900 text-white py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 transition-colors">
        Send Message
      </button>
    </form>
  );
}