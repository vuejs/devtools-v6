const path = require('node:path')

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss')(path.resolve(__dirname, './tailwind.config.cjs')),
    require('postcss-nested'),
  ],
}
