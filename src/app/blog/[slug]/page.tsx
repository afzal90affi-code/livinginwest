"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, MessageCircle, Send } from 'lucide-react'; // Naye Icons
import { db } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, increment } from "firebase/firestore"; // Naye Firebase functions

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Likes & Comments States
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        // 1. Fetch Blog
        const docRef = doc(db, "blogs", params.slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Blog not found!");
        }

        // 2. Fetch Comments
        const commentsRef = collection(db, "blogs", params.slug, "comments");
        const commentsSnap = await getDocs(commentsRef);
        const commentsData = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Latest comments pehle dikhane ke liye sort
        setComments(commentsData.sort((a: any, b: any) => b.timestamp - a.timestamp));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchBlogAndComments();
  }, [params.slug]);

  // --- LIKE FUNCTION ---
  const handleLike = async () => {
    if (isLiked) return; // Ek baar hi like kar sakte hain
    try {
      const blogRef = doc(db, "blogs", params.slug);
      await updateDoc(blogRef, { likes: increment(1) }); // Firebase mein +1 karega
      setBlog((prev: any) => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
      setIsLiked(true);
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  // --- COMMENT FUNCTION ---
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return alert("Please fill name and comment");
    try {
      const newComment = { name: commentName, text: commentText, timestamp: Date.now() };
      await addDoc(collection(db, "blogs", params.slug, "comments"), newComment);
      setComments([newComment, ...comments]); // UI mein turant dikhana
      setCommentName("");
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-white/60 mb-8">Blog Not Found</p>
        <Link href="/" className="px-6 py-3 bg-[#6D28D9] rounded-lg text-sm font-medium hover:bg-[#5B21B6]">Go Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] py-12">
      <article className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="capitalize">{blog.category}</span>
          <span>/</span>
          <span className="text-white/80 truncate">{blog.title}</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#6D28D9]/20 text-[#6D28D9] text-xs font-bold rounded-full uppercase">{blog.category}</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight mb-4">{blog.title}</h1>
          {blog.desc && <p className="text-lg text-white/60 mb-6">{blog.desc}</p>}
          
          {/* ===== DATE, LIKES & COMMENTS BAR ===== */}
          <div className="flex items-center gap-6 border-t border-b border-white/5 py-4">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Calendar className="w-4 h-4 text-[#6D28D9]" />
              <span>{blog.date || "Unknown Date"}</span>
            </div>
            
            <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-white/50 hover:text-red-400'}`}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
              <span>{blog.likes || 0} Likes</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-white/50">
              <MessageCircle className="w-4 h-4 text-[#6D28D9]" />
              <span>{comments.length} Comments</span>
            </div>
          </div>
        </div>

        {/* ===== 3 PARTS CONTENT & IMAGES LAYOUT ===== */}
        <div className="text-white/80 leading-relaxed text-lg space-y-10 mb-16">
          {/* --- PART 1 --- */}
          {blog.content1 && <div className="whitespace-pre-line">{blog.content1}</div>}
          {blog.img1 && <div className="my-8 rounded-2xl overflow-hidden border border-white/10"><img src={blog.img1} alt="Part 1 Image" className="w-full h-auto object-cover" /></div>}

          {/* --- PART 2 --- */}
          {blog.content2 && <div className="whitespace-pre-line">{blog.content2}</div>}
          {blog.img2 && <div className="my-8 rounded-2xl overflow-hidden border border-white/10"><img src={blog.img2} alt="Part 2 Image" className="w-full h-auto object-cover" /></div>}

          {/* --- PART 3 --- */}
          {blog.content3 && <div className="whitespace-pre-line">{blog.content3}</div>}
          {blog.img3 && <div className="my-8 rounded-2xl overflow-hidden border border-white/10"><img src={blog.img3} alt="Part 3 Image" className="w-full h-auto object-cover" /></div>}
        </div>

        {/* ===== COMMENTS SECTION ===== */}
        <div className="border-t border-white/5 pt-10">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-[#6D28D9]" /> Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-10">
            <div className="mb-4">
              <input type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Your Name *" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9]" required />
            </div>
            <textarea rows={4} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write your comment here... *" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#6D28D9] resize-y mb-4" required></textarea>
            <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition-colors">
              <Send className="w-4 h-4" /> Post Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 && <p className="text-white/30 text-sm text-center">No comments yet. Be the first to comment!</p>}
            {comments.map((comment) => (
              <div key={comment.id || comment.timestamp} className="bg-[#111111] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#6D28D9]">{comment.name}</h4>
                  <span className="text-xs text-white/30">{new Date(comment.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-white/70 text-sm whitespace-pre-line">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="border-t border-white/5 pt-8 mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#6D28D9] hover:text-[#4ADE80] transition-colors font-medium">
            ← Back to Home
          </Link>
        </div>
      </article>
    </main>
  );
}