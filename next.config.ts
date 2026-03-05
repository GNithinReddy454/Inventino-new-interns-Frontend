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
    ],
  },
  // ✅ No rewrites needed — direct calls to NEXT_PUBLIC_API_BASE_URL work fine
};

export default nextConfig;