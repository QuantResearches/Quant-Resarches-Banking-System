import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
