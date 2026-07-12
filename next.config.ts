/** @type {import('next').NextConfig} */
const BACKEND_API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // existing
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "inventino.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bracelet-ecommerce-backend-production.up.railway.app",
        pathname: "/uploads/**",
      },
      // ✅ Added: live backend server for review images
      {
        protocol: "https",
        hostname: "3.6.36.33",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "bracelet-ecommerce-backend-production.up.railway.app",
        pathname: "/uploads/**",
      },
       {
        protocol: "https",
        hostname: "bracelet-ecommerce-backend.onrender.com",
        pathname: "/uploads/**",
      },
      // ✅ Added: Inventino S3 bucket for product images
       {
        protocol: "https",
        hostname: "inventino.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "inventino-products.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "yourcdn.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: `${BACKEND_API_BASE}/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
