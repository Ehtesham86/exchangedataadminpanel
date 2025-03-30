import { NextResponse } from 'next/server';

export function middleware(req) {
    const token = req.cookies.get('access_token') || req.headers.get('Authorization');

    // If user is not logged in and tries to access a protected route, redirect to login
    if (!token && req.nextUrl.pathname !== '/LoginPage') {
        return NextResponse.redirect(new URL('/LoginPage', req.url));
    }

    return NextResponse.next();
}

// Apply middleware to all pages except `/LoginPage`
export const config = {
    matcher: ['/((?!LoginPage).*)'], // Matches all pages except LoginPage
};
