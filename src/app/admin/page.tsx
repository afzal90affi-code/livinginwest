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
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [blogList, setBlogList] = useState<any[]>([]);
  const [catList, setCatList] = useState<any[]>([]);
  const [subCatList, setSubCatList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubCatForm, setShowSubCatForm] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);

  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("food");
  const [blogSubCategory, setBlogSubCategory] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
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

  // --- BLOG FUNCTIONS ---
  const openAddBlog = () => {
    setEditingId(null);
    setBlogTitle(""); setBlogCategory(catList.length > 0 ? catList[0].slug : "food"); setBlogSubCategory("");
    setBlogDesc(""); setBlogContent1(""); setBlogImage1(""); setBlogContent2(""); setBlogImage2(""); setBlogContent3(""); setBlogImage3("");
    setBlogFeatured(false); setBlogMetaTitle(""); setBlogMetaDesc(""); setBlogKeywords("");
    setShowBlogForm(true);
  };

  const openEditBlog = (blog: any) => {
    setEditingId(blog.id);
    setBlogTitle(blog.title); setBlogCategory(blog.category); setBlogSubCategory(blog.subCategory || "");
    setBlogDesc(blog.desc || ""); setBlogContent1(blog.content1 || ""); setBlogImage1(blog.img1 || "");
    setBlogContent2(blog.content2 || ""); setBlogImage2(blog.img2 || "");
    setBlogContent3(blog.content3 || ""); setBlogImage3(blog.img3 || "");
    setBlogFeatured(blog.isFeatured); setBlogMetaTitle(blog.metaTitle || ""); setBlogMetaDesc(blog.metaDesc || ""); setBlogKeywords(blog.keywords || "");
    setShowBlogForm(true);
  };

  const handleCategoryChange = (slug: string) => { setBlogCategory(slug); setBlogSubCategory(""); };

  const handleSaveBlog = async () => {
    if (!blogTitle) return;
    const blogData = { 
      title: blogTitle, category: blogCategory, subCategory: blogSubCategory, isFeatured: blogFeatured, desc: blogDesc, 
      content1: blogContent1, img1: blogImage1, content2: blogContent2, img2: blogImage2, content3: blogContent3, img3: blogImage3,
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

  // --- CATEGORY FUNCTIONS ---
  const openAddCategory = () => {
    setEditingCatId(null); setCatName(""); setCatEmoji(""); setCatImage(""); setCatMetaTitle(""); setCatMetaDesc(""); setShowCatForm(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCatId(cat.id); setCatName(cat.name); setCatEmoji(cat.emoji); setCatImage(cat.image || ""); 
    setCatMetaTitle(cat.metaTitle || ""); setCatMetaDesc(cat.metaDesc || ""); setShowCatForm(true);
  };

  const handleSaveCategory = async () => {
    if (!catName) return alert("Please enter a category name");
    const slug = editingCatId ? editingCatId : catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = { name: catName, slug: slug, emoji: catEmoji || "📁", image: catImage, metaTitle: catMetaTitle, metaDesc: catMetaDesc };
    try {
      if (editingCatId) {
        await updateDoc(doc(db, "categories", editingCatId), data);
        setCatList(catList.map(c => c.id === editingCatId ? { ...c, ...data } : c));
      } else {
        await setDoc(doc(db, "categories", slug), data);
        setCatList([...catList, { id: slug, ...data }]);
      }
      setCatName(""); setCatEmoji(""); setCatImage(""); setCatMetaTitle(""); setCatMetaDesc(""); setEditingCatId(null); setShowCatForm(false);
    } catch (error) { console.error(error); alert("Failed to save category."); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await deleteDoc(doc(db, "categories", id)); setCatList(catList.filter(cat => cat.id !== id)); } catch (error) { console.error(error); }
  };

  // --- SUB-CATEGORY FUNCTIONS ---
  const openAddSubCat = () => { 
    setEditingSubCatId(null); setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImage(""); setSubCatMetaTitle(""); setSubCatMetaDesc(""); setShowSubCatForm(true); 
  };

  const openEditSubCat = (sub: any) => {
    setEditingSubCatId(sub.id); setSelectedParentCat(sub.parentId); setSubCatName(sub.name); setSubCatEmoji(sub.emoji); setSubCatDesc(sub.desc || ""); setSubCatImage(sub.image || "");
    setSubCatMetaTitle(sub.metaTitle || ""); setSubCatMetaDesc(sub.metaDesc || ""); setShowSubCatForm(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCatName || !selectedParentCat) return alert("Please fill required fields");
    const slug = editingSubCatId ? editingSubCatId : subCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = { parentId: selectedParentCat, name: subCatName, slug: slug, emoji: subCatEmoji || "📁", desc: subCatDesc, image: subCatImage, metaTitle: subCatMetaTitle, metaDesc: subCatMetaDesc };
    try {
      if (editingSubCatId) {
        await updateDoc(doc(db, "subcategories", editingSubCatId), data);
        setSubCatList(subCatList.map(s => s.id === editingSubCatId ? { ...s, ...data } : s));
      } else {
        await setDoc(doc(db, "subcategories", slug), data);
        setSubCatList([...subCatList, { id: slug, ...data }]);
      }
      setSubCatName(""); setSubCatEmoji(""); setSubCatDesc(""); setSubCatImage(""); setSubCatMetaTitle(""); setSubCatMetaDesc(""); setEditingSubCatId(null); setShowSubCatForm(false);
    } catch (error) { console.error(error); alert("Failed to save sub-category."); }
  };

  const handleDeleteSubCategory = async (id: string) => {
    try { await deleteDoc(doc(db, "subcategories", id)); setSubCatList(subCatList.filter(sub => sub.id !== id)); } catch (error) { console.error(error); }
  };

  const totalViews = blogList.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalFeatured = blogList.filter(b => b.isFeatured).length;
  const filteredSubCats = selectedParentCat ? subCatList.filter(sub => sub.parentId === selectedParentCat) : [];

  if (loadingAuth || (user && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Admin Login</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Enter credentials to access the panel</p>
          {authError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" required />
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" required />
            <button type="submit" className="w-full py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative bg-gray-50 text-gray-900">
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between shadow-sm`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-playfair text-xl font-bold text-[#1e3a8a]">Admin Panel</h2>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900">✕</button>
          </div>
          <nav className="space-y-2">
            <button onClick={() => {setTab("dashboard"); setMobileOpen(false)}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "dashboard" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Dashboard</button>
            <button onClick={() => {setTab("blogs"); setMobileOpen(false)}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "blogs" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Manage Blogs</button>
            <button onClick={() => {setTab("categories"); setMobileOpen(false)}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "categories" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Main Categories</button>
            <button onClick={() => {setTab("subcategories"); setMobileOpen(false)}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition ${tab === "subcategories" ? "bg-[#6D28D9] text-white" : "text-gray-700 hover:bg-gray-100"}`}>Sub-Categories</button>
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition">🚪 Logout</button>
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">← Back to Site</Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full md:w-auto">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <h2 className="font-playfair text-lg font-bold text-[#1e3a8a]">Admin Panel</h2>
          <button onClick={() => setMobileOpen(true)} className="text-2xl text-gray-600 hover:text-gray-900">☰</button>
        </div>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {tab === "dashboard" && (
             <div>
               <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                 <button onClick={handleLoadDefaults} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm hover:bg-gray-50 transition shadow-sm">📥 Load Default Data</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Total Blogs</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{blogList.length}</p></div>
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Featured</p><p className="text-2xl md:text-3xl font-bold mt-2 text-[#6D28D9]">{totalFeatured}</p></div>
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Main Cats</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{catList.length}</p></div>
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-500 text-xs md:text-sm">Sub-Cats</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{subCatList.length}</p></div>
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-1"><p className="text-gray-500 text-xs md:text-sm">Total Views</p><p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">{totalViews}</p></div>
               </div>
             </div>
          )}

          {tab === "blogs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Blogs ({blogList.length})</h1>
                <button onClick={openAddBlog} className="px-3 py-2 md:px-4 md:py-2 bg-[#6D28D9] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#5B21B6] shadow-sm">+ Add</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
                <table className="w-full text-sm text-left min-w-[500px]">
                  <thead className="border-b border-gray-100 text-gray-500 bg-gray-50"><tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Featured</th><th className="p-4">Actions</th></tr></thead>
                  <tbody>
                    {blogList.map(blog => (
                      <tr key={blog.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{blog.title}</td>
                        <td className="p-4 capitalize text-gray-600">{blog.category}</td>
                        <td className="p-4">
                          {blog.isFeatured ? <span className="px-2 py-0.5 bg-[#6D28D9]/10 text-[#6D28D9] text-[10px] font-bold rounded-full">⭐ Featured</span> : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openEditBlog(blog)} className="px-3 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">Edit</button>
                          <button onClick={() => handleDeleteBlog(blog.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">Delete</button>
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
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories ({catList.length})</h1>
                <button onClick={openAddCategory} className="px-3 py-2 md:px-4 md:py-2 bg-[#6D28D9] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#5B21B6] shadow-sm">+ Add</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {catList.map(cat => (
                  <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-24 md:h-28 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                      {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-3xl md:text-4xl">{cat.emoji}</span>}
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <button onClick={() => openEditCategory(cat)} className="px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-700 hover:bg-gray-200">Edit</button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] hover:bg-red-100">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "subcategories" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sub-Categories</h1>
                <button onClick={openAddSubCat} disabled={!selectedParentCat} className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium ${selectedParentCat ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>+ Add</button>
              </div>
              <div className="mb-8">
                <label className="text-xs text-gray-500 block mb-2">Select Parent Category</label>
                <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full md:w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900 shadow-sm">
                  <option value="">-- Select Parent Category --</option>
                  {catList.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
                </select>
              </div>
              
              {selectedParentCat ? (
                filteredSubCats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredSubCats.map(sub => (
                      <div key={sub.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                        <div className="h-20 md:h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {sub.image ? <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{sub.emoji}</span>}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div><p className="font-semibold text-sm text-gray-900">{sub.name}</p><p className="text-[10px] text-gray-500 mt-0.5">{sub.desc}</p></div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditSubCat(sub)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">✏️</button>
                              <button onClick={() => handleDeleteSubCategory(sub.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-4xl block mb-4">🚀</span>
                    <p className="text-gray-500 text-sm">No sub-categories found for this category.</p>
                    <p className="text-gray-400 text-xs mt-2">Click "+ Add" button above to create one.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-4xl block mb-4">☝️</span><p className="text-gray-500">Please select a Parent Category first.</p></div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========= MODALS ========= */}
      {showBlogForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 pt-10 overflow-y-auto pb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl mx-4">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingId ? "Edit Blog" : "Add New Blog"}</h2>
            <div className="space-y-4">
              <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <select value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900">
                {catList.map(cat => <option key={cat.id} value={cat.slug}>{cat.emoji} {cat.name}</option>)}
              </select>
              <select value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900 disabled:opacity-50" disabled={availableSubCats.length === 0}>
                {availableSubCats.length > 0 ? (
                  <><option value="">-- Select Sub-Category (Optional) --</option>{availableSubCats.map(sub => <option key={sub.id} value={sub.slug}>{sub.emoji} {sub.name}</option>)}</>
                ) : (<option value="">No sub-categories</option>)}
              </select>
              <input type="text" value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div><p className="text-sm font-medium text-gray-900">⭐ Show in Featured</p></div>
                <button type="button" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-100"><p className="text-xs text-[#6D28D9] font-bold">📝 Part 1</p><textarea rows={4} value={blogContent1} onChange={(e) => setBlogContent1(e.target.value)} placeholder="Write Part 1..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] resize-y" /><input type="text" value={blogImage1} onChange={(e) => setBlogImage1(e.target.value)} placeholder="Image 1 URL (Optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" /></div>
              <div className="space-y-3 pt-4 border-t border-gray-100"><p className="text-xs text-[#6D28D9] font-bold">📝 Part 2</p><textarea rows={4} value={blogContent2} onChange={(e) => setBlogContent2(e.target.value)} placeholder="Write Part 2..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] resize-y" /><input type="text" value={blogImage2} onChange={(e) => setBlogImage2(e.target.value)} placeholder="Image 2 URL (Optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" /></div>
              <div className="space-y-3 pt-4 border-t border-gray-100"><p className="text-xs text-[#6D28D9] font-bold">📝 Part 3</p><textarea rows={4} value={blogContent3} onChange={(e) => setBlogContent3(e.target.value)} placeholder="Write Part 3..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] resize-y" /><input type="text" value={blogImage3} onChange={(e) => setBlogImage3(e.target.value)} placeholder="Image 3 URL (Optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" /></div>
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

      {showCatForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingCatId ? "Edit Category" : "Add Main Category"}</h2>
            <div className="space-y-4">
              <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category Name *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catEmoji} onChange={(e) => setCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="Image URL (Overrides Emoji)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={catMetaTitle} onChange={(e) => setCatMetaTitle(e.target.value)} placeholder="Category Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
                <input type="text" value={catMetaDesc} onChange={(e) => setCatMetaDesc(e.target.value)} placeholder="Category Meta Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => {setShowCatForm(false); setCatImage(""); setEditingCatId(null);}} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveCategory} className="flex-1 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {showSubCatForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900">{editingSubCatId ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
            <div className="space-y-4">
              <select value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] text-gray-900">
                <option value="">-- Select Parent Category --</option>
                {catList.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
              </select>
              <input type="text" value={subCatName} onChange={(e) => setSubCatName(e.target.value)} placeholder="Sub-Category Name *" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatEmoji} onChange={(e) => setSubCatEmoji(e.target.value)} placeholder="Emoji (Fallback)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatDesc} onChange={(e) => setSubCatDesc(e.target.value)} placeholder="Short Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <input type="text" value={subCatImage} onChange={(e) => setSubCatImage(e.target.value)} placeholder="Image URL (Optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-[#6D28D9] font-bold">🔍 SEO Optimization</p>
                <input type="text" value={subCatMetaTitle} onChange={(e) => setSubCatMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
                <input type="text" value={subCatMetaDesc} onChange={(e) => setSubCatMetaDesc(e.target.value)} placeholder="Meta Description" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => {setShowSubCatForm(false); setEditingSubCatId(null);}} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveSubCategory} className="flex-1 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-medium hover:bg-[#5B21B6]">{editingSubCatId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}