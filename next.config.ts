import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cafesansfil-api-r0kj.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
