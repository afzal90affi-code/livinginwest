import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import RssParser from 'rss-parser';

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

/* ============================================================
   📰 USA NEWS FEEDS — States + National
============================================================ */
const newsFeeds = [
  /* ===== NATIONAL ===== */
  { url: 'https://www.wehouse.gov/feed/', category: 'Daily West', subcategory: 'US Government' },
  { url: 'https://apnews.com/feed', category: 'US News', subcategory: 'National' },
  { url: 'https://www.cbsnews.com/latest/rss/main', category: 'US News', subcategory: 'Breaking' },

  /* ===== NEW YORK ===== */
  { url: 'https://gothamist.com/rss.xml', category: 'New York', subcategory: 'NYC News' },
  { url: 'https://www.nydailynews.com/feed/', category: 'New York', subcategory: 'NYC' },

  /* ===== CALIFORNIA ===== */
  { url: 'https://calmatters.org/feed/', category: 'California', subcategory: 'CA News' },
  { url: 'https://www.latimes.com/california/rss2.0.xml', category: 'California', subcategory: 'LA' },

  /* ===== TEXAS ===== */
  { url: 'https://www.texastribune.org/feed/', category: 'Texas', subcategory: 'TX Politics' },
  { url: 'https://www.houstonchronicle.com/rss/feed/Houston-Chronicle-News-273.php', category: 'Texas', subcategory: 'Houston' },

  /* ===== ILLINOIS ===== */
  { url: 'https://chicago.suntimes.com/rss', category: 'Illinois', subcategory: 'Chicago' },
  { url: 'https://blockclubchicago.org/feed/', category: 'Illinois', subcategory: 'Chicago Local' },

  /* ===== FLORIDA ===== */
  { url: 'https://www.tampabay.com/rss/', category: 'Florida', subcategory: 'Tampa' },
  { url: 'https://www.miamiherald.com/latest/rss/', category: 'Florida', subcategory: 'Miami' },

  /* ===== WASHINGTON STATE ===== */
  { url: 'https://www.seattletimes.com/feed/', category: 'Washington State', subcategory: 'Seattle' },

  /* ===== MASSACHUSETTS ===== */
  { url: 'https://www.boston.com/feed/', category: 'Massachusetts', subcategory: 'Boston' },

  /* ===== COLORADO ===== */
  { url: 'https://www.denverpost.com/feed/', category: 'Colorado', subcategory: 'Denver' },

  /* ===== OHIO ===== */
  { url: 'https://www.cleveland.com/rss/', category: 'Ohio', subcategory: 'Cleveland' },

  /* ===== MICHIGAN ===== */
  { url: 'https://www.freep.com/rss/', category: 'Michigan', subcategory: 'Detroit' },

  /* ===== NEW JERSEY ===== */
  { url: 'https://www.nj.com/rss/', category: 'New Jersey', subcategory: 'NJ News' },

  /* ===== OREGON ===== */
  { url: 'https://www.oregonlive.com/rss/', category: 'Oregon', subcategory: 'Portland' },

  /* ===== ALABAMA ===== */
  { url: 'https://www.al.com/rss/', category: 'Alabama', subcategory: 'Birmingham' },

  /* ===== MINNESOTA ===== */
  { url: 'https://www.startribune.com/feeds/globe/', category: 'Minnesota', subcategory: 'Minneapolis' },

  /* ===== GEORGIA ===== */
  { url: 'https://www.ajc.com/rss/', category: 'Georgia', subcategory: 'Atlanta' },

  /* ===== PENNSYLVANIA ===== */
  { url: 'https://www.pennlive.com/rss/', category: 'Pennsylvania', subcategory: 'Harrisburg' },

  /* ===== UTAH ===== */
  { url: 'https://www.sltrib.com/rss/', category: 'Utah', subcategory: 'Salt Lake City' },

  /* ===== NEVADA ===== */
  { url: 'https://www.reviewjournal.com/feed/', category: 'Nevada', subcategory: 'Las Vegas' },

  /* ===== MISSOURI ===== */
  { url: 'https://www.stltoday.com/rss/', category: 'Missouri', subcategory: 'St. Louis' },

  /* ===== TENNESSEE ===== */
  { url: 'https://www.tennessean.com/rss/', category: 'Tennessee', subcategory: 'Nashville' },

  /* ===== MARYLAND ===== */
  { url: 'https://www.baltimoresun.com/rss2.0.xml', category: 'Maryland', subcategory: 'Baltimore' },

  /* ===== MAINE ===== */
  { url: 'https://www.pressherald.com/feed/', category: 'Maine', subcategory: 'Portland ME' },

  /* ===== VERMONT ===== */
  { url: 'https://vtdigger.org/feed/', category: 'Vermont', subcategory: 'VT News' },

  /* ===== MONTANA ===== */
  { url: 'https://montanafreepress.org/feed/', category: 'Montana', subcategory: 'MT News' },

  /* ===== ALASKA ===== */
  { url: 'https://www.adn.com/feed/', category: 'Alaska', subcategory: 'Anchorage' },

  /* ===== IOWA ===== */
  { url: 'https://www.desmoinesregister.com/rss/', category: 'Iowa', subcategory: 'Des Moines' },

  /* ===== LOUISIANA ===== */
  { url: 'https://www.nola.com/rss/', category: 'Louisiana', subcategory: 'New Orleans' },

  /* ===== ARIZONA ===== */
  { url: 'https://www.azcentral.com/rss/', category: 'Arizona', subcategory: 'Phoenix' },

  /* ===== WISCONSIN ===== */
  { url: 'https://jsonfeed.fox6now.com/latest.xml', category: 'Wisconsin', subcategory: 'Milwaukee' },
];

