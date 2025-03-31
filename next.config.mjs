/** @type {import('next').NextConfig} */
export const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: ["192.168.0.37d"],
    images: { unoptimized: true },
    experimental: {
        webpackBuildWorker: true,
        parallelServerBuildTraces: true,
        parallelServerCompiles: true,
        authInterrupts: true
    }
};

export default nextConfig;
