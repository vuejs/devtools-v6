const path = require('path')
const { createConfig } = require('@vue-devtools/build-tools')
const openInEditor = require('launch-editor-middleware')

module.exports = createConfig({
  entry: {
    devtools: './src/devtools.js'
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/build/',
    filename: '[name].js'
  },
  devtool: '#cheap-module-source-map',
  devServer: {
    port: 8091,
    quiet: true,
    before (app) {
      app.use('/__open-in-editor', openInEditor())
    }
  }
})
