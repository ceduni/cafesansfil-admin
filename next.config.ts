import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.cafesansfil.ca/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
