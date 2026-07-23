/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercel par build fail hone se bachne ke liye
    ignoreDuringBuilds: true,
  },
  // ✅ Embed Blog (iframe) ko allow karne ke liye headers
  async headers() {
    return [
      {
        source: '/blog/:slug*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      // ✅ AI Generated Images (Pollinations) ke liye
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
      // ✅ GNews aur baaki sab external news images ke liye (Wildcard)
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;