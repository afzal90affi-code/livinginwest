"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; 
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, setDoc } from "firebase/firestore";

// --- DEFAULT DATA ---
const defaultCategories = [
  { id: "food", name: "Food", slug: "food", emoji: "🍔", image: "", metaTitle: "Food Blog", metaDesc: "Latest food tips" },
  { id: "travel", name: "Travel", slug: "travel", emoji: "✈️", image: "", metaTitle: "Travel Blog", metaDesc: "Travel guides" },
  { id: "automotive", name: "Automotive", slug: "automotive", emoji: "🚗", image: "", metaTitle: "Automotive", metaDesc: "Car reviews" },
  { id: "finance", name: "Finance", slug: "finance", emoji: "💰", image: "", metaTitle: "Finance", metaDesc: "Crypto and money" },
];

const defaultSubcategories = [
  { id: "desi-foods", parentId: "food", name: "Desi Foods", slug: "desi-foods", emoji: "🍛", desc: "Traditional South Asian flavors", image: "", metaTitle: "Desi Foods", metaDesc: "Traditional foods" },
  { id: "restaurants", parentId: "food", name: "Restaurants", slug: "restaurants", emoji: "🍽️", desc: "Top dining spots", image: "", metaTitle: "Top Restaurants", metaDesc: "Dining spots" },
  { id: "budget-travel", parentId: "travel", name: "Budget Travel", slug: "budget-travel", emoji: "💵", desc: "Explore without breaking bank", image: "", metaTitle: "Budget Travel", metaDesc: "Cheap travel" },
  { id: "new-cars", parentId: "automotive", name: "New Cars", slug: "new-cars", emoji: "🚙", desc: "Latest launches", image: "", metaTitle: "New Cars", metaDesc: "Latest cars" },
  { id: "crypto", parentId: "finance", name: "Crypto", slug: "crypto", emoji: "₿", desc: "Bitcoin and Web3", image: "", metaTitle: "Cryptocurrency", metaDesc: "Bitcoin web3" },
];

