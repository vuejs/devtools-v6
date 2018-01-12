const path = require('path')
const webpack = require('webpack')
const alias = require('../alias')

const bubleOptions = {
  target: { chrome: 52, firefox: 48 },
  objectAssign: 'Object.assign'
}

module.exports = {
  entry: {
    hook: './src/hook.js',
    devtools: './src/devtools.js',
    background: './src/background.js',
    'devtools-background': './src/devtools-background.js',
    backend: './src/backend.js',
    proxy: './src/proxy.js',
    detector: './src/detector.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
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
  devtool: process.env.NODE_ENV !== 'production'
    ? '#inline-source-map'
    : false
}

if (process.env.NODE_ENV === 'production') {
  const UglifyPlugin = require('uglifyjs-webpack-plugin')
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyPlugin()
  ]
}
