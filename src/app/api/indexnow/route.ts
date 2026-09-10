import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "../../../lib/indexnow";

/* POST — URLs submit karo (sirf secret wali request allow) */
export async function POST(req: NextRequest) {
  /* Lock: bina secret ke koi access nahi kar sakta */
  const secret = req.headers.get("x-webhook-secret");
  if (
    !process.env.INDEXNOW_WEBHOOK_SECRET ||
    secret !== process.env.INDEXNOW_WEBHOOK_SECRET
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  let urls: string[] = [];

  if (Array.isArray(body?.urls)) {
    /* Manual format: { urls: ["/blog/xyz"] } */
    urls = body.urls;
  } else {
    /* Sanity webhook format: { slug: "..." } ya { slug: { current: "..." } } */
    const slug =
      typeof body?.slug === "string" ? body.slug : body?.slug?.current;
    if (slug) {
      urls = [`/blog/${slug}`, "/", "/daily-news"];
    }
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { success: false, error: "urls array ya slug required" },
      { status: 400 }
    );
  }

  /* IndexNow max 10,000 URLs per request — safety limit */
  const result = await submitToIndexNow(urls.slice(0, 10000));
  return NextResponse.json({
    success: result.ok,
    submitted: urls.length,
    ...result,
  });
}