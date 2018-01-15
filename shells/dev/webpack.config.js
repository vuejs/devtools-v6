var alias = require('../alias')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var openInEditor = require('launch-editor-middleware')

var bubleOptions = {
  target: { chrome: 52, firefox: 48 },
  objectAssign: 'Object.assign'
}

module.exports = {
  entry: {
    devtools: './src/devtools.js',
    backend: './src/backend.js',
    hook: './src/hook.js',
    target: './target/index.js'
  },
  output: {
    path: __dirname + '/build',
    publicPath: '/build/',
    filename: '[name].js'
  },
  resolve: {
    alias
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: /node_modules|vue\/dist|vuex\/dist/,
        options: bubleOptions
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          buble: bubleOptions
        }
      },
      {
        test: /\.(png|woff2)$/,
        loader: 'url-loader?limit=0'
      }
    ]
  },
  performance: {
    hints: false
  },
  devtool: '#cheap-module-source-map',
  devServer: {
    quiet: true,
    before (app) {
      app.use('/__open-in-editor', openInEditor())
    }
  },
  plugins: process.env.VUE_DEVTOOL_TEST ? [] : [new FriendlyErrorsPlugin()]
}
