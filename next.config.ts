/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // ✅ Added: live backend server for review images
      {
        protocol: "https",
        hostname: "3.6.36.33",
        pathname: "/uploads/**",
      },
      // ✅ Added: Inventino S3 bucket for product images
      {
        protocol: "https",
        hostname: "inventino-products.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;