import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Login page ko protection se bahar rakho
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_auth')?.value
    const validToken = process.env.ADMIN_AUTH_TOKEN

    if (validToken && token === validToken) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}