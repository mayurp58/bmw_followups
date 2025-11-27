/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',  // prevent caching of static build files
          },
        ],
      },
    ]
  },
};

export default nextConfig;
