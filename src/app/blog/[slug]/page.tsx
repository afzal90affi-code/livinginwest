"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageCircle, Reply, Send, ChevronDown, ChevronUp, User } from 'lucide-react';
import { client } from "@/lib/sanityClient";
import { urlFor } from "@/lib/sanityImage";
import BlogAudioPlayer from '@/components/BlogAudioPlayer';

// ─── Types ──────────────────────────────────────────────────
interface SanityImage {
  asset?: { _ref: string; url?: string };
  url?: string;
}

interface BlogCategory {
  title: string;
  slug: string;
}

interface BlogData {
  _id: string;
  title: string;
  category?: BlogCategory | null;
  subCategory?: BlogCategory | null;
  desc?: string;
  date?: string;
  mainImage?: SanityImage;
  img2?: SanityImage;
  img3?: SanityImage;
  content1?: string;
  content2?: string;
  content3?: string;
}

// ─── Comment Type ────────────────────────────────────────────
type CommentType = {
  _id: string;
  name: string;
  text: string;
  createdAt: string | null;
  replies?: CommentType[];
};

// ─── Format Date Helper ─────────────────────────────────────
function formatCommentDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Comment States ─────────────────────────────────────
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ─── Reply States ───────────────────────────────────────
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // ─── Show Replies Toggle ────────────────────────────────
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const replyInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Blog & Comments from Sanity ──────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCommentLoading(true);
      try {
        // 1. Fetch Blog Data using GROQ
        const blogQuery = `*[_type == "blog" && slug.current == $slug][0] {
          _id, title, "category": category-> { title, "slug": slug.current }, "subCategory": subCategory-> { title, "slug": slug.current }, desc, date,
          mainImage, img2, img3, content1, content2, content3
        }`;
        const blogData = await client.fetch(blogQuery, { slug: params.slug });
        setBlog(blogData);

        // 2. Fetch Comments with Nested Replies (Sanity GROQ Magic)
        if (blogData) {
          const commentsQuery = `*[_type == "comment" && blog._ref == $blogId && !defined(parentComment)] | order(createdAt asc) {
            _id, name, text, createdAt,
            "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
              _id, name, text, createdAt
            }
          }`;
          const commentsData = await client.fetch(commentsQuery, { blogId: blogData._id });
          setComments(commentsData);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); setCommentLoading(false); }
    };
    fetchData();
  }, [params.slug]);

  // ─── Submit Top-Level Comment via API Route ─────────────
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !blog?._id) return;
    try {
      setSubmitting(true);
      await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: commentName.trim(), text: commentText.trim(), blogId: blog._id }),
      });
      setCommentName("");
      setCommentText("");
      
      // Refresh comments
      const commentsQuery = `*[_type == "comment" && blog._ref == $blogId && !defined(parentComment)] | order(createdAt asc) {
        _id, name, text, createdAt, "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) { _id, name, text, createdAt }
      }`;
      setComments(await client.fetch(commentsQuery, { blogId: blog._id }));
    } catch (error) { console.error(error); }
    finally { setSubmitting(false); }
  };

  // ─── Submit Reply via API Route ─────────────────────────
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyName.trim() || !replyText.trim() || !blog?._id) return;
    try {
      setSubmittingReply(true);
      await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: replyName.trim(), text: replyText.trim(), blogId: blog._id, parentCommentId: parentId }),
      });
      setReplyName("");
      setReplyText("");
      setReplyingTo(null);
      setExpandedReplies(prev => new Set(prev).add(parentId));
      
      // Refresh comments
      const commentsQuery = `*[_type == "comment" && blog._ref == $blogId && !defined(parentComment)] | order(createdAt asc) {
        _id, name, text, createdAt, "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) { _id, name, text, createdAt }
      }`;
      setComments(await client.fetch(commentsQuery, { blogId: blog._id }));
    } catch (error) { console.error(error); }
    finally { setSubmittingReply(false); }
  };

  // ─── Toggle Reply Box ───────────────────────────────────
  const handleReplyClick = (commentId: string) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo(commentId);
      setReplyName("");
      setReplyText("");
      setTimeout(() => replyInputRef.current?.focus(), 100);
    }
  };

  // ─── Toggle Expand Replies ──────────────────────────────
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // ─── Total Comment Count ────────────────────────────────
  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  // Audio Player k liye paragraphs ko ek single text plain string m convert karne ka helper
  const fullBlogText = [blog?.content1, blog?.content2, blog?.content3].filter(Boolean).join(" ");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="animate-spin h-10 w-10 border-2 border-gray-900 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <p className="text-gray-500 uppercase tracking-widest text-sm">Story not found</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-12">
          <Link href={`/category/${blog.category?.slug}`} className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {blog.category?.title || blog.category?.slug}
          </Link>
          <span className="text-xs uppercase tracking-widest text-gray-400">
            {blog.date ? new Date(blog.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block px-3 py-1 border border-gray-200 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-6">
            {blog.subCategory?.title || blog.category?.title}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            {blog.title}
          </h1>
          {blog.desc && <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{blog.desc}</p>}
        </div>
        
        {/* Hero Image (Optimized with Next/Image) */}
        {blog.mainImage && (
          <div className="mb-12 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image 
              src={urlFor(blog.mainImage).width(1200).height(650).auto('format').url()} 
              alt={blog.title} 
              fill 
              className="object-cover object-top" 
              priority 
            />
          </div>
        )}

        {/* 🎧 AI VOICE AUDIO NARRATOR WIDGET PLACEMENT */}
        <div className="mb-12 flex justify-center">
          <BlogAudioPlayer title={blog.title} content={fullBlogText} />
        </div>

        {/* Content Part 1 */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter">
          {blog.content1 && blog.content1.split('\n').map((p: string, i: number) => <p key={i} className="mb-6">{p}</p>)}
        </div>

        {/* Middle Image */}
        {blog.img2 && (
          <div className="my-16 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image src={urlFor(blog.img2).width(1200).auto('format').url()} alt="Article image 2" fill className="object-cover" />
          </div>
        )}

        {/* Content Part 2 */}
        {blog.content2 && (
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter">
            {blog.content2.split('\n').map((p: string, i: number) => <p key={i} className="mb-6">{p}</p>)}
          </div>
        )}

        {/* Ad Space */}
        <div className="my-16 w-full h-24 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">
          Advertisement
        </div>

        {/* Last Image */}
        {blog.img3 && (
          <div className="my-16 overflow-hidden border border-gray-200 bg-gray-50 relative aspect-video">
            <Image src={urlFor(blog.img3).width(1200).auto('format').url()} alt="Article image 3" fill className="object-cover" />
          </div>
        )}

        {/* Content Part 3 */}
        {blog.content3 && (
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 font-inter">
            {blog.content3.split('\n').map((p: string, i: number) => <p key={i} className="mb-6">{p}</p>)}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            COMMENT SECTION
        ═══════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-200 pt-16 mt-16">

          {/* Section Heading */}
          <div className="flex items-center gap-3 mb-10">
            <MessageCircle className="w-5 h-5 text-gray-900" />
            <h2 className="text-2xl md:text-3xl font-playfair font-bold tracking-tight">
              Comments
            </h2>
            <span className="ml-1 px-2.5 py-0.5 bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
              {totalComments}
            </span>
          </div>

          {/* ── Add Comment Form ────────────────────────────── */}
          <form onSubmit={handleSubmitComment} className="mb-14 bg-white border border-gray-200 p-6 md:p-8">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">Leave a comment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                id="comment-name"
                name="name"
                type="text"
                placeholder="Your name *"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
              />
              <div />
            </div>
            <textarea
              id="comment-text"
              name="text"
              placeholder="Write your comment... *"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-none mb-4"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs uppercase tracking-[0.15em] font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {/* ── Comments List ───────────────────────────────── */}
          {commentLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-300 bg-white">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-400 uppercase tracking-widest">No comments yet</p>
              <p className="text-xs text-gray-300 mt-1">Be the first to share your thoughts</p>
            </div>
          ) : (
            <div className="space-y-0">
              {comments.map((comment) => {
                const hasReplies = comment.replies && comment.replies.length > 0;
                const isExpanded = expandedReplies.has(comment._id);

                return (
                  <div key={comment._id} className="border-b border-gray-100 last:border-b-0">

                    {/* ── Single Comment ─────────────────── */}
                    <div className="py-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white flex items-center justify-center text-sm font-bold uppercase">
                          {comment.name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{comment.name}</span>
                            <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                              {formatCommentDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {comment.text}
                          </p>

                          {/* Action Row */}
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => handleReplyClick(comment._id)}
                              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              Reply
                            </button>
                            {hasReplies && (
                              <button
                                onClick={() => toggleReplies(comment._id)}
                                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
                              </button>
                            )}
                          </div>

                          {/* ── Reply Input Box ─────────────── */}
                          {replyingTo === comment._id && (
                            <form
                              onSubmit={(e) => handleSubmitReply(e, comment._id)}
                              className="mt-4 pt-4 border-t border-gray-100"
                            >
                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                  ref={replyInputRef}
                                  id={`reply-name-${comment._id}`}
                                  name="replyName"
                                  type="text"
                                  placeholder="Your name *"
                                  value={replyName}
                                  onChange={e => setReplyName(e.target.value)}
                                  required
                                  className="flex-shrink-0 sm:w-48 px-4 py-2.5 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                                />
                                <input
                                  id={`reply-text-${comment._id}`}
                                  name="replyText"
                                  type="text"
                                  placeholder="Write a reply... *"
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  required
                                  className="flex-1 px-4 py-2.5 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                                />
                                <button
                                  type="submit"
                                  disabled={submittingReply}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-[11px] uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                  <Send className="w-3 h-3" />
                                  {submittingReply ? "..." : "Reply"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(null)}
                                  className="px-3 py-2.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Replies List ────────────────────── */}
                    {hasReplies && isExpanded && (
                      <div className="ml-14 border-l-2 border-gray-100 pl-6 pb-4 space-y-0">
                        {comment.replies!.map((reply) => (
                          <div key={reply._id} className="py-4 border-b border-gray-50 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold uppercase">
                                {reply.name?.charAt(0) || <User className="w-3 h-3" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-gray-900">{reply.name}</span>
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                    {formatCommentDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* ═══════════════════ COMMENT SECTION END ═══════════════════ */}

      </div>
    </main>
  );
}