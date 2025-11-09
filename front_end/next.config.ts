import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // ...other config options...
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
