/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      /* 1. KEEP YOUR EXISTING UNSPLASH CONFIG */
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      /* 2. ADD NEW BACKEND IMAGE SUPPORT */
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**', 
      },
    ],
  },

  /* 3. ADD PROXY FOR API REQUESTS (Fixes CORS) */
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:8080/api/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;