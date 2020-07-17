/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss')(path.resolve(__dirname, './tailwind.config.js')),
    require('postcss-nested')
  ]
}
