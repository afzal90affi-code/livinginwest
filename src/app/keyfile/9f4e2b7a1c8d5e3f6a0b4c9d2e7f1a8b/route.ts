import { NextResponse } from "next/server";

const KEY = process.env.INDEXNOW_KEY || "9f4e2b7a1c8d5e3f6a0b4c9d2e7f1a8b";

export async function GET() {
  return new Response(KEY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}