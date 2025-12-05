const withTM = require("next-transpile-modules")(["@emotion/react"]);

/**
 * Check if we're building for Electron (static export)
 * Set ELECTRON_BUILD=true when building for Electron
 */
const isElectronBuild = process.env.ELECTRON_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Use 'export' for Electron (static files), 'standalone' for Docker
  output: isElectronBuild ? "export" : "standalone",
  compiler: {
    emotion: true,
  },
  // Disable image optimization for static export
  ...(isElectronBuild && {
    images: {
      unoptimized: true,
    },
    // Disable features that don't work with static export
    trailingSlash: true,
  }),
};

module.exports = withTM(nextConfig);
