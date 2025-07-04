import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://www.youtube.com https://player.vimeo.com",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://cdnjs.cloudflare.com",
              "connect-src 'self' data: blob: https://api.elevenlabs.io https://*.amazonaws.com wss: https:",
              "media-src 'self' data: blob: https: http:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'"
            ].join("; ")
          }
        ],
      },
      // 🛡️ LOGO PROTECTION & SECURITY HEADERS
      {
        source: '/assets/logo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'X-Copyright',
            value: 'TheChessWire.news - All Rights Reserved',
          },
        ],
      },
      // 🔒 FAVICON PROTECTION
      {
        source: '/assets/favicon/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // 🎨 GENERAL ASSETS PROTECTION
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Copyright',
            value: 'TheChessWire.news - Protected Content',
          },
        ],
      },
      // 🎥 VIDEO CONTENT HEADERS (SoulCinema)
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      // 🔊 AUDIO CONTENT HEADERS (Bambai AI Voice)
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      // 🔐 API SECURITY HEADERS
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },

  // 🚀 PERFORMANCE & SECURITY OPTIMIZATIONS
  compress: true,
  poweredByHeader: false,
  
  // 📱 PROGRESSIVE WEB APP SUPPORT
  reactStrictMode: true,

  // 🔐 IMAGE OPTIMIZATION SECURITY
  images: {
    domains: ['thechesswire.news', 'img.youtube.com', 'i.imgur.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // 🛡️ EXPERIMENTAL SECURITY FEATURES
  experimental: {
    // Enable security features as they become available
    serverActions: {
      allowedOrigins: ['https://thechesswire.news'],
    },
  },

  // 🔄 REDIRECTS FOR SECURITY
  async redirects() {
    return [
      {
        source: '/.env',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/.git/:path*',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/404',
        permanent: false,
      },
    ];
  },

  // 🚫 REWRITES FOR API PROTECTION
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/admin/:path*',
          destination: '/api/auth/verify-admin',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // 📊 WEBPACK CONFIGURATION
  webpack: (config, { isServer }) => {
    // Add WASM support for Stockfish
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Security: Disable source maps in production
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }

    return config;
  },

  // 🔧 ENVIRONMENT VARIABLES VALIDATION
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://thechesswire.news',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.thechesswire.news',
  },

  // 📁 OUTPUT CONFIGURATION
  output: 'standalone',
  distDir: '.next',
  cleanDistDir: true,
  
  // ⚡ PERFORMANCE OPTIMIZATIONS
  productionBrowserSourceMaps: false,
  
  // 🔒 ADDITIONAL SECURITY CONFIGURATIONS
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  
  publicRuntimeConfig: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV,
  },
};

export default nextConfig;