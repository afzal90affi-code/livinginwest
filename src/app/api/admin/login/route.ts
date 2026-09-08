import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ✅ FIX 1: Hardcoded fallback HATAYA – agar env variable missing hai to
// admin login kaam hi nahi karega (kamzor default password kabhi nahi chalega)
const ADMIN_PASSWORD = process.env.ADMIN_BASIC_PASSWORD;

// ✅ FIX 2: Cookie ki value 'true' ki jagah secret token hogi
// (ye bhi Vercel env me set karna hoga)
const AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN;

// ✅ FIX 3: Rate limiting – brute force attack rokne ke liye
// 15 minute me max 5 galat attempts per IP
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count++;
  attempts.set(ip, record);
  return record.count > MAX_ATTEMPTS;
}

// ✅ FIX 4: Timing-safe password comparison (timing attacks se bachav)
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: Request) {
  try {
    // ✅ Rate limit check – pehle IP dekho
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again after 15 minutes.' },
        { status: 429 }
      );
    }

    // ✅ Agar env variables set nahi – login kabhi success na ho
    if (!ADMIN_PASSWORD || !AUTH_TOKEN) {
      console.error('ADMIN_BASIC_PASSWORD ya ADMIN_AUTH_TOKEN env me set nahi hai!');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (
      !password ||
      typeof password !== 'string' ||
      !safeCompare(password, ADMIN_PASSWORD)
    ) {
      return NextResponse.json(
        { success: false, error: 'Wrong password!' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'admin_auth',
      value: AUTH_TOKEN,        // ✅ 'true' ki jagah secret token
      path: '/',
      sameSite: 'lax',
      httpOnly: true,           // ✅ JavaScript se cookie set/padhi NAHI ho sakti
      maxAge: 60 * 60 * 24,     // 24 hours
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}