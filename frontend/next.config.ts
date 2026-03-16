// Path: lodgeme-project/frontend/next.config.js
/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com', // Example for Cloudinary
      'via.placeholder.com', // Example for placeholder images
      'images.unsplash.com', // Example for Unsplash
      // Add any other external image domains here if you plan to use them
    ],
  },
};

module.exports = nextConfig;