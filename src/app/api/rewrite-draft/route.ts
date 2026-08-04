import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@sanity/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const fallbackModels = [
  preferredModel,
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
].filter((value, index, arr) => value && arr.indexOf(value) === index);

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN || "",
  useCdn: false,
});

async function rewriteWithGemini(blog: { title: string; desc: string; content1?: string }) {
  let lastError: unknown = null;

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `You are an expert news editor. Rewrite the following news into a premium, highly engaging article.

      Original Title: "${blog.title}"
      Original Desc: "${blog.desc}"

      1. Rewrite the title to be catchy and SEO-friendly.
      2. Write a 3-paragraph article with <p> tags.

      Return STRICTLY in JSON format:
      {
        "newTitle": "...",
        "newDesc": "<p>Paragraph 1...</p><p>Paragraph 2...</p><p>Paragraph 3...</p>"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (!parsed.newTitle || !parsed.newDesc) {
        throw new Error('Gemini returned invalid JSON payload.');
      }

      return parsed;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini model attempt failed for ${modelName}:`, error);
    }
  }

  throw lastError || new Error('Gemini rewrite failed for all supported models.');
}

export async function POST(request: Request) {
  try {
    const { blogId } = await request.json();

    const blog = await sanityClient.fetch(`*[_type == "blog" && _id == $blogId][0]{
      title, desc, content1
    }`, { blogId });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const parsed = await rewriteWithGemini(blog);
    const newDesc = String(parsed.newDesc || blog.content1 || blog.desc || '');
    const cleanDesc = newDesc.replace(/<[^>]*>/g, '').trim();

    await sanityClient.patch(blogId).set({
      title: parsed.newTitle || blog.title,
      content1: parsed.newDesc || blog.content1,
      desc: cleanDesc.length > 150 ? `${cleanDesc.substring(0, 150)}...` : cleanDesc,
    }).commit();

    return NextResponse.json({ success: true, message: 'News rewritten successfully!' });
  } catch (error: any) {
    console.error('Rewrite Error:', error);
    return NextResponse.json({
      error: error.message || 'Unknown AI Error',
    }, { status: 500 });
  }
}