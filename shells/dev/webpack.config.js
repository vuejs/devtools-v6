var path = require('path')

var bubleOptions = {
  target: { chrome: 52 },
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
    filename: '[name].js',
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.js',
      src: path.resolve(__dirname, '../../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader:  'buble',
        exclude: /node_modules|vue\/dist|vuex\/dist/,
        options: bubleOptions
      },
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          buble: bubleOptions
        }
      },
      {
        test: /\.(png|woff2)$/,
        loader: 'url?limit=0'
      }
    ]
  },
  devtool: '#source-map'
}
