import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const isApiAuthRoute = pathname.startsWith('/api/auth');
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/onboarding';
    const isAdminRoute = pathname.startsWith('/admin');

    if (isApiAuthRoute) {
        return null;
    }

    // Redirect unauthenticated users to Storefront login
    if (!isLoggedIn && !isPublicRoute) {
        const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://trusanity.com';
        return Response.redirect(new URL('/login', storefrontUrl));
    }

    // NOTE: We intentionally do NOT redirect logged-in users away from /login or /register.
    // This prevents redirect loops when the user has no tenant yet.

    // Strict RBAC for admin routes
    if (isAdminRoute && isLoggedIn) {
        const role = req.auth?.user?.role as string | undefined;
        if (role !== 'SUPER_ADMIN' && role !== 'admin') {
            return Response.redirect(new URL('/dashboard', req.nextUrl));
        }
    }


    return null;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'],
};