/* ============================================================
   ⚙️ SETTINGS
   Original news mode: koi AI nahi, koi image generation nahi
   — sirf original news + asli RSS image save hoti hai
============================================================ */
const MAX_FEEDS_PER_RUN = 12;
const ITEMS_PER_FEED = 5;
const MAX_NEWS_AGE_DAYS = 7;
const MAX_NEWS_AGE_MS = MAX_NEWS_AGE_DAYS * 24 * 60 * 60 * 1000;

async function fetchAllNews() {
  let allNews: { title: string, desc: string, url: string, source: string, category: string, subcategory: string, pubDate: string, rssImage: string }[] = [];
  console.log("🌐 Fetching RSS Feeds from various sources...");

  const shuffled = [...newsFeeds].sort(() => 0.5 - Math.random());
  const selectedFeeds = shuffled.slice(0, MAX_FEEDS_PER_RUN);
  console.log(`📌 ${selectedFeeds.length}/${newsFeeds.length} feeds selected for this run:`);
  selectedFeeds.forEach(f => console.log(`   → ${f.category} (${f.url})`));

  let skippedOld = 0;

  for (const feedObj of selectedFeeds) {
    try {
      const feed = await parser.parseURL(feedObj.url);

      feed.items
        .filter((item) => {
          /* ✅ Sirf last 7 din ki news */
          const d = item.isoDate || item.pubDate;
          if (!d) return false;
          const age = Date.now() - new Date(d).getTime();
          if (age > MAX_NEWS_AGE_MS) { skippedOld++; return false; }
          return true;
        })
        .slice(0, ITEMS_PER_FEED)
        .forEach(item => {
          const rawDate = item.isoDate || item.pubDate || new Date().toISOString();

          let rssImage = "";
          if (item.enclosure && item.enclosure.url) {
            rssImage = item.enclosure.url;
          } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
            rssImage = item['media:content'].$.url;
          } else if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) rssImage = imgMatch[1];
          }

          allNews.push({
            title: item.title || "",
            desc: item.contentSnippet || item.content || "",
            url: item.link || "",
            source: feed.title || "Living In West",
            category: feedObj.category,
            subcategory: feedObj.subcategory || "",
            pubDate: rawDate,
            rssImage: rssImage
          });
        });
    } catch (error) {
      console.error(`❌ Failed to fetch RSS from ${feedObj.url}`);
    }
  }

  if (skippedOld > 0) {
    console.log(`⏭️ ${skippedOld} purani items skip (>${MAX_NEWS_AGE_DAYS} din)`);
  }

  console.log(`✅ Total ${allNews.length} original news articles found.`);
  return allNews;
}

