const createConfig = require('../createConfig')

const target = {
  chrome: 52,
  firefox: 48,
  safari: 9,
  ie: 11
}

module.exports = createConfig({
  entry: {
    devtools: './src/devtools.js',
    backend: './src/backend.js',
    hook: './src/hook.js'
  },
  output: {
    path: __dirname + '/build',
    publicPath: '/build/',
    filename: '[name].js'
  },
  devtool: '#cheap-module-source-map'
}, target)
