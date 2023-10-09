/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    )

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        resourceQuery: { not: /url/ },
        use: ['@svgr/webpack'],
      }
    )

    fileLoaderRule.exclude = /\.svg$/i

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
