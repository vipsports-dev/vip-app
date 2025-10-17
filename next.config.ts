// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['picsum.photos'], // ✅ whitelist external image host
  },
}

export default nextConfig