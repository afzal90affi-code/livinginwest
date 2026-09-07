/* ============================================================
   IndexNow Helper — livinginwest.com
   Key: env se aati hai (.env.local -> INDEXNOW_KEY)
   Submit: POST https://api.indexnow.org/indexnow
============================================================ */

const KEY = process.env.INDEXNOW_KEY || "9f4e2b7a1c8d5e3f6a0b4c9d2e7f1a8b";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://livinginwest.com";
const HOST = "livinginwest.com";

type IndexNowResult = {
  ok: boolean;
  status?: number;
  reason?: string;
  error?: unknown;
};

/** Ek ya zyada URLs IndexNow (Bing/Yandex/Seznam) ko submit karo */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (!KEY || !SITE || urls.length === 0) {
    return { ok: false, reason: "missing config or empty urls" };
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `${SITE}/${KEY}.txt`,
        urlList: urls.map((u) => (u.startsWith("http") ? u : `${SITE}${u}`)),
      }),
    });

    /* 200 = accepted, 202 = key pending verification (pehli baar) */
    return { ok: res.ok || res.status === 202, status: res.status };
  } catch (err) {
    console.error("IndexNow submit failed:", err);
    return { ok: false, error: err };
  }
}

/** Single URL shortcut */
export async function submitUrl(path: string) {
  return submitToIndexNow([path]);
}