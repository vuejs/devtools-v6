var path = require('path')

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
  devtool: '#source-map'
}
