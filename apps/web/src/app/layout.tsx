import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google';
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
})


export const metadata: Metadata = {
    title: {
        default: 'Trusanity — Real-Time Web & Mobile Analytics',
        template: '%s | Trusanity',
    },
    description:
        'Trusanity is a privacy-first, no-code behavioral analytics platform for websites, mobile apps, and games. Real-time dashboards, autocapture, and 9-platform SDK support.',
    keywords: ['analytics', 'web analytics', 'mobile analytics', 'privacy', 'no-code', 'SaaS'],
    authors: [{ name: 'Trusanity' }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: 'Trusanity',
        title: 'Trusanity — Real-Time Web & Mobile Analytics',
        description: 'Privacy-first behavioral analytics for web, mobile, and games.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trusanity',
        description: 'Privacy-first behavioral analytics for web, mobile, and games.',
    },
    robots: { index: true, follow: true },
}

export const viewport = {
    themeColor: '#0a0a1a',
}

import { Providers } from '@/components/providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased text-text-primary bg-bg-base selection:bg-brand-500/30 selection:text-white`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
