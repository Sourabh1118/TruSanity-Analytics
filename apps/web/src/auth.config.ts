import type { NextAuthConfig } from 'next-auth';

// This is the Edge-compatible configuration used exclusively for Next.js Middleware.
// The primary authentication file (auth.ts) imports this and merges it with Node-dependent 
// adapters (like Drizzle/Postgres) that cannot run seamlessly on Vercel Edge Runtime.
const authConfig: NextAuthConfig = {
    trustHost: true,
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = (token.sub || token.id) as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
};

export default authConfig;
