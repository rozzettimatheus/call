/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: [
    // consider as pages only - user.page.tsx
    'page.tsx',
    'api.ts',
    'api.tsx',
  ],
}

module.exports = nextConfig
