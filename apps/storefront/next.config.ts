import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async rewrites() {
    // API_URL already includes the /api suffix (see lib/env.ts) — do not append it again.
    const apiBase = process.env.API_URL || 'http://localhost:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
