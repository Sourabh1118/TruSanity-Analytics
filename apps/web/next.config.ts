import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    typescript: { ignoreBuildErrors: true },
    reactStrictMode: true,
    transpilePackages: ['@netra/ui', '@netra/db'],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    experimental: {
        serverActions: { allowedOrigins: ['localhost:3000'] },
    },
}

export default nextConfig