/* ============================================================
   ✅ CATEGORY REFERENCE — auto create/find
============================================================ */
async function getOrCreateCategory(title: string): Promise<string | null> {
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await sanityClient.fetch(
      `*[_type == "blogCategory" && slug.current == $slug][0]{ _id }`,
      { slug }
    );
    if (existing?._id) return existing._id;

    const created = await sanityClient.create({
      _type: 'blogCategory',
      title,
      slug: { _type: 'slug', current: slug },
    });
    console.log(`📂 Category created: "${title}"`);
    return created._id;
  } catch (e) {
    console.error('Category error:', e);
    return null;
  }
}

/* ✅ Original RSS image download (agar mili to) */
async function downloadImage(imageUrl: string, slug: string) {
  try {
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!imageRes.ok) throw new Error(`Status ${imageRes.status}`);

    const buffer = Buffer.from(await imageRes.arrayBuffer());
    return await sanityClient.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType: imageRes.headers.get('content-type') || 'image/jpeg'
    });
  } catch (error: any) {
    console.error('❌ Image download error:', error?.message || error);
    return null;
  }
}

/* ============================================================
   ✅ SHARED HANDLER — ORIGINAL NEWS mode
   Koi AI rewrite nahi, koi image generation nahi
   — fast (seconds), zero cost, tum khud blog likhoge
============================================================ */
async function handleRequest(request: Request) {
  /* 🛡️ CRON_SECRET protection */
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized — invalid secret' }, { status: 401 });
    }
  }

  try {
    console.log("=========================================");
    console.log("🚀 Original News Fetch Started...");
    console.log("=========================================");

    const newsToProcess = await fetchAllNews();

    if (newsToProcess.length === 0) {
      console.log("⚠️ No news found.");
      return NextResponse.json({ message: 'No news found' });
    }

    let successCount = 0;
    const categoryCache: Record<string, string | null> = {};

    for (let i = 0; i < newsToProcess.length; i++) {
      const article = newsToProcess[i];
      console.log(`\n--- Article ${i + 1}/${newsToProcess.length}: ${article.title} (${article.category})`);

      /* 🛡️ Duplicate check */
      try {
        const existingCount = await sanityClient.fetch(
          `count(*[_type == "blog" && content1 match $urlPattern])`,
          { urlPattern: `*${article.url}*` }
        );
        if (existingCount > 0) {
          console.log(`⏩ Skipping — already added.`);
          continue;
        }
      } catch (err) {
        console.error("Duplicate check error, proceeding anyway...", err);
      }

      /* ✅ Original RSS image (agar hai) — baaki koi image generation nahi */
      let imageAsset = null;
      if (article.rssImage) {
        imageAsset = await downloadImage(article.rssImage, `news-${Date.now()}-${i}`);
      }
      console.log(`🖼️ Image:`, imageAsset ? "RSS image saved" : "No image");

      /* ✅ Category reference (cache) */
      if (!(article.category in categoryCache)) {
        categoryCache[article.category] = await getOrCreateCategory(article.category);
      }

      /* ✅ ORIGINAL news as draft — title/desc original
         content1 me: original summary + source link
         (tum Edit karke apna blog likhoge) */
      const docData: any = {
        _type: 'blog',
        title: article.title,  /* ✅ ORIGINAL title — AI rewrite nahi */
        slug: {
          _type: 'slug',
          current: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60)
            + '-' + Date.now().toString(36).slice(-4),
        },
        desc: article.desc.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        category: categoryCache[article.category]
          ? { _type: 'reference', _ref: categoryCache[article.category] }
          : undefined,
        date: new Date(article.pubDate).toISOString(),
        newsTime: article.pubDate,
        sourceUrl: article.url,
        sourceName: article.source,
        content1: `<p><strong>📌 Original News (${article.source}):</strong></p>${article.desc}<p>🔗 <a href="${article.url}" target="_blank">Original article yahan parho — ${article.source}</a></p>`,
        isPublished: false,
        isFeatured: false,
      };

      if (imageAsset) {
        docData.img1 = {
          _type: 'image',
          asset: { _type: 'reference', _ref: (imageAsset as any)._id }
        };
      }

      await sanityClient.create(docData);
      console.log(`🎉 Saved: ${article.title}`);
      successCount++;
    }

    console.log(`\n✅ Done! ${successCount} original news added to drafts!`);

    return NextResponse.json({
      success: true,
      message: `${successCount} original news drafts me add ho gayi! Ab unhe parh kar apna blog likho.`
    });

  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(request: Request) { return handleRequest(request); }
export async function POST(request: Request) { return handleRequest(request); }