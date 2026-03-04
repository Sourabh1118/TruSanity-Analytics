import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

/**
 * SSO Handoff Endpoint
 *
 * Called by the Storefront's "Open Analytics" button.
 * Since both apps share the same AUTH_SECRET and cookie domain (.trusanity.com),
 * the Storefront JWT cookie is automatically validated here.
 *
 * If the user has a valid session → redirect to Analytics /dashboard
 * Otherwise → redirect to Storefront /login
 */
export async function GET(req: NextRequest) {
    const session = await auth()

    // Use the forwarded host (set by Nginx) to get the real public URL
    // Fall back to the NEXT_PUBLIC_ANALYTICS_APP_URL env var, then a sensible default
    const forwardedHost = req.headers.get('x-forwarded-host')
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const appUrl = forwardedHost
        ? `${protocol}://${forwardedHost}`
        : (process.env.NEXT_PUBLIC_ANALYTICS_APP_URL || 'https://app.trusanity.com')

    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://trusanity.com'

    if (!session?.user) {
        return NextResponse.redirect(new URL('/login', storefrontUrl))
    }

    return NextResponse.redirect(new URL('/dashboard', appUrl))
}
