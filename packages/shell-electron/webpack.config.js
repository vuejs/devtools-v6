const path = require('node:path')
const { createConfig } = require('@vue-devtools/build-tools')

const target = {
  chrome: 52,
  firefox: 48,
  safari: 9,
  ie: 11,
}

module.exports = createConfig({
  entry: {
    devtools: './src/devtools.js',
    backend: './src/backend.js',
    hook: './src/hook.js',
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/build/',
    filename: '[name].js',
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false,
}, target)
