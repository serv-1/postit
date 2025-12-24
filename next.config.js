/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['mongodb', 'mongoose'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [
      { hostname: 'maps.locationiq.com' },
      { hostname: 'postit-images-bucket.s3.eu-west-3.amazonaws.com' },
      { hostname: 'postit-images-bucket-dev.s3.eu-west-3.amazonaws.com' },
    ],
  },
}
