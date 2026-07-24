import { NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_BASIC_USER || 'usman'
const ADMIN_PASSWORD = process.env.ADMIN_BASIC_PASSWORD || 'usman'

export function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const adminCookie = req.cookies.get('admin_auth')?.value === 'true'
    const basicAuth = req.headers.get('authorization')

    if (adminCookie) {
      return NextResponse.next()
    }

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = Buffer.from(authValue, 'base64').toString('utf8').split(':')

      if (user === ADMIN_USER && pwd === ADMIN_PASSWORD) {
        return NextResponse.next()
      }
    }

    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}