import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/**
 * SSO Handoff Endpoint
 *
 * Called by the Storefront's "Open Analytics" button.
 * Since both apps share the same AUTH_SECRET, the Storefront
 * JWT cookie is automatically validated by this NextAuth instance.
 *
 * If the user has a valid session → redirect to /dashboard
 * Otherwise → redirect to /login
 */
export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    }

    return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
}
