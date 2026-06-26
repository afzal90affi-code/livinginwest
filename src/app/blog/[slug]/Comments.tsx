"use client";
import { useState, useEffect, useRef } from 'react';
import { client } from "@/lib/sanityClient";
import { MessageCircle, Reply, Send, ChevronDown, ChevronUp, User } from 'lucide-react';

type CommentType = {
  _id: string;
  name: string;
  text: string;
  createdAt: string | null;
  replies?: CommentType[];
};

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

export default function Comments({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const replyInputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    const commentsQuery = `*[_type == "comment" && blog._ref == $blogId && !defined(parentComment)] | order(createdAt asc) {
      _id, name, text, createdAt,
      "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
        _id, name, text, createdAt
      }
    }`;
    return await client.fetch(commentsQuery, { blogId });
  };

  useEffect(() => {
    const loadComments = async () => {
      setCommentLoading(true);
      try {
        setComments(await fetchComments());
      } catch (error) { console.error(error); }
      finally { setCommentLoading(false); }
    };
    loadComments();
  }, [blogId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    try {
      setSubmitting(true);
      await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: commentName.trim(), text: commentText.trim(), blogId }),
      });
      setCommentName("");
      setCommentText("");
      setComments(await fetchComments());
    } catch (error) { console.error(error); }
    finally { setSubmitting(false); }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyName.trim() || !replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: replyName.trim(), text: replyText.trim(), blogId, parentCommentId: parentId }),
      });
      setReplyName("");
      setReplyText("");
      setReplyingTo(null);
      setExpandedReplies(prev => new Set(prev).add(parentId));
      setComments(await fetchComments());
    } catch (error) { console.error(error); }
    finally { setSubmittingReply(false); }
  };

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

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="border-t border-gray-200 pt-16 mt-16">
      <div className="flex items-center gap-3 mb-10">
        <MessageCircle className="w-5 h-5 text-gray-900" />
        <h2 className="text-2xl md:text-3xl font-playfair font-bold tracking-tight">Comments</h2>
        <span className="ml-1 px-2.5 py-0.5 bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-full">{totalComments}</span>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-14 bg-white border border-gray-200 p-6 md:p-8">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">Leave a comment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Your name *" value={commentName} onChange={e => setCommentName(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 focus:outline-none focus:border-gray-900" />
          <div />
        </div>
        <textarea placeholder="Write your comment... *" value={commentText} onChange={e => setCommentText(e.target.value)} required rows={4} className="w-full px-4 py-3 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 focus:outline-none focus:border-gray-900 resize-none mb-4" />
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs uppercase tracking-[0.15em] font-bold hover:bg-gray-800 disabled:opacity-50">
            <Send className="w-3.5 h-3.5" /> {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {commentLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full"></div></div>
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
                <div className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white flex items-center justify-center text-sm font-bold uppercase">{comment.name?.charAt(0) || <User className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{comment.name}</span>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">{formatCommentDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => handleReplyClick(comment._id)} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900"><Reply className="w-3.5 h-3.5" /> Reply</button>
                        {hasReplies && <button onClick={() => toggleReplies(comment._id)} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900">{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}</button>}
                      </div>
                      {replyingTo === comment._id && (
                        <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input ref={replyInputRef} type="text" placeholder="Your name *" value={replyName} onChange={e => setReplyName(e.target.value)} required className="flex-shrink-0 sm:w-48 px-4 py-2.5 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 focus:outline-none focus:border-gray-900" />
                            <input type="text" placeholder="Write a reply... *" value={replyText} onChange={e => setReplyText(e.target.value)} required className="flex-1 px-4 py-2.5 border border-gray-200 bg-[#FAFAFA] text-sm text-gray-900 focus:outline-none focus:border-gray-900" />
                            <button type="submit" disabled={submittingReply} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-[11px] uppercase tracking-wider font-bold hover:bg-gray-800 disabled:opacity-50"><Send className="w-3 h-3" /> {submittingReply ? "..." : "Reply"}</button>
                            <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-2.5 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900">Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
                {hasReplies && isExpanded && (
                  <div className="ml-14 border-l-2 border-gray-100 pl-6 pb-4 space-y-0">
                    {comment.replies!.map((reply) => (
                      <div key={reply._id} className="py-4 border-b border-gray-50 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold uppercase">{reply.name?.charAt(0) || <User className="w-3 h-3" />}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900">{reply.name}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{formatCommentDate(reply.createdAt)}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{reply.text}</p>
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
  );
}