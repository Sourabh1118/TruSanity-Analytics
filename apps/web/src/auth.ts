import NextAuth, { type DefaultSession } from "next-auth"

// Extend NextAuth types to include our custom role
declare module "next-auth" {
    interface Session {
        user: {
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
    }
}

import authConfig from "./auth.config"

/**
 * Analytics NextAuth configuration.
 *
 * NO DrizzleAdapter here — the Analytics app reads the shared JWT cookie
 * that the Storefront creates. Adding an adapter causes NextAuth to attempt
 * DB inserts (including missing columns like "emailVerified") on every auth() call.
 *
 * All tenant/user provisioning in the Analytics DB is handled explicitly by
 * provisioning.ts, not by NextAuth internals.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [],
})
