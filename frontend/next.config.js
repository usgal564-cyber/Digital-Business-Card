/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Build хийх үеийн TypeScript алдааг алгасаж deploy хийнэ
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint алдааг мөн алгасна
    ignoreDuringBuilds: true,
  },
};