const defaultBlogs = [
  { id: "blog-1", title: "The Ultimate Guide to Southern BBQ", category: "food", subCategory: "desi-foods", date: "2025-01-12", views: 245, isFeatured: true, metaTitle: "Southern BBQ Guide", metaDesc: "Ultimate BBQ tips", keywords: "bbq, food", content1: "This is part 1.", content2: "This is part 2.", content3: "This is part 3." },
  { id: "blog-2", title: "Top 5 Road Trip Cars in the USA", category: "automotive", subCategory: "new-cars", date: "2025-01-10", views: 189, isFeatured: false, metaTitle: "Road Trip Cars USA", metaDesc: "Top cars for travel", keywords: "cars, travel", content1: "Road trip content part 1." },
  { id: "blog-3", title: "Budget Travel Tips for 2025", category: "travel", subCategory: "budget-travel", date: "2025-01-08", views: 120, isFeatured: true, metaTitle: "Budget Travel 2025", metaDesc: "Travel on a budget", keywords: "travel, budget", content1: "Budget travel part 1." },
];

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("dashboard");
  
  const [blogList, setBlogList] = useState<any[]>([]);
  const [catList, setCatList] = useState<any[]>([]);
  const [subCatList, setSubCatList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubCatForm, setShowSubCatForm] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("food");
  const [blogSubCategory, setBlogSubCategory] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  
  // UPDATED: 3 Parts Content & Images
  const [blogContent1, setBlogContent1] = useState("");
  const [blogImage1, setBlogImage1] = useState("");
  const [blogContent2, setBlogContent2] = useState("");
  const [blogImage2, setBlogImage2] = useState("");
  const [blogContent3, setBlogContent3] = useState("");
  const [blogImage3, setBlogImage3] = useState("");

  const [blogFeatured, setBlogFeatured] = useState(false);
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDesc, setBlogMetaDesc] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");
  
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catMetaTitle, setCatMetaTitle] = useState("");
  const [catMetaDesc, setCatMetaDesc] = useState("");

  const [selectedParentCat, setSelectedParentCat] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [subCatEmoji, setSubCatEmoji] = useState("");
  const [subCatDesc, setSubCatDesc] = useState("");
  const [subCatImage, setSubCatImage] = useState("");
  const [subCatMetaTitle, setSubCatMetaTitle] = useState("");
  const [subCatMetaDesc, setSubCatMetaDesc] = useState("");

  const availableSubCats = subCatList.filter(sub => sub.parentId === catList.find(c => c.slug === blogCategory)?.id);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      setCatList(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const subCatSnap = await getDocs(collection(db, "subcategories"));
      setSubCatList(subCatSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const blogSnap = await getDocs(collection(db, "blogs"));
      setBlogList(blogSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error(error); }
    setLoadingData(false);
  };

  useEffect(() => {
    if (user) fetchData();
    else setLoadingData(false);
  }, [user]);

  const handleLoadDefaults = async () => {
    try {
      for (const cat of defaultCategories) await setDoc(doc(db, "categories", cat.id), cat);
      for (const sub of defaultSubcategories) await setDoc(doc(db, "subcategories", sub.id), sub);
      for (const blog of defaultBlogs) await setDoc(doc(db, "blogs", blog.id), blog);
      await fetchData();
      alert("Default data loaded successfully!");
    } catch (error) { console.error(error); alert("Error loading data."); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError("");
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPass); } 
    catch (error) { setAuthError("Invalid Email or Password!"); }
  };

  const handleLogout = async () => { try { await signOut(auth); } catch (error) { console.error(error); } };

  const openAddBlog = () => {
    setEditingId(null);
    setBlogTitle(""); setBlogCategory(catList.length > 0 ? catList[0].slug : "food"); setBlogSubCategory("");
    setBlogDesc(""); 
    setBlogContent1(""); setBlogImage1("");
    setBlogContent2(""); setBlogImage2("");
    setBlogContent3(""); setBlogImage3("");
    setBlogFeatured(false);
    setBlogMetaTitle(""); setBlogMetaDesc(""); setBlogKeywords("");
    setShowBlogForm(true);
  };

  const openEditBlog = (blog: any) => {
    setEditingId(blog.id);
    setBlogTitle(blog.title); setBlogCategory(blog.category); setBlogSubCategory(blog.subCategory || "");
    setBlogDesc(blog.desc || ""); 
    setBlogContent1(blog.content1 || ""); setBlogImage1(blog.img1 || "");
    setBlogContent2(blog.content2 || ""); setBlogImage2(blog.img2 || "");
    setBlogContent3(blog.content3 || ""); setBlogImage3(blog.img3 || "");
    setBlogFeatured(blog.isFeatured);
    setBlogMetaTitle(blog.metaTitle || ""); setBlogMetaDesc(blog.metaDesc || ""); setBlogKeywords(blog.keywords || "");
    setShowBlogForm(true);
  };

  const handleCategoryChange = (slug: string) => { setBlogCategory(slug); setBlogSubCategory(""); };

  const handleSaveBlog = async () => {
    if (!blogTitle) return;
    const blogData = { 
      title: blogTitle, category: blogCategory, subCategory: blogSubCategory, isFeatured: blogFeatured, desc: blogDesc, 
      content1: blogContent1, img1: blogImage1,
      content2: blogContent2, img2: blogImage2,
      content3: blogContent3, img3: blogImage3,
      metaTitle: blogMetaTitle, metaDesc: blogMetaDesc, keywords: blogKeywords
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, "blogs", editingId), blogData);
        setBlogList(blogList.map(b => b.id === editingId ? { ...b, ...blogData } : b));
      } else {
        const docRef = await addDoc(collection(db, "blogs"), { ...blogData, date: new Date().toISOString().split('T')[0], views: 0 });
        setBlogList([{ id: docRef.id, ...blogData, date: new Date().toISOString().split('T')[0], views: 0 }, ...blogList]);
      }
      setShowBlogForm(false);
    } catch (error) { console.error(error); alert("Error saving blog!"); }
  };

  const handleDeleteBlog = async (id: string) => {
    try { await deleteDoc(doc(db, "blogs", id)); setBlogList(blogList.filter(blog => blog.id !== id)); } catch (error) { console.error(error); }
  };

  const handleAddCategory = async () => {
    if (!catName) return alert("Please enter a category name");
    const slug = catName.toLowerCase().replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "categories", slug), { name: catName, slug: slug, emoji: catEmoji || "📁", image: catImage, metaTitle: catMetaTitle, metaDesc: catMetaDesc });
      setCatList([...catList, { id: slug, name: catName, slug: slug, emoji: catEmoji || "📁", image: catImage, metaTitle: catMetaTitle, metaDesc: catMetaDesc }]);
      setCatName(""); setCatEmoji(""); setCatImage(""); setCatMetaTitle(""); setCatMetaDesc(""); setShowCatForm(false);
    } catch (error) { console.error(error); alert("Failed to add category."); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await deleteDoc(doc(db, "categories", id)); setCatList(catList.filter(cat => cat.id !== id)); } catch (error) { console.error(error); }
  };

  const openAddSubCat = () => { setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImage(""); setSubCatMetaTitle(""); setSubCatMetaDesc(""); setShowSubCatForm(true); };
  
  const handleAddSubCategory = async () => {
    if (!subCatName || !selectedParentCat) return alert("Please fill required fields");
    const slug = subCatName.toLowerCase().replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "subcategories", slug), { parentId: selectedParentCat, name: subCatName, slug: slug, emoji: subCatEmoji || "📁", desc: subCatDesc, image: subCatImage, metaTitle: subCatMetaTitle, metaDesc: subCatMetaDesc });
      setSubCatList([...subCatList, { id: slug, parentId: selectedParentCat, name: subCatName, slug: slug, emoji: subCatEmoji || "📁", desc: subCatDesc, image: subCatImage, metaTitle: subCatMetaTitle, metaDesc: subCatMetaDesc }]);
      setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImage(""); setSubCatMetaTitle(""); setSubCatMetaDesc(""); setShowSubCatForm(false);
    } catch (error) { console.error(error); alert("Failed to add sub-category."); }
  };

  const handleDeleteSubCategory = async (id: string) => {
    try { await deleteDoc(doc(db, "subcategories", id)); setSubCatList(subCatList.filter(sub => sub.id !== id)); } catch (error) { console.error(error); }
  };

  const totalViews = blogList.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalFeatured = blogList.filter(b => b.isFeatured).length;
  const filteredSubCats = selectedParentCat ? subCatList.filter(sub => sub.parentId === selectedParentCat) : [];

  if (loadingAuth || (user && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-md p-8 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
          <p className="text-sm text-white/40 text-center mb-8">Enter credentials to access the panel</p>
          {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" required />
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" required />
            <button type="submit" className="w-full py-3 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <aside className="w-64 bg-[#111111] border-r border-white/5 p-6 hidden md:flex flex-col justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <button onClick={() => setTab("dashboard")} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "dashboard" ? "bg-[#6D28D9] text-white" : "text-white/60 hover:bg-white/5"}`}>Dashboard</button>
            <button onClick={() => setTab("blogs")} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "blogs" ? "bg-[#6D28D9] text-white" : "text-white/60 hover:bg-white/5"}`}>Manage Blogs</button>
            <button onClick={() => setTab("categories")} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "categories" ? "bg-[#6D28D9] text-white" : "text-white/60 hover:bg-white/5"}`}>Main Categories</button>
            <button onClick={() => setTab("subcategories")} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "subcategories" ? "bg-[#6D28D9] text-white" : "text-white/60 hover:bg-white/5"}`}>Sub-Categories</button>
          </nav>
        </div>
        <div className="pt-6 border-t border-white/5 space-y-3">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 transition">🚪 Logout</button>
          <Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition">← Back to Site</Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {tab === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <button onClick={handleLoadDefaults} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition">📥 Load Default Data</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-[#111111] p-6 rounded-2xl border border-white/5"><p className="text-white/40 text-sm">Total Blogs</p><p className="text-3xl font-bold mt-2">{blogList.length}</p></div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-white/5"><p className="text-white/40 text-sm">Featured</p><p className="text-3xl font-bold mt-2 text-[#6D28D9]">{totalFeatured}</p></div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-white/5"><p className="text-white/40 text-sm">Main Cats</p><p className="text-3xl font-bold mt-2">{catList.length}</p></div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-white/5"><p className="text-white/40 text-sm">Sub-Cats</p><p className="text-3xl font-bold mt-2">{subCatList.length}</p></div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-white/5"><p className="text-white/40 text-sm">Total Views</p><p className="text-3xl font-bold mt-2">{totalViews}</p></div>
            </div>
            <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 mt-8">
              <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Google Analytics (GA4)</h2><span className="text-[10px] px-2 py-1 bg-[#4ADE80]/10 text-[#4ADE80] rounded-full">Connected</span></div>
              <p className="text-sm text-white/40 mb-4">Tracking ID: G-2R825E04J8 (Replace in layout.tsx)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-white/40">Today</p><p className="text-2xl font-bold mt-1">342</p></div>
                <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-white/40">Pageviews</p><p className="text-2xl font-bold mt-1">1,205</p></div>
                <div className="bg-white/5 p-4 rounded-xl text-center"><p className="text-xs text-white/40">Bounce</p><p className="text-2xl font-bold mt-1">42%</p></div>
              </div>
            </div>
          </div>
        )}

        {tab === "blogs" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">All Blogs ({blogList.length})</h1>
              <button onClick={openAddBlog} className="px-4 py-2 bg-[#6D28D9] rounded-lg text-sm font-medium hover:bg-[#5B21B6]">+ Add Blog</button>
            </div>
            <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-white/5 text-white/40"><tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Featured</th><th className="p-4">Actions</th></tr></thead>
                <tbody>
                  {blogList.map(blog => (
                    <tr key={blog.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-medium">{blog.title}</td>
                      <td className="p-4 capitalize text-white/60">{blog.category}</td>
                      <td className="p-4">
                        {blog.isFeatured ? <span className="px-2 py-0.5 bg-[#6D28D9]/20 text-[#6D28D9] text-[10px] font-bold rounded-full">⭐ Featured</span> : <span className="text-white/20 text-xs">—</span>}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => openEditBlog(blog)} className="px-3 py-1 bg-white/5 rounded text-xs hover:bg-white/10">Edit</button>
                        <button onClick={() => handleDeleteBlog(blog.id)} className="px-3 py-1 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Main Categories ({catList.length})</h1>
              <button onClick={() => setShowCatForm(true)} className="px-4 py-2 bg-[#6D28D9] rounded-lg text-sm font-medium hover:bg-[#5B21B6]">+ Add Category</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {catList.map(cat => (
                <div key={cat.id} className="bg-[#111111] rounded-xl border border-white/5 overflow-hidden group">
                  <div className="h-28 bg-white/5 flex items-center justify-center relative overflow-hidden">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl">{cat.emoji}</span>}
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-semibold">{cat.name}</p>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="mt-3 px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px] hover:bg-red-500/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "subcategories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Sub-Categories</h1>
              <button onClick={openAddSubCat} disabled={!selectedParentCat} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedParentCat ? "bg-[#6D28D9] hover:bg-[#5B21B6]" : "bg-white/5 text-white/20 cursor-not-allowed"}`}>+ Add Sub-Category</button>
            </div>
            <div className="mb-8">
              <label className="text-xs text-white/40 block mb-2">Select Parent Category</label>
              <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full md:w-1/2 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-white">
                <option value="">-- Select Parent Category --</option>
                {catList.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
              </select>
            </div>
            {selectedParentCat ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredSubCats.map(sub => (
                  <div key={sub.id} className="bg-[#111111] rounded-xl border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                    <div className="h-24 bg-white/5 flex items-center justify-center overflow-hidden">
                      {sub.image ? <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{sub.emoji}</span>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-semibold text-sm">{sub.name}</p><p className="text-[10px] text-white/40 mt-0.5">{sub.desc}</p></div>
                        <button onClick={() => handleDeleteSubCategory(sub.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#111111] rounded-2xl border border-white/5"><span className="text-4xl block mb-4">☝️</span><p className="text-white/40">Please select a Parent Category first.</p></div>
            )}
          </div>
        )}
      </main>

      {/* ========= BLOG MODAL ========= */}
      {showBlogForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-10 overflow-y-auto pb-10">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Blog" : "Add New Blog"}</h2>
            <div className="space-y-4">
              <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title *" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <select value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-white">
                {catList.map(cat => <option key={cat.id} value={cat.slug} className="bg-[#111]">{cat.emoji} {cat.name}</option>)}
              </select>
              <select value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-white disabled:opacity-40" disabled={availableSubCats.length === 0}>
                {availableSubCats.length > 0 ? (
                  <><option value="" className="bg-[#111]">-- Select Sub-Category (Optional) --</option>{availableSubCats.map(sub => <option key={sub.id} value={sub.slug} className="bg-[#111]">{sub.emoji} {sub.name}</option>)}</>
                ) : (<option value="" className="bg-[#111]">No sub-categories</option>)}
              </select>
              <input type="text" value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary (For Homepage)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/10">
                <div><p className="text-sm font-medium">⭐ Show in Featured</p></div>
                <button type="button" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-white/10'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${blogFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* CONTENT PART 1 */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 1</p>
                <textarea rows={5} value={blogContent1} onChange={(e) => setBlogContent1(e.target.value)} placeholder="Write Part 1 of your blog here..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] resize-y" />
                <input type="text" value={blogImage1} onChange={(e) => setBlogImage1(e.target.value)} placeholder="Image 1 URL (Optional - Shows after Part 1)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>

              {/* CONTENT PART 2 */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 2</p>
                <textarea rows={5} value={blogContent2} onChange={(e) => setBlogContent2(e.target.value)} placeholder="Write Part 2 of your blog here..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] resize-y" />
                <input type="text" value={blogImage2} onChange={(e) => setBlogImage2(e.target.value)} placeholder="Image 2 URL (Optional - Shows after Part 2)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>

              {/* CONTENT PART 3 */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">📝 Part 3</p>
                <textarea rows={5} value={blogContent3} onChange={(e) => setBlogContent3(e.target.value)} placeholder="Write Part 3 of your blog here..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] resize-y" />
                <input type="text" value={blogImage3} onChange={(e) => setBlogImage3(e.target.value)} placeholder="Image 3 URL (Optional - Shows after Part 3)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>

              {/* SEO SECTION */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} placeholder="Meta Title (50-60 chars)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
                <input type="text" value={blogMetaDesc} onChange={(e) => setBlogMetaDesc(e.target.value)} placeholder="Meta Description (150-160 chars)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
                <input type="text" value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} placeholder="Keywords (comma separated)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowBlogForm(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10">Cancel</button>
              <button onClick={handleSaveBlog} className="flex-1 py-2.5 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingId ? "Update" : "Publish"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========= CATEGORY MODAL ========= */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add Main Category</h2>
            <div className="space-y-4">
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name *" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catEmoji} onChange={(e) => setCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="Image URL (Overrides Emoji)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <div className="space-y-3 pt-2 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={catMetaTitle} onChange={(e) => setCatMetaTitle(e.target.value)} placeholder="Category Meta Title" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
                <input type="text" value={catMetaDesc} onChange={(e) => setCatMetaDesc(e.target.value)} placeholder="Category Meta Description" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => {setShowCatForm(false); setCatImage("");}} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10">Cancel</button>
              <button onClick={handleAddCategory} className="flex-1 py-2.5 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ========= SUB-CATEGORY MODAL ========= */}
      {showSubCatForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add Sub-Category</h2>
            <div className="space-y-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40">Parent Category</p>
                <p className="text-sm font-medium">{catList.find(c => c.id === selectedParentCat)?.emoji} {catList.find(c => c.id === selectedParentCat)?.name}</p>
              </div>
              <input type="text" value={subCatName} onChange={(e) => setSubCatName(e.target.value)} placeholder="Sub-Category Name *" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatEmoji} onChange={(e) => setSubCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatDesc} onChange={(e) => setSubCatDesc(e.target.value)} placeholder="Short description" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatImage} onChange={(e) => setSubCatImage(e.target.value)} placeholder="Image URL (Overrides Emoji)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              <div className="space-y-3 pt-2 border-t border-white/5">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={subCatMetaTitle} onChange={(e) => setSubCatMetaTitle(e.target.value)} placeholder="Sub-Category Meta Title" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
                <input type="text" value={subCatMetaDesc} onChange={(e) => setSubCatMetaDesc(e.target.value)} placeholder="Sub-Category Meta Description" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => {setShowSubCatForm(false); setSubCatImage("");}} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10">Cancel</button>
              <button onClick={handleAddSubCategory} className="flex-1 py-2.5 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6]">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}