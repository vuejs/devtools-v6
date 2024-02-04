const path = require('node:path')
const { createConfig } = require('@vue-devtools/build-tools')

module.exports = createConfig({
  entry: {
    'hook': './src/hook.js',
    'hook-exec': './src/hook-exec.js',
    'devtools': './src/devtools.js',
    'service-worker': './src/service-worker.js',
    'devtools-background': './src/devtools-background.js',
    'backend': './src/backend.js',
    'proxy': './src/proxy.js',
    'detector': './src/detector.js',
    'detector-exec': './src/detector-exec.js',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false,
})
