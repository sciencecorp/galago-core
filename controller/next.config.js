const withTM = require("next-transpile-modules")(["@emotion/react"]);
const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  compiler: {
    emotion: true,
  },
};

module.exports = withTM(nextConfig);
