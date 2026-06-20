/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ye Vercel build ko ESLint errors par fail nahi hone dega
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;