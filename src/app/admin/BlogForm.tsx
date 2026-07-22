"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { saveBlog, uploadImage } from './actions';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

// ======== INTERFACES ========
export interface Blog {
  _id: string;
  title: string;
  category: string;
  subCategory?: string;
  desc?: string;
  isFeatured: boolean;
  isPublished?: boolean;
  contents?: string[];
  imgUrls?: string[];
  imgOrientations?: Record<string, string>;
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string;
  date?: string;
  views?: number;
  sortOrder?: number | null;
  writerName?: string;     
  writerSocial?: string;   
  heroVideoUrl?: string;   // ✅ Hero Video URL Added
}

export interface Category {
  _id: string;
  name: string;
  slug: string | { current: string };
  emoji?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder?: number | null;
}

export interface Subcategory {
  _id: string;
  parentId: string;
  name: string;
  slug: string | { current: string };
  emoji?: string;
  desc?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder?: number | null;
}

interface ImageState { url: string; assetId: string; }
type SanityImageRef = { _type: 'image'; asset: { _ref: string; _type: 'reference' } };
type ActionData = Record<string, string | boolean | number | undefined | SanityImageRef | Record<string, string> | null>;

export const getSlug = (slug: string | { current: string } | undefined): string => { if (!slug) return ""; if (typeof slug === 'string') return slug; return slug.current || ""; };

const sanitizeQuill = (html: string): string => {
  if (!html) return "";
  let cleanHtml = html.replace(/(<img[^>]*?)\s(width|height)="[^"]*"/gi, '$1');
  cleanHtml = cleanHtml.replace(/<img(?![^>]*\sstyle=")/gi, '<img style="max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1);"');
  cleanHtml = cleanHtml.replace(/(<img[^>]*?style=")([^"]*)"/gi, '$1max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1); $2"');
  return cleanHtml;
};

const getWordCount = (html: string): number => { if (!html) return 0; const t = html.replace(/<[^>]*>/g, '').trim(); return t ? t.split(/\s+/).length : 0; };

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const quillFormats = ['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'script', 'list', 'bullet', 'indent', 'align', 'blockquote', 'code-block', 'link', 'image', 'video', 'clean'];

const contentParts = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `P${i + 1}`,
  optional: i >= 3
}));

