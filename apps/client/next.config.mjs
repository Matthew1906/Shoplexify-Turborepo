/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'ui-avatars.com',
            port: '',
            pathname: '/api/**',
          },
          {
            protocol: 'https',
            hostname: 'ik.imagekit.io',
            port: '',
            pathname: '/matthew1906/shoplexify/**',
          },
        ],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '25mb',
      },
    },
    env: {
      SERVER_URL: process.env.SERVER_URL,
      PAGE_LENGTH: process.env.PAGE_LENGTH,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      GOOGLE_MAPS_MAP_ID: process.env.GOOGLE_MAPS_MAP_ID
    }
};

export default nextConfig;
