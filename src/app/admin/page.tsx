"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Sanity Server Actions Import
import {
  getCategories, getSubcategories, getBlogs,
  saveCategory, deleteCategory,
  saveSubcategory, deleteSubcategory,
  saveBlog, deleteBlog,
  uploadImage // New upload action
} from './actions';

// Quill Editor
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

// ======== TYPESCRIPT INTERFACES ========
interface Blog {
  _id: string;
  title: string;
  category: string;
  subCategory?: string;
  desc?: string;
  isFeatured: boolean;
  content1?: string;
  content2?: string;  // <-- YE ADD KAREIN
  content3?: string;
  img1Url?: string; // Sanity se aayega preview ke liye
  img2Url?: string;
  img3Url?: string;
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string;
  date?: string;
  views?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: any;
  emoji?: string;
  imageUrl?: string; // Sanity se aayega preview ke liye
  metaTitle?: string;
  metaDesc?: string;
}

interface Subcategory {
  _id: string;
  parentId: string;
  name: string;
  slug: any;
  emoji?: string;
  desc?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
}

interface ImageState {
  url: string;
  assetId: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginPass, setLoginPass] = useState<string>("");
  const [tab, setTab] = useState<string>("dashboard");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const [blogList, setBlogList] = useState<Blog[]>([]);
  const [catList, setCatList] = useState<Category[]>([]);
  const [subCatList, setSubCatList] = useState<Subcategory[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const [showBlogForm, setShowBlogForm] = useState<boolean>(false);
  const [showCatForm, setShowCatForm] = useState<boolean>(false);
  const [showSubCatForm, setShowSubCatForm] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState<string>("");
  const [blogCategory, setBlogCategory] = useState<string>("");
  const [blogSubCategory, setBlogSubCategory] = useState<string>("");
  const [blogDesc, setBlogDesc] = useState<string>("");
  const [blogContent1, setBlogContent1] = useState<string>("");
  const [blogContent2, setBlogContent2] = useState<string>("");
  const [blogContent3, setBlogContent3] = useState<string>("");
  
  // Image States (URL + Asset ID for Sanity)
  const [blogImg1, setBlogImg1] = useState<ImageState>({ url: "", assetId: "" });
  const [blogImg2, setBlogImg2] = useState<ImageState>({ url: "", assetId: "" });
  const [blogImg3, setBlogImg3] = useState<ImageState>({ url: "", assetId: "" });
  
  const [blogFeatured, setBlogFeatured] = useState<boolean>(false);
  const [blogMetaTitle, setBlogMetaTitle] = useState<string>("");
  const [blogMetaDesc, setBlogMetaDesc] = useState<string>("");
  const [blogKeywords, setBlogKeywords] = useState<string>("");

  // Category Form States
  const [catName, setCatName] = useState<string>("");
  const [catEmoji, setCatEmoji] = useState<string>("");
  const [catImg, setCatImg] = useState<ImageState>({ url: "", assetId: "" });
  const [catMetaTitle, setCatMetaTitle] = useState<string>("");
  const [catMetaDesc, setCatMetaDesc] = useState<string>("");

  // SubCat Form States
  const [selectedParentCat, setSelectedParentCat] = useState<string>("");
  const [subCatName, setSubCatName] = useState<string>("");
  const [subCatEmoji, setSubCatEmoji] = useState<string>("");
  const [subCatDesc, setSubCatDesc] = useState<string>("");
  const [subCatImg, setSubCatImg] = useState<ImageState>({ url: "", assetId: "" });
  const [subCatMetaTitle, setSubCatMetaTitle] = useState<string>("");
  const [subCatMetaDesc, setSubCatMetaDesc] = useState<string>("");

  // Upload handler function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<ImageState>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);
    if (result.success) {
      setter({ url: result.url, assetId: result.assetId });
    } else {
      alert("Image upload failed: " + result.error);
    }
  };

  const getSlug = (slug: any): string => {
    if (!slug) return "";
    if (typeof slug === 'string') return slug;
    if (typeof slug === 'object' && slug.current) return slug.current;
    return "";
  };

  const availableSubCats = subCatList.filter(sub => sub.parentId === getSlug(catList.find(c => getSlug(c.slug) === blogCategory)?.slug));

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cats, subCats, blogs] = await Promise.all([getCategories(), getSubcategories(), getBlogs()]);
      setCatList(cats);
      setSubCatList(subCats);
      setBlogList(blogs);
      if (cats.length > 0 && !blogCategory) setBlogCategory(getSlug(cats[0].slug));
    } catch (error) { console.error('Fetch error:', error); }
    setLoadingData(false);
  }, [blogCategory]);

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn, fetchData]);
  useEffect(() => { const auth = localStorage.getItem("admin_auth"); if (auth === "true") setIsLoggedIn(true); }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPass === "admin123") { localStorage.setItem("admin_auth", "true"); setIsLoggedIn(true); } 
    else { alert("Invalid Password!"); }
  };
  const handleLogout = () => { localStorage.removeItem("admin_auth"); setIsLoggedIn(false); };

  // ======== BLOG FUNCTIONS ========
  const openAddBlog = () => {
    setEditingId(null); setBlogTitle(""); setBlogCategory(catList.length > 0 ? getSlug(catList[0].slug) : ""); setBlogSubCategory(""); setBlogDesc("");
    setBlogContent1(""); setBlogImg1({ url: "", assetId: "" });
    setBlogContent2(""); setBlogImg2({ url: "", assetId: "" });
    setBlogContent3(""); setBlogImg3({ url: "", assetId: "" });
    setBlogFeatured(false); setBlogMetaTitle(""); setBlogMetaDesc(""); setBlogKeywords("");
    setShowBlogForm(true);
  };

  const openEditBlog = (blog: Blog) => {
    setEditingId(blog._id); setBlogTitle(blog.title); setBlogCategory(blog.category || ""); setBlogSubCategory(blog.subCategory || "");
    setBlogDesc(blog.desc || ""); 
    setBlogContent1(blog.content1 || ""); setBlogImg1({ url: blog.img1Url || "", assetId: "" });
    setBlogContent2(blog.content2 || ""); setBlogImg2({ url: blog.img2Url || "", assetId: "" });
    setBlogContent3(blog.content3 || ""); setBlogImg3({ url: blog.img3Url || "", assetId: "" });
    setBlogFeatured(blog.isFeatured); setBlogMetaTitle(blog.metaTitle || ""); setBlogMetaDesc(blog.metaDesc || ""); setBlogKeywords(blog.keywords || "");
    setShowBlogForm(true);
  };

  const handleCategoryChange = (slug: string) => { setBlogCategory(slug); setBlogSubCategory(""); };

  const handleSaveBlog = async () => {
    if (!blogTitle) return alert("Title is required!");
    const blogData: Record<string, any> = {
      title: blogTitle, category: blogCategory, subCategory: blogSubCategory, isFeatured: blogFeatured, desc: blogDesc,
      content1: blogContent1, content2: blogContent2, content3: blogContent3,
      metaTitle: blogMetaTitle, metaDesc: blogMetaDesc, keywords: blogKeywords
    };

    // Add image references if new image was uploaded
    if (blogImg1.assetId) blogData.img1 = { _type: 'image', asset: { _ref: blogImg1.assetId, _type: 'reference' } };
    if (blogImg2.assetId) blogData.img2 = { _type: 'image', asset: { _ref: blogImg2.assetId, _type: 'reference' } };
    if (blogImg3.assetId) blogData.img3 = { _type: 'image', asset: { _ref: blogImg3.assetId, _type: 'reference' } };

    if (!editingId) { blogData.date = new Date().toISOString().split('T')[0]; blogData.views = 0; }

    const result = await saveBlog(blogData, editingId);
    if (result.success) { setShowBlogForm(false); fetchData(); } else { alert("Error: " + result.error); }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Kya aap sure hain?")) return;
    const result = await deleteBlog(id); if (result.success) fetchData();
  };

  // ======== CATEGORY FUNCTIONS ========
  const openAddCategory = () => {
    setEditingCatId(null); setCatName(""); setCatEmoji(""); setCatImg({ url: "", assetId: "" }); setCatMetaTitle(""); setCatMetaDesc("");
    setShowCatForm(true);
  };
  const openEditCategory = (cat: Category) => {
    setEditingCatId(cat._id); setCatName(cat.name || ""); setCatEmoji(cat.emoji || ""); setCatImg({ url: cat.imageUrl || "", assetId: "" }); setCatMetaTitle(cat.metaTitle || ""); setCatMetaDesc(cat.metaDesc || "");
    setShowCatForm(true);
  };
  const handleSaveCategory = async () => {
    if (!catName) return alert("Category name zaroori hai!");
    const slugString = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data: Record<string, any> = {
      name: catName, slug: { _type: 'slug', current: slugString }, emoji: catEmoji || "📁",
      metaTitle: catMetaTitle, metaDesc: catMetaDesc
    };
    if (catImg.assetId) data.image = { _type: 'image', asset: { _ref: catImg.assetId, _type: 'reference' } };

    const result = await saveCategory(data, editingCatId);
    if (result.success) { setShowCatForm(false); fetchData(); } else { alert("Error: " + result.error); }
  };
  const handleDeleteCategory = async (id: string) => { if (!confirm("Category delete karein?")) return; const result = await deleteCategory(id); if (result.success) fetchData(); };

  // ======== SUBCATEGORY FUNCTIONS ========
  const openAddSubCat = () => {
    setEditingSubCatId(null); setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImg({ url: "", assetId: "" }); setSubCatMetaTitle(""); setSubCatMetaDesc("");
    setShowSubCatForm(true);
  };
  const openEditSubCat = (sub: Subcategory) => {
    setEditingSubCatId(sub._id); setSelectedParentCat(sub.parentId || ""); setSubCatName(sub.name || ""); setSubCatEmoji(sub.emoji || ""); setSubCatDesc(sub.desc || ""); setSubCatImg({ url: sub.imageUrl || "", assetId: "" }); setSubCatMetaTitle(sub.metaTitle || ""); setSubCatMetaDesc(sub.metaDesc || "");
    setShowSubCatForm(true);
  };
  const handleSaveSubCategory = async () => {
    if (!subCatName || !selectedParentCat) return alert("Sab bharo!");
    const slugString = subCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data: Record<string, any> = {
      parentId: selectedParentCat, name: subCatName, slug: { _type: 'slug', current: slugString },
      emoji: subCatEmoji || "📁", desc: subCatDesc, metaTitle: subCatMetaTitle, metaDesc: subCatMetaDesc
    };
    if (subCatImg.assetId) data.image = { _type: 'image', asset: { _ref: subCatImg.assetId, _type: 'reference' } };

    const result = await saveSubcategory(data, editingSubCatId);
    if (result.success) { setShowSubCatForm(false); fetchData(); } else { alert("Error: " + result.error); }
  };
  const handleDeleteSubCategory = async (id: string) => { if (!confirm("Sub-category delete karein?")) return; const result = await deleteSubcategory(id); if (result.success) fetchData(); };

  const totalViews = blogList.reduce((sum: number, blog: Blog) => sum + (blog.views || 0), 0);
  const totalFeatured = blogList.filter((b: Blog) => b.isFeatured).length;
  const filteredSubCats = selectedParentCat ? subCatList.filter((sub: Subcategory) => sub.parentId === selectedParentCat) : [];

  const quillModules = { toolbar: [[{ 'header': '1' }, { 'header': '2' }, { 'font': [] }], [{ size: [] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['link', 'image', 'video'], ['clean']] };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" required />
            <button type="submit" className="w-full py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }
  if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div></div>;

  return (
    <div className="min-h-screen flex relative bg-gray-50 text-gray-900">
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)}></div>}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between shadow-sm`}>
        <div>
          <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-bold text-[#1e3a8a]">Admin Panel</h2><button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900">✕</button></div>
          <nav className="space-y-2">
            <button onClick={() => { setTab("dashboard"); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "dashboard" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Dashboard</button>
            <button onClick={() => { setTab("blogs"); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "blogs" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Manage Blogs</button>
            <button onClick={() => { setTab("categories"); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "categories" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Main Categories</button>
            <button onClick={() => { setTab("subcategories"); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "subcategories" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Sub-Categories</button>
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-100 space-y-3"><button onClick={handleLogout} className="w-full text-left flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition">🚪 Logout</button><Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">← Back to Site</Link></div>
      </aside>

      <div className="flex-1 flex flex-col w-full md:w-auto">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"><h2 className="text-lg font-bold text-[#1e3a8a]">Admin Panel</h2><button onClick={() => setMobileOpen(true)} className="text-2xl text-gray-600 hover:text-gray-900">☰</button></div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* DASHBOARD */}
          {tab === "dashboard" && ( <div><div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1></div><div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"><div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Total Blogs</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{blogList.length}</p></div><div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Featured</p><p className="text-2xl md:text-3xl font-bold mt-2 text-[#6D28D9]">{totalFeatured}</p></div><div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Main Cats</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{catList.length}</p></div><div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Sub-Cats</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{subCatList.length}</p></div><div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-1"><p className="text-gray-500 text-xs md:text-sm">Total Views</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{totalViews}</p></div></div></div> )}
          
          {/* BLOGS LIST */}
          {tab === "blogs" && ( <div><div className="flex justify-between items-center mb-6"><h1 className="text-xl md:text-2xl font-bold text-gray-900">Blogs ({blogList.length})</h1><button onClick={openAddBlog} className="px-3 py-2 md:px-4 md:py-2 bg-[#6D28D9] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#5B21B6] shadow-sm">+ Add</button></div><div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm"><table className="w-full text-sm text-left min-w-[500px]"><thead className="border-b border-gray-100 text-gray-500 bg-gray-50"><tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Featured</th><th className="p-4">Actions</th></tr></thead><tbody>{blogList.map((blog: Blog) => (<tr key={blog._id} className="border-b border-gray-50 hover:bg-gray-50"><td className="p-4 font-medium text-gray-900">{blog.title}</td><td className="p-4 capitalize text-gray-600">{blog.category}</td><td className="p-4">{blog.isFeatured ? <span className="px-2 py-0.5 bg-[#6D28D9]/10 text-[#6D28D9] text-[10px] font-bold rounded-full">⭐ Featured</span> : <span className="text-gray-300 text-xs">—</span>}</td><td className="p-4 flex gap-2"><button onClick={() => openEditBlog(blog)} className="px-3 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">Edit</button><button onClick={() => handleDeleteBlog(blog._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">Delete</button></td></tr>))}</tbody></table></div></div> )}

          {/* CATEGORIES */}
          {tab === "categories" && ( <div><div className="flex justify-between items-center mb-6"><h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories ({catList.length})</h1><button onClick={openAddCategory} className="px-3 py-2 md:px-4 md:py-2 bg-[#6D28D9] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#5B21B6] shadow-sm">+ Add</button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{catList.map((cat: Category) => (<div key={cat._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group shadow-sm hover:shadow-md transition-shadow"><div className="h-24 md:h-28 bg-gray-50 flex items-center justify-center relative overflow-hidden">{cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-3xl md:text-4xl">{cat.emoji}</span>}</div><div className="p-4 text-center"><p className="font-semibold text-gray-900">{cat.name}</p><div className="mt-3 flex gap-2 justify-center"><button onClick={() => openEditCategory(cat)} className="px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-700 hover:bg-gray-200">Edit</button><button onClick={() => handleDeleteCategory(cat._id)} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] hover:bg-red-100">Delete</button></div></div></div>))}</div></div> )}
          
          {/* SUBCATEGORIES */}
          {tab === "subcategories" && ( <div><div className="flex justify-between items-center mb-6"><h1 className="text-xl md:text-2xl font-bold text-gray-900">Sub-Categories</h1><button onClick={openAddSubCat} disabled={!selectedParentCat} className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium ${selectedParentCat ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>+ Add</button></div><div className="mb-8"><label className="text-xs text-gray-500 block mb-2">Select Parent Category</label><select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full md:w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900 shadow-sm"><option value="">-- Select Parent Category --</option>{catList.map((cat: Category) => <option key={cat._id} value={getSlug(cat.slug)}>{cat.emoji} {cat.name}</option>)}</select></div>{selectedParentCat ? ( filteredSubCats.length > 0 ? ( <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filteredSubCats.map((sub: Subcategory) => (<div key={sub._id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden"><div className="h-20 md:h-24 bg-gray-50 flex items-center justify-center overflow-hidden">{sub.imageUrl ? <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{sub.emoji}</span>}</div><div className="p-4"><div className="flex items-start justify-between"><div><p className="font-semibold text-sm text-gray-900">{sub.name}</p><p className="text-[10px] text-gray-500 mt-0.5">{sub.desc}</p></div><div className="flex gap-1"><button onClick={() => openEditSubCat(sub)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">✏️</button><button onClick={() => handleDeleteSubCategory(sub._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">✕</button></div></div></div></div>))}</div> ) : ( <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-4xl block mb-4">🚀</span><p className="text-gray-500 text-sm">No sub-categories found.</p></div> ) ) : ( <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-4xl block mb-4">☝️</span><p className="text-gray-500">Please select a Parent Category first.</p></div> )}</div> )}
        </main>
      </div>

      {/* ===== BLOG MODAL ===== */}
      {showBlogForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 pt-10 overflow-y-auto pb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl mx-4">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingId ? "Edit Blog" : "Add New Blog"}</h2>
            <div className="space-y-4">
              <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <div className="grid grid-cols-2 gap-4">
                <select value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900">
                  {catList.map((cat) => <option key={cat._id} value={getSlug(cat.slug)}>{cat.emoji} {cat.name}</option>)}
                </select>
                <select value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900 disabled:opacity-50" disabled={availableSubCats.length === 0}>
                  {availableSubCats.length > 0 ? (<><option value="">-- Sub-Category --</option>{availableSubCats.map((sub) => <option key={sub._id} value={getSlug(sub.slug)}>{sub.emoji} {sub.name}</option>)}</>) : (<option value="">No sub-categories</option>)}
                </select>
              </div>
              <input type="text" value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div><p className="text-sm font-medium text-gray-900">⭐ Show in Featured</p></div>
                <button type="button" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogFeatured ? 'translate-x-6' : 'translate-x-1'}`} /></button>
              </div>

              {/* QUILL PART 1 + IMAGE UPLOAD */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 1</p>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><ReactQuill theme="snow" value={blogContent1} onChange={setBlogContent1} modules={quillModules} className="h-40 mb-12" /></div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-semibold">Upload Image 1</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBlogImg1)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20"/>
                  {blogImg1.url && <img src={blogImg1.url} alt="Img 1" className="h-20 rounded object-cover mt-1" />}
                </div>
              </div>

              {/* QUILL PART 2 + IMAGE UPLOAD */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 2</p>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><ReactQuill theme="snow" value={blogContent2} onChange={setBlogContent2} modules={quillModules} className="h-40 mb-12" /></div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-semibold">Upload Image 2</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBlogImg2)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20"/>
                  {blogImg2.url && <img src={blogImg2.url} alt="Img 2" className="h-20 rounded object-cover mt-1" />}
                </div>
              </div>

              {/* QUILL PART 3 + IMAGE UPLOAD */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 3</p>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><ReactQuill theme="snow" value={blogContent3} onChange={setBlogContent3} modules={quillModules} className="h-40 mb-12" /></div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-semibold">Upload Image 3</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBlogImg3)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20"/>
                  {blogImg3.url && <img src={blogImg3.url} alt="Img 3" className="h-20 rounded object-cover mt-1" />}
                </div>
              </div>

              {/* SEO Fields */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
                <input type="text" value={blogMetaDesc} onChange={(e) => setBlogMetaDesc(e.target.value)} placeholder="Meta Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
                <input type="text" value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} placeholder="Keywords (comma separated)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowBlogForm(false)} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveBlog} className="flex-1 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingId ? "Update" : "Publish"}</button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingCatId ? "Edit Category" : "Add Main Category"}</h2>
            <div className="space-y-4">
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catEmoji} onChange={(e) => setCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold">Upload Category Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCatImg)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20"/>
                {catImg.url && <img src={catImg.url} alt="Cat" className="h-20 rounded object-cover" />}
              </div>

              <input type="text" value={catMetaTitle} onChange={(e) => setCatMetaTitle(e.target.value)} placeholder="Category Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catMetaDesc} onChange={(e) => setCatMetaDesc(e.target.value)} placeholder="Category Meta Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowCatForm(false); setCatImg({ url: "", assetId: "" }); setEditingCatId(null); }} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveCategory} className="flex-1 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL */}
      {showSubCatForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingSubCatId ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
            <div className="space-y-4">
              <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900">
                <option value="">-- Select Parent Category --</option>
                {catList.map((cat) => <option key={cat._id} value={getSlug(cat.slug)}>{cat.emoji} {cat.name}</option>)}
              </select>
              <input type="text" value={subCatName} onChange={(e) => setSubCatName(e.target.value)} placeholder="Sub-Category Name *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatEmoji} onChange={(e) => setSubCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatDesc} onChange={(e) => setSubCatDesc(e.target.value)} placeholder="Short Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-semibold">Upload Sub-Category Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setSubCatImg)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20"/>
                {subCatImg.url && <img src={subCatImg.url} alt="Sub" className="h-20 rounded object-cover" />}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowSubCatForm(false); setEditingSubCatId(null); }} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveSubCategory} className="flex-1 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingSubCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}