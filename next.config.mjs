/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Fix WalletConnect duplicate initialization
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Suppress WalletConnect warnings in development
    if (dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@walletconnect/logger': false,
      }
    }
    
    return config
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.com *.walletconnect.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: fonts.gstatic.com *.amazonaws.com",
              "connect-src 'self' wss: https: *.supabase.co *.walletconnect.com *.base.org",
              "frame-src 'self' https: data: blob:"
            ].join('; ')
          }
        ]
      }
    ]
  },
}

export default nextConfig
