import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
    const isPublicRoute = req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isApiAuthRoute) {
        return null;
    }

    if (!isLoggedIn && !isPublicRoute) {
        const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3002';
        return Response.redirect(new URL('/login', storefrontUrl));
    }

    if (isLoggedIn && isPublicRoute) {
        return Response.redirect(new URL('/dashboard', req.nextUrl));
    }

    // Strict RBAC: Intercept any /admin request and block it if the user is not a SUPER_ADMIN
    if (isAdminRoute) {
        if (!isLoggedIn) {
            const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3002';
            return Response.redirect(new URL('/login', storefrontUrl));
        }

        // Assert the custom role we added in auth.ts and the DB schema
        if (req.auth?.user?.role !== 'SUPER_ADMIN') {
            return Response.redirect(new URL('/dashboard', req.nextUrl));
        }
    }

    return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'],
};
