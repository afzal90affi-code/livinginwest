import { NextResponse } from 'next/server'

export function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = Buffer.from(authValue, 'base64').toString('utf8').split(':')

      const ADMIN_USER = 'usman'
      const ADMIN_PASSWORD = 'usman'

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

// Is matcher ki wajah se home page par popup KABHI nahi aayega
export const config = {
  matcher: ['/admin/:path*'],
}