import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@sanity/client';
import RssParser from 'rss-parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN || "",
  useCdn: false,
});

const parser = new RssParser({ 
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

// ✅ Array ko uncomment kar diya gaya hai taake error na aaye
const newsFeeds = [
  // 1. Daily West
  { url: 'https://www.whitehouse.gov/feed/', category: 'Daily West', subcategory: 'US Government' },
  { url: 'https://www.nasa.gov/news-release/feed/', category: 'Daily West', subcategory: 'NASA' },
  { url: 'https://www.gov.ca.gov/feed/', category: 'Daily West', subcategory: 'CA Government' },
  { url: 'https://www.uscis.gov/news/news-releases/rss', category: 'Daily West', subcategory: 'Immigration' },
  { url: 'https://www.uscis.gov/news/alerts/rss', category: 'Daily West', subcategory: 'Immigration Alerts' },
  
  // 2. Trading & Finance
  { url: 'https://www.prnewswire.com/rss/business-technology-news.rss', category: 'Trading & Finance', subcategory: 'Business' },

  // 3. Promotions & Sales
  { url: 'https://feeds.feedburner.com/SlickdealsnetFP', category: 'Promotions & Sales', subcategory: 'Deals' },
  { url: 'https://www.techbargains.com/rss.xml', category: 'Promotions & Sales', subcategory: 'Tech Bargains' },

  // 4. Automotive
  { url: 'https://pressroom.toyota.com/rss', category: 'Automotive', subcategory: 'Toyota' }, 
  { url: 'https://hondanews.com/en-US/releases.rss', category: 'Automotive', subcategory: 'Honda' }, 
  { url: 'https://usa.nissannews.com/rss', category: 'Automotive', subcategory: 'Nissan' }, 
  { url: 'https://media.ford.com/rss/press_release.xml', category: 'Automotive', subcategory: 'Ford' }, 
  { url: 'https://group.mercedes-benz.com/rss/press-releases.xml', category: 'Automotive', subcategory: 'Mercedes-Benz' }, 
  { url: 'https://mitsubishinews.com/en-US/releases.rss', category: 'Automotive', subcategory: 'Mitsubishi' }, 
  { url: 'https://www.hyundainews.com/en-US/releases.rss', category: 'Automotive', subcategory: 'Hyundai' }, 
  { url: 'https://news.google.com/rss/search?q=Tesla+press+release+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'Automotive', subcategory: 'Tesla' },
  { url: 'https://news.google.com/rss/search?q=BYD+press+release+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'Automotive', subcategory: 'BYD' },
  { url: 'https://news.google.com/rss/search?q=Toyota+Canada+press+release+when:3d&hl=en-CA&gl=CA&ceid=CA:en', category: 'Automotive', subcategory: 'Toyota Canada' },

  // 5. Entertainment
  { url: 'https://news.google.com/rss/search?q=Hollywood+entertainment+news+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'Entertainment', subcategory: 'Hollywood' },
  { url: 'https://news.google.com/rss/search?q=music+billboard+charts+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'Entertainment', subcategory: 'Music' },

  // 6. Health
  { url: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml', category: 'Health', subcategory: 'WHO Alerts' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'Health', subcategory: 'WHO News' },
  { url: 'https://news.google.com/rss/search?q=health+medical+breakthrough+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'Health', subcategory: 'Medical' },
];

async function fetchAllNews() {
  let allNews: { title: string, desc: string, url: string, source: string, category: string, subcategory: string, pubDate: string, rssImage: string }[] = [];
  console.log("🌐 Fetching RSS Feeds from various sources...");
  
  for (const feedObj of newsFeeds) {
    try {
      const feed = await parser.parseURL(feedObj.url);
      feed.items.slice(0, 2).forEach(item => {
        const rawDate = item.isoDate || item.pubDate || new Date().toISOString();
        let formattedTime = "";
        try {
          formattedTime = new Date(rawDate).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch { formattedTime = rawDate; }

        let rssImage = "";
        if (item.enclosure && item.enclosure.url) {
          rssImage = item.enclosure.url;
        } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
          rssImage = item['media:content'].$.url;
        } else if (item.content) {
          const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch && imgMatch[1]) {
            rssImage = imgMatch[1];
          }
        }

        allNews.push({
          title: item.title || "",
          desc: item.contentSnippet || item.content || "",
          url: item.link || "",
          source: feed.title || "Living In West",
          category: feedObj.category,
          subcategory: feedObj.subcategory || "",
          pubDate: formattedTime,
          rssImage: rssImage 
        });
      });
    } catch (error) {
      console.error(`❌ Failed to fetch RSS from ${feedObj.url}`);
    }
  }
  
  const selectedNews = allNews.sort(() => 0.5 - Math.random());
  console.log(`✅ Total ${selectedNews.length} news articles selected for processing.`);
  return selectedNews;
}

const preferredAutoNewsModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const autoNewsFallbackModels = [
  preferredAutoNewsModel,
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
].filter((value, index, arr) => value && arr.indexOf(value) === index);

async function rewriteNews(title: string, desc: string, category: string) {
  let lastError: unknown = null;

  for (const modelName of autoNewsFallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert news editor for "Living In West". You are writing an article for the "${category}" category.

      News Title: "${title}"
      News Description: "${desc}"

      1. Rewrite the title to be catchy, unique, and SEO-friendly.
      2. Write a comprehensive, 3-paragraph article expanding on the topic. Use <p> tags for paragraphs. If it's a deal, mention the value. If it's visa news, be clear and formal.
      3. Create a highly descriptive image generation prompt that VISUALLY REPRESENTS THIS SPECIFIC STORY.

      Return STRICTLY in JSON format:
      {
        "newTitle": "...",
        "newDesc": "...",
        "imagePrompt": "..."
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.newTitle || title,
        desc: parsed.newDesc || desc,
        imagePrompt: parsed.imagePrompt || `Photorealistic news photography about: ${title}`,
      };
    } catch (error) {
      lastError = error;
      console.warn(`Auto-news Gemini model attempt failed for ${modelName}:`, error);
    }
  }

  console.error('❌ AI Rewrite Error:', lastError?.toString?.() || lastError);
  return { title, desc, imagePrompt: `Photorealistic news photography about: ${title}` };
}

async function fetchPixabayImage(query: string) {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey) {
    console.log("⚠️ PIXABAY_API_KEY .env mein nahi mili!");
    return null;
  }
  try {
    const cleanQuery = query.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100);
    const res = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(cleanQuery)}&image_type=photo&per_page=3&safesearch=true`);
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      console.log("✅ Pixabay se image mil gai!");
      return data.hits[0].largeImageURL;
    }
    return null;
  } catch (error) {
    console.error("Pixabay Error:", error);
    return null;
  }
}

async function downloadAndUploadExistingImage(imageUrl: string, slug: string) {
  try {
    console.log(`   -> Downloading image from: ${imageUrl}`);
    
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!imageRes.ok) {
      console.log(`❌ Image download failed. Status: ${imageRes.status}`);
      throw new Error('Failed to fetch image');
    }
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType: imageRes.headers.get('content-type') || 'image/jpeg'
    });

    return asset;
  } catch (error: any) {
    console.error('❌ Image Download Error:', error?.message || error);
    return null;
  }
}

async function generateAndUploadImage(prompt: string, slug: string) {
  try {
    const randomSeed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&model=flux&seed=${randomSeed}`;
    
    console.log(`   -> Fetching AI image from Flux...`);
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch image from AI');
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType: 'image/jpeg'
    });

    return asset;
  } catch (error: any) {
    console.error('❌ AI Image Generation Error:', error?.message || error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    console.log("=========================================");
    console.log("🚀 Auto News API Started...");
    console.log("=========================================");

    const newsToProcess = await fetchAllNews();
    
    if (newsToProcess.length === 0) {
      console.log("⚠️ No news found.");
      return NextResponse.json({ message: 'No news found' });
    }

    let successCount = 0;

    for (let i = 0; i < newsToProcess.length; i++) {
      const article = newsToProcess[i];
      console.log(`\n--- Processing Article ${i + 1} of ${newsToProcess.length} ---`);
      console.log(`📄 Original Title: ${article.title} (Category: ${article.category})`);

      // 🛡️ Duplicate Check
      try {
        const existingCount = await sanityClient.fetch(
          `count(*[_type == "blog" && content1 match $urlPattern])`,
          { urlPattern: `*${article.url}*` }
        );

        if (existingCount > 0) {
          console.log(`⏩ Skipping: This news has already been added to Sanity.`);
          continue; 
        }
      } catch (err) {
        console.error("Error checking for duplicates, proceeding anyway...", err);
      }

      console.log("✍️ Rewriting with AI...");
      const rewritten = await rewriteNews(article.title, article.desc, article.category);
      console.log(`✅ New Title: ${rewritten.title}`);
      
      const slugText = rewritten.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60);
      
      let imageAsset = null;

      // 1. صرف Daily West اور Trading & Finance کی اصلی تصاویر لیں
      if (article.rssImage && (article.category === 'Daily West' || article.category === 'Trading & Finance')) {
        console.log("🖼️ Trying real RSS image...");
        imageAsset = await downloadAndUploadExistingImage(article.rssImage, slugText);
      } 
      
      // 2. اگر اصلی تصویر نہ ہو، تو Pixabay سے تصویر لیں
      if (!imageAsset) {
        console.log("🖼️ Trying Pixabay image...");
        const pixabayUrl = await fetchPixabayImage(rewritten.title);
        if (pixabayUrl) {
          imageAsset = await downloadAndUploadExistingImage(pixabayUrl, slugText);
        }
      }
      
      // 3. اگر Pixabay ناکام ہو جائے، تو AI سے تصویر بنائیں
      if (!imageAsset) {
        console.log("🎨 Generating safe AI image...");
        imageAsset = await generateAndUploadImage(rewritten.imagePrompt, slugText);
      }
      
      console.log(`🖼️ Image processed:`, imageAsset ? "Success" : "Failed");

      const docData: any = {
        _type: 'blog',
        title: rewritten.title,
        slug: { _type: 'slug', current: slugText },
        desc: rewritten.desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...', 
        category: article.category, 
        subCategory: article.subcategory || undefined, // ✅ Subcategory add ki
        date: new Date(article.pubDate).toISOString(), // ✅ Time Ago fix karne ke liye original date
        newsTime: article.pubDate,       
        sourceUrl: article.url,          
        sourceName: article.source,      
        content1: `${rewritten.desc}<p>Source: <a href="${article.url}">${article.source}</a></p>`, 
        isPublished: false,
        isFeatured: false,
      };

      if (imageAsset) {
        docData.img1 = {
          _type: 'image',
          asset: { _type: 'reference', _ref: (imageAsset as any)._id }
        };
      }

      console.log("💾 Saving to Sanity...");
      await sanityClient.create(docData);
      console.log("🎉 Saved successfully!");
      successCount++;
    }

    console.log("\n=========================================");
    console.log(`✅ All Done! ${successCount} news articles added to drafts!`);
    console.log("=========================================");

    return NextResponse.json({ success: true, message: `${successCount} news with images added to drafts!` });

  } catch (error: any) {
    console.error("❌ Detailed Server Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message || "Unknown error",
      stack: error.stack 
    }, { status: 500 });
  }
}