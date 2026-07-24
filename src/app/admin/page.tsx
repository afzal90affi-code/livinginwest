"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import {
  getCategories, getSubcategories, getBlogs,
  saveCategory, deleteCategory, saveBlog,
  saveSubcategory, deleteSubcategory,
  deleteBlog, uploadImage, reorderItem
} from './actions';

import BlogForm, { getSlug, type Blog, type Category, type Subcategory } from './BlogForm';

interface ImageState { url: string; assetId: string; }
type SanityImageRef = { _type: 'image'; asset: { _ref: string; _type: 'reference' } };
type ActionData = Record<string, string | boolean | number | undefined | SanityImageRef | Record<string, string> | null>;

// ======== MAIN COMPONENT ========
export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [blogList, setBlogList] = useState<Blog[]>([]);
  const [catList, setCatList] = useState<Category[]>([]);
  const [subCatList, setSubCatList] = useState<Subcategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [reorderingType, setReorderingType] = useState<string | null>(null);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubCatForm, setShowSubCatForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);

  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("");
  const [catImg, setCatImg] = useState<ImageState>({ url: "", assetId: "" });
  const [catMetaTitle, setCatMetaTitle] = useState("");
  const [catMetaDesc, setCatMetaDesc] = useState("");

  const [selectedParentCat, setSelectedParentCat] = useState("");
  const [sortParentCat, setSortParentCat] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [subCatEmoji, setSubCatEmoji] = useState("");
  const [subCatDesc, setSubCatDesc] = useState("");
  const [subCatImg, setSubCatImg] = useState<ImageState>({ url: "", assetId: "" });
  const [subCatMetaTitle, setSubCatMetaTitle] = useState("");
  const [subCatMetaDesc, setSubCatMetaDesc] = useState("");

  const filteredSubCats = selectedParentCat ? subCatList.filter(s => s.parentId === selectedParentCat) : [];
  const sortFilteredSubCats = sortParentCat ? subCatList.filter(s => s.parentId === sortParentCat) : [];
  const totalViews = blogList.reduce((s, b) => s + (b.views || 0), 0);
  const totalPublished = blogList.filter(b => b.isPublished).length;
  const totalDrafts = blogList.filter(b => !b.isPublished).length;
  const totalFeatured = blogList.filter(b => b.isFeatured).length;

  const handleImageUpload = async (e: any, setter: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    const r = await uploadImage(fd);
    if (r.success) setter({ url: r.url || "", assetId: r.assetId || "" });
    else alert("Upload failed: " + r.error);
  };

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cats, subs, blogs] = await Promise.all([getCategories(), getSubcategories(), getBlogs()]);
      setCatList(cats); setSubCatList(subs); setBlogList(blogs);
    } catch (e) { console.error(e); }
    setLoadingData(false);
  }, []);

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn, fetchData]);
  useEffect(() => {
    const hasAdminCookie = document.cookie.split('; ').some((cookie) => cookie.startsWith('admin_auth=true'));
    if (hasAdminCookie) setIsLoggedIn(true);
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Wrong password!');
        return;
      }

      document.cookie = 'admin_auth=true; path=/; max-age=86400; SameSite=Lax';
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsLoggedIn(false);
  };

  // ======== REORDER ========
  const handleMove = async (type: string, id: string, dir: 'up' | 'down', pid?: string) => {
    setReorderingType(type);
    await reorderItem(type as any, id, dir, pid);
    await fetchData();
    setReorderingType(null);
  };

  // ======== BLOG FUNCTIONS ========
  const openAddBlog = () => { setEditingBlog(null); setShowBlogForm(true); };
  const openEditBlog = (b: Blog) => { setEditingBlog(b); setShowBlogForm(true); };

  const handleDeleteBlog = async (id: string) => { if (!confirm("Delete this blog?")) return; const r = await deleteBlog(id); if (r.success) fetchData(); };

  const quickTogglePublish = async (blog: Blog) => {
    const r = await saveBlog({ isPublished: !blog.isPublished }, blog._id);
    if (r.success) fetchData(); else alert("Error: " + r.error);
  };

  // ======== CATEGORY FUNCTIONS ========
  const openAddCategory = () => { setEditingCatId(null); setCatName(""); setCatEmoji(""); setCatImg({ url: "", assetId: "" }); setCatMetaTitle(""); setCatMetaDesc(""); setShowCatForm(true); };
  const openEditCategory = (c: Category) => { setEditingCatId(c._id); setCatName(c.name || ""); setCatEmoji(c.emoji || ""); setCatImg({ url: c.imageUrl || "", assetId: "" }); setCatMetaTitle(c.metaTitle || ""); setCatMetaDesc(c.metaDesc || ""); setShowCatForm(true); };
  const handleSaveCategory = async () => {
    if (!catName) return alert("Name required!");
    const sl = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const d: ActionData = { name: catName, slug: { _type: 'slug', current: sl } as unknown as string, emoji: catEmoji || "📁", metaTitle: catMetaTitle, metaDesc: catMetaDesc };
    if (catImg.assetId) d.image = { _type: 'image', asset: { _ref: catImg.assetId, _type: 'reference' } };
    const r = await saveCategory(d, editingCatId || undefined);
    if (r.success) { setShowCatForm(false); fetchData(); } else alert("Error: " + r.error);
  };
  const handleDeleteCategory = async (id: string) => { if (!confirm("Delete?")) return; const r = await deleteCategory(id); if (r.success) fetchData(); };

  // ======== SUBCATEGORY FUNCTIONS ========
  const openAddSubCat = () => { setEditingSubCatId(null); setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImg({ url: "", assetId: "" }); setSubCatMetaTitle(""); setSubCatMetaDesc(""); setShowSubCatForm(true); };
  const openEditSubCat = (s: Subcategory) => { setEditingSubCatId(s._id); setSelectedParentCat(s.parentId || ""); setSubCatName(s.name || ""); setSubCatEmoji(s.emoji || ""); setSubCatDesc(s.desc || ""); setSubCatImg({ url: s.imageUrl || "", assetId: "" }); setSubCatMetaTitle(s.metaTitle || ""); setSubCatMetaDesc(s.metaDesc || ""); setShowSubCatForm(true); };
  const handleSaveSubCategory = async () => {
    if (!subCatName || !selectedParentCat) return alert("Fill all!");
    const sl = subCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const d: ActionData = { parentId: selectedParentCat, name: subCatName, slug: { _type: 'slug', current: sl } as unknown as string, emoji: subCatEmoji || "📁", desc: subCatDesc, metaTitle: subCatMetaTitle, metaDesc: subCatMetaDesc };
    if (subCatImg.assetId) d.image = { _type: 'image', asset: { _ref: subCatImg.assetId, _type: 'reference' } };
    const r = await saveSubcategory(d, editingSubCatId || undefined);
    if (r.success) { setShowSubCatForm(false); fetchData(); } else alert("Error: " + r.error);
  };
  const handleDeleteSubCategory = async (id: string) => { if (!confirm("Delete?")) return; const r = await deleteSubcategory(id); if (r.success) fetchData(); };

  // ======== LOGIN ========
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-[#6D28D9] rounded-2xl flex items-center justify-center mb-4"><span className="text-white text-xl">🔒</span></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Login</h2>
            <p className="text-sm text-gray-400">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Enter password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" required />
            <button type="submit" className="w-full py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition-all">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div></div>;

  // ======== MOVE BUTTON ========
  const MoveBtn = ({ dir, disabled, onClick }: { dir: 'up' | 'down'; disabled: boolean; onClick: () => void }) => (
    <button onClick={onClick} disabled={disabled}
      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#6D28D9] hover:text-[#6D28D9] hover:bg-[#6D28D9]/5 transition-all disabled:opacity-15 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-400 disabled:hover:bg-transparent">
      {dir === 'up'
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      }
    </button>
  );

  return (
    <div className="min-h-screen flex relative bg-gray-50 text-gray-900">
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)}></div>}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-5 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between shadow-sm`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">A</span></div>
              <h2 className="text-lg font-bold text-gray-900">Admin</h2>
            </div>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "📊 Dashboard" },
              { id: "blogs", label: "📝 Blogs" },
              { id: "categories", label: "📁 Categories" },
              { id: "subcategories", label: "📂 Sub-Categories" },
              { id: "sortorder", label: "⬆️ Sort Order" },
            ].map((item) => (
              <button key={item.id} onClick={() => { setTab(item.id); setMobileOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${tab === item.id ? "bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20" : "text-gray-600 hover:bg-gray-100"}`}>{item.label}</button>
            ))}
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-100 space-y-2">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all px-4 py-2.5 rounded-lg">🚪 Logout</button>
          <Link href="/" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-900 transition-colors px-4 py-2.5 rounded-lg hover:bg-gray-100">← Back to Site</Link>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center"><span className="text-white text-[10px] font-bold">A</span></div>
            <h2 className="text-base font-bold text-gray-900">Admin</h2>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-2xl text-gray-500 hover:text-gray-900">☰</button>
        </div>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">

          {/* ========== DASHBOARD ========== */}
          {tab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: "Total Blogs", value: blogList.length, color: "text-gray-900" },
                  { label: "Published", value: totalPublished, color: "text-green-600" },
                  { label: "Drafts", value: totalDrafts, color: "text-amber-600" },
                  { label: "Featured", value: totalFeatured, color: "text-[#6D28D9]" },
                  { label: "Categories", value: catList.length, color: "text-gray-900" },
                  { label: "Total Views", value: totalViews, color: "text-gray-900" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== BLOGS ========== */}
          {tab === "blogs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Blogs <span className="text-gray-400 font-normal ml-2 text-base">({blogList.length})</span></h1>
                <button onClick={openAddBlog} className="px-4 py-2.5 bg-[#6D28D9] text-white rounded-lg text-sm font-medium hover:bg-[#5B21B6] shadow-sm hover:shadow-md transition-all active:scale-[0.98]">+ New Blog</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
                <table className="w-full text-sm text-left min-w-[700px]">
                  <thead className="border-b border-gray-100 text-gray-400 bg-gray-50/50">
                    <tr>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Featured</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogList.map((blog) => (
                      <tr key={blog._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 max-w-[250px] truncate">{blog.title}</td>
                        <td className="p-4">
                          <button onClick={() => quickTogglePublish(blog)} title="Click to toggle"
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${blog.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'}`}>
                            {blog.isPublished ? '● Published' : '● Draft'}
                          </button>
                        </td>
                        <td className="p-4">{blog.isFeatured ? <span className="px-2.5 py-0.5 bg-[#6D28D9]/10 text-[#6D28D9] text-[10px] font-bold rounded-full">⭐ Featured</span> : <span className="text-gray-200">—</span>}</td>
                        <td className="p-4 text-gray-500 text-xs">{blog.category}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openEditBlog(blog)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 hover:bg-gray-200 transition-colors">Edit</button>
                          <button onClick={() => handleDeleteBlog(blog._id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {blogList.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">No blogs yet</div>}
              </div>
            </div>
          )}

          {/* ========== CATEGORIES ========== */}
          {tab === "categories" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories <span className="text-gray-400 font-normal ml-2 text-base">({catList.length})</span></h1>
                <button onClick={openAddCategory} className="px-4 py-2.5 bg-[#6D28D9] text-white rounded-lg text-sm font-medium hover:bg-[#5B21B6] shadow-sm hover:shadow-md transition-all active:scale-[0.98]">+ Add</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {catList.map((cat) => (
                  <div key={cat._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <div className="h-28 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                      {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl">{cat.emoji}</span>}
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <button onClick={() => openEditCategory(cat)} className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] text-gray-700 hover:bg-gray-200 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] hover:bg-red-100 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== SUBCATEGORIES ========== */}
          {tab === "subcategories" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sub-Categories</h1>
                <button onClick={openAddSubCat} disabled={!selectedParentCat} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedParentCat ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>+ Add</button>
              </div>
              <div className="mb-8">
                <label className="text-xs text-gray-500 block mb-2 font-medium">Select Parent Category</label>
                <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full md:w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 shadow-sm transition-all">
                  <option value="">-- Select Parent --</option>
                  {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              {selectedParentCat ? (
                filteredSubCats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredSubCats.map((sub) => (
                      <div key={sub._id} className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                        <div className="h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {sub.imageUrl ? <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{sub.emoji}</span>}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div><p className="font-semibold text-sm text-gray-900">{sub.name}</p><p className="text-[10px] text-gray-500 mt-0.5">{sub.desc}</p></div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditSubCat(sub)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors">✏️</button>
                              <button onClick={() => handleDeleteSubCategory(sub._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm"><span className="text-5xl block mb-3">📭</span><p className="text-gray-400 text-sm">No sub-categories yet.</p></div>
              ) : <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm"><span className="text-5xl block mb-3">☝️</span><p className="text-gray-400">Select a parent category first.</p></div>}
            </div>
          )}

          {/* ========== SORT ORDER ========== */}
          {tab === "sortorder" && (
            <div className="space-y-10 max-w-4xl">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Sort Order</h1>
                <p className="text-sm text-gray-400">Click ↑ ↓ buttons to move items up or down</p>
              </div>

              {/* CATEGORIES */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div><h2 className="text-base font-bold text-gray-900">📁 Categories</h2><p className="text-[11px] text-gray-400 mt-0.5">{catList.length} items</p></div>
                </div>
                {catList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">No categories found</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {catList.map((cat, i) => (
                      <div key={cat._id} className={`flex items-center gap-4 px-6 py-4 transition-all ${reorderingType === 'category' ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}>
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 font-mono flex-shrink-0">{i + 1}</div>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {cat.imageUrl ? <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{cat.emoji || '📁'}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/{getSlug(cat.slug)}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <MoveBtn dir="up" disabled={i === 0} onClick={() => handleMove('category', cat._id, 'up')} />
                          <MoveBtn dir="down" disabled={i === catList.length - 1} onClick={() => handleMove('category', cat._id, 'down')} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SUBCATEGORIES */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div><h2 className="text-base font-bold text-gray-900">📂 Sub-Categories</h2><p className="text-[11px] text-gray-400 mt-0.5">{sortFilteredSubCats.length} items</p></div>
                    <select value={sortParentCat} onChange={(e) => setSortParentCat(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all w-full md:w-auto">
                      <option value="">-- Select Category --</option>
                      {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                {!sortParentCat ? (
                  <div className="py-16 text-center"><span className="text-4xl block mb-3">☝️</span><p className="text-gray-400 text-sm">Pehle category select karein</p></div>
                ) : sortFilteredSubCats.length === 0 ? (
                  <div className="py-16 text-center"><span className="text-4xl block mb-3">📭</span><p className="text-gray-400 text-sm">Is category mein koi sub-category nahi</p></div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sortFilteredSubCats.map((sub, i) => (
                      <div key={sub._id} className={`flex items-center gap-4 px-6 py-4 transition-all ${reorderingType === 'subcategory' ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}>
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 font-mono flex-shrink-0">{i + 1}</div>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {sub.imageUrl ? <img src={sub.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{sub.emoji || '📂'}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{sub.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{sub.desc}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <MoveBtn dir="up" disabled={i === 0} onClick={() => handleMove('subcategory', sub._id, 'up', sortParentCat)} />
                          <MoveBtn dir="down" disabled={i === sortFilteredSubCats.length - 1} onClick={() => handleMove('subcategory', sub._id, 'down', sortParentCat)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BLOGS */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div><h2 className="text-base font-bold text-gray-900">📝 Blogs</h2><p className="text-[11px] text-gray-400 mt-0.5">{blogList.length} items</p></div>
                </div>
                {blogList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">No blogs found</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {blogList.map((blog, i) => (
                      <div key={blog._id} className={`flex items-center gap-4 px-6 py-4 transition-all ${reorderingType === 'blog' ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}>
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 font-mono flex-shrink-0">{i + 1}</div>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {blog.imgUrls?.[0] ? <img src={blog.imgUrls[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📝</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{blog.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">{blog.category}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>{blog.isPublished ? 'Published' : 'Draft'}</span>
                          </div>
                        </div>
                        {blog.isFeatured && <span className="text-[10px] flex-shrink-0">⭐</span>}
                        <div className="flex gap-1.5 flex-shrink-0">
                          <MoveBtn dir="up" disabled={i === 0} onClick={() => handleMove('blog', blog._id, 'up')} />
                          <MoveBtn dir="down" disabled={i === blogList.length - 1} onClick={() => handleMove('blog', blog._id, 'down')} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== BLOG FORM MODAL (Extracted) ===== */}
      <BlogForm 
        showForm={showBlogForm} 
        onClose={() => setShowBlogForm(false)} 
        initialData={editingBlog} 
        catList={catList} 
        subCatList={subCatList} 
        onSaved={fetchData} 
      />

      {/* ===== CATEGORY MODAL ===== */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingCatId ? "Edit Category" : "Add Category"}</h2>
            <div className="space-y-4">
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="text" value={catEmoji} onChange={(e) => setCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <div className="border border-dashed border-gray-200 rounded-xl p-4 hover:border-[#6D28D9]/50 transition-colors">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3 cursor-pointer">📷 Upload Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCatImg)} className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20 file:cursor-pointer" />
                {catImg.url && (
                  <div className="mt-3 relative group">
                    <img src={catImg.url} alt="" className="h-24 rounded-lg object-cover border border-gray-200" />
                    <button onClick={() => setCatImg({ url: "", assetId: "" })} className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                )}
              </div>
              <input type="text" value={catMetaTitle} onChange={(e) => setCatMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="text" value={catMetaDesc} onChange={(e) => setCatMetaDesc(e.target.value)} placeholder="Meta Description" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCatForm(false); setCatImg({ url: "", assetId: "" }); setEditingCatId(null); }} className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>
              <button onClick={handleSaveCategory} className="flex-1 py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition-all">{editingCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUBCATEGORY MODAL ===== */}
      {showSubCatForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingSubCatId ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
            <div className="space-y-4">
              <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900">
                <option value="">-- Select Parent --</option>
                {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
              </select>
              <input type="text" value={subCatName} onChange={(e) => setSubCatName(e.target.value)} placeholder="Sub-Category Name *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="text" value={subCatEmoji} onChange={(e) => setSubCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="text" value={subCatDesc} onChange={(e) => setSubCatDesc(e.target.value)} placeholder="Short Description" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <div className="border border-dashed border-gray-200 rounded-xl p-4 hover:border-[#6D28D9]/50 transition-colors">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3 cursor-pointer">📷 Upload Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setSubCatImg)} className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20 file:cursor-pointer" />
                {subCatImg.url && (
                  <div className="mt-3 relative group">
                    <img src={subCatImg.url} alt="" className="h-24 rounded-lg object-cover border border-gray-200" />
                    <button onClick={() => setSubCatImg({ url: "", assetId: "" })} className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowSubCatForm(false); setEditingSubCatId(null); }} className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>
              <button onClick={handleSaveSubCategory} className="flex-1 py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition-all">{editingSubCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}