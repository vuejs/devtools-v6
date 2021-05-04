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
  devServer: {
    port: 8091,
    onBeforeSetupMiddleware (app) {
      app.use('/__open-in-editor', openInEditor())
    }
  }
})
