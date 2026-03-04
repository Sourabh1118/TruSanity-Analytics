import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

/**
 * SSO Handoff Endpoint
 *
 * Called by the Storefront's "Open Analytics" button.
 * Since both apps share the same AUTH_SECRET, the Storefront
 * JWT cookie is automatically validated by this NextAuth instance.
 *
 * If the user has a valid session → redirect to /dashboard
 * Otherwise → redirect to Storefront /login
 */
export async function GET(req: NextRequest) {
    const session = await auth()

    // Use the request origin as the base URL (works behind any proxy/domain)
    const appUrl = req.nextUrl.origin

    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://trusanity.com'

    if (!session?.user) {
        return NextResponse.redirect(new URL('/login', storefrontUrl))
    }

    return NextResponse.redirect(new URL('/dashboard', appUrl))
}
