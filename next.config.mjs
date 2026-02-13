/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    /* Force rebuild: 2026-02-12T22:20:00 */
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    // Performance Optimizations
    compress: true,
    swcMinify: true,
    view: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production" ? { exclude: ['error'] } : false,
    },

    export default nextConfig;
