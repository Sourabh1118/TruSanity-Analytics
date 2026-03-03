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

import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./lib/db"
import { users } from "@netra/db"
import { eq } from "drizzle-orm"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1)

                if (!user) {
                    return null
                }

                // Temporary insecure check for MVP/Testing - assumes password equals hash
                // In production, we should hash it with bcrypt and compare
                if (user.passwordHash !== credentials.password) {
                    return null
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
        }),
    ],
})
