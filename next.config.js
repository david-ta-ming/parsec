/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // This will make server-side environment variables explicitly available
  serverRuntimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // This makes environment variables available to both server and client
  publicRuntimeConfig: {
    // Add any PUBLIC env vars here - DO NOT put the OpenAI key here
  },
};

module.exports = nextConfig;