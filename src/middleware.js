import { NextResponse } from 'next/server'

export function middleware(req) {
  // Sirf aur sirf /admin route par ye check hoga
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      // Base64 string ko decode karna
      const [user, pwd] = Buffer.from(authValue, 'base64').toString('utf8').split(':')

      // Apna Username aur Password yahan set karein
      const ADMIN_USER = 'usman'
      const ADMIN_PASSWORD = 'usman' // Yahan apna password rakhein

      if (user === ADMIN_USER && pwd === ADMIN_PASSWORD) {
        return NextResponse.next()
      }
    }

    // Agar password galat hai ya nahi hai, toh ye popup bhejega
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
  // Ye ensure karega ki middleware sirf /admin par chale, home page par nahi
  matcher: ['/admin/:path*'],
}