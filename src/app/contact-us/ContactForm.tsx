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
    
    // Form se values nikalna
    const name = (form.elements.namedItem('Name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('Email') as HTMLInputElement).value;
    const subject = (form.elements.namedItem('Subject') as HTMLInputElement).value;
    const message = (form.elements.namedItem('Message') as HTMLTextAreaElement).value;

    // Email ka body format banana
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`;
    
    // Mailto link banana with selected department
    const mailtoLink = `mailto:${selectedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Email client open karna
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-white border border-gray-200 p-8 md:p-10 rounded-sm shadow-sm">
      <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Select Department</label>
          <select 
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors cursor-pointer"
          >
            {departments.map((dep) => (
              <option key={dep.email} value={dep.email}>
                {dep.name} ({dep.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Your Name</label>
            <input type="text" name="Name" required className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Your Email</label>
            <input type="email" name="Email" required className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors" placeholder="e.g. john@gmail.com" />
          </div>
        </div>
        
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Subject</label>
          <input type="text" name="Subject" required className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors" placeholder="How can we help?" />
        </div>
        
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold block mb-2">Your Message</label>
          <textarea rows={4} name="Message" required className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors resize-none" placeholder="Type your query here..."></textarea>
        </div>
        
        <button type="submit" className="w-full bg-gray-900 text-white py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#6D28D9] transition-colors shadow-sm">
          Send Message
        </button>
      </form>

      <p className="text-[10px] text-gray-400 mt-4 text-center">Your message will be sent directly to the selected department.</p>
    </div>
  );
}