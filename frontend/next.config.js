/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Build хийх үеийн TypeScript алдааг алгасна
    ignoreBuildErrors: true,
  },
  // Turbopack ашиглаж байгаа тул хоосон turbopack тохиргоо нэмж webpack-ийн алдааг хаана
  turbopack: {},
  // CSP Header тохиргоо
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' http: https:;",
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;