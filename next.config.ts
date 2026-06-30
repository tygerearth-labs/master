import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.neon.tech wss://*.neon.tech; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:;",
        },
      ],
    },
  ],
}

export default nextConfig
