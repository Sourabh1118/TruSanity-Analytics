import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Netra Analytics — Real-Time Web & Mobile Analytics',
        template: '%s | Netra Analytics',
    },
    description:
        'Netra Analytics is a privacy-first, no-code behavioral analytics platform for websites, mobile apps, and games. Real-time dashboards, autocapture, and 9-platform SDK support.',
    keywords: ['analytics', 'web analytics', 'mobile analytics', 'privacy', 'no-code', 'SaaS'],
    authors: [{ name: 'Netra Analytics' }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: 'Netra Analytics',
        title: 'Netra Analytics — Real-Time Web & Mobile Analytics',
        description: 'Privacy-first behavioral analytics for web, mobile, and games.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Netra Analytics',
        description: 'Privacy-first behavioral analytics for web, mobile, and games.',
    },
    robots: { index: true, follow: true },
    themeColor: '#0a0a1a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    )
}
