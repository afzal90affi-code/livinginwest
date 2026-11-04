"use client";

import { useState, useEffect, useMemo, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, ImageOff, Mail } from "lucide-react";
import { urlFor } from "@/lib/sanityImage";
import { ShareCardButton } from "@/components/share";

// ===== TYPES (properly typed — `any` removed) =====

interface CategoryRef {
  _id: string;
  name?: string;
  slug?: string | { current: string };
  emoji?: string;
  image?: { asset?: { _ref?: string; url?: string }; url?: string };
}

interface BlogCategoryRef {
  _id?: string;
  name?: string;
  title?: string;
  current?: string;
}

interface Blog {
  _id: string;
  title?: string;
  slug?: string;
  categoryName?: string | BlogCategoryRef | BlogCategoryRef[];
  category?: string | BlogCategoryRef | BlogCategoryRef[];
  desc?: string;
  mainImage?: { asset?: { _ref?: string; url?: string }; url?: string };
  date?: string;
  newsTime?: string;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isMoreStory?: boolean;
  writerName?: string;
  writerSocial?: string;
}

interface MappedCategory {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  img: string;
}

interface MappedBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  desc: string;
  img: string;
  date: string;
  timestamp: number;
  newsTime: string;
  isFeatured: boolean;
  isEditorsPick: boolean;
  isMoreStory: boolean;
  writerName: string;
  writerSocial: string;
}

// ===== HELPERS =====

/** Link ke andar share button ko click propagation rokne ke liye wrapper */
function StopClick({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div onClick={(e) => e.stopPropagation()} className={className}>
      {children}
    </div>
  );
}

/** Email validation regex — `includes("@")` se bahut better */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== COMPONENT =====

