/* ============================================================
   IndexNow Helper — livinginwest.com
   Key sirf env se aati hai (INDEXNOW_KEY) — code me koi key Nahi
============================================================ */

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
  const KEY = process.env.INDEXNOW_KEY;

  if (!KEY) {
    console.error("IndexNow: INDEXNOW_KEY missing in env!");
    return { ok: false, reason: "INDEXNOW_KEY missing" };
  }

  if (urls.length === 0) {
    return { ok: false, reason: "empty urls" };
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `${SITE}/${KEY}.txt`,
        urlList: urls.map((u) =>
          u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`
        ),
      }),
    });

    /* 200 = accepted | 202 = key verification pending (pehli baar) — dono success */
    if (!res.ok) {
      console.error(`IndexNow submit failed with status: ${res.status}`);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("IndexNow submit failed:", err);
    return { ok: false, error: err };
  }
}

/** Single URL shortcut */
export async function submitUrl(path: string) {
  return submitToIndexNow([path]);
}