/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.31.23', 'localhost:3000', '172.20.10.4', '192.168.1.44'],

  serverExternalPackages: ['@prisma/client', '@prisma/engines'],

  images: {
    localPatterns: [
      {
        pathname: '/images/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;