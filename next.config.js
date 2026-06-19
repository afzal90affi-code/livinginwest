/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io', // 👈 Sanity ki images ke liye (ZAROORI HAI)
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // 👈 Placeholder images ke liye
      }
    ],
  },
};

module.exports = nextConfig;