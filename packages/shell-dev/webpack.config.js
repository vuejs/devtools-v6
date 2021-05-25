const path = require('path')
const { createConfig } = require('@vue-devtools/build-tools')
const openInEditor = require('launch-editor-middleware')

module.exports = createConfig({
  entry: {
    devtools: './src/devtools.js',
    backend: './src/backend.js',
    hook: './src/hook.js',
    target: './target/index.js'
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/build/',
    filename: '[name].js'
  },
  devtool: '#cheap-module-source-map',
  devServer: {
    quiet: true,
    before (app) {
      app.use('/__open-in-editor', openInEditor())
    }
  }
})
