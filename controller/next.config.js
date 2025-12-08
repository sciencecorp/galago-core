/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  transpilePackages: ["@emotion/react"],
  compiler: {
    emotion: true,
  },

  // Critical for Next.js 15 performance
  experimental: {
    optimizePackageImports: ["@emotion/react", "@emotion/styled"],
    // Turbo mode for faster compilation
    turbo: {
      rules: {
        "*.ts": {
          loaders: ["ts-loader"],
        },
      },
    },
  },

  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Externalize Node modules that don't need bundling
      config.externals = config.externals || [];
      config.externals.push("vm", "@grpc/grpc-js");

      // Ignore dynamic require warnings
      config.ignoreWarnings = [
        {
          module: /javascript-executor\.ts/,
          message: /Critical dependency/,
        },
      ];
    }

    // Development optimizations
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Reduce memory usage during compilation
      config.cache = {
        type: "filesystem",
        compression: "gzip",
      };
    }

    return config;
  },

  // Prevent memory issues
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
