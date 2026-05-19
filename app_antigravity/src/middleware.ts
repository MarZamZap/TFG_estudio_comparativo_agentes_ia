import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

// Define which routes are protected or public
const publicRoutes = ['/login']
const staticRoutes = ['/_next', '/favicon.ico']

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isPublicRoute = publicRoutes.includes(path)

    // Ignore static assets
    if (staticRoutes.some(route => path.startsWith(route)) || path.match(/\.(.*)$/)) {
        return NextResponse.next()
    }

    // Get and verify session cookie
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get('session')?.value
    const session = await decrypt(sessionValue)

    // Block unauthorized access to protected routes
    if (!isPublicRoute && !session?.usuarioId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    // Redirect to dashboard if logged in and trying to access /login
    if (isPublicRoute && session?.usuarioId) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    return NextResponse.next()
}

// Ensure middleware runs only on intended paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
