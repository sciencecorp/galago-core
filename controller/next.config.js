/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  transpilePackages: ["@emotion/react"],
  compiler: {
    emotion: true,
  },
};

module.exports = nextConfig;
