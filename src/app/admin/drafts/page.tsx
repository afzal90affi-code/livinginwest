"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/sanityClient';
import { publishDraft, deleteBlog, getBlogImageOptions, applyBlogImage } from './../actions'; // آپ کے مطابق پاتھ ٹھیک کرلیں اگر ../actions ہے تو
import Image from 'next/image';
import { X, ExternalLink, Search } from 'lucide-react';

interface DraftBlog {
  _id: string;
  title: string;
  date?: string;
  category?: string;
  imgUrl?: string;
  newsTime?: string;
  sourceUrl?: string;
  sourceName?: string;
}

const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours} hour ${remainingMinutes} min ago` : `${hours} hour ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function AdminDrafts() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // 🌟 Image Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerBlogId, setPickerBlogId] = useState("");
  const [pickerTitle, setPickerTitle] = useState("");
  const [imageOptions, setImageOptions] = useState<{ source: string, url: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [applyingImage, setApplyingImage] = useState(false);
  
  // ✅ Manual Search State
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDrafts = async () => {
    const query = `*[_type == "blog" && isPublished == false] | order(date desc) {
      _id, title, date, category, newsTime, sourceUrl, sourceName,
      "imgUrl": img1.asset->url
    }`;
    const result = await client.fetch(query);
    setDrafts(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    const tickInterval = setInterval(() => setCurrentTime(Date.now()), 30000);
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
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, [drafts.length]);

  const handlePublish = async (id: string) => {
    const r = await publishDraft(id);
    if (r.success) {
      alert("✅ News Published Successfully!");
      setDrafts(prev => prev.filter(b => b._id !== id));
    } else {
      alert("❌ Error publishing news: " + r.error);
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
    router.push(`/admin?edit=${id}`);
  };

  // 🌟 Image Picker Functions
  const openImagePicker = async (id: string, title: string) => {
    setIsPickerOpen(true);
    setPickerBlogId(id);
    setPickerTitle(title);
    setImageOptions([]);
    setSearchQuery("");
    setLoadingImages(true);

    const r = await getBlogImageOptions(id, title);
    if (r?.success && r.options) {
      setImageOptions(r.options);
    } else {
      alert("Failed to fetch images: " + (r?.error || "Unknown error"));
    }
    setLoadingImages(false);
  };

  // ✅ Manual Search Handler
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingImages(true);
    setImageOptions([]);
    
    const r = await getBlogImageOptions(pickerBlogId, searchQuery);
    if (r?.success && r.options) {
      setImageOptions(r.options);
    } else {
      alert("Failed to fetch images: " + (r?.error || "Unknown error"));
    }
    setLoadingImages(false);
  };

  const handleSelectImage = async (url: string) => {
    setApplyingImage(true);
    const r = await applyBlogImage(pickerBlogId, url);
    if (r.success) {
      alert("✅ Image updated successfully!");
      setDrafts(prev => prev.map(b => b._id === pickerBlogId ? { ...b, imgUrl: r.url } : b));
      setIsPickerOpen(false);
    } else {
      alert("❌ Error applying image: " + r.error);
    }
    setApplyingImage(false);
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
              <div key={blog._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  {blog.imgUrl ? (
                    <div className="relative w-full md:w-32 h-32 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={blog.imgUrl} alt={blog.title} fill className="object-cover" sizes="128px" />
                    </div>
                  ) : (
                    <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  <button 
                    onClick={() => openImagePicker(blog._id, blog.title)}
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    🔄 Replace
                  </button>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{blog.category || 'News'}</span>
                    <span className="text-[9px] uppercase tracking-wider text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">🟢 Pending</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{blog.title}</h3>
                  
                  <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <span>🕒</span> {getTimeAgo(blog.date)}
                    </p>
                    {blog.newsTime && <span>⏰ Release Time: {blog.newsTime}</span>}
                    {blog.sourceUrl && (
                      <a href={blog.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline w-fit">
                        🔗 Source: {blog.sourceName || 'View Original'} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(blog._id)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">✏️ Edit</button>
                  <button onClick={() => handleDelete(blog._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">🗑️ Delete</button>
                  <button onClick={() => handlePublish(blog._id)} className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">✅ Publish</button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Image Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setIsPickerOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-1">Select Image for: <span className="text-blue-600">{pickerTitle.substring(0, 30)}...</span></h2>
            <p className="text-xs text-gray-500 mb-4">If images are not relevant, search manually below:</p>
            
            {/* ✅ Manual Search Box */}
            <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-lg border">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="e.g. Technology, Sports, Politics..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleManualSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1 hover:bg-blue-700"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            {loadingImages && <p className="text-gray-500 text-center py-10 animate-pulse">Fetching best images from Pexels, Unsplash & AI...</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageOptions.map((opt, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={() => !applyingImage && handleSelectImage(opt.url)}>
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                    <img 
                      src={opt.url} 
                      alt={opt.source} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform absolute inset-0" 
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs p-4 text-center absolute inset-0 bg-gray-100">
                      Image blocked or API limit reached.
                    </div>
                  </div>
                  <div className="p-3 bg-white text-center">
                    <span className="text-xs font-bold text-gray-700">{opt.source}</span>
                    {opt.source.includes('AI') && <span className="block text-[10px] text-gray-400">(Loading may take 15s)</span>}
                  </div>
                </div>
              ))}
            </div>

            {applyingImage && <p className="text-green-600 text-center mt-4 font-semibold animate-pulse">Applying image to Sanity...</p>}
          </div>
        </div>
      )}

    </div>
  );
}