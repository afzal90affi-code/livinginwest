// app/api/comment/route.js
import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';

// Ye client sirf server pe chalta hai, isliye ye safe hai
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-01-01',
});

export async function POST(req) {
  try {
    const { name, text, blogId, parentCommentId } = await req.json();

    if (!name || !text || !blogId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newComment = {
      _type: 'comment',
      name,
      text,
      blog: { _type: 'reference', _ref: blogId },
      createdAt: new Date().toISOString(),
    };

    if (parentCommentId) {
      newComment.parentComment = { _type: 'reference', _ref: parentCommentId };
    }

    await writeClient.create(newComment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment API Error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}