/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    appMode: process.env.APP_MODE,
    dbApiUrl: process.env.API_URL,
  }
}

module.exports = nextConfig