// ======== BLOG FORM COMPONENT ========
export default function BlogForm({ showForm, onClose, initialData, catList, subCatList, onSaved }: { 
  showForm: boolean; 
  onClose: () => void; 
  initialData: Blog | null; 
  catList: Category[]; 
  subCatList: Subcategory[]; 
  onSaved: () => void; 
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePart, setActivePart] = useState("1");
  
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogSubCategory, setBlogSubCategory] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogHeroVideo, setBlogHeroVideo] = useState(""); // ✅ Hero Video State
  
  const [blogWriterName, setBlogWriterName] = useState("");
  const [blogWriterSocial, setBlogWriterSocial] = useState("");

  const [blogContents, setBlogContents] = useState<string[]>(Array(10).fill(""));
  const [blogImages, setBlogImages] = useState<ImageState[]>(Array(10).fill({ url: "", assetId: "" }));
  const [imgOrientations, setImgOrientations] = useState<Record<string, string>>({});

  const [blogFeatured, setBlogFeatured] = useState(false);
  const [blogPublished, setBlogPublished] = useState(false);
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDesc, setBlogMetaDesc] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");

  const [embedType, setEmbedType] = useState("youtube");
  const [embedInput, setEmbedInput] = useState("");

  const availableSubCats = subCatList.filter(s => s.parentId === getSlug(catList.find(c => getSlug(c.slug) === blogCategory)?.slug));

  useEffect(() => {
    if (showForm) {
      if (initialData) {
        setEditingId(initialData._id);
        setBlogTitle(initialData.title);
        setBlogCategory(initialData.category || (catList.length > 0 ? getSlug(catList[0].slug) : ""));
        setBlogSubCategory(initialData.subCategory || "");
        setBlogDesc(initialData.desc || "");
        setBlogHeroVideo(initialData.heroVideoUrl || ""); // ✅ Populate Hero Video
        
        setBlogWriterName(initialData.writerName || "");
        setBlogWriterSocial(initialData.writerSocial || "");
        
        const contents = Array(10).fill("");
        const images = Array(10).fill({ url: "", assetId: "" });
        
        for(let i=0; i<10; i++) {
          contents[i] = initialData.contents?.[i] || "";
          images[i] = { url: initialData.imgUrls?.[i] || "", assetId: "" };
        }
        
        setBlogContents(contents);
        setBlogImages(images);
        setBlogFeatured(initialData.isFeatured); 
        setBlogPublished(initialData.isPublished || false);
        setImgOrientations(initialData.imgOrientations || {});
        setBlogMetaTitle(initialData.metaTitle || ""); 
        setBlogMetaDesc(initialData.metaDesc || ""); 
        setBlogKeywords(initialData.keywords || "");
      } else {
        setEditingId(null); 
        setBlogTitle(""); 
        setBlogCategory(catList.length > 0 ? getSlug(catList[0].slug) : ""); 
        setBlogSubCategory(""); 
        setBlogDesc("");
        setBlogHeroVideo(""); // ✅ Clear Hero Video
        
        setBlogWriterName("");
        setBlogWriterSocial("");
        
        setBlogContents(Array(10).fill(""));
        setBlogImages(Array(10).fill({ url: "", assetId: "" }));
        setBlogFeatured(false); 
        setBlogPublished(false); 
        setBlogMetaTitle(""); 
        setBlogMetaDesc(""); 
        setBlogKeywords("");
        setImgOrientations({});
      }
      setActivePart("1");
    }
  }, [showForm, initialData]);

  const setOrientation = (key: string, val: string) => setImgOrientations(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = async (e: any, index: number) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const r = await uploadImage(fd);
    if (r.success) {
      setBlogImages(prev => {
        const next = [...prev];
        next[index] = { url: r.url || "", assetId: r.assetId || "" };
        return next;
      });
    }
    else alert("Upload failed: " + r.error);
  };

  const handleCategoryChange = (slug: string) => { setBlogCategory(slug); setBlogSubCategory(""); };

  const handleContentChange = (index: number, value: string) => {
    setBlogContents(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleInsertEmbed = () => {
    if (!embedInput) return alert("Please enter a URL or Embed Code");
    
    let embedHtml = "";
    if (embedType === "youtube") {
      const match = embedInput.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
      const videoId = match ? match[1] : null;
      
      if (videoId) {
        embedHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div><p></p>`;
      } else {
        return alert("Invalid YouTube URL");
      }
    } else {
      embedHtml = `<div style="width: 100%; max-width: 500px; margin: 30px auto; position: relative; overflow: hidden;">${embedInput}</div><p></p>`;
    }

    const currentContent = blogContents[currentPartIndex] || "";
    handleContentChange(currentPartIndex, currentContent + embedHtml);
    
    setEmbedInput("");
    alert(`Embed added to the bottom of Part ${activePart}!`);
  };

  const handleSavePart = async () => {
    if (!editingId) return alert("Please save the main blog details first (Click Publish/Update at the bottom). Then you can save individual parts.");
    
    const partIndex = parseInt(activePart) - 1;
    const d: ActionData = {
      [`content${activePart}`]: blogContents[partIndex],
      imgOrientations: imgOrientations
    };

    const img = blogImages[partIndex];
    if (img.assetId) {
      d[`img${activePart}`] = { _type: 'image', asset: { _ref: img.assetId, _type: 'reference' } };
    } else if (!img.url) {
      d[`img${activePart}`] = null; 
    }

    const r = await saveBlog(d, editingId);
    if (r.success) {
      alert(`Part ${activePart} saved successfully!`);
      onSaved(); 
    } else alert("Error saving part: " + r.error);
  };

  const handleSaveBlog = async () => {
    if (!blogTitle) return alert("Title required!");
    const sl = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const d: ActionData = {
      slug: { _type: 'slug', current: sl } as unknown as string,
      title: blogTitle, category: blogCategory, subCategory: blogSubCategory,
      isFeatured: blogFeatured, isPublished: blogPublished, desc: blogDesc,
      metaTitle: blogMetaTitle, metaDesc: blogMetaDesc, keywords: blogKeywords,
      imgOrientations: imgOrientations,
      writerName: blogWriterName,       
      writerSocial: blogWriterSocial,
      heroVideoUrl: blogHeroVideo      // ✅ Added to Save Payload
    };

    for(let i=0; i<10; i++) {
      const partKey = i + 1;
      d[`content${partKey}`] = blogContents[i];
      const img = blogImages[i];
      if (img.assetId) {
        d[`img${partKey}`] = { _type: 'image', asset: { _ref: img.assetId, _type: 'reference' } };
      } else if (!img.url && editingId) {
        d[`img${partKey}`] = null; 
      }
    }

    if (!editingId) { d.date = new Date().toISOString().split('T')[0]; d.views = 0; }
    
    const r = await saveBlog(d, editingId || undefined);
    if (r.success) { onClose(); onSaved(); } else alert("Error: " + r.error);
  };

  if (!showForm) return null;

  const currentPartIndex = parseInt(activePart) - 1;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 pt-6 overflow-y-auto pb-6">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl shadow-2xl mx-4 my-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 md:px-8 py-5 rounded-t-2xl z-20 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Blog" : "Create New Blog"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all text-sm">✕</button>
        </div>
        
        <div className="px-6 md:px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            <input type="text" value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
          </div>

          {/* ✅ HERO VIDEO URL FIELD */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">🎬 Hero Video URL (Optional)</label>
            <input 
              type="url" 
              value={blogHeroVideo} 
              onChange={(e) => setBlogHeroVideo(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" 
            />
            <p className="text-[10px] text-blue-600 mt-1.5">Paste URL here to show Video on Homepage Hero Slider instead of Image.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900">
              {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
            </select>
            <select value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900 disabled:opacity-50" disabled={availableSubCats.length === 0}>
              {availableSubCats.length > 0 ? (<><option value="">-- Sub-Category --</option>{availableSubCats.map((s) => <option key={s._id} value={getSlug(s.slug)}>{s.emoji} {s.name}</option>)}</>) : (<option value="">No sub-categories</option>)}
            </select>
          </div>

          {/* WRITER DETAILS SECTION */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">✍️ Writer / Author Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={blogWriterName} onChange={(e) => setBlogWriterName(e.target.value)} placeholder="Writer Name (e.g. John Doe)" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="url" value={blogWriterSocial} onChange={(e) => setBlogWriterSocial(e.target.value)} placeholder="Social Link (https://twitter.com/...)" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogPublished ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogPublished ? 'text-green-800' : 'text-gray-900'}`}>{blogPublished ? '🟢 Published' : '🟡 Draft'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Toggle to change status</p>
              </div>
              <button type="button" onClick={() => setBlogPublished(!blogPublished)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogPublished ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogPublished ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogFeatured ? 'bg-[#6D28D9]/5 border-[#6D28D9]/20' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogFeatured ? 'text-[#6D28D9]' : 'text-gray-900'}`}>⭐ Featured Article</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Show on homepage hero</p>
              </div>
              <button type="button" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* CONTENT PARTS WITH SMALLER TABS */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200 scrollbar-hide">
              {contentParts.map((p) => (
                <button key={p.key} onClick={() => setActivePart(p.key)} className={`flex-shrink-0 px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activePart === p.key ? 'bg-white text-[#6D28D9] border-[#6D28D9]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50'}`}>
                  {p.label} {p.optional && <span className="text-gray-300 ml-0.5">·</span>}
                </button>
              ))}
            </div>
            <div className="p-5 space-y-5">
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col" style={{ minHeight: '400px' }}>
                <ReactQuill 
                  key={activePart}
                  theme="snow" 
                  value={blogContents[currentPartIndex]} 
                  onChange={(val) => handleContentChange(currentPartIndex, sanitizeQuill(val))} 
                  modules={quillModules} 
                  formats={quillFormats} 
                  className="blog-editor-custom flex-1" 
                  style={{ minHeight: '350px' }}
                />
              </div>

              {/* EMBED INSERT SECTION */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🔗 Add Embed (Video or Social Post)</h3>
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <select value={embedType} onChange={(e) => setEmbedType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none cursor-pointer">
                    <option value="youtube">YouTube Video</option>
                    <option value="facebook">Facebook Post</option>
                    <option value="instagram">Instagram Post</option>
                    <option value="twitter">Twitter / X Post</option>
                  </select>
                  <input 
                    type="text" 
                    value={embedInput} 
                    onChange={(e) => setEmbedInput(e.target.value)} 
                    placeholder={embedType === 'youtube' ? "Paste YouTube URL (https://youtu.be/...)" : "Paste Raw HTML/Embed Code here..."} 
                    className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#6D28D9]"
                  />
                  <button type="button" onClick={handleInsertEmbed} className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-[#5B21B6] transition-colors flex items-center gap-1">
                    ➕ Insert to Part {activePart}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Part {activePart} · <strong className="text-gray-600">{getWordCount(blogContents[currentPartIndex])} words</strong></span>
                <span>Total: <strong className="text-gray-600">{blogContents.reduce((s, c) => s + getWordCount(c), 0)} words</strong></span>
              </div>

              <div className="border border-dashed border-gray-200 rounded-xl p-4 hover:border-[#6D28D9]/50 transition-colors">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3 cursor-pointer">📷 Upload Image {activePart}</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, currentPartIndex)} className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20 file:cursor-pointer" />

                {blogImages[currentPartIndex]?.url && (
                  <div className="mt-4 space-y-3">
                    <div className="relative group">
                      <img
                        src={blogImages[currentPartIndex].url}
                        alt=""
                        className={`rounded-lg object-cover border border-gray-200 ${
                          imgOrientations[activePart] === 'vertical' ? 'h-48 w-auto max-w-xs mx-auto' : 'h-36 w-full'
                        }`}
                      />
                      <button onClick={() => setBlogImages(prev => { const n=[...prev]; n[currentPartIndex] = {url:"",assetId:""}; return n; })} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mr-1">Layout:</span>
                      <button type="button" onClick={() => setOrientation(activePart, 'horizontal')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${(!imgOrientations[activePart] || imgOrientations[activePart] === 'horizontal') ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        Horizontal
                      </button>
                      <button type="button" onClick={() => setOrientation(activePart, 'vertical')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${imgOrientations[activePart] === 'vertical' ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        Vertical
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSavePart} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-all">
                  💾 Save Part {activePart}
                </button>
              </div>
            </div>
          </div>

          {/* SEO META SECTION */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">🔍 SEO Optimization</h3>
            <div className="space-y-3">
              <input type="text" value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <textarea value={blogMetaDesc} onChange={(e) => setBlogMetaDesc(e.target.value)} placeholder="Meta Description" rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all resize-none" />
              <input type="text" value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} placeholder="Keywords (comma separated)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 md:px-8 py-5 rounded-b-2xl flex gap-3 z-20">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>
          <button onClick={handleSaveBlog} className="flex-1 py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-all hover:shadow-lg hover:shadow-[#6D28D9]/20 active:scale-[0.98]">{editingId ? "✓ Update" : "🚀 Publish"}</button>
        </div>
      </div>
    </div>
  );
}