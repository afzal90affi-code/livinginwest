import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "../../../lib/indexnow";

/* GET — usage info (testing ke liye) */
export async function GET() {
  const KEY = process.env.INDEXNOW_KEY || "9f4e2b7a1c8d5e3f6a0b4c9d2e7f1a8b";
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://livinginwest.com";

  return NextResponse.json({
    site: SITE,
    keyFile: `${SITE}/${KEY}.txt`,
    usage: "POST { urls: ['/about', '/blog/my-post', '/products/x'] }",
  });
}

/* POST — URLs submit karo */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "urls array required — e.g. { urls: ['/home', '/blog'] }" },
        { status: 400 }
      );
    }

    /* IndexNow max 10,000 URLs per request — safety limit */
    const limited = urls.slice(0, 10000);
    const result = await submitToIndexNow(limited);

    return NextResponse.json({
      success: result.ok,
      submitted: limited.length,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}