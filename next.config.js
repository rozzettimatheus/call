/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: [
    // page suffix
    'page.tsx',
    'api.ts',
    'api.tsx',
  ],
}

module.exports = nextConfig
