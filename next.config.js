/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  images: {
    domains: [
      'maps.locationiq.com',
      'postit-images-bucket.s3.eu-west-3.amazonaws.com',
      'postit-images-bucket-dev.s3.eu-west-3.amazonaws.com',
    ],
  },
  optimizeFonts: false,
}
