import { NextResponse } from 'next/server'

export function middleware(req) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  // Agar user /admin route par ja raha hai
  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      // Base64 string ko decode karna
      const [user, pwd] = atob(authValue).split(':')

      // Apna Username aur Password yahan set karein
      const ADMIN_USER = 'usman'
      const ADMIN_PASSWORD = 'usman'

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

// Is middleware ko sirf /admin par apply karein
export const config = {
  matcher: '/admin/:path*',
}