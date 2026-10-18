/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double WebSocket initializations in dev mode
  output: 'standalone',
  serverExternalPackages: ['@whiskeysockets/baileys', 'pino', 'pg'],
};

export default nextConfig;
