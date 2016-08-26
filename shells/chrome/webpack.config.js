var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    hook: './src/hook.js',
    devtools: './src/devtools.js',
    background: './src/background.js',
    'devtools-background': './src/devtools-background.js',
    backend: './src/backend.js',
    proxy: './src/proxy.js'
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../../src')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader:  'buble',
        exclude: /node_modules|vue\/dist|vuex\/dist/,
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.(png|woff2)$/,
        loader: 'url?limit=0'
      }
    ]
  },
  vue: {
    loaders: {
      js: 'buble'
    }
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? '#inline-source-map'
    : false
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
