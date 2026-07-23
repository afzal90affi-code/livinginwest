"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Edit button ke liye
import { client } from '@/lib/sanityClient';
import { publishDraft, deleteBlog } from './../actions'; // deleteBlog import kiya

interface DraftBlog {
  _id: string;
  title: string;
  date?: string;
  category?: string;
}

export default function AdminDrafts() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftBlog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    const query = `*[_type == "blog" && isPublished == false] | order(date desc) {
      _id, title, date, category
    }`;
    const result = await client.fetch(query);
    setDrafts(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();

    // 🔔 براؤزر نوٹیفکیشن کی اجازت لیں
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    // ⏱️ ہر 5 منٹ بعد چیک کریں کہ کوئی نئی ڈرافٹ تو نہیں آئی
    const interval = setInterval(async () => {
      const query = `*[_type == "blog" && isPublished == false] | order(date desc) { _id, title }`;
      const latestDrafts = await client.fetch(query);
      
      if (latestDrafts.length > drafts.length) {
        if (Notification.permission === "granted") {
          new Notification("🚨 News Alert: New Drafts Ready!", {
            body: `${latestDrafts.length - drafts.length} new AI news draft(s) are ready to publish.`,
            icon: "/logo.jpg"
          });
        }
        fetchDrafts();
      }
    }, 300000); // 5 منٹ

    return () => clearInterval(interval);
  }, [drafts.length]);

  const handlePublish = async (id: string) => {
    const r = await publishDraft(id);
    if (r.success) {
      alert("✅ News Published Successfully!");
      setDrafts(prev => prev.filter(b => b._id !== id));
    } else {
      alert("❌ Error publishing news.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft permanently?")) {
      const r = await deleteBlog(id);
      if (r.success) {
        alert("🗑️ Draft deleted successfully!");
        setDrafts(prev => prev.filter(b => b._id !== id));
      } else {
        alert("❌ Error deleting draft.");
      }
    }
  };

  const handleEdit = (id: string) => {
    // یہ آپ کو مین ایڈمن ڈیشبورڈ پر لے جائے گا جہاں بلاگ ایڈٹ ہو سکتا ہے
    router.push(`/admin?edit=${id}`);
  };

  if (loading) return <div className="p-10 text-center">Loading drafts...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Drafted News</h1>
          <span className="text-xs text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
            🔔 Live Auto-Check ON
          </span>
        </div>
        
        {drafts.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-dashed">
            No drafts available. Waiting for Auto News to fetch...
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((blog) => (
              <div key={blog._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* News Info */}
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{blog.category || 'News'}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{blog.title}</h3>
                  {blog.date && <p className="text-xs text-gray-400 mt-1">{blog.date}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(blog._id)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(blog._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                  <button 
                    onClick={() => handlePublish(blog._id)}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                  >
                    ✅ Publish
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}