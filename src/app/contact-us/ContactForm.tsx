"use client";
import { useState } from 'react';

const departments = [
  { name: 'General Inquiries', email: 'contact@livinginwest.com' },
  { name: 'Advertising', email: 'ads@livinginwest.com' },
  { name: 'Guest Posts', email: 'guest@livinginwest.com' },
  { name: 'Technical Support', email: 'support@livinginwest.com' },
];

export default function ContactForm() {
  const [selectedEmail, setSelectedEmail] = useState(departments[0].email);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const name = (form.elements.namedItem('Name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('Email') as HTMLInputElement).value;
    const subject = (form.elements.namedItem('Subject') as HTMLInputElement).value;
    const message = (form.elements.namedItem('Message') as HTMLTextAreaElement).value;

    const body = `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`;
    
    const mailtoLink = `mailto:${selectedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 md:p-10 rounded-sm shadow-sm">
      <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Send Us a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold block mb-2">Select Department</label>
          <select 
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAFAFA] dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors cursor-pointer"
          >
            {departments.map((dep) => (
              <option key={dep.email} value={dep.email} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                {dep.name} ({dep.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold block mb-2">Your Name</label>
            <input type="text" name="Name" required className="w-full px-4 py-3 bg-[#FAFAFA] dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold block mb-2">Your Email</label>
            <input type="email" name="Email" required className="w-full px-4 py-3 bg-[#FAFAFA] dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="e.g. john@gmail.com" />
          </div>
        </div>
        
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold block mb-2">Subject</label>
          <input type="text" name="Subject" required className="w-full px-4 py-3 bg-[#FAFAFA] dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="How can we help?" />
        </div>
        
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold block mb-2">Your Message</label>
          <textarea rows={4} name="Message" required className="w-full px-4 py-3 bg-[#FAFAFA] dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-100 transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="Type your query here..."></textarea>
        </div>
        
        <button type="submit" className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#6D28D9] dark:hover:bg-purple-400 dark:hover:text-gray-900 transition-colors shadow-sm">
          Send Message
        </button>
      </form>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 text-center">Your message will be sent directly to the selected department.</p>
    </div>
  );
}