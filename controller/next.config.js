/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  compiler: {
    emotion: true,
  },
  transpilePackages: ["@emotion/react"],
};

module.exports = nextConfig;
