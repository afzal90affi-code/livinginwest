import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@sanity/client';
import RssParser from 'rss-parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN || "", 
  useCdn: false,
});

const parser = new RssParser({ timeout: 10000 });

// USA States & Business Government RSS Feeds
const govFeeds = [
  // Governors
  'https://www.gov.ca.gov/feed/', // California
  'https://gov.texas.gov/news/rss', // Texas
  'https://www.governor.ny.gov/news/feed', // New York
  'https://www.mass.gov/feeds/rss/governors-press-office', // Massachusetts ✅ New
  'https://www.flgov.com/feed/', // Florida ✅ New
  'https://dc.gov/feed/', // Washington D.C. ✅ New
  
  // Federal & Business
  'https://www.usa.gov/rss/updates.xml', // USA.gov Federal Updates
  'https://www.prnewswire.com/rss/business-technology-news.rss', // PR Newswire (Big Business PRs) ✅ New
  'https://www.sba.gov/about-sba/sba-newsroom/press-releases-media-advisories/rss' // SBA Gov Business ✅ New
];
async function fetchGovNews() {
  let allNews: { title: string, desc: string, url: string, source: string }[] = [];
  for (const url of govFeeds) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.slice(0, 2).forEach(item => {
        allNews.push({
          title: item.title || "",
          desc: item.contentSnippet || item.content || "",
          url: item.link || "",
          source: feed.title || "US Government"
        });
      });
    } catch (error) {
      console.error(`Failed to fetch RSS from ${url}:`, error);
    }
  }
  return allNews.sort(() => 0.5 - Math.random()).slice(0, 3);
}

async function rewriteNews(title: string, desc: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a professional news editor. Rewrite the following US Government news title and description to make it unique and SEO-friendly.
    Original Title: "${title}"
    Original Description: "${desc}"
    Return STRICTLY in JSON format: {"newTitle": "...", "newDesc": "...", "imagePrompt": "a brief descriptive prompt for an AI image generator related to this news"}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      title: parsed.newTitle || title,
      desc: parsed.newDesc || desc,
      imagePrompt: parsed.imagePrompt || "breaking news concept"
    };
  } catch (error) {
    console.error('AI Error:', error);
    return { title, desc, imagePrompt: "breaking news concept" };
  }
}

// 🌟 نیا فنکشن: AI سے تصویر بنانا اور Sanity میں اپ لوڈ کرنا
async function generateAndUploadImage(prompt: string, slug: string) {
  try {
    // Pollinations AI سے تصویر بنائیں (بالکل مفت اور بغیر API Key کے)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true`;
    
    // تصویر کو ڈاؤن لوڈ کریں
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch image from AI');
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanity میں تصویر اپ لوڈ کریں
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType: 'image/jpeg'
    });

    return asset; // یہ اسٹےٹس کا رفرنس ہے
  } catch (error) {
    console.error('Image Generation Error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newsToProcess = await fetchGovNews();
    if (newsToProcess.length === 0) return NextResponse.json({ message: 'No gov news found' });

    for (const article of newsToProcess) {
      const rewritten = await rewriteNews(article.title, article.desc);
      const slugText = rewritten.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60);
      
      // تصویر بنائیں
      const imageAsset = await generateAndUploadImage(rewritten.imagePrompt, slugText);

      // ڈاکیومنٹ تیار کریں
      const docData: any = {
        _type: 'blog',
        title: rewritten.title,
        slug: { _type: 'slug', current: slugText },
        desc: rewritten.desc,
        category: 'US Government',
        date: new Date().toISOString().split('T')[0],
        content1: `<p>${rewritten.desc}</p><p>Source: <a href="${article.url}">${article.source}</a></p>`,
        isPublished: false,
        isFeatured: false,
      };

      // اگر تصویر بن گئی ہو تو اسے img1 میں سیٹ کریں
      if (imageAsset) {
        docData.img1 = {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id }
        };
      }

      await sanityClient.create(docData);
    }

    return NextResponse.json({ success: true, message: `${newsToProcess.length} Gov news with AI images added to drafts!` });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}