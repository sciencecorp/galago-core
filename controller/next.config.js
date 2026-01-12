const packageJson = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  compiler: {
    emotion: true,
  },
  transpilePackages: ["@emotion/react"],
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

module.exports = nextConfig;
