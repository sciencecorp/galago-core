const withTM = require("next-transpile-modules")(["@emotion/react"]);

/**
 * Check if we're building for Electron
 * Set ELECTRON_BUILD=true when building for Electron
 */
const isElectronBuild = process.env.ELECTRON_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Always use standalone for both Electron and Docker (server mode)
  output: "standalone",
  compiler: {
    emotion: true,
  },
  // Disable image optimization for Electron
  ...(isElectronBuild && {
    images: {
      unoptimized: true,
    },
  }),
};

module.exports = withTM(nextConfig);
