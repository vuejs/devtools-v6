const path = require('path')
const { createConfig } = require('@vue-devtools/build-tools')

module.exports = createConfig({
  entry: {
    polyfills: './src/polyfills.js',
    hook: './src/hook.js',
    devtools: './src/devtools.js',
    background: './src/background.js',
    'devtools-background': './src/devtools-background.js',
    backend: './src/backend.js',
    proxy: './src/proxy.js',
    detector: './src/detector.js',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false,
})
