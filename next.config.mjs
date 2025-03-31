/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "img.clerk.com", // Add your Cloudinary domain
      // Add other domains if needed
    ],
    // Optional: Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Configure formats
    formats: ["image/webp"],
    // Optional: Configure minimum cache TTL
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
