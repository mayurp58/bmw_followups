import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod');

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Define public paths
    const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];

    // Check if the path is public
    if (publicPaths.some(path => pathname.startsWith(path)) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')) { // Allow files like favicon.ico, logo.png
        return NextResponse.next();
    }

    const token = request.cookies.get('session_token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.next();
    } catch (error) {
        // Token invalid or expired
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
