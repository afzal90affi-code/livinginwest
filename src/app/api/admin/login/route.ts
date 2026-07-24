import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_BASIC_PASSWORD || 'usman';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Wrong password!' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'admin_auth',
      value: 'true',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
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