export default function HomeContent({
  initialCategories,
  initialBlogs,
}: {
  initialCategories: CategoryRef[];
  initialBlogs: Blog[];
}) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroTick, setHeroTick] = useState(0); // ✅ manual click par timer reset karne ke liye
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMessage, setSubMessage] = useState("");

  // ===== MAP CATEGORIES (filter out those without valid slug/name) =====
  const categories: MappedCategory[] = useMemo(() => {
    return initialCategories
      .map((c: CategoryRef): MappedCategory | null => {
        let catSlug = "";
        if (typeof c.slug === "string") catSlug = c.slug;
        else if (typeof c.slug === "object" && c.slug !== null && c.slug.current) catSlug = c.slug.current;
        else if (c.name) catSlug = c.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        // ✅ FIX: agar slug ya name nahi hai to category skip kar do
        // (purane code me default 'category' use hota tha → duplicate URLs ban jate the)
        if (!catSlug || !c.name) return null;

        return {
          id: c._id,
          name: c.name,
          slug: catSlug,
          emoji: c.emoji,
          img: c.image ? urlFor(c.image).width(600).height(800).auto("format").quality(60).url() : "",
        };
      })
      .filter((c): c is MappedCategory => c !== null);
  }, [initialCategories]);

  // ===== MAP BLOGS (filter out those without slug/title) =====
  const blogs: MappedBlog[] = useMemo(() => {
    return initialBlogs
      .map((b: Blog): MappedBlog | null => {
        const blogSlug = b.slug || "";

        // ✅ FIX: slug ya title missing blog ko skip kar do → broken `/blog/` URLs nahi banenge
        if (!blogSlug || !b.title) return null;

        const blogDate = b.date ? new Date(b.date) : new Date(0);

        // Category extraction — properly typed (no `any`)
        let blogCat = "general";
        const catField = b.categoryName || b.category;
        if (typeof catField === "string") {
          blogCat = catField;
        } else if (Array.isArray(catField) && catField.length > 0) {
          blogCat = catField
            .map((c) => (typeof c === "string" ? c : c?.name || c?.title || c?.current || ""))
            .filter(Boolean)
            .join(", ");
        } else if (catField && typeof catField === "object") {
          const ref = catField as BlogCategoryRef;
          blogCat = ref.name || ref.title || ref.current || "general";
        }

        return {
          id: b._id,
          title: b.title,
          slug: blogSlug,
          category: blogCat.trim(),
          desc: b.desc || "",
          img: b.mainImage ? urlFor(b.mainImage).width(800).height(1000).auto("format").quality(60).url() : "",
          // ✅ HYDRATION FIX: fixed locale + UTC — server aur client hamesha same date dikhayenge
          date: b.date ? blogDate.toLocaleDateString("en-US", { timeZone: "UTC" }) : "",
          timestamp: blogDate.getTime(),
          newsTime: b.newsTime || "",
          isFeatured: b.isFeatured === true,
          isEditorsPick: b.isEditorsPick === true,
          isMoreStory: b.isMoreStory === true,
          writerName: b.writerName || "",
          writerSocial: b.writerSocial || "",
        };
      })
      .filter((b): b is MappedBlog => b !== null);
  }, [initialBlogs]);

  // ===== DERIVED DATA (all memoized — har render pe dobara compute nahi hoga) =====

  const sortedBlogs = useMemo(() => [...blogs].sort((a, b) => b.timestamp - a.timestamp), [blogs]);

  const heroNews = useMemo(() => {
    const featured = blogs.filter((b) => b.isFeatured).sort((a, b) => b.timestamp - a.timestamp);
    return featured.length > 0 ? featured.slice(0, 4) : sortedBlogs.slice(0, 4);
  }, [blogs, sortedBlogs]);

  const activeHero = heroNews[currentHeroIndex] ?? heroNews[0];

  // ✅ EDITOR'S PICK: sirf wohi blogs jinka form me "Editor's Pick" toggle ON hai
  const editorPicks = useMemo(() => blogs.filter((b) => b.isEditorsPick).slice(0, 4), [blogs]);

  // ✅ DEDUPE: hero + editor picks mein jo blogs aa chuki hain wo neeche repeat nahi hongi
  const usedIds = useMemo(() => {
    return new Set<string>([...heroNews.map((b) => b.id), ...editorPicks.map((b) => b.id)]);
  }, [heroNews, editorPicks]);

  // ✅ DAILY UPDATES: poori site ki 9 SAB SE NAYI posts (latest date first)
  const dailyBlogs = useMemo(() => sortedBlogs.slice(0, 9), [sortedBlogs]);

  const moreStories = useMemo(() => {
    const moreStoryFiltered = blogs.filter((b) => b.isMoreStory && !usedIds.has(b.id));
    const moreStoriesPool = blogs.filter((b) => !usedIds.has(b.id));
    return (moreStoryFiltered.length >= 6 ? moreStoryFiltered : moreStoriesPool).slice(0, 12);
  }, [blogs, usedIds]);

  // ✅ DEALS: hardcoded URL ki jagah category ka asli slug use hota hai
  const dealBlogs = useMemo(
    () => blogs.filter((b) => b.category.toLowerCase().trim() === "discounts & offers"),
    [blogs]
  );

  const dealsCat = useMemo(
    () => categories.find((c) => c.name.toLowerCase().trim() === "discounts & offers"),
    [categories]
  );

  const catRow1 = useMemo(() => categories.slice(0, 2), [categories]);
  const catRow2 = useMemo(() => categories.slice(2, 5), [categories]);
  const catRow3 = useMemo(() => categories.slice(5), [categories]);

  // ✅ Categories with their blogs — empty ones filtered, sorted by latest post timestamp
  const categoriesWithBlogs = useMemo(() => {
    return categories
      .map((cat) => {
        const catName = cat.name.toLowerCase().trim();
        const catSlug = cat.slug.toLowerCase().trim();

        // ✅ EXACT match only — `includes()` hata diya (false positives aate the)
        // Comma-separated categories ka support hai (jaise blog multiple categories me ho)
        const catBlogs = blogs
          .filter((b) => {
            const blogCats = b.category.toLowerCase().trim().split(",").map((c) => c.trim());
            return blogCats.includes(catName) || blogCats.includes(catSlug);
          })
          .sort((a, b) => b.timestamp - a.timestamp);

        const latestTs = catBlogs.length > 0 ? catBlogs[0].timestamp : 0;
        return { cat, catBlogs, latestTs };
      })
      // ✅ FIX: `.map() returning null` ki jagah proper `.filter()` use kiya
      .filter(({ catBlogs }) => catBlogs.length > 0)
      .sort((a, b) => b.latestTs - a.latestTs);
  }, [categories, blogs]);

  // ===== HERO TIMER (resets on manual click via heroTick) =====
  useEffect(() => {
    if (heroNews.length <= 1) {
      setCurrentHeroIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroNews.length, heroTick]);

  // ===== AUTHOR RENDER (accessible custom link — Enter + Space support) =====
  const renderAuthor = (blog: MappedBlog) => {
    if (!blog.writerName) return null;

    if (blog.writerSocial) {
      const open = () => window.open(blog.writerSocial, "_blank", "noopener,noreferrer");
      return (
        <span
          role="link"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          // ✅ FIX: Space key bhi handle karo (accessibility)
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              open();
            }
          }}
          className="cursor-pointer font-semibold text-gray-900 hover:text-[#6D28D9] hover:underline transition-colors dark:text-white"
        >
          By {blog.writerName}
        </span>
      );
    }

    return <span className="font-semibold text-gray-900 dark:text-white">By {blog.writerName}</span>;
  };

  // ===== SUBSCRIBE FORM =====
  const handleSubSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ✅ FIX: proper email regex — `includes("@")` bahut lenient tha
    if (!subEmail || !EMAIL_REGEX.test(subEmail)) {
      setSubStatus("error");
      setSubMessage("Please enter a valid email address.");
      return;
    }

    setSubStatus("loading");
    setSubMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubStatus("error");
        setSubMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubStatus("success");
      setSubMessage("Subscribed successfully! 🎉");
      setSubEmail("");

      setTimeout(() => {
        setSubStatus("idle");
        setSubMessage("");
      }, 3000);
    } catch (err) {
      setSubStatus("error");
      setSubMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-white">

      {/* ✅ Skip to content — accessibility (screen reader users ke liye) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-gray-900"
      >
        Skip to content
      </a>

      {/* ✅ FIX: H1 tag add kiya — SEO ke liye page ka primary heading (visually hidden) */}
      <h1 className="sr-only">
        Living In West — Lifestyle, Travel, Finance, Health, Visa &amp; News for Western Living
      </h1>

      {/* AD SLOT 1 */}
      <div className="mx-auto max-w-7xl px-6 my-4">
        <div className="flex w-full min-h-[90px] items-center justify-center border border-gray-200/60 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
          [Advertisement - Top Leaderboard Banner]
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div id="main-content" className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row">

        <div className="w-full space-y-12 py-4 lg:w-[82%] md:space-y-16">

          {/* ===== HERO — FEATURED NEWS SLIDER ===== */}
          {heroNews.length > 0 && activeHero && (
            <section className="pt-2">
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Main slide */}
                <div className="relative lg:col-span-2">
                  <div className="relative">
                    <Link
                      href={`/blog/${activeHero.slug}`}
                      className="group relative block aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 lg:aspect-[16/9] dark:bg-gray-800"
                    >
                      {activeHero.img && (
                        <Image
                          // ✅ FIX: `key={activeHero.id}` hata diya — slide change pe flicker nahi aayega
                          src={activeHero.img}
                          alt={activeHero.title}
                          fill
                          priority={currentHeroIndex === 0}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                          {activeHero.category}
                        </span>

                        <h2 className="mt-2 line-clamp-2 font-playfair text-2xl font-bold leading-tight text-white md:text-4xl">
                          {activeHero.title}
                        </h2>
                      </div>
                    </Link>

                    {/* Slide dots (Link ke BAHAR — nested issue nahi) */}
                    {heroNews.length > 1 && (
                      <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                        {heroNews.map((b, i) => (
                          <button
                            key={b.id}
                            type="button"
                            // ✅ IMPROVED: aria-label me title bhi shamil
                            aria-label={`Go to slide ${i + 1}: ${b.title}`}
                            onClick={() => {
                              setCurrentHeroIndex(i);
                              setHeroTick((t) => t + 1);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              i === currentHeroIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary + Author + Date + Share */}
                  <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 md:p-5 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm leading-6 text-gray-600 line-clamp-2 md:line-clamp-3 dark:text-gray-300">
                      {activeHero.desc}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {renderAuthor(activeHero)}
                        {activeHero.writerName && activeHero.date && <span>•</span>}
                        {activeHero.date && <span>{activeHero.date}</span>}
                      </div>
                      {/* ✅ StopClick wrapper use kiya — repeated onClick code hata diya */}
                      <StopClick className="z-10">
                        <ShareCardButton title={activeHero.title} url={`/blog/${activeHero.slug}`} />
                      </StopClick>
                    </div>
                  </div>
                </div>

                {/* Side cards — Up Next */}
                <div className="hidden flex-col gap-4 lg:flex">
                  {heroNews.map((blog, i) => (
                    <Link
                      href={`/blog/${blog.slug}`}
                      key={blog.id}
                      className={`group flex gap-4 rounded-xl border p-3 transition-all ${
                        i === currentHeroIndex
                          ? "border-[#6D28D9] bg-gray-50 dark:bg-gray-800"
                          : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        {blog.img ? (
                          <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="96px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-5 h-5" /></div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-600">{blog.category}</span>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900 dark:text-white">{blog.title}</h3>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                            {renderAuthor(blog)}
                            {blog.writerName && blog.date && <span>•</span>}
                            {blog.date && <span>{blog.date}</span>}
                          </div>
                          <StopClick>
                            <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                          </StopClick>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ===== SUBSCRIBE BAR ===== */}
          <section className="overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg text-white">
            <div className="flex flex-col items-center justify-center gap-4 p-4 text-center sm:flex-row sm:text-left">

              <div className="flex flex-shrink-0 items-center gap-2.5">
                <Mail className="w-5 h-5 flex-shrink-0 text-gray-300" />
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold">Weekly Updates</span>
                  <span className="hidden text-xs text-gray-400 md:inline">— Get the latest directly to your inbox.</span>
                </div>
              </div>

              <form onSubmit={handleSubSubmit} className="flex w-full flex-col items-center gap-2 sm:w-auto">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={subStatus === "loading"}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-400 focus:ring-2 focus:ring-white/30 sm:w-64 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={subStatus === "loading"}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-60"
                  >
                    {subStatus === "loading" ? "Submitting..." : "Subscribe"}
                  </button>
                </div>
                {subMessage && (
                  <span className={`text-xs ${subStatus === "error" ? "text-red-300" : "text-green-300"}`}>
                    {subMessage}
                  </span>
                )}
              </form>

            </div>
          </section>

          {/* ===== DAILY UPDATES ===== */}
          <section className="py-4 md:py-8">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-900 pb-3 dark:border-gray-700">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl dark:text-white">Daily Updates</h2>
              <Link href="/news" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                View All News <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {dailyBlogs.map((blog) => {
                const dateObj = new Date(blog.timestamp);
                // ✅ HYDRATION FIX: UTC month/day — server aur client same
                const month = dateObj.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
                const day = dateObj.getUTCDate();

                // ✅ FIX: safe newsTime parsing — comma hone par hi [1] le, warna empty
                const timeParts = blog.newsTime.split(",");
                const timeLabel = timeParts.length > 1 ? timeParts[1].trim() : "";

                return (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex items-start gap-4 py-5 md:gap-5">
                    <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center border-r-2 border-gray-100 pr-4 text-center dark:border-gray-800">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1e3a8a] dark:text-blue-400">{month}</span>
                      <span className="mt-1 font-playfair text-3xl font-bold leading-none text-gray-900 dark:text-white">{day}</span>
                      {timeLabel && <span className="mt-1 text-[9px] text-gray-400 dark:text-gray-500">{timeLabel}</span>}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">{blog.category}</span>
                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#1e3a8a] md:text-xl dark:text-white dark:group-hover:text-blue-400">{blog.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-gray-500 line-clamp-3 dark:text-gray-400">{blog.desc}</p>

                      <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {renderAuthor(blog)}
                          {blog.writerName && blog.date && <span>•</span>}
                          {blog.date && <span>{blog.date}</span>}
                        </div>
                        <StopClick>
                          <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                        </StopClick>
                      </div>
                    </div>

                    {blog.img && (
                      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm md:h-28 md:w-44 dark:bg-gray-800">
                        <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 112px, 176px" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ===== DISCOUNTS & DEALS SECTION ===== */}
          {dealBlogs.length > 0 && (
            <section className="py-4 md:py-8">
              <div className="mb-6 flex items-center justify-between border-b-2 border-gray-900 pb-3 dark:border-gray-700">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl dark:text-white">Discounts &amp; Deals</h2>
                <Link
                  href={dealsCat ? `/category/${dealsCat.slug}` : "/news"}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  View All Deals <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {dealBlogs.slice(0, 4).map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    {blog.img && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="300px" />
                        <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Deal</div>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#1e3a8a] dark:text-white dark:group-hover:text-blue-400">{blog.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{blog.desc}</p>
                      {blog.newsTime && (
                        <div className="mt-3 flex items-center border-t border-gray-100 pt-3 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:text-gray-500">
                          <Clock className="mr-1.5 w-3 h-3" /> {blog.newsTime}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== EDITOR'S PICK ===== */}
          {editorPicks.length > 0 && (
            <section className="py-4 md:py-8">
              <div className="mb-6 flex items-center justify-between border-b-2 border-gray-900 pb-3 dark:border-gray-700">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl dark:text-white">Editor&apos;s Pick</h2>
                <span className="hidden text-xs font-semibold uppercase tracking-widest text-gray-500 md:block dark:text-gray-400">Curated Insights</span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {editorPicks.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {blog.img ? (
                        <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>
                      )}
                      <div className="absolute left-2 top-2 rounded bg-[#6D28D9] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{blog.category}</div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6D28D9] dark:text-white">{blog.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-6 text-gray-500 line-clamp-2 dark:text-gray-400">{blog.desc}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {renderAuthor(blog)}
                          {blog.writerName && blog.date && <span>•</span>}
                          {blog.date && <span>{blog.date}</span>}
                        </div>
                        <StopClick>
                          <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                        </StopClick>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== TOPICS / CATEGORIES ===== */}
          <section className="py-16">
            <div>
              <h2 className="mb-10 border-b border-gray-200 pb-4 text-center font-playfair text-3xl font-bold tracking-tight md:text-4xl dark:border-gray-700">Explore Topics</h2>
              <div className="flex flex-col items-center gap-6">
                <div className="flex w-full justify-center gap-4 md:gap-6">
                  {catRow1.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group relative block aspect-[3/4] w-[48%] overflow-hidden bg-gray-100 md:w-[40%] lg:w-[30%] dark:bg-gray-800">
                      {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover brightness-90 transition-all duration-500 group-hover:scale-110 group-hover:brightness-100" sizes="30vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 text-center text-white">
                        {/* ✅ FIX: category name ab heading tag me hai (SEO) */}
                        <h3 className="font-playfair text-xl font-bold tracking-tight md:text-2xl">{cat.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex w-full justify-center gap-4 md:gap-6">
                  {catRow2.map((cat) => (
                    <Link href={`/category/${cat.slug}`} key={cat.id} className="group relative block aspect-[3/4] w-[30%] overflow-hidden bg-gray-100 md:w-[25%] lg:w-[20%] dark:bg-gray-800">
                      {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover brightness-90 transition-all duration-500 group-hover:scale-110 group-hover:brightness-100" sizes="20vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center text-white">
                        <h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                {catRow3.length > 0 && (
                  <div className="mt-4 grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {catRow3.map((cat) => (
                      <Link href={`/category/${cat.slug}`} key={cat.id} className="group relative block aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {cat.img ? <Image src={cat.img} alt={cat.name} fill className="object-cover brightness-90 transition-all duration-500 group-hover:scale-110 group-hover:brightness-100" sizes="25vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center text-white">
                          <h3 className="font-playfair text-lg font-bold tracking-tight">{cat.name}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===== ALL CATEGORY-WISE BLOGS ===== */}
          <section className="rounded-xl border border-gray-100 bg-white py-12 shadow-sm md:py-16 dark:border-gray-700 dark:bg-gray-800">
            <div className="px-6 md:px-10">
              <div className="flex flex-col gap-16 md:gap-24">
                {categoriesWithBlogs.map(({ cat, catBlogs }) => {
                  // ✅ FRESH-FIRST: jo posts hero/editor picks me dikh chuki hain unhe skip karo (agar aur posts available hain)
                  const freshBlogs = catBlogs.filter((b) => !usedIds.has(b.id));
                  const pool = freshBlogs.length > 0 ? freshBlogs : catBlogs;

                  const mainBlog = pool[0];
                  const sideBlogs = pool.slice(1, 4);
                  const mobileBlogs = pool.slice(0, 8);

                  return (
                    <div key={cat.id} className="category-block">
                      <div className="mb-8 flex items-center justify-between border-b-2 border-gray-900 pb-3 dark:border-gray-700">
                        {/* ✅ FIX: Category naam ab h2 heading me hai, Link andar wrap hai (SEO) */}
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl dark:text-white">
                          <Link
                            href={`/category/${cat.slug}`}
                            className="transition-colors hover:text-[#6D28D9] dark:text-white dark:hover:text-violet-400"
                          >
                            {cat.name}
                          </Link>
                        </h2>
                        <Link href={`/category/${cat.slug}`} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                          View All <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="hidden grid-cols-12 gap-10 lg:grid lg:gap-12">
                        {mainBlog ? (
                          <div className="col-span-7 group block">
                            <Link href={`/blog/${mainBlog.slug}`}>
                              <div className="relative mb-5 aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {mainBlog.img ? <Image src={mainBlog.img} alt={mainBlog.title} fill className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                              </div>
                              <h3 className="font-playfair text-2xl font-bold leading-tight text-gray-900 underline-offset-4 decoration-2 group-hover:underline md:text-3xl dark:text-white">{mainBlog.title}</h3>
                              <p className="mt-3 text-base leading-relaxed text-gray-600 line-clamp-2 dark:text-gray-300">{mainBlog.desc}</p>
                            </Link>
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                {renderAuthor(mainBlog)}
                                {mainBlog.writerName && <span>•</span>}
                                <span>{mainBlog.date}</span>
                              </div>
                              <StopClick>
                                <ShareCardButton title={mainBlog.title} url={`/blog/${mainBlog.slug}`} />
                              </StopClick>
                            </div>
                          </div>
                        ) : (
                          <div className="col-span-7 group block">
                            <div className="relative mb-5 flex aspect-[16/10] items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">No articles published yet.</div>
                            <h3 className="font-playfair text-2xl font-bold leading-tight text-gray-400 md:text-3xl dark:text-gray-500">Coming Soon</h3>
                          </div>
                        )}

                        <div className="col-span-5 flex flex-col gap-6 divide-y divide-gray-100 dark:divide-gray-700">
                          {sideBlogs.length > 0 ? sideBlogs.map((blog) => (
                            <div key={blog.id} className="group flex gap-4 pt-6 first:pt-0">
                              <Link href={`/blog/${blog.slug}`} className="relative h-24 w-28 shrink-0 overflow-hidden bg-gray-100 md:h-28 md:w-32 dark:bg-gray-700">
                                {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" sizes="128px" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-6 h-6" /></div>}
                              </Link>
                              <div className="flex flex-1 flex-col justify-center">
                                <Link href={`/blog/${blog.slug}`}>
                                  <h3 className="font-playfair text-lg font-bold leading-snug text-gray-900 transition-colors line-clamp-3 group-hover:text-gray-600 md:text-xl dark:text-white dark:group-hover:text-gray-300">{blog.title}</h3>
                                </Link>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{blog.date}</span>
                                  <StopClick>
                                    <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                                  </StopClick>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500">More stories coming soon.</div>
                          )}
                        </div>
                      </div>

                      {/* Mobile carousel */}
                      <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 custom-scrollbar lg:hidden">
                        {mobileBlogs.map((blog) => (
                          <div key={blog.id} className="group w-[80%] min-w-[80%] flex-shrink-0 snap-center">
                            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
                              <Link href={`/blog/${blog.slug}`} className="block">
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                                  {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" sizes="80vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-8 h-8" /></div>}
                                  <div className="absolute left-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">{blog.category}</div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-playfair text-lg font-bold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">{blog.title}</h3>
                                  <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2 dark:text-gray-400">{blog.desc}</p>
                                </div>
                              </Link>
                              <div className="mt-auto flex items-center justify-between border-t border-gray-50 px-4 pb-4 pt-2 dark:border-gray-800">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{blog.date}</span>
                                <StopClick>
                                  <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                                </StopClick>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ===== MORE STORIES ===== */}
          <section className="py-16">
            <div>
              <h2 className="mb-8 border-b border-gray-200 pb-4 font-playfair text-3xl font-bold tracking-tight md:text-4xl dark:border-gray-700">More Stories</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
                {moreStories.map((blog) => (
                  <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                    <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {blog.img ? <Image src={blog.img} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" /> : <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageOff className="w-10 h-10" /></div>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">{blog.category}</span>
                    <h3 className="mt-2 font-playfair text-lg font-bold leading-tight text-gray-900 transition-colors line-clamp-2 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">{blog.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1 dark:text-gray-400">{blog.desc}</p>

                    <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
                      {renderAuthor(blog)}
                      <StopClick>
                        <ShareCardButton title={blog.title} url={`/blog/${blog.slug}`} />
                      </StopClick>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* --- SIDEBAR ADS --- */}
        <aside className="hidden w-[18%] py-4 lg:block">
          <div className="sticky top-4 flex flex-col gap-6">
            <div className="flex w-full min-h-[600px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-4 text-[10px] uppercase tracking-widest text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
              <span className="mb-2 text-[8px] text-gray-300 dark:text-gray-600">Advertisement</span>
              <div className="flex h-[500px] w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-900">[ Sidebar Ad 300x600 ]</div>
            </div>
            <div className="flex w-full min-h-[250px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-4 text-[10px] uppercase tracking-widest text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
              <span className="mb-2 text-[8px] text-gray-300 dark:text-gray-600">Advertisement</span>
              <div className="flex h-[200px] w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-900">[ Sidebar Ad 300x250 ]</div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}
